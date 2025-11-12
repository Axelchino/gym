/**
 * Strength standards calculator based on bodyweight ratios
 * Uses SymmetricStrength.com methodology
 */

export type StrengthLevel = 'Beginner' | 'Novice' | 'Intermediate' | 'Advanced' | 'Elite' | 'World Class';
export type StandardType = 'general' | 'powerlifting';

export interface StrengthStandard {
  exercise: string;
  level: StrengthLevel;
  percentage: number; // Progress toward next level (0-100)
  percentile: number; // Percentile rank (1-100, lower = better)
  currentRatio: number; // Weight lifted / bodyweight
  nextLevelRatio: number; // Ratio needed for next level
  nextLevelWeight: number; // Weight needed for next level
}

// ExRx.net Standards (General Gym Population - Natural Lifters)
const STANDARDS_GENERAL_MALE = {
  'Squat': {
    beginner: 0.65,
    novice: 1.15,
    intermediate: 1.50,
    advanced: 1.90,
    elite: 2.30,
    worldClass: 2.65,
  },
  'Bench Press': {
    beginner: 0.45,
    novice: 0.75,
    intermediate: 1.10,
    advanced: 1.45,
    elite: 1.80,
    worldClass: 2.05,
  },
  'Deadlift': {
    beginner: 0.90,
    novice: 1.40,
    intermediate: 1.80,
    advanced: 2.25,
    elite: 2.70,
    worldClass: 3.10,
  },
  'Overhead Press': {
    beginner: 0.30,
    novice: 0.50,
    intermediate: 0.75,
    advanced: 1.00,
    elite: 1.30,
    worldClass: 1.50,
  },
};

const STANDARDS_GENERAL_FEMALE = {
  'Squat': {
    beginner: 0.45,
    novice: 0.75,
    intermediate: 1.05,
    advanced: 1.35,
    elite: 1.70,
    worldClass: 1.95,
  },
  'Bench Press': {
    beginner: 0.25,
    novice: 0.45,
    intermediate: 0.65,
    advanced: 0.90,
    elite: 1.15,
    worldClass: 1.30,
  },
  'Deadlift': {
    beginner: 0.55,
    novice: 0.90,
    intermediate: 1.25,
    advanced: 1.60,
    elite: 2.00,
    worldClass: 2.30,
  },
  'Overhead Press': {
    beginner: 0.20,
    novice: 0.35,
    intermediate: 0.50,
    advanced: 0.65,
    elite: 0.85,
    worldClass: 0.98,
  },
};

// SymmetricStrength Standards (Competitive Powerlifting)
const STANDARDS_POWERLIFTING_MALE = {
  'Squat': {
    beginner: 0.75,
    novice: 1.25,
    intermediate: 1.75,
    advanced: 2.25,
    elite: 2.75,
    worldClass: 3.15,
  },
  'Bench Press': {
    beginner: 0.50,
    novice: 0.75,
    intermediate: 1.25,
    advanced: 1.75,
    elite: 2.25,
    worldClass: 2.60,
  },
  'Deadlift': {
    beginner: 1.00,
    novice: 1.50,
    intermediate: 2.00,
    advanced: 2.50,
    elite: 3.00,
    worldClass: 3.45,
  },
  'Overhead Press': {
    beginner: 0.35,
    novice: 0.55,
    intermediate: 0.85,
    advanced: 1.15,
    elite: 1.50,
    worldClass: 1.75,
  },
};

const STANDARDS_POWERLIFTING_FEMALE = {
  'Squat': {
    beginner: 0.50,
    novice: 0.85,
    intermediate: 1.25,
    advanced: 1.60,
    elite: 2.00,
    worldClass: 2.30,
  },
  'Bench Press': {
    beginner: 0.30,
    novice: 0.50,
    intermediate: 0.75,
    advanced: 1.10,
    elite: 1.50,
    worldClass: 1.75,
  },
  'Deadlift': {
    beginner: 0.65,
    novice: 1.00,
    intermediate: 1.40,
    advanced: 1.75,
    elite: 2.15,
    worldClass: 2.47,
  },
  'Overhead Press': {
    beginner: 0.20,
    novice: 0.35,
    intermediate: 0.55,
    advanced: 0.75,
    elite: 1.00,
    worldClass: 1.15,
  },
};

const LEVEL_ORDER: StrengthLevel[] = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite', 'World Class'];

/**
 * Map strength level to percentile rank (1-100, lower = better)
 * Based on research: Elite = top 2.5%, Novice = stronger than ~20%
 * Returns granular percentile within tier based on progress through that tier
 */
function getPercentileFromLevel(
  level: StrengthLevel,
  ratio: number,
  currentLevelThreshold: number,
  nextLevelThreshold: number
): number {
  // Special handling for World Class (no next level)
  if (level === 'World Class') {
    // Already at max tier - show top 1.0% baseline
    // If significantly beyond threshold (20%+ stronger), show 0.1%
    const percentBeyond = ((ratio - currentLevelThreshold) / currentLevelThreshold) * 100;
    if (percentBeyond >= 20) {
      return 0.1; // Exceptional, way beyond World Class standards
    }
    // Interpolate between 1.0% and 1.5% for those just at World Class
    return Math.max(1.0, 1.5 - (percentBeyond / 20) * 0.5);
  }

  // Calculate progress through current tier (0-1)
  const tierProgress = (ratio - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold);
  const clampedProgress = Math.max(0, Math.min(1, tierProgress));

  switch (level) {
    case 'Elite':
      // Top 1.6-9%, interpolate within range
      return 9.0 - (clampedProgress * 7.4);
    case 'Advanced':
      // Top 10-29%, interpolate within range
      return 29.0 - (clampedProgress * 19.0);
    case 'Intermediate':
      // Top 30-49%, interpolate within range
      return 49.0 - (clampedProgress * 19.0);
    case 'Novice':
      // Top 50-79%, interpolate within range
      return 79.0 - (clampedProgress * 29.0);
    case 'Beginner':
      // Bottom 80-100%, interpolate within range
      return 100.0 - (clampedProgress * 20.0);
    default:
      return 95.0;
  }
}

/**
 * Calculate strength level for a given exercise
 */
export function calculateStrengthLevel(
  exerciseName: string,
  weightLifted: number,
  bodyweight: number,
  sex: 'male' | 'female' = 'male',
  standardType: StandardType = 'general'
): StrengthStandard | null {
  // Normalize exercise name to match standards
  const normalizedName = normalizeExerciseName(exerciseName);

  // Select appropriate standards
  let standards;
  if (standardType === 'powerlifting') {
    standards = sex === 'male' ? STANDARDS_POWERLIFTING_MALE : STANDARDS_POWERLIFTING_FEMALE;
  } else {
    standards = sex === 'male' ? STANDARDS_GENERAL_MALE : STANDARDS_GENERAL_FEMALE;
  }

  const exerciseStandards = standards[normalizedName as keyof typeof standards];

  if (!exerciseStandards) {
    return null; // Exercise not supported
  }

  const ratio = weightLifted / bodyweight;

  // Determine current level (including World Class)
  let level: StrengthLevel = 'Beginner';
  let nextLevelRatio = exerciseStandards.novice;

  if (ratio >= exerciseStandards.worldClass) {
    level = 'World Class';
    nextLevelRatio = exerciseStandards.worldClass; // Already at max
  } else if (ratio >= exerciseStandards.elite) {
    level = 'Elite';
    nextLevelRatio = exerciseStandards.worldClass;
  } else if (ratio >= exerciseStandards.advanced) {
    level = 'Advanced';
    nextLevelRatio = exerciseStandards.elite;
  } else if (ratio >= exerciseStandards.intermediate) {
    level = 'Intermediate';
    nextLevelRatio = exerciseStandards.advanced;
  } else if (ratio >= exerciseStandards.novice) {
    level = 'Novice';
    nextLevelRatio = exerciseStandards.intermediate;
  } else if (ratio >= exerciseStandards.beginner) {
    level = 'Beginner';
    nextLevelRatio = exerciseStandards.novice;
  }

  // Get current level threshold for percentile calculation
  const currentLevelIndex = LEVEL_ORDER.indexOf(level);
  let currentLevelRatio = 0;

  if (currentLevelIndex === 0) {
    currentLevelRatio = 0;
  } else {
    // Map level name to standard property key
    const levelKey = level === 'World Class'
      ? 'worldClass'
      : level.toLowerCase().replace(' ', '') as keyof typeof exerciseStandards;
    currentLevelRatio = exerciseStandards[levelKey] as number;
  }

  // Calculate progress to next level
  let percentage = 0;
  if (level === 'World Class') {
    percentage = 100;
  } else {
    percentage = ((ratio - currentLevelRatio) / (nextLevelRatio - currentLevelRatio)) * 100;
    percentage = Math.min(100, Math.max(0, percentage));
  }

  // Calculate percentile rank with granular interpolation
  const percentile = getPercentileFromLevel(level, ratio, currentLevelRatio, nextLevelRatio);

  const nextLevelWeight = nextLevelRatio * bodyweight;

  return {
    exercise: normalizedName,
    level,
    percentage,
    percentile,
    currentRatio: ratio,
    nextLevelRatio,
    nextLevelWeight,
  };
}

/**
 * Normalize exercise names to match standard categories
 */
function normalizeExerciseName(name: string): string {
  const lower = name.toLowerCase();

  // Squat variations
  if (lower.includes('squat') && !lower.includes('front')) {
    return 'Squat';
  }

  // Bench press variations
  if (lower.includes('bench') && lower.includes('press')) {
    return 'Bench Press';
  }

  // Deadlift variations
  if (lower.includes('deadlift')) {
    return 'Deadlift';
  }

  // Overhead press variations
  if (
    (lower.includes('overhead') && lower.includes('press')) ||
    (lower.includes('shoulder') && lower.includes('press')) ||
    lower.includes('ohp') ||
    (lower.includes('military') && lower.includes('press'))
  ) {
    return 'Overhead Press';
  }

  return name;
}

/**
 * Get color for strength level
 * Updated for better contrast with solid badge backgrounds
 */
export function getLevelColor(level: StrengthLevel): string {
  switch (level) {
    case 'Beginner':
      return 'text-gray-700 dark:text-gray-300';
    case 'Novice':
      return 'text-blue-700 dark:text-blue-300';
    case 'Intermediate':
      return 'text-green-700 dark:text-green-300';
    case 'Advanced':
      return 'text-yellow-700 dark:text-yellow-300';
    case 'Elite':
      return 'text-purple-700 dark:text-purple-300';
    case 'World Class':
      return 'text-orange-700 dark:text-orange-300';
    default:
      return 'text-gray-700 dark:text-gray-300';
  }
}

/**
 * Get background color for strength level badge
 * Light pastel colors with more saturation
 */
export function getLevelBadgeColor(level: StrengthLevel): string {
  switch (level) {
    case 'Beginner':
      return 'bg-gray-200 dark:bg-gray-700';
    case 'Novice':
      return 'bg-blue-200 dark:bg-blue-900';
    case 'Intermediate':
      return 'bg-green-200 dark:bg-green-900';
    case 'Advanced':
      return 'bg-yellow-200 dark:bg-yellow-900';
    case 'Elite':
      return 'bg-purple-200 dark:bg-purple-900';
    case 'World Class':
      return 'bg-orange-200 dark:bg-orange-900';
    default:
      return 'bg-gray-200 dark:bg-gray-700';
  }
}

/**
 * Get background color hex for strength level badge
 * Light pastel colors with more saturation for better visibility
 */
export function getLevelBadgeColorHex(level: StrengthLevel): string {
  switch (level) {
    case 'Beginner':
      return '#E5E7EB'; // Light gray (gray-200)
    case 'Novice':
      return '#BFDBFE'; // Light blue (blue-200)
    case 'Intermediate':
      return '#BBF7D0'; // Light green (green-200)
    case 'Advanced':
      return '#FEF08A'; // Light yellow (yellow-200)
    case 'Elite':
      return '#E9D5FF'; // Light purple (purple-200)
    case 'World Class':
      return '#FED7AA'; // Light orange (orange-200)
    default:
      return '#E5E7EB';
  }
}
