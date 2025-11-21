import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'amoled';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Detect OS theme preference
function getSystemTheme(): Theme {
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
  // Try to load theme from localStorage, or detect OS preference
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('gym-tracker-theme');
    if (saved) {
      return saved as Theme;
    }
    // No saved preference - detect OS theme
    return getSystemTheme();
  });

  // Update document class and save to localStorage when theme changes
  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-amoled');

    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);

    // Save to localStorage
    localStorage.setItem('gym-tracker-theme', theme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
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
