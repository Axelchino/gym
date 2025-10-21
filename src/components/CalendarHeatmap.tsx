import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Flame, TrendingUp } from 'lucide-react';
import type { WorkoutLog } from '../types/workout';

interface CalendarHeatmapProps {
  workouts: WorkoutLog[];
  onDateClick?: (date: Date, workouts: WorkoutLog[]) => void;
}

export function CalendarHeatmap({ workouts, onDateClick }: CalendarHeatmapProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get first and last day of current month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get day of week for first day (0 = Sunday)
  const startingDayOfWeek = firstDay.getDay();

  // Get number of days in month
  const daysInMonth = lastDay.getDate();

  // Create workout map: date string -> workouts
  const workoutMap = new Map<string, WorkoutLog[]>();
  workouts.forEach(workout => {
    const dateStr = new Date(workout.date).toDateString();
    if (!workoutMap.has(dateStr)) {
      workoutMap.set(dateStr, []);
    }
    workoutMap.get(dateStr)!.push(workout);
  });

  // Get max volume for color intensity scaling
  const maxVolume = Math.max(...Array.from(workoutMap.values()).map(ws =>
    ws.reduce((sum, w) => sum + w.totalVolume, 0)
  ), 1);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day &&
           today.getMonth() === month &&
           today.getFullYear() === year;
  };

  const isFutureDate = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const getWorkoutsForDay = (day: number): WorkoutLog[] => {
    const date = new Date(year, month, day);
    const dateStr = date.toDateString();
    return workoutMap.get(dateStr) || [];
  };

  const getIntensityColor = (workouts: WorkoutLog[]): string => {
    if (workouts.length === 0) return '';

    const totalVolume = workouts.reduce((sum, w) => sum + w.totalVolume, 0);
    const intensity = totalVolume / maxVolume;

    if (intensity > 0.75) return 'bg-primary-blue';
    if (intensity > 0.5) return 'bg-primary-blue/80';
    if (intensity > 0.25) return 'bg-primary-blue/60';
    return 'bg-primary-blue/40';
  };

  const handleDayClick = (day: number) => {
    const dayWorkouts = getWorkoutsForDay(day);
    if (dayWorkouts.length > 0 && onDateClick) {
      const date = new Date(year, month, day);
      onDateClick(date, dayWorkouts);
    }
  };

  // Create calendar grid (7 columns for days of week)
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const monthName = firstDay.toLocaleString('default', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card-elevated">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calendar size={24} className="text-primary-blue" />
          Training Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Month/Year */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-300">{monthName}</h3>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(name => (
          <div key={name} className="text-center text-xs text-gray-500 font-medium py-1">
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

          const dayWorkouts = getWorkoutsForDay(day);
          const hasWorkout = dayWorkouts.length > 0;
          const intensityColor = getIntensityColor(dayWorkouts);
          const today = isToday(day);
          const future = isFutureDate(day);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              disabled={!hasWorkout}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center
                text-sm font-medium transition-all relative
                ${hasWorkout
                  ? `${intensityColor} hover:scale-105 cursor-pointer text-white`
                  : future
                    ? 'bg-gray-800/30 text-gray-600 cursor-default'
                    : 'bg-gray-800 text-gray-400 cursor-default hover:bg-gray-700'
                }
                ${today ? 'ring-2 ring-primary-yellow' : ''}
              `}
            >
              <span>{day}</span>
              {hasWorkout && (
                <div className="absolute bottom-1 flex gap-0.5">
                  {dayWorkouts.map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-white/80" />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded bg-gray-800" />
            <div className="w-4 h-4 rounded bg-primary-blue/40" />
            <div className="w-4 h-4 rounded bg-primary-blue/60" />
            <div className="w-4 h-4 rounded bg-primary-blue/80" />
            <div className="w-4 h-4 rounded bg-primary-blue" />
          </div>
          <span>More</span>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">
          Color intensity = workout volume
        </p>
      </div>
    </div>
  );
}
