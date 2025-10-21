import { useState, useMemo } from 'react';
import { Trophy, TrendingUp, Target } from 'lucide-react';
import type { WorkoutLog } from '../types/workout';
import { calculate1RM } from '../utils/analytics';
import { calculateStrengthLevel, getLevelColor, getLevelBadgeColor, type StrengthLevel, type StandardType } from '../utils/strengthStandards';
import { useUserSettings } from '../hooks/useUserSettings';

interface StrengthStandardsProps {
  workouts: WorkoutLog[];
}

const BIG_LIFTS = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'];

export function StrengthStandards({ workouts }: StrengthStandardsProps) {
  const { weightUnit } = useUserSettings();
  // TODO: Phase 5 - Get bodyweight from user profile instead of local state
  const [bodyweight, setBodyweight] = useState<number>(75); // Default 75kg
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [showSettings, setShowSettings] = useState(false);

  // Calculate best 1RM for each big lift
  const liftStats = useMemo(() => {
    const stats = new Map<string, { best1RM: number; bestWeight: number; bestReps: number }>();

    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        // Check if this is one of the big lifts
        const matchedLift = BIG_LIFTS.find(lift =>
          exercise.exerciseName.toLowerCase().includes(lift.toLowerCase().replace(' press', ''))
        );

        if (!matchedLift) return;

        exercise.sets
          .filter(s => !s.isWarmup && s.completed && s.weight > 0 && s.reps > 0)
          .forEach(set => {
            const estimated1RM = calculate1RM(set.weight, set.reps);
            const current = stats.get(matchedLift);

            if (!current || estimated1RM > current.best1RM) {
              stats.set(matchedLift, {
                best1RM: estimated1RM,
                bestWeight: set.weight,
                bestReps: set.reps,
              });
            }
          });
      });
    });

    return stats;
  }, [workouts]);

  // Calculate strength standards for each lift (BOTH general and powerlifting)
  const strengthLevels = useMemo(() => {
    return BIG_LIFTS.map(lift => {
      const stats = liftStats.get(lift);
      if (!stats) {
        return {
          lift,
          generalLevel: null,
          powerliftingLevel: null,
          stats: null,
        };
      }

      const generalLevel = calculateStrengthLevel(lift, stats.best1RM, bodyweight, sex, 'general');
      const powerliftingLevel = calculateStrengthLevel(lift, stats.best1RM, bodyweight, sex, 'powerlifting');

      return {
        lift,
        generalLevel,
        powerliftingLevel,
        stats,
      };
    });
  }, [liftStats, bodyweight, sex]);

  const hasAnyData = strengthLevels.some(l => l.stats !== null);

  return (
    <div className="card-elevated">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
            <Trophy className="text-primary-yellow" size={28} />
            Strength Standards
          </h2>
          <p className="text-sm text-gray-400">Compare your lifts to population standards</p>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm text-primary-blue hover:text-primary-blue/80 transition-colors"
        >
          {showSettings ? 'Hide Settings' : 'Settings'}
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bodyweight ({weightUnit})</label>
              <input
                type="number"
                value={bodyweight}
                onChange={(e) => setBodyweight(parseFloat(e.target.value) || 75)}
                className="input w-full"
                placeholder="Enter your bodyweight"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Sex</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSex('male')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    sex === 'male'
                      ? 'bg-primary-blue text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setSex('female')}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    sex === 'female'
                      ? 'bg-primary-blue text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

          </div>

          <div className="bg-gray-900/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-2">
              Showing comparisons against both <span className="font-semibold text-primary-green">General Population</span> (ExRx) and <span className="font-semibold text-primary-yellow">Competitive Powerlifters</span> (SymmetricStrength)
            </p>
            <p className="text-xs text-gray-500">
              Note: Bodyweight will be automatically pulled from your profile in Phase 5
            </p>
          </div>
        </div>
      )}

      {/* Strength Levels Grid */}
      {hasAnyData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strengthLevels.map(({ lift, generalLevel, powerliftingLevel, stats }) => (
            <div
              key={lift}
              className={`bg-gray-800/50 border rounded-lg p-4 ${
                stats
                  ? 'border-gray-700 hover:border-primary-blue/30 transition-colors'
                  : 'border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{lift}</h3>
                {generalLevel && powerliftingLevel && (
                  <div className="flex gap-2">
                    <div
                      className={`px-2 py-1 rounded text-xs font-bold border ${getLevelBadgeColor(
                        generalLevel.level
                      )} ${getLevelColor(generalLevel.level)}`}
                      title="vs General Population"
                    >
                      🏋️ {generalLevel.level}
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-bold border ${getLevelBadgeColor(
                        powerliftingLevel.level
                      )} ${getLevelColor(powerliftingLevel.level)}`}
                      title="vs Powerlifters"
                    >
                      💪 {powerliftingLevel.level}
                    </div>
                  </div>
                )}
              </div>

              {stats && generalLevel ? (
                <>
                  {/* Current Stats */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-400 mb-1">Best Lift</div>
                    <div className="text-2xl font-bold text-white">
                      {stats.bestWeight.toFixed(1)} {weightUnit} × {stats.bestReps}
                    </div>
                    <div className="text-xs text-gray-500">
                      Est. 1RM: {stats.best1RM.toFixed(1)} {weightUnit} ({generalLevel.currentRatio.toFixed(2)}x BW)
                    </div>
                  </div>

                  {/* Dual Progress Bars */}
                  <div className="space-y-3">
                    {/* General Population Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">🏋️ vs Gym Rats</span>
                        <span className={getLevelColor(generalLevel.level)}>
                          {generalLevel.percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            generalLevel.level === 'Beginner' ? 'bg-gray-400' :
                            generalLevel.level === 'Novice' ? 'bg-blue-400' :
                            generalLevel.level === 'Intermediate' ? 'bg-green-400' :
                            generalLevel.level === 'Advanced' ? 'bg-yellow-400' :
                            'bg-purple-400'
                          }`}
                          style={{ width: `${generalLevel.percentage}%` }}
                        ></div>
                      </div>
                      {generalLevel.level !== 'Elite' && (
                        <div className="text-xs text-gray-500 mt-1">
                          Next: {generalLevel.nextLevelWeight.toFixed(0)} {weightUnit}
                        </div>
                      )}
                    </div>

                    {/* Powerlifting Progress */}
                    {powerliftingLevel && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">💪 vs Powerlifters</span>
                          <span className={getLevelColor(powerliftingLevel.level)}>
                            {powerliftingLevel.percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              powerliftingLevel.level === 'Beginner' ? 'bg-gray-400' :
                              powerliftingLevel.level === 'Novice' ? 'bg-blue-400' :
                              powerliftingLevel.level === 'Intermediate' ? 'bg-green-400' :
                              powerliftingLevel.level === 'Advanced' ? 'bg-yellow-400' :
                              'bg-purple-400'
                            }`}
                            style={{ width: `${powerliftingLevel.percentage}%` }}
                          ></div>
                        </div>
                        {powerliftingLevel.level !== 'Elite' && (
                          <div className="text-xs text-gray-500 mt-1">
                            Next: {powerliftingLevel.nextLevelWeight.toFixed(0)} {weightUnit}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No data for this lift yet</p>
                  <p className="text-xs mt-1">Complete workouts to see your strength level</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <Trophy size={48} className="mx-auto mb-3 opacity-30" />
          <p>No strength data yet</p>
          <p className="text-sm mt-2">
            Complete workouts with Squat, Bench Press, Deadlift, or Overhead Press to see your strength standards
          </p>
        </div>
      )}

      {/* Legend */}
      {hasAnyData && (
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-2 font-medium">Strength Levels:</div>
          <div className="flex flex-wrap gap-2">
            {(['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'] as StrengthLevel[]).map(
              level => (
                <div
                  key={level}
                  className={`px-2 py-1 rounded text-xs border ${getLevelBadgeColor(
                    level
                  )} ${getLevelColor(level)}`}
                >
                  {level}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
