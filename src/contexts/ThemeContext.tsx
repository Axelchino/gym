import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getUserProfile, updateUserProfile } from '../services/supabaseDataService';

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
    // Initial: Use OS detection for guests
    return getSystemTheme();
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // Load theme from profile when user logs in
  useEffect(() => {
    async function loadThemeFromProfile() {
      if (!user) {
        // User logged out - revert to OS detection
        const systemTheme = getSystemTheme();
        setThemeState(systemTheme);
        return;
      }

      // User logged in - load theme from profile
      setIsLoadingProfile(true);
      try {
        const profile = await getUserProfile();
        if (profile?.themePreference) {
          setThemeState(profile.themePreference as Theme);
        }
      } catch (error) {
        console.error('Failed to load theme from profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadThemeFromProfile();
  }, [user]);

  // Update document class when theme changes
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-amoled');

    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);

    // Save to localStorage as backup (for guests)
    localStorage.setItem('gym-tracker-theme', theme);
  }, [theme]);

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
