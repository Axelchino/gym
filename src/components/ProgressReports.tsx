import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Calendar, Clock, Dumbbell, Trophy, Target, BarChart3, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { WorkoutLog } from '../types/workout';
import type { PersonalRecord } from '../utils/analytics';
import { useUserSettings } from '../hooks/useUserSettings';

type TimePeriod = 'week' | 'month' | 'year';

interface ProgressReportsProps {
  workouts: WorkoutLog[];
  allPRs: PersonalRecord[];
}

export function ProgressReports({ workouts, allPRs }: ProgressReportsProps) {
  const { weightUnit } = useUserSettings();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');

  // Calculate date ranges
  const getDateRanges = () => {
    const now = new Date();
    const currentStart = new Date(now);
    const previousStart = new Date(now);
    const previousEnd = new Date(now);

    switch (selectedPeriod) {
      case 'week':
        // Current week (last 7 days)
        currentStart.setDate(now.getDate() - 7);
        // Previous week (8-14 days ago)
        previousStart.setDate(now.getDate() - 14);
        previousEnd.setDate(now.getDate() - 7);
        break;
      case 'month':
        // Current month (last 30 days)
        currentStart.setDate(now.getDate() - 30);
        // Previous month (31-60 days ago)
        previousStart.setDate(now.getDate() - 60);
        previousEnd.setDate(now.getDate() - 30);
        break;
      case 'year':
        // Current year (last 365 days)
        currentStart.setDate(now.getDate() - 365);
        // Previous year (366-730 days ago)
        previousStart.setDate(now.getDate() - 730);
        previousEnd.setDate(now.getDate() - 365);
        break;
    }

    return { currentStart, previousStart, previousEnd };
  };

  // Calculate report data
  const reportData = useMemo(() => {
    const { currentStart, previousStart, previousEnd } = getDateRanges();

    // Filter workouts for current and previous periods
    const currentWorkouts = workouts.filter(w => new Date(w.date) >= currentStart);
    const previousWorkouts = workouts.filter(w => {
      const date = new Date(w.date);
      return date >= previousStart && date < previousEnd;
    });

    // Calculate statistics
    const currentStats = {
      totalWorkouts: currentWorkouts.length,
      totalVolume: currentWorkouts.reduce((sum, w) => sum + w.totalVolume, 0),
      totalTime: currentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      totalSets: currentWorkouts.reduce((sum, w) =>
        sum + w.exercises.reduce((exSum, ex) =>
          exSum + ex.sets.filter(s => !s.isWarmup && s.completed).length, 0
        ), 0
      ),
    };

    const previousStats = {
      totalWorkouts: previousWorkouts.length,
      totalVolume: previousWorkouts.reduce((sum, w) => sum + w.totalVolume, 0),
      totalTime: previousWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      totalSets: previousWorkouts.reduce((sum, w) =>
        sum + w.exercises.reduce((exSum, ex) =>
          exSum + ex.sets.filter(s => !s.isWarmup && s.completed).length, 0
        ), 0
      ),
    };

    // Calculate percentage changes
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const changes = {
      workouts: calculateChange(currentStats.totalWorkouts, previousStats.totalWorkouts),
      volume: calculateChange(currentStats.totalVolume, previousStats.totalVolume),
      time: calculateChange(currentStats.totalTime, previousStats.totalTime),
      sets: calculateChange(currentStats.totalSets, previousStats.totalSets),
    };

    // Top exercises by set count
    const exerciseSetCounts = new Map<string, { name: string; sets: number; volume: number }>();
    currentWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        const existing = exerciseSetCounts.get(ex.exerciseId) || { name: ex.exerciseName, sets: 0, volume: 0 };
        const workingSets = ex.sets.filter(s => !s.isWarmup && s.completed);
        existing.sets += workingSets.length;
        existing.volume += workingSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
        exerciseSetCounts.set(ex.exerciseId, existing);
      });
    });

    const topExercises = Array.from(exerciseSetCounts.values())
      .sort((a, b) => b.sets - a.sets)
      .slice(0, 5);

    // PRs achieved in current period
    const currentPRs = allPRs.filter(pr => new Date(pr.date) >= currentStart);

    // Frequency chart data (group by week or month depending on period)
    const frequencyData = [];
    if (selectedPeriod === 'week') {
      // Group by day for weekly view
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dayWorkouts = currentWorkouts.filter(w => {
          const wDate = new Date(w.date);
          wDate.setHours(0, 0, 0, 0);
          return wDate.getTime() === date.getTime();
        });
        frequencyData.push({
          label: date.toLocaleDateString('en-US', { weekday: 'short' }),
          workouts: dayWorkouts.length,
          volume: dayWorkouts.reduce((sum, w) => sum + w.totalVolume, 0),
        });
      }
    } else if (selectedPeriod === 'month') {
      // Group by week for monthly view
      const weeksCount = 4;
      for (let i = weeksCount - 1; i >= 0; i--) {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 7);
        const weekWorkouts = currentWorkouts.filter(w => {
          const wDate = new Date(w.date);
          return wDate >= weekStart && wDate < weekEnd;
        });
        frequencyData.push({
          label: `Week ${weeksCount - i}`,
          workouts: weekWorkouts.length,
          volume: weekWorkouts.reduce((sum, w) => sum + w.totalVolume, 0),
        });
      }
    } else {
      // Group by month for yearly view
      for (let i = 11; i >= 0; i--) {
        const monthDate = new Date();
        monthDate.setMonth(monthDate.getMonth() - i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
        const monthWorkouts = currentWorkouts.filter(w => {
          const wDate = new Date(w.date);
          return wDate >= monthStart && wDate <= monthEnd;
        });
        frequencyData.push({
          label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
          workouts: monthWorkouts.length,
          volume: monthWorkouts.reduce((sum, w) => sum + w.totalVolume, 0),
        });
      }
    }

    return {
      current: currentStats,
      previous: previousStats,
      changes,
      topExercises,
      currentPRs,
      frequencyData,
    };
  }, [workouts, allPRs, selectedPeriod]);

  const periodLabel = {
    week: 'This Week',
    month: 'This Month',
    year: 'This Year',
  }[selectedPeriod];

  const previousPeriodLabel = {
    week: 'vs Last Week',
    month: 'vs Last Month',
    year: 'vs Last Year',
  }[selectedPeriod];

  const ChangeIndicator = ({ value }: { value: number }) => {
    if (value === 0) return <span className="text-muted text-sm">No change</span>;
    const isPositive = value > 0;
    return (
      <div className={`flex items-center gap-1 text-sm`} style={{ color: isPositive ? '#B482FF' : '#FF6B6B' }}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>{isPositive ? '+' : ''}{value.toFixed(0)}%</span>
      </div>
    );
  };

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
            <BarChart3 size={22} style={{ color: '#B482FF' }} strokeWidth={1.5} />
            Progress Report
          </h2>
          <p className="text-sm text-secondary">Summary of your training progress</p>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as TimePeriod[]).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                backgroundColor: selectedPeriod === period ? '#EDE0FF' : 'transparent',
                color: selectedPeriod === period ? '#7E29FF' : 'var(--text-secondary)',
                border: `1px solid ${selectedPeriod === period ? '#D7BDFF' : 'var(--border-subtle)'}`,
              }}
              onMouseEnter={(e) => {
                if (selectedPeriod !== period) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPeriod !== period) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg p-4" style={{
          backgroundColor: 'var(--surface-accent)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div className="flex items-center gap-2 mb-2 text-muted">
            <Dumbbell size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Total Volume</span>
          </div>
          <p className="text-3xl font-bold text-primary mb-1">{reportData.current.totalVolume.toFixed(0)}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{weightUnit}</span>
            <ChangeIndicator value={reportData.changes.volume} />
          </div>
        </div>

        <div className="rounded-lg p-4" style={{
          backgroundColor: 'var(--surface-accent)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div className="flex items-center gap-2 mb-2 text-muted">
            <Calendar size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Workouts</span>
          </div>
          <p className="text-3xl font-bold text-primary mb-1">{reportData.current.totalWorkouts}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{previousPeriodLabel}</span>
            <ChangeIndicator value={reportData.changes.workouts} />
          </div>
        </div>

        <div className="rounded-lg p-4" style={{
          backgroundColor: 'var(--surface-accent)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div className="flex items-center gap-2 mb-2 text-muted">
            <Clock size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Training Time</span>
          </div>
          <p className="text-3xl font-bold text-primary mb-1">{Math.round(reportData.current.totalTime / 60)}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">hours</span>
            <ChangeIndicator value={reportData.changes.time} />
          </div>
        </div>

        <div className="rounded-lg p-4" style={{
          backgroundColor: 'var(--surface-accent)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div className="flex items-center gap-2 mb-2 text-muted">
            <Target size={18} strokeWidth={1.5} />
            <span className="text-sm font-medium">Total Sets</span>
          </div>
          <p className="text-3xl font-bold text-primary mb-1">{reportData.current.totalSets}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">{previousPeriodLabel}</span>
            <ChangeIndicator value={reportData.changes.sets} />
          </div>
        </div>
      </div>

      {/* Training Frequency Chart */}
      <div className="rounded-lg p-4 mb-6" style={{
        backgroundColor: 'var(--surface-accent)',
        border: '1px solid var(--border-subtle)',
      }}>
        <h3 className="text-lg font-semibold text-primary mb-4">Training Frequency - {periodLabel}</h3>
        {reportData.frequencyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={reportData.frequencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis dataKey="label" stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--text-muted)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px' }}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="workouts" fill="#B482FF" name="Workouts" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-muted">
            No training data for this period
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Exercises */}
        <div className="rounded-lg p-4" style={{
          backgroundColor: 'var(--surface-accent)',
          border: '1px solid var(--border-subtle)',
        }}>
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Trophy size={20} style={{ color: '#B482FF' }} strokeWidth={1.5} />
            Top Exercises
          </h3>
          {reportData.topExercises.length > 0 ? (
            <div className="space-y-3">
              {reportData.topExercises.map((ex, idx) => {
                // Medal colors for top 3
                const getMedalStyle = (index: number) => {
                  if (index === 0) {
                    return {
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '1px solid #FCD34D',
                      setColor: '#F59E0B',
                    };
                  } else if (index === 1) {
                    return {
                      backgroundColor: '#F3F4F6',
                      color: '#374151',
                      border: '1px solid #D1D5DB',
                      setColor: '#6B7280',
                    };
                  } else if (index === 2) {
                    return {
                      backgroundColor: '#FED7AA',
                      color: '#7C2D12',
                      border: '1px solid #FDBA74',
                      setColor: '#F97316',
                    };
                  } else {
                    return {
                      backgroundColor: 'rgba(180, 130, 255, 0.15)',
                      color: '#7E29FF',
                      border: '1px solid #B482FF40',
                      setColor: '#B482FF',
                    };
                  }
                };

                const style = getMedalStyle(idx);

                return (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm`}
                        style={{
                          backgroundColor: style.backgroundColor,
                          color: style.color,
                          border: style.border,
                        }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-primary truncate">{ex.name}</p>
                        <p className="text-xs text-muted">{ex.volume.toFixed(0)} {weightUnit} total</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-bold" style={{ color: style.setColor }}>{ex.sets}</p>
                      <p className="text-xs text-muted">sets</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-muted">
              <Dumbbell size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No exercises tracked this {selectedPeriod}</p>
            </div>
          )}
        </div>

        {/* PR Highlights */}
        <div className="rounded-lg p-4" style={{
          backgroundColor: 'var(--surface-accent)',
          border: '1px solid var(--border-subtle)',
        }}>
          <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
            <Award size={20} style={{ color: '#B482FF' }} strokeWidth={1.5} />
            PR Highlights
          </h3>
          {reportData.currentPRs.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {reportData.currentPRs.slice(0, 10).map((pr, idx) => (
                <div key={idx} className="rounded-lg p-3" style={{ backgroundColor: 'var(--surface)' }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-primary truncate">{pr.exerciseName}</p>
                      <p className="text-xs text-secondary mt-1">
                        {pr.type === 'weight' && `${pr.weight}${weightUnit} × ${pr.reps} reps`}
                        {pr.type === 'reps' && `${pr.reps} reps at ${pr.weight}${weightUnit}`}
                        {pr.type === 'volume' && `${pr.value.toFixed(0)} ${weightUnit} volume`}
                        {pr.type === '1rm' && `${pr.value.toFixed(1)}${weightUnit} est. 1RM`}
                      </p>
                    </div>
                    <div className="text-xs text-muted whitespace-nowrap">
                      {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted">
              <Trophy size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No PRs achieved this {selectedPeriod}</p>
              <p className="text-xs mt-1">Keep training hard to set new records!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
