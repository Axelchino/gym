import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, User, Plus, Dumbbell, RotateCcw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeTokens } from '../../utils/themeHelpers';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const tokens = useThemeTokens();

  // Clear all browser cache and reload
  function clearCacheAndReload() {
    // Clear localStorage
    localStorage.clear();

    // Clear sessionStorage
    sessionStorage.clear();

    // Clear IndexedDB
    if (window.indexedDB) {
      window.indexedDB.databases?.().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        });
      });
    }

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    }

    // Hard reload with cache bypass
    window.location.reload();
  }

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/analytics', label: 'Progress' },
    { to: '/program', label: 'Program' },
    { to: '/exercises', label: 'Exercises' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="mx-auto px-6 py-3" style={{ maxWidth: '1280px' }}>
        <div className="flex items-center">
          {/* Left: Logo */}
          <div className="flex items-center justify-start" style={{ width: '260px' }}>
            <Link to="/" className="flex items-center gap-2 group">
              <Dumbbell className="text-secondary opacity-60 group-hover:opacity-100 transition-opacity" size={24} strokeWidth={1.5} />
              <span className="text-lg font-semibold text-primary tracking-tight">GymTracker Pro</span>
            </Link>
          </div>

          {/* Center: Navigation Tabs & Search */}
          <div className="flex-1 flex items-center justify-center gap-6">
            <nav className="flex items-center gap-1">
              {navLinks.map(({ to, label }) => {
                const isActive = location.pathname === to;
                return (
                  <Link
                    key={to}
                    to={to}
                    className="relative px-4 py-3 text-sm font-medium text-primary hover:text-secondary transition-colors"
                    style={{
                      borderBottom: isActive ? `2px solid ${tokens.navigation.activeIndicator}` : '2px solid transparent',
                    }}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Search */}
            <div style={{ width: '200px' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted opacity-50" size={16} strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search exercises..."
                  className="w-full pl-10 pr-4 py-2 bg-card text-primary text-sm border border-card rounded-md focus:outline-none focus:ring-2 focus:ring-brand-purple/50 focus:border-transparent transition-all placeholder:text-muted"
                />
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3" style={{ width: '260px', justifyContent: 'flex-end' }}>
            {/* Clear Cache Button */}
            <button
              onClick={clearCacheAndReload}
              className="p-2 rounded-md hover:bg-surface-accent transition-colors"
              title="Clear Cache & Reload"
            >
              <RotateCcw className="text-secondary opacity-60 hover:opacity-100 transition-opacity" size={18} strokeWidth={1.5} />
            </button>

            {/* Show different buttons for authenticated vs guest users */}
            {user ? (
              <>
                {/* Profile Button - authenticated only */}
                <button
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-md hover:bg-surface-accent transition-colors"
                  title="Profile"
                >
                  <User className="text-secondary opacity-60 hover:opacity-100 transition-opacity" size={20} strokeWidth={1.5} />
                </button>

                {/* Start Workout - authenticated */}
                <button
                  onClick={() => navigate('/workout')}
                  className="flex items-center gap-2 text-sm font-semibold transition-all focus:outline-none focus-visible:outline-none"
                  style={{
                    backgroundColor: tokens.button.primaryBg,
                    color: tokens.button.primaryText,
                    border: tokens.button.primaryBorder === 'none' ? 'none' : `1px solid ${tokens.button.primaryBorder}`,
                    borderRadius: '10px',
                    height: '40px',
                    paddingLeft: '18px',
                    paddingRight: '18px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.button.primaryHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.button.primaryBg;
                    if (document.activeElement !== e.currentTarget) {
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.button.primaryActive;
                    e.currentTarget.style.transform = 'translateY(1px)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.backgroundColor = tokens.button.primaryHover;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${tokens.interactive.focusRing}`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = tokens.button.primaryBg;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Plus size={16} strokeWidth={2} />
                  Start Workout
                </button>
              </>
            ) : (
              <>
                {/* Try Workout - guest mode - secondary button style */}
                <button
                  onClick={() => navigate('/workout')}
                  className="flex items-center gap-2 text-sm font-medium transition-all focus:outline-none focus-visible:outline-none"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    height: '40px',
                    paddingLeft: '18px',
                    paddingRight: '18px',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    if (document.activeElement !== e.currentTarget) {
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface)';
                    e.currentTarget.style.transform = 'translateY(1px)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(126, 41, 255, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Plus size={16} strokeWidth={2} />
                  Try Workout
                </button>

                {/* Sign In button - guest mode - primary purple button */}
                <button
                  onClick={() => navigate('/auth')}
                  className="flex items-center gap-2 text-sm font-semibold transition-all focus:outline-none focus-visible:outline-none"
                  style={{
                    backgroundColor: '#EDE0FF',
                    color: '#7E29FF',
                    border: '1px solid #D7BDFF',
                    borderRadius: '10px',
                    height: '40px',
                    paddingLeft: '18px',
                    paddingRight: '18px',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#E4D2FF';
                    e.currentTarget.style.borderColor = '#C9B0FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#EDE0FF';
                    e.currentTarget.style.borderColor = '#D7BDFF';
                    if (document.activeElement !== e.currentTarget) {
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.backgroundColor = '#DDC7FF';
                    e.currentTarget.style.borderColor = '#C3A5FF';
                    e.currentTarget.style.transform = 'translateY(1px)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.backgroundColor = '#E4D2FF';
                    e.currentTarget.style.borderColor = '#C9B0FF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px #B482FF';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = '#EDE0FF';
                    e.currentTarget.style.borderColor = '#D7BDFF';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
