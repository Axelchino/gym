import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { WorkoutLog, LoggedExercise, Set } from '../types/workout';
import type { Exercise } from '../types/exercise';
import { db } from '../services/database';

interface ActiveWorkout {
  name: string;
  startTime: Date;
  exercises: LoggedExercise[];
}

export function useActiveWorkout() {
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);

  // Helper function to calculate volume (handles dumbbell 2x multiplier)
  const calculateVolume = useCallback((sets: Set[], equipment: string) => {
    const multiplier = equipment === 'Dumbbell' ? 2 : 1;
    return sets
      .filter(s => !s.isWarmup && s.completed)
      .reduce((sum, s) => sum + (s.weight * s.reps * multiplier), 0);
  }, []);

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

    // Check for PRs (optional - can be implemented later)
    // await detectPersonalRecords(workoutLog);

    // Clear active workout
    setActiveWorkout(null);
    setIsWorkoutActive(false);

    return workoutLog.id;
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
