/**
 * Guest Data Migration Service
 *
 * Migrates guest workout data from localStorage to Supabase when user signs up
 */

import { createWorkoutLog } from './supabaseDataService';
import type { WorkoutLog } from '../types/workout';

const GUEST_WORKOUTS_KEY = 'gym-tracker-guest-workouts';

/**
 * Get all guest workouts from localStorage
 */
export function getGuestWorkouts(): WorkoutLog[] {
  try {
    const stored = localStorage.getItem(GUEST_WORKOUTS_KEY);
    if (!stored) return [];

    const workouts = JSON.parse(stored);

    // Convert date strings back to Date objects
    return workouts.map((workout: any) => ({
      ...workout,
      date: new Date(workout.date),
      startTime: new Date(workout.startTime),
      endTime: workout.endTime ? new Date(workout.endTime) : undefined,
      createdAt: new Date(workout.createdAt),
    }));
  } catch (error) {
    console.error('Error loading guest workouts:', error);
    return [];
  }
}

/**
 * Migrate all guest workouts to Supabase cloud database
 * Returns the number of workouts successfully migrated
 */
export async function migrateGuestWorkouts(): Promise<number> {
  const guestWorkouts = getGuestWorkouts();

  if (guestWorkouts.length === 0) {
    console.log('No guest workouts to migrate');
    return 0;
  }

  console.log(`Migrating ${guestWorkouts.length} guest workout(s) to cloud...`);

  let migratedCount = 0;

  for (const workout of guestWorkouts) {
    try {
      // Create workout in Supabase (will be assigned to current authenticated user)
      await createWorkoutLog({
        name: workout.name,
        date: workout.date,
        startTime: workout.startTime,
        endTime: workout.endTime,
        duration: workout.duration,
        totalVolume: workout.totalVolume,
        exercises: workout.exercises,
        notes: workout.notes,
      });

      migratedCount++;
    } catch (error) {
      console.error('Error migrating workout:', error);
      // Continue with next workout even if one fails
    }
  }

  // Clear guest workouts from localStorage after successful migration
  if (migratedCount > 0) {
    localStorage.removeItem(GUEST_WORKOUTS_KEY);
    console.log(`✅ Successfully migrated ${migratedCount} workout(s) to cloud`);
  }

  return migratedCount;
}

/**
 * Check if there are any guest workouts pending migration
 */
export function hasGuestWorkouts(): boolean {
  const workouts = getGuestWorkouts();
  return workouts.length > 0;
}

/**
 * Clear all guest workouts from localStorage
 */
export function clearGuestWorkouts(): void {
  localStorage.removeItem(GUEST_WORKOUTS_KEY);
}
