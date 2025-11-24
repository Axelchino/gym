/**
 * Muscle Effort Service
 *
 * Handles the muscle_effort_log table for the Training Focus radar chart.
 * - Extracts muscle/effort data when workouts are saved
 * - Queries aggregated data for the radar chart
 * - Self-cleans data older than 90 days
 */

import { supabase } from './supabase';
import { getMuscles, initMuscleCache } from '../utils/muscleCache';
import type { Set, WorkoutLog } from '../types/workout';

// ============================================
// TYPES
// ============================================

interface MuscleEffortEntry {
  user_id: string;
  workout_date: string;
  muscle_group: string;
  effort_score: number;
  muscle_weight: number;
}

export interface MuscleRadarData {
  [muscle: string]: number; // Percentage 0-100
}

// ============================================
// EFFORT CALCULATION
// ============================================

/**
 * Calculate effort score from set data
 *
 * Uses RIR (Reps in Reserve) and UF (Until Failure) tags to determine effort.
 * Returns 0-1 where 1 is maximum effort.
 *
 * RIR → Effort mapping:
 * - RIR ≥5: 0.0 (warmup, ignore)
 * - RIR 4: 0.25 (very light)
 * - RIR 3: 0.5 (moderate)
 * - RIR 2: 0.75 (hard)
 * - RIR 1: 0.9 (near failure)
 * - RIR 0: 1.0 (failure)
 * - UF tag: 1.0 (until failure)
 * - No RIR: 0.7 (assumed moderate-hard)
 */
export function getEffort(set: Set): number {
  // Warmup sets ignored entirely
  if (set.isWarmup) return 0;

  // UF (Until Failure) = maximum effort
  if (set.isFailure) return 1.0;

  // RIR logged = use precise effort
  if (set.rir !== undefined && set.rir !== null) {
    if (set.rir >= 5) return 0; // Too easy, treat as warmup
    if (set.rir === 4) return 0.25;
    if (set.rir === 3) return 0.5;
    if (set.rir === 2) return 0.75;
    if (set.rir === 1) return 0.9;
    return 1.0; // RIR 0 = failure
  }

  // Normal set, no RIR = assume moderate-hard effort
  return 0.7;
}

// ============================================
// SAVE MUSCLE EFFORT DATA
// ============================================

/**
 * Extract and save muscle effort data when a workout is saved
 *
 * Called from useActiveWorkout.ts after workout is saved.
 * Creates entries in muscle_effort_log for the radar chart.
 */
export async function appendMuscleEffortData(
  workout: WorkoutLog,
  userId: string
): Promise<void> {
  // Ensure muscle cache is ready
  await initMuscleCache();

  const entries: MuscleEffortEntry[] = [];
  const workoutDate = new Date(workout.date).toISOString().split('T')[0];

  for (const exercise of workout.exercises) {
    // Handle both camelCase and snake_case (Supabase JSON stores as-is)
    const exerciseId = exercise.exerciseId || (exercise as unknown as { exercise_id?: string }).exercise_id;
    const exerciseName = exercise.exerciseName || (exercise as unknown as { exercise_name?: string }).exercise_name || 'Unknown';

    if (!exerciseId) {
      console.warn(`No exerciseId for exercise:`, exercise);
      continue;
    }

    // Look up muscles from cache (try by ID first, then by name)
    const muscles = getMuscles(exerciseId, exerciseName);

    // Skip if no muscle data (custom exercise without mapping)
    if (!muscles || (muscles.primary.length === 0 && muscles.secondary.length === 0)) {
      console.warn(`No muscle data for exercise: ${exerciseName} (${exerciseId})`);
      continue;
    }

    // Calculate normalized weights
    // Primary = 1.0, Secondary = 0.2, then normalize to sum to 1
    const rawSum = muscles.primary.length * 1.0 + muscles.secondary.length * 0.2;

    if (rawSum === 0) continue;

    for (const set of exercise.sets) {
      // Skip incomplete sets
      if (!set.completed) continue;

      // Calculate effort score
      const effort = getEffort(set);
      if (effort === 0) continue; // Skip warmups

      // Add entry for each primary muscle
      for (const muscle of muscles.primary) {
        entries.push({
          user_id: userId,
          workout_date: workoutDate,
          muscle_group: muscle,
          effort_score: effort,
          muscle_weight: 1.0 / rawSum
        });
      }

      // Add entry for each secondary muscle
      for (const muscle of muscles.secondary) {
        entries.push({
          user_id: userId,
          workout_date: workoutDate,
          muscle_group: muscle,
          effort_score: effort,
          muscle_weight: 0.2 / rawSum
        });
      }
    }
  }

  // Batch insert all entries
  if (entries.length > 0) {
    const { error } = await supabase.from('muscle_effort_log').insert(entries);

    if (error) {
      console.error('Failed to save muscle effort data:', error);
      // Don't throw - this is non-critical, workout is already saved
    } else {
      console.log(`✅ Muscle effort data saved: ${entries.length} entries`);
    }
  }
}

// ============================================
// QUERY MUSCLE RADAR DATA
// ============================================

/**
 * Get muscle training distribution for radar chart
 *
 * Queries muscle_effort_log, applies time decay, and returns percentages.
 * Also cleans up entries older than 90 days.
 */
export async function getMuscleRadarData(
  userId: string,
  days: 30 | 60 | 90 = 30
): Promise<MuscleRadarData> {
  // 1. CLEANUP: Delete entries older than 90 days (hard limit)
  const hardCutoff = new Date();
  hardCutoff.setDate(hardCutoff.getDate() - 90);

  await supabase
    .from('muscle_effort_log')
    .delete()
    .eq('user_id', userId)
    .lt('workout_date', hardCutoff.toISOString().split('T')[0]);

  // 2. QUERY: Get entries within user-selected window
  const windowCutoff = new Date();
  windowCutoff.setDate(windowCutoff.getDate() - days);

  const { data, error } = await supabase
    .from('muscle_effort_log')
    .select('workout_date, muscle_group, effort_score, muscle_weight')
    .eq('user_id', userId)
    .gte('workout_date', windowCutoff.toISOString().split('T')[0]);

  if (error) {
    console.error('Failed to query muscle effort data:', error);
    return {};
  }

  if (!data || data.length === 0) {
    return {};
  }

  // 3. AGGREGATE: Apply time decay and sum by muscle
  const muscleScores: { [muscle: string]: number } = {};
  const today = new Date();
  const halfLife = 7; // Days

  for (const entry of data) {
    const entryDate = new Date(entry.workout_date);
    const daysAgo = Math.floor(
      (today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Time decay: D = 2^(-days_ago / half_life)
    const decay = Math.pow(2, -daysAgo / halfLife);

    // Score = effort × muscle_weight × decay
    const score = entry.effort_score * entry.muscle_weight * decay;

    muscleScores[entry.muscle_group] = (muscleScores[entry.muscle_group] || 0) + score;
  }

  // 4. CONVERT TO PERCENTAGES
  const total = Object.values(muscleScores).reduce((sum, v) => sum + v, 0);
  if (total === 0) return {};

  const percentages: MuscleRadarData = {};
  for (const muscle in muscleScores) {
    percentages[muscle] = (muscleScores[muscle] / total) * 100;
  }

  return percentages;
}

// ============================================
// CLEANUP FOR EDIT/DELETE
// ============================================

/**
 * Delete muscle effort data for a specific workout date
 *
 * Used when editing or deleting a workout to prevent duplicates.
 */
export async function deleteMuscleEffortForDate(
  userId: string,
  workoutDate: Date
): Promise<void> {
  const dateStr = workoutDate.toISOString().split('T')[0];

  const { error } = await supabase
    .from('muscle_effort_log')
    .delete()
    .eq('user_id', userId)
    .eq('workout_date', dateStr);

  if (error) {
    console.error('Failed to delete muscle effort data:', error);
  }
}

// ============================================
// BACKFILL FOR EXISTING USERS
// ============================================

/**
 * Backfill muscle effort data from existing workout logs
 *
 * Run once for users who have workout history before this feature was added.
 */
export async function backfillMuscleEffortData(
  userId: string,
  workoutLogs: WorkoutLog[]
): Promise<void> {
  // Clear existing data first (allows re-running backfill)
  console.log('Clearing existing muscle effort data...');
  await supabase
    .from('muscle_effort_log')
    .delete()
    .eq('user_id', userId);

  console.log('Starting fresh backfill...');

  // Filter to last 90 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  const recentWorkouts = workoutLogs.filter(
    w => new Date(w.date) >= cutoff
  );

  console.log(`Backfilling muscle effort data for ${recentWorkouts.length} workouts...`);

  // Process each workout
  for (const workout of recentWorkouts) {
    await appendMuscleEffortData(workout, userId);
  }

  console.log('✅ Muscle effort backfill complete');
}
