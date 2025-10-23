import type { Program, ProgramWeek, ScheduledWorkout } from '../types/workout';
import { v4 as uuidv4 } from 'uuid';
import { BUILTIN_STRENGTH_PROGRAM_TEMPLATES } from './builtin_strength_programs';
import { BUILTIN_HYPERTROPHY_PROGRAM_TEMPLATES } from './builtin_hypertrophy_programs';

/**
 * Pre-built program templates for common training splits
 * These provide a starting point for users to build their programs
 */

// Note: templateIds reference workout templates that the user needs to create
// In a real implementation, we'd either:
// 1. Create default workout templates for these
// 2. Let users select their own templates when activating a program

export function createPushPullLegsProgram(userId: string): Program {
  const weeks: ProgramWeek[] = [];

  // Create 4 weeks of PPL
  for (let week = 1; week <= 4; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1, // Monday
        templateId: 'builtin-push-a',
        templateName: 'Push Day A - Chest Focus',
      },
      {
        dayOfWeek: 3, // Wednesday
        templateId: 'builtin-pull-a',
        templateName: 'Pull Day A - Back Width',
      },
      {
        dayOfWeek: 5, // Friday
        templateId: 'builtin-leg-a',
        templateName: 'Leg Day A - Quad Focus',
      },
    ];

    weeks.push({
      weekNumber: week,
      workouts,
      name: week === 4 ? 'Deload Week' : undefined,
      notes: week === 4 ? 'Reduce weight by 20%, focus on form' : undefined,
    });
  }

  return {
    id: uuidv4(),
    userId,
    name: 'Push/Pull/Legs (3-Day)',
    description: 'Classic 3-day split focusing on pushing movements, pulling movements, and legs. Perfect for intermediate lifters looking to build strength and size.',
    duration: 4,
    daysPerWeek: 3,
    weeks,
    goal: 'hypertrophy',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createUpperLowerProgram(userId: string): Program {
  const weeks: ProgramWeek[] = [];

  // Create 6 weeks of Upper/Lower
  for (let week = 1; week <= 6; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1, // Monday
        templateId: 'builtin-upper-a',
        templateName: 'Upper Body A',
      },
      {
        dayOfWeek: 2, // Tuesday
        templateId: 'builtin-leg-a',
        templateName: 'Leg Day A - Quad Focus',
      },
      {
        dayOfWeek: 4, // Thursday
        templateId: 'builtin-upper-b',
        templateName: 'Upper Body B',
      },
      {
        dayOfWeek: 5, // Friday
        templateId: 'builtin-leg-b',
        templateName: 'Leg Day B - Hamstring/Glute Focus',
      },
    ];

    weeks.push({
      weekNumber: week,
      workouts,
      name: week === 4 ? 'Deload Week' : undefined,
      notes: week === 4 ? 'Reduce volume by 40%, maintain intensity' : undefined,
    });
  }

  return {
    id: uuidv4(),
    userId,
    name: 'Upper/Lower (4-Day)',
    description: 'Efficient 4-day split alternating between upper and lower body workouts. Great for balanced strength development and muscle growth.',
    duration: 6,
    daysPerWeek: 4,
    weeks,
    goal: 'strength',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createFullBodyProgram(userId: string): Program {
  const weeks: ProgramWeek[] = [];

  // Create 8 weeks of Full Body
  for (let week = 1; week <= 8; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1, // Monday
        templateId: 'builtin-full-body-a',
        templateName: 'Full Body A',
      },
      {
        dayOfWeek: 3, // Wednesday
        templateId: 'builtin-full-body-b',
        templateName: 'Full Body B',
      },
      {
        dayOfWeek: 5, // Friday
        templateId: 'builtin-full-body-c',
        templateName: 'Full Body C',
      },
    ];

    weeks.push({
      weekNumber: week,
      workouts,
      name: week % 4 === 0 ? 'Deload Week' : undefined,
      notes: week % 4 === 0 ? 'Light week - reduce weight by 20%' : undefined,
    });
  }

  return {
    id: uuidv4(),
    userId,
    name: 'Full Body (3-Day)',
    description: 'Train your entire body 3x per week with compound movements. Ideal for beginners or those with limited training time.',
    duration: 8,
    daysPerWeek: 3,
    weeks,
    goal: 'general',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function createPPL6DayProgram(userId: string): Program {
  const weeks: ProgramWeek[] = [];

  // Create 6 weeks of 6-day PPL
  for (let week = 1; week <= 6; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 0, // Sunday
        templateId: 'builtin-push-a',
        templateName: 'Push Day A - Chest Focus',
      },
      {
        dayOfWeek: 1, // Monday
        templateId: 'builtin-pull-a',
        templateName: 'Pull Day A - Back Width',
      },
      {
        dayOfWeek: 2, // Tuesday
        templateId: 'builtin-leg-a',
        templateName: 'Leg Day A - Quad Focus',
      },
      {
        dayOfWeek: 4, // Thursday
        templateId: 'builtin-push-b',
        templateName: 'Push Day B - Shoulder Focus',
      },
      {
        dayOfWeek: 5, // Friday
        templateId: 'builtin-pull-b',
        templateName: 'Pull Day B - Back Thickness',
      },
      {
        dayOfWeek: 6, // Saturday
        templateId: 'builtin-leg-b',
        templateName: 'Leg Day B - Hamstring/Glute Focus',
      },
    ];

    weeks.push({
      weekNumber: week,
      workouts,
      name: week === 4 ? 'Deload Week' : undefined,
      notes: week === 4 ? 'Reduce sets by 30%, maintain weight' : undefined,
    });
  }

  return {
    id: uuidv4(),
    userId,
    name: 'Push/Pull/Legs (6-Day)',
    description: 'High-frequency 6-day PPL split for advanced lifters. Hit each muscle group twice per week for maximum growth.',
    duration: 6,
    daysPerWeek: 6,
    weeks,
    goal: 'hypertrophy',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export const PROGRAM_TEMPLATES = [
  // Original programs
  { id: 'ppl-3day', name: 'Push/Pull/Legs (3-Day)', factory: createPushPullLegsProgram },
  { id: 'upper-lower', name: 'Upper/Lower (4-Day)', factory: createUpperLowerProgram },
  { id: 'full-body', name: 'Full Body (3-Day)', factory: createFullBodyProgram },
  { id: 'ppl-6day', name: 'Push/Pull/Legs (6-Day)', factory: createPPL6DayProgram },

  // Elite strength programs (5 programs)
  ...BUILTIN_STRENGTH_PROGRAM_TEMPLATES,

  // Elite hypertrophy programs (7 programs)
  ...BUILTIN_HYPERTROPHY_PROGRAM_TEMPLATES,
];
