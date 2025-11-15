/**
 * Chip Component - Theme-aware badge/tag
 *
 * Handles the complex theme logic:
 * - Light: Purple background with dark text
 * - Dark: Purple background (different shade) with purple text
 * - AMOLED: Grayscale background with gray text (NO purple)
 * - Streak variant: Uses gold in dark/AMOLED modes
 */

import { useTheme } from '../../contexts/ThemeContext';
import { getChipStyles } from '../../utils/themeHelpers';

interface ChipProps {
  children: React.ReactNode;
  variant?: 'default' | 'streak';
  className?: string;
}

export function Chip({ children, variant = 'default', className = '' }: ChipProps) {
  const { theme } = useTheme();
  const styles = getChipStyles(theme, variant);

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${className}`}
      style={{
        backgroundColor: styles.background,
        color: styles.text,
        border: `1px solid ${styles.border}`,
      }}
    >
      {children}
    </span>
  );
}
