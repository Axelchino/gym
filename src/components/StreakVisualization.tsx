interface StreakVisualizationProps {
  currentStreak: number;
  workoutDates?: Date[]; // All workout dates to determine holds vs active days
  totalDays?: number;
  animate?: boolean;
}

export function StreakVisualization({
  currentStreak,
  workoutDates = [],
  totalDays = 7,
  animate = true,
}: StreakVisualizationProps) {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  // Get current day of week (0 = Sunday, 6 = Saturday)
  const today = new Date();
  const todayDayOfWeek = today.getDay();

  // Create a set of workout dates (normalized to midnight) for quick lookup
  const workoutDateSet = new Set(
    workoutDates.map(date => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    })
  );

  // Determine state for each day: 'active' | 'hold' | 'broken' | 'empty'
  const getDayState = (dayIndex: number): 'active' | 'hold' | 'broken' | 'empty' => {
    // Convert Sunday (0) to index 6, Monday (1) to 0, etc.
    const todayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;

    // Calculate days back from today
    const daysBack = todayIndex - dayIndex;

    if (daysBack < 0) {
      // Day is in the future (later in the week)
      return 'empty';
    }

    // Calculate the actual date for this day index
    const dayDate = new Date(today);
    dayDate.setDate(today.getDate() - daysBack);
    dayDate.setHours(0, 0, 0, 0);

    // Check if there was a workout on this day
    const hadWorkout = workoutDateSet.has(dayDate.getTime());

    // If no streak at all, show all days as empty
    if (currentStreak === 0) return 'empty';

    // Active if had workout
    if (hadWorkout) return 'active';

    // For days without workouts, check if streak was broken
    // Find the last workout before this day
    const sortedWorkoutDates = Array.from(workoutDateSet).sort((a, b) => b - a);
    const lastWorkoutBeforeThisDay = sortedWorkoutDates.find(wDate => wDate < dayDate.getTime());

    if (lastWorkoutBeforeThisDay) {
      const daysSinceLastWorkout = Math.floor((dayDate.getTime() - lastWorkoutBeforeThisDay) / (1000 * 60 * 60 * 24));

      // If gap > 2 days, streak is broken
      if (daysSinceLastWorkout > 2) {
        return 'broken';
      }
    }

    // Within grace period (≤2 days) or no previous workout found
    return 'hold';
  };

  return (
    <div className="flex items-center gap-1.5">
      {dayLabels.map((label, index) => {
        const state = getDayState(index);

        return (
          <div key={index} className="flex items-center">
            {/* Day box with letter inside */}
            <div
              className="flex items-center justify-center text-xs font-semibold"
              style={{
                width: '18px',
                height: '36px',
                borderRadius: '5px',
                backgroundColor:
                  state === 'active'
                    ? '#B482FF'
                    : state === 'broken' || state === 'empty'
                    ? 'rgba(107, 114, 128, 0.2)'
                    : 'rgba(180, 130, 255, 0.3)',
                border: `1.5px solid ${
                  state === 'active' || state === 'hold'
                    ? '#B482FF'
                    : '#6B7280'
                }`,
                color:
                  state === 'active'
                    ? '#FFFFFF'
                    : state === 'broken' || state === 'empty'
                    ? '#6B7280'
                    : '#B482FF',
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
