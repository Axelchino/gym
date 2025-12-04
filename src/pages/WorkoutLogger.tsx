import { useState, useEffect, useRef } from 'react';
import { Play, Plus, Save, X, Trash2, Clock, Timer, Edit, Dumbbell, Trophy, TrendingUp, Zap, Download, Upload, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { useUserSettings } from '../hooks/useUserSettings';
import { useRestTimer } from '../hooks/useRestTimer';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAccentColors, getSelectedColors } from '../utils/themeHelpers';
import { ExerciseSelector } from '../components/ExerciseSelector';
import { SetRow } from '../components/SetRow';
import { TemplateBuilder } from '../components/TemplateBuilder';
import { db } from '../services/database';
import { v4 as uuidv4 } from 'uuid';
import type { Exercise } from '../types/exercise';
import type { WorkoutTemplate, WorkoutExercise, Set } from '../types/workout';
import { exportTemplatesToCSV, importTemplatesFromCSV, downloadCSV, readCSVFile } from '../utils/csvExport';
import { BUILTIN_WORKOUT_TEMPLATES, isBuiltinTemplate } from '../data/workoutTemplates';
import { findExerciseByName } from '../utils/exerciseNameMatcher';
import {
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
} from '../services/supabaseDataService';
import { convertWorkoutLogToTemplate } from '../utils/templateConverter';
import { SaveTemplateModal } from '../components/SaveTemplateModal';
import { useWorkoutTemplates, useAllWorkouts } from '../hooks/useWorkoutData';
import type { WorkoutLog } from '../types/workout';

function WorkoutLogger() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { theme } = useTheme();
  const accentColors = getAccentColors(theme);
  const selectedColors = getSelectedColors(theme);

  const {
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

  // REACT QUERY: Fetch templates and workouts with automatic caching
  const { data: templates = [] } = useWorkoutTemplates();
  const { data: allWorkouts = [] } = useAllWorkouts();
  const [templateExerciseNames, setTemplateExerciseNames] = useState<Map<string, Map<string, string>>>(new Map());
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null);
  const [previousWorkoutData, setPreviousWorkoutData] = useState<Map<string, Set[]>>(new Map());
  const [showPRCelebration, setShowPRCelebration] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detectedPRs, setDetectedPRs] = useState<any[]>([]);
  const [hasLoadedFromUrl, setHasLoadedFromUrl] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [savedWorkout, setSavedWorkout] = useState<WorkoutLog | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTemplateExerciseNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templates]);

  useEffect(() => {
    if (activeWorkout) {
      loadPreviousWorkoutData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWorkout?.exercises.length]);

  // Auto-load template from URL parameter
  useEffect(() => {
    const templateId = searchParams.get('templateId');
    if (templateId && !hasLoadedFromUrl && !isWorkoutActive && templates.length > 0) {
      setHasLoadedFromUrl(true);
      // Remove the parameter from URL
      searchParams.delete('templateId');
      setSearchParams(searchParams);

      // Find and load the template
      const template = [...templates, ...BUILTIN_WORKOUT_TEMPLATES].find(t => t.id === templateId);
      if (template) {
        handleStartFromTemplate(template);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, hasLoadedFromUrl, isWorkoutActive, templates]);

  async function loadPreviousWorkoutData() {
    if (!activeWorkout) return;

    const previousData = new Map();

    // Use React Query cached workouts (sorted by date descending)
    const sortedWorkouts = [...allWorkouts].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (const exercise of activeWorkout.exercises) {
      // Find the most recent workout that contains this exercise
      for (const workout of sortedWorkouts) {
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

    // Store the saved workout for potential template conversion
    if (result && result.workout) {
      setSavedWorkout(result.workout);
    }

    // Show PR celebration if any PRs were detected
    if (result && result.prs && result.prs.length > 0) {
      setDetectedPRs(result.prs);
      setShowPRCelebration(true);
    } else if (result && result.workout) {
      // No PRs - show save as template modal directly (optional)
      // Or just let them access it from Dashboard
      // For now, we'll just keep the workout saved so they can convert it later
    }
  }

  async function handleSaveAsTemplate(templateName: string) {
    if (!savedWorkout) return;

    try {
      const templateData = convertWorkoutLogToTemplate(savedWorkout, templateName);
      await createWorkoutTemplate(templateData);

      // Invalidate React Query cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['templates'] });

      // Close modal and reset state
      setShowSaveTemplateModal(false);
      setSavedWorkout(null);

      // Success feedback (optional: add toast notification here)
      alert(`Template "${templateName}" created successfully!`);
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  }

  function handleCancelWorkout() {
    cancelWorkout();
    setShowCancelConfirm(false);
  }

  async function handleSaveTemplate(name: string, exercises: WorkoutExercise[], templateId?: string) {
    try {
      if (templateId && isBuiltinTemplate(templateId)) {
        // Copy-on-modify: Create new user template instead of modifying built-in
        await createWorkoutTemplate({
          name,
          exercises,
          isActive: true,
        });
      } else if (templateId) {
        // Update existing user template
        await updateWorkoutTemplate(templateId, {
          name,
          exercises,
        });
      } else {
        // Create new template
        await createWorkoutTemplate({
          name,
          exercises,
          isActive: true,
        });
      }

      // Invalidate React Query cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['templates'] });

      setShowTemplateBuilder(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    }
  }

  async function handleStartFromTemplate(template: Pick<WorkoutTemplate, 'id' | 'name' | 'exercises'>) {
    // Build the complete workout structure with all exercises and sets
    const exercises = [];

    // Use React Query cached workouts (sorted by date descending)
    const recentWorkouts = [...allWorkouts].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    for (let i = 0; i < template.exercises.length; i++) {
      const templateEx = template.exercises[i];

      // For built-in templates, exerciseId is actually the exercise name
      // We need to look it up by name using fuzzy matching
      let exercise;
      if (isBuiltinTemplate(template.id)) {
        const allExercises = await db.exercises.toArray();
        exercise = findExerciseByName(templateEx.exerciseId, allExercises);
        if (!exercise) {
          console.warn(`Built-in template exercise "${templateEx.exerciseId}" not found in database even with fuzzy matching`);
          continue; // Skip this exercise
        }
      } else {
        exercise = await db.exercises.get(templateEx.exerciseId);
      }

      if (exercise) {
        // Find previous workout data for this exercise
        let previousSets: Set[] = [];
        for (const workout of recentWorkouts) {
          const exerciseData = workout.exercises.find((ex) => ex.exerciseId === exercise.id);
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
      try {
        await deleteWorkoutTemplate(templateId);
        // Invalidate React Query cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['templates'] });
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template. Please try again.');
      }
    }
  }

  async function handleExportTemplates() {
    if (templates.length === 0) {
      alert('No templates to export');
      return;
    }

    const csv = await exportTemplatesToCSV(templates);
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

      // Get all exercises from local database to remap IDs
      const allExercises = await db.exercises.toArray();
      const exercisesByName = new Map(
        allExercises.map(ex => [ex.name.toLowerCase(), ex])
      );

      let skippedExercises = 0;

      // Use React Query cached templates to check for existing IDs
      const existingIds = new Set(templates.map(t => t.id));

      for (const template of importedTemplates) {
        // Check if template with same ID already exists
        if (existingIds.has(template.id)) {
          // Update ID to avoid conflicts
          template.id = uuidv4();
        }

        // Remap exercise IDs by looking up exercises by name
        const remappedExercises = [];
        for (const exercise of template.exercises) {
          const exerciseName = (exercise as { exerciseName?: string }).exerciseName;
          const localExercise = exerciseName ? exercisesByName.get(exerciseName.toLowerCase()) : undefined;

          if (localExercise) {
            // Found matching exercise - use local database ID
            remappedExercises.push({
              ...exercise,
              exerciseId: localExercise.id,
            });
          } else {
            // Exercise not found in local database
            console.warn(`Exercise "${exerciseName}" not found in database`);
            skippedExercises++;
          }
        }

        // Only add template if it has at least one valid exercise
        if (remappedExercises.length > 0) {
          template.exercises = remappedExercises;
          // Save to Supabase (PRIMARY SOURCE OF TRUTH)
          await createWorkoutTemplate({
            name: template.name,
            description: template.description,
            exercises: remappedExercises,
            isActive: template.isActive ?? true,
            schedule: template.schedule,
          });
        }
      }

      // Invalidate React Query cache to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['templates'] });

      if (skippedExercises > 0) {
        alert(
          `Successfully imported ${importedTemplates.length} template(s)!\n\n` +
          `Note: ${skippedExercises} exercise(s) were skipped because they don't exist in your exercise library.`
        );
      } else {
        alert(`Successfully imported ${importedTemplates.length} template(s)!`);
      }
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
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-primary">Start Workout</h1>
          <p className="text-sm text-secondary">Choose a template or start a blank workout</p>
        </div>

        {/* Quick Start */}
        <button
          onClick={handleStartWorkout}
          className="w-full rounded-lg transition-all flex items-center justify-center gap-3 py-6"
          style={{
            background: theme === 'light'
              ? 'linear-gradient(180deg, #FAFAFA 0%, #E4D2FF 100%)'
              : theme === 'amoled'
                ? 'linear-gradient(180deg, #1A1A1A 0%, #2A2A2A 100%)'
                : 'linear-gradient(180deg, #2D2640 0%, #3D3650 100%)',
            border: `1px solid ${accentColors.border}`
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
        >
          <Play style={{ color: accentColors.primary }} size={24} />
          <span className="text-lg font-semibold" style={{ color: accentColors.primary }}>Start Empty Workout</span>
        </button>

        {/* Templates Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary">Workout Templates</h2>
            <div className="flex items-center gap-3">
              {/* Template management buttons - only for authenticated users */}
              {user && (
                <>
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
                </>
              )}

              {/* Guest mode - show sign-in prompt */}
              {!user && (
                <p className="text-xs text-muted italic">
                  Sign in to create and manage templates
                </p>
              )}
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

          {templates.length === 0 && BUILTIN_WORKOUT_TEMPLATES.length === 0 ? (
            <div
              className="rounded-lg text-center py-12"
              style={{
                backgroundColor: 'var(--surface-elevated)',
                border: '2px dashed var(--border-subtle)'
              }}
            >
              <p className="text-primary">No templates yet</p>
              <p className="text-sm mt-2 text-secondary">Create your first workout template to get started faster</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Templates */}
              {templates.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wide">Your Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template) => (
                      <div key={template.id} className="card-elevated flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-primary">{template.name}</h3>
                            <p className="text-sm text-secondary mt-1">
                              {template.exercises.length} exercises
                            </p>
                          </div>
                          {/* Edit/Delete buttons - only for authenticated users */}
                          {user && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingTemplate(template);
                                  setShowTemplateBuilder(true);
                                }}
                                className="transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = accentColors.primary;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = 'var(--text-muted)';
                                }}
                                title="Edit template"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#DC2626';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = 'var(--text-muted)';
                                }}
                                title="Delete template"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Exercise Preview */}
                        <div className="space-y-1 mb-4 overflow-hidden transition-all duration-300 ease-in-out flex-1">
                          {(expandedTemplateId === template.id
                            ? template.exercises
                            : template.exercises.slice(0, 3)
                          ).map((ex, idx) => {
                            const exerciseName = templateExerciseNames.get(template.id)?.get(ex.exerciseId) || 'Loading...';
                            return (
                              <div key={idx} className="text-xs text-secondary flex items-center gap-2">
                                <Dumbbell size={12} className="flex-shrink-0" />
                                <span className="truncate">
                                  {exerciseName} - {ex.targetSets}x{ex.targetReps}
                                </span>
                              </div>
                            );
                          })}
                          {template.exercises.length > 3 && expandedTemplateId !== template.id && (
                            <button
                              onClick={() => setExpandedTemplateId(template.id)}
                              className="text-xs cursor-pointer transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                              }}
                            >
                              +{template.exercises.length - 3} more
                            </button>
                          )}
                          {template.exercises.length > 3 && expandedTemplateId === template.id && (
                            <button
                              onClick={() => setExpandedTemplateId(null)}
                              className="text-xs cursor-pointer transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                              }}
                            >
                              Show less
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleStartFromTemplate(template)}
                          className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2 mt-auto"
                        >
                          <Play size={16} />
                          Start Workout
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Divider */}
              {templates.length > 0 && BUILTIN_WORKOUT_TEMPLATES.length > 0 && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full" style={{ borderTop: '1px solid var(--border-subtle)' }}></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs uppercase tracking-wide" style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-muted)' }}>
                      Built-in Templates
                    </span>
                  </div>
                </div>
              )}

              {/* Built-in Templates */}
              {BUILTIN_WORKOUT_TEMPLATES.length > 0 && (
                <div>
                  {templates.length === 0 && (
                    <h3 className="text-sm font-semibold text-secondary mb-3 uppercase tracking-wide">Built-in Templates</h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {BUILTIN_WORKOUT_TEMPLATES.map((template) => (
                      <div key={template.id} className="card-elevated flex flex-col" style={{ borderColor: 'var(--border-subtle)' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-primary">{template.name}</h3>
                              <span className="text-[10px] px-2 py-0.5 rounded uppercase tracking-wide" style={{ backgroundColor: theme === 'amoled' ? 'rgba(212, 160, 23, 0.2)' : 'rgba(180, 130, 255, 0.2)', color: accentColors.primary }}>
                                Built-in
                              </span>
                            </div>
                            <p className="text-sm text-secondary mt-1">{template.description}</p>
                            <p className="text-xs text-muted mt-1">
                              {template.exercises.length} exercises
                            </p>
                          </div>
                          {/* Copy & modify button - only for authenticated users */}
                          {user && (
                            <button
                              onClick={() => {
                                setEditingTemplate(template as WorkoutTemplate);
                                setShowTemplateBuilder(true);
                              }}
                              className="transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = accentColors.primary;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                              }}
                              title="Copy & modify template"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                        </div>

                        {/* Exercise Preview */}
                        <div className="space-y-1 mb-4 overflow-hidden transition-all duration-300 ease-in-out flex-1">
                          {(expandedTemplateId === template.id
                            ? template.exercises
                            : template.exercises.slice(0, 3)
                          ).map((ex, idx) => (
                            <div key={idx} className="text-xs text-secondary flex items-center gap-2">
                              <Dumbbell size={12} className="flex-shrink-0" />
                              <span className="truncate">
                                {ex.exerciseId} - {ex.targetSets}x{ex.targetReps}
                              </span>
                            </div>
                          ))}
                          {template.exercises.length > 3 && expandedTemplateId !== template.id && (
                            <button
                              onClick={() => setExpandedTemplateId(template.id)}
                              className="text-xs cursor-pointer transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                              }}
                            >
                              +{template.exercises.length - 3} more
                            </button>
                          )}
                          {template.exercises.length > 3 && expandedTemplateId === template.id && (
                            <button
                              onClick={() => setExpandedTemplateId(null)}
                              className="text-xs cursor-pointer transition-colors"
                              style={{ color: 'var(--text-muted)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--text-secondary)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--text-muted)';
                              }}
                            >
                              Show less
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handleStartFromTemplate(template as WorkoutTemplate)}
                          className="w-full btn-primary py-2 text-sm flex items-center justify-center gap-2 mt-auto"
                        >
                          <Play size={16} />
                          Start Workout
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
      <div className="sticky top-0 z-10 backdrop-blur-sm pb-4" style={{ backgroundColor: 'var(--surface-primary-translucent, var(--surface-primary))', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl font-bold text-primary">{activeWorkout.name}</h1>
            <p className="text-sm text-secondary flex items-center gap-2">
              <Clock size={14} />
              {stats.duration} min
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleUnit}
              className="px-3 py-2 text-xs font-mono rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--surface-accent)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
              }}
              title="Toggle units"
            >
              {weightUnit}
            </button>
            <button
              onClick={() => setShowTimer(!showTimer)}
              className="px-3 py-2 text-xs rounded-lg transition-all"
              style={{
                backgroundColor: showTimer ? accentColors.primary : 'var(--surface-accent)',
                color: showTimer ? 'white' : 'var(--text-primary)',
                border: showTimer ? `1px solid ${accentColors.primary}` : '1px solid var(--border-subtle)'
              }}
              onMouseEnter={(e) => {
                if (!showTimer) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showTimer) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                }
              }}
              title="Toggle timer"
            >
              <Timer size={16} />
            </button>
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-1"
              style={{
                backgroundColor: 'var(--surface-accent)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
              }}
            >
              <X size={16} />
              Cancel
            </button>
            <button
              onClick={() => setShowSaveConfirm(true)}
              className="px-4 py-2 text-sm rounded-lg transition-all flex items-center gap-1"
              style={{
                backgroundColor: stats.completedSets === 0 || isSaving ? 'var(--surface-accent)' : selectedColors.background,
                color: stats.completedSets === 0 || isSaving ? 'var(--text-muted)' : selectedColors.text,
                border: stats.completedSets === 0 || isSaving ? '1px solid var(--border-subtle)' : `1px solid ${selectedColors.border}`,
                cursor: stats.completedSets === 0 || isSaving ? 'not-allowed' : 'pointer',
                opacity: stats.completedSets === 0 || isSaving ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (stats.completedSets > 0 && !isSaving) {
                  e.currentTarget.style.backgroundColor = accentColors.backgroundHover;
                }
              }}
              onMouseLeave={(e) => {
                if (stats.completedSets > 0 && !isSaving) {
                  e.currentTarget.style.backgroundColor = selectedColors.background;
                }
              }}
              disabled={stats.completedSets === 0 || isSaving}
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Finish'}
            </button>
          </div>
          {/* Warning when no sets completed */}
          {stats.completedSets === 0 && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
              Complete at least one set to save your workout
            </p>
          )}
        </div>

        {/* Timer (collapsible) */}
        {showTimer && (
          <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface-accent)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-secondary mb-1">Rest Timer</p>
                <p className={`text-2xl font-bold font-mono ${timeRemaining <= 10 && timerIsRunning ? 'text-red-400 animate-pulse' : 'text-primary'}`}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </p>
              </div>
              <div className="flex gap-2">
                {!timerIsRunning ? (
                  <button onClick={() => startTimer(90)} className="rounded px-4 py-2 text-sm transition-colors" style={{ backgroundColor: accentColors.primary, color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = accentColors.secondary} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = accentColors.primary}>
                    Start
                  </button>
                ) : (
                  <button onClick={pauseTimer} className="rounded px-4 py-2 text-sm transition-colors" style={{ backgroundColor: '#FFA500', color: 'white' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF8C00'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFA500'}>
                    Pause
                  </button>
                )}
                <button onClick={resetTimer} className="px-3 py-2 text-sm rounded transition-colors" style={{ backgroundColor: 'var(--surface-accent)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-accent)'}>Reset</button>
                <button onClick={skipTimer} className="px-3 py-2 text-sm rounded transition-colors" style={{ backgroundColor: 'var(--surface-accent)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-accent)'}>Skip</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--surface-accent)' }}>
            <p className="text-xs text-secondary">Exercises</p>
            <p className="text-lg font-bold text-primary">{stats.exerciseCount}</p>
          </div>
          <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--surface-accent)' }}>
            <p className="text-xs text-secondary">Sets</p>
            <p className="text-lg font-bold text-primary">{stats.completedSets}/{stats.totalSets}</p>
          </div>
          <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--surface-accent)' }}>
            <p className="text-xs text-secondary">Volume</p>
            <p className="text-lg font-bold text-primary">{stats.totalVolume.toFixed(0)} {weightUnit}</p>
          </div>
          <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--surface-accent)' }}>
            <p className="text-xs text-secondary">Duration</p>
            <p className="text-lg font-bold text-primary">{stats.duration}m</p>
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
                <h3 className="font-semibold text-lg text-primary">{exercise.exerciseName}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-secondary">
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
                      <span className="text-xs" style={{ color: accentColors.primary }}>
                        Last: {bestPrevSet.weight}{weightUnit} × {bestPrevSet.reps}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <button
                onClick={() => removeExercise(exercise.exerciseId)}
                className="transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Set Headers */}
            <div className="grid grid-cols-[minmax(2.5rem,auto),minmax(2rem,auto),minmax(4rem,1fr),minmax(4rem,1fr),minmax(3.5rem,1fr),minmax(2.5rem,auto),minmax(2.5rem,auto)] gap-1.5 sm:gap-2 px-2 pb-2 text-xs font-medium text-secondary">
              <div className="text-center">Type</div>
              <div className="text-center">Set</div>
              <div className="text-center">{weightUnit}</div>
              <div className="text-center">Reps</div>
              <div className="text-center text-[10px] sm:text-xs">RIR</div>
              <div></div>
              <div></div>
            </div>

            {/* Current Sets */}
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
              className="w-full mt-3 py-2 rounded-lg transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: 'var(--surface-accent)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
              }}
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
        className="w-full rounded-lg transition-all flex items-center justify-center gap-3 py-4"
        style={{
          backgroundColor: 'var(--surface-elevated)',
          border: '1px solid var(--border-subtle)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = accentColors.border;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <Plus style={{ color: accentColors.primary }} size={20} />
        <span className="font-semibold text-primary">Add Exercise</span>
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
            <div className="rounded-lg p-6 max-w-md w-full" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)' }}>
              <h2 className="text-xl font-bold mb-4 text-primary">Finish Workout?</h2>
              <p className="text-secondary mb-4">
                Save this workout with {stats.completedSets} completed sets and {stats.totalVolume.toFixed(0)} {weightUnit} total volume?
              </p>

              {/* Warning for incomplete sets */}
              {hasIncompleteSets && (
                <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'rgba(255, 165, 0, 0.15)', border: '1px solid rgba(255, 165, 0, 0.4)' }}>
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5">⚠️</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm mb-2" style={{ color: '#92400E' }}>
                        Warning: {incompleteSets.length} uncompleted set{incompleteSets.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs mb-2" style={{ color: '#78350F' }}>
                        These sets won't count toward your volume:
                      </p>
                      <ul className="text-xs list-disc list-inside space-y-1" style={{ color: '#78350F' }}>
                        {exercisesWithIncomplete.map((name, idx) => (
                          <li key={idx}>{name}</li>
                        ))}
                      </ul>
                      <p className="text-xs mt-2 italic" style={{ color: '#78350F' }}>
                        Click the checkmark (✓) on each set to mark it complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveConfirm(false)}
                  className="flex-1 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: 'var(--surface-accent)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    opacity: isSaving ? 0.5 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                    }
                  }}
                  disabled={isSaving}
                >
                  Keep Working
                </button>
                <button
                  onClick={handleSaveWorkout}
                  className="flex-1 py-2 rounded-lg font-semibold transition-all"
                  style={{
                    backgroundColor: isSaving ? 'var(--surface-accent)' : selectedColors.background,
                    color: isSaving ? 'var(--text-muted)' : selectedColors.text,
                    border: isSaving ? '1px solid var(--border-subtle)' : `1px solid ${selectedColors.border}`,
                    opacity: isSaving ? 0.5 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = accentColors.backgroundHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSaving) {
                      e.currentTarget.style.backgroundColor = selectedColors.background;
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save & Finish'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="rounded-lg p-6 max-w-md w-full" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)' }}>
            <h2 className="text-xl font-bold mb-4 text-red-400">Cancel Workout?</h2>
            <p className="text-secondary mb-6">
              This will discard your workout with {stats.completedSets} completed sets. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 rounded-lg font-semibold transition-all"
                style={{
                  backgroundColor: 'var(--surface-accent)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                }}
              >
                Keep Workout
              </button>
              <button
                onClick={handleCancelWorkout}
                className="flex-1 py-2 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: '#DC2626', color: 'white' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#B91C1C';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                }}
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
            <p className="text-center text-secondary mb-6">
              You just set {detectedPRs.length} new PR{detectedPRs.length > 1 ? 's' : ''}!
            </p>

            {/* PR List */}
            <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
              {detectedPRs.map((pr, index) => {
                const prIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
                  weight: TrendingUp,
                  reps: Zap,
                  volume: Dumbbell,
                  '1rm': Trophy,
                };
                const Icon = prIconMap[pr.type] || Trophy;

                const prTypeLabelMap: Record<string, string> = {
                  weight: 'Weight PR',
                  reps: 'Rep PR',
                  volume: 'Volume PR',
                  '1rm': '1RM PR',
                };
                const prTypeLabel = prTypeLabelMap[pr.type];

                return (
                  <div
                    key={index}
                    className="border border-primary-blue/30 rounded-lg p-4 animate-slideInLeft"
                    style={{ backgroundColor: 'var(--surface-accent)', animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon size={24} className="text-primary-blue mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-primary">{pr.exerciseName}</h3>
                          <span className="text-xs font-bold text-primary-yellow uppercase tracking-wide">
                            {prTypeLabel}
                          </span>
                        </div>
                        <div className="text-sm text-secondary">
                          {pr.type === 'weight' && (
                            <p>
                              <span className="text-primary-blue font-bold">{pr.weight}{weightUnit}</span> × {pr.reps} reps
                              {pr.previousRecord && (
                                <span className="text-muted ml-2">
                                  (+{(pr.improvement || 0).toFixed(1)}{weightUnit} from {pr.previousRecord}{weightUnit})
                                </span>
                              )}
                            </p>
                          )}
                          {pr.type === 'reps' && (
                            <p>
                              <span className="text-primary-blue font-bold">{pr.reps} reps</span> at {pr.weight}{weightUnit}
                              {pr.previousRecord && (
                                <span className="text-muted ml-2">
                                  (+{pr.improvement} reps from {pr.previousRecord})
                                </span>
                              )}
                            </p>
                          )}
                          {pr.type === 'volume' && (
                            <p>
                              <span className="text-primary-blue font-bold">{pr.value.toFixed(0)} {weightUnit}</span> single-set volume
                              <span className="text-muted ml-2">
                                ({pr.weight}{weightUnit} × {pr.reps})
                              </span>
                              {pr.previousRecord && (
                                <span className="text-muted ml-2">
                                  (+{(pr.improvement || 0).toFixed(0)}{weightUnit})
                                </span>
                              )}
                            </p>
                          )}
                          {pr.type === '1rm' && (
                            <p>
                              <span className="text-primary-blue font-bold">{pr.value.toFixed(1)}{weightUnit}</span> estimated 1RM
                              <span className="text-muted ml-2">
                                ({pr.weight}{weightUnit} × {pr.reps})
                              </span>
                              {pr.previousRecord && (
                                <span className="text-muted ml-2">
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPRCelebration(false);
                  if (savedWorkout) {
                    setShowSaveTemplateModal(true);
                  }
                }}
                className="flex-1 btn-secondary py-3 text-sm font-semibold"
              >
                Save as Template
              </button>
              <button
                onClick={() => {
                  setShowPRCelebration(false);
                  setSavedWorkout(null);
                }}
                className="flex-1 btn-primary py-3 text-lg font-semibold"
              >
                Let's Go! 💪
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {showSaveTemplateModal && savedWorkout && (
        <SaveTemplateModal
          defaultName={savedWorkout.name}
          onSave={handleSaveAsTemplate}
          onClose={() => {
            setShowSaveTemplateModal(false);
            setSavedWorkout(null);
          }}
        />
      )}
    </div>
  );
}

export default WorkoutLogger;
