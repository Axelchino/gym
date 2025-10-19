import { useState, useEffect } from 'react';
import { Play, Plus, Save, X, Trash2, Clock, Timer, Edit, Dumbbell } from 'lucide-react';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useUserSettings } from '../hooks/useUserSettings';
import { useRestTimer } from '../hooks/useRestTimer';
import { ExerciseSelector } from '../components/ExerciseSelector';
import { SetRow } from '../components/SetRow';
import { TemplateBuilder } from '../components/TemplateBuilder';
import { db } from '../services/database';
import { v4 as uuidv4 } from 'uuid';
import type { Exercise } from '../types/exercise';
import type { WorkoutTemplate, WorkoutExercise } from '../types/workout';

export function WorkoutLogger() {
  const {
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
  } = useActiveWorkout();

  const { weightUnit, toggleUnit } = useUserSettings();
  const {
    isRunning: timerIsRunning,
    timeRemaining,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
  } = useRestTimer(90);

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [templateExerciseNames, setTemplateExerciseNames] = useState<Map<string, Map<string, string>>>(new Map());
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    loadTemplateExerciseNames();
  }, [templates]);

  async function loadTemplateExerciseNames() {
    const nameMap = new Map<string, Map<string, string>>();

    for (const template of templates) {
      const exerciseNamesForTemplate = new Map<string, string>();

      for (const ex of template.exercises) {
        const exercise = await db.exercises.get(ex.exerciseId);
        if (exercise) {
          exerciseNamesForTemplate.set(ex.exerciseId, exercise.name);
        }
      }

      nameMap.set(template.id, exerciseNamesForTemplate);
    }

    setTemplateExerciseNames(nameMap);
  }

  async function loadTemplates() {
    const allTemplates = await db.workoutTemplates
      .where('userId')
      .equals('default-user')
      .toArray();
    setTemplates(allTemplates);
  }

  function handleStartWorkout() {
    const name = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }) + ' Workout';
    startWorkout(name);
  }

  function handleAddExercise(exercise: Exercise) {
    addExercise(exercise);
  }

  async function handleSaveWorkout() {
    await saveWorkout();
    setShowSaveConfirm(false);
  }

  function handleCancelWorkout() {
    cancelWorkout();
    setShowCancelConfirm(false);
  }

  async function handleSaveTemplate(name: string, exercises: WorkoutExercise[], templateId?: string) {
    if (templateId) {
      // Update existing template
      await db.workoutTemplates.update(templateId, {
        name,
        exercises,
        updatedAt: new Date(),
      });
    } else {
      // Create new template
      const template: WorkoutTemplate = {
        id: uuidv4(),
        userId: 'default-user',
        name,
        exercises,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.workoutTemplates.add(template);
    }

    await loadTemplates();
    setShowTemplateBuilder(false);
    setEditingTemplate(null);
  }

  async function handleStartFromTemplate(template: WorkoutTemplate) {
    console.log('Starting workout from template:', template);

    // Build the complete workout structure with all exercises and sets
    const exercises = [];

    for (let i = 0; i < template.exercises.length; i++) {
      const templateEx = template.exercises[i];
      const exercise = await db.exercises.get(templateEx.exerciseId);

      if (exercise) {
        console.log('Loading exercise:', exercise.name);
        const sets = [];
        let setNumber = 1;

        // Add warmup sets first
        const warmupSets = templateEx.warmupSets || 0;
        for (let j = 0; j < warmupSets; j++) {
          sets.push({
            id: uuidv4(),
            workoutLogId: '',
            exerciseId: exercise.id,
            setNumber: setNumber++,
            weight: 0,
            reps: templateEx.targetReps,
            rir: templateEx.targetRIR,
            isWarmup: true,
            isDropSet: false,
            isFailure: false,
            completed: false,
            timestamp: new Date(),
          });
        }

        // Add working sets
        for (let j = 0; j < templateEx.targetSets; j++) {
          sets.push({
            id: uuidv4(),
            workoutLogId: '',
            exerciseId: exercise.id,
            setNumber: setNumber++,
            weight: templateEx.targetWeight || 0,
            reps: templateEx.targetReps,
            rir: templateEx.targetRIR,
            isWarmup: false,
            isDropSet: false,
            isFailure: false,
            completed: false,
            timestamp: new Date(),
          });
        }

        exercises.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          equipment: exercise.equipment,
          orderIndex: i,
          sets,
          totalVolume: 0,
          notes: templateEx.notes,
        });
      }
    }

    console.log('Starting workout with', exercises.length, 'exercises');
    // Start workout with all exercises and sets at once
    startWorkoutWithExercises(template.name, exercises);
  }

  async function handleDeleteTemplate(templateId: string) {
    if (confirm('Are you sure you want to delete this template?')) {
      await db.workoutTemplates.delete(templateId);
      await loadTemplates();
    }
  }

  // If no active workout, show start screen
  if (!isWorkoutActive || !activeWorkout) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Start Workout</h1>
          <p className="text-gray-400">Choose a template or start a blank workout</p>
        </div>

        {/* Quick Start */}
        <button
          onClick={handleStartWorkout}
          className="w-full card-elevated hover:border-primary-blue transition-colors flex items-center justify-center gap-3 py-6"
        >
          <Play className="text-primary-blue" size={24} />
          <span className="text-lg font-semibold">Start Empty Workout</span>
        </button>

        {/* Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Workout Templates</h2>
            <button
              onClick={() => setShowTemplateBuilder(true)}
              className="text-primary-blue text-sm flex items-center gap-1 hover:text-primary-blue/80 transition-colors"
            >
              <Plus size={16} />
              New Template
            </button>
          </div>

          {templates.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <p>No templates yet</p>
              <p className="text-sm mt-2">Create your first workout template to get started faster</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="card-elevated">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {template.exercises.length} exercises
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateBuilder(true);
                        }}
                        className="text-gray-400 hover:text-primary-blue transition-colors"
                        title="Edit template"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete template"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Exercise Preview */}
                  <div className="space-y-1 mb-4">
                    {template.exercises.slice(0, 3).map((ex, idx) => {
                      const exerciseName = templateExerciseNames.get(template.id)?.get(ex.exerciseId) || 'Loading...';
                      return (
                        <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                          <Dumbbell size={12} className="flex-shrink-0" />
                          <span className="truncate">
                            {exerciseName} - {ex.targetSets}x{ex.targetReps}
                          </span>
                        </div>
                      );
                    })}
                    {template.exercises.length > 3 && (
                      <div
                        className="text-xs text-gray-500 hover:text-gray-300 cursor-help transition-colors"
                        title={template.exercises.slice(3).map(ex =>
                          templateExerciseNames.get(template.id)?.get(ex.exerciseId) || 'Loading...'
                        ).join(', ')}
                      >
                        +{template.exercises.length - 3} more (hover to see)
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleStartFromTemplate(template)}
                    className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2"
                  >
                    <Play size={16} />
                    Start Workout
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Template Builder Modal */}
        {showTemplateBuilder && (
          <TemplateBuilder
            onSave={handleSaveTemplate}
            onCancel={() => {
              setShowTemplateBuilder(false);
              setEditingTemplate(null);
            }}
            initialName={editingTemplate?.name}
            initialExercises={editingTemplate?.exercises}
            templateId={editingTemplate?.id}
          />
        )}
      </div>
    );
  }

  const stats = getWorkoutStats();

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-bg/95 backdrop-blur-sm pb-4 border-b border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold">{activeWorkout.name}</h1>
            <p className="text-sm text-gray-400 flex items-center gap-2">
              <Clock size={14} />
              {stats.duration} min
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleUnit}
              className="btn-secondary px-3 py-2 text-xs font-mono"
              title="Toggle units"
            >
              {weightUnit}
            </button>
            <button
              onClick={() => setShowTimer(!showTimer)}
              className={`px-3 py-2 text-xs rounded transition-colors ${
                showTimer ? 'bg-primary-blue text-white' : 'btn-secondary'
              }`}
              title="Toggle timer"
            >
              <Timer size={16} />
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="btn-secondary px-4 py-2 text-sm"
            >
              <X size={16} className="inline mr-1" />
              Cancel
            </button>
            <button
              onClick={() => setShowSaveConfirm(true)}
              className="btn-primary px-4 py-2 text-sm"
              disabled={stats.completedSets === 0}
            >
              <Save size={16} className="inline mr-1" />
              Finish
            </button>
          </div>
        </div>

        {/* Timer (collapsible) */}
        {showTimer && (
          <div className="mb-3 p-3 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400 mb-1">Rest Timer</p>
                <p className={`text-2xl font-bold font-mono ${timeRemaining <= 10 && timerIsRunning ? 'text-red-400 animate-pulse' : ''}`}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div className="flex gap-2">
                {!timerIsRunning ? (
                  <button onClick={() => startTimer(90)} className="bg-primary-blue hover:bg-primary-blue/80 text-white rounded px-4 py-2 text-sm">
                    Start
                  </button>
                ) : (
                  <button onClick={pauseTimer} className="bg-primary-yellow hover:bg-primary-yellow/80 text-white rounded px-4 py-2 text-sm">
                    Pause
                  </button>
                )}
                <button onClick={resetTimer} className="btn-secondary px-3 py-2 text-sm">Reset</button>
                <button onClick={skipTimer} className="btn-secondary px-3 py-2 text-sm">Skip</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-gray-800 rounded p-2 text-center">
            <p className="text-xs text-gray-400">Exercises</p>
            <p className="text-lg font-bold">{stats.exerciseCount}</p>
          </div>
          <div className="bg-gray-800 rounded p-2 text-center">
            <p className="text-xs text-gray-400">Sets</p>
            <p className="text-lg font-bold">{stats.completedSets}/{stats.totalSets}</p>
          </div>
          <div className="bg-gray-800 rounded p-2 text-center">
            <p className="text-xs text-gray-400">Volume</p>
            <p className="text-lg font-bold">{stats.totalVolume.toFixed(0)} {weightUnit}</p>
          </div>
          <div className="bg-gray-800 rounded p-2 text-center">
            <p className="text-xs text-gray-400">Duration</p>
            <p className="text-lg font-bold">{stats.duration}m</p>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {activeWorkout.exercises.map((exercise) => (
          <div key={exercise.exerciseId} className="card-elevated">
            {/* Exercise Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-lg">{exercise.exerciseName}</h3>
                <p className="text-sm text-gray-400">
                  {exercise.totalVolume.toFixed(0)} {weightUnit} total volume
                </p>
              </div>
              <button
                onClick={() => removeExercise(exercise.exerciseId)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Set Headers */}
            <div className="grid grid-cols-[auto,auto,1fr,1fr,1fr,auto,auto] gap-2 px-2 pb-2 text-xs text-gray-400 font-medium">
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
                  onUpdate={(updates) => updateSet(exercise.exerciseId, set.id, updates)}
                  onDelete={() => deleteSet(exercise.exerciseId, set.id)}
                  weightUnit={weightUnit}
                />
              ))}
            </div>

            {/* Add Set Button */}
            <button
              onClick={() => addSet(exercise.exerciseId)}
              className="w-full mt-3 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Add Set
            </button>
          </div>
        ))}
      </div>

      {/* Add Exercise Button */}
      <button
        onClick={() => setShowExerciseSelector(true)}
        className="w-full card-elevated hover:border-primary-blue transition-colors flex items-center justify-center gap-3 py-4"
      >
        <Plus className="text-primary-blue" size={20} />
        <span className="font-semibold">Add Exercise</span>
      </button>

      {/* Exercise Selector Modal */}
      {showExerciseSelector && (
        <ExerciseSelector
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirm && (() => {
        // Check for uncompleted working sets (warmup sets don't count)
        const incompleteSets = activeWorkout.exercises.flatMap(ex =>
          ex.sets.filter(set => !set.completed && !set.isWarmup)
        );
        const hasIncompleteSets = incompleteSets.length > 0;

        // Get exercises with incomplete sets
        const exercisesWithIncomplete = activeWorkout.exercises
          .filter(ex => ex.sets.some(set => !set.completed && !set.isWarmup))
          .map(ex => ex.exerciseName);

        return (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4">Finish Workout?</h2>
              <p className="text-gray-400 mb-4">
                Save this workout with {stats.completedSets} completed sets and {stats.totalVolume.toFixed(0)} {weightUnit} total volume?
              </p>

              {/* Warning for incomplete sets */}
              {hasIncompleteSets && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="text-orange-400 mt-0.5">⚠️</div>
                    <div className="flex-1">
                      <p className="text-orange-400 font-semibold text-sm mb-2">
                        Warning: {incompleteSets.length} uncompleted set{incompleteSets.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-orange-300 text-xs mb-2">
                        These sets won't count toward your volume:
                      </p>
                      <ul className="text-orange-300 text-xs list-disc list-inside space-y-1">
                        {exercisesWithIncomplete.map((name, idx) => (
                          <li key={idx}>{name}</li>
                        ))}
                      </ul>
                      <p className="text-orange-300 text-xs mt-2 italic">
                        Click the checkmark (✓) on each set to mark it complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveConfirm(false)}
                  className="flex-1 btn-secondary"
                >
                  Keep Working
                </button>
                <button
                  onClick={handleSaveWorkout}
                  className="flex-1 btn-primary"
                >
                  Save & Finish
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-400">Cancel Workout?</h2>
            <p className="text-gray-400 mb-6">
              This will discard your workout with {stats.completedSets} completed sets. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 btn-secondary"
              >
                Keep Workout
              </button>
              <button
                onClick={handleCancelWorkout}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded py-2 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
