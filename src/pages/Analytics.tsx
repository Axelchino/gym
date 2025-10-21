import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Award, Trophy, Zap, Dumbbell, Calendar, Filter, Download, X } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { db } from '../services/database';
import { calculateWorkoutStats, calculateStreak, getExerciseProgression, calculate1RM } from '../utils/analytics';
import type { PersonalRecord } from '../utils/analytics';
import type { WorkoutLog } from '../types/workout';
import { useUserSettings } from '../hooks/useUserSettings';
import { exportWorkoutLogsToCSV, downloadCSV } from '../utils/csvExport';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { StreakDisplay } from '../components/StreakDisplay';

export function Analytics() {
  const { weightUnit } = useUserSettings();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [allPRs, setAllPRs] = useState<PersonalRecord[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseList, setExerciseList] = useState<{ id: string; name: string }[]>([]);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<{ date: Date; workouts: WorkoutLog[] } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    // Load all workouts
    const allWorkouts = await db.workoutLogs
      .orderBy('date')
      .reverse()
      .toArray();
    setWorkouts(allWorkouts);

    // Load all PRs
    const prs = await db.personalRecords
      .orderBy('date')
      .reverse()
      .toArray();
    setAllPRs(prs);

    // Get PRs from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recent = prs.filter(pr => new Date(pr.date) >= thirtyDaysAgo);
    setRecentPRs(recent);

    // Get unique exercises from workouts
    const exerciseMap = new Map<string, string>();
    allWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        if (!exerciseMap.has(ex.exerciseId)) {
          exerciseMap.set(ex.exerciseId, ex.exerciseName);
        }
      });
    });
    const exercises = Array.from(exerciseMap.entries()).map(([id, name]) => ({ id, name }));
    setExerciseList(exercises.sort((a, b) => a.name.localeCompare(b.name)));
  }

  // Calculate stats
  const stats = calculateWorkoutStats(workouts);
  const streak = calculateStreak(workouts);

  // Filter workouts by time
  const getFilteredWorkouts = () => {
    const now = new Date();
    const filterDate = new Date();

    switch (timeFilter) {
      case '7d':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        filterDate.setDate(now.getDate() - 90);
        break;
      case 'all':
        return workouts;
    }

    return workouts.filter(w => new Date(w.date) >= filterDate);
  };

  const filteredWorkouts = getFilteredWorkouts();

  // Prepare volume chart data
  const volumeData = filteredWorkouts
    .slice()
    .reverse()
    .map(w => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: w.totalVolume,
      sets: w.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => !s.isWarmup).length, 0),
    }));

  // Prepare exercise progression data
  const progressionData = selectedExercise
    ? getExerciseProgression(selectedExercise, filteredWorkouts)
        .slice()
        .reverse()
        .map(p => ({
          date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          weight: p.bestSet.weight,
          reps: p.bestSet.reps,
          estimated1RM: p.estimated1RM,
          volume: p.totalVolume,
        }))
    : [];

  const prIcon = (type: string) => {
    switch (type) {
      case 'weight': return <TrendingUp size={18} className="text-primary-blue" />;
      case 'reps': return <Zap size={18} className="text-primary-yellow" />;
      case 'volume': return <Dumbbell size={18} className="text-primary-green" />;
      case '1rm': return <Trophy size={18} className="text-primary-yellow" />;
      default: return <Award size={18} className="text-gray-400" />;
    }
  };

  const prTypeLabel = (type: string) => {
    switch (type) {
      case 'weight': return 'Weight PR';
      case 'reps': return 'Rep PR';
      case 'volume': return 'Volume PR';
      case '1rm': return '1RM PR';
      default: return 'PR';
    }
  };

  function handleExportWorkoutHistory() {
    if (workouts.length === 0) {
      alert('No workout history to export');
      return;
    }

    const csv = exportWorkoutLogsToCSV(workouts);
    const filename = `workout-history-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(csv, filename);
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Progress & Analytics</h1>
          <p className="text-gray-400">Track your strength gains and volume trends</p>
        </div>
        {workouts.length > 0 && (
          <button
            onClick={handleExportWorkoutHistory}
            className="flex items-center gap-2 btn-secondary px-4 py-2"
            title="Export all workout history"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export History</span>
          </button>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="text-primary-blue" size={24} />
            <h3 className="font-semibold">Total Workouts</h3>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalWorkouts}</p>
          <p className="text-sm text-gray-400">All time</p>
        </div>

        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="text-primary-green" size={24} />
            <h3 className="font-semibold">Total Volume</h3>
          </div>
          <p className="text-3xl font-bold mb-1">{stats.totalVolume.toFixed(0)}</p>
          <p className="text-sm text-gray-400">{weightUnit} lifted</p>
        </div>

        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-3">
            <Award className="text-primary-yellow" size={24} />
            <h3 className="font-semibold">Recent PRs</h3>
          </div>
          <p className="text-3xl font-bold mb-1">{recentPRs.length}</p>
          <p className="text-sm text-gray-400">Last 30 days</p>
        </div>

        <div className="card-elevated">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="text-primary-blue" size={24} />
            <h3 className="font-semibold">Streak</h3>
          </div>
          <p className="text-3xl font-bold mb-1">{streak}</p>
          <p className="text-sm text-gray-400">Day{streak !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Time Filter */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-400" />
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeFilter === filter
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {filter === 'all' ? 'All Time' : filter === '7d' ? '7 Days' : filter === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Volume Over Time Chart */}
      {volumeData.length > 0 ? (
        <div className="card-elevated">
          <h2 className="text-xl font-semibold mb-4">Volume Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Bar dataKey="volume" fill="#3B82F6" name={`Volume (${weightUnit})`} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="card-elevated">
          <h2 className="text-xl font-semibold mb-4">Volume Over Time</h2>
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
            No workout data yet. Complete your first workout to see charts!
          </div>
        </div>
      )}

      {/* Exercise Progression Chart */}
      <div className="card-elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Exercise Progression</h2>
          <select
            value={selectedExercise || ''}
            onChange={(e) => setSelectedExercise(e.target.value || null)}
            className="input text-sm py-2"
          >
            <option value="">Select an exercise</option>
            {exerciseList.map(ex => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>
        </div>

        {progressionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="left" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Legend wrapperStyle={{ fontSize: '14px' }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weight"
                stroke="#3B82F6"
                name={`Weight (${weightUnit})`}
                strokeWidth={2}
                dot={{ fill: '#3B82F6', r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="estimated1RM"
                stroke="#EAB308"
                name={`Est. 1RM (${weightUnit})`}
                strokeWidth={2}
                dot={{ fill: '#EAB308', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center text-gray-500">
            {selectedExercise ? 'No data for this exercise' : 'Select an exercise to view progression'}
          </div>
        )}
      </div>

      {/* PR Timeline */}
      <div className="card-elevated">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="text-primary-yellow" size={24} />
          Personal Records Timeline
        </h2>

        {allPRs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allPRs.map((pr, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-primary-blue/30 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {prIcon(pr.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{pr.exerciseName}</h3>
                        <span className="text-xs font-bold text-primary-yellow uppercase tracking-wide">
                          {prTypeLabel(pr.type)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        {pr.type === 'weight' && (
                          <p>
                            <span className="text-primary-blue font-bold">{pr.weight}{weightUnit}</span> × {pr.reps} reps
                            {pr.previousRecord && (
                              <span className="text-gray-500 ml-2">
                                (+{(pr.improvement || 0).toFixed(1)}{weightUnit})
                              </span>
                            )}
                          </p>
                        )}
                        {pr.type === 'reps' && (
                          <p>
                            <span className="text-primary-blue font-bold">{pr.reps} reps</span> at {pr.weight}{weightUnit}
                            {pr.previousRecord && (
                              <span className="text-gray-500 ml-2">
                                (+{pr.improvement} reps)
                              </span>
                            )}
                          </p>
                        )}
                        {pr.type === 'volume' && (
                          <p>
                            <span className="text-primary-blue font-bold">{pr.value.toFixed(0)} {weightUnit}</span> single-set volume
                            {pr.previousRecord && (
                              <span className="text-gray-500 ml-2">
                                (+{(pr.improvement || 0).toFixed(0)}{weightUnit})
                              </span>
                            )}
                          </p>
                        )}
                        {pr.type === '1rm' && (
                          <p>
                            <span className="text-primary-blue font-bold">{pr.value.toFixed(1)}{weightUnit}</span> estimated 1RM
                            {pr.previousRecord && (
                              <span className="text-gray-500 ml-2">
                                (+{(pr.improvement || 0).toFixed(1)}{weightUnit})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-500">
            <Trophy size={48} className="mx-auto mb-3 opacity-30" />
            <p>No personal records yet</p>
            <p className="text-sm mt-2">Complete workouts and push yourself to set new PRs!</p>
          </div>
        )}
      </div>

      {/* Workout Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card-elevated">
          <h3 className="text-lg font-semibold mb-3">Overall Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Sets:</span>
              <span className="font-semibold">{stats.totalSets}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Reps:</span>
              <span className="font-semibold">{stats.totalReps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Duration:</span>
              <span className="font-semibold">{stats.averageDuration.toFixed(0)} min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Average Volume:</span>
              <span className="font-semibold">{stats.averageVolume.toFixed(0)} {weightUnit}</span>
            </div>
          </div>
        </div>

        <div className="card-elevated">
          <h3 className="text-lg font-semibold mb-3">Most Frequent Exercises</h3>
          <div className="space-y-2 text-sm">
            {stats.mostFrequentExercises.slice(0, 5).map((ex, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-gray-300 truncate">{ex.exerciseName}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 bg-gray-700 rounded-full w-20">
                    <div
                      className="h-2 bg-primary-blue rounded-full"
                      style={{
                        width: `${(ex.count / stats.mostFrequentExercises[0].count) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-gray-400 text-xs w-8 text-right">{ex.count}×</span>
                </div>
              </div>
            ))}
            {stats.mostFrequentExercises.length === 0 && (
              <p className="text-gray-500 text-center py-4">No exercise data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Calendar & Streak Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StreakDisplay workouts={workouts} />
        <CalendarHeatmap
          workouts={workouts}
          onDateClick={(date, dayWorkouts) => setSelectedDateWorkouts({ date, workouts: dayWorkouts })}
        />
      </div>

      {/* Workout Details Modal */}
      {selectedDateWorkouts && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {selectedDateWorkouts.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <button
                onClick={() => setSelectedDateWorkouts(null)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Workouts */}
            <div className="space-y-4">
              {selectedDateWorkouts.workouts.map((workout, idx) => (
                <div key={workout.id} className="card bg-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">{workout.name}</h3>
                    <div className="text-sm text-gray-400">
                      {workout.duration ? `${workout.duration} min` : ''}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-900/50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Volume</div>
                      <div className="text-lg font-bold text-primary-blue">
                        {workout.totalVolume.toFixed(0)} {weightUnit}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Exercises</div>
                      <div className="text-lg font-bold text-primary-green">
                        {workout.exercises.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sets</div>
                      <div className="text-lg font-bold text-primary-yellow">
                        {workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => !s.isWarmup).length, 0)}
                      </div>
                    </div>
                  </div>

                  {/* Exercises */}
                  <div className="space-y-2">
                    {workout.exercises.map((exercise, exIdx) => (
                      <div key={exIdx} className="bg-gray-900/50 rounded-lg p-3">
                        <div className="font-medium text-sm mb-2">{exercise.exerciseName}</div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          {exercise.sets.filter(s => !s.isWarmup && s.completed).map((set, setIdx) => (
                            <div key={setIdx} className="bg-gray-800 rounded px-2 py-1 text-center">
                              {set.weight}{weightUnit} × {set.reps}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {workout.notes && (
                    <div className="mt-3 p-3 bg-gray-900/50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">Notes:</div>
                      <div className="text-sm text-gray-300">{workout.notes}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
