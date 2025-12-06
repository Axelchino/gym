import type { Set, WorkoutLog } from '../types/workout';

/**
 * Calculate total volume for a set of sets
 * Volume = Weight × Reps × Multiplier (2x for dumbbells)
 */
export function calculateVolume(sets: Set[], equipment: string): number {
  const multiplier = equipment === 'Dumbbell' ? 2 : 1;
  return sets
    .filter(s => !s.isWarmup && s.completed)
    .reduce((sum, s) => sum + (s.weight * s.reps * multiplier), 0);
}

/**
 * Calculate 1RM using Brzycki formula
 * 1RM = Weight × (36 / (37 - Reps))
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 36) return weight; // Formula breaks down above 36 reps
  return weight * (36 / (37 - reps));
}

/**
 * Calculate 1RM using Epley formula (alternative)
 * 1RM = Weight × (1 + Reps / 30)
 */
export function calculate1RMEpley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Personal Record types
 */
export interface PersonalRecord {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseName: string;
  type: 'weight' | 'reps' | 'volume' | '1rm';
  value: number;
  reps?: number;
  weight?: number;
  date: Date;
  workoutLogId: string;
  previousRecord?: number;
  improvement?: number;
}

/**
 * Detect if a set is a new personal record
 */
export function detectPR(
  currentSet: Set,
  exerciseId: string,
  exerciseName: string,
  workoutLogId: string,
  history: Set[],
  userId: string
): PersonalRecord[] {
  const prs: PersonalRecord[] = [];
  const workingSets = history.filter(s => !s.isWarmup && s.completed);

  // Weight PR (same or more reps at higher weight)
  const weightPR = workingSets.every(s =>
    s.weight < currentSet.weight ||
    (s.weight === currentSet.weight && s.reps < currentSet.reps)
  );

  if (weightPR && currentSet.weight > 0 && workingSets.length > 0) {
    const previousBest = Math.max(...workingSets.map(s => s.weight));
    prs.push({
      id: `pr-weight-${exerciseId}-${Date.now()}`,
      userId,
      exerciseId,
      exerciseName,
      type: 'weight',
      value: currentSet.weight,
      reps: currentSet.reps,
      weight: currentSet.weight,
      date: new Date(),
      workoutLogId,
      previousRecord: previousBest,
      improvement: currentSet.weight - previousBest,
    });
  }

  // Rep PR (at same or higher weight)
  const sameWeightSets = workingSets.filter(s => s.weight === currentSet.weight);
  if (sameWeightSets.length > 0) {
    const repPR = sameWeightSets.every(s => s.reps < currentSet.reps);
    if (repPR && currentSet.reps > 0) {
      const previousBest = Math.max(...sameWeightSets.map(s => s.reps));
      prs.push({
        id: `pr-reps-${exerciseId}-${Date.now()}`,
        userId,
        exerciseId,
        exerciseName,
        type: 'reps',
        value: currentSet.reps,
        reps: currentSet.reps,
        weight: currentSet.weight,
        date: new Date(),
        workoutLogId,
        previousRecord: previousBest,
        improvement: currentSet.reps - previousBest,
      });
    }
  }

  // Volume PR (single set)
  const currentVolume = currentSet.weight * currentSet.reps;
  const volumePR = workingSets.every(s => (s.weight * s.reps) < currentVolume);

  if (volumePR && currentVolume > 0 && workingSets.length > 0) {
    const previousBest = Math.max(...workingSets.map(s => s.weight * s.reps));
    prs.push({
      id: `pr-volume-${exerciseId}-${Date.now()}`,
      userId,
      exerciseId,
      exerciseName,
      type: 'volume',
      value: currentVolume,
      reps: currentSet.reps,
      weight: currentSet.weight,
      date: new Date(),
      workoutLogId,
      previousRecord: previousBest,
      improvement: currentVolume - previousBest,
    });
  }

  // 1RM PR
  const current1RM = calculate1RM(currentSet.weight, currentSet.reps);
  if (workingSets.length > 0) {
    const previous1RM = Math.max(...workingSets.map(s => calculate1RM(s.weight, s.reps)));
    if (current1RM > previous1RM) {
      prs.push({
        id: `pr-1rm-${exerciseId}-${Date.now()}`,
        userId,
        exerciseId,
        exerciseName,
        type: '1rm',
        value: current1RM,
        reps: currentSet.reps,
        weight: currentSet.weight,
        date: new Date(),
        workoutLogId,
        previousRecord: previous1RM,
        improvement: current1RM - previous1RM,
      });
    }
  }

  return prs;
}

/**
 * Calculate workout statistics
 */
export interface WorkoutStats {
  totalWorkouts: number;
  totalVolume: number;
  totalSets: number;
  totalReps: number;
  averageDuration: number;
  averageVolume: number;
  mostFrequentExercises: { exerciseName: string; count: number }[];
}

export function calculateWorkoutStats(workouts: WorkoutLog[]): WorkoutStats {
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
  const totalSets = workouts.reduce((sum, w) =>
    sum + w.exercises.reduce((exSum, ex) => exSum + ex.sets.filter(s => !s.isWarmup).length, 0), 0
  );
  const totalReps = workouts.reduce((sum, w) =>
    sum + w.exercises.reduce((exSum, ex) =>
      exSum + ex.sets.filter(s => !s.isWarmup).reduce((rSum, s) => rSum + s.reps, 0), 0
    ), 0
  );
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

  // Calculate most frequent exercises
  const exerciseCounts = new Map<string, number>();
  workouts.forEach(w => {
    w.exercises.forEach(ex => {
      const count = exerciseCounts.get(ex.exerciseName) || 0;
      exerciseCounts.set(ex.exerciseName, count + 1);
    });
  });

  const mostFrequentExercises = Array.from(exerciseCounts.entries())
    .map(([exerciseName, count]) => ({ exerciseName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalWorkouts,
    totalVolume,
    totalSets,
    totalReps,
    averageDuration: totalWorkouts > 0 ? totalDuration / totalWorkouts : 0,
    averageVolume: totalWorkouts > 0 ? totalVolume / totalWorkouts : 0,
    mostFrequentExercises,
  };
}

/**
 * Calculate workout streak (consecutive days with workouts)
 * Grace period: 2 days - you can skip up to 2 days and maintain your streak
 */
export function calculateStreak(workouts: WorkoutLog[]): number {
  if (workouts.length === 0) return 0;

  const sortedDates = workouts
    .map((w: WorkoutLog) => {
      // Parse date string in local timezone to avoid UTC offset issues
      let date: Date;
      const workoutDate = w.date as string | Date;
      if (typeof workoutDate === 'string') {
        const [year, month, day] = workoutDate.split('-').map(Number);
        date = new Date(year, month - 1, day);
      } else {
        date = new Date(workoutDate);
      }
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
    .sort((a, b) => b - a);

  const uniqueDates = [...new Set(sortedDates)];

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentDate = today.getTime();

  for (const workoutDate of uniqueDates) {
    const daysDiff = Math.floor((currentDate - workoutDate) / (1000 * 60 * 60 * 24));

    // Allow up to 2 days gap (grace period)
    if (daysDiff <= 2) {
      streak++;
      currentDate = workoutDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get volume by muscle group
 */
export interface MuscleGroupVolume {
  muscleGroup: string;
  volume: number;
  sets: number;
}

export function getVolumeByMuscleGroup(
  workouts: WorkoutLog[],
  exercises: Map<string, { primaryMuscles: string[]; equipment: string }>
): MuscleGroupVolume[] {
  const muscleVolume = new Map<string, { volume: number; sets: number }>();

  workouts.forEach(workout => {
    workout.exercises.forEach(ex => {
      const exerciseData = exercises.get(ex.exerciseId);
      if (!exerciseData) return;

      const volume = calculateVolume(ex.sets, exerciseData.equipment);
      const sets = ex.sets.filter(s => !s.isWarmup && s.completed).length;

      exerciseData.primaryMuscles.forEach(muscle => {
        const current = muscleVolume.get(muscle) || { volume: 0, sets: 0 };
        muscleVolume.set(muscle, {
          volume: current.volume + volume,
          sets: current.sets + sets,
        });
      });
    });
  });

  return Array.from(muscleVolume.entries())
    .map(([muscleGroup, data]) => ({
      muscleGroup,
      volume: data.volume,
      sets: data.sets,
    }))
    .sort((a, b) => b.volume - a.volume);
}

/**
 * Get exercise progression data
 */
export interface ExerciseProgression {
  date: Date;
  bestSet: Set;
  estimated1RM: number;
  totalVolume: number;
  sets: number;
}

export function getExerciseProgression(
  exerciseId: string,
  workouts: WorkoutLog[]
): ExerciseProgression[] {
  return workouts
    .filter(w => w.exercises.some(ex => ex.exerciseId === exerciseId))
    .map(workout => {
      const exercise = workout.exercises.find(ex => ex.exerciseId === exerciseId)!;
      const workingSets = exercise.sets.filter(s => !s.isWarmup && s.completed);

      if (workingSets.length === 0) {
        return null;
      }

      const bestSet = workingSets.reduce((best, set) =>
        (set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps))
          ? set
          : best
      );

      return {
        date: workout.date,
        bestSet,
        estimated1RM: calculate1RM(bestSet.weight, bestSet.reps),
        totalVolume: exercise.totalVolume,
        sets: workingSets.length,
      };
    })
    .filter(data => data !== null) as ExerciseProgression[];
}

export function getExerciseProgressionByName(
  exerciseName: string,
  workouts: WorkoutLog[]
): ExerciseProgression[] {
  return workouts
    .filter(w => w.exercises.some(ex => ex.exerciseName === exerciseName))
    .map(workout => {
      const exercise = workout.exercises.find(ex => ex.exerciseName === exerciseName)!;
      const workingSets = exercise.sets.filter(s => !s.isWarmup && s.completed);

      if (workingSets.length === 0) {
        return null;
      }

      const bestSet = workingSets.reduce((best, set) =>
        (set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps))
          ? set
          : best
      );

      return {
        date: workout.date,
        bestSet,
        estimated1RM: calculate1RM(bestSet.weight, bestSet.reps),
        totalVolume: exercise.totalVolume,
        sets: workingSets.length,
      };
    })
    .filter(data => data !== null) as ExerciseProgression[];
}
