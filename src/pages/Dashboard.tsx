import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Award, Flame } from 'lucide-react';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../contexts/AuthContext';
import { WorkoutEditModal } from '../components/WorkoutEditModal';
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

  return (
    <div className="space-y-6">
      {/* 5-Tile Hero Row - Volume spans 2 columns */}
      <div className="grid grid-cols-5 gap-6">
        {/* Volume - 2 columns, hero metric */}
        <div className="col-span-2 card-stats">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-brand-blue opacity-50" size={20} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-wide text-muted font-medium">Total Volume</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <p className="text-5xl font-bold text-primary tabular-nums">
              {isLoading ? '-' : stats.volumeLast7Days.toFixed(0)}
            </p>
            <span className="text-lg text-muted">{weightUnit}</span>
          </div>
          <p className="text-xs text-muted uppercase tracking-wide">Last 7 Days</p>
          {!isLoading && stats.volumePrev7Days > 0 && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <span className={stats.volumeLast7Days > stats.volumePrev7Days ? 'text-brand-blue' : 'text-red-400'}>
                {stats.volumeLast7Days > stats.volumePrev7Days ? '↑' : '↓'}
                {Math.abs(((stats.volumeLast7Days - stats.volumePrev7Days) / stats.volumePrev7Days) * 100).toFixed(0)}%
              </span>
              <span>vs prev 7d</span>
            </div>
          )}
        </div>

        {/* Workouts */}
        <div className="card-stats">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-brand-blue opacity-50" size={16} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-wide text-muted font-medium">Workouts</span>
          </div>
          <p className="text-5xl font-bold text-primary tabular-nums mb-2">{isLoading ? '-' : stats.workoutsLast7Days}</p>
          <p className="text-xs text-muted uppercase tracking-wide">Last 7 Days</p>
        </div>

        {/* PRs */}
        <div className="card-stats">
          <div className="flex items-center gap-2 mb-3">
            <Award className="text-brand-blue opacity-50" size={16} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-wide text-muted font-medium">PRs</span>
          </div>
          <p className="text-5xl font-bold text-primary tabular-nums mb-2">{isLoading ? '-' : stats.prsLast30Days}</p>
          <p className="text-xs text-muted uppercase tracking-wide">Last 30 Days</p>
        </div>

        {/* Streak */}
        <div className="card-stats">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="text-brand-blue opacity-50" size={16} strokeWidth={1.5} />
            <span className="text-xs uppercase tracking-wide text-muted font-medium">Streak</span>
          </div>
          <p className="text-5xl font-bold text-primary tabular-nums mb-2">{isLoading ? '-' : stats.currentStreak}</p>
          <p className="text-xs text-muted uppercase tracking-wide">Weeks</p>
        </div>
      </div>

      {/* Recent Activity - Timeline with larger top margin */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-primary mb-6 uppercase tracking-wide">Recent Activity</h2>
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
            {stats.recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="card-timeline hover:border-brand-blue transition-all group cursor-pointer"
                onClick={() => setEditingWorkoutId(workout.id)}
              >
                <div className="flex items-center justify-between pl-4">
                  {/* One-line summary + metadata */}
                  <div className="flex items-center gap-6 flex-1">
                    <h3 className="font-semibold text-primary text-sm">{workout.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="tabular-nums">{workout.totalVolume.toFixed(0)} {weightUnit}</span>
                      <span>·</span>
                      <span>{formatDuration(workout.duration)}</span>
                      <span>·</span>
                      {/* Show first 2 exercises inline */}
                      <span className="text-muted">
                        {workout.exercises.slice(0, 2).map(ex => ex.exerciseName).join(', ')}
                        {workout.exercises.length > 2 && ` +${workout.exercises.length - 2}`}
                      </span>
                    </div>
                  </div>
                  {/* Date on right only */}
                  <span className="text-xs text-muted tabular-nums">{formatDate(workout.date)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
  );
}
