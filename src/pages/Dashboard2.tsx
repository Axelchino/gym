import { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Award, Flame } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useWorkouts, usePersonalRecords } from '../hooks/useWorkoutData';
import { useUserSettings } from '../hooks/useUserSettings';
import { Sparkline } from '../components/Sparkline';
import { StreakVisualization } from '../components/StreakVisualization';
import { calculateStreak } from '../utils/analytics';
import { Area, AreaChart, CartesianGrid, XAxis, ResponsiveContainer, Tooltip } from 'recharts';

// shadcn-style Card components (minimal version for now)
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-3xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </div>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`text-sm text-muted-foreground ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const CardFooter = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold ${
    variant === 'outline' ? 'border bg-background' : 'bg-primary text-primary-foreground'
  }`}>
    {children}
  </span>
);

function Dashboard2() {
  const { weightUnit } = useUserSettings();
  const { user } = useAuth();

  // Calculate date ranges
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d;
  }, []);

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date(today);
    d.setDate(today.getDate() - 30);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [today]);

  // Fetch data
  const { data: allWorkouts = [], isLoading: workoutsLoading } = useWorkouts(
    user ? thirtyDaysAgo : undefined,
    user ? today : undefined
  );

  const { data: allPRs = [], isLoading: prsLoading } = usePersonalRecords(
    user ? thirtyDaysAgo : undefined,
    user ? today : undefined
  );

  const isLoading = workoutsLoading || prsLoading;

  // Calculate stats
  const stats = useMemo(() => {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    // Last 7 days
    const workoutsLast7Days = allWorkouts.filter((w) => {
      const workoutDate = new Date(w.date);
      return workoutDate >= sevenDaysAgo && workoutDate <= today;
    });
    const volumeLast7Days = workoutsLast7Days.reduce((sum, w) => sum + w.totalVolume, 0);

    // Previous 7 days (for comparison)
    const workoutsPrev7Days = allWorkouts.filter((w) => {
      const workoutDate = new Date(w.date);
      return workoutDate >= fourteenDaysAgo && workoutDate < sevenDaysAgo;
    });
    const volumePrev7Days = workoutsPrev7Days.reduce((sum, w) => sum + w.totalVolume, 0);

    // Best workout (highest volume)
    const bestWorkout = allWorkouts.length > 0
      ? allWorkouts.reduce((best, current) =>
          current.totalVolume > best.totalVolume ? current : best
        )
      : null;

    // Days since last PR
    const daysSinceLastPR = allPRs.length > 0
      ? Math.floor((today.getTime() - new Date(allPRs[0].date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      workoutsLast7Days: workoutsLast7Days.length,
      workoutsPrev7Days: workoutsPrev7Days.length,
      volumeLast7Days,
      volumePrev7Days,
      currentStreak: calculateStreak(allWorkouts),
      prsLast30Days: allPRs.length,
      bestWorkout,
      daysSinceLastPR,
    };
  }, [allWorkouts, allPRs, today]);

  // Format today's date
  const todayFormatted = useMemo(() => {
    return today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [today]);

  // Animated numbers
  const animatedVolume = useAnimatedNumber(stats.volumeLast7Days, 400, !isLoading);
  const animatedWorkouts = useAnimatedNumber(stats.workoutsLast7Days, 350, !isLoading);
  const animatedPRs = useAnimatedNumber(stats.prsLast30Days, 350, !isLoading);
  const animatedStreak = useAnimatedNumber(stats.currentStreak, 350, !isLoading);

  // Sparkline data
  const volumeSparklineData = useMemo(() => {
    if (allWorkouts.length === 0) return [];

    const data: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayWorkouts = allWorkouts.filter((w) => {
        const workoutDate = new Date(w.date);
        return workoutDate >= dayStart && workoutDate <= dayEnd;
      });

      const dayVolume = dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
      data.push(dayVolume);
    }

    return data;
  }, [allWorkouts, today]);

  // Trend percentage calculation
  const getTrendPercentage = (current: number, previous: number) => {
    if (previous === 0) return null;
    return Math.abs(((current - previous) / previous) * 100).toFixed(0);
  };

  const volumeTrend = getTrendPercentage(stats.volumeLast7Days, stats.volumePrev7Days);
  const volumeUp = stats.volumeLast7Days > stats.volumePrev7Days;

  const workoutsTrend = getTrendPercentage(stats.workoutsLast7Days, stats.workoutsPrev7Days);
  const workoutsUp = stats.workoutsLast7Days > stats.workoutsPrev7Days;

  // Chart data: Last 30 days volume by day
  const chartData = useMemo(() => {
    const data: { date: string; volume: number; workouts: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      day.setHours(0, 0, 0, 0);

      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const dayWorkouts = allWorkouts.filter((w) => {
        const workoutDate = new Date(w.date);
        return workoutDate >= day && workoutDate <= dayEnd;
      });

      const dayVolume = dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);

      data.push({
        date: day.toISOString().split('T')[0],
        volume: Math.round(dayVolume),
        workouts: dayWorkouts.length,
      });
    }

    return data;
  }, [allWorkouts, today]);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Dashboard v2 (shadcn style)</h1>
        <p className="text-muted-foreground">Using shadcn card components</p>
      </div>

      {/* Stats Grid - 4 cards, same height, different widths */}
      <div
          className="
            grid gap-4
            grid-cols-2                 /* default: two columns */
            max-[480px]:grid-cols-1     /* only stack on very small screens */
            xl:grid-cols-4
            xl:[grid-template-columns:2fr_1fr_1fr_2fr]
            auto-rows-fr
          "
        >
        {/* Volume Card + Sparkline */}
        <Card className="flex flex-col h-full col-span-2 xl:col-span-1">
          <CardHeader className="relative flex-1 overflow-hidden pt-2 px-3">
              <div className="flex items-center justify-between">
                <CardDescription>Total Volume</CardDescription>
                {!isLoading && stats.bestWorkout && (
                  <span className="text-xs text-muted-foreground">
                    Best, {new Date(stats.bestWorkout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              <CardTitle className="text-2xl tabular-nums">
                {isLoading ? '...' : Math.round(animatedVolume).toLocaleString()}
                <span className="text-base text-muted-foreground ml-1">{weightUnit}</span>
              </CardTitle>

              {volumeTrend && (
                <div className="mt-2">
                  <Badge variant="outline">
                    {volumeUp ? <TrendingUp size={12} /> : '↓'}
                    {volumeTrend}%
                  </Badge>
                </div>
              )}

              {!isLoading && volumeSparklineData.length >= 2 && (
                <div className="pointer-events-none absolute top-8 right-6 h-[80px] w-[230px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={volumeSparklineData.map((vol, i) => ({ value: vol, index: i }))}
                      margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="miniVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>

                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill="url(#miniVolumeGradient)"
                        strokeWidth={0}
                        isAnimationActive
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardHeader>

            <CardFooter className="text-xs text-muted-foreground pb-3 px-3">
              Last 7 days
            </CardFooter>
          </Card>

        {/* Workouts Card */}
        <Card className="flex flex-col h-full">
          <CardHeader className="relative flex-1 overflow-hidden pt-2 px-3">
            <CardDescription>Workouts</CardDescription>
            <CardTitle className="text-2xl tabular-nums">
              {isLoading ? '...' : Math.round(animatedWorkouts)}
            </CardTitle>
            {workoutsTrend && (
              <div className="mt-2">
                <Badge variant="outline">
                  {workoutsUp ? <TrendingUp size={12} /> : '↓'}
                  {workoutsTrend}%
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground pb-2 px-3">
            Last 7 days
          </CardFooter>
        </Card>

        {/* PRs Card */}
        <Card className="flex flex-col h-full">
          <CardHeader className="relative flex-1 overflow-hidden pt-2 px-3">
            <div className="flex items-center justify-between">
              <CardDescription>PRs</CardDescription>
              {!isLoading && stats.daysSinceLastPR !== null && (
                <span className="text-xs text-muted-foreground">
                  Last PR {stats.daysSinceLastPR}d ago
                </span>
              )}
            </div>
            <CardTitle className="text-2xl tabular-nums">
              {isLoading ? '...' : Math.round(animatedPRs)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="text-xs text-muted-foreground pb-2 px-3">
            Last 30 days
          </CardFooter>
        </Card>

        {/* Streak Card + Visualization */}
          <Card className="flex flex-col h-full col-span-2 xl:col-span-1">
            <CardHeader className="relative flex-1 overflow-hidden pt-2 px-3">
              <div className="flex items-center justify-between">
                <CardDescription>Current Streak</CardDescription>
                {!isLoading && (
                  <span className="text-xs text-muted-foreground">
                    {todayFormatted}
                  </span>
                )}
              </div>

              <CardTitle className="text-2xl tabular-nums">
                {isLoading ? '...' : Math.round(animatedStreak)}
                <span className="text-base text-muted-foreground ml-1">days</span>
              </CardTitle>

              {/* Right streak pills: now absolutely positioned */}
              {!isLoading && (
                  <div className="mt-4 flex justify-end xl:mt-0 xl:absolute xl:right-[78px] xl:top-[36px]">
                    <StreakVisualization
                      currentStreak={stats.currentStreak}
                      workoutDates={allWorkouts.map((w) => w.date)}
                      animate
                    />
                  </div>
              )}
            </CardHeader>

            <CardFooter className="text-xs text-muted-foreground pb-2 px-3">
              Keep it going!
            </CardFooter>
          </Card>
      </div>

      {/* Volume Progression Chart */}
      <Card>
        <CardHeader>
          <CardDescription>Volume Progression</CardDescription>
          <CardTitle>Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          {!isLoading && chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-white p-3 shadow-md">
                          <div className="text-xs text-gray-500 mb-1">
                            {new Date(payload[0].payload.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="font-semibold">
                            Volume: {payload[0].value?.toLocaleString()} {weightUnit}
                          </div>
                          <div className="text-xs text-gray-500">
                            {payload[0].payload.workouts} workout{payload[0].payload.workouts !== 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#9333ea"
                  fill="url(#volumeGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {isLoading && (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              Loading chart data...
            </div>
          )}
          {!isLoading && chartData.length === 0 && (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No workout data to display
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Track your progress over time
        </CardFooter>
      </Card>
    </div>
  );
}

export default Dashboard2;
