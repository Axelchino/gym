import { User, Settings, Download, LogOut, Edit2, Scale, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { db } from '../services/database';
import type { UserProfile, UnitSystem } from '../types/user';
import { getWorkoutLogs, getPersonalRecords } from '../services/supabaseDataService';
import { useTheme, type Theme } from '../contexts/ThemeContext';

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    personalRecords: 0,
    dayStreak: 0,
    totalVolume: 0,
  });

  useEffect(() => {
    loadProfile();
    loadStats();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    // Try to load existing profile or create a new one
    let profile = await db.users.get(user.id);

    if (!profile) {
      // Create profile for new authenticated user
      profile = {
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        goal: 'hypertrophy',
        experienceLevel: 'intermediate',
        unitPreference: 'metric',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.users.add(profile);
    } else {
      // Update name from auth if it's different (in case user changed it in Google)
      const authName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      if (profile.name !== authName && profile.name === 'Gym Tracker User') {
        // Update old default profile with real name
        await db.users.update(user.id, {
          name: authName,
          email: user.email,
          updatedAt: new Date(),
        });
        profile.name = authName;
        profile.email = user.email;
      }
    }

    setUserProfile(profile);
  };

  const toggleUnitPreference = async () => {
    if (!user || !userProfile) return;

    const newUnit: UnitSystem = userProfile.unitPreference === 'metric' ? 'imperial' : 'metric';
    await db.users.update(user.id, {
      unitPreference: newUnit,
      updatedAt: new Date()
    });

    setUserProfile({ ...userProfile, unitPreference: newUnit });
    // Reload stats with new units
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
      // Load workout logs from Supabase
      const logs = await getWorkoutLogs();
      const totalWorkouts = logs.length;

      // Load personal records from Supabase
      const prs = await getPersonalRecords();
      const personalRecords = prs.length;

      // Calculate total volume
      const totalVolume = logs.reduce((sum, log) => {
        const logVolume = log.exercises.reduce((exerciseSum, exercise) => {
          const setVolume = exercise.sets.reduce((setSum, set) => {
            return setSum + (set.weight || 0) * (set.reps || 0);
          }, 0);
          return exerciseSum + setVolume;
        }, 0);
        return sum + logVolume;
      }, 0);

      // Calculate streak (simplified - count workouts in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentWorkouts = logs.filter(log => new Date(log.date) >= sevenDaysAgo).length;

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

  // Get user display name from metadata or email
  const displayName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || 'No email';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="text-gray-400">Manage your account and preferences</p>
      </div>

      {/* User Info Card */}
      <div className="card-elevated">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-primary-blue/20 rounded-full flex items-center justify-center">
            <User size={32} className="text-primary-blue" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-sm text-gray-400">{email}</p>
          </div>
        </div>
        <button onClick={() => setShowEditModal(true)} className="btn-secondary w-full flex items-center justify-center gap-2">
          <Edit2 size={16} />
          Edit Profile
        </button>
      </div>

      {/* Stats Summary */}
      <div className="card-elevated">
        <h3 className="font-semibold mb-3">Your Stats</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-2xl font-bold text-primary-blue">{stats.totalWorkouts}</p>
            <p className="text-sm text-gray-400">Total Workouts</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-green">{stats.personalRecords}</p>
            <p className="text-sm text-gray-400">Personal Records</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary-yellow">{stats.dayStreak}</p>
            <p className="text-sm text-gray-400">Recent Workouts (7d)</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {Math.round(convertWeight(stats.totalVolume)).toLocaleString()} {getWeightUnit()}
            </p>
            <p className="text-sm text-gray-400">Total Volume</p>
          </div>
        </div>
      </div>

      {/* Unit Preference Toggle */}
      <div className="card-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale size={20} className="text-gray-400" />
            <div>
              <h3 className="font-semibold">Unit Preference</h3>
              <p className="text-sm text-gray-400">Weight display units</p>
            </div>
          </div>
          <button
            onClick={toggleUnitPreference}
            className={`relative w-16 h-8 rounded-full transition-colors ${
              userProfile?.unitPreference === 'imperial' ? 'bg-primary-blue' : 'bg-gray-700'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                userProfile?.unitPreference === 'imperial' ? 'translate-x-8' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-400">
          Current: <span className="text-white font-medium">{userProfile?.unitPreference === 'imperial' ? 'Imperial (lbs)' : 'Metric (kg)'}</span>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="card-elevated">
        <div className="flex items-center gap-3 mb-4">
          <Palette size={20} className="text-gray-400" />
          <div>
            <h3 className="font-semibold">Theme</h3>
            <p className="text-sm text-gray-400">Choose your preferred color theme</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'light'
                ? 'border-primary-blue bg-primary-blue/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">☀️</div>
              <div className="font-medium text-sm">Light</div>
              {theme === 'light' && <div className="text-xs text-primary-blue mt-1">Active</div>}
            </div>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'dark'
                ? 'border-primary-blue bg-primary-blue/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">🌙</div>
              <div className="font-medium text-sm">Dark</div>
              {theme === 'dark' && <div className="text-xs text-primary-blue mt-1">Active</div>}
            </div>
          </button>
          <button
            onClick={() => setTheme('amoled')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'amoled'
                ? 'border-primary-blue bg-primary-blue/10'
                : 'border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="text-center">
              <div className="text-2xl mb-1">⬛</div>
              <div className="font-medium text-sm">AMOLED</div>
              {theme === 'amoled' && <div className="text-xs text-primary-blue mt-1">Active</div>}
            </div>
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button className="w-full card hover:border-gray-600 transition-colors flex items-center gap-3 p-4">
          <Settings className="text-gray-400" size={20} />
          <span>Settings</span>
        </button>
        <button className="w-full card hover:border-gray-600 transition-colors flex items-center gap-3 p-4">
          <Download className="text-gray-400" size={20} />
          <span>Export Data</span>
        </button>
        <button
          onClick={handleSignOut}
          className="w-full card hover:border-red-500 transition-colors flex items-center gap-3 p-4 text-red-400"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Account Info */}
      <div className="card bg-gray-800/50 border border-gray-700">
        <p className="text-sm text-gray-400">
          <span className="text-primary-green font-medium">✓ Authenticated:</span> Your data is securely linked to your account and ready for cloud sync
        </p>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && userProfile && (
        <EditProfileModal
          profile={userProfile}
          onClose={() => setShowEditModal(false)}
          onSave={async (updates) => {
            if (!user) return;
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              required
            />
          </div>

          {/* Training Goal */}
          <div>
            <label className="block text-sm font-medium mb-2">Training Goal</label>
            <select
              value={formData.goal}
              onChange={(e) => setFormData({ ...formData, goal: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            >
              <option value="strength">Strength</option>
              <option value="hypertrophy">Hypertrophy (Muscle Growth)</option>
              <option value="endurance">Endurance</option>
              <option value="general">General Fitness</option>
            </select>
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium mb-2">Experience Level</label>
            <select
              value={formData.experienceLevel}
              onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Bodyweight */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Bodyweight (optional)
              <span className="text-xs text-gray-400 ml-2">Used for strength standards</span>
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.currentWeight || ''}
              onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder={profile.unitPreference === 'imperial' ? 'lbs' : 'kg'}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>

          {/* Sex */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Sex (optional)
              <span className="text-xs text-gray-400 ml-2">Used for strength standards</span>
            </label>
            <select
              value={formData.sex || 'prefer-not-to-say'}
              onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            >
              <option value="prefer-not-to-say">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              We respect your privacy. This data stays on your device and is only used for personalized strength comparisons.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button type="submit" className="flex-1 btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
