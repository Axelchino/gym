import { useThemeTokens } from '../utils/themeHelpers';

interface StreakVisualizationProps {
  currentStreak: number;
  workoutDates?: Date[]; // All workout dates to determine holds vs active days
  animate?: boolean;
  simulatedToday?: Date; // For testing: simulate a different "today"
}

export function StreakVisualization({
  currentStreak,
  workoutDates = [],
  animate = true,
  simulatedToday,
}: StreakVisualizationProps) {
  const tokens = useThemeTokens();
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Get current day of week (0 = Sunday, 6 = Saturday)
  const today = simulatedToday ? new Date(simulatedToday) : new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to midnight
  const todayDayOfWeek = today.getDay();

  // Create a set of workout dates (normalized to midnight) for quick lookup
  const workoutDateSet = new Set(
    workoutDates.map((date: string | Date) => {
      // Parse date string in local timezone to avoid UTC offset issues
      let d: Date;
      if (typeof date === 'string') {
        const [year, month, day] = date.split('-').map(Number);
        d = new Date(year, month - 1, day);
      } else {
        d = new Date(date);
      }
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Determine state for each day: 'active' | 'hold' | 'broken' | 'empty' | 'future'
  const getDayState = (dayIndex: number): 'active' | 'hold' | 'broken' | 'empty' | 'future' => {
    // Convert Sunday (0) to index 6, Monday (1) to 0, etc.
    const todayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

    // Calculate the date for this day index based on the start of the week (Monday)
    // Get the Monday of the current week
    const monday = new Date(today);
    const daysSinceMonday = todayIndex; // How many days since Monday
    monday.setDate(today.getDate() - daysSinceMonday);

    // Calculate the actual date for this day index (0=Monday, 1=Tuesday, etc.)
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + dayIndex);
    dayDate.setHours(0, 0, 0, 0);

    // Check if this day is in the future
    if (dayDate > today) {
      return 'future';
    }

    // Check if there was a workout on this day
    const hadWorkout = workoutDateSet.has(dayDate.getTime());

    // If no streak at all, show all days as empty
    if (currentStreak === 0) return 'empty';

    // Active if had workout
    if (hadWorkout) return 'active';

    // For days without workouts, check if streak was broken
    // Find the last workout before this day
    const sortedWorkoutDates = Array.from(workoutDateSet).sort((a, b) => b - a);
    const lastWorkoutBeforeThisDay = sortedWorkoutDates.find((wDate) => wDate < dayDate.getTime());

    if (lastWorkoutBeforeThisDay) {
      const daysSinceLastWorkout = Math.floor(
        (dayDate.getTime() - lastWorkoutBeforeThisDay) / (1000 * 60 * 60 * 24)
      );

      // If gap > 2 days, streak is broken
      if (daysSinceLastWorkout > 2) {
        return 'broken';
      }

      // Within grace period (≤2 days)
      return 'hold';
    }

    // No previous workout found - this day is empty
    return 'empty';
  };

  return (
    <div className="flex items-center gap-1.5">
      {dayLabels.map((label, index) => {
        const state = getDayState(index);
        // Convert Sunday (0) to index 6, Monday (1) to 0, etc.
        const todayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
        const isToday = index === todayIndex;

        return (
          <div key={index} className="flex items-center relative">
            {/* Day box with letter inside */}
            <div
              className="flex items-center justify-center text-xs font-semibold"
              style={{
                width: '18px',
                height: '36px',
                borderRadius: '5px',
                backgroundColor:
                  state === 'active'
                    ? tokens.statCard.accentGold
                    : state === 'future'
                      ? 'rgba(107, 114, 128, 0.1)'
                      : state === 'broken' || state === 'empty'
                        ? 'rgba(107, 114, 128, 0.2)'
                        : `${tokens.statCard.accentGold}40`,
                border: `2px solid ${
                  isToday
                    ? tokens.statCard.accentGold
                    : state === 'active' || state === 'hold'
                      ? tokens.statCard.accentGold
                      : state === 'future'
                        ? 'rgba(107, 114, 128, 0.3)'
                        : '#6B7280'
                }`,
                boxShadow: isToday
                  ? `0 0 0 3px ${tokens.statCard.accentGold}80, 0 0 8px ${tokens.statCard.accentGold}99`
                  : 'none',
                color:
                  state === 'active'
                    ? '#FFFFFF'
                    : state === 'future'
                      ? 'rgba(107, 114, 128, 0.4)'
                      : state === 'broken' || state === 'empty'
                        ? '#6B7280'
                        : tokens.statCard.accentGold,
                transition: animate ? 'all 0.3s ease-out' : 'none',
                transitionDelay: animate ? `${index * 50}ms` : '0ms',
                fontSize: '10px',
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
