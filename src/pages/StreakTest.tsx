import { StreakVisualization } from '../components/StreakVisualization';

export function StreakTest() {
  // Simulate as if today is Friday (day 4 of the week)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDayOfWeek = today.getDay();
  const actualTodayIndex = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - actualTodayIndex);

  // Create simulated Friday (4 days after Monday)
  const simulatedFriday = new Date(monday);
  simulatedFriday.setDate(monday.getDate() + 4);

  // Helper to create workout dates for specific days of the week
  // dayIndices: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday
  const createWorkoutDatesForWeek = (dayIndices: number[]) => {
    return dayIndices.map(dayIndex => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + dayIndex);
      date.setHours(0, 0, 0, 0);
      return date;
    });
  };

  // Scenarios using day indices: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  // Simulating as if today is Friday (index 4)
  const scenarios = [
    {
      title: 'Perfect Week (All 7 Days)',
      streak: 7,
      workoutDates: createWorkoutDatesForWeek([0, 1, 2, 3, 4, 5, 6]),
      description: 'Monday through Sunday - all filled'
    },
    {
      title: 'Just Monday (Today)',
      streak: 1,
      workoutDates: createWorkoutDatesForWeek([0]),
      description: 'Only today filled'
    },
    {
      title: 'Mon, Tue, Wed (First 3 Days)',
      streak: 3,
      workoutDates: createWorkoutDatesForWeek([0, 1, 2]),
      description: 'First three days of week'
    },
    {
      title: 'Mon, Wed, Fri (Every Other Day)',
      streak: 3,
      workoutDates: createWorkoutDatesForWeek([0, 2, 4]),
      description: 'Alternating days pattern'
    },
    {
      title: 'Mon, Tue, Thu, Fri',
      streak: 4,
      workoutDates: createWorkoutDatesForWeek([0, 1, 3, 4]),
      description: 'Four days with one gap'
    },
    {
      title: 'Tue, Wed, Thu Only',
      streak: 3,
      workoutDates: createWorkoutDatesForWeek([1, 2, 3]),
      description: 'Mid-week workouts only'
    },
    {
      title: 'Weekend Warrior (Sat, Sun)',
      streak: 2,
      workoutDates: createWorkoutDatesForWeek([5, 6]),
      description: 'Only weekend workouts'
    },
    {
      title: 'Mon, Tue, Wed, Thu, Fri',
      streak: 5,
      workoutDates: createWorkoutDatesForWeek([0, 1, 2, 3, 4]),
      description: 'Full weekday schedule'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Streak Visualization Test</h1>
        <p className="text-gray-400">Different scenarios showing how the streak visualization appears</p>
        <p className="text-sm text-yellow-500 mt-2">
          ⚠️ Simulating as if today is <strong>Friday</strong> (so Mon-Fri can show as filled)
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Legend: Purple filled = Active day | Purple outline = Hold (within 2 days) | Gray = Empty/Broken | Light gray = Future
        </p>
        <p className="text-sm text-gray-500">
          Today's day has a purple glow around it
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario, index) => (
          <div key={index} className="card-elevated">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-1">{scenario.title}</h3>
              <p className="text-sm text-gray-400">{scenario.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Workouts: {scenario.workoutDates.length} | Streak: {scenario.streak} day{scenario.streak !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex justify-center py-4">
              <StreakVisualization
                currentStreak={scenario.streak}
                workoutDates={scenario.workoutDates}
                animate={false}
                simulatedToday={simulatedFriday}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="card-elevated">
        <h3 className="font-semibold text-lg mb-3">Understanding the States</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <div style={{
              width: '18px',
              height: '36px',
              borderRadius: '5px',
              backgroundColor: '#B482FF',
              border: '1.5px solid #B482FF',
            }}></div>
            <span><strong>Active:</strong> You worked out on this day</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{
              width: '18px',
              height: '36px',
              borderRadius: '5px',
              backgroundColor: 'rgba(180, 130, 255, 0.3)',
              border: '1.5px solid #B482FF',
            }}></div>
            <span><strong>Hold:</strong> No workout, but within 2-day grace period (streak still alive)</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{
              width: '18px',
              height: '36px',
              borderRadius: '5px',
              backgroundColor: 'rgba(107, 114, 128, 0.2)',
              border: '1.5px solid #6B7280',
            }}></div>
            <span><strong>Empty/Broken:</strong> No workout and outside grace period (streak broken)</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{
              width: '18px',
              height: '36px',
              borderRadius: '5px',
              backgroundColor: 'rgba(107, 114, 128, 0.1)',
              border: '1.5px solid rgba(107, 114, 128, 0.3)',
            }}></div>
            <span><strong>Future:</strong> This day hasn't happened yet</span>
          </div>
          <div className="flex items-center gap-3">
            <div style={{
              width: '18px',
              height: '36px',
              borderRadius: '5px',
              backgroundColor: '#B482FF',
              border: '1.5px solid #B482FF',
              boxShadow: '0 0 0 2px rgba(180, 130, 255, 0.3)',
            }}></div>
            <span><strong>Today:</strong> Current day (has purple glow)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
