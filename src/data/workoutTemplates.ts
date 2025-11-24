import type { WorkoutTemplate } from '../types/workout';
import { BUILTIN_STRENGTH_WORKOUT_TEMPLATES } from './builtin_strength_programs';
import { BUILTIN_HYPERTROPHY_WORKOUT_TEMPLATES } from './builtin_hypertrophy_programs';

/**
 * Built-in workout templates that users can use as-is or copy/modify
 * These are read-only until user modifies them (then we create a copy)
 */

// Helper to create template structure
function createTemplate(
  id: string,
  name: string,
  description: string,
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    rest?: number;
    rir?: number;
    warmup?: number;
    notes?: string;
  }>
): Omit<WorkoutTemplate, 'userId' | 'createdAt' | 'updatedAt'> {
  return {
    id: `builtin-${id}`,
    name,
    description,
    exercises: exercises.map((ex, idx) => ({
      exerciseId: ex.name, // Will be matched by name when used
      orderIndex: idx,
      targetSets: ex.sets,
      targetReps: ex.reps,
      restSeconds: ex.rest || 90,
      targetRIR: ex.rir || 2,
      warmupSets: ex.warmup || 0,
      notes: ex.notes,
    })),
    isActive: false,
  };
}

// PUSH TEMPLATES
export const PUSH_DAY_A = createTemplate(
  'push-a',
  'Push Day A - Chest Focus',
  'Horizontal pushing emphasis with chest and tricep work',
  [
    { name: 'Barbell Bench Press', sets: 4, reps: 8, rest: 180, warmup: 2, rir: 1 },
    { name: 'Incline Dumbbell Press', sets: 4, reps: 10, rest: 120, rir: 2 },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Dips', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Lateral Raise', sets: 3, reps: 15, rest: 60, rir: 2 },
    { name: 'Tricep Rope Pushdown', sets: 3, reps: 12, rest: 60, rir: 2 },
  ]
);

export const PUSH_DAY_B = createTemplate(
  'push-b',
  'Push Day B - Shoulder Focus',
  'Vertical pushing emphasis with shoulder and chest work',
  [
    { name: 'Barbell Overhead Press', sets: 4, reps: 6, rest: 180, warmup: 2, rir: 1 },
    { name: 'Incline Barbell Press', sets: 4, reps: 8, rest: 120, rir: 2 },
    { name: 'Dumbbell Flyes', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Cable Lateral Raise', sets: 4, reps: 15, rest: 60, rir: 2 },
    { name: 'Overhead Tricep Extension', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Tricep Dips', sets: 3, reps: 15, rest: 60, rir: 2 },
  ]
);

// PULL TEMPLATES
export const PULL_DAY_A = createTemplate(
  'pull-a',
  'Pull Day A - Back Width',
  'Vertical pulling for back width and bicep work',
  [
    { name: 'Pull-ups', sets: 4, reps: 10, rest: 120, warmup: 1, rir: 2 },
    { name: 'Barbell Row', sets: 4, reps: 8, rest: 120, rir: 2 },
    { name: 'Lat Pulldown', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Face Pulls', sets: 3, reps: 15, rest: 60, rir: 2 },
    { name: 'Barbell Curl', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Hammer Curl', sets: 3, reps: 12, rest: 60, rir: 2 },
  ]
);

export const PULL_DAY_B = createTemplate(
  'pull-b',
  'Pull Day B - Back Thickness',
  'Horizontal pulling for back thickness and bicep work',
  [
    { name: 'Deadlift', sets: 4, reps: 6, rest: 240, warmup: 3, rir: 2 },
    { name: 'Seated Cable Row', sets: 4, reps: 10, rest: 90, rir: 2 },
    { name: 'Single-Arm Dumbbell Row', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Reverse Flyes', sets: 3, reps: 15, rest: 60, rir: 2 },
    { name: 'Preacher Curl', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Cable Curl', sets: 3, reps: 15, rest: 60, rir: 2 },
  ]
);

// LEG TEMPLATES
export const LEG_DAY_A = createTemplate(
  'leg-a',
  'Leg Day A - Quad Focus',
  'Quad-dominant lower body work',
  [
    { name: 'Barbell Squat', sets: 4, reps: 8, rest: 240, warmup: 3, rir: 2 },
    { name: 'Leg Press', sets: 4, reps: 12, rest: 120, rir: 2 },
    { name: 'Bulgarian Split Squat', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Leg Extension', sets: 3, reps: 15, rest: 60, rir: 2 },
    { name: 'Romanian Deadlift', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Calf Raise', sets: 4, reps: 15, rest: 60, rir: 2 },
  ]
);

export const LEG_DAY_B = createTemplate(
  'leg-b',
  'Leg Day B - Hamstring/Glute Focus',
  'Posterior chain emphasis',
  [
    { name: 'Romanian Deadlift', sets: 4, reps: 8, rest: 180, warmup: 2, rir: 2 },
    { name: 'Hip Thrust', sets: 4, reps: 12, rest: 120, rir: 2 },
    { name: 'Walking Lunge', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Leg Curl', sets: 4, reps: 12, rest: 90, rir: 2 },
    { name: 'Goblet Squat', sets: 3, reps: 15, rest: 90, rir: 2 },
    { name: 'Seated Calf Raise', sets: 4, reps: 20, rest: 60, rir: 2 },
  ]
);

// UPPER BODY TEMPLATES
export const UPPER_BODY_A = createTemplate(
  'upper-a',
  'Upper Body A',
  'Horizontal push/pull emphasis',
  [
    { name: 'Barbell Bench Press', sets: 4, reps: 8, rest: 180, warmup: 2, rir: 1 },
    { name: 'Barbell Row', sets: 4, reps: 8, rest: 120, rir: 2 },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Pull-ups', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Dips', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Barbell Curl', sets: 3, reps: 10, rest: 60, rir: 2 },
  ]
);

export const UPPER_BODY_B = createTemplate(
  'upper-b',
  'Upper Body B',
  'Vertical push/pull emphasis',
  [
    { name: 'Barbell Overhead Press', sets: 4, reps: 6, rest: 180, warmup: 2, rir: 1 },
    { name: 'Lat Pulldown', sets: 4, reps: 10, rest: 90, rir: 2 },
    { name: 'Incline Dumbbell Press', sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: 'Seated Cable Row', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Lateral Raise', sets: 4, reps: 15, rest: 60, rir: 2 },
    { name: 'Face Pulls', sets: 3, reps: 15, rest: 60, rir: 2 },
  ]
);

// FULL BODY TEMPLATES
export const FULL_BODY_A = createTemplate(
  'full-body-a',
  'Full Body A',
  'Complete full body workout - squat focus',
  [
    { name: 'Barbell Squat', sets: 4, reps: 8, rest: 240, warmup: 3, rir: 2 },
    { name: 'Barbell Bench Press', sets: 3, reps: 8, rest: 180, warmup: 2, rir: 2 },
    { name: 'Barbell Row', sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Leg Curl', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Plank', sets: 3, reps: 60, rest: 60, notes: '60 seconds hold' },
  ]
);

export const FULL_BODY_B = createTemplate(
  'full-body-b',
  'Full Body B',
  'Complete full body workout - deadlift focus',
  [
    { name: 'Deadlift', sets: 4, reps: 6, rest: 240, warmup: 3, rir: 2 },
    { name: 'Barbell Overhead Press', sets: 3, reps: 8, rest: 180, warmup: 2, rir: 2 },
    { name: 'Pull-ups', sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: 'Bulgarian Split Squat', sets: 3, reps: 10, rest: 90, rir: 2 },
    { name: 'Dips', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Crunches', sets: 3, reps: 20, rest: 60, rir: 2 },
  ]
);

export const FULL_BODY_C = createTemplate(
  'full-body-c',
  'Full Body C',
  'Complete full body workout - balanced',
  [
    { name: 'Leg Press', sets: 4, reps: 12, rest: 120, rir: 2 },
    { name: 'Incline Dumbbell Press', sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: 'Lat Pulldown', sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: 'Romanian Deadlift', sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: 'Lateral Raise', sets: 3, reps: 15, rest: 60, rir: 2 },
    { name: 'Cable Curl', sets: 3, reps: 12, rest: 60, rir: 2 },
  ]
);

// ACTIVE RECOVERY TEMPLATES
export const ACTIVE_RECOVERY_WALK = createTemplate(
  'active-recovery-walk',
  'Active Recovery - Walking',
  'Light cardio for recovery and step count',
  [
    { name: 'Walking', sets: 1, reps: 10000, rest: 0, notes: '10,000 steps or 45-60 min walk' },
  ]
);

export const YOGA_STRETCHING = createTemplate(
  'yoga',
  'Yoga & Stretching',
  'Flexibility and mobility work',
  [
    { name: 'Yoga Flow', sets: 1, reps: 30, rest: 0, notes: '30-45 minute yoga session' },
    { name: 'Hamstring Stretch', sets: 3, reps: 30, rest: 30, notes: '30 second hold each side' },
    { name: 'Hip Flexor Stretch', sets: 3, reps: 30, rest: 30, notes: '30 second hold each side' },
  ]
);

export const LIGHT_CARDIO = createTemplate(
  'light-cardio',
  'Light Cardio',
  'Low-intensity cardio for active recovery',
  [
    { name: 'Cycling', sets: 1, reps: 30, rest: 0, notes: '30 minutes easy pace' },
    { name: 'Elliptical', sets: 1, reps: 20, rest: 0, notes: '20 minutes low resistance' },
  ]
);

// Export all built-in templates
export const BUILTIN_WORKOUT_TEMPLATES = [
  // Push/Pull/Legs
  PUSH_DAY_A,
  PUSH_DAY_B,
  PULL_DAY_A,
  PULL_DAY_B,
  LEG_DAY_A,
  LEG_DAY_B,

  // Upper/Lower
  UPPER_BODY_A,
  UPPER_BODY_B,

  // Full Body
  FULL_BODY_A,
  FULL_BODY_B,
  FULL_BODY_C,

  // Recovery
  ACTIVE_RECOVERY_WALK,
  YOGA_STRETCHING,
  LIGHT_CARDIO,

  // Elite Strength Programs (19 templates)
  ...BUILTIN_STRENGTH_WORKOUT_TEMPLATES,

  // Elite Hypertrophy Programs (25 templates)
  ...BUILTIN_HYPERTROPHY_WORKOUT_TEMPLATES,
];

export function isBuiltinTemplate(templateId: string): boolean {
  return templateId.startsWith('builtin-');
}
