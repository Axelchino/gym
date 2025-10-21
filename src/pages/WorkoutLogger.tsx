import { useState, useEffect, useRef } from 'react';
import { Play, Plus, Save, X, Trash2, Clock, Timer, Edit, Dumbbell, Trophy, TrendingUp, Zap, Download, Upload } from 'lucide-react';
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
import { exportTemplatesToCSV, importTemplatesFromCSV, downloadCSV, readCSVFile } from '../utils/csvExport';

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
  const [previousWorkoutData, setPreviousWorkoutData] = useState<Map<string, any[]>>(new Map());
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  const [detectedPRs, setDetectedPRs] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    loadTemplateExerciseNames();
  }, [templates]);

  useEffect(() => {
    if (activeWorkout) {
      loadPreviousWorkoutData();
    }
  }, [activeWorkout?.exercises.length]);

  async function loadPreviousWorkoutData() {
    if (!activeWorkout) return;

    const previousData = new Map();

    for (const exercise of activeWorkout.exercises) {
      // Find the most recent workout that contains this exercise
      const recentWorkouts = await db.workoutLogs
        .orderBy('date')
        .reverse()
        .toArray();

      for (const workout of recentWorkouts) {
        const exerciseData = workout.exercises.find(ex => ex.exerciseId === exercise.exerciseId);
        if (exerciseData && exerciseData.sets.length > 0) {
          previousData.set(exercise.exerciseId, exerciseData.sets);
          break; // Found the most recent, stop searching
        }
      }
    }

    setPreviousWorkoutData(previousData);
  }

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
    const result = await saveWorkout();
    setShowSaveConfirm(false);

    // Show PR celebration if any PRs were detected
    if (result && result.prs && result.prs.length > 0) {
      setDetectedPRs(result.prs);
      setShowPRCelebration(true);
    }
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
    // Build the complete workout structure with all exercises and sets
    const exercises = [];

    // Get all recent workouts to find previous data
    const recentWorkouts = await db.workoutLogs
      .orderBy('date')
      .reverse()
      .toArray();

    for (let i = 0; i < template.exercises.length; i++) {
      const templateEx = template.exercises[i];
      const exercise = await db.exercises.get(templateEx.exerciseId);

      if (exercise) {
        // Find previous workout data for this exercise
        let previousSets: any[] = [];
        for (const workout of recentWorkouts) {
          const exerciseData = workout.exercises.find(ex => ex.exerciseId === exercise.id);
          if (exerciseData && exerciseData.sets.length > 0) {
            previousSets = exerciseData.sets;
            break; // Found the most recent
          }
        }

        const sets = [];

        // If we have previous workout data, use it to create sets
        if (previousSets.length > 0) {
          for (let j = 0; j < previousSets.length; j++) {
            const prevSet = previousSets[j];
            sets.push({
              id: uuidv4(),
              workoutLogId: '',
              exerciseId: exercise.id,
              setNumber: j + 1,
              weight: prevSet.weight || 0,
              reps: prevSet.reps || 0,
              rir: prevSet.rir,
              isWarmup: prevSet.isWarmup || false,
              isDropSet: prevSet.isDropSet || false,
              isFailure: prevSet.isFailure || false,
              completed: false,
              isUserInput: false, // Mark as pre-filled (will show gray)
              timestamp: new Date(),
            });
          }
        } else {
          // No previous data - use template defaults
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
              isUserInput: false, // Template defaults also show gray
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
              isUserInput: false, // Template defaults also show gray
              timestamp: new Date(),
            });
          }
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

    // Start workout with all exercises and sets at once
    startWorkoutWithExercises(template.name, exercises);
  }

  async function handleDeleteTemplate(templateId: string) {
    if (confirm('Are you sure you want to delete this template?')) {
      await db.workoutTemplates.delete(templateId);
      await loadTemplates();
    }
  }

  function handleExportTemplates() {
    if (templates.length === 0) {
      alert('No templates to export');
      return;
    }

    const csv = exportTemplatesToCSV(templates);
    const filename = `gym-templates-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  }

  async function handleImportTemplates() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvContent = await readCSVFile(file);
      const importedTemplates = importTemplatesFromCSV(csvContent);

      // Add imported templates to database
      for (const template of importedTemplates) {
        // Check if template with same ID already exists
        const existing = await db.workoutTemplates.get(template.id);
        if (existing) {
          // Update ID to avoid conflicts
          template.id = uuidv4();
        }
        await db.workoutTemplates.add(template);
      }

      await loadTemplates();
      alert(`Successfully imported ${importedTemplates.length} template(s)!`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import templates. Please check the file format.');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            <div className="flex items-center gap-3">
              {templates.length > 0 && (
                <>
                  <button
                    onClick={handleExportTemplates}
                    className="text-primary-green text-sm flex items-center gap-1 hover:text-primary-green/80 transition-colors"
                    title="Export all templates"
                  >
                    <Download size={16} />
                    Export
                  </button>
                  <button
                    onClick={handleImportTemplates}
                    className="text-primary-yellow text-sm flex items-center gap-1 hover:text-primary-yellow/80 transition-colors"
                    title="Import templates"
                  >
                    <Upload size={16} />
                    Import
                  </button>
                </>
              )}
              {templates.length === 0 && (
                <button
                  onClick={handleImportTemplates}
                  className="text-primary-yellow text-sm flex items-center gap-1 hover:text-primary-yellow/80 transition-colors"
                  title="Import templates"
                >
                  <Upload size={16} />
                  Import
                </button>
              )}
              <button
                onClick={() => setShowTemplateBuilder(true)}
                className="text-primary-blue text-sm flex items-center gap-1 hover:text-primary-blue/80 transition-colors"
              >
                <Plus size={16} />
                New Template
              </button>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelected}
            className="hidden"
          />

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
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{exercise.exerciseName}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-400">
                    {exercise.totalVolume.toFixed(0)} {weightUnit} volume
                  </span>
                  {previousWorkoutData.has(exercise.exerciseId) && (() => {
                    const prevSets = previousWorkoutData.get(exercise.exerciseId)!;
                    const bestPrevSet = prevSets
                      .filter(s => !s.isWarmup)
                      .reduce((best, set) =>
                        (set.weight > best.weight || (set.weight === best.weight && set.reps > best.reps)) ? set : best
                      , prevSets[0]);
                    return (
                      <span className="text-primary-blue text-xs">
                        Last: {bestPrevSet.weight}{weightUnit} × {bestPrevSet.reps}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <button
                onClick={() => removeExercise(exercise.exerciseId)}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Set Headers */}
            <div className="grid grid-cols-[minmax(2.5rem,auto),minmax(2rem,auto),minmax(4rem,1fr),minmax(4rem,1fr),minmax(3.5rem,1fr),minmax(2.5rem,auto),minmax(2.5rem,auto)] gap-1.5 sm:gap-2 px-2 pb-2 text-xs text-gray-400 font-medium">
              <div className="text-center">Type</div>
              <div className="text-center">Set</div>
              <div className="text-center">{weightUnit}</div>
              <div className="text-center">Reps</div>
              <div className="text-center text-[10px] sm:text-xs">RIR</div>
              <div></div>
              <div></div>
            </div>

            {/* Current Sets - with previous workout data as placeholders */}
            <div className="space-y-2">
              {exercise.sets.map((set, idx) => {
                // Get corresponding previous set (if available)
                const previousSets = previousWorkoutData.get(exercise.exerciseId);
                const previousSet = previousSets && previousSets[idx] ? previousSets[idx] : undefined;

                return (
                  <SetRow
                    key={set.id}
                    set={set}
                    onUpdate={(updates) => updateSet(exercise.exerciseId, set.id, updates)}
                    onDelete={() => deleteSet(exercise.exerciseId, set.id)}
                    weightUnit={weightUnit}
                    previousSet={previousSet}
                  />
                );
              })}
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

      {/* PR Celebration Modal */}
      {showPRCelebration && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-primary-blue/20 to-primary-yellow/20 border-2 border-primary-blue rounded-lg p-8 max-w-lg w-full animate-fadeIn">
            {/* Trophy Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Trophy size={64} className="text-primary-yellow animate-bounce" />
                <div className="absolute inset-0 blur-xl bg-primary-yellow/50 animate-pulse"></div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary-yellow via-primary-blue to-primary-yellow bg-clip-text text-transparent">
              NEW PERSONAL RECORD{detectedPRs.length > 1 ? 'S' : ''}!
            </h2>
            <p className="text-center text-gray-300 mb-6">
              You just set {detectedPRs.length} new PR{detectedPRs.length > 1 ? 's' : ''}!
            </p>

            {/* PR List */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {detectedPRs.map((pr, index) => {
                const prIcon = {
                  weight: TrendingUp,
                  reps: Zap,
                  volume: Dumbbell,
                  '1rm': Trophy,
                }[pr.type];
                const Icon = prIcon || Trophy;

                const prTypeLabel = {
                  weight: 'Weight PR',
                  reps: 'Rep PR',
                  volume: 'Volume PR',
                  '1rm': '1RM PR',
                }[pr.type];

                return (
                  <div
                    key={index}
                    className="bg-gray-900/50 border border-primary-blue/30 rounded-lg p-4 animate-slideInLeft"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={24} className="text-primary-blue mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-white">{pr.exerciseName}</h3>
                          <span className="text-xs font-bold text-primary-yellow uppercase tracking-wide">
                            {prTypeLabel}
                          </span>
                        </div>
                        <div className="text-sm text-gray-300">
                          {pr.type === 'weight' && (
                            <p>
                              <span className="text-primary-blue font-bold">{pr.weight}{weightUnit}</span> × {pr.reps} reps
                              {pr.previousRecord && (
                                <span className="text-gray-500 ml-2">
                                  (+{(pr.improvement || 0).toFixed(1)}{weightUnit} from {pr.previousRecord}{weightUnit})
                                </span>
                              )}
                            </p>
                          )}
                          {pr.type === 'reps' && (
                            <p>
                              <span className="text-primary-blue font-bold">{pr.reps} reps</span> at {pr.weight}{weightUnit}
                              {pr.previousRecord && (
                                <span className="text-gray-500 ml-2">
                                  (+{pr.improvement} reps from {pr.previousRecord})
                                </span>
                              )}
                            </p>
                          )}
                          {pr.type === 'volume' && (
                            <p>
                              <span className="text-primary-blue font-bold">{pr.value.toFixed(0)} {weightUnit}</span> single-set volume
                              <span className="text-gray-400 ml-2">
                                ({pr.weight}{weightUnit} × {pr.reps})
                              </span>
                              {pr.previousRecord && (
                                <span className="text-gray-500 ml-2">
                                  (+{(pr.improvement || 0).toFixed(0)}{weightUnit})
                                </span>
                              )}
                            </p>
                          )}
                          {pr.type === '1rm' && (
                            <p>
                              <span className="text-primary-blue font-bold">{pr.value.toFixed(1)}{weightUnit}</span> estimated 1RM
                              <span className="text-gray-400 ml-2">
                                ({pr.weight}{weightUnit} × {pr.reps})
                              </span>
                              {pr.previousRecord && (
                                <span className="text-gray-500 ml-2">
                                  (+{(pr.improvement || 0).toFixed(1)}{weightUnit} from {pr.previousRecord.toFixed(1)}{weightUnit})
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowPRCelebration(false)}
              className="w-full btn-primary py-3 text-lg font-semibold"
            >
              Let's Go! 💪
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
