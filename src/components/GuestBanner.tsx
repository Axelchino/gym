import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getAccentColors, getSelectedColors } from '../utils/themeHelpers';

export function GuestBanner() {
  const navigate = useNavigate();
  const { user, isGuest } = useAuth();
  const { theme } = useTheme();
  const accentColors = getAccentColors(theme);
  const selectedColors = getSelectedColors(theme);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('guest-banner-dismissed') === 'true';
  });

  function handleDismiss() {
    setIsDismissed(true);
    localStorage.setItem('guest-banner-dismissed', 'true');
  }

  // Don't show banner if user is logged in
  if (user) return null;

  // For demo mode (isGuest), make it more prominent and non-dismissible
  if (isGuest) {
    return (
      <div className="bg-yellow-50 border-b-4 border-yellow-400 dark:bg-yellow-900/20 dark:border-yellow-600 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-label="Demo mode icon">
                🎯
              </span>
              <div>
                <p className="font-bold text-yellow-900 dark:text-yellow-100 text-lg">
                  VIEWING DEMO DATA
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This is sample data to showcase the app's features. Sign up to track your own workouts!
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-lg whitespace-nowrap"
            >
              Sign Up to Track YOUR Workouts
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For regular guest mode (not demo), show dismissible banner
  if (isDismissed) return null;

  return (
    <div className="sticky top-0 z-50" style={{ backgroundColor: theme === 'amoled' ? 'rgba(212, 160, 23, 0.08)' : 'rgba(126, 41, 255, 0.08)', borderBottom: `1px solid ${theme === 'amoled' ? 'rgba(212, 160, 23, 0.15)' : 'rgba(126, 41, 255, 0.15)'}` }}>
      <div className="mx-auto px-6 py-3" style={{ maxWidth: '1280px' }}>
        <div className="flex items-center justify-between gap-4">
          {/* Left: Icon + Message */}
          <div className="flex items-center gap-3">
            <AlertCircle size={18} strokeWidth={1.5} className="flex-shrink-0" style={{ color: accentColors.primary, opacity: 0.7 }} />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-sm font-medium text-secondary">
                Guest Mode - workouts won't be saved
              </span>
              <span className="text-xs text-muted">
                Sign up to keep your data
              </span>
            </div>
          </div>

          {/* Right: CTA + Dismiss */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/auth')}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap"
              style={{
                backgroundColor: selectedColors.background,
                color: selectedColors.text,
                border: `1px solid ${selectedColors.border}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = accentColors.backgroundHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = selectedColors.background;
              }}
            >
              Sign Up
            </button>
            <button
              onClick={handleDismiss}
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme === 'amoled' ? 'rgba(212, 160, 23, 0.1)' : 'rgba(126, 41, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Dismiss"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
