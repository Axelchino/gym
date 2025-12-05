import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Award, Trophy, Zap, Dumbbell, Filter, Download, X, Flame } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculateWorkoutStats, calculateStreak, getExerciseProgressionByName } from '../utils/analytics';
import type { PersonalRecord } from '../utils/analytics';
import type { WorkoutLog } from '../types/workout';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAccentColors, getChartColors, getSelectedColors } from '../utils/themeHelpers';
import { exportWorkoutLogsToCSV, downloadCSV } from '../utils/csvExport';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import { StreakDisplay } from '../components/StreakDisplay';
import { ProgressReports } from '../components/ProgressReports';
import { StrengthStandards } from '../components/StrengthStandards';
import { useAllWorkouts } from '../hooks/useWorkoutData';
import { db } from '../services/database';

function Analytics() {
  const { user } = useAuth();
  const { weightUnit } = useUserSettings();
  const { theme } = useTheme();
  const accentColors = getAccentColors(theme);
  const chartColors = getChartColors(theme);
  const selectedColors = getSelectedColors(theme);

  // REACT QUERY: Fetch all workouts with automatic caching
  const { data: workouts = [] } = useAllWorkouts();

  const [recentPRs, setRecentPRs] = useState<PersonalRecord[]>([]);
  const [allPRs, setAllPRs] = useState<PersonalRecord[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseList, setExerciseList] = useState<{ id: string; name: string }[]>([]);
  const [timeFilter, setTimeFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [selectedDateWorkouts, setSelectedDateWorkouts] = useState<{ date: Date; workouts: WorkoutLog[] } | null>(null);

  // Load PRs and exercise list whenever workouts change
  useEffect(() => {
    if (workouts.length === 0) return;

    async function loadAdditionalData() {
      try {
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

        // Get unique exercises from workouts (deduplicate by name, not ID)
        const exerciseMap = new Map<string, { id: string; name: string }>();
        workouts.forEach((workout: WorkoutLog) => {
          workout.exercises.forEach((ex) => {
            // Use name as key to avoid duplicates with same name but different IDs
            if (!exerciseMap.has(ex.exerciseName)) {
              exerciseMap.set(ex.exerciseName, { id: ex.exerciseId, name: ex.exerciseName });
            }
          });
        });
        const exercises = Array.from(exerciseMap.values());
        setExerciseList(exercises.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    }

    loadAdditionalData();
  }, [workouts]);

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

    return workouts.filter((w: WorkoutLog) => new Date(w.date) >= filterDate);
  };

  const filteredWorkouts = getFilteredWorkouts();

  // Prepare volume chart data - add index to handle same-day workouts
  const volumeData = filteredWorkouts
    .slice()
    .reverse()
    .map((w: WorkoutLog, index: number) => ({
      date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: w.totalVolume,
      sets: w.exercises.reduce((sum: number, ex) => sum + ex.sets.filter(s => !s.isWarmup).length, 0),
      // Unique key for tooltip to distinguish same-day workouts
      uniqueKey: `${new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}-${index}`,
    }));

  // Prepare exercise progression data
  const progressionData = selectedExercise
    ? getExerciseProgressionByName(selectedExercise, filteredWorkouts)
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
      case 'weight': return <TrendingUp size={18} style={{ color: accentColors.primary }} />;
      case 'reps': return <Zap size={18} style={{ color: accentColors.secondary }} />;
      case 'volume': return <Dumbbell size={18} style={{ color: accentColors.primary }} />;
      case '1rm': return <Trophy size={18} style={{ color: accentColors.primary }} />;
      default: return <Award size={18} className="text-muted" />;
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Progress & Analytics</h1>
          <p className="text-secondary text-sm">Track your strength gains and volume trends</p>
        </div>
        {user && workouts.length > 0 && (
          <button
            onClick={handleExportWorkoutHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
            style={{
              backgroundColor: 'var(--surface-accent)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
            }}
            title="Export all workout history"
          >
            <Download size={18} />
            <span className="hidden sm:inline text-sm">Export History</span>
          </button>
        )}
      </div>

      {/* Guest Mode Empty State */}
      {!user && (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="max-w-md text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-4 rounded-full" style={{ backgroundColor: accentColors.background }}>
                <BarChart3 size={48} strokeWidth={1.5} style={{ color: accentColors.primary, opacity: 0.85 }} />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-primary">Track Your Progress</h2>
              <p className="text-sm text-secondary leading-relaxed">
                Sign up to unlock detailed analytics, track your PRs, monitor volume trends, and visualize your strength gains over time.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => window.location.href = '/auth'}
                className="flex items-center gap-2 text-sm font-semibold transition-all focus:outline-none focus-visible:outline-none"
                style={{
                  backgroundColor: accentColors.background,
                  color: accentColors.text,
                  border: `1px solid ${accentColors.border}`,
                  borderRadius: '10px',
                  height: '44px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = accentColors.backgroundHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = accentColors.background;
                }}
              >
                Sign Up Free
              </button>

              <button
                onClick={() => window.location.href = '/workout'}
                className="flex items-center gap-2 text-sm font-medium transition-all focus:outline-none focus-visible:outline-none"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  height: '44px',
                  paddingLeft: '24px',
                  paddingRight: '24px',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                Try a Workout
              </button>
            </div>

            {/* Features list */}
            <div className="pt-6 space-y-2">
              <p className="text-xs uppercase text-muted font-medium tracking-wide">What you'll get</p>
              <div className="grid grid-cols-1 gap-2 text-sm text-secondary">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C9B0FF' }}></div>
                  <span>Volume trends and progression charts</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C9B0FF' }}></div>
                  <span>Personal records tracking and history</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#C9B0FF' }}></div>
                  <span>Exercise-specific progression analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stat Cards - Only show for authenticated users */}
      {user && (
        <>
          <div className="grid grid-cols-5 gap-6">
            {/* Total Volume - 2 columns */}
            <div className="col-span-2 card-stats">
              <div className="flex items-start mb-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="text-muted opacity-60" size={14} strokeWidth={1.5} />
                  <span className="text-xs uppercase text-muted font-medium tracking-wide">Total Volume</span>
                </div>
              </div>
              <div className="flex items-center justify-start pl-8 mb-3" style={{ minHeight: '60px' }}>
                <p className="text-5xl font-bold tabular-nums text-primary">
                  {Math.round(stats.totalVolume).toLocaleString()}
                </p>
                <span className="text-base tabular-nums ml-2 text-muted">{weightUnit}</span>
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded" style={{
                  backgroundColor: 'var(--surface-accent)',
                  color: 'var(--text-primary)'
                }}>Lifetime</span>
              </div>
            </div>

            {/* Total Workouts */}
            <div className="card-stats">
              <div className="flex items-start mb-3">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="text-muted opacity-60" size={14} strokeWidth={1.5} />
                  <span className="text-xs uppercase text-muted font-medium tracking-wide">Workouts</span>
                </div>
              </div>
              <div className="flex items-center justify-start pl-8 mb-3" style={{ minHeight: '60px' }}>
                <p className="text-5xl font-bold tabular-nums text-primary">
                  {stats.totalWorkouts}
                </p>
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded" style={{
                  backgroundColor: 'var(--surface-accent)',
                  color: 'var(--text-primary)'
                }}>All time</span>
              </div>
            </div>

            {/* Recent PRs */}
            <div className="card-stats">
              <div className="flex items-start mb-3">
                <div className="flex items-center gap-1.5">
                  <Award className="text-muted opacity-60" size={14} strokeWidth={1.5} />
                  <span className="text-xs uppercase text-muted font-medium tracking-wide">PRs</span>
                </div>
              </div>
              <div className="flex items-center justify-start pl-8 mb-3" style={{ minHeight: '60px' }}>
                <p className="text-5xl font-bold tabular-nums text-primary">
                  {recentPRs.length}
                </p>
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded" style={{
                  backgroundColor: 'var(--surface-accent)',
                  color: 'var(--text-primary)'
                }}>Last 30 days</span>
              </div>
            </div>

            {/* Current Streak */}
            <div className="card-stats">
              <div className="flex items-start mb-3">
                <div className="flex items-center gap-1.5">
                  <Flame className="text-muted opacity-60" size={14} strokeWidth={1.5} />
                  <span className="text-xs uppercase text-muted font-medium tracking-wide">Streak</span>
                </div>
              </div>
              <div className="flex items-center justify-start pl-8 mb-3" style={{ minHeight: '60px' }}>
                <p className="text-5xl font-bold tabular-nums text-primary">
                  {streak}
                </p>
              </div>
              <div>
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded" style={{
                  backgroundColor: 'var(--surface-accent)',
                  color: 'var(--text-primary)'
                }}>Active streak</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Progress Reports - Only for authenticated users */}
      {user && <ProgressReports workouts={workouts} allPRs={allPRs} />}

      {/* Time Filter - Only for authenticated users */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-muted opacity-60" strokeWidth={1.5} />
            <span className="text-xs uppercase text-muted font-medium tracking-wide">Time Period</span>
          </div>
          <div className="flex gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map(filter => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                style={{
                  backgroundColor: timeFilter === filter ? selectedColors.background : 'transparent',
                  color: timeFilter === filter ? selectedColors.text : 'var(--text-secondary)',
                  border: `1px solid ${timeFilter === filter ? selectedColors.border : 'var(--border-subtle)'}`,
                }}
                onMouseEnter={(e) => {
                  if (timeFilter !== filter) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (timeFilter !== filter) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {filter === 'all' ? 'All Time' : filter === '7d' ? '7 Days' : filter === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Volume Over Time Chart - Only for authenticated users */}
      {user && (
        volumeData.length > 0 ? (
          <div className="card-elevated">
            <h2 className="text-lg font-semibold text-primary mb-4">Volume Over Time</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="uniqueKey" stroke="var(--text-muted)" style={{ fontSize: '12px' }} tickFormatter={(value) => value.split('-')[0]} />
                <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  labelFormatter={(value) => value.split('-')[0]}
                  formatter={(value: number) => [Math.round(value).toLocaleString(), `Volume (${weightUnit})`]}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Bar dataKey="volume" fill={chartColors.primary} name={`Volume (${weightUnit})`} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="card-elevated">
            <h2 className="text-lg font-semibold text-primary mb-4">Volume Over Time</h2>
            <div className="h-64 rounded-lg flex items-center justify-center text-muted" style={{ backgroundColor: 'var(--surface-accent)' }}>
              No workout data yet. Complete your first workout to see charts!
            </div>
          </div>
        )
      )}

      {/* Exercise Progression Chart - Only for authenticated users */}
      {user && (
        <div className="card-elevated">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Exercise Progression</h2>
            <select
              value={selectedExercise || ''}
              onChange={(e) => setSelectedExercise(e.target.value || null)}
              className="input text-sm py-2"
            >
              <option value="">Select an exercise</option>
              {exerciseList.map(ex => (
                <option key={ex.name} value={ex.name}>{ex.name}</option>
              ))}
            </select>
          </div>

          {progressionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="right" orientation="right" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend wrapperStyle={{ fontSize: '14px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="weight"
                  stroke={chartColors.primary}
                  name={`Weight (${weightUnit})`}
                  strokeWidth={2}
                  dot={{ fill: chartColors.primary, r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="estimated1RM"
                  stroke={chartColors.secondary}
                  name={`Est. 1RM (${weightUnit})`}
                  strokeWidth={2}
                  dot={{ fill: chartColors.secondary, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 rounded-lg flex items-center justify-center text-muted" style={{ backgroundColor: 'var(--surface-accent)' }}>
              {selectedExercise ? 'No data for this exercise' : 'Select an exercise to view progression'}
            </div>
          )}
        </div>
      )}

      {/* PR Timeline - Only for authenticated users */}
      {user && (
        <div className="card-elevated">
        <h2 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
          <Trophy size={20} style={{ color: accentColors.primary }} strokeWidth={1.5} />
          Personal Records Timeline
        </h2>

        {allPRs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allPRs.map((pr, index) => (
              <div key={index} className="rounded-lg p-4 transition-all" style={{
                backgroundColor: 'var(--surface-accent)',
                border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = accentColors.border;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
              }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {prIcon(pr.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-primary">{pr.exerciseName}</h3>
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: accentColors.primary }}>
                          {prTypeLabel(pr.type)}
                        </span>
                      </div>
                      <div className="text-sm text-secondary">
                        {pr.type === 'weight' && (
                          <p>
                            <span className="font-bold" style={{ color: accentColors.primary }}>{pr.weight}{weightUnit}</span> × {pr.reps} reps
                            {pr.previousRecord && (
                              <span className="text-muted ml-2">
                                (+{(pr.improvement || 0).toFixed(1)}{weightUnit})
                              </span>
                            )}
                          </p>
                        )}
                        {pr.type === 'reps' && (
                          <p>
                            <span className="font-bold" style={{ color: accentColors.primary }}>{pr.reps} reps</span> at {pr.weight}{weightUnit}
                            {pr.previousRecord && (
                              <span className="text-muted ml-2">
                                (+{pr.improvement} reps)
                              </span>
                            )}
                          </p>
                        )}
                        {pr.type === 'volume' && (
                          <p>
                            <span className="font-bold" style={{ color: accentColors.primary }}>{pr.value.toFixed(0)} {weightUnit}</span> single-set volume
                            {pr.previousRecord && (
                              <span className="text-muted ml-2">
                                (+{(pr.improvement || 0).toFixed(0)}{weightUnit})
                              </span>
                            )}
                          </p>
                        )}
                        {pr.type === '1rm' && (
                          <p>
                            <span className="font-bold" style={{ color: accentColors.primary }}>{pr.value.toFixed(1)}{weightUnit}</span> estimated 1RM
                            {pr.previousRecord && (
                              <span className="text-muted ml-2">
                                (+{(pr.improvement || 0).toFixed(1)}{weightUnit})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted whitespace-nowrap ml-4">
                    {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg p-8 text-center" style={{ backgroundColor: 'var(--surface-accent)' }}>
            <Trophy size={48} className="mx-auto mb-3 text-muted opacity-30" />
            <p className="text-muted">No personal records yet</p>
            <p className="text-sm text-muted mt-2">Complete workouts and push yourself to set new PRs!</p>
          </div>
        )}
      </div>
      )}

      {/* Workout Statistics - Only for authenticated users */}
      {user && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-elevated">
            <h3 className="text-lg font-semibold text-primary mb-3">Overall Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-secondary">Total Sets:</span>
                <span className="font-semibold text-primary">{stats.totalSets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Total Reps:</span>
                <span className="font-semibold text-primary">{stats.totalReps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Average Duration:</span>
                <span className="font-semibold text-primary">{stats.averageDuration.toFixed(0)} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Average Volume:</span>
                <span className="font-semibold text-primary">{stats.averageVolume.toFixed(0)} {weightUnit}</span>
              </div>
            </div>
          </div>

          <div className="card-elevated">
            <h3 className="text-lg font-semibold text-primary mb-3">Most Frequent Exercises</h3>
            <div className="space-y-2 text-sm">
              {stats.mostFrequentExercises.slice(0, 5).map((ex, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-secondary truncate">{ex.exerciseName}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full w-20" style={{ backgroundColor: 'var(--surface-accent)' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: chartColors.primary,
                          width: `${(ex.count / stats.mostFrequentExercises[0].count) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-muted text-xs w-8 text-right">{ex.count}×</span>
                  </div>
                </div>
              ))}
              {stats.mostFrequentExercises.length === 0 && (
                <p className="text-muted text-center py-4">No exercise data yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strength Standards - Only for authenticated users */}
      {user && <StrengthStandards workouts={workouts} />}

      {/* Calendar & Streak Section - Only for authenticated users */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <StreakDisplay workouts={workouts} />
          <CalendarHeatmap
            workouts={workouts}
            onDateClick={(date, dayWorkouts) => setSelectedDateWorkouts({ date, workouts: dayWorkouts })}
          />
        </div>
      )}

      {/* Workout Details Modal */}
      {selectedDateWorkouts && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)'
          }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary">
                {selectedDateWorkouts.date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <button
                onClick={() => setSelectedDateWorkouts(null)}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <X size={20} className="text-secondary" />
              </button>
            </div>

            {/* Workouts */}
            <div className="space-y-4">
              {selectedDateWorkouts.workouts.map((workout) => (
                <div key={workout.id} className="card" style={{ backgroundColor: 'var(--surface-accent)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg text-primary">{workout.name}</h3>
                    <div className="text-sm text-secondary">
                      {workout.duration ? `${workout.duration} min` : ''}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
                    <div>
                      <div className="text-xs text-muted mb-1">Volume</div>
                      <div className="text-lg font-bold" style={{ color: accentColors.primary }}>
                        {workout.totalVolume.toFixed(0)} {weightUnit}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-1">Exercises</div>
                      <div className="text-lg font-bold" style={{ color: accentColors.secondary }}>
                        {workout.exercises.length}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted mb-1">Sets</div>
                      <div className="text-lg font-bold" style={{ color: accentColors.primary }}>
                        {workout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => !s.isWarmup).length, 0)}
                      </div>
                    </div>
                  </div>

                  {/* Exercises */}
                  <div className="space-y-2">
                    {workout.exercises.map((exercise, exIdx) => (
                      <div key={exIdx} className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface)' }}>
                        <div className="font-medium text-sm text-primary mb-2">{exercise.exerciseName}</div>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          {exercise.sets.filter(s => !s.isWarmup && s.completed).map((set, setIdx) => (
                            <div key={setIdx} className="rounded px-2 py-1 text-center text-secondary" style={{
                              backgroundColor: 'var(--surface-accent)'
                            }}>
                              {set.weight}{weightUnit} × {set.reps}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {workout.notes && (
                    <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--surface)' }}>
                      <div className="text-xs text-muted mb-1">Notes:</div>
                      <div className="text-sm text-secondary">{workout.notes}</div>
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

export default Analytics;
