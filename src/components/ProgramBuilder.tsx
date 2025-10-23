import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, Save, Copy } from 'lucide-react';
import { db } from '../services/database';
import type { Program, ProgramWeek, ScheduledWorkout, WorkoutTemplate, ProgramGoal } from '../types/workout';
import { v4 as uuidv4 } from 'uuid';
import { BUILTIN_WORKOUT_TEMPLATES } from '../data/workoutTemplates';

interface ProgramBuilderProps {
  onClose: () => void;
  onSave: () => void;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function ProgramBuilder({ onClose, onSave }: ProgramBuilderProps) {
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
    const userTemplates = await db.workoutTemplates.toArray();
    // Merge user templates with built-in templates
    const allTemplates = [...userTemplates, ...BUILTIN_WORKOUT_TEMPLATES as any[]];
    setTemplates(allTemplates);
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
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="text-primary-blue" />
            Create Custom Program
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Program Details */}
        <div className="space-y-4 mb-6 pb-6 border-b border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Program Name *
            </label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g., My Custom PPL"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-blue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your program..."
              rows={2}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-blue resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                min="1"
                max="52"
                value={duration}
                onChange={(e) => handleDurationChange(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-blue"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as ProgramGoal)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-blue"
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
            {weeks.map((week, idx) => (
              <button
                key={week.weekNumber}
                onClick={() => setCurrentWeek(week.weekNumber)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  currentWeek === week.weekNumber
                    ? 'bg-primary-blue text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Week Name (optional)
                </label>
                <input
                  type="text"
                  value={currentWeekData.name || ''}
                  onChange={(e) => updateWeekDetails(currentWeek - 1, 'name', e.target.value)}
                  placeholder="e.g., Deload Week"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-blue text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Week Notes (optional)
                </label>
                <input
                  type="text"
                  value={currentWeekData.notes || ''}
                  onChange={(e) => updateWeekDetails(currentWeek - 1, 'notes', e.target.value)}
                  placeholder="e.g., Reduce weight by 20%"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-blue text-sm"
                />
              </div>
            </div>

            {/* Day Schedule */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-300">Weekly Schedule</h3>
                <p className="text-xs text-gray-500 italic">Days without workouts = Rest Days</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {DAY_NAMES.map((dayName, dayOfWeek) => {
                  const workout = getWorkoutForDay(currentWeek - 1, dayOfWeek);

                  return (
                    <div
                      key={dayOfWeek}
                      className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700"
                    >
                      <div className="w-24 text-sm font-medium text-gray-300">
                        {dayName}
                      </div>

                      {workout ? (
                        <div className="flex-1 flex items-center justify-between bg-primary-blue/20 border border-primary-blue/50 rounded px-3 py-2">
                          <span className="text-sm font-medium text-white">
                            {workout.templateName}
                          </span>
                          <button
                            onClick={() => removeWorkoutFromDay(currentWeek - 1, dayOfWeek)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex-1 flex items-center gap-2">
                          <span className="text-sm text-gray-500 italic px-3">Rest Day</span>
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                addWorkoutToDay(currentWeek - 1, dayOfWeek, e.target.value);
                                e.target.value = ''; // Reset select
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:border-primary-blue"
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
            className="text-sm text-primary-blue hover:text-primary-blue/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Copy size={14} />
            Quick Copy to Week {currentWeek + 1}
          </button>
          <span className="text-gray-600">|</span>
          <button
            onClick={() => {
              setSelectedWeeksToCopy([]);
              setShowCopyModal(true);
            }}
            className="text-sm text-primary-green hover:text-primary-green/80 transition-colors flex items-center gap-1"
          >
            <Copy size={14} />
            Copy to Multiple Weeks...
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary py-2"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 btn-primary py-2 flex items-center justify-center gap-2"
          >
            <Save size={18} />
            Save Program
          </button>
        </div>

        {/* Helper Text */}
        {templates.length === 0 && (
          <p className="mt-4 text-sm text-gray-500 text-center">
            You need to create workout templates first before building a program.
          </p>
        )}
      </div>

      {/* Copy to Multiple Weeks Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Copy className="text-primary-green" />
                Copy Week {currentWeek} to Other Weeks
              </h3>
              <button
                onClick={() => {
                  setShowCopyModal(false);
                  setSelectedWeeksToCopy([]);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Select which weeks you want to copy Week {currentWeek}'s schedule to.
              This will overwrite any existing workouts in the selected weeks.
            </p>

            {/* Quick Range Selectors */}
            <div className="mb-4 pb-4 border-b border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Quick Select:</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => selectWeekRange(currentWeek + 1, Math.min(currentWeek + 3, weeks.length))}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  Next 3 Weeks
                </button>
                <button
                  onClick={() => selectWeekRange(currentWeek + 1, weeks.length)}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  All Remaining Weeks
                </button>
                <button
                  onClick={() => selectWeekRange(1, currentWeek - 1)}
                  disabled={currentWeek === 1}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  All Previous Weeks
                </button>
                <button
                  onClick={() => setSelectedWeeksToCopy([])}
                  className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
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
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all
                      ${isCurrentWeek
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : isSelected
                          ? 'bg-primary-green text-white border-2 border-primary-green'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-transparent'
                      }
                    `}
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
            <div className="mb-4 p-3 bg-gray-900/50 rounded border border-gray-700">
              <p className="text-sm">
                <span className="text-gray-400">Selected weeks: </span>
                <span className="text-white font-medium">
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
                className="flex-1 btn-secondary py-2"
              >
                Cancel
              </button>
              <button
                onClick={copyCurrentWeekToSelected}
                disabled={selectedWeeksToCopy.length === 0}
                className="flex-1 btn-primary py-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
