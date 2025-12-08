import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateUserProfile } from '../services/supabaseDataService';
import { useUserProfile } from '../hooks/useUserProfile';

export type Theme = 'light' | 'dark' | 'amoled';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Detect OS theme preference (light or dark only - no AMOLED for guests)
function getSystemTheme(): 'light' | 'dark' {
  try {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return 'light';
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    if (mediaQuery && typeof mediaQuery.matches === 'boolean') {
      return mediaQuery.matches ? 'dark' : 'light';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<Theme>(() => {
    // Initial: Use OS detection for guests (don't use localStorage for guests)
    return getSystemTheme();
  });

  // Use React Query to get profile - will be instant if prefetched by AuthContext
  const { data: profile, isLoading: isLoadingProfile } = useUserProfile(user?.id || null);

  // Listen to OS theme changes for guest users
  useEffect(() => {
    if (user) return; // Only for guests

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleThemeChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? 'dark' : 'light';
      setThemeState(systemTheme);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
      return () => mediaQuery.removeEventListener('change', handleThemeChange);
    }
    // Older browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleThemeChange);
      return () => mediaQuery.removeListener(handleThemeChange);
    }
  }, [user]);

  // Apply theme from profile when available
  useEffect(() => {
    if (!user) {
      // User logged out - revert to OS detection and clear any saved theme
      localStorage.removeItem('gym-tracker-theme');
      const systemTheme = getSystemTheme();
      setThemeState(systemTheme);
      return;
    }

    // User logged in - apply theme from profile (instant if cached)
    if (profile?.themePreference) {
      setThemeState(profile.themePreference as Theme);
    }
  }, [user, profile]);

  // Update document class when theme changes
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-amoled');

    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);

    // Save to localStorage only for logged-in users (guests should always use OS theme)
    if (user) {
      localStorage.setItem('gym-tracker-theme', theme);
    }
  }, [theme, user]);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);

    // If user is logged in, save to profile
    if (user && !isLoadingProfile) {
      try {
        await updateUserProfile({
          themePreference: newTheme,
        });
      } catch (error) {
        console.error('Failed to save theme to profile:', error);
      }
    }
    // If guest, theme is already saved to localStorage by useEffect above
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
