/**
 * Design Tokens - GymTracker Pro Theme System
 *
 * Single source of truth for all theme values.
 * Inspired by Discord, GitHub Primer, and Slack design systems.
 *
 * Usage:
 *   import { themeTokens } from '@/theme/tokens';
 *   const tokens = themeTokens[theme]; // theme = 'light' | 'dark' | 'amoled'
 */

export const themeTokens = {
  light: {
    // Surface colors
    surface: {
      primary: '#F7F8FA',      // Page background
      elevated: '#FFFFFF',     // Cards, modals
      accent: '#F5F5F5',       // Subtle highlights
      hover: '#FAFAFA',        // Hover states
    },

    // Text colors
    text: {
      primary: '#0F131A',      // Body text, headings
      secondary: '#5B6472',    // Labels, metadata
      muted: '#6B7280',        // Disabled, hints
    },

    // Brand colors
    brand: {
      purple: '#B482FF',       // Primary brand color
      purpleLight: '#C596FF',  // Hover states
      purpleDark: '#9D6EE8',   // Active/pressed states
      blue: '#0090CC',         // Secondary accent
      bluePrimary: '#007DB2',  // Charts primary series
    },

    // Borders
    border: {
      subtle: '#E6E7EF',       // Light card borders
      medium: '#D1D5DB',       // Medium borders
      light: '#E5E7EB',        // Lighter borders
    },

    // Component-specific tokens
    chip: {
      background: 'rgba(180, 130, 255, 0.15)',  // Light purple background
      text: '#B482FF',                           // Purple text
      border: 'rgba(180, 130, 255, 0.3)',       // Purple border
    },

    chipGold: {
      background: 'rgba(180, 130, 255, 0.15)',  // Same as regular chip in light mode
      text: '#B482FF',
      border: 'rgba(180, 130, 255, 0.3)',
    },

    statCard: {
      background: '#FFFFFF',
      border: '#E6E7EF',
      accentPurple: '#B482FF',
      accentBlue: '#0090CC',
      accentGold: '#E1BB62',    // Not used in light mode, but needed for type consistency
      accentGray: '#6B7280',     // Not used in light mode, but needed for type consistency
    },

    button: {
      primaryBg: '#B482FF',
      primaryHover: '#C596FF',
      primaryActive: '#9D6EE8',
      primaryText: '#FFFFFF',
      primaryBorder: 'none',          // Light mode has no border on primary buttons
      secondaryBg: 'transparent',
      secondaryBorder: '#D1D5DB',
      secondaryText: '#0F131A',
      secondaryHoverBg: '#F5F5F5',
      secondaryHoverBorder: '#D1D5DB',  // Same as regular border in light mode
    },
  },

  dark: {
    // Surface colors
    surface: {
      primary: '#1A1A2E',      // Page background
      elevated: '#2A2A3E',     // Cards, modals
      accent: '#3A3A4E',       // Subtle highlights
      hover: '#4A4A5E',        // Hover states
      blue: '#083B73',         // Hero card background
    },

    // Text colors
    text: {
      primary: '#FFFFFF',      // Body text, headings
      secondary: '#E0E0EC',    // Labels, metadata
      muted: '#B8B8C8',        // Disabled, hints
      light: '#8A8A9A',        // Very muted text
      onBlue: '#EAF2FF',       // Text on blue surfaces
      onBlueMuted: '#CFDAF5',  // Muted text on blue
    },

    // Brand colors
    brand: {
      purple: '#8B42FF',       // Different purple for dark mode!
      purpleLight: '#A56BFF',  // Hover states
      purpleDark: '#7433CC',   // Active/pressed states
      blue: '#0084FF',         // Secondary accent
      blueLight: '#3AA0FF',    // Lighter blue for borders
      bluePrimary: '#0092E6',  // Charts primary series
      blueHover: '#00A2FF',    // Button hover
      blueActive: '#007FCC',   // Button active
      gold: '#E1BB62',         // Special accents (streaks)
    },

    // Borders
    border: {
      subtle: '#2A2A3E',       // Step lighter than surface
      medium: '#3A3A4E',       // Medium borders
      light: '#4A4A5E',        // Lighter borders
    },

    // Component-specific tokens
    chip: {
      background: '#006DD4',     // Blue background (NOT purple!)
      text: '#FFFFFF',            // White text
      border: 'transparent',      // No border in dark mode
    },

    chipGold: {
      background: 'rgba(225, 187, 98, 0.15)',
      text: '#E1BB62',
      border: 'rgba(225, 187, 98, 0.3)',
    },

    statCard: {
      background: '#1A1A2E',
      border: '#2A2A3E',
      accentPurple: '#8B42FF',
      accentGold: '#E1BB62',  // For streaks
      accentBlue: '#0084FF',   // Not used but needed for type consistency
      accentGray: '#B8B8C8',   // Not used but needed for type consistency
    },

    button: {
      primaryBg: '#8B42FF',
      primaryHover: '#A56BFF',
      primaryActive: '#7433CC',
      primaryText: '#FFFFFF',
      primaryBorder: 'none',
      secondaryBg: '#1A1A2E',
      secondaryBorder: '#3A3A4E',
      secondaryText: '#E0E0EC',
      secondaryHoverBg: '#2A2A3E',
      secondaryHoverBorder: '#4A4A5E',
    },
  },

  amoled: {
    // Surface colors
    surface: {
      primary: '#000000',      // Pure black background
      elevated: '#3A3A3A',     // Buttons, strips only
      accent: '#1A1A1A',       // Cards
      hover: '#4A4A4A',        // Hover states
    },

    // Text colors - AMOLED needs bright text on black
    text: {
      primary: '#F0F0F0',      // Bright white for readability
      secondary: '#D8D8D8',    // Labels, metadata
      muted: '#B0B0B0',        // Disabled, hints
      light: '#A0A0A0',        // Very muted text
      badge: '#C8C8C8',        // Badge text
    },

    // Brand colors - BRUTALIST GRAYSCALE + GOLD ONLY
    brand: {
      gold: '#E1BB62',         // ONLY for special micro-accents
      gray: '#3A3A3A',         // Primary interactive color
      grayLight: '#4A4A4A',    // Hover states
      grayDark: '#2A2A2A',     // Active/pressed states
    },

    // Borders
    border: {
      subtle: '#1A1A1A',       // Subtle on black
      medium: '#2A2A2A',       // Medium borders
      light: '#3A3A3A',        // Lighter borders
    },

    // Component-specific tokens
    chip: {
      background: '#1A1A1A',   // Dark gray background
      text: '#C8C8C8',         // Light gray text
      border: '#2A2A2A',       // Subtle gray border
    },

    chipGold: {
      background: 'transparent',
      text: '#E1BB62',
      border: '#E1BB62',       // Gold border for streaks
    },

    statCard: {
      background: '#000000',      // Pure black
      border: '#1A1A1A',          // Subtle border
      accentGold: '#E1BB62',      // ONLY for streaks
      accentGray: '#D8D8D8',      // For regular stats
      accentPurple: '#D8D8D8',    // Not used (AMOLED is grayscale), but needed for type consistency
      accentBlue: '#D8D8D8',      // Not used (AMOLED is grayscale), but needed for type consistency
    },

    button: {
      primaryBg: '#3A3A3A',
      primaryHover: '#4A4A4A',
      primaryActive: '#2A2A2A',
      primaryText: '#FFFFFF',
      primaryBorder: '#1A1A1A',
      secondaryBg: '#000000',
      secondaryBorder: '#3A3A3A',
      secondaryText: '#D8D8D8',
      secondaryHoverBg: '#1A1A1A',
      secondaryHoverBorder: '#4A4A4A',
    },
  },
} as const;

// Export type for TypeScript autocomplete
export type Theme = keyof typeof themeTokens;
export type ThemeTokens = typeof themeTokens;
export type LightTokens = typeof themeTokens.light;
export type DarkTokens = typeof themeTokens.dark;
export type AmoledTokens = typeof themeTokens.amoled;
