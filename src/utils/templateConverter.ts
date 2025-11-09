import type { WorkoutLog, WorkoutTemplate, LoggedExercise, WorkoutExercise } from '../types/workout';

/**
 * Convert a completed WorkoutLog to a WorkoutTemplate
 * Extracts target sets/reps/weight from actual performance
 */
export function convertWorkoutLogToTemplate(
  workoutLog: WorkoutLog,
  templateName?: string
): Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'> {
  // Convert each logged exercise to a template exercise
  const exercises: WorkoutExercise[] = workoutLog.exercises.map((loggedEx, index) => {
    return convertLoggedExerciseToTemplateExercise(loggedEx, index);
  });

  return {
    name: templateName || workoutLog.name,
    description: `Converted from workout on ${new Date(workoutLog.date).toLocaleDateString()}`,
    exercises,
    isActive: true,
  };
}

/**
 * Convert a LoggedExercise to a WorkoutExercise
 * Calculates target values from actual completed sets
 */
function convertLoggedExerciseToTemplateExercise(
  loggedEx: LoggedExercise,
  orderIndex: number
): WorkoutExercise {
  const workingSets = loggedEx.sets.filter(s => !s.isWarmup && s.completed);
  const warmupSets = loggedEx.sets.filter(s => s.isWarmup).length;

  // Calculate average weight and reps from working sets
  const avgWeight = workingSets.length > 0
    ? Math.round(workingSets.reduce((sum, s) => sum + s.weight, 0) / workingSets.length)
    : 0;

  const avgReps = workingSets.length > 0
    ? Math.round(workingSets.reduce((sum, s) => sum + s.reps, 0) / workingSets.length)
    : 0;

  // Get average RIR if available
  const setsWithRIR = workingSets.filter(s => s.rir !== undefined && s.rir !== null);
  const avgRIR = setsWithRIR.length > 0
    ? Math.round(setsWithRIR.reduce((sum, s) => sum + (s.rir || 0), 0) / setsWithRIR.length)
    : undefined;

  return {
    exerciseId: loggedEx.exerciseId,
    orderIndex,
    targetSets: workingSets.length || 3, // Default to 3 if no working sets
    targetReps: avgReps || 10, // Default to 10 if no data
    targetWeight: avgWeight > 0 ? avgWeight : undefined,
    targetRIR: avgRIR,
    warmupSets: warmupSets > 0 ? warmupSets : undefined,
    restSeconds: 120, // Default 2 minutes rest
    notes: loggedEx.notes,
  };
}
