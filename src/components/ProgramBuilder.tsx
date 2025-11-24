import { useState, useEffect } from 'react';
import { X, Trash2, Calendar, Save, Copy } from 'lucide-react';
import { db } from '../services/database';
import { getWorkoutTemplates } from '../services/supabaseDataService';
import type { Program, ProgramWeek, ScheduledWorkout, WorkoutTemplate, ProgramGoal } from '../types/workout';
import { v4 as uuidv4 } from 'uuid';
import { BUILTIN_WORKOUT_TEMPLATES } from '../data/workoutTemplates';
import { useTheme } from '../contexts/ThemeContext';
import { getAccentColors, getSelectedColors } from '../utils/themeHelpers';

interface ProgramBuilderProps {
  onClose: () => void;
  onSave: () => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ProgramBuilder({ onClose, onSave }: ProgramBuilderProps) {
  const { theme } = useTheme();
  const accentColors = getAccentColors(theme);
  const selectedColors = getSelectedColors(theme);

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [programName, setProgramName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(4);
  const [goal, setGoal] = useState<ProgramGoal>('hypertrophy');
  const [weeks, setWeeks] = useState<ProgramWeek[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [selectedWeeksToCopy, setSelectedWeeksToCopy] = useState<number[]>([]);

  useEffect(() => {
    loadTemplates();
    initializeWeeks();
  }, []);

  async function loadTemplates() {
    try {
      const userTemplates = await getWorkoutTemplates();
      // Merge user templates with built-in templates
      const allTemplates = [...userTemplates, ...BUILTIN_WORKOUT_TEMPLATES as WorkoutTemplate[]];
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Fall back to just built-in templates if Supabase fails
      setTemplates(BUILTIN_WORKOUT_TEMPLATES as WorkoutTemplate[]);
    }
  }

  function initializeWeeks() {
    const initialWeeks: ProgramWeek[] = [];
    for (let i = 1; i <= 4; i++) {
      initialWeeks.push({
        weekNumber: i,
        workouts: [],
        name: '',
        notes: '',
      });
    }
    setWeeks(initialWeeks);
  }

  function handleDurationChange(newDuration: number) {
    setDuration(newDuration);
    const newWeeks = [...weeks];

    // Add weeks if increasing
    while (newWeeks.length < newDuration) {
      newWeeks.push({
        weekNumber: newWeeks.length + 1,
        workouts: [],
        name: '',
        notes: '',
      });
    }

    // Remove weeks if decreasing
    while (newWeeks.length > newDuration) {
      newWeeks.pop();
    }

    setWeeks(newWeeks);
  }

  function addWorkoutToDay(weekIndex: number, dayOfWeek: number, templateId: string) {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newWeeks = [...weeks];
    const week = newWeeks[weekIndex];

    // Remove existing workout on this day if any
    week.workouts = week.workouts.filter(w => w.dayOfWeek !== dayOfWeek);

    // Add new workout
    week.workouts.push({
      dayOfWeek,
      templateId: template.id,
      templateName: template.name,
    });

    setWeeks(newWeeks);
  }

  function removeWorkoutFromDay(weekIndex: number, dayOfWeek: number) {
    const newWeeks = [...weeks];
    newWeeks[weekIndex].workouts = newWeeks[weekIndex].workouts.filter(
      w => w.dayOfWeek !== dayOfWeek
    );
    setWeeks(newWeeks);
  }

  function updateWeekDetails(weekIndex: number, field: 'name' | 'notes', value: string) {
    const newWeeks = [...weeks];
    newWeeks[weekIndex][field] = value;
    setWeeks(newWeeks);
  }

  function toggleWeekSelection(weekNum: number) {
    if (selectedWeeksToCopy.includes(weekNum)) {
      setSelectedWeeksToCopy(selectedWeeksToCopy.filter(w => w !== weekNum));
    } else {
      setSelectedWeeksToCopy([...selectedWeeksToCopy, weekNum]);
    }
  }

  function selectWeekRange(start: number, end: number) {
    const range: number[] = [];
    for (let i = start; i <= end; i++) {
      if (i !== currentWeek) { // Don't copy to itself
        range.push(i);
      }
    }
    setSelectedWeeksToCopy(range);
  }

  function copyCurrentWeekToSelected() {
    if (selectedWeeksToCopy.length === 0) {
      alert('Please select at least one week to copy to');
      return;
    }

    const newWeeks = [...weeks];
    const sourceWeek = newWeeks[currentWeek - 1];

    selectedWeeksToCopy.forEach(weekNum => {
      const targetIndex = weekNum - 1;
      newWeeks[targetIndex].workouts = [...sourceWeek.workouts];
    });

    setWeeks(newWeeks);
    setShowCopyModal(false);
    setSelectedWeeksToCopy([]);
  }

  function getWorkoutForDay(weekIndex: number, dayOfWeek: number): ScheduledWorkout | undefined {
    return weeks[weekIndex]?.workouts.find(w => w.dayOfWeek === dayOfWeek);
  }

  function calculateDaysPerWeek(): number {
    // Calculate based on first week
    return weeks[0]?.workouts.length || 0;
  }

  async function handleSave() {
    if (!programName.trim()) {
      alert('Please enter a program name');
      return;
    }

    if (weeks.every(w => w.workouts.length === 0)) {
      alert('Please add at least one workout to your program');
      return;
    }

    const newProgram: Program = {
      id: uuidv4(),
      userId: 'default-user',
      name: programName,
      description: description || `Custom ${duration}-week ${goal} program`,
      duration,
      daysPerWeek: calculateDaysPerWeek(),
      weeks,
      goal,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.programs.add(newProgram);
    onSave();
    onClose();
  }

  const currentWeekData = weeks[currentWeek - 1];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col"
        style={{
          backgroundColor: 'var(--surface-elevated)',
          border: '1.5px solid var(--border-subtle)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <Calendar style={{ color: accentColors.primary }} />
            Create Custom Program
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--surface-accent)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Program Details */}
        <div className="space-y-4 mb-6 pb-6" style={{ borderBottom: '1.5px solid var(--border-subtle)' }}>
          <div>
            <label className="block text-sm font-medium mb-2 text-primary">
              Program Name *
            </label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g., My Custom PPL"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-primary"
              style={{
                backgroundColor: 'var(--surface-accent)',
                border: '1px solid var(--border-subtle)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'amoled' ? 'rgba(212, 160, 23, 0.4)' : 'rgba(180, 130, 255, 0.4)'}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-primary">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your program..."
              rows={2}
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all resize-none text-primary"
              style={{
                backgroundColor: 'var(--surface-accent)',
                border: '1px solid var(--border-subtle)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'amoled' ? 'rgba(212, 160, 23, 0.4)' : 'rgba(180, 130, 255, 0.4)'}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-primary">
                Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-primary"
                style={{
                  backgroundColor: 'var(--surface-accent)',
                  border: '1px solid var(--border-subtle)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'amoled' ? 'rgba(212, 160, 23, 0.4)' : 'rgba(180, 130, 255, 0.4)'}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as ProgramGoal)}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-primary"
                style={{
                  backgroundColor: 'var(--surface-accent)',
                  border: '1px solid var(--border-subtle)'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'amoled' ? 'rgba(212, 160, 23, 0.4)' : 'rgba(180, 130, 255, 0.4)'}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <option value="strength">Strength</option>
                <option value="hypertrophy">Hypertrophy</option>
                <option value="endurance">Endurance</option>
                <option value="general">General Fitness</option>
              </select>
            </div>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="mb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {weeks.map((week) => (
              <button
                key={week.weekNumber}
                onClick={() => setCurrentWeek(week.weekNumber)}
                className="px-4 py-2 rounded-lg whitespace-nowrap transition-all"
                style={{
                  backgroundColor: currentWeek === week.weekNumber
                    ? accentColors.primary
                    : 'var(--surface-accent)',
                  color: currentWeek === week.weekNumber
                    ? '#FFFFFF'
                    : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (currentWeek !== week.weekNumber) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentWeek !== week.weekNumber) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                  }
                }}
              >
                Week {week.weekNumber}
                {week.workouts.length > 0 && (
                  <span className="ml-2 text-xs opacity-75">({week.workouts.length})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Current Week Editor */}
        {currentWeekData && (
          <div className="space-y-4 mb-6">
            {/* Week Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Week Name (optional)
                </label>
                <input
                  type="text"
                  value={currentWeekData.name || ''}
                  onChange={(e) => updateWeekDetails(currentWeek - 1, 'name', e.target.value)}
                  placeholder="e.g., Deload Week"
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm text-primary"
                  style={{
                    backgroundColor: 'var(--surface-accent)',
                    border: '1px solid var(--border-subtle)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'amoled' ? 'rgba(212, 160, 23, 0.4)' : 'rgba(180, 130, 255, 0.4)'}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Week Notes (optional)
                </label>
                <input
                  type="text"
                  value={currentWeekData.notes || ''}
                  onChange={(e) => updateWeekDetails(currentWeek - 1, 'notes', e.target.value)}
                  placeholder="e.g., Reduce weight by 20%"
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all text-sm text-primary"
                  style={{
                    backgroundColor: 'var(--surface-accent)',
                    border: '1px solid var(--border-subtle)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'amoled' ? 'rgba(212, 160, 23, 0.4)' : 'rgba(180, 130, 255, 0.4)'}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Day Schedule */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-primary">Weekly Schedule</h3>
                <p className="text-xs text-muted italic">Days without workouts = Rest Days</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {DAY_NAMES.map((dayName, dayOfWeek) => {
                  const workout = getWorkoutForDay(currentWeek - 1, dayOfWeek);

                  return (
                    <div
                      key={dayOfWeek}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{
                        backgroundColor: 'var(--surface-accent)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div className="w-24 text-sm font-semibold text-primary">
                        {dayName}
                      </div>

                      {workout ? (
                        <div
                          className="flex-1 flex items-center justify-between rounded px-3 py-2"
                          style={{
                            backgroundColor: theme === 'amoled' ? 'rgba(212, 160, 23, 0.12)' : 'rgba(180, 130, 255, 0.12)',
                            border: theme === 'amoled' ? '1px solid rgba(212, 160, 23, 0.4)' : '1px solid rgba(180, 130, 255, 0.4)'
                          }}
                        >
                          <span className="text-sm font-medium text-primary">
                            {workout.templateName}
                          </span>
                          <button
                            onClick={() => removeWorkoutFromDay(currentWeek - 1, dayOfWeek)}
                            className="p-1 rounded transition-colors"
                            style={{ color: '#EF4444' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm text-secondary italic px-3">Rest Day</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addWorkoutToDay(currentWeek - 1, dayOfWeek, e.target.value);
                                e.target.value = ''; // Reset select
                              }
                            }}
                            className="flex-1 px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 transition-all text-primary"
                            style={{
                              backgroundColor: 'var(--surface-hover)',
                              border: '1px solid var(--border-subtle)'
                            }}
                            onFocus={(e) => {
                              e.currentTarget.style.boxShadow = `0 0 0 2px ${theme === 'amoled' ? 'rgba(212, 160, 23, 0.4)' : 'rgba(180, 130, 255, 0.4)'}`;
                            }}
                            onBlur={(e) => {
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            <option value="">+ Add Workout</option>
                            {(() => {
                              const userTemplates = templates.filter(t => !t.id.startsWith('builtin-'));
                              const builtinTemplates = templates.filter(t => t.id.startsWith('builtin-'));

                              return (
                                <>
                                  {userTemplates.length > 0 && (
                                    <optgroup label="Your Templates">
                                      {userTemplates.map(template => (
                                        <option key={template.id} value={template.id}>
                                          {template.name}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                  {builtinTemplates.length > 0 && (
                                    <optgroup label="Built-in Templates">
                                      {builtinTemplates.map(template => (
                                        <option key={template.id} value={template.id}>
                                          {template.name}
                                        </option>
                                      ))}
                                    </optgroup>
                                  )}
                                </>
                              );
                            })()}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Copy Week Buttons */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => {
              if (currentWeek < weeks.length) {
                const newWeeks = [...weeks];
                newWeeks[currentWeek].workouts = [...currentWeekData.workouts];
                setWeeks(newWeeks);
                setCurrentWeek(currentWeek + 1);
              }
            }}
            disabled={currentWeek >= weeks.length}
            className="text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            style={{ color: currentWeek >= weeks.length ? 'var(--text-muted)' : accentColors.primary }}
            onMouseEnter={(e) => {
              if (currentWeek < weeks.length) {
                e.currentTarget.style.color = accentColors.secondary;
              }
            }}
            onMouseLeave={(e) => {
              if (currentWeek < weeks.length) {
                e.currentTarget.style.color = accentColors.primary;
              }
            }}
          >
            <Copy size={14} />
            Quick Copy to Week {currentWeek + 1}
          </button>
          <span className="text-secondary">|</span>
          <button
            onClick={() => {
              setSelectedWeeksToCopy([]);
              setShowCopyModal(true);
            }}
            className="text-sm transition-colors flex items-center gap-1"
            style={{ color: accentColors.primary }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = accentColors.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = accentColors.primary;
            }}
          >
            <Copy size={14} />
            Copy to Multiple Weeks...
          </button>
        </div>

        {/* Helper Text */}
        {templates.length === 0 && (
          <p className="mt-4 text-sm text-muted text-center">
            You need to create workout templates first before building a program.
          </p>
        )}
        </div>

        {/* Sticky Footer Actions */}
        <div className="flex gap-3 p-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md font-semibold transition-all"
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
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 rounded-md font-semibold transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: selectedColors.background,
              color: selectedColors.text,
              border: `1px solid ${selectedColors.border}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = accentColors.backgroundHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = selectedColors.background;
            }}
          >
            <Save size={18} />
            Save Program
          </button>
        </div>
      </div>

      {/* Copy to Multiple Weeks Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                <Copy style={{ color: accentColors.primary }} />
                Copy Week {currentWeek} to Other Weeks
              </h3>
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setSelectedWeeksToCopy([]);
                }}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--surface-accent)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-secondary mb-4">
              Select which weeks you want to copy Week {currentWeek}'s schedule to.
              This will overwrite any existing workouts in the selected weeks.
            </p>

            {/* Quick Range Selectors */}
            <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <p className="text-xs text-muted mb-2">Quick Select:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => selectWeekRange(currentWeek + 1, Math.min(currentWeek + 3, weeks.length))}
                  className="text-xs px-3 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-accent)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                  }}
                >
                  Next 3 Weeks
                </button>
                <button
                  onClick={() => selectWeekRange(currentWeek + 1, weeks.length)}
                  className="text-xs px-3 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-accent)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                  }}
                >
                  All Remaining Weeks
                </button>
                <button
                  onClick={() => selectWeekRange(1, currentWeek - 1)}
                  disabled={currentWeek === 1}
                  className="text-xs px-3 py-1 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: currentWeek === 1 ? 'var(--surface-accent)' : 'var(--surface-accent)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    if (currentWeek !== 1) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentWeek !== 1) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                    }
                  }}
                >
                  All Previous Weeks
                </button>
                <button
                  onClick={() => setSelectedWeeksToCopy([])}
                  className="text-xs px-3 py-1 rounded transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-accent)',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>

            {/* Individual Week Selection */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 mb-6">
              {weeks.map((week) => {
                const weekNum = week.weekNumber;
                const isCurrentWeek = weekNum === currentWeek;
                const isSelected = selectedWeeksToCopy.includes(weekNum);

                return (
                  <button
                    key={weekNum}
                    onClick={() => !isCurrentWeek && toggleWeekSelection(weekNum)}
                    disabled={isCurrentWeek}
                    className="p-3 rounded-lg text-sm font-medium transition-all"
                    style={{
                      backgroundColor: isCurrentWeek
                        ? 'var(--surface-hover)'
                        : isSelected
                          ? accentColors.primary
                          : 'var(--surface-hover)',
                      color: isCurrentWeek
                        ? 'var(--text-muted)'
                        : isSelected
                          ? '#FFFFFF'
                          : 'var(--text-secondary)',
                      border: isSelected
                        ? `2px solid ${accentColors.primary}`
                        : '2px solid transparent',
                      cursor: isCurrentWeek ? 'not-allowed' : 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentWeek && !isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentWeek && !isSelected) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      }
                    }}
                  >
                    <div className="text-xs opacity-75">Week</div>
                    <div className="text-lg">{weekNum}</div>
                    {week.workouts.length > 0 && (
                      <div className="text-xs opacity-75 mt-1">
                        ({week.workouts.length} days)
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selection Summary */}
            <div className="mb-4 p-3 rounded"
              style={{
                backgroundColor: 'var(--surface-accent)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <p className="text-sm">
                <span className="text-secondary">Selected weeks: </span>
                <span className="text-primary font-medium">
                  {selectedWeeksToCopy.length === 0
                    ? 'None'
                    : selectedWeeksToCopy.sort((a, b) => a - b).join(', ')
                  }
                </span>
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setSelectedWeeksToCopy([]);
                }}
                className="flex-1 py-2 rounded-md font-semibold transition-all"
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
                Cancel
              </button>
              <button
                onClick={copyCurrentWeekToSelected}
                disabled={selectedWeeksToCopy.length === 0}
                className="flex-1 py-2 rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: selectedColors.background,
                  color: selectedColors.text,
                  border: `1px solid ${selectedColors.border}`,
                  opacity: selectedWeeksToCopy.length === 0 ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (selectedWeeksToCopy.length > 0) {
                    e.currentTarget.style.backgroundColor = accentColors.backgroundHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedWeeksToCopy.length > 0) {
                    e.currentTarget.style.backgroundColor = selectedColors.background;
                  }
                }}
              >
                <Copy size={18} />
                Copy to {selectedWeeksToCopy.length} Week{selectedWeeksToCopy.length !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
