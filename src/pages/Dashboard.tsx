import { useState, useEffect } from 'react';
import { Dumbbell, TrendingUp, Calendar, Award, Edit } from 'lucide-react';
import { db } from '../services/database';
import { useUserSettings } from '../hooks/useUserSettings';
import { WorkoutEditModal } from '../components/WorkoutEditModal';
import { StreakDisplay } from '../components/StreakDisplay';
import { calculateStreak } from '../utils/analytics';
import type { WorkoutLog } from '../types/workout';

interface DashboardStats {
  workoutsThisWeek: number;
  totalVolumeThisWeek: number;
  currentStreak: number;
  totalPRs: number;
  recentWorkouts: WorkoutLog[];
  allWorkouts: WorkoutLog[];
}

export function Dashboard() {
  const { weightUnit } = useUserSettings();
  const [stats, setStats] = useState<DashboardStats>({
    workoutsThisWeek: 0,
    totalVolumeThisWeek: 0,
    currentStreak: 0,
    totalPRs: 0,
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
      // Get all workouts
      const allWorkouts = await db.workoutLogs.orderBy('date').reverse().toArray();

      // Calculate this week's stats
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const workoutsThisWeek = allWorkouts.filter(w => new Date(w.date) >= startOfWeek);
      const totalVolumeThisWeek = workoutsThisWeek.reduce((sum, w) => sum + w.totalVolume, 0);

      // Calculate current streak
      const currentStreak = calculateStreak(allWorkouts);

      // Get total PRs
      const totalPRs = await db.personalRecords.count();

      // Get recent workouts (last 5)
      const recentWorkouts = allWorkouts.slice(0, 5);

      setStats({
        workoutsThisWeek: workoutsThisWeek.length,
        totalVolumeThisWeek,
        currentStreak,
        totalPRs,
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell className="text-primary-blue" size={32} />
          <div>
            <h1 className="text-3xl font-bold">GymTracker Pro</h1>
            <p className="text-gray-400">Welcome back!</p>
          </div>
        </div>
        {!isLoading && stats.allWorkouts.length > 0 && (
          <StreakDisplay workouts={stats.allWorkouts} compact />
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-primary-blue" size={20} />
            <span className="text-sm text-gray-400">This Week</span>
          </div>
          <p className="text-2xl font-bold">{isLoading ? '-' : stats.workoutsThisWeek}</p>
          <p className="text-xs text-gray-500">Workouts</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-primary-green" size={20} />
            <span className="text-sm text-gray-400">Volume</span>
          </div>
          <p className="text-2xl font-bold">
            {isLoading ? '-' : stats.totalVolumeThisWeek.toFixed(0)}
          </p>
          <p className="text-xs text-gray-500">{weightUnit} lifted this week</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-primary-yellow" size={20} />
            <span className="text-sm text-gray-400">Streak</span>
          </div>
          <p className="text-2xl font-bold">{isLoading ? '-' : stats.currentStreak}</p>
          <p className="text-xs text-gray-500">Days</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-primary-blue" size={20} />
            <span className="text-sm text-gray-400">PRs</span>
          </div>
          <p className="text-2xl font-bold">{isLoading ? '-' : stats.totalPRs}</p>
          <p className="text-xs text-gray-500">Personal records</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-elevated">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">
            <p>Loading workouts...</p>
          </div>
        ) : stats.recentWorkouts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No workouts yet</p>
            <p className="text-sm mt-2">Tap "Workout" to start your first session</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{workout.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingWorkoutId(workout.id)}
                      className="text-gray-400 hover:text-primary-blue transition-colors"
                      title="Edit workout"
                    >
                      <Edit size={16} />
                    </button>
                    <span className="text-xs text-gray-400">{formatDate(workout.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{workout.exercises.length} exercises</span>
                  <span>{workout.totalVolume.toFixed(0)} {weightUnit}</span>
                  <span>{formatDuration(workout.duration)}</span>
                </div>
                {/* Exercise List */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {workout.exercises.slice(0, 3).map((ex) => (
                    <span
                      key={ex.exerciseId}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {ex.exerciseName}
                    </span>
                  ))}
                  {workout.exercises.length > 3 && (
                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                      +{workout.exercises.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Phase Status */}
      <div className="card bg-gray-800 border border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-primary-green rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-300">Development Status</span>
        </div>
        <p className="text-xs text-gray-400">
          Phase 2: Workout Logger Complete ✅ | Phase 3: Analytics Coming Soon
        </p>
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
