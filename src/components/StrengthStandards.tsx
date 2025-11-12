import { useState, useMemo, useEffect } from 'react';
import { Trophy, TrendingUp, User } from 'lucide-react';
import type { WorkoutLog } from '../types/workout';
import { calculate1RM } from '../utils/analytics';
import { calculateStrengthLevel, getLevelColor, getLevelBadgeColor, getLevelBadgeColorHex, type StrengthLevel, type StandardType } from '../utils/strengthStandards';
import { useUserSettings } from '../hooks/useUserSettings';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/database';
import type { UserProfile } from '../types/user';
import { useNavigate } from 'react-router-dom';

interface StrengthStandardsProps {
  workouts: WorkoutLog[];
}

const BIG_LIFTS = ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press'];

export function StrengthStandards({ workouts }: StrengthStandardsProps) {
  const { weightUnit } = useUserSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    const profile = await db.users.get(user.id);
    setUserProfile(profile || null);
  };

  // Get bodyweight and sex from profile, with fallbacks
  const bodyweight = userProfile?.currentWeight || 75; // Default 75kg if not set
  const sex = userProfile?.sex === 'female' ? 'female' : 'male'; // Default to male, skip "prefer-not-to-say"
  const hasProfileData = !!userProfile?.currentWeight && userProfile?.sex && userProfile.sex !== 'prefer-not-to-say';

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
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Trophy className="text-primary-yellow" size={28} />
            Strength Standards
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Compare your lifts against everyday athletes and competitive powerlifters</p>
        </div>
      </div>

      {/* Explanation of dual comparison */}
      <div className="card mb-6">
        <div>
          <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>Two Standards, Better Context</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold" style={{ background: 'var(--color-blue, #3B82F6)', color: 'white' }}>G</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Everyday Athletes</p>
                <p style={{ color: 'var(--text-secondary)' }}>Benchmarks against consistent gym trainees (ExRx standards)</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold" style={{ background: 'var(--color-purple, #7E29FF)', color: 'white' }}>P</span>
              </div>
              <div>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Competitive Powerlifters</p>
                <p style={{ color: 'var(--text-secondary)' }}>Compares you to athletes who compete in the sport (SymmetricStrength)</p>
              </div>
            </div>
            <p className="text-xs pt-2 border-t" style={{ color: 'var(--text-muted)', borderColor: 'var(--border-subtle)' }}>
              Most people fall somewhere between Beginner and Intermediate for everyday athletes. Being "Intermediate" among competitive powerlifters means you're very strong!
            </p>
          </div>
        </div>
      </div>

      {/* Profile Data Prompt */}
      {!hasProfileData && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <User className="text-yellow-500 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-500 mb-1">Add Your Stats for Accurate Comparisons</h3>
              <p className="text-sm text-gray-300 mb-3">
                To see personalized strength standards, please add your bodyweight and sex in your profile.
              </p>
              <button
                onClick={() => navigate('/profile')}
                className="text-sm bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-4 py-2 rounded-lg transition-colors border border-yellow-500/30"
              >
                Update Profile →
              </button>
              <p className="text-xs text-gray-500 mt-2">
                We respect your privacy. This data is only used for strength comparisons and can be skipped.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Strength Levels Grid */}
      {hasAnyData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strengthLevels.map(({ lift, generalLevel, powerliftingLevel, stats }) => (
            <div
              key={lift}
              className={`card ${stats ? 'hover:border-[var(--color-purple)]' : ''}`}
              style={{ background: 'var(--card-bg)', borderColor: stats ? 'var(--border-subtle)' : 'var(--border-subtle)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{lift}</h3>
                {generalLevel && powerliftingLevel && (
                  <div className="flex gap-2">
                    <div
                      className="px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5"
                      style={{
                        backgroundColor: getLevelBadgeColorHex(generalLevel.level),
                        color: '#111216'
                      }}
                      title="vs Everyday Athletes"
                    >
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold" style={{ background: 'var(--color-blue, #3B82F6)', color: 'white' }}>G</span>
                      {generalLevel.level}
                    </div>
                    <div
                      className="px-2.5 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5"
                      style={{
                        backgroundColor: getLevelBadgeColorHex(powerliftingLevel.level),
                        color: '#111216'
                      }}
                      title="vs Competitive Powerlifters"
                    >
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold" style={{ background: 'var(--color-purple, #7E29FF)', color: 'white' }}>P</span>
                      {powerliftingLevel.level}
                    </div>
                  </div>
                )}
              </div>

              {stats && generalLevel ? (
                <>
                  {/* Current Stats */}
                  <div className="mb-4">
                    <div className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Best Lift</div>
                    <div className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                      {(weightUnit === 'kg' ? stats.bestWeight / 2.20462 : stats.bestWeight).toFixed(1)} {weightUnit} × {stats.bestReps}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Est. 1RM: {(weightUnit === 'kg' ? stats.best1RM / 2.20462 : stats.best1RM).toFixed(1)} {weightUnit} ({generalLevel.currentRatio.toFixed(2)}x BW)
                    </div>
                  </div>

                  {/* Dual Progress Bars with Percentile Rankings */}
                  <div className="space-y-3">
                    {/* Everyday Athletes Progress */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span style={{ color: 'var(--text-secondary)' }}>Everyday Athletes</span>
                      </div>
                      <div className="mb-2">
                        <span
                          className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            backgroundColor: getLevelBadgeColorHex(generalLevel.level),
                            color: '#111216'
                          }}
                        >
                          Top {generalLevel.percentile.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-accent, #C0C0C0)' }}>
                        <div
                          className={`h-full transition-all duration-500 ${
                            generalLevel.level === 'World Class' ? 'bg-orange-400' :
                            generalLevel.level === 'Elite' ? 'bg-purple-400' :
                            generalLevel.level === 'Advanced' ? 'bg-yellow-400' :
                            generalLevel.level === 'Intermediate' ? 'bg-green-400' :
                            generalLevel.level === 'Novice' ? 'bg-blue-400' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${100 - generalLevel.percentile}%` }}
                        ></div>
                      </div>
                      {generalLevel.level !== 'World Class' && (
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                          Next: {(weightUnit === 'kg' ? generalLevel.nextLevelWeight / 2.20462 : generalLevel.nextLevelWeight).toFixed(0)} {weightUnit}
                        </div>
                      )}
                    </div>

                    {/* Powerlifting Progress */}
                    {powerliftingLevel && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span style={{ color: 'var(--text-secondary)' }}>Competitive Powerlifters</span>
                        </div>
                        <div className="mb-2">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-xs font-bold"
                            style={{
                              backgroundColor: getLevelBadgeColorHex(powerliftingLevel.level),
                              color: '#111216'
                            }}
                          >
                            Top {powerliftingLevel.percentile.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--surface-accent, #C0C0C0)' }}>
                          <div
                            className={`h-full transition-all duration-500 ${
                              powerliftingLevel.level === 'World Class' ? 'bg-orange-400' :
                              powerliftingLevel.level === 'Elite' ? 'bg-purple-400' :
                              powerliftingLevel.level === 'Advanced' ? 'bg-yellow-400' :
                              powerliftingLevel.level === 'Intermediate' ? 'bg-green-400' :
                              powerliftingLevel.level === 'Novice' ? 'bg-blue-400' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${100 - powerliftingLevel.percentile}%` }}
                          ></div>
                        </div>
                        {powerliftingLevel.level !== 'World Class' && (
                          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            Next: {(weightUnit === 'kg' ? powerliftingLevel.nextLevelWeight / 2.20462 : powerliftingLevel.nextLevelWeight).toFixed(0)} {weightUnit}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                  <TrendingUp size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No data for this lift yet</p>
                  <p className="text-xs mt-1">Complete workouts to see your strength level</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
          <Trophy size={48} className="mx-auto mb-3 opacity-30" />
          <p>No strength data yet</p>
          <p className="text-sm mt-2">
            Complete workouts with Squat, Bench Press, Deadlift, or Overhead Press to see your strength standards
          </p>
        </div>
      )}

      {/* Legend */}
      {hasAnyData && (
        <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="text-xs mb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Strength Levels (Lower percentile = Better):</div>
          <div className="flex flex-wrap gap-2">
            {(['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite', 'World Class'] as StrengthLevel[]).map(
              level => (
                <div
                  key={level}
                  className="px-2.5 py-1.5 rounded-md text-xs font-bold"
                  style={{
                    backgroundColor: getLevelBadgeColorHex(level),
                    color: '#111216'
                  }}
                >
                  {level}
                </div>
              )
            )}
          </div>
          <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Percentiles compare you against lifters who train consistently. Top 1% = World Class, Top 90% = Beginner.
          </div>
        </div>
      )}
    </div>
  );
}
