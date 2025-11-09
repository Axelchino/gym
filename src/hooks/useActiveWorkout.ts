import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { WorkoutLog, LoggedExercise, Set } from '../types/workout';
import type { Exercise } from '../types/exercise';
import { db } from '../services/database';
import { detectPR } from '../utils/analytics';
import { supabase } from '../services/supabase';
import {
  getWorkoutLogs,
  createWorkoutLog,
  createPersonalRecord,
} from '../services/supabaseDataService';

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
  const [isSaving, setIsSaving] = useState(false);

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

    // Create initial empty set so user can start logging immediately
    const initialSet: Set = {
      id: crypto.randomUUID(),
      workoutLogId: '', // Will be set when workout is saved
      exerciseId: exercise.id,
      setNumber: 1,
      weight: 0,
      reps: 0,
      isWarmup: false,
      isDropSet: false,
      isFailure: false,
      completed: false,
      timestamp: new Date(),
    };

    const newLoggedExercise: LoggedExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      equipment: exercise.equipment,
      orderIndex: activeWorkout.exercises.length,
      sets: [initialSet], // Start with 1 empty set instead of empty array
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
            reps: setData?.reps ?? 0, // Don't copy reps - user must input
            rpe: setData?.rpe ?? previousSet?.rpe,
            rir: setData?.rir ?? previousSet?.rir,
            isWarmup: setData?.isWarmup ?? false,
            isDropSet: setData?.isDropSet ?? false,
            isFailure: setData?.isFailure ?? false,
            completed: setData?.completed ?? false,
            isUserInput: setData?.isUserInput ?? undefined, // New sets are fresh, not pre-filled
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

    // Prevent multiple simultaneous saves
    if (isSaving) {
      console.warn('Save already in progress, ignoring duplicate request');
      return;
    }

    setIsSaving(true);

    try {
      // STEP 1: Verify user is authenticated BEFORE attempting save
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('You must be logged in to save workouts. Please sign in and try again.');
      }

      console.log('✅ User authenticated, proceeding with save...');

      // STEP 2: Create workout log in Supabase
      const savedWorkout = await createWorkoutLog({
        name: activeWorkout.name,
        date: new Date(),
        startTime: activeWorkout.startTime,
        endTime: new Date(),
        duration: Math.round((new Date().getTime() - activeWorkout.startTime.getTime()) / 60000),
        totalVolume: activeWorkout.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0),
        exercises: activeWorkout.exercises,
      });

      console.log('✅ Workout saved to Supabase:', savedWorkout.id);

      // STEP 3: Save to IndexedDB for offline access and edit functionality
      await db.workoutLogs.put(savedWorkout);
      console.log('✅ Workout saved to IndexedDB');

      // STEP 4: Detect and save Personal Records
      const allPRs = [];
      for (const exercise of activeWorkout.exercises) {
        // Get historical sets for this exercise (excluding current workout)
        const historicalWorkouts = await getWorkoutLogs();

        const historicalSets: Set[] = [];
        for (const workout of historicalWorkouts) {
          if (workout.id === savedWorkout.id) continue; // Skip current workout
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
              savedWorkout.id,
              historicalSets,
              savedWorkout.userId
            );

            // Save each PR individually to Supabase
            for (const pr of prs) {
              await createPersonalRecord({
                exerciseId: pr.exerciseId,
                exerciseName: pr.exerciseName,
                type: pr.type,
                value: pr.value,
                reps: pr.reps,
                date: pr.date,
                workoutLogId: pr.workoutLogId,
                previousRecord: pr.previousRecord,
              });
            }

            allPRs.push(...prs);
          }
        }
      }

      console.log('✅ Personal records saved:', allPRs.length);

      // STEP 5: Only clear workout AFTER successful save
      setActiveWorkout(null);
      setIsWorkoutActive(false);
      setIsSaving(false);

      console.log('✅ Workout save complete!');

      return { workoutId: savedWorkout.id, workout: savedWorkout, prs: allPRs };
    } catch (error) {
      setIsSaving(false);

      console.error('❌ Error saving workout:', error);

      // CRITICAL: Keep workout in localStorage so user doesn't lose data
      // Don't clear activeWorkout - user can retry

      // Provide user-friendly error messages based on error type
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      if (errorMessage.includes('logged in') || errorMessage.includes('authenticated')) {
        alert('⚠️ You must be signed in to save workouts.\n\nYour workout is still saved locally. Please sign in and try saving again.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        alert('⚠️ Network connection issue.\n\nYour workout is saved locally and will be uploaded when you have internet connection. You can keep working out offline.');
        // TODO: Add to offline queue for later sync
      } else {
        alert(`⚠️ Failed to save workout: ${errorMessage}\n\nYour workout is still saved locally. Please try again or contact support if the issue persists.`);
      }

      throw error;
    }
  }, [activeWorkout, calculateVolume, isSaving]);

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
    isSaving,
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
