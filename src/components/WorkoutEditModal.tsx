import { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { SetRow } from './SetRow';
import { db } from '../services/database';
import { getWorkoutLogs, updateWorkoutLog } from '../services/supabaseDataService';
import { useUserSettings } from '../hooks/useUserSettings';
import { useTheme } from '../contexts/ThemeContext';
import { getAccentColors, getSelectedColors } from '../utils/themeHelpers';
import type { WorkoutLog, Set } from '../types/workout';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutEditModalProps {
  workoutId: string;
  onClose: () => void;
  onSave: () => void;
  readOnly?: boolean;
}

export function WorkoutEditModal({ workoutId, onClose, onSave, readOnly = false }: WorkoutEditModalProps) {
  const { weightUnit } = useUserSettings();
  const { theme } = useTheme();
  const accentColors = getAccentColors(theme);
  const selectedColors = getSelectedColors(theme);
  const [workout, setWorkout] = useState<WorkoutLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadWorkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId]);

  async function loadWorkout() {
    setIsLoading(true);
    try {
      // Load all workouts from Supabase and find the one we want
      const allWorkouts = await getWorkoutLogs();
      const workoutData = allWorkouts.find(w => w.id === workoutId);

      if (workoutData) {
        setWorkout(workoutData);
      } else {
        console.error('Workout not found in Supabase');
      }
    } catch (error) {
      console.error('Error loading workout:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function calculateVolume(sets: Set[], equipment: string, category?: string) {
    // Exclude categories where volume calculation doesn't make sense
    if (category && ['Cardio', 'Stretch', 'Stretching', 'Sports'].includes(category)) {
      return 0;
    }

    return sets
      .filter(s => !s.isWarmup && s.completed)
      .reduce((sum, s) => sum + (s.weight * s.reps), 0);
  }

  function handleUpdateSet(exerciseId: string, setId: string, updates: Partial<Set>) {
    if (!workout) return;

    setWorkout(prev => {
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
  }

  function handleDeleteSet(exerciseId: string, setId: string) {
    if (!workout) return;

    setWorkout(prev => {
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
  }

  function handleAddSet(exerciseId: string) {
    if (!workout) return;

    setWorkout(prev => {
      if (!prev) return prev;

      const updatedExercises = prev.exercises.map(exercise => {
        if (exercise.exerciseId === exerciseId) {
          const setNumber = exercise.sets.length + 1;
          const previousSet = exercise.sets[exercise.sets.length - 1];

          const newSet: Set = {
            id: uuidv4(),
            workoutLogId: workout.id,
            exerciseId,
            setNumber,
            weight: previousSet?.weight ?? 0,
            reps: previousSet?.reps ?? 0,
            rpe: previousSet?.rpe,
            rir: previousSet?.rir,
            isWarmup: false,
            isDropSet: false,
            isFailure: false,
            completed: false,
            notes: undefined,
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
  }

  async function handleSaveWorkout() {
    if (!workout) return;

    setIsSaving(true);
    try {
      // Recalculate total volume
      const totalVolume = workout.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0);

      // Calculate duration if endTime exists
      const duration = workout.endTime
        ? Math.round((workout.endTime.getTime() - workout.startTime.getTime()) / 60000)
        : workout.duration;

      // Update workout log in Supabase (PRIMARY SOURCE OF TRUTH)
      await updateWorkoutLog(workout.id, {
        name: workout.name,
        date: workout.date,
        startTime: workout.startTime,
        endTime: workout.endTime,
        duration,
        totalVolume,
        exercises: workout.exercises,
        notes: workout.notes,
      });

      console.log('✅ Workout updated in Supabase:', workout.id);

      // Also update IndexedDB for offline access
      await db.workoutLogs.put({
        ...workout,
        totalVolume,
        duration,
      });

      // Delete all existing sets for this workout in IndexedDB
      await db.sets.where('workoutLogId').equals(workout.id).delete();

      // Re-add all sets to IndexedDB
      const allSets = workout.exercises.flatMap(exercise =>
        exercise.sets.map(set => ({
          ...set,
          workoutLogId: workout.id,
        }))
      );

      if (allSets.length > 0) {
        await db.sets.bulkAdd(allSets);
      }

      console.log('✅ Workout also cached in IndexedDB');

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-surface-elevated rounded-lg p-6 max-w-4xl w-full">
          <p className="text-center text-secondary">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-surface-elevated rounded-lg p-6 max-w-4xl w-full">
          <p className="text-center text-red-400">Workout not found</p>
          <button onClick={onClose} className="mt-4 w-full btn-secondary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-elevated rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="p-6 border-b border-border-medium flex items-center justify-between sticky top-0 bg-surface-elevated rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-1">{readOnly ? 'View Workout' : 'Edit Workout'}</h2>
            <p className="text-sm text-secondary">{formatDate(workout.date)}</p>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Workout Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card text-center">
              <p className="text-xs text-muted mb-1">Duration</p>
              <p className="text-xl font-bold text-primary">{workout.duration} min</p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-muted mb-1">Total Volume</p>
              <p className="text-xl font-bold text-primary">
                {workout.exercises.reduce((sum, ex) => sum + ex.totalVolume, 0).toFixed(0)} {weightUnit}
              </p>
            </div>
            <div className="card text-center">
              <p className="text-xs text-muted mb-1">Exercises</p>
              <p className="text-xl font-bold text-primary">{workout.exercises.length}</p>
            </div>
          </div>

          {/* Exercises */}
          {workout.exercises.map((exercise) => (
            <div key={exercise.exerciseId} className="card-elevated">
              {/* Exercise Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg text-primary">{exercise.exerciseName}</h3>
                  <p className="text-sm text-secondary">
                    {exercise.totalVolume.toFixed(0)} {weightUnit} total volume
                  </p>
                </div>
              </div>

              {/* Set Headers */}
              <div className="grid grid-cols-[auto,auto,1fr,1fr,1fr,auto,auto] gap-2 px-2 pb-2 text-xs text-muted font-medium">
                <div className="w-10 text-center">Type</div>
                <div className="w-8 text-center">Set</div>
                <div className="text-center">Weight ({weightUnit})</div>
                <div className="text-center">Reps</div>
                <div className="text-center">RIR</div>
                <div></div>
                <div></div>
              </div>

              {/* Sets */}
              <div className="space-y-2">
                {exercise.sets.map((set) => (
                  <SetRow
                    key={set.id}
                    set={set}
                    onUpdate={(updates) => handleUpdateSet(exercise.exerciseId, set.id, updates)}
                    onDelete={() => handleDeleteSet(exercise.exerciseId, set.id)}
                    weightUnit={weightUnit}
                    readOnly={readOnly}
                  />
                ))}
              </div>

              {/* Add Set Button */}
              {!readOnly && (
                <button
                  onClick={() => handleAddSet(exercise.exerciseId)}
                  className="w-full mt-3 bg-surface-accent hover:bg-border-medium text-secondary py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add Set
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        {!readOnly && (
          <div className="p-6 border-t border-border-medium flex gap-3 sticky bottom-0 bg-surface-elevated rounded-b-lg">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleSaveWorkout}
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-lg transition-all"
              style={{
                backgroundColor: selectedColors.background,
                color: selectedColors.text,
                border: `1px solid ${selectedColors.border}`,
              }}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = accentColors.backgroundHover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = selectedColors.background;
              }}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
