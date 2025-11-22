/**
 * Theme Helper Utilities
 *
 * Utilities for accessing theme tokens and handling complex conditional logic.
 * Use these when CSS variables aren't enough (e.g., AMOLED uses different colors entirely).
 */

import { useTheme } from '../contexts/ThemeContext';
import { themeTokens, type Theme } from '../theme/tokens';

/**
 * Hook to get theme tokens for the current theme
 *
 * Usage:
 *   const tokens = useThemeTokens();
 *   return <div style={{ color: tokens.text.primary }}>...</div>
 */
export function useThemeTokens() {
  const { theme } = useTheme();
  return themeTokens[theme];
}

/**
 * Get chip styles based on theme and variant
 *
 * AMOLED uses grayscale chips, other themes use purple
 * Streaks use gold in dark/AMOLED modes
 */
export function getChipStyles(theme: Theme, variant: 'default' | 'streak' = 'default') {
  const tokens = themeTokens[theme];

  if (theme === 'amoled') {
    return variant === 'streak' ? tokens.chipGold : tokens.chip;
  }

  if (theme === 'dark') {
    return variant === 'streak' ? tokens.chipGold : tokens.chip;
  }

  // Light mode always uses purple
  return tokens.chip;
}

/**
 * Get stat card accent color based on context
 *
 * AMOLED: Gold for streaks, gray for regular stats
 * Dark: Gold for streaks, purple for regular stats
 * Light: Purple for all
 */
export function getStatCardAccent(theme: Theme, type: 'stat' | 'streak' = 'stat') {
  const tokens = themeTokens[theme];

  if (theme === 'amoled') {
    return type === 'streak' ? tokens.statCard.accentGold : tokens.statCard.accentGray;
  }

  if (theme === 'dark') {
    return type === 'streak' ? tokens.statCard.accentGold : tokens.statCard.accentPurple;
  }

  // Light mode
  return type === 'streak' ? tokens.statCard.accentBlue : tokens.statCard.accentPurple;
}

/**
 * Get button styles based on theme and variant
 */
export function getButtonStyles(theme: Theme, variant: 'primary' | 'secondary' = 'primary') {
  const tokens = themeTokens[theme];

  if (variant === 'primary') {
    return {
      backgroundColor: tokens.button.primaryBg,
      color: tokens.button.primaryText,
      border: theme === 'amoled' ? `1px solid ${tokens.button.primaryBorder}` : 'none',
      hoverBg: tokens.button.primaryHover,
      activeBg: tokens.button.primaryActive,
    };
  }

  // Secondary button
  return {
    backgroundColor: tokens.button.secondaryBg,
    color: tokens.button.secondaryText,
    border: `1px solid ${tokens.button.secondaryBorder}`,
    hoverBg: theme === 'light' ? tokens.button.secondaryHoverBg : undefined,
    hoverBorder: theme === 'light' ? undefined : tokens.button.secondaryHoverBorder,
  };
}

/**
 * Get brand accent colors based on theme
 * AMOLED: Gold/gray (no purple)
 * Dark: Purple
 * Light: Purple
 */
export function getAccentColors(theme: Theme) {
  if (theme === 'amoled') {
    return {
      primary: '#D4A017',      // Gold
      secondary: '#6B7280',    // Gray
      background: '#1A1A1A',   // Dark gray
      backgroundHover: '#2A2A2A',
      text: '#FFFFFF',
      border: 'rgba(255,255,255,0.12)',
    };
  }

  if (theme === 'dark') {
    return {
      primary: '#0092E6',      // Blue (same as Start Workout button)
      secondary: '#006DD4',    // Darker blue
      background: '#0A2A3D',   // Dark blue background
      backgroundHover: '#0D3A52', // Slightly lighter blue
      text: '#FFFFFF',
      border: '#0092E640',
    };
  }

  // Light
  return {
    primary: '#7E29FF',
    secondary: '#B482FF',
    background: '#EDE0FF',
    backgroundHover: '#E4D2FF',
    text: '#7E29FF',
    border: '#D7BDFF',
  };
}

/**
 * Get chart colors based on theme
 * AMOLED uses gold/gray, others use purple
 */
export function getChartColors(theme: Theme) {
  if (theme === 'amoled') {
    return {
      primary: '#D4A017',     // Gold
      secondary: '#6B7280',   // Gray
      tertiary: '#9CA3AF',    // Light gray
      grid: 'rgba(255,255,255,0.1)',
    };
  }

  if (theme === 'dark') {
    return {
      primary: '#0092E6',     // Blue (same as Start Workout button)
      secondary: '#006DD4',   // Darker blue
      tertiary: '#38BDF8',    // Light blue
      grid: 'rgba(255,255,255,0.1)',
    };
  }

  // Light
  return {
    primary: '#B482FF',
    secondary: '#7E29FF',
    tertiary: '#A78BFA',
    grid: 'rgba(0,0,0,0.1)',
  };
}

/**
 * Get selected/active state colors
 */
export function getSelectedColors(theme: Theme) {
  if (theme === 'amoled') {
    return {
      background: '#2A2A2A',
      text: '#D4A017',
      border: '#D4A01740',
    };
  }

  if (theme === 'dark') {
    return {
      background: '#0A2A3D',   // Dark blue background
      text: '#0092E6',         // Blue text
      border: '#0092E640',
    };
  }

  // Light
  return {
    background: '#EDE0FF',
    text: '#7E29FF',
    border: '#D7BDFF',
  };
}
