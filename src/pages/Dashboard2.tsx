import { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Award, Flame, Edit2, Share2, Copy } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useWorkouts, usePersonalRecords } from '../hooks/useWorkoutData';
import { useUserSettings } from '../hooks/useUserSettings';
import { Sparkline } from '../components/Sparkline';
import { StreakVisualization } from '../components/StreakVisualization';
import { calculateStreak } from '../utils/analytics';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import { WorkoutEditModal } from '../components/WorkoutEditModal';
import { SaveTemplateModal } from '../components/SaveTemplateModal';
import { Chip } from '../components/ui';
import { useThemeTokens } from '../utils/themeHelpers';
import type { WorkoutLog } from '../types/workout';
import { createWorkoutTemplate } from '../services/supabaseDataService';
import { convertWorkoutLogToTemplate } from '../utils/templateConverter';

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
  const tokens = useThemeTokens();
  const queryClient = useQueryClient();

  // Recent Activity state
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [viewingWorkoutId, setViewingWorkoutId] = useState<string | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [typeFilter, setTypeFilter] = useState<'all' | 'program' | 'free'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'heaviest' | 'duration'>('newest');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);

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

  // Recent workouts for activity feed
  const recentWorkouts = useMemo(() => allWorkouts.slice(0, 5), [allWorkouts]);

  // Helper functions
  function formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  }

  function formatDuration(minutes?: number): string {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  // Toggle workout expansion
  function toggleWorkoutExpansion(workoutId: string) {
    setExpandedWorkouts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  }

  // Convert workout to template
  function handleConvertToTemplate(workout: WorkoutLog) {
    setSelectedWorkout(workout);
    setShowSaveTemplateModal(true);
  }

  // Save workout as template
  async function handleSaveAsTemplate(templateName: string) {
    if (!selectedWorkout) return;

    try {
      const templateData = convertWorkoutLogToTemplate(selectedWorkout, templateName);
      await createWorkoutTemplate(templateData);
      setShowSaveTemplateModal(false);
      setSelectedWorkout(null);
      alert(`Template "${templateName}" created successfully!`);
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  }

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
                    margin={{ top: 2, right: 0, left: 0, bottom: 3 }}
                  >
                    <defs>
                      <linearGradient id="miniVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>

                    {/* Invisible Y-axis to establish scale starting at 0 */}
                    <YAxis domain={[0, 'dataMax']} hide />

                    {/* Zero baseline - visible reference line */}
                    <ReferenceLine
                      y={0}
                      stroke="#a78bfa"
                      strokeWidth={2}
                      strokeDasharray="0"
                    />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#9333ea"
                      strokeWidth={1.5}
                      fill="url(#miniVolumeGradient)"
                      isAnimationActive
                      baseValue={0}
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
          <CardFooter className="text-xs text-muted-foreground pb-3 px-3">
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
          <CardFooter className="text-xs text-muted-foreground pb-3 px-3">
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

            <CardFooter className="text-xs text-muted-foreground pb-3 px-3">
              Keep it going!
            </CardFooter>
          </Card>
      </div>

      {/* Recent Activity - Diary format */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary uppercase tracking-wide">
            Recent Activity
          </h2>

          {/* Feed Controls */}
          {!isLoading && recentWorkouts.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              {/* Period Filter */}
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as '7d' | '30d' | '90d')}
                className="px-3 py-1.5 border border-border-subtle rounded-md bg-card text-primary text-xs focus:outline-none"
                style={{
                  // @ts-expect-error CSS custom property for Tailwind
                  '--tw-ring-color': '#6F5AE8',
                }}
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px rgba(126, 41, 255, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="90d">90 days</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'all' | 'program' | 'free')}
                className="px-3 py-1.5 border border-border-subtle rounded-md bg-card text-primary text-xs focus:outline-none"
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px rgba(126, 41, 255, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="all">All</option>
                <option value="program">Program</option>
                <option value="free">Free</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'heaviest' | 'duration')}
                className="px-3 py-1.5 border border-border-subtle rounded-md bg-card text-primary text-xs focus:outline-none"
                onFocus={(e) => {
                  e.target.style.boxShadow = '0 0 0 2px rgba(126, 41, 255, 0.5)';
                }}
                onBlur={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="newest">Newest</option>
                <option value="heaviest">Heaviest</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-secondary">
            <p className="text-sm">Loading workouts...</p>
          </div>
        ) : recentWorkouts.length === 0 ? (
          <div className="text-center py-12">
            {!user ? (
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-base font-medium text-primary">Start your fitness journey</p>
                <p className="text-sm text-secondary">
                  Sign up to track your workouts and save your progress
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => (window.location.href = '/auth')}
                    className="text-sm font-semibold px-5 py-2.5 rounded-md transition-all"
                    style={{
                      backgroundColor: tokens.button.primaryBg,
                      color: tokens.button.primaryText,
                      border:
                        tokens.button.primaryBorder === 'none'
                          ? 'none'
                          : `1px solid ${tokens.button.primaryBorder}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.button.primaryHover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = tokens.button.primaryBg;
                    }}
                  >
                    Sign Up Free
                  </button>
                  <button
                    onClick={() => (window.location.href = '/workout')}
                    className="text-sm font-medium px-5 py-2.5 rounded-md transition-all"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    Try a Workout
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-secondary">
                <p className="text-sm">No workouts yet</p>
                <p className="text-xs mt-2 text-muted">Click "Start Workout" to begin</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {recentWorkouts.map((workout) => {
              const isExpanded = expandedWorkouts.has(workout.id);
              const firstFourExercises = workout.exercises.slice(0, 4);
              const remainingCount = Math.max(0, workout.exercises.length - 4);

              return (
                <div
                  key={workout.id}
                  onClick={() => setViewingWorkoutId(workout.id)}
                  className="bg-card border border-border-subtle rounded-md transition-all group relative cursor-pointer"
                  style={{
                    borderColor: 'var(--border-subtle)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = tokens.interactive.hoverPurple;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  {/* Two-column grid layout */}
                  <div className="grid grid-cols-[1fr,160px] gap-4 p-4">
                    {/* Left column */}
                    <div className="space-y-2">
                      {/* Line 1: Title + metadata */}
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-semibold text-primary text-sm">{workout.name}</h3>
                        <span className="text-xs text-muted">
                          · {workout.totalVolume.toFixed(0)} {weightUnit} ·{' '}
                          {formatDuration(workout.duration)}
                        </span>
                      </div>

                      {/* Line 2: Exercise tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {firstFourExercises.map((exercise, idx) => (
                          <Chip key={idx}>{exercise.exerciseName}</Chip>
                        ))}
                        {remainingCount > 0 && !isExpanded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWorkoutExpansion(workout.id);
                            }}
                            className="text-xs hover:underline font-medium"
                            style={{ color: tokens.interactive.linkPurple }}
                          >
                            +{remainingCount} more
                          </button>
                        )}
                        {isExpanded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWorkoutExpansion(workout.id);
                            }}
                            className="text-xs hover:underline font-medium"
                            style={{ color: tokens.interactive.linkPurple }}
                          >
                            show less
                          </button>
                        )}
                      </div>

                      {/* Expanded exercise list */}
                      {isExpanded && workout.exercises.length > 4 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {workout.exercises.slice(4).map((exercise, idx) => (
                            <Chip key={idx}>{exercise.exerciseName}</Chip>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right column: Date and actions */}
                    <div
                      className="flex flex-col items-end justify-between"
                      style={{ width: '120px' }}
                    >
                      <span className="text-xs text-muted tabular-nums">
                        {formatDate(workout.date)}
                      </span>

                      {/* Row actions (visible on hover) */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingWorkoutId(workout.id);
                          }}
                          className="p-1.5 rounded hover:bg-surface-accent transition-all group/btn"
                          title="Edit"
                          onMouseEnter={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              (icon as SVGElement).style.color = tokens.interactive.hoverPurple;
                              (icon as SVGElement).style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              (icon as SVGElement).style.color = '';
                              (icon as SVGElement).style.opacity = '0.6';
                            }
                          }}
                        >
                          <Edit2
                            size={14}
                            strokeWidth={1.5}
                            className="text-secondary transition-all"
                            style={{ opacity: 0.6 }}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConvertToTemplate(workout);
                          }}
                          className="p-1.5 rounded hover:bg-surface-accent transition-all group/btn"
                          title="Save as Template"
                          onMouseEnter={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              (icon as SVGElement).style.color = tokens.interactive.hoverPurple;
                              (icon as SVGElement).style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              (icon as SVGElement).style.color = '';
                              (icon as SVGElement).style.opacity = '0.6';
                            }
                          }}
                        >
                          <Copy
                            size={14}
                            strokeWidth={1.5}
                            className="text-secondary transition-all"
                            style={{ opacity: 0.6 }}
                          />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement share functionality
                            alert('Share feature coming soon!');
                          }}
                          className="p-1.5 rounded hover:bg-surface-accent transition-all group/btn"
                          title="Share"
                          onMouseEnter={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              (icon as SVGElement).style.color = tokens.interactive.hoverPurple;
                              (icon as SVGElement).style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              (icon as SVGElement).style.color = '';
                              (icon as SVGElement).style.opacity = '0.6';
                            }
                          }}
                        >
                          <Share2
                            size={14}
                            strokeWidth={1.5}
                            className="text-secondary transition-all"
                            style={{ opacity: 0.6 }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Workout View Modal */}
      {viewingWorkoutId && (
        <WorkoutEditModal
          workoutId={viewingWorkoutId}
          onClose={() => setViewingWorkoutId(null)}
          onSave={() => {
            setViewingWorkoutId(null);
            // Invalidate React Query cache to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
          }}
          readOnly={true}
        />
      )}

      {/* Workout Edit Modal */}
      {editingWorkoutId && (
        <WorkoutEditModal
          workoutId={editingWorkoutId}
          onClose={() => setEditingWorkoutId(null)}
          onSave={() => {
            setEditingWorkoutId(null);
            // Invalidate React Query cache to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
          }}
          readOnly={false}
        />
      )}

      {/* Save Template Modal */}
      {showSaveTemplateModal && selectedWorkout && (
        <SaveTemplateModal
          defaultName={selectedWorkout.name}
          onSave={handleSaveAsTemplate}
          onClose={() => {
            setShowSaveTemplateModal(false);
            setSelectedWorkout(null);
          }}
        />
      )}
    </div>
  );
}

export default Dashboard2;
