import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Award, Flame, Edit2, Share2 } from 'lucide-react';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../contexts/AuthContext';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { WorkoutEditModal } from '../components/WorkoutEditModal';
import { Sparkline } from '../components/Sparkline';
import { StreakVisualization } from '../components/StreakVisualization';
import { calculateStreak } from '../utils/analytics';
import type { WorkoutLog } from '../types/workout';
import { getWorkoutLogs, getPersonalRecords } from '../services/supabaseDataService';

interface DashboardStats {
  workoutsLast7Days: number;
  workoutsPrev7Days: number;
  volumeLast7Days: number;
  volumePrev7Days: number;
  currentStreak: number;
  prsLast30Days: number;
  recentWorkouts: WorkoutLog[];
  allWorkouts: WorkoutLog[];
  volumeSparklineData: number[];
}

export function Dashboard() {
  const { weightUnit } = useUserSettings();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    workoutsLast7Days: 0,
    workoutsPrev7Days: 0,
    volumeLast7Days: 0,
    volumePrev7Days: 0,
    currentStreak: 0,
    prsLast30Days: 0,
    recentWorkouts: [],
    allWorkouts: [],
    volumeSparklineData: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [viewingWorkoutId, setViewingWorkoutId] = useState<string | null>(null);
  const [daysSinceLastPR, setDaysSinceLastPR] = useState<number>(-1);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [periodFilter, setPeriodFilter] = useState<'7d' | '30d' | '90d'>('7d');
  const [typeFilter, setTypeFilter] = useState<'all' | 'program' | 'free'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'heaviest' | 'duration'>('newest');

  // Animated numbers for hero tiles
  const animatedVolume = useAnimatedNumber(stats.volumeLast7Days, 400, !isLoading);
  const animatedWorkouts = useAnimatedNumber(stats.workoutsLast7Days, 350, !isLoading);
  const animatedPRs = useAnimatedNumber(stats.prsLast30Days, 350, !isLoading);
  const animatedStreak = useAnimatedNumber(stats.currentStreak, 350, !isLoading);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  async function loadDashboardStats() {
    setIsLoading(true);

    try {
      // Get all workouts from Supabase
      const allWorkouts = await getWorkoutLogs();

      // Calculate rolling 7-day windows
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(today.getDate() - 14);
      fourteenDaysAgo.setHours(0, 0, 0, 0);

      // Last 7 days (rolling window)
      const workoutsLast7Days = allWorkouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= sevenDaysAgo && workoutDate <= today;
      });
      const volumeLast7Days = workoutsLast7Days.reduce((sum, w) => sum + w.totalVolume, 0);

      // Previous 7 days (for comparison)
      const workoutsPrev7Days = allWorkouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= fourteenDaysAgo && workoutDate < sevenDaysAgo;
      });
      const volumePrev7Days = workoutsPrev7Days.reduce((sum, w) => sum + w.totalVolume, 0);

      // Calculate current streak (in weeks)
      const currentStreak = calculateStreak(allWorkouts);

      // Get PRs from last 30 days
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      const allPRs = await getPersonalRecords();
      const prsLast30Days = allPRs.filter(pr => new Date(pr.date) >= thirtyDaysAgo).length;

      // Get recent workouts (last 5)
      const recentWorkouts = allWorkouts.slice(0, 5);

      // Calculate volume sparkline data (last 14 days for trend)
      const volumeSparklineData: number[] = [];
      for (let i = 13; i >= 0; i--) {
        const dayStart = new Date(today);
        dayStart.setDate(today.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);

        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);

        const dayWorkouts = allWorkouts.filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate >= dayStart && workoutDate <= dayEnd;
        });

        const dayVolume = dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0);
        volumeSparklineData.push(dayVolume);
      }

      setStats({
        workoutsLast7Days: workoutsLast7Days.length,
        workoutsPrev7Days: workoutsPrev7Days.length,
        volumeLast7Days,
        volumePrev7Days,
        currentStreak,
        prsLast30Days,
        recentWorkouts,
        allWorkouts,
        volumeSparklineData,
      });

      // Load days since last PR
      const days = await getDaysSinceLastPR();
      setDaysSinceLastPR(days);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }

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

  // Get best day for volume
  function getBestVolumeDay(): string {
    if (stats.allWorkouts.length === 0) return '';

    const dayVolumes: Record<string, number> = {};
    stats.allWorkouts.forEach(w => {
      const day = new Date(w.date).toLocaleDateString('en-US', { weekday: 'short' });
      dayVolumes[day] = (dayVolumes[day] || 0) + w.totalVolume;
    });

    let maxDay = '';
    let maxVolume = 0;
    Object.entries(dayVolumes).forEach(([day, vol]) => {
      if (vol > maxVolume) {
        maxVolume = vol;
        maxDay = day;
      }
    });

    return maxDay;
  }

  // Get days since last PR
  async function getDaysSinceLastPR(): Promise<number> {
    try {
      const allPRs = await getPersonalRecords();
      if (allPRs.length === 0) return -1;

      const sortedPRs = allPRs.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      const lastPRDate = new Date(sortedPRs[0].date);
      const today = new Date();
      const diffTime = today.getTime() - lastPRDate.getTime();
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return -1;
    }
  }

  // Calculate progress to next week (0-100%)
  function getWeekProgress(): number {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday = 0
    return (daysSinceMonday / 7) * 100;
  }

  // Toggle workout expansion
  function toggleWorkoutExpansion(workoutId: string) {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  }

  // Calculate average set volume
  function getAvgSetVolume(): number {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentWorkouts = stats.allWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate >= sevenDaysAgo && workoutDate <= today;
    });

    let totalSets = 0;
    let totalVolume = 0;

    recentWorkouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.completed && set.weight && set.reps) {
            totalSets++;
            totalVolume += set.weight * set.reps;
          }
        });
      });
    });

    return totalSets > 0 ? totalVolume / totalSets : 0;
  }

  return (
    <div className="space-y-6">
      {/* 5-Tile Hero Row - Volume spans 2 columns */}
      <div className="grid grid-cols-5 gap-6">
        {/* Volume - 2 columns, hero metric */}
        <div className="col-span-2 card-stats">
          {/* Top: Label with icon and microcopy */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="text-muted opacity-60" size={14} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-medium tracking-wide">Total Volume</span>
            </div>
            {!isLoading && getBestVolumeDay() && (
              <p className="text-xs text-secondary">Best day {getBestVolumeDay()}</p>
            )}
          </div>

          {/* Number - slightly offset */}
          <div className="flex items-center justify-start pl-8 mb-1" style={{ minHeight: '60px' }}>
            <p className="text-5xl font-bold tabular-nums" style={{ color: '#111216' }}>
              {isLoading ? <span className="shimmer"></span> : Math.round(animatedVolume).toLocaleString()}
            </p>
            {!isLoading && <span className="text-base tabular-nums ml-2" style={{ color: '#6B7280' }}>{weightUnit}</span>}
          </div>

          {/* Sparkline + Delta */}
          <div className="flex items-center justify-between mb-3">
            {!isLoading && stats.volumeSparklineData.length > 0 && (
              <div className="flex-1">
                <Sparkline
                  data={stats.volumeSparklineData}
                  width={200}
                  height={28}
                  color="#B482FF"
                  peakDotColor="#7E29FF"
                  strokeWidth={1}
                  animate={true}
                />
              </div>
            )}
            {!isLoading && stats.volumePrev7Days > 0 && (
              <div className="ml-3 inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold" style={{
                backgroundColor: stats.volumeLast7Days > stats.volumePrev7Days ? 'rgba(22, 163, 74, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: stats.volumeLast7Days > stats.volumePrev7Days ? '#16A34A' : '#EF4444'
              }}>
                {stats.volumeLast7Days > stats.volumePrev7Days ? '↑' : '↓'}
                {Math.abs(((stats.volumeLast7Days - stats.volumePrev7Days) / stats.volumePrev7Days) * 100).toFixed(0)}%
              </div>
            )}
          </div>

          {/* Label chip - bottom anchor */}
          <div>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded" style={{
              backgroundColor: '#EDE0FF',
              color: '#111216'
            }}>Last 7 days</span>
          </div>
        </div>

        {/* Workouts */}
        <div className="card-stats">
          {/* Top: Label with icon */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="text-muted opacity-60" size={14} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-medium tracking-wide">Workouts</span>
            </div>
          </div>

          {/* Number - slightly offset */}
          <div className="flex items-center justify-start pl-8 mb-1" style={{ minHeight: '60px' }}>
            <p className="text-5xl font-bold tabular-nums" style={{ color: '#111216' }}>
              {isLoading ? <span className="shimmer"></span> : Math.round(animatedWorkouts)}
            </p>
          </div>

          {/* Spacer */}
          <div className="mb-3" style={{ height: '28px' }}></div>

          {/* Label chip - bottom anchor */}
          <div>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded" style={{
              backgroundColor: '#EDE0FF',
              color: '#111216'
            }}>Last 7 days</span>
          </div>
        </div>

        {/* PRs */}
        <div className="card-stats">
          {/* Top: Label with icon and microcopy */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Award className="text-muted opacity-60" size={14} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-medium tracking-wide">PRs</span>
            </div>
            {!isLoading && daysSinceLastPR >= 0 && (
              <p className="text-xs text-secondary">Last PR {daysSinceLastPR}d ago</p>
            )}
          </div>

          {/* Number - slightly offset */}
          <div className="flex items-center justify-start pl-8 mb-1" style={{ minHeight: '60px' }}>
            <p className="text-5xl font-bold tabular-nums" style={{ color: '#111216' }}>
              {isLoading ? <span className="shimmer"></span> : Math.round(animatedPRs)}
            </p>
          </div>

          {/* Spacer */}
          <div className="mb-3" style={{ height: '28px' }}></div>

          {/* Label chip - bottom anchor */}
          <div>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded" style={{
              backgroundColor: '#EDE0FF',
              color: '#111216'
            }}>Last 30 days</span>
          </div>
        </div>

        {/* Streak */}
        <div className="card-stats">
          {/* Top: Label with icon and microcopy */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Flame className="text-muted opacity-60" size={14} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-medium tracking-wide">Streak</span>
            </div>
            {!isLoading && (
              <p className="text-xs text-secondary">
                Week {Math.floor(new Date().getDate() / 7) + 1} of 4
              </p>
            )}
          </div>

          {/* Number - slightly offset */}
          <div className="flex items-center justify-start pl-8 mb-1" style={{ minHeight: '60px' }}>
            <p className="text-5xl font-bold tabular-nums" style={{ color: '#111216' }}>
              {isLoading ? <span className="shimmer"></span> : Math.round(animatedStreak)}
            </p>
          </div>

          {/* Visual zone: Duolingo-style streak visualization */}
          <div className="mb-4 flex justify-center items-center" style={{ height: '28px' }}>
            {!isLoading && (
              <StreakVisualization
                currentStreak={stats.currentStreak}
                workoutDates={stats.allWorkouts.map(w => w.date)}
                totalDays={7}
                animate={true}
              />
            )}
          </div>

          {/* Label chip - bottom anchor */}
          <div>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded" style={{
              backgroundColor: '#EDE0FF',
              color: '#111216'
            }}>Weekly</span>
          </div>
        </div>
      </div>

      {/* Recent Activity - Diary format */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-primary uppercase tracking-wide">Recent Activity</h2>

          {/* Feed Controls */}
          {!isLoading && stats.recentWorkouts.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              {/* Period Filter */}
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as any)}
                className="px-3 py-1.5 border border-border-subtle rounded-md bg-card text-primary text-xs focus:outline-none"
                style={{
                  '--tw-ring-color': '#6F5AE8'
                } as any}
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
                onChange={(e) => setTypeFilter(e.target.value as any)}
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
                onChange={(e) => setSortBy(e.target.value as any)}
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
        ) : stats.recentWorkouts.length === 0 ? (
          <div className="text-center py-12 text-secondary">
            <p className="text-sm">No workouts yet</p>
            <p className="text-xs mt-2 text-muted">Click "Start Workout" to begin</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentWorkouts.map((workout) => {
              const isExpanded = expandedWorkouts.has(workout.id);
              const firstFourExercises = workout.exercises.slice(0, 4);
              const remainingCount = Math.max(0, workout.exercises.length - 4);

              return (
                <div
                  key={workout.id}
                  onClick={() => setViewingWorkoutId(workout.id)}
                  className="bg-card border border-border-subtle rounded-md transition-all group relative cursor-pointer"
                  style={{
                    borderColor: 'var(--border-subtle)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#7E29FF';
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
                          · {workout.totalVolume.toFixed(0)} {weightUnit} · {formatDuration(workout.duration)}
                        </span>
                      </div>

                      {/* Line 2: Exercise tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {firstFourExercises.map((exercise, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 text-xs rounded"
                            style={{
                              backgroundColor: idx < 4 ? '#EDE0FF' : '#F5F5F5',
                              color: '#111216'
                            }}
                          >
                            {exercise.exerciseName}
                          </span>
                        ))}
                        {remainingCount > 0 && !isExpanded && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWorkoutExpansion(workout.id);
                            }}
                            className="text-xs hover:underline font-medium"
                            style={{ color: '#7E29FF' }}
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
                            style={{ color: '#7E29FF' }}
                          >
                            show less
                          </button>
                        )}
                      </div>

                      {/* Expanded exercise list */}
                      {isExpanded && workout.exercises.length > 4 && (
                        <div className="flex items-center gap-2 flex-wrap pt-1">
                          {workout.exercises.slice(4).map((exercise, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 text-xs rounded"
                              style={{
                                backgroundColor: '#F5F5F5',
                                color: '#111216'
                              }}
                            >
                              {exercise.exerciseName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right column: Date and actions */}
                    <div className="flex flex-col items-end justify-between" style={{ width: '120px' }}>
                      <span className="text-xs text-muted tabular-nums">{formatDate(workout.date)}</span>

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
                              icon.style.color = '#7E29FF';
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
                          <Edit2 size={14} strokeWidth={1.5} className="text-secondary transition-all" style={{ opacity: 0.6 }} />
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
                              icon.style.color = '#7E29FF';
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
                          <Share2 size={14} strokeWidth={1.5} className="text-secondary transition-all" style={{ opacity: 0.6 }} />
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
            loadDashboardStats();
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
            loadDashboardStats();
          }}
          readOnly={false}
        />
      )}
    </div>
  );
}
