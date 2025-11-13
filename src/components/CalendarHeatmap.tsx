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

    // Purple intensity colors
    if (intensity > 0.75) return '#7E29FF'; // Dark purple - highest intensity
    if (intensity > 0.5) return 'rgba(180, 130, 255, 0.8)';
    if (intensity > 0.25) return 'rgba(180, 130, 255, 0.6)';
    return 'rgba(180, 130, 255, 0.4)'; // Light purple - lowest intensity
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
        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
          <Calendar size={24} style={{ color: '#B482FF' }} />
          Training Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--surface-accent)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
            }}
            aria-label="Previous month"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm rounded-lg transition-colors"
            style={{
              backgroundColor: '#EDE0FF',
              color: '#7E29FF'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E4D2FF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#EDE0FF';
            }}
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: 'var(--surface-accent)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
            }}
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
          <div key={name} className="text-center text-xs font-medium py-1 text-secondary">
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
              className="aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all relative"
              style={{
                backgroundColor: hasWorkout
                  ? intensityColor
                  : future
                    ? 'rgba(31, 41, 55, 0.3)'
                    : 'var(--surface-accent)',
                color: hasWorkout
                  ? '#FFFFFF'
                  : future
                    ? 'var(--text-muted)'
                    : 'var(--text-secondary)',
                cursor: hasWorkout ? 'pointer' : 'default',
                boxShadow: today ? '0 0 0 2px #B482FF' : 'none',
                transform: 'scale(1)'
              }}
              onMouseEnter={(e) => {
                if (hasWorkout) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                } else if (!future) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (hasWorkout) {
                  e.currentTarget.style.transform = 'scale(1)';
                } else if (!future) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                }
              }}
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
      <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center justify-between text-xs text-secondary">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'var(--surface-accent)' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(180, 130, 255, 0.4)' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(180, 130, 255, 0.6)' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(180, 130, 255, 0.8)' }} />
            <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7E29FF' }} />
          </div>
          <span>More</span>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'var(--text-muted)' }}>
          Color intensity = workout volume
        </p>
      </div>
    </div>
  );
}
