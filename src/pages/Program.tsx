import { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Play, X, Check, TrendingUp, CheckCircle2, Wrench, Trash2 } from 'lucide-react';
import { db } from '../services/database';
import type { Program, WorkoutTemplate, WorkoutLog } from '../types/workout';
import { PROGRAM_TEMPLATES } from '../data/programTemplates';
import { useNavigate } from 'react-router-dom';
import { ProgramBuilder } from '../components/ProgramBuilder';
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getWorkoutTemplates,
  getWorkoutLogs,
} from '../services/supabaseDataService';

export function Program() {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgram] = useState<Program | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showTemplateBrowser, setShowTemplateBrowser] = useState(false);
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadPrograms();
    loadTemplates();
    loadWorkoutLogs();
  }, []);

  async function loadPrograms() {
    try {
      const allPrograms = await getPrograms();
      setPrograms(allPrograms);

      const active = allPrograms.find(p => p.isActive);
      setActiveProgram(active || null);
    } catch (error) {
      console.error('Error loading programs:', error);
      setPrograms([]);
    }
  }

  async function loadTemplates() {
    try {
      const allTemplates = await getWorkoutTemplates();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates([]);
    }
  }

  async function loadWorkoutLogs() {
    try {
      const logs = await getWorkoutLogs();
      setWorkoutLogs(logs);
    } catch (error) {
      console.error('Error loading workout logs:', error);
      setWorkoutLogs([]);
    }
  }

  async function handleActivateTemplate(templateId: string) {
    const template = PROGRAM_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    try {
      // Deactivate any active programs
      const activePrograms = programs.filter(p => p.isActive);
      for (const prog of activePrograms) {
        await updateProgram(prog.id, { isActive: false });
      }

      // Create new program from template (factory no longer needs userId)
      const newProgram = template.factory('temp-user-id'); // userId will be set by createProgram
      newProgram.isActive = true;

      // Set start date to the beginning of current week (Sunday)
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      newProgram.startDate = startOfWeek;

      await createProgram(newProgram);
      await loadPrograms();
      setShowTemplateBrowser(false);
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error activating template:', error);
      alert('Failed to activate program. Please try again.');
    }
  }

  async function handleActivateProgram(programId: string) {
    try {
      // Deactivate any active programs
      const activePrograms = programs.filter(p => p.isActive);
      for (const prog of activePrograms) {
        await updateProgram(prog.id, { isActive: false });
      }

      // Set start date to the beginning of current week (Sunday)
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Activate the selected program
      await updateProgram(programId, {
        isActive: true,
        startDate: startOfWeek
      });
      await loadPrograms();
    } catch (error) {
      console.error('Error activating program:', error);
      alert('Failed to activate program. Please try again.');
    }
  }

  async function handleDeactivateProgram(programId: string) {
    try {
      await updateProgram(programId, { isActive: false });
      await loadPrograms();
    } catch (error) {
      console.error('Error deactivating program:', error);
      alert('Failed to deactivate program. Please try again.');
    }
  }

  async function handleDeleteProgram(programId: string) {
    if (confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      try {
        await deleteProgram(programId);
        await loadPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
        alert('Failed to delete program. Please try again.');
      }
    }
  }

  // Calendar helpers
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get scheduled workout for a specific day
  function getScheduledWorkout(day: number) {
    if (!activeProgram || !activeProgram.startDate) return null;

    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    date.setHours(0, 0, 0, 0);
    const dayOfWeek = date.getDay();

    // Calculate which week of the program we're in
    const startDate = new Date(activeProgram.startDate);
    startDate.setHours(0, 0, 0, 0);

    // Don't show workouts for dates before the program start
    if (date < startDate) return null;

    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffDays / 7) + 1;

    if (weekNumber > activeProgram.duration) return null; // Program finished

    const programWeek = activeProgram.weeks.find(w => w.weekNumber === weekNumber);
    if (!programWeek) return null;

    const scheduledWorkout = programWeek.workouts.find(w => w.dayOfWeek === dayOfWeek);
    return scheduledWorkout || null;
  }

  // Check if a scheduled workout on a specific day has been completed
  function isWorkoutCompleted(day: number): boolean {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateString = date.toDateString();

    // Check if there's a workout log for this date
    return workoutLogs.some(log => {
      const logDate = new Date(log.date);
      return logDate.toDateString() === dateString;
    });
  }

  function isToday(day: number) {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  }

  function isPastDay(day: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return dayDate < today;
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  function handleStartWorkout(templateId: string, templateName: string) {
    // Navigate to workout logger with template ID
    navigate(`/workout?templateId=${templateId}`);
  }

  // Calculate program progress
  function calculateProgress() {
    if (!activeProgram || !activeProgram.startDate) return 0;

    const startDate = new Date(activeProgram.startDate);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = activeProgram.duration * 7;

    return Math.min(100, Math.max(0, (diffDays / totalDays) * 100));
  }

  // Calculate adherence statistics
  function calculateAdherence() {
    if (!activeProgram || !activeProgram.startDate) {
      return { completed: 0, scheduled: 0, percentage: 0 };
    }

    const startDate = new Date(activeProgram.startDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    let scheduledCount = 0;
    let completedCount = 0;

    // Count all scheduled workouts from start date to today
    const diffTime = today.getTime() - startDate.getTime();
    const daysSinceStart = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    for (let dayOffset = 0; dayOffset < daysSinceStart; dayOffset++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + dayOffset);

      const weekNumber = Math.floor(dayOffset / 7) + 1;
      if (weekNumber > activeProgram.duration) break;

      const programWeek = activeProgram.weeks.find(w => w.weekNumber === weekNumber);
      if (!programWeek) continue;

      const dayOfWeek = checkDate.getDay();
      const hasScheduledWorkout = programWeek.workouts.some(w => w.dayOfWeek === dayOfWeek);

      if (hasScheduledWorkout) {
        scheduledCount++;

        // Check if completed
        const dateString = checkDate.toDateString();
        const wasCompleted = workoutLogs.some(log => {
          const logDate = new Date(log.date);
          return logDate.toDateString() === dateString;
        });

        if (wasCompleted) completedCount++;
      }
    }

    const percentage = scheduledCount > 0 ? (completedCount / scheduledCount) * 100 : 0;
    return { completed: completedCount, scheduled: scheduledCount, percentage };
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 text-primary">Program & Schedule</h1>
        <p className="text-sm text-secondary">Plan your training program and schedule workouts</p>
      </div>

      {/* Active Program Card */}
      {activeProgram ? (
        <div className="card-elevated" style={{
          background: 'linear-gradient(135deg, rgba(180, 130, 255, 0.08) 0%, rgba(126, 41, 255, 0.12) 100%)',
          border: '1px solid rgba(180, 130, 255, 0.3)'
        }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold" style={{ color: '#B482FF' }}>{activeProgram.name}</h2>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{
                  backgroundColor: 'rgba(180, 130, 255, 0.2)',
                  color: '#B482FF',
                  border: '1px solid rgba(180, 130, 255, 0.4)'
                }}>
                  Active
                </span>
              </div>
              <p className="text-sm text-secondary mb-3">{activeProgram.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-muted">Duration:</span>{' '}
                  <span className="font-semibold text-primary">{activeProgram.duration} weeks</span>
                </div>
                <div>
                  <span className="text-muted">Days/Week:</span>{' '}
                  <span className="font-semibold text-primary">{activeProgram.daysPerWeek}</span>
                </div>
                <div>
                  <span className="text-muted">Goal:</span>{' '}
                  <span className="font-semibold text-primary capitalize">{activeProgram.goal}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeactivateProgram(activeProgram.id)}
              className="text-sm transition-colors px-3 py-1.5 rounded-md"
              style={{
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              Deactivate
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted">Program Progress</span>
              <span className="font-semibold" style={{ color: '#B482FF' }}>{calculateProgress().toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-accent)' }}>
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${calculateProgress()}%`,
                  backgroundColor: '#B482FF'
                }}
              ></div>
            </div>
          </div>

          {/* Adherence Stats */}
          <div className="flex items-center gap-4 text-sm pt-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div>
              <span className="text-muted">Adherence:</span>{' '}
              <span className={`font-semibold`} style={{
                color: calculateAdherence().percentage >= 80 ? '#10B981' :
                       calculateAdherence().percentage >= 60 ? '#F59E0B' :
                       '#EF4444'
              }}>
                {calculateAdherence().percentage.toFixed(0)}%
              </span>
            </div>
            <div className="text-muted">
              <span className="text-primary font-semibold">{calculateAdherence().completed}</span> / {calculateAdherence().scheduled} workouts completed
            </div>
          </div>
        </div>
      ) : (
        <div className="card-elevated text-center py-8" style={{
          border: '2px dashed var(--border-subtle)'
        }}>
          <h3 className="text-lg font-semibold mb-2 text-primary">No Active Program</h3>
          <p className="text-sm text-secondary mb-4">Choose a program template or create your own custom program</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowTemplateBrowser(true)}
              className="px-6 py-2 rounded-md text-sm font-semibold transition-all"
              style={{
                backgroundColor: '#EDE0FF',
                color: '#7E29FF',
                border: '1px solid #D7BDFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E4D2FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EDE0FF';
              }}
            >
              Browse Templates
            </button>
            <button
              onClick={() => setShowProgramBuilder(true)}
              className="px-6 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2"
              style={{
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Wrench size={18} />
              Create Custom
            </button>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
            <Calendar size={24} style={{ color: '#B482FF' }} />
            {activeProgram ? 'Training Calendar' : 'Calendar Preview'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--surface-accent)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm px-3 min-w-[160px] text-center text-primary">{monthName}</span>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg transition-colors"
              style={{ backgroundColor: 'var(--surface-accent)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(name => (
            <div key={name} className="text-center text-xs font-medium py-2 text-secondary">
              {name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const scheduledWorkout = getScheduledWorkout(day);
            const today = isToday(day);
            const past = isPastDay(day);
            const completed = isWorkoutCompleted(day);

            return (
              <div
                key={day}
                className="aspect-square rounded-lg flex flex-col items-start justify-start p-2 text-sm transition-all relative cursor-pointer"
                style={{
                  backgroundColor: scheduledWorkout
                    ? completed
                      ? 'rgba(126, 41, 255, 0.15)'
                      : 'rgba(180, 130, 255, 0.12)'
                    : 'var(--surface-accent)',
                  border: scheduledWorkout
                    ? completed
                      ? '1px solid rgba(126, 41, 255, 0.5)'
                      : '1px solid rgba(180, 130, 255, 0.4)'
                    : '1px solid var(--border-subtle)',
                  boxShadow: today ? '0 0 0 2px #B482FF' : 'none',
                  opacity: past && !scheduledWorkout ? 0.5 : 1,
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (scheduledWorkout) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    if (!completed) {
                      e.currentTarget.style.backgroundColor = 'rgba(180, 130, 255, 0.18)';
                    }
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  if (scheduledWorkout && !completed) {
                    e.currentTarget.style.backgroundColor = 'rgba(180, 130, 255, 0.12)';
                  }
                }}
                onClick={() => scheduledWorkout && handleStartWorkout(scheduledWorkout.templateId, scheduledWorkout.templateName)}
              >
                <span
                  className="text-xs"
                  style={{
                    fontWeight: scheduledWorkout ? 'bold' : 'normal',
                    color: scheduledWorkout ? '#B482FF' : 'var(--text-muted)',
                  }}
                >
                  {day}
                </span>
                {scheduledWorkout && (
                  <>
                    <span
                      className="text-xs font-medium mt-1 leading-tight line-clamp-2"
                      style={{ color: completed ? '#B482FF' : 'var(--text-primary)' }}
                    >
                      {scheduledWorkout.templateName}
                    </span>
                    {completed && (
                      <div className="absolute bottom-1 right-1">
                        <CheckCircle2 size={14} style={{ color: '#7E29FF' }} />
                      </div>
                    )}
                    {today && !completed && (
                      <div className="absolute bottom-1 right-1">
                        <Play size={12} style={{ color: '#B482FF' }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!activeProgram && (
          <div className="mt-4 text-center text-sm text-secondary">
            Activate a program to see your scheduled workouts
          </div>
        )}
      </div>

      {/* My Programs List */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">My Programs</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProgramBuilder(true)}
              className="text-sm transition-colors flex items-center gap-1"
              style={{ color: '#B482FF' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#9B6DFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#B482FF';
              }}
            >
              <Wrench size={16} />
              Create Custom
            </button>
            <button
              onClick={() => setShowTemplateBrowser(true)}
              className="text-sm transition-colors flex items-center gap-1"
              style={{ color: '#B482FF' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#9B6DFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#B482FF';
              }}
            >
              <Plus size={16} />
              From Template
            </button>
          </div>
        </div>

        {programs.length > 0 ? (
          <div className="space-y-3">
            {programs.map(program => (
              <div
                key={program.id}
                className="p-4 rounded-lg border transition-colors"
                style={{
                  backgroundColor: program.isActive
                    ? 'rgba(180, 130, 255, 0.08)'
                    : 'var(--surface-accent)',
                  borderColor: program.isActive
                    ? 'rgba(180, 130, 255, 0.4)'
                    : 'var(--border-subtle)',
                }}
                onMouseEnter={(e) => {
                  if (!program.isActive) {
                    e.currentTarget.style.borderColor = 'var(--border-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!program.isActive) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-primary">{program.name}</h3>
                      {program.isActive && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: 'rgba(180, 130, 255, 0.2)',
                            color: '#B482FF'
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondary mb-2">{program.description}</p>
                    <div className="flex gap-3 text-xs text-secondary">
                      <span>{program.duration} weeks</span>
                      <span>•</span>
                      <span>{program.daysPerWeek} days/week</span>
                      <span>•</span>
                      <span className="capitalize">{program.goal}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!program.isActive && (
                      <button
                        onClick={() => handleActivateProgram(program.id)}
                        className="text-xs px-3 py-1 rounded-md font-semibold transition-all"
                        style={{
                          backgroundColor: '#EDE0FF',
                          color: '#7E29FF',
                          border: '1px solid #D7BDFF'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#E4D2FF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#EDE0FF';
                        }}
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteProgram(program.id)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: '#EF4444' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.color = '#FCA5A5';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#EF4444';
                      }}
                      title="Delete program"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-secondary">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No programs yet</p>
            <p className="text-xs mt-1">Browse templates to get started</p>
          </div>
        )}
      </div>

      {/* Template Browser Modal */}
      {showTemplateBrowser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div
            className="rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface-primary)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-primary">Program Templates</h2>
              <button
                onClick={() => {
                  setShowTemplateBrowser(false);
                  setSelectedTemplate(null);
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

            {/* Quick link to custom builder */}
            <div
              className="mb-6 pb-4"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <p className="text-sm text-secondary mb-2">
                Or build your own program from your workout templates:
              </p>
              <button
                onClick={() => {
                  setShowTemplateBrowser(false);
                  setShowProgramBuilder(true);
                }}
                className="text-sm transition-colors flex items-center gap-1"
                style={{ color: '#B482FF' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#9B6DFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#B482FF';
                }}
              >
                <Wrench size={16} />
                Create Custom Program
              </button>
            </div>

            <div className="space-y-4">
              {PROGRAM_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className="p-4 rounded-lg border cursor-pointer transition-all"
                  style={{
                    backgroundColor: selectedTemplate === template.id
                      ? 'rgba(180, 130, 255, 0.12)'
                      : 'var(--surface-accent)',
                    borderColor: selectedTemplate === template.id
                      ? '#B482FF'
                      : 'var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTemplate !== template.id) {
                      e.currentTarget.style.borderColor = 'var(--border-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTemplate !== template.id) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }
                  }}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg text-primary">{template.name}</h3>
                    {selectedTemplate === template.id && (
                      <Check size={20} style={{ color: '#B482FF' }} />
                    )}
                  </div>

                  <p className="text-sm text-secondary mb-3">
                    {template.factory('temp').description}
                  </p>

                  <div className="flex gap-3 text-xs text-secondary">
                    <span>{template.factory('temp').duration} weeks</span>
                    <span>•</span>
                    <span>{template.factory('temp').daysPerWeek} days/week</span>
                    <span>•</span>
                    <span className="capitalize">{template.factory('temp').goal}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowTemplateBrowser(false);
                  setSelectedTemplate(null);
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
                onClick={() => selectedTemplate && handleActivateTemplate(selectedTemplate)}
                disabled={!selectedTemplate}
                className="flex-1 py-2 rounded-md font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: !selectedTemplate ? '#7E29FF' : '#7E29FF',
                  color: '#FFFFFF',
                  border: '1px solid #B482FF',
                  opacity: !selectedTemplate ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (selectedTemplate) {
                    e.currentTarget.style.backgroundColor = '#6A23D9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTemplate) {
                    e.currentTarget.style.backgroundColor = '#7E29FF';
                  }
                }}
              >
                Activate Program
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Program Builder Modal */}
      {showProgramBuilder && (
        <ProgramBuilder
          onClose={() => setShowProgramBuilder(false)}
          onSave={() => {
            loadPrograms();
            setShowProgramBuilder(false);
          }}
        />
      )}
    </div>
  );
}
