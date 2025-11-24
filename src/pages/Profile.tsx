import {
  User,
  Settings,
  Download,
  LogOut,
  Edit2,
  Scale,
  Palette,
  ChevronDown,
  Dumbbell,
  Trophy,
  Activity,
  Weight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { db } from '../services/database';
import type { UserProfile, UnitSystem } from '../types/user';
import {
  getWorkoutLogs,
  getPersonalRecords,
  getUserProfile,
  updateUserProfile,
} from '../services/supabaseDataService';
import { useTheme, type Theme } from '../contexts/ThemeContext';
import { useThemeTokens } from '../utils/themeHelpers';
import { Chip } from '../components/ui';
import TrainingFocusChart from '../components/TrainingFocusChart';

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const tokens = useThemeTokens();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    personalRecords: 0,
    dayStreak: 0,
    totalVolume: 0,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const profile = await getUserProfile();
      await db.users.put(profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile from Supabase:', error);
      const localProfile = await db.users.get(user.id);
      if (localProfile) {
        setUserProfile(localProfile);
      }
    }
  };

  const toggleUnitPreference = async () => {
    if (!user || !userProfile) return;

    const newUnit: UnitSystem = userProfile.unitPreference === 'metric' ? 'imperial' : 'metric';
    await updateUserProfile({ unitPreference: newUnit });
    await db.users.update(user.id, {
      unitPreference: newUnit,
      updatedAt: new Date(),
    });

    setUserProfile({ ...userProfile, unitPreference: newUnit });
    await loadStats();
  };

  const convertWeight = (kg: number): number => {
    if (!userProfile) return kg;
    return userProfile.unitPreference === 'imperial' ? kg * 2.20462 : kg;
  };

  const getWeightUnit = (): string => {
    return userProfile?.unitPreference === 'imperial' ? 'lbs' : 'kg';
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const logs = await getWorkoutLogs();
      const totalWorkouts = logs.length;

      const prs = await getPersonalRecords();
      const personalRecords = prs.length;

      const totalVolume = logs.reduce((sum, log) => {
        const logVolume = log.exercises.reduce((exerciseSum, exercise) => {
          const setVolume = exercise.sets.reduce((setSum, set) => {
            return setSum + (set.weight || 0) * (set.reps || 0);
          }, 0);
          return exerciseSum + setVolume;
        }, 0);
        return sum + logVolume;
      }, 0);

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentWorkouts = logs.filter((log) => new Date(log.date) >= sevenDaysAgo).length;

      setStats({
        totalWorkouts,
        personalRecords,
        dayStreak: recentWorkouts,
        totalVolume: Math.round(totalVolume),
      });
    } catch (error) {
      console.error('Error loading profile stats:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    setShowThemeDropdown(false);
  };

  const getThemeLabel = (t: Theme) => {
    switch (t) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'amoled':
        return 'AMOLED';
    }
  };

  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'No email';

  // Format volume with k abbreviation
  const formattedVolume =
    stats.totalVolume >= 1000
      ? `${(convertWeight(stats.totalVolume) / 1000).toFixed(stats.totalVolume >= 10000 ? 0 : 1)}k`
      : Math.round(convertWeight(stats.totalVolume)).toString();

  return (
    <div className="space-y-6 pb-8">
      {/* User Identity Card - Hero Style */}
      <div
        className="rounded-xl p-5 transition-all"
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
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              backgroundColor:
                theme === 'amoled'
                  ? '#1A1A1A'
                  : theme === 'dark'
                    ? '#083B73'
                    : 'rgba(180, 130, 255, 0.15)',
              border: `1px solid ${tokens.border.subtle}`,
            }}
          >
            <User
              size={32}
              style={{
                color: theme === 'amoled' ? '#F0F0F0' : theme === 'dark' ? '#FFFFFF' : '#B482FF',
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-primary truncate">{displayName}</h1>
            <p className="text-sm text-secondary truncate">{email}</p>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2.5 rounded-lg transition-all"
            style={{
              backgroundColor: tokens.button.secondaryBg,
              border: `1px solid ${tokens.button.secondaryBorder}`,
              color: tokens.button.secondaryText,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = tokens.surface.hover;
              e.currentTarget.style.borderColor = tokens.border.medium;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = tokens.button.secondaryBg;
              e.currentTarget.style.borderColor = tokens.button.secondaryBorder;
            }}
          >
            <Edit2 size={18} />
          </button>
        </div>
      </div>

      {/* Stats and Training Focus - Side by Side on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stats Grid - 2x2 on left */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Workouts */}
          <div
            className="rounded-xl p-4 transition-all"
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
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="text-muted opacity-50" size={16} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-semibold tracking-wider">
                Workouts
              </span>
            </div>
            <p className="text-4xl font-bold tabular-nums text-primary mb-2">
              {stats.totalWorkouts}
            </p>
            <div>
              <Chip>All time</Chip>
            </div>
          </div>

          {/* Personal Records */}
          <div
            className="rounded-xl p-4 transition-all"
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
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="text-muted opacity-50" size={16} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-semibold tracking-wider">PRs</span>
            </div>
            <p className="text-4xl font-bold tabular-nums text-primary mb-2">
              {stats.personalRecords}
            </p>
            <div>
              <Chip>All time</Chip>
            </div>
          </div>

          {/* This Week */}
          <div
            className="rounded-xl p-4 transition-all"
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
            <div className="flex items-center gap-2 mb-4">
              <Activity className="text-muted opacity-50" size={16} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-semibold tracking-wider">
                This Week
              </span>
            </div>
            <p className="text-4xl font-bold tabular-nums text-primary mb-2">{stats.dayStreak}</p>
            <div>
              <Chip>Last 7 days</Chip>
            </div>
          </div>

          {/* Total Volume */}
          <div
            className="rounded-xl p-4 transition-all"
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
            <div className="flex items-center gap-2 mb-4">
              <Weight className="text-muted opacity-50" size={16} strokeWidth={1.5} />
              <span className="text-xs uppercase text-muted font-semibold tracking-wider">
                Volume
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-2">
              <p className="text-4xl font-bold tabular-nums text-primary">{formattedVolume}</p>
              <span className="text-sm text-secondary font-medium">{getWeightUnit()}</span>
            </div>
            <div>
              <Chip>All time</Chip>
            </div>
          </div>
        </div>

        {/* Training Focus Radar Chart - on right */}
        {user && <TrainingFocusChart userId={user.id} />}
      </div>

      {/* Preferences Card */}
      <div
        className="rounded-xl"
        style={{
          backgroundColor: tokens.statCard.background,
          border: `1px solid ${tokens.statCard.border}`,
        }}
      >
        {/* Unit Preference */}
        <div
          className="flex items-center justify-between p-4"
          style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}
        >
          <div className="flex items-center gap-3">
            <Scale className="text-muted opacity-60" size={18} strokeWidth={1.5} />
            <div>
              <p className="font-medium text-primary text-sm">Units</p>
              <p className="text-xs text-muted">
                {userProfile?.unitPreference === 'imperial' ? 'Imperial (lbs)' : 'Metric (kg)'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleUnitPreference}
            className="relative w-11 h-6 rounded-full transition-colors"
            style={{
              backgroundColor:
                userProfile?.unitPreference === 'imperial'
                  ? theme === 'amoled'
                    ? '#E1BB62'
                    : theme === 'dark'
                      ? '#0092E6'
                      : '#B482FF'
                  : tokens.surface.accent,
            }}
          >
            <div
              className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
              style={{
                transform:
                  userProfile?.unitPreference === 'imperial' ? 'translateX(20px)' : 'translateX(0)',
              }}
            />
          </button>
        </div>

        {/* Theme Selector */}
        <div className="p-4 relative" ref={themeDropdownRef}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="text-muted opacity-60" size={18} strokeWidth={1.5} />
              <div>
                <p className="font-medium text-primary text-sm">Theme</p>
                <p className="text-xs text-muted">App appearance</p>
              </div>
            </div>
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
              style={{
                backgroundColor: tokens.surface.accent,
                border: `1px solid ${tokens.border.subtle}`,
                color: tokens.text.primary,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.surface.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.surface.accent;
              }}
            >
              <span className="text-sm font-medium">{getThemeLabel(theme)}</span>
              <ChevronDown
                size={14}
                style={{
                  transform: showThemeDropdown ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>
          </div>

          {/* Dropdown Menu - Fixed z-index */}
          {showThemeDropdown && (
            <div
              className="absolute right-4 top-full mt-1 w-32 rounded-lg shadow-xl overflow-hidden"
              style={{
                backgroundColor: tokens.surface.elevated,
                border: `1px solid ${tokens.border.medium}`,
                zIndex: 9999,
              }}
            >
              {(['light', 'dark', 'amoled'] as Theme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleThemeChange(t)}
                  className="w-full px-3 py-2.5 text-left text-sm font-medium transition-colors"
                  style={{
                    backgroundColor:
                      theme === t
                        ? theme === 'amoled'
                          ? '#1A1A1A'
                          : theme === 'dark'
                            ? '#083B73'
                            : 'rgba(180, 130, 255, 0.15)'
                        : 'transparent',
                    color:
                      theme === t
                        ? theme === 'amoled'
                          ? '#F0F0F0'
                          : theme === 'dark'
                            ? '#FFFFFF'
                            : '#B482FF'
                        : tokens.text.primary,
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== t) {
                      e.currentTarget.style.backgroundColor = tokens.surface.hover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== t) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {getThemeLabel(t)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: tokens.statCard.background,
          border: `1px solid ${tokens.statCard.border}`,
        }}
      >
        <button
          className="w-full flex items-center gap-3 p-4 transition-colors text-primary"
          style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.surface.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Settings className="text-muted opacity-60" size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button
          className="w-full flex items-center gap-3 p-4 transition-colors text-primary"
          style={{ borderBottom: `1px solid ${tokens.border.subtle}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.surface.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Download className="text-muted opacity-60" size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">Export Data</span>
        </button>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-4 transition-colors"
          style={{ color: '#EF4444' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && userProfile && (
        <EditProfileModal
          profile={userProfile}
          onClose={() => setShowEditModal(false)}
          onSave={async (updates) => {
            if (!user) return;
            await updateUserProfile(updates);
            await db.users.update(user.id, {
              ...updates,
              updatedAt: new Date(),
            });
            await loadProfile();
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

export default Profile;

// Edit Profile Modal Component
function EditProfileModal({
  profile,
  onClose,
  onSave,
}: {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updates: Partial<UserProfile>) => void;
}) {
  const { theme } = useTheme();
  const tokens = useThemeTokens();
  const [formData, setFormData] = useState({
    name: profile.name,
    goal: profile.goal,
    experienceLevel: profile.experienceLevel,
    currentWeight: profile.currentWeight,
    sex: profile.sex,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
      style={{ zIndex: 9999 }}
    >
      <div
        className="rounded-xl max-w-md w-full p-6"
        style={{
          backgroundColor: tokens.surface.elevated,
          border: `1px solid ${tokens.border.medium}`,
        }}
      >
        <h2 className="text-xl font-bold mb-5 text-primary">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted uppercase tracking-wide">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none text-primary"
              style={{
                backgroundColor: tokens.surface.accent,
                border: `1px solid ${tokens.border.subtle}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = tokens.interactive.focusRing;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = tokens.border.subtle;
              }}
              required
            />
          </div>

          {/* Training Goal */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted uppercase tracking-wide">
              Goal
            </label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value as 'strength' | 'hypertrophy' | 'endurance' | 'general' })}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none text-primary"
              style={{
                backgroundColor: tokens.surface.accent,
                border: `1px solid ${tokens.border.subtle}`,
              }}
            >
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy</option>
              <option value="endurance">Endurance</option>
              <option value="general">General Fitness</option>
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted uppercase tracking-wide">
              Experience
            </label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none text-primary"
              style={{
                backgroundColor: tokens.surface.accent,
                border: `1px solid ${tokens.border.subtle}`,
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Bodyweight */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted uppercase tracking-wide">
              Bodyweight
              <span className="normal-case font-normal ml-1 text-secondary">
                (for strength standards)
              </span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.currentWeight || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  currentWeight: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              placeholder={profile.unitPreference === 'imperial' ? 'lbs' : 'kg'}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none text-primary placeholder:text-muted"
              style={{
                backgroundColor: tokens.surface.accent,
                border: `1px solid ${tokens.border.subtle}`,
              }}
            />
          </div>

          {/* Sex */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted uppercase tracking-wide">
              Sex
              <span className="normal-case font-normal ml-1 text-secondary">
                (for strength standards)
              </span>
            </label>
            <select
              value={formData.sex || 'prefer-not-to-say'}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value as 'male' | 'female' | 'prefer-not-to-say' })}
              className="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none text-primary"
              style={{
                backgroundColor: tokens.surface.accent,
                border: `1px solid ${tokens.border.subtle}`,
              }}
            >
              <option value="prefer-not-to-say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: tokens.button.secondaryBg,
                border: `1px solid ${tokens.button.secondaryBorder}`,
                color: tokens.button.secondaryText,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  tokens.button.secondaryHoverBg || tokens.surface.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.button.secondaryBg;
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: tokens.button.primaryBg,
                color: tokens.button.primaryText,
                border: theme === 'amoled' ? `1px solid ${tokens.button.primaryBorder}` : 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.button.primaryHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.button.primaryBg;
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
