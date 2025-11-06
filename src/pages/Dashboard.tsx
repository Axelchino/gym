import { useState, useEffect } from 'react';
import { Dumbbell, TrendingUp, Calendar, Award, Edit, Smartphone, Monitor } from 'lucide-react';
import { db } from '../services/database';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutEditModal } from '../components/WorkoutEditModal';
import { StreakDisplay } from '../components/StreakDisplay';
import { calculateStreak } from '../utils/analytics';
import type { WorkoutLog } from '../types/workout';
import { getWorkoutLogs, getPersonalRecords } from '../services/supabaseDataService';

interface DashboardStats {
  workoutsLast7Days: number;
  volumeLast7Days: number;
  volumePrev7Days: number;
  currentStreak: number;
  prsLast30Days: number;
  recentWorkouts: WorkoutLog[];
  allWorkouts: WorkoutLog[];
}

export function Dashboard() {
  const { weightUnit } = useUserSettings();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    workoutsLast7Days: 0,
    volumeLast7Days: 0,
    volumePrev7Days: 0,
    currentStreak: 0,
    prsLast30Days: 0,
    recentWorkouts: [],
    allWorkouts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'phone' | 'tablet'>('tablet');

  // Get user's name from metadata
  const userName = user?.user_metadata?.name as string | undefined;

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
      const prsLast30Days = allPRs.filter(pr => new Date(pr.achievedAt) >= thirtyDaysAgo).length;

      // Get recent workouts (last 5)
      const recentWorkouts = allWorkouts.slice(0, 5);

      setStats({
        workoutsLast7Days: workoutsLast7Days.length,
        volumeLast7Days,
        volumePrev7Days,
        currentStreak,
        prsLast30Days,
        recentWorkouts,
        allWorkouts,
      });
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

  // Wrapper for viewport mode
  const ViewportWrapper = ({ children }: { children: React.ReactNode }) => {
    if (viewportMode === 'phone') {
      return (
        <div className="flex justify-center bg-surface-accent min-h-screen">
          <div className="w-full max-w-[430px] bg-background min-h-screen">
            {children}
          </div>
        </div>
      );
    }
    return <>{children}</>;
  };

  return (
    <ViewportWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="text-brand-blue" size={32} />
            <div>
              <h1 className="text-3xl font-bold text-primary">GymTracker Pro</h1>
              <p className="text-secondary">
                {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Viewport Toggle */}
            <button
              onClick={() => setViewportMode(viewportMode === 'phone' ? 'tablet' : 'phone')}
              className="p-2 rounded-lg bg-surface-accent hover:bg-border-medium transition-colors"
              title={`Switch to ${viewportMode === 'phone' ? 'tablet' : 'phone'} view`}
            >
              {viewportMode === 'phone' ? (
                <Monitor size={20} className="text-secondary" />
              ) : (
                <Smartphone size={20} className="text-secondary" />
              )}
            </button>
            {!isLoading && stats.allWorkouts.length > 0 && (
              <StreakDisplay workouts={stats.allWorkouts} compact />
            )}
          </div>
        </div>

        {/* Stats Section - Phone-First Layout */}
        <div className={viewportMode === 'tablet' ? 'md:grid md:grid-cols-[35%_65%] md:gap-6' : ''}>
          {/* Left Column (Stats) - Stacked on tablet, phone-first on mobile */}
          <div className="space-y-4">
            {/* Volume Hero Card - Always first, largest */}
            <div className="card-stats accent-blue p-6">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="text-brand-blue" size={24} />
                <span className="text-sm font-medium text-secondary">Volume - Last 7 Days</span>
              </div>
              <div className="flex items-baseline gap-3 mb-2">
                <p className={`font-bold text-primary ${viewportMode === 'tablet' ? 'text-5xl md:text-6xl' : 'text-5xl'}`}>
                  {isLoading ? '-' : stats.volumeLast7Days.toFixed(0)}
                </p>
                <span className="text-xl text-muted">{weightUnit}</span>
              </div>
              {!isLoading && stats.volumePrev7Days > 0 && (
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  stats.volumeLast7Days > stats.volumePrev7Days
                    ? 'bg-primary-green/10 text-primary-green'
                    : stats.volumeLast7Days < stats.volumePrev7Days
                    ? 'bg-red-400/10 text-red-400'
                    : 'bg-surface-accent text-muted'
                }`}>
                  <span className="text-base">
                    {stats.volumeLast7Days > stats.volumePrev7Days ? '↑' : stats.volumeLast7Days < stats.volumePrev7Days ? '↓' : '→'}
                  </span>
                  <span>
                    {Math.abs(((stats.volumeLast7Days - stats.volumePrev7Days) / stats.volumePrev7Days) * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs opacity-75">vs prev 7d</span>
                </div>
              )}
              {!isLoading && stats.volumePrev7Days === 0 && (
                <p className="text-sm text-muted">No comparison data available</p>
              )}
            </div>

            {/* Quick Stats Row - Side by Side on Phone */}
            <div className="grid grid-cols-2 gap-4">
              {/* Workouts Card */}
              <div className="card-stats accent-purple">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="text-brand-purple" size={20} />
                  <span className="text-xs text-secondary">Last 7 Days</span>
                </div>
                <p className="text-3xl font-bold text-primary">{isLoading ? '-' : stats.workoutsLast7Days}</p>
                <p className="text-xs text-muted">Workouts</p>
              </div>

              {/* PRs Card */}
              <div className="card-stats accent-blue">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="text-brand-blue" size={20} />
                  <span className="text-xs text-secondary">Last 30 Days</span>
                </div>
                <p className="text-3xl font-bold text-primary">{isLoading ? '-' : stats.prsLast30Days}</p>
                <p className="text-xs text-muted">Personal Records</p>
              </div>
            </div>
          </div>

          {/* Recent Activity - Full width on phone, right column on tablet */}
          <div className={viewportMode === 'tablet' ? 'mt-6 md:mt-0' : 'mt-6'}>
            <div className="card">
              <h2 className="text-xl font-semibold text-primary mb-4">Recent Activity</h2>
              {isLoading ? (
                <div className="text-center py-8 text-secondary">
                  <p>Loading workouts...</p>
                </div>
              ) : stats.recentWorkouts.length === 0 ? (
                <div className="text-center py-8 text-secondary">
                  <p>No workouts yet</p>
                  <p className="text-sm mt-2">Tap "Workout" to start your first session</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentWorkouts.map((workout) => (
                    <div
                      key={workout.id}
                      className="card-rail accent-blue hover:border-brand-blue transition-colors cursor-pointer py-4 px-4"
                    >
                      <div className="flex items-baseline justify-between mb-3">
                        <h3 className="text-base font-bold text-primary">{workout.name}</h3>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setEditingWorkoutId(workout.id)}
                            className="text-secondary hover:text-brand-blue transition-colors"
                            title="Edit workout"
                          >
                            <Edit size={16} />
                          </button>
                          <span className="text-sm text-secondary font-medium">{formatDate(workout.date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-primary mb-3">
                        <span>{workout.exercises.length} exercises</span>
                        <span>{workout.totalVolume.toFixed(0)} {weightUnit}</span>
                        <span>{formatDuration(workout.duration)}</span>
                      </div>
                      {/* Exercise List */}
                      <div className="flex flex-wrap gap-2">
                        {workout.exercises.slice(0, 3).map((ex) => (
                          <span
                            key={ex.exerciseId}
                            className="chip"
                          >
                            {ex.exerciseName}
                          </span>
                        ))}
                        {workout.exercises.length > 3 && (
                          <span className="chip">
                            +{workout.exercises.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workout Edit Modal */}
        {editingWorkoutId && (
          <WorkoutEditModal
            workoutId={editingWorkoutId}
            onClose={() => setEditingWorkoutId(null)}
            onSave={() => {
              setEditingWorkoutId(null);
              loadDashboardStats();
            }}
          />
        )}
      </div>
    </ViewportWrapper>
  );
}
