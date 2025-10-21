import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { WorkoutLog, LoggedExercise, Set } from '../types/workout';
import type { Exercise } from '../types/exercise';
import { db } from '../services/database';
import { detectPR } from '../utils/analytics';

const ACTIVE_WORKOUT_KEY = 'gym-tracker-active-workout';

interface ActiveWorkout {
  name: string;
  startTime: Date;
  exercises: LoggedExercise[];
}

// Helper function to load workout from localStorage
function loadWorkoutFromStorage(): ActiveWorkout | null {
  try {
    const stored = localStorage.getItem(ACTIVE_WORKOUT_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    // Convert startTime string back to Date object
    if (parsed.startTime) {
      parsed.startTime = new Date(parsed.startTime);
    }
    // Convert all set timestamps back to Date objects
    parsed.exercises?.forEach((exercise: LoggedExercise) => {
      exercise.sets?.forEach((set: Set) => {
        if (set.timestamp) {
          set.timestamp = new Date(set.timestamp);
        }
      });
    });

    return parsed;
  } catch (error) {
    console.error('Failed to load workout from localStorage:', error);
    localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    return null;
  }
}

export function useActiveWorkout() {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(loadWorkoutFromStorage);
  const [isWorkoutActive, setIsWorkoutActive] = useState(() => {
    const stored = loadWorkoutFromStorage();
    return stored !== null;
  });

  // Helper function to calculate volume (handles dumbbell 2x multiplier)
  const calculateVolume = useCallback((sets: Set[], equipment: string) => {
    const multiplier = equipment === 'Dumbbell' ? 2 : 1;
    return sets
      .filter(s => !s.isWarmup && s.completed)
      .reduce((sum, s) => sum + (s.weight * s.reps * multiplier), 0);
  }, []);

  // Persist active workout to localStorage whenever it changes
  useEffect(() => {
    if (activeWorkout) {
      try {
        localStorage.setItem(ACTIVE_WORKOUT_KEY, JSON.stringify(activeWorkout));
      } catch (error) {
        console.error('Failed to save workout to localStorage:', error);
      }
    } else {
      localStorage.removeItem(ACTIVE_WORKOUT_KEY);
    }
  }, [activeWorkout]);

  // Warn user before closing/reloading page if workout is active
  useEffect(() => {
    if (!isWorkoutActive) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers require returnValue to be set
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isWorkoutActive]);

  // Start a new workout
  const startWorkout = useCallback((name: string = 'Workout') => {
    const newWorkout: ActiveWorkout = {
      name,
      startTime: new Date(),
      exercises: [],
    };
    setActiveWorkout(newWorkout);
    setIsWorkoutActive(true);
  }, []);

  // Start workout with pre-built exercises and sets (for templates)
  const startWorkoutWithExercises = useCallback((name: string, exercises: LoggedExercise[]) => {
    const newWorkout: ActiveWorkout = {
      name,
      startTime: new Date(),
      exercises,
    };
    setActiveWorkout(newWorkout);
    setIsWorkoutActive(true);
  }, []);

  // Add exercise to workout
  const addExercise = useCallback((exercise: Exercise) => {
    if (!activeWorkout) return;

    const newLoggedExercise: LoggedExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      equipment: exercise.equipment,
      orderIndex: activeWorkout.exercises.length,
      sets: [],
      totalVolume: 0,
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newLoggedExercise],
    });
  }, [activeWorkout, calculateVolume]);

  // Remove exercise from workout
  const removeExercise = useCallback((exerciseId: string) => {
    if (!activeWorkout) return;

    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises
        .filter(ex => ex.exerciseId !== exerciseId)
        .map((ex, index) => ({ ...ex, orderIndex: index })),
    });
  }, [activeWorkout, calculateVolume]);

  // Add set to exercise
  const addSet = useCallback((exerciseId: string, setData?: Partial<Set>) => {
    if (!activeWorkout) return;

    setActiveWorkout(prev => {
      if (!prev) return prev;

      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.exerciseId === exerciseId) {
          const setNumber = exercise.sets.length + 1;

          // Get previous set data for smart defaults
          const previousSet = exercise.sets[exercise.sets.length - 1];

          const newSet: Set = {
            id: uuidv4(),
            workoutLogId: '', // Will be set when saving
            exerciseId,
            setNumber,
            weight: setData?.weight ?? previousSet?.weight ?? 0,
            reps: setData?.reps ?? previousSet?.reps ?? 0,
            rpe: setData?.rpe ?? previousSet?.rpe,
            rir: setData?.rir ?? previousSet?.rir,
            isWarmup: setData?.isWarmup ?? false,
            isDropSet: setData?.isDropSet ?? false,
            isFailure: setData?.isFailure ?? false,
            completed: setData?.completed ?? false,
            isUserInput: setData?.isUserInput ?? (previousSet ? false : undefined), // If copying from previous set, mark as not user input
            notes: setData?.notes,
            timestamp: new Date(),
          };

          const updatedSets = [...exercise.sets, newSet];
          const totalVolume = calculateVolume(updatedSets, exercise.equipment);

          return {
            ...exercise,
            sets: updatedSets,
            totalVolume,
          };
        }
        return exercise;
      });

      return { ...prev, exercises: updatedExercises };
    });
  }, [activeWorkout, calculateVolume]);

  // Update set
  const updateSet = useCallback((exerciseId: string, setId: string, updates: Partial<Set>) => {
    if (!activeWorkout) return;

    setActiveWorkout(prev => {
      if (!prev) return prev;

      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.exerciseId === exerciseId) {
          const updatedSets = exercise.sets.map(set =>
            set.id === setId ? { ...set, ...updates, timestamp: new Date() } : set
          );

          const totalVolume = calculateVolume(updatedSets, exercise.equipment);

          return {
            ...exercise,
            sets: updatedSets,
            totalVolume,
          };
        }
        return exercise;
      });

      return { ...prev, exercises: updatedExercises };
    });
  }, [activeWorkout, calculateVolume]);

  // Delete set
  const deleteSet = useCallback((exerciseId: string, setId: string) => {
    if (!activeWorkout) return;

    setActiveWorkout(prev => {
      if (!prev) return prev;

      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.exerciseId === exerciseId) {
          const updatedSets = exercise.sets
            .filter(set => set.id !== setId)
            .map((set, index) => ({ ...set, setNumber: index + 1 }));

          const totalVolume = calculateVolume(updatedSets, exercise.equipment);

          return {
            ...exercise,
            sets: updatedSets,
            totalVolume,
          };
        }
        return exercise;
      });

      return { ...prev, exercises: updatedExercises };
    });
  }, [activeWorkout, calculateVolume]);

  // Save workout to database
  const saveWorkout = useCallback(async () => {
    if (!activeWorkout) return;

    const workoutLog: WorkoutLog = {
      id: uuidv4(),
      userId: 'default-user',
      name: activeWorkout.name,
      date: new Date(),
      startTime: activeWorkout.startTime,
      endTime: new Date(),
      duration: Math.round((new Date().getTime() - activeWorkout.startTime.getTime()) / 60000),
      totalVolume: activeWorkout.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0),
      exercises: activeWorkout.exercises,
      synced: false,
      createdAt: new Date(),
    };

    // Save workout log
    await db.workoutLogs.add(workoutLog);

    // Save all sets
    const allSets = activeWorkout.exercises.flatMap(exercise =>
      exercise.sets.map(set => ({
        ...set,
        workoutLogId: workoutLog.id,
      }))
    );

    if (allSets.length > 0) {
      await db.sets.bulkAdd(allSets);
    }

    // Detect and save Personal Records
    const allPRs = [];
    for (const exercise of activeWorkout.exercises) {
      // Get historical sets for this exercise (excluding current workout)
      const historicalWorkouts = await db.workoutLogs
        .orderBy('date')
        .reverse()
        .toArray();

      const historicalSets: Set[] = [];
      for (const workout of historicalWorkouts) {
        if (workout.id === workoutLog.id) continue; // Skip current workout
        const exerciseData = workout.exercises.find(ex => ex.exerciseId === exercise.exerciseId);
        if (exerciseData) {
          historicalSets.push(...exerciseData.sets);
        }
      }

      // Check each completed working set for PRs
      for (const set of exercise.sets) {
        if (!set.isWarmup && set.completed) {
          const prs = detectPR(
            set,
            exercise.exerciseId,
            exercise.exerciseName,
            workoutLog.id,
            historicalSets
          );
          allPRs.push(...prs);
        }
      }
    }

    // Save all PRs to database
    if (allPRs.length > 0) {
      await db.personalRecords.bulkAdd(allPRs);
    }

    // Clear active workout
    setActiveWorkout(null);
    setIsWorkoutActive(false);

    return { workoutId: workoutLog.id, prs: allPRs };
  }, [activeWorkout, calculateVolume]);

  // Cancel workout (with confirmation)
  const cancelWorkout = useCallback(() => {
    setActiveWorkout(null);
    setIsWorkoutActive(false);
  }, []);

  // Calculate workout stats
  const getWorkoutStats = useCallback(() => {
    if (!activeWorkout) {
      return {
        totalSets: 0,
        completedSets: 0,
        totalVolume: 0,
        duration: 0,
        exerciseCount: 0,
      };
    }

    const totalSets = activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
    const completedSets = activeWorkout.exercises.reduce(
      (sum, ex) => sum + ex.sets.filter(s => s.completed).length,
      0
    );
    const totalVolume = activeWorkout.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0);
    const duration = Math.round((new Date().getTime() - activeWorkout.startTime.getTime()) / 60000);

    return {
      totalSets,
      completedSets,
      totalVolume,
      duration,
      exerciseCount: activeWorkout.exercises.length,
    };
  }, [activeWorkout, calculateVolume]);

  return {
    activeWorkout,
    isWorkoutActive,
    startWorkout,
    startWorkoutWithExercises,
    addExercise,
    removeExercise,
    addSet,
    updateSet,
    deleteSet,
    saveWorkout,
    cancelWorkout,
    getWorkoutStats,
  };
}
