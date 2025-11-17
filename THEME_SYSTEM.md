# Theme System Architecture

**Last Updated:** 2025-11-17
**Status:** ✅ Complete (Core Implementation)
**Priority:** COMPLETE - TypeScript token system fully implemented

---

## 🎨 Overview

GymTracker Pro uses a **TypeScript-first theming system** with design token constants for maintainability and type safety. After initial experimentation with CSS variables, we migrated to TypeScript tokens for better control and DRY principles.

### Why This Approach?

After researching how industry leaders (Discord, GitHub, Slack) handle extensive theme libraries, we chose a TypeScript-first approach that prioritizes:

- **DRY Principle:** Color constants defined once at the top, reused everywhere (no hardcoded duplicates)
- **Type Safety:** TypeScript tokens prevent typos and provide autocomplete
- **Maintainability:** Change a color = edit ONE constant instead of hunting through files
- **Flexibility:** JavaScript logic handles complex theme-specific variations (e.g., AMOLED using gold accents instead of purple)
- **Component Control:** Inline styles with `onMouseEnter`/`onMouseLeave` for theme-aware hover states

---

## 🏗️ System Architecture

### Layer 1: Design Token Constants

**Location:** `src/theme/tokens.ts` ✅ **COMPLETE**

Color constants defined at the top of the file to eliminate hardcoded duplicates. Each color exists in exactly ONE place.

```typescript
// Light mode constants
const LIGHT_PURPLE_PRIMARY = '#B482FF';
const LIGHT_SURFACE_ELEVATED = '#FFFFFF';
// ... more constants

// Dark mode constants
const DARK_BLUE_PRIMARY = '#0092E6';
const DARK_SURFACE_PRIMARY = '#111827';
// ... more constants

// AMOLED mode constants
const AMOLED_SURFACE_PRIMARY = '#000000';
const AMOLED_GOLD = '#D4A850';
// ... more constants

export const themeTokens = {
  light: {
    surface: {
      primary: LIGHT_SURFACE_PRIMARY,      // Uses constant
      elevated: LIGHT_SURFACE_ELEVATED,     // Uses constant
    },
    button: {
      primaryBg: LIGHT_PURPLE_PRIMARY,      // Uses constant
      primaryHover: LIGHT_PURPLE_HOVER,     // Uses constant
    },
    statCard: {
      background: LIGHT_SURFACE_ELEVATED,   // Uses constant
      border: LIGHT_BORDER_SUBTLE,          // Uses constant
      hoverBorder: LIGHT_PURPLE_PRIMARY,    // Uses constant
    },
    // ... all properties use constants
  },
  dark: {
    surface: {
      primary: DARK_SURFACE_PRIMARY,        // #111827 (gray-900)
      elevated: DARK_SURFACE_ELEVATED,      // Uses constant
    },
    button: {
      primaryBg: DARK_BLUE_PRIMARY,         // BLUE for dark mode (#0092E6)
      primaryHover: DARK_BLUE_HOVER,        // Uses constant
      primaryActive: DARK_BLUE_ACTIVE,      // Uses constant
    },
    interactive: {
      linkPurple: DARK_BLUE_PRIMARY,        // BLUE for links in dark mode
      hoverPurple: DARK_BLUE_HOVER,         // BLUE for hovers
    },
    navigation: {
      activeIndicator: DARK_BLUE_PRIMARY,   // BLUE tab indicators
    },
    // ... all properties use constants
  },
  amoled: {
    surface: {
      primary: '#000000',       // Pure black for OLED
      elevated: '#3A3A3A',      // Buttons, strips
      accent: '#1A1A1A',        // Cards
    },
    text: {
      primary: '#F0F0F0',
      secondary: '#D8D8D8',
      muted: '#B0B0B0',
    },
    brand: {
      gold: '#E1BB62',          // Gold instead of purple (brutalist)
      gray: '#3A3A3A',          // Primary interactive color
    },
  },
} as const;
```

**Why TypeScript tokens:**
- Type-safe access with autocomplete
- Prevents typos and invalid color references
- Easy testing and validation
- Single source of truth for design decisions

### Layer 2: CSS Variables (Runtime)

**Location:** `src/styles/themes.css`

CSS variables map to the TypeScript tokens and get applied dynamically based on the active theme class.

```css
.theme-light {
  --surface-primary: #F7F8FA;
  --surface-elevated: #FFFFFF;
  --text-primary: #0F131A;
  --text-secondary: #5B6472;
  --brand-purple: #B482FF;
}

.theme-dark {
  --surface-primary: #1A1A2E;
  --surface-elevated: #2A2A3E;
  --text-primary: #FFFFFF;
  --text-secondary: #E0E0EC;
  --brand-purple: #8B42FF;
  --brand-gold: #E1BB62;
}

.theme-amoled {
  --surface-primary: #000000;
  --surface-elevated: #3A3A3A;
  --text-primary: #F0F0F0;
  --text-secondary: #D8D8D8;
  --brand-gold: #E1BB62;
}
```

**Why CSS variables:**
- Fast (no re-render needed when switching themes)
- Works with Tailwind utility classes
- Browser-native, widely supported
- Easy to override at component level

### Layer 3: React Context (State Management)

**Location:** `src/contexts/ThemeContext.tsx`

Manages theme state and applies the correct theme class to the DOM.

```typescript
export type Theme = 'light' | 'dark' | 'amoled';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-amoled');

    // Add current theme class
    document.documentElement.classList.add(`theme-${theme}`);

    // Persist to localStorage
    localStorage.setItem('gym-tracker-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### Layer 4: Theme Utilities (Helper Functions)

**Location:** `src/utils/themeHelpers.ts` ✅ **COMPLETE**

For complex conditional logic that CSS can't handle (e.g., AMOLED uses gold, other themes use purple).

```typescript
import { useTheme } from '../contexts/ThemeContext';
import { themeTokens } from '../theme/tokens';

export function useThemeTokens() {
  const { theme } = useTheme();
  return themeTokens[theme];
}

// Example: Get accent color based on context
export function getAccentColor(theme: Theme, context: 'stat' | 'streak' | 'exercise') {
  if (theme === 'amoled') {
    return context === 'streak' ? '#E1BB62' : '#D8D8D8'; // Gold for streaks, gray otherwise
  }
  if (theme === 'dark') {
    return context === 'streak' ? '#E1BB62' : '#8B42FF'; // Gold for streaks, purple otherwise
  }
  return '#B482FF'; // Light mode always purple
}
```

---

## 🎭 Theme Design Philosophy

### Design System Reference: ThreeModesDemo

**Location:** `src/pages/ThreeModesDemo.tsx`

This page is our **living style guide** showing how each theme should be implemented. All components should reference this for consistency.

### Global Rules (All Themes)

1. **Color placement:** Only hero cards/CTAs use filled brand colors. Stats and exercise cards use neutral surfaces with colored accents (top rule or left rail).

2. **Gold usage (`#E1BB62`):** Lines, icons, and tiny tags only. NEVER use gold as a card fill in Dark or AMOLED. Gold ONLY on pure black backgrounds for micro-accents.

3. **Icon contrast:** Small glyphs/badges must be one step brighter than body text on dark backgrounds.

4. **Borders on dark:** Every dark/black surface gets a 1px border:
   - Dark Mode: `#2A2A3E` (one step lighter than surface)
   - AMOLED: `#1A1A1A`

5. **Active vs Inactive:** Inactive buttons = outline; active = filled with brand color.

6. **Accessibility:**
   - Body text ≥ 4.5:1 contrast ratio
   - Large text ≥ 3:1 contrast ratio
   - Focus ring = 2px with ≥ 3:1 contrast
   - Touch targets ≥ 44px

### Light Mode - "Elegant Day Look"

**Philosophy:** Clean, professional, Apple-inspired

**Colors:**
- Surface: `#FFFFFF` (pure white cards)
- Background: `#F7F8FA` (very light neutral gray)
- Purple: `#B482FF` (lavender base)
- Blue: `#0090CC` (general accent)
- Text: `#0F131A` (near-black, always readable)

**Design patterns:**
- White cards with thin light-gray borders
- Purple for primary actions and links
- Blue for secondary accents
- Chips: Light gray background with dark text
- NO colored card fills (white cards only)

### Dark Mode - "Stage Presence"

**Philosophy:** Rich, theatrical, confident

**Colors:**
- Surface: `#111827` (Tailwind gray-900) - **UPDATED 2025-11-17**
- Primary Buttons/Interactive: `#0092E6` (BLUE, not purple) - **UPDATED 2025-11-17**
- Tab Navigation: `#0092E6` (BLUE) - **UPDATED 2025-11-17**
- Purple (navigation buttons only): `#8B42FF`
- Hero Cards: `#083B73` (deep blue surface)
- Gold: `#E1BB62` (special accents like streaks)
- Text: `#FFFFFF` (pure white)

**Design patterns:**
- **BLUE primary buttons** (`#0092E6`) for all CTAs - **CHANGED FROM PURPLE**
- Blue hero cards (`#083B73`) for important CTAs
- **BLUE tab indicators** and hover states - **CHANGED FROM PURPLE**
- Purple navigation buttons (active state)
- Gold accents for streaks (special/rare)
- Stat cards match page background (`#111827`) - **UPDATED 2025-11-17**
- Subtle borders (`#2A2A3E`) for definition

### AMOLED Mode - "Pure Black + Brutalist Grays"

**Philosophy:** Minimal, grayscale-focused, battery-saving

**Colors:**
- Background: `#000000` (pure black)
- Surface: `#3A3A3A` (buttons/strips only)
- Text: `#F0F0F0` (bright white for readability)
- Border: `#1A1A1A` (subtle on black)
- Gold: `#E1BB62` (ONLY for special micro-accents)

**Design patterns:**
- **NO PURPLE** - Brutalist grayscale aesthetic
- Black cards with `#1A1A1A` borders
- Gold ONLY for streaks (as border accent)
- All interactive elements use gray (`#3A3A3A`)
- Chips and tags: Grayscale only
- OLED-friendly (pure black saves battery)

---

## 🔧 Implementation Guidelines

### When to Use CSS Variables

Use CSS variables for:
- ✅ Simple color swaps (text, backgrounds, borders)
- ✅ Consistent spacing and sizing
- ✅ Performance-critical frequent updates
- ✅ Tailwind utility classes

```tsx
// Good: Simple color swap
<div className="bg-surface-elevated text-primary border border-border-subtle">
  Content
</div>

// Good: Inline CSS variable
<div style={{
  backgroundColor: 'var(--surface-elevated)',
  color: 'var(--text-primary)'
}}>
  Content
</div>
```

### When to Use TypeScript Tokens

Use TypeScript tokens for:
- ✅ Complex conditional logic (AMOLED has different accent color)
- ✅ Component-specific theme variations
- ✅ Dynamic color calculations
- ✅ Type-safe theme access

```tsx
// Good: Complex conditional logic
function StatCard({ type }: { type: 'workout' | 'streak' }) {
  const tokens = useThemeTokens();
  const { theme } = useTheme();

  const accentColor = theme === 'amoled' && type === 'streak'
    ? tokens.brand.gold
    : tokens.brand.purple;

  return <div style={{ borderColor: accentColor }}>...</div>;
}
```

### Component Patterns

#### Pattern 1: CSS-Only Theming (Simple)

```tsx
// Use when all themes can share the same structure
function SimpleCard() {
  return (
    <div className="bg-surface-elevated text-primary border border-border-subtle rounded-lg p-4">
      <h3 className="text-primary">Title</h3>
      <p className="text-secondary">Description</p>
    </div>
  );
}
```

#### Pattern 2: Hybrid Theming (Complex)

```tsx
// Use when themes need different values beyond simple colors
function ChipBadge({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  // AMOLED uses different style entirely
  const chipStyles = theme === 'amoled'
    ? {
        backgroundColor: '#1A1A1A',
        color: '#C8C8C8',
        border: '1px solid #2A2A2A'
      }
    : {
        backgroundColor: 'rgba(180, 130, 255, 0.15)',
        color: theme === 'dark' ? '#8B42FF' : '#B482FF',
        border: `1px solid rgba(180, 130, 255, 0.3)`
      };

  return (
    <span style={chipStyles} className="px-2 py-1 text-xs font-medium rounded">
      {children}
    </span>
  );
}
```

#### Pattern 3: Reusable UI Components (Best for Portfolio)

```tsx
// Create a component library for common patterns
// src/components/ui/Chip.tsx

type ChipVariant = 'default' | 'accent' | 'streak';

interface ChipProps {
  children: React.ReactNode;
  variant?: ChipVariant;
}

export function Chip({ children, variant = 'default' }: ChipProps) {
  const { theme } = useTheme();
  const tokens = useThemeTokens();

  const getChipStyle = () => {
    if (theme === 'amoled') {
      return {
        backgroundColor: variant === 'streak' ? 'transparent' : '#1A1A1A',
        color: variant === 'streak' ? tokens.brand.gold : '#C8C8C8',
        border: variant === 'streak'
          ? `1px solid ${tokens.brand.gold}`
          : '1px solid #2A2A2A'
      };
    }

    // Light and dark use purple with different shades
    return {
      backgroundColor: 'rgba(180, 130, 255, 0.15)',
      color: theme === 'dark' ? tokens.brand.purple : '#B482FF',
      border: '1px solid rgba(180, 130, 255, 0.3)'
    };
  };

  return (
    <span
      style={getChipStyle()}
      className="inline-block px-2 py-0.5 text-xs font-medium rounded"
    >
      {children}
    </span>
  );
}
```

---

## 📋 Current Status

### ✅ Completed (2025-11-17)

- [x] ThemeContext with localStorage persistence
- [x] CSS variables defined in `themes.css`
- [x] Light/Dark/AMOLED base colors established
- [x] ThreeModesDemo as living style guide
- [x] Basic theme switching UI
- [x] **TypeScript design tokens file created** (`src/theme/tokens.ts`)
- [x] **Color constants architecture** (DRY principle - no hardcoded duplicates)
- [x] **Theme utilities** (`src/utils/themeHelpers.ts`)
- [x] **Reusable Chip component** (`src/components/ui/Chip.tsx`)
- [x] **Dashboard stat cards migrated** to TypeScript tokens
- [x] **Dark mode colors fixed** to match ThreeModesDemo reference
- [x] **Component-level hover handlers** (replaced CSS :hover rules)

### 🚧 In Progress

- [ ] Build remaining UI components (`<StatCard>`, `<Button>`, `<Card>`)
- [ ] Migrate remaining pages to use TypeScript tokens
- [ ] Complete Dashboard theme polish (all 3 modes tested)

### 📝 TODO

- [ ] Build Storybook or component showcase for UI library
- [ ] Add theme preview in settings
- [ ] Optimize for reduced motion preferences
- [ ] High contrast mode for accessibility

---

## 🧪 Testing Checklist

When implementing theme-aware components, verify:

**Light Mode:**
- [ ] All text is readable (≥4.5:1 contrast)
- [ ] Cards are white with subtle borders
- [ ] Purple accents stand out clearly
- [ ] No harsh shadows

**Dark Mode:**
- [ ] Text is bright white on dark surfaces
- [ ] Purple uses `#8B42FF` (not light mode purple)
- [ ] Gold accents used sparingly (streaks only)
- [ ] All borders visible (`#2A2A3E`)

**AMOLED Mode:**
- [ ] Background is pure black (`#000000`)
- [ ] NO purple accents (grayscale + gold only)
- [ ] Gold ONLY for special micro-accents
- [ ] All text readable on black (≥4.5:1)
- [ ] Borders visible (`#1A1A1A`)

---

## 🎓 Lessons Learned

### What Worked Well

1. **TypeScript constants architecture:** DRY principle eliminated hardcoded duplicates - change one constant, updates everywhere
2. **ThreeModesDemo as reference:** Having a single source of truth prevents inconsistencies
3. **Component-level hover handlers:** More control than CSS :hover, fully theme-aware
4. **Type safety:** TypeScript caught errors during refactor before runtime

### What Didn't Work

1. **Initial CSS variable approach:** Required maintaining parallel systems (CSS + TypeScript)
2. **Hardcoded colors in components:** Found many instances of `#B482FF` duplicated 15+ times
3. **Inconsistent purple usage:** Light mode purple (`#B482FF`) was used in dark mode (should be `#8B42FF`)
4. **Missing AMOLED-specific logic:** Many components assumed purple was always appropriate
5. **Dark mode wrong colors initially:** Used purple buttons instead of blue, wrong page background

### Key Insights (Updated 2025-11-17)

- **DRY principle is critical:** Hardcoded duplicates made theme changes error-prone and time-consuming
- **Constants enable refactoring confidence:** Change a color constant, TypeScript shows all affected components
- **Dark mode needs blue, not purple:** Primary buttons and interactive elements should be `#0092E6` blue
- **AMOLED is fundamentally different:** It's not just "dark mode but darker" - it's a brutalist grayscale aesthetic
- **Gold is special:** In dark themes, gold signifies rare/important things (streaks, achievements)
- **Reference design is essential:** ThreeModesDemo prevented guesswork and inconsistencies

---

## 🔮 Future Enhancements

### Short Term
- Component library (`Chip`, `Button`, `Card`, `StatTile`)
- Theme documentation site (Storybook)
- TypeScript design tokens file

### Long Term
- Custom theme builder (user-defined colors)
- High contrast mode for accessibility
- Seasonal themes (holiday variants)
- Export/import custom themes

---

## 📚 References & Inspiration

**Industry Examples:**
- **Discord:** Hybrid CSS variables + JS theme objects for complex logic
- **GitHub:** Design tokens with semantic naming conventions
- **Slack:** Component-based theming with dark mode variants
- **Notion:** Seamless theme switching without flicker

**Resources:**
- [Discord Design System](https://discord.com/branding) - Color usage philosophy
- [GitHub Primer](https://primer.style/) - Design token architecture
- [Material Design 3](https://m3.material.io/styles/color/dynamic-color/overview) - Dynamic theming
- [Apple HIG Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode) - Contrast and vibrancy

**Our Approach:**
- Inspired by Discord's hybrid system (CSS + JS)
- Adapted GitHub's token naming conventions
- Applied Apple's dark mode contrast principles
- Added our own brutalist AMOLED aesthetic

---

## 💡 For Portfolio Reviewers

This theme system demonstrates:

✅ **System Design:** Hybrid architecture balancing performance and flexibility
✅ **Type Safety:** TypeScript tokens prevent runtime errors
✅ **Best Practices:** Separation of concerns (CSS for simple, TS for complex)
✅ **Scalability:** Easy to add new themes without touching components
✅ **Accessibility:** WCAG AA contrast ratios enforced
✅ **User Experience:** Instant theme switching, persistent preferences

The approach is production-ready and mirrors systems used by Discord, GitHub, and other industry leaders.

---

**Last Updated:** 2025-11-17
**Status:** Core implementation complete, additional UI components planned
**Next Review:** When remaining UI components (`StatCard`, `Button`, `Card`) are built
**Owner:** Axelchino
