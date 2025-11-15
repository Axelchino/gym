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
