/**
 * Strength standards calculator based on bodyweight ratios
 * Uses SymmetricStrength.com methodology
 */

export type StrengthLevel = 'Beginner' | 'Novice' | 'Intermediate' | 'Advanced' | 'Elite';
export type StandardType = 'general' | 'powerlifting';

export interface StrengthStandard {
  exercise: string;
  level: StrengthLevel;
  percentage: number; // Progress toward next level (0-100)
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
  },
  'Bench Press': {
    beginner: 0.45,
    novice: 0.75,
    intermediate: 1.10,
    advanced: 1.45,
    elite: 1.80,
  },
  'Deadlift': {
    beginner: 0.90,
    novice: 1.40,
    intermediate: 1.80,
    advanced: 2.25,
    elite: 2.70,
  },
  'Overhead Press': {
    beginner: 0.30,
    novice: 0.50,
    intermediate: 0.75,
    advanced: 1.00,
    elite: 1.30,
  },
};

const STANDARDS_GENERAL_FEMALE = {
  'Squat': {
    beginner: 0.45,
    novice: 0.75,
    intermediate: 1.05,
    advanced: 1.35,
    elite: 1.70,
  },
  'Bench Press': {
    beginner: 0.25,
    novice: 0.45,
    intermediate: 0.65,
    advanced: 0.90,
    elite: 1.15,
  },
  'Deadlift': {
    beginner: 0.55,
    novice: 0.90,
    intermediate: 1.25,
    advanced: 1.60,
    elite: 2.00,
  },
  'Overhead Press': {
    beginner: 0.20,
    novice: 0.35,
    intermediate: 0.50,
    advanced: 0.65,
    elite: 0.85,
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
  },
  'Bench Press': {
    beginner: 0.50,
    novice: 0.75,
    intermediate: 1.25,
    advanced: 1.75,
    elite: 2.25,
  },
  'Deadlift': {
    beginner: 1.00,
    novice: 1.50,
    intermediate: 2.00,
    advanced: 2.50,
    elite: 3.00,
  },
  'Overhead Press': {
    beginner: 0.35,
    novice: 0.55,
    intermediate: 0.85,
    advanced: 1.15,
    elite: 1.50,
  },
};

const STANDARDS_POWERLIFTING_FEMALE = {
  'Squat': {
    beginner: 0.50,
    novice: 0.85,
    intermediate: 1.25,
    advanced: 1.60,
    elite: 2.00,
  },
  'Bench Press': {
    beginner: 0.30,
    novice: 0.50,
    intermediate: 0.75,
    advanced: 1.10,
    elite: 1.50,
  },
  'Deadlift': {
    beginner: 0.65,
    novice: 1.00,
    intermediate: 1.40,
    advanced: 1.75,
    elite: 2.15,
  },
  'Overhead Press': {
    beginner: 0.20,
    novice: 0.35,
    intermediate: 0.55,
    advanced: 0.75,
    elite: 1.00,
  },
};

const LEVEL_ORDER: StrengthLevel[] = ['Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];

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

  // Determine current level
  let level: StrengthLevel = 'Beginner';
  let nextLevelRatio = exerciseStandards.novice;

  if (ratio >= exerciseStandards.elite) {
    level = 'Elite';
    nextLevelRatio = exerciseStandards.elite; // Already at max
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

  // Calculate progress to next level
  let percentage = 0;
  if (level === 'Elite') {
    percentage = 100;
  } else {
    const currentLevelIndex = LEVEL_ORDER.indexOf(level);
    const currentLevelRatio = currentLevelIndex === 0
      ? 0
      : exerciseStandards[level.toLowerCase() as keyof typeof exerciseStandards];

    percentage = ((ratio - currentLevelRatio) / (nextLevelRatio - currentLevelRatio)) * 100;
    percentage = Math.min(100, Math.max(0, percentage));
  }

  const nextLevelWeight = nextLevelRatio * bodyweight;

  return {
    exercise: normalizedName,
    level,
    percentage,
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
 */
export function getLevelColor(level: StrengthLevel): string {
  switch (level) {
    case 'Beginner':
      return 'text-gray-400';
    case 'Novice':
      return 'text-blue-400';
    case 'Intermediate':
      return 'text-green-400';
    case 'Advanced':
      return 'text-yellow-400';
    case 'Elite':
      return 'text-purple-400';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get background color for strength level badge
 */
export function getLevelBadgeColor(level: StrengthLevel): string {
  switch (level) {
    case 'Beginner':
      return 'bg-gray-500/20 border-gray-500';
    case 'Novice':
      return 'bg-blue-500/20 border-blue-500';
    case 'Intermediate':
      return 'bg-green-500/20 border-green-500';
    case 'Advanced':
      return 'bg-yellow-500/20 border-yellow-500';
    case 'Elite':
      return 'bg-purple-500/20 border-purple-500';
    default:
      return 'bg-gray-500/20 border-gray-500';
  }
}
