import { useNavigate } from 'react-router-dom';
import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getAccentColors, getSelectedColors } from '../utils/themeHelpers';

export function GuestBanner() {
  const navigate = useNavigate();
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
