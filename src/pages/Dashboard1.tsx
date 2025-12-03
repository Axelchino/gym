import { useState, useMemo } from 'react';
import { TrendingUp, Calendar, Award, Flame, Edit2, Share2, Copy } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../contexts/AuthContext';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useWorkouts, usePersonalRecords } from '../hooks/useWorkoutData';
import { WorkoutEditModal } from '../components/WorkoutEditModal';
import { Sparkline } from '../components/Sparkline';
import { StreakVisualization } from '../components/StreakVisualization';
import { calculateStreak } from '../utils/analytics';
import type { WorkoutLog } from '../types/workout';
import { createWorkoutTemplate } from '../services/supabaseDataService';
import { SaveTemplateModal } from '../components/SaveTemplateModal';
import { convertWorkoutLogToTemplate } from '../utils/templateConverter';
import { Chip } from '../components/ui';
import { useThemeTokens } from '../utils/themeHelpers';

function Dashboard() {
  const { weightUnit } = useUserSettings();
  const { user } = useAuth();
  const tokens = useThemeTokens();
  const queryClient = useQueryClient();

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

  // REACT QUERY: Fetch data with automatic caching
  const { data: allWorkouts = [], isLoading: workoutsLoading } = useWorkouts(
    user ? thirtyDaysAgo : undefined,
    user ? today : undefined
  );

  const { data: allPRs = [], isLoading: prsLoading } = usePersonalRecords(
    user ? thirtyDaysAgo : undefined,
    user ? today : undefined
  );

  const isLoading = workoutsLoading || prsLoading;

  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [viewingWorkoutId, setViewingWorkoutId] = useState<string | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [typeFilter, setTypeFilter] = useState<'all' | 'program' | 'free'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'heaviest' | 'duration'>('newest');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);

  // Calculate stats from React Query data
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

    return {
      workoutsLast7Days: workoutsLast7Days.length,
      workoutsPrev7Days: workoutsPrev7Days.length,
      volumeLast7Days,
      volumePrev7Days,
      currentStreak: calculateStreak(allWorkouts),
      prsLast30Days: allPRs.length,
    };
  }, [allWorkouts, allPRs, today]);

  // Animated numbers for hero tiles
  const animatedVolume = useAnimatedNumber(stats.volumeLast7Days, 400, !isLoading);
  const animatedWorkouts = useAnimatedNumber(stats.workoutsLast7Days, 350, !isLoading);
  const animatedPRs = useAnimatedNumber(stats.prsLast30Days, 350, !isLoading);
  const animatedStreak = useAnimatedNumber(stats.currentStreak, 350, !isLoading);

  // OPTIMIZATION 2: Memoize sparkline calculation (only recalculates when allWorkouts changes)
  // Shows last 7 days to match the volume chip
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

  // OPTIMIZATION 3: Memoize filtered workouts (avoid unnecessary re-renders)
  const recentWorkouts = useMemo(() => allWorkouts.slice(0, 5), [allWorkouts]);

  // Days since last PR
  const daysSinceLastPR = useMemo(() => {
    if (allPRs.length === 0) return -1;
    const lastPRDate = new Date(allPRs[0].date);
    const diffTime = today.getTime() - lastPRDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }, [allPRs, today]);

  // OPTIMIZATION 4: Memoize best day calculation (aggregate same-day workouts)
  const bestWorkout = useMemo(() => {
    if (allWorkouts.length === 0) return null;

    // Aggregate volume by day
    const dayVolumes: Record<string, number> = {};
    allWorkouts.forEach((w) => {
      const dateKey = new Date(w.date).toDateString();
      dayVolumes[dateKey] = (dayVolumes[dateKey] || 0) + w.totalVolume;
    });

    // Find best day
    let bestDate = '';
    let bestVolume = 0;
    Object.entries(dayVolumes).forEach(([dateKey, vol]) => {
      if (vol > bestVolume) {
        bestVolume = vol;
        bestDate = dateKey;
      }
    });

    const formattedDate = new Date(bestDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    // Format volume with "k" abbreviation for thousands
    const volumeK =
      bestVolume >= 1000
        ? `${(bestVolume / 1000).toFixed(bestVolume >= 10000 ? 0 : 1)}k`
        : Math.round(bestVolume).toString();
    return {
      date: formattedDate,
      volume: volumeK,
    };
  }, [allWorkouts]);

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
    <div className="space-y-6">
      {/* 5-Tile Hero Row - Volume spans 2 columns */}
      <div className="grid grid-cols-5 gap-6">
        {/* Volume - 2 columns, hero metric */}
        <div
          className="col-span-2 rounded-xl p-2.5 transition-all"
          style={{
            backgroundColor: tokens.statCard.background,
            border: `1px solid ${tokens.statCard.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = tokens.statCard.hoverBorder;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = tokens.statCard.border;
          }}
        >
          {/* Top: Label with icon and microcopy */}
          <div className="flex items-start justify-between mb-2" style={{ height: '32px' }}>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="text-muted opacity-60" size={14} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-medium tracking-wide">
                Total Volume
              </span>
            </div>
            {!isLoading && bestWorkout && (
              <div className="text-right">
                <p className="text-xs text-secondary">Best, {bestWorkout.date}</p>
              </div>
            )}
          </div>

          {/* Number - slightly offset */}
          <div
            className="flex items-baseline justify-start pl-8 mb-1"
            style={{ minHeight: '64px' }}
          >
            <p className="text-6xl font-bold tabular-nums text-primary">
              {isLoading ? (
                <span className="shimmer"></span>
              ) : (
                Math.round(animatedVolume).toLocaleString()
              )}
            </p>
            {!isLoading && (
              <span className="text-lg tabular-nums ml-2 text-secondary">{weightUnit}</span>
            )}
          </div>

          {/* Sparkline + Delta */}
          <div className="mb-3" style={{ height: '24px' }}>
            {!isLoading && volumeSparklineData.length > 0 ? (
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <Sparkline
                    data={volumeSparklineData}
                    width={200}
                    height={28}
                    color={tokens.sparkline.color}
                    peakDotColor={tokens.sparkline.peakDot}
                    strokeWidth={1}
                    animate={true}
                  />
                </div>
                {stats.volumePrev7Days > 0 && (
                  <div
                    className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor:
                        stats.volumeLast7Days > stats.volumePrev7Days
                          ? 'rgba(22, 163, 74, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)',
                      color: stats.volumeLast7Days > stats.volumePrev7Days ? '#16A34A' : '#EF4444',
                    }}
                  >
                    {stats.volumeLast7Days > stats.volumePrev7Days ? '↑' : '↓'}
                    {Math.abs(
                      ((stats.volumeLast7Days - stats.volumePrev7Days) / stats.volumePrev7Days) *
                        100
                    ).toFixed(0)}
                    %
                  </div>
                )}
              </div>
            ) : (
              <div></div>
            )}
          </div>

          {/* Label chip - bottom anchor */}
          <div>
            <Chip>Last 7 days</Chip>
          </div>
        </div>

        {/* Workouts */}
        <div
          className="rounded-xl p-2.5 transition-all"
          style={{
            backgroundColor: tokens.statCard.background,
            border: `1px solid ${tokens.statCard.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = tokens.statCard.hoverBorder;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = tokens.statCard.border;
          }}
        >
          {/* Top: Label with icon */}
          <div className="flex items-start justify-between mb-2" style={{ height: '32px' }}>
            <div className="flex items-center gap-1.5">
              <Calendar className="text-muted opacity-60" size={14} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-medium tracking-wide">
                Workouts
              </span>
            </div>
          </div>

          {/* Number - slightly offset */}
          <div
            className="flex items-baseline justify-start pl-8 mb-1"
            style={{ minHeight: '64px' }}
          >
            <p className="text-6xl font-bold tabular-nums text-primary">
              {isLoading ? <span className="shimmer"></span> : Math.round(animatedWorkouts)}
            </p>
          </div>

          {/* Visual zone - fixed height */}
          <div className="mb-3" style={{ height: '24px' }}>
            <div className="h-full"></div>
          </div>

          {/* Label chip - bottom anchor */}
          <div>
            <Chip>Last 7 days</Chip>
          </div>
        </div>

        {/* PRs */}
        <div
          className="rounded-xl p-2.5 transition-all"
          style={{
            backgroundColor: tokens.statCard.background,
            border: `1px solid ${tokens.statCard.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = tokens.statCard.hoverBorder;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = tokens.statCard.border;
          }}
        >
          {/* Top: Label with icon and microcopy */}
          <div className="flex items-start justify-between mb-2" style={{ height: '32px' }}>
            <div className="flex items-center gap-1.5">
              <Award className="text-muted opacity-60" size={14} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-medium tracking-wide">PRs</span>
            </div>
            {!isLoading && daysSinceLastPR >= 0 && (
              <p className="text-xs text-secondary">Last PR {daysSinceLastPR}d ago</p>
            )}
          </div>

          {/* Number - slightly offset */}
          <div
            className="flex items-baseline justify-start pl-8 mb-1"
            style={{ minHeight: '64px' }}
          >
            <p className="text-6xl font-bold tabular-nums text-primary">
              {isLoading ? <span className="shimmer"></span> : Math.round(animatedPRs)}
            </p>
          </div>

          {/* Visual zone - fixed height */}
          <div className="mb-3" style={{ height: '24px' }}>
            <div className="h-full"></div>
          </div>

          {/* Label chip - bottom anchor */}
          <div>
            <Chip>Last 30 days</Chip>
          </div>
        </div>

        {/* Streak */}
        <div
          className="rounded-xl p-2.5 transition-all"
          style={{
            backgroundColor: tokens.statCard.background,
            border: `1px solid ${tokens.statCard.border}`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = tokens.statCard.hoverBorder;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = tokens.statCard.border;
          }}
        >
          {/* Top: Label with icon and microcopy */}
          <div className="flex items-start justify-between mb-2" style={{ height: '32px' }}>
            <div className="flex items-center gap-1.5">
              <Flame className="text-muted opacity-60" size={14} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-medium tracking-wide">Streak</span>
            </div>
            {!isLoading && (
              <p className="text-xs text-secondary">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            )}
          </div>

          {/* Number - slightly offset */}
          <div
            className="flex items-baseline justify-start pl-8 mb-1"
            style={{ minHeight: '64px' }}
          >
            <p className="text-6xl font-bold tabular-nums text-primary">
              {isLoading ? <span className="shimmer"></span> : Math.round(animatedStreak)}
            </p>
          </div>

          {/* Visual zone: Duolingo-style streak visualization */}
          <div className="mb-3" style={{ height: '24px' }}>
            <div className="flex justify-center items-center h-full">
              {!isLoading && (
                <StreakVisualization
                  currentStreak={stats.currentStreak}
                  workoutDates={allWorkouts.map((w) => w.date)}
                  animate={true}
                />
              )}
            </div>
          </div>

          {/* Label chip - bottom anchor */}
          <div>
            <Chip>Weekly</Chip>
          </div>
        </div>
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
                              icon.style.color = tokens.interactive.hoverPurple;
                              icon.style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              icon.style.color = '';
                              icon.style.opacity = '0.6';
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
                              icon.style.color = tokens.interactive.hoverPurple;
                              icon.style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              icon.style.color = '';
                              icon.style.opacity = '0.6';
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
                              icon.style.color = tokens.interactive.hoverPurple;
                              icon.style.opacity = '1';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const icon = e.currentTarget.querySelector('svg');
                            if (icon) {
                              icon.style.color = '';
                              icon.style.opacity = '0.6';
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

export default Dashboard;
