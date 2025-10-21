import { Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

export function Program() {
  const today = new Date();
  const monthName = today.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get first day of month
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

  // Create calendar days array
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Mock program schedule (example)
  const programSchedule: Record<number, { name: string; color: string }> = {
    1: { name: 'Push Day A', color: 'bg-blue-500/20 border-blue-500/50' },
    3: { name: 'Pull Day A', color: 'bg-green-500/20 border-green-500/50' },
    5: { name: 'Leg Day A', color: 'bg-yellow-500/20 border-yellow-500/50' },
    8: { name: 'Push Day B', color: 'bg-blue-500/20 border-blue-500/50' },
    10: { name: 'Pull Day B', color: 'bg-green-500/20 border-green-500/50' },
    12: { name: 'Leg Day B', color: 'bg-yellow-500/20 border-yellow-500/50' },
    15: { name: 'Push Day A', color: 'bg-blue-500/20 border-blue-500/50' },
    17: { name: 'Pull Day A', color: 'bg-green-500/20 border-green-500/50' },
    19: { name: 'Leg Day A', color: 'bg-yellow-500/20 border-yellow-500/50' },
    22: { name: 'Push Day B', color: 'bg-blue-500/20 border-blue-500/50' },
    24: { name: 'Pull Day B', color: 'bg-green-500/20 border-green-500/50' },
    26: { name: 'Leg Day B', color: 'bg-yellow-500/20 border-yellow-500/50' },
  };

  const isToday = (day: number) => {
    return today.getDate() === day;
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Program & Schedule</h1>
        <p className="text-gray-400">Plan your training program and schedule workouts</p>
      </div>

      {/* Coming Soon Banner */}
      <div className="card-elevated bg-gradient-to-r from-primary-blue/10 to-primary-purple/10 border-2 border-primary-blue/30">
        <div className="text-center py-4">
          <h2 className="text-xl font-bold text-primary-blue mb-2">📅 Coming in Phase 4</h2>
          <p className="text-sm text-gray-300">
            Full program planning, scheduling, and calendar features arriving soon
          </p>
        </div>
      </div>

      {/* Mock Calendar View */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar size={24} className="text-primary-blue" />
            Program Calendar
          </h2>
          <div className="flex items-center gap-2">
            <button
              disabled
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors opacity-50 cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm px-3">{monthName}</span>
            <button
              disabled
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors opacity-50 cursor-not-allowed"
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

            const scheduledWorkout = programSchedule[day];
            const today = isToday(day);

            return (
              <div
                key={day}
                className={`
                  aspect-square rounded-lg flex flex-col items-start justify-start p-2
                  text-sm transition-all relative
                  ${scheduledWorkout
                    ? `${scheduledWorkout.color} border cursor-pointer hover:scale-105`
                    : 'bg-gray-800 border border-gray-700'
                  }
                  ${today ? 'ring-2 ring-primary-yellow' : ''}
                `}
              >
                <span className={`text-xs ${scheduledWorkout ? 'font-bold' : 'text-gray-400'}`}>
                  {day}
                </span>
                {scheduledWorkout && (
                  <span className="text-xs font-medium text-white mt-1 leading-tight">
                    {scheduledWorkout.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/50"></div>
              <span className="text-gray-400">Push Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/50"></div>
              <span className="text-gray-400">Pull Day</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50"></div>
              <span className="text-gray-400">Leg Day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h3 className="font-semibold mb-2">📝 Program Builder</h3>
          <p className="text-sm text-gray-400">
            Create multi-week programs with customizable workout templates and progression schemes
          </p>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">🗓️ Workout Scheduling</h3>
          <p className="text-sm text-gray-400">
            Schedule workouts on specific days, drag-and-drop to reschedule, and track adherence
          </p>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">📋 Program Templates</h3>
          <p className="text-sm text-gray-400">
            Choose from pre-built programs (Push/Pull/Legs, Upper/Lower, Full Body) or create your own
          </p>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-2">📈 Progressive Overload</h3>
          <p className="text-sm text-gray-400">
            Plan weight/rep increases over weeks, schedule deload weeks, and track program completion
          </p>
        </div>
      </div>

      {/* Mock Add Button */}
      <button
        disabled
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary-blue rounded-full shadow-lg flex items-center justify-center opacity-50 cursor-not-allowed"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
