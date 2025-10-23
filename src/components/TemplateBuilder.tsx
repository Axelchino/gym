import { useState, useEffect } from 'react';
import { Plus, X, Save, Trash2 } from 'lucide-react';
import { ExerciseSelector } from './ExerciseSelector';
import { db } from '../services/database';
import type { Exercise } from '../types/exercise';
import type { WorkoutExercise } from '../types/workout';
import { isBuiltinTemplate } from '../data/workoutTemplates';

interface TemplateBuilderProps {
  onSave: (name: string, exercises: WorkoutExercise[], templateId?: string) => void;
  onCancel: () => void;
  initialName?: string;
  initialExercises?: WorkoutExercise[];
  templateId?: string; // For editing existing templates
}

interface ExerciseWithDetails extends WorkoutExercise {
  name: string;
  equipment: string;
}

export function TemplateBuilder({ onSave, onCancel, initialName = '', initialExercises = [], templateId }: TemplateBuilderProps) {
  const [templateName, setTemplateName] = useState(initialName);
  const [exercises, setExercises] = useState<WorkoutExercise[]>(initialExercises);
  const [exerciseDetails, setExerciseDetails] = useState<Map<string, Exercise>>(new Map());
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const isEditing = !!templateId;
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize built-in template exercises by resolving names to IDs
  useEffect(() => {
    async function initializeBuiltinTemplate() {
      if (templateId && isBuiltinTemplate(templateId) && !isInitialized) {
        const allExercises = await db.exercises.toArray();
        const resolvedExercises: WorkoutExercise[] = [];

        for (const ex of initialExercises) {
          // exerciseId is actually the exercise name for built-in templates
          const exercise = allExercises.find(dbEx => dbEx.name === ex.exerciseId);
          if (exercise) {
            resolvedExercises.push({
              ...ex,
              exerciseId: exercise.id, // Replace name with actual ID
            });
          }
        }

        setExercises(resolvedExercises);
        setIsInitialized(true);
      } else if (!isInitialized) {
        setIsInitialized(true);
      }
    }

    initializeBuiltinTemplate();
  }, [templateId, initialExercises, isInitialized]);

  useEffect(() => {
    loadExerciseDetails();
  }, [exercises]);

  async function loadExerciseDetails() {
    const details = new Map<string, Exercise>();
    for (const ex of exercises) {
      const exercise = await db.exercises.get(ex.exerciseId);
      if (exercise) {
        details.set(ex.exerciseId, exercise);
      }
    }
    setExerciseDetails(details);
  }

  function handleAddExercise(exercise: Exercise) {
    const newExercise: WorkoutExercise = {
      exerciseId: exercise.id,
      orderIndex: exercises.length,
      targetSets: 3,
      targetReps: 10,
      warmupSets: 0,
      targetRIR: 2,
      restSeconds: 90,
    };
    setExercises([...exercises, newExercise]);
  }

  function handleRemoveExercise(index: number) {
    setExercises(exercises.filter((_, i) => i !== index).map((ex, i) => ({ ...ex, orderIndex: i })));
  }

  function handleUpdateExercise(index: number, updates: Partial<WorkoutExercise>) {
    setExercises(exercises.map((ex, i) => i === index ? { ...ex, ...updates } : ex));
  }

  function handleSave() {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    if (exercises.length === 0) {
      alert('Please add at least one exercise');
      return;
    }
    onSave(templateName, exercises, templateId);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{isEditing ? 'Edit Workout Template' : 'Create Workout Template'}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Push Day, Pull Day, Leg Day"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-blue"
            />
          </div>

          {/* Exercises List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Exercises ({exercises.length})</h3>
              <button
                onClick={() => setShowExerciseSelector(true)}
                className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="card text-center py-12 text-gray-400">
                <p>No exercises added yet</p>
                <p className="text-sm mt-2">Click "Add Exercise" to start building your template</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exercises.map((exercise, index) => {
                  const details = exerciseDetails.get(exercise.exerciseId);
                  return (
                  <div key={index} className="card-elevated p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold">{details?.name || 'Loading...'}</h4>
                        <div className="flex gap-2 mt-1">
                          {details && (
                            <>
                              <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                                {details.equipment}
                              </span>
                              <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                                {details.movementType}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(index)}
                        className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Working Sets</label>
                        <input
                          type="number"
                          value={exercise.targetSets}
                          onChange={(e) => handleUpdateExercise(index, { targetSets: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-blue"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Warmup Sets</label>
                        <input
                          type="number"
                          value={exercise.warmupSets || 0}
                          onChange={(e) => handleUpdateExercise(index, { warmupSets: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-blue"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Target Reps</label>
                        <input
                          type="number"
                          value={exercise.targetReps}
                          onChange={(e) => handleUpdateExercise(index, { targetReps: parseInt(e.target.value) || 0 })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-blue"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Target RIR</label>
                        <input
                          type="number"
                          value={exercise.targetRIR ?? 2}
                          onChange={(e) => handleUpdateExercise(index, { targetRIR: parseInt(e.target.value) })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-blue"
                          min="0"
                          max="10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Rest (seconds)</label>
                        <input
                          type="number"
                          value={exercise.restSeconds || 90}
                          onChange={(e) => handleUpdateExercise(index, { restSeconds: parseInt(e.target.value) || 90 })}
                          className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-blue"
                          min="0"
                          step="15"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-3">
                      <label className="block text-xs text-gray-400 mb-1">Notes (optional)</label>
                      <input
                        type="text"
                        value={exercise.notes || ''}
                        onChange={(e) => handleUpdateExercise(index, { notes: e.target.value })}
                        placeholder="e.g., Focus on form, explosive reps"
                        className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-primary-blue placeholder-gray-500"
                      />
                    </div>
                  </div>
                );
              })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex gap-3">
          <button onClick={onCancel} className="flex-1 btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="flex-1 btn-primary flex items-center justify-center gap-2">
            <Save size={16} />
            {isEditing ? 'Update Template' : 'Save Template'}
          </button>
        </div>

        {/* Exercise Selector Modal */}
        {showExerciseSelector && (
          <ExerciseSelector
            onSelect={handleAddExercise}
            onClose={() => setShowExerciseSelector(false)}
          />
        )}
      </div>
    </div>
  );
}
