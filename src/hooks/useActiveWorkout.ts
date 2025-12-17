import { useState, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { WorkoutLog, LoggedExercise, Set } from '../types/workout';
import type { Exercise } from '../types/exercise';
import { db } from '../services/database';
import { detectPR } from '../utils/analytics';
import {
  getWorkoutLogs,
  createPersonalRecord,
} from '../services/supabaseDataService';
import { useAuth } from '../contexts/AuthContext';
import { syncManager } from '../services/syncManager';
import { appendMuscleEffortData } from '../services/muscleEffortService';
import { useUserProfile } from './useUserProfile';

const ACTIVE_WORKOUT_KEY = 'gym-tracker-active-workout';
const GUEST_WORKOUTS_KEY = 'gym-tracker-guest-workouts';

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
  const { user } = useAuth();
  const { data: userProfile } = useUserProfile(user?.id || null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(loadWorkoutFromStorage);
  const [isWorkoutActive, setIsWorkoutActive] = useState(() => {
    const stored = loadWorkoutFromStorage();
    return stored !== null;
  });
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to calculate volume (weight × reps - enter weight per dumbbell)
  // Excludes cardio, stretching, and sports exercises (volume doesn't apply)
  const calculateVolume = useCallback((sets: Set[], equipment: string, category?: string) => {
    // Exclude categories where volume calculation doesn't make sense
    if (category && ['Cardio', 'Stretch', 'Stretching', 'Sports'].includes(category)) {
      return 0;
    }

    return sets
      .filter(s => !s.isWarmup && s.completed)
      .reduce((sum, s) => sum + (s.weight * s.reps), 0);
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

    // Auto-populate weight for bodyweight exercises with multiplier
    let autoWeight = 0;
    if (exercise.bodyweightMultiplier && userProfile?.currentWeight) {
      autoWeight = Math.round(userProfile.currentWeight * exercise.bodyweightMultiplier);
    }

    // Create initial empty set so user can start logging immediately
    const initialSet: Set = {
      id: crypto.randomUUID(),
      workoutLogId: '', // Will be set when workout is saved
      exerciseId: exercise.id,
      setNumber: 1,
      weight: autoWeight, // Auto-populate for bodyweight exercises
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
      category: exercise.category,
      orderIndex: activeWorkout.exercises.length,
      sets: [initialSet], // Start with 1 empty set instead of empty array
      totalVolume: 0,
    };

    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newLoggedExercise],
    });
  }, [activeWorkout, calculateVolume, userProfile]);

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
          const totalVolume = calculateVolume(updatedSets, exercise.equipment, exercise.category);

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

          const totalVolume = calculateVolume(updatedSets, exercise.equipment, exercise.category);

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

          const totalVolume = calculateVolume(updatedSets, exercise.equipment, exercise.category);

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
      // STEP 1: Check if user is authenticated
      // For guest users, save to localStorage only
      if (!user) {
        console.log('👤 Guest mode: Saving workout to localStorage only...');

        const guestWorkout: WorkoutLog = {
          id: uuidv4(),
          userId: 'guest',
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

        // Save to guest workouts in localStorage
        const existingGuestWorkouts = JSON.parse(localStorage.getItem(GUEST_WORKOUTS_KEY) || '[]');
        existingGuestWorkouts.push(guestWorkout);
        localStorage.setItem(GUEST_WORKOUTS_KEY, JSON.stringify(existingGuestWorkouts));

        // Clear active workout
        setActiveWorkout(null);
        setIsWorkoutActive(false);
        setIsSaving(false);

        console.log('✅ Guest workout saved to localStorage');

        // Show warning that data will be lost
        alert('✅ Workout saved locally!\n\n⚠️ Note: Sign up to save your workouts permanently. Guest workouts are only stored on this device and may be lost.');

        return { workoutId: guestWorkout.id, workout: guestWorkout, prs: [] };
      }

      console.log('✅ User authenticated, proceeding with OFFLINE-FIRST save...');

      // STEP 2: Save to IndexedDB FIRST (instant, always works)
      const workoutId = uuidv4();
      const savedWorkout: WorkoutLog = {
        id: workoutId,
        userId: user.id,
        name: activeWorkout.name,
        date: new Date(),
        startTime: activeWorkout.startTime,
        endTime: new Date(),
        duration: Math.round((new Date().getTime() - activeWorkout.startTime.getTime()) / 60000),
        totalVolume: activeWorkout.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0),
        exercises: activeWorkout.exercises,
        synced: false, // Mark as not synced yet
        createdAt: new Date(),
      };

      await db.workoutLogs.put(savedWorkout);
      console.log('✅ Workout saved to IndexedDB (instant)');

      // STEP 3: Queue for cloud sync (background, non-blocking)
      await syncManager.queueSync('workout', 'create', workoutId, {
        name: savedWorkout.name,
        date: savedWorkout.date,
        startTime: savedWorkout.startTime,
        endTime: savedWorkout.endTime,
        duration: savedWorkout.duration,
        totalVolume: savedWorkout.totalVolume,
        exercises: savedWorkout.exercises,
      });
      console.log('✅ Workout queued for sync to Supabase');

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

            // Save each PR individually (non-blocking, offline-safe)
            for (const pr of prs) {
              try {
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
              } catch (prError) {
                // Don't fail workout save if PR save fails (offline-safe)
                console.warn('Failed to save PR (will retry on sync):', prError);
              }
            }

            allPRs.push(...prs);
          }
        }
      }

      console.log('✅ Personal records saved:', allPRs.length);

      // STEP 5: Save muscle effort data for radar chart (non-blocking)
      try {
        await appendMuscleEffortData(savedWorkout, user.id);
      } catch (muscleError) {
        // Don't fail workout save if muscle effort save fails
        console.warn('Failed to save muscle effort data:', muscleError);
      }

      // STEP 6: Only clear workout AFTER successful save
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
      } else {
        // For offline-first, most errors are non-critical since data is already saved locally
        console.error('Non-critical error during workout save:', error);
        alert(`✅ Workout saved locally!\n\n⚠️ ${errorMessage}\n\nYour workout will sync to the cloud when you're back online.`);
      }

      // Don't throw - we still saved locally which is what matters
      return null;
    }
  }, [activeWorkout, calculateVolume, isSaving, user]);

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
