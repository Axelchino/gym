import { useState, useEffect } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Play, X, Check, TrendingUp, CheckCircle2, Wrench } from 'lucide-react';
import { db } from '../services/database';
import type { Program, WorkoutTemplate, WorkoutLog } from '../types/workout';
import { PROGRAM_TEMPLATES } from '../data/programTemplates';
import { useNavigate } from 'react-router-dom';
import { ProgramBuilder } from '../components/ProgramBuilder';

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
    const allPrograms = await db.programs.toArray();
    setPrograms(allPrograms);

    const active = allPrograms.find(p => p.isActive);
    setActiveProgram(active || null);
  }

  async function loadTemplates() {
    const allTemplates = await db.workoutTemplates.toArray();
    setTemplates(allTemplates);
  }

  async function loadWorkoutLogs() {
    const logs = await db.workoutLogs.toArray();
    setWorkoutLogs(logs);
  }

  async function handleActivateTemplate(templateId: string) {
    const template = PROGRAM_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    // Deactivate any active programs
    const activePrograms = programs.filter(p => p.isActive);
    for (const prog of activePrograms) {
      await db.programs.update(prog.id, { isActive: false });
    }

    // Create new program from template
    const newProgram = template.factory('default-user');
    newProgram.isActive = true;
    newProgram.startDate = new Date();

    await db.programs.add(newProgram);
    await loadPrograms();
    setShowTemplateBrowser(false);
    setSelectedTemplate(null);
  }

  async function handleActivateProgram(programId: string) {
    // Deactivate any active programs
    const activePrograms = programs.filter(p => p.isActive);
    for (const prog of activePrograms) {
      await db.programs.update(prog.id, { isActive: false });
    }

    // Activate the selected program
    await db.programs.update(programId, {
      isActive: true,
      startDate: new Date() // Reset start date when reactivating
    });
    await loadPrograms();
  }

  async function handleDeactivateProgram(programId: string) {
    await db.programs.update(programId, { isActive: false });
    await loadPrograms();
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
    const dayOfWeek = date.getDay();

    // Calculate which week of the program we're in
    const startDate = new Date(activeProgram.startDate);
    const diffTime = Math.abs(date.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  function handleStartWorkout(templateName: string) {
    // Navigate to workout logger
    // In a full implementation, we'd pass template info to pre-populate
    navigate('/workout');
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
        <h1 className="text-3xl font-bold mb-2">Program & Schedule</h1>
        <p className="text-gray-400">Plan your training program and schedule workouts</p>
      </div>

      {/* Active Program Card */}
      {activeProgram ? (
        <div className="card-elevated bg-gradient-to-r from-primary-blue/10 to-primary-green/10 border-2 border-primary-blue/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-bold text-primary-blue">{activeProgram.name}</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-primary-green/20 text-primary-green border border-primary-green/50">
                  Active
                </span>
              </div>
              <p className="text-sm text-gray-300 mb-3">{activeProgram.description}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Duration:</span>{' '}
                  <span className="font-semibold">{activeProgram.duration} weeks</span>
                </div>
                <div>
                  <span className="text-gray-400">Days/Week:</span>{' '}
                  <span className="font-semibold">{activeProgram.daysPerWeek}</span>
                </div>
                <div>
                  <span className="text-gray-400">Goal:</span>{' '}
                  <span className="font-semibold capitalize">{activeProgram.goal}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeactivateProgram(activeProgram.id)}
              className="text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              Deactivate
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-400">Program Progress</span>
              <span className="text-primary-blue font-semibold">{calculateProgress().toFixed(0)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-blue transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>

          {/* Adherence Stats */}
          <div className="flex items-center gap-4 text-sm pt-2 border-t border-gray-700/50">
            <div>
              <span className="text-gray-400">Adherence:</span>{' '}
              <span className={`font-semibold ${
                calculateAdherence().percentage >= 80 ? 'text-primary-green' :
                calculateAdherence().percentage >= 60 ? 'text-primary-yellow' :
                'text-red-400'
              }`}>
                {calculateAdherence().percentage.toFixed(0)}%
              </span>
            </div>
            <div className="text-gray-400">
              <span className="text-white font-semibold">{calculateAdherence().completed}</span> / {calculateAdherence().scheduled} workouts completed
            </div>
          </div>
        </div>
      ) : (
        <div className="card-elevated border-2 border-dashed border-gray-700 text-center py-8">
          <h3 className="text-lg font-semibold mb-2">No Active Program</h3>
          <p className="text-sm text-gray-400 mb-4">Choose a program template or create your own custom program</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowTemplateBrowser(true)}
              className="btn-primary px-6 py-2"
            >
              Browse Templates
            </button>
            <button
              onClick={() => setShowProgramBuilder(true)}
              className="btn-secondary px-6 py-2 flex items-center gap-2"
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
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar size={24} className="text-primary-blue" />
            {activeProgram ? 'Training Calendar' : 'Calendar Preview'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm px-3 min-w-[160px] text-center">{monthName}</span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map(name => (
            <div key={name} className="text-center text-xs text-gray-500 font-medium py-2">
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
                className={`
                  aspect-square rounded-lg flex flex-col items-start justify-start p-2
                  text-sm transition-all relative
                  ${scheduledWorkout
                    ? completed
                      ? 'bg-primary-green/20 border border-primary-green/50 cursor-pointer hover:scale-105'
                      : 'bg-primary-blue/20 border border-primary-blue/50 cursor-pointer hover:scale-105 hover:bg-primary-blue/30'
                    : 'bg-gray-800 border border-gray-700'
                  }
                  ${today ? 'ring-2 ring-primary-yellow' : ''}
                  ${past && !scheduledWorkout ? 'opacity-50' : ''}
                `}
                onClick={() => scheduledWorkout && handleStartWorkout(scheduledWorkout.templateName)}
              >
                <span className={`text-xs ${scheduledWorkout ? 'font-bold text-primary-blue' : 'text-gray-400'}`}>
                  {day}
                </span>
                {scheduledWorkout && (
                  <>
                    <span className={`text-xs font-medium mt-1 leading-tight line-clamp-2 ${completed ? 'text-primary-green' : 'text-white'}`}>
                      {scheduledWorkout.templateName}
                    </span>
                    {completed && (
                      <div className="absolute bottom-1 right-1">
                        <CheckCircle2 size={14} className="text-primary-green" />
                      </div>
                    )}
                    {today && !completed && (
                      <div className="absolute bottom-1 right-1">
                        <Play size={12} className="text-primary-yellow" />
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {!activeProgram && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Activate a program to see your scheduled workouts
          </div>
        )}
      </div>

      {/* My Programs List */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">My Programs</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowProgramBuilder(true)}
              className="text-sm text-primary-green hover:text-primary-green/80 transition-colors flex items-center gap-1"
            >
              <Wrench size={16} />
              Create Custom
            </button>
            <button
              onClick={() => setShowTemplateBrowser(true)}
              className="text-sm text-primary-blue hover:text-primary-blue/80 transition-colors flex items-center gap-1"
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
                className={`p-4 rounded-lg border transition-colors ${
                  program.isActive
                    ? 'bg-primary-blue/10 border-primary-blue/50'
                    : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{program.name}</h3>
                      {program.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-green/20 text-primary-green">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{program.description}</p>
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>{program.duration} weeks</span>
                      <span>•</span>
                      <span>{program.daysPerWeek} days/week</span>
                      <span>•</span>
                      <span className="capitalize">{program.goal}</span>
                    </div>
                  </div>

                  {!program.isActive && (
                    <button
                      onClick={() => handleActivateProgram(program.id)}
                      className="text-xs btn-secondary px-3 py-1"
                    >
                      Activate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No programs yet</p>
            <p className="text-xs mt-1">Browse templates to get started</p>
          </div>
        )}
      </div>

      {/* Template Browser Modal */}
      {showTemplateBrowser && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Program Templates</h2>
              <button
                onClick={() => {
                  setShowTemplateBrowser(false);
                  setSelectedTemplate(null);
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick link to custom builder */}
            <div className="mb-6 pb-4 border-b border-gray-700">
              <p className="text-sm text-gray-400 mb-2">
                Or build your own program from your workout templates:
              </p>
              <button
                onClick={() => {
                  setShowTemplateBrowser(false);
                  setShowProgramBuilder(true);
                }}
                className="text-sm text-primary-green hover:text-primary-green/80 transition-colors flex items-center gap-1"
              >
                <Wrench size={16} />
                Create Custom Program
              </button>
            </div>

            <div className="space-y-4">
              {PROGRAM_TEMPLATES.map(template => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'bg-primary-blue/20 border-primary-blue'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    {selectedTemplate === template.id && (
                      <Check size={20} className="text-primary-green" />
                    )}
                  </div>

                  <p className="text-sm text-gray-300 mb-3">
                    {template.factory('temp').description}
                  </p>

                  <div className="flex gap-3 text-xs text-gray-400">
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
                className="flex-1 btn-secondary py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedTemplate && handleActivateTemplate(selectedTemplate)}
                disabled={!selectedTemplate}
                className="flex-1 btn-primary py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
