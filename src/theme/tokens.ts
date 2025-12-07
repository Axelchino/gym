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

// Base color constants (to avoid duplication)

// Light mode
const LIGHT_SURFACE_PRIMARY = '#F7F8FA';
const LIGHT_SURFACE_ELEVATED = '#FFFFFF';
const LIGHT_SURFACE_ACCENT = '#F5F5F5';
const LIGHT_BORDER_SUBTLE = '#E6E7EF';
const LIGHT_BORDER_MEDIUM = '#D1D5DB';
const LIGHT_PURPLE_PRIMARY = '#B482FF';
const LIGHT_PURPLE_HOVER = '#C596FF';
const LIGHT_PURPLE_ACTIVE = '#9D6EE8';
const LIGHT_PURPLE_DARK = '#7E29FF';
const LIGHT_TEXT_PRIMARY = '#0F131A';

// Dark mode
const DARK_SURFACE_PRIMARY = '#111827';
const DARK_SURFACE_ELEVATED = '#2A2A3E';
const DARK_BORDER_SUBTLE = '#2A2A3E';
const DARK_BLUE_PRIMARY = '#0092E6';
const DARK_BLUE_HOVER = '#00A2FF';
const DARK_BLUE_ACTIVE = '#007FCC';

// AMOLED mode
const AMOLED_SURFACE_PRIMARY = '#000000';
const AMOLED_SURFACE_CARD = '#1A1A1A';
const AMOLED_SURFACE_ELEVATED = '#3A3A3A';
const AMOLED_BORDER_SUBTLE = '#1A1A1A';
const AMOLED_TEXT_PRIMARY = '#F0F0F0';
const AMOLED_TEXT_SECONDARY = '#D8D8D8';
const AMOLED_GOLD = '#D4A850';

export const themeTokens = {
  light: {
    // Surface colors
    surface: {
      primary: LIGHT_SURFACE_PRIMARY,      // Page background
      elevated: LIGHT_SURFACE_ELEVATED,     // Cards, modals
      accent: LIGHT_SURFACE_ACCENT,       // Subtle highlights
      hover: '#FAFAFA',        // Hover states
    },

    // Text colors
    text: {
      primary: LIGHT_TEXT_PRIMARY,      // Body text, headings
      secondary: '#5B6472',    // Labels, metadata
      muted: '#6B7280',        // Disabled, hints
    },

    // Brand colors
    brand: {
      purple: LIGHT_PURPLE_PRIMARY,       // Primary brand color
      purpleLight: LIGHT_PURPLE_HOVER,  // Hover states
      purpleDark: LIGHT_PURPLE_ACTIVE,   // Active/pressed states
      blue: '#0090CC',         // Secondary accent
      bluePrimary: '#007DB2',  // Charts primary series
    },

    // Borders
    border: {
      subtle: LIGHT_BORDER_SUBTLE,       // Light card borders
      medium: LIGHT_BORDER_MEDIUM,       // Medium borders
      light: '#E5E7EB',        // Lighter borders
    },

    // Component-specific tokens
    chip: {
      background: 'rgba(180, 130, 255, 0.15)',  // Light purple background
      text: LIGHT_PURPLE_PRIMARY,                           // Purple text
      border: 'rgba(180, 130, 255, 0.3)',       // Purple border
    },

    chipGold: {
      background: 'rgba(180, 130, 255, 0.15)',  // Same as regular chip in light mode
      text: LIGHT_PURPLE_PRIMARY,
      border: 'rgba(180, 130, 255, 0.3)',
    },

    statCard: {
      background: LIGHT_SURFACE_ELEVATED,
      border: LIGHT_BORDER_SUBTLE,
      hoverBorder: LIGHT_PURPLE_PRIMARY,    // Purple hover border in light mode
      accentPurple: LIGHT_PURPLE_PRIMARY,
      accentBlue: '#0090CC',
      accentGold: LIGHT_PURPLE_PRIMARY,    // Purple in light mode (same as accentPurple)
      accentGray: '#6B7280',     // Not used in light mode, but needed for type consistency
    },

    button: {
      primaryBg: LIGHT_PURPLE_PRIMARY,
      primaryHover: LIGHT_PURPLE_HOVER,
      primaryActive: LIGHT_PURPLE_ACTIVE,
      primaryText: '#FFFFFF',
      primaryBorder: 'none',          // Light mode has no border on primary buttons
      secondaryBg: 'transparent',
      secondaryBorder: LIGHT_BORDER_MEDIUM,
      secondaryText: LIGHT_TEXT_PRIMARY,
      secondaryHoverBg: LIGHT_SURFACE_ACCENT,
      secondaryHoverBorder: LIGHT_BORDER_MEDIUM,  // Same as regular border in light mode
    },

    navigation: {
      activeIndicator: LIGHT_PURPLE_DARK,      // Active tab border indicator
      linkText: LIGHT_PURPLE_DARK,             // Link text color
      activeButtonBg: LIGHT_PURPLE_PRIMARY,       // Active nav button background
      activeButtonHover: LIGHT_PURPLE_HOVER,    // Active nav button hover
      activeButtonActive: LIGHT_PURPLE_ACTIVE,   // Active nav button pressed
    },

    heroCard: {
      background: LIGHT_SURFACE_ELEVATED,           // Hero card background (not used in light but for consistency)
      chipBg: '#E8D9FF',              // Hero chip background
      chipText: '#6B3FC2',            // Hero chip text
    },

    interactive: {
      linkPurple: LIGHT_PURPLE_DARK,          // Interactive links and "+X more" buttons
      hoverPurple: LIGHT_PURPLE_PRIMARY,         // Hover states for purple elements
      focusRing: LIGHT_PURPLE_PRIMARY,           // Focus ring color
    },

    sparkline: {
      color: LIGHT_PURPLE_PRIMARY,               // Sparkline stroke color (purple in light mode)
      peakDot: LIGHT_PURPLE_DARK,             // Peak dot color (darker purple)
    },
  },

  dark: {
    // Surface colors
    surface: {
      primary: DARK_SURFACE_PRIMARY,      // Page background (Tailwind gray-900)
      elevated: DARK_SURFACE_ELEVATED,     // Cards, modals
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
      subtle: DARK_BORDER_SUBTLE,       // Step lighter than surface
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
      background: DARK_SURFACE_PRIMARY,   // Same as page background
      border: DARK_BORDER_SUBTLE,         // Border for definition
      hoverBorder: DARK_BLUE_HOVER,       // Blue hover border in dark mode
      accentPurple: '#8B42FF',
      accentGold: '#0092E6',  // BLUE for streaks and stats (matches Sign In button)
      accentBlue: '#0084FF',   // Not used but needed for type consistency
      accentGray: '#B8B8C8',   // Not used but needed for type consistency
    },

    button: {
      primaryBg: DARK_BLUE_PRIMARY,        // BLUE primary button in dark mode (not purple!)
      primaryHover: DARK_BLUE_HOVER,       // Lighter blue on hover
      primaryActive: DARK_BLUE_ACTIVE,     // Darker blue when active
      primaryText: '#FFFFFF',
      primaryBorder: 'none',
      secondaryBg: '#1A1A2E',
      secondaryBorder: '#3A3A4E',
      secondaryText: '#E0E0EC',
      secondaryHoverBg: '#2A2A3E',
      secondaryHoverBorder: '#4A4A5E',
    },

    navigation: {
      activeIndicator: DARK_BLUE_PRIMARY,      // Active tab border indicator (BLUE in dark mode)
      linkText: DARK_BLUE_PRIMARY,             // Link text color (BLUE in dark mode)
      activeButtonBg: '#8B42FF',       // Active nav button background (still purple)
      activeButtonHover: '#A56BFF',    // Active nav button hover
      activeButtonActive: '#7433CC',   // Active nav button pressed
    },

    heroCard: {
      background: '#083B73',           // Hero card background (blue surface)
      chipBg: '#006DD4',              // Hero chip background (BLUE not purple!)
      chipText: '#FFFFFF',            // Hero chip text (white)
    },

    interactive: {
      linkPurple: DARK_BLUE_PRIMARY,          // Interactive links and "+X more" buttons (BLUE in dark mode)
      hoverPurple: DARK_BLUE_HOVER,           // Hover states for blue elements
      focusRing: DARK_BLUE_PRIMARY,           // Focus ring color (BLUE in dark mode)
    },

    sparkline: {
      color: '#0092E6',               // Sparkline stroke color (BLUE in dark mode)
      peakDot: '#00A2FF',             // Peak dot color (lighter blue)
    },
  },

  amoled: {
    // Surface colors
    surface: {
      primary: AMOLED_SURFACE_PRIMARY,      // Pure black background
      elevated: AMOLED_SURFACE_ELEVATED,     // Buttons, strips only
      accent: AMOLED_SURFACE_CARD,       // Cards
      hover: '#4A4A4A',        // Hover states
    },

    // Text colors - AMOLED needs bright text on black
    text: {
      primary: AMOLED_TEXT_PRIMARY,      // Bright white for readability
      secondary: AMOLED_TEXT_SECONDARY,    // Labels, metadata
      muted: '#B0B0B0',        // Disabled, hints
      light: '#A0A0A0',        // Very muted text
      badge: '#C8C8C8',        // Badge text
    },

    // Brand colors - BRUTALIST GRAYSCALE + GOLD ONLY
    brand: {
      gold: '#E1BB62',         // ONLY for special micro-accents
      gray: AMOLED_SURFACE_ELEVATED,         // Primary interactive color
      grayLight: '#4A4A4A',    // Hover states
      grayDark: '#2A2A2A',     // Active/pressed states
    },

    // Borders
    border: {
      subtle: AMOLED_BORDER_SUBTLE,       // Subtle on black
      medium: '#2A2A2A',       // Medium borders
      light: AMOLED_SURFACE_ELEVATED,        // Lighter borders
    },

    // Component-specific tokens
    chip: {
      background: AMOLED_SURFACE_CARD,   // Dark gray background
      text: '#C8C8C8',         // Light gray text
      border: '#2A2A2A',       // Subtle gray border
    },

    chipGold: {
      background: 'transparent',
      text: '#E1BB62',
      border: '#E1BB62',       // Gold border for streaks
    },

    statCard: {
      background: AMOLED_SURFACE_PRIMARY,      // Pure black
      border: AMOLED_BORDER_SUBTLE,          // Subtle border
      hoverBorder: AMOLED_TEXT_PRIMARY,     // Bright gray hover border in AMOLED mode
      accentGold: AMOLED_GOLD,      // Mustard/yellow ONLY for streaks (more glowing on AMOLED black)
      accentGray: AMOLED_TEXT_SECONDARY,      // For regular stats
      accentPurple: AMOLED_TEXT_SECONDARY,    // Not used (AMOLED is grayscale), but needed for type consistency
      accentBlue: AMOLED_TEXT_SECONDARY,      // Not used (AMOLED is grayscale), but needed for type consistency
    },

    button: {
      primaryBg: AMOLED_SURFACE_ELEVATED,
      primaryHover: '#4A4A4A',
      primaryActive: '#2A2A2A',
      primaryText: '#FFFFFF',
      primaryBorder: AMOLED_BORDER_SUBTLE,
      secondaryBg: AMOLED_SURFACE_PRIMARY,
      secondaryBorder: AMOLED_SURFACE_ELEVATED,
      secondaryText: AMOLED_TEXT_SECONDARY,
      secondaryHoverBg: AMOLED_SURFACE_CARD,
      secondaryHoverBorder: '#4A4A4A',
    },

    navigation: {
      activeIndicator: AMOLED_SURFACE_ELEVATED,      // Active tab border indicator (gray in AMOLED)
      linkText: AMOLED_TEXT_SECONDARY,             // Link text color (bright gray)
      activeButtonBg: AMOLED_SURFACE_ELEVATED,       // Active nav button background (gray)
      activeButtonHover: '#4A4A4A',    // Active nav button hover
      activeButtonActive: '#2A2A2A',   // Active nav button pressed
    },

    heroCard: {
      background: AMOLED_SURFACE_PRIMARY,           // Hero card background (pure black)
      chipBg: AMOLED_SURFACE_CARD,              // Hero chip background (grayscale)
      chipText: '#C8C8C8',            // Hero chip text (gray)
    },

    interactive: {
      linkPurple: AMOLED_TEXT_SECONDARY,          // Interactive links (grayscale, NOT purple!)
      hoverPurple: AMOLED_TEXT_PRIMARY,         // Hover states (brighter gray)
      focusRing: '#C8C8C8',           // Focus ring color (gray)
    },

    sparkline: {
      color: AMOLED_GOLD,               // Sparkline stroke color (mustard/yellow in AMOLED)
      peakDot: '#E5C870',             // Peak dot color (lighter mustard)
    },
  },
} as const;

// Export type for TypeScript autocomplete
export type Theme = keyof typeof themeTokens;
export type ThemeTokens = typeof themeTokens;
export type LightTokens = typeof themeTokens.light;
export type DarkTokens = typeof themeTokens.dark;
export type AmoledTokens = typeof themeTokens.amoled;
