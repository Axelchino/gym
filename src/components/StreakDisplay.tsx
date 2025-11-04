import { Flame, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import type { WorkoutLog } from '../types/workout';

interface StreakDisplayProps {
  workouts: WorkoutLog[];
  compact?: boolean;
}

export function StreakDisplay({ workouts, compact = false }: StreakDisplayProps) {
  // Calculate weekly streak (consecutive weeks with at least 1 workout)
  const calculateWeeklyStreak = (): number => {
    if (workouts.length === 0) return 0;

    // Sort workouts by date (most recent first)
    const sortedWorkouts = [...workouts].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Get start of current week (Sunday)
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkingWeek = new Date(currentWeekStart);

    // Check each week going backwards
    while (true) {
      const weekEnd = new Date(checkingWeek);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Check if there's at least one workout in this week
      const hasWorkoutThisWeek = sortedWorkouts.some(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= checkingWeek && workoutDate < weekEnd;
      });

      if (hasWorkoutThisWeek) {
        streak++;
        // Move to previous week
        checkingWeek.setDate(checkingWeek.getDate() - 7);
      } else {
        break;
      }
    }

    return streak;
  };

  // Calculate days since last workout
  const calculateDaysSinceLastWorkout = (): number => {
    if (workouts.length === 0) return -1;

    const sortedWorkouts = [...workouts].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const lastWorkoutDate = new Date(sortedWorkouts[0].date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastWorkoutDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastWorkoutDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const weeklyStreak = calculateWeeklyStreak();
  const daysSinceLastWorkout = calculateDaysSinceLastWorkout();

  // Determine streak status
  const getStreakStatus = () => {
    if (weeklyStreak === 0) return 'inactive';
    if (daysSinceLastWorkout > 7) return 'danger';
    if (daysSinceLastWorkout > 4) return 'warning';
    return 'active';
  };

  const streakStatus = getStreakStatus();

  // Get appropriate message
  const getMessage = () => {
    if (weeklyStreak === 0) {
      return "Start your first workout to begin your streak!";
    }
    if (daysSinceLastWorkout === 0) {
      return "Great work today! Keep the streak alive! 💪";
    }
    if (daysSinceLastWorkout === 1) {
      return "Trained yesterday. You're on fire! 🔥";
    }
    if (daysSinceLastWorkout > 7) {
      return `⚠️ Don't break your ${weeklyStreak} week streak!`;
    }
    if (daysSinceLastWorkout > 4) {
      return `It's been ${daysSinceLastWorkout} days. Time to get back in the gym!`;
    }
    return `${daysSinceLastWorkout} day${daysSinceLastWorkout !== 1 ? 's' : ''} since last workout`;
  };

  const message = getMessage();

  // Compact mode for navbar or small spaces
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-card rounded-lg">
        <Flame
          size={18}
          className={
            streakStatus === 'active' ? 'text-primary-yellow' :
            streakStatus === 'warning' ? 'text-orange-400' :
            streakStatus === 'danger' ? 'text-red-400' :
            'text-muted'
          }
        />
        <span className="text-sm font-semibold text-primary">
          {weeklyStreak} week{weeklyStreak !== 1 ? 's' : ''}
        </span>
      </div>
    );
  }

  // Full display mode
  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-primary flex items-center gap-2 mb-1">
            <Flame
              size={24}
              className={
                streakStatus === 'active' ? 'text-primary-yellow' :
                streakStatus === 'warning' ? 'text-orange-400' :
                streakStatus === 'danger' ? 'text-red-400' :
                'text-muted'
              }
            />
            Weekly Streak
          </h2>
          <p className="text-sm text-secondary">Consecutive weeks with ≥1 workout</p>
        </div>

        {/* Streak number - big and prominent */}
        <div className="text-right">
          <div className="text-5xl font-bold text-primary-yellow">
            {weeklyStreak}
          </div>
          <div className="text-sm text-secondary mt-1">
            week{weeklyStreak !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Status message */}
      <div
        className={`
          p-3 rounded-lg flex items-center gap-2
          ${streakStatus === 'danger' ? 'bg-red-500/10 border border-red-500/30' :
            streakStatus === 'warning' ? 'bg-orange-500/10 border border-orange-500/30' :
            streakStatus === 'active' ? 'bg-primary-blue/10 border border-primary-blue/30' :
            'bg-surface-elevated border-card'
          }
        `}
      >
        {streakStatus === 'danger' && <AlertCircle size={20} className="text-red-400 flex-shrink-0" />}
        {streakStatus === 'warning' && <AlertCircle size={20} className="text-orange-400 flex-shrink-0" />}
        {streakStatus === 'active' && <TrendingUp size={20} className="text-brand-blue flex-shrink-0" />}
        {streakStatus === 'inactive' && <Calendar size={20} className="text-muted flex-shrink-0" />}
        <p className="text-sm text-primary">{message}</p>
      </div>

      {/* Streak milestones */}
      {weeklyStreak > 0 && (
        <div className="mt-4 pt-4 border-t border-border-medium">
          <p className="text-xs text-muted mb-2">Milestones:</p>
          <div className="grid grid-cols-4 gap-2">
            {[4, 8, 12, 26, 52].map(milestone => (
              <div
                key={milestone}
                className={`
                  text-center py-2 rounded-lg text-xs
                  ${weeklyStreak >= milestone
                    ? 'bg-primary-blue/20 text-brand-blue border border-primary-blue/30'
                    : 'bg-surface-elevated text-muted border-card'
                  }
                `}
              >
                <div className="font-bold">{milestone}</div>
                <div className="text-xs opacity-75">
                  {milestone === 52 ? 'year' : 'wks'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
