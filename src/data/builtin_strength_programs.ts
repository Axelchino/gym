import type { Program, ProgramWeek, ScheduledWorkout } from '../types/workout';
import { v4 as uuidv4 } from 'uuid';

// Helper to create workout template structure
function createTemplate(
  id: string,
  name: string,
  description: string,
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    rest?: number;
    warmup?: number;
    rir?: number;
    notes?: string;
  }>
) {
  return {
    id: `builtin-${id}`,
    name,
    description,
    exercises: exercises.map((ex, idx) => ({
      exerciseId: ex.name, // Will be matched by name
      orderIndex: idx,
      targetSets: ex.sets,
      targetReps: ex.reps,
      restSeconds: ex.rest || 90,
      targetRIR: ex.rir ?? 2,
      warmupSets: ex.warmup || 0,
      notes: ex.notes,
    })),
  };
}

// ============================================
// STRONGLIFTS 5x5 TEMPLATE
// StrongLifts 5x5 is a classic beginner strength program with 3 full-body workouts per week
// Two workouts (A & B) alternate each session Each workout consists of three compound lifts
// for 5 sets of 5 reps, except Deadlifts which are 1x5 Start light and add weight linearly
// every session (5 lb on upper body, 10 lb on lower) A deload week is scheduled every 4th
// week to reduce weight by ~10% for recovery.
// ============================================

// Workout A (StrongLifts 5x5)
export const STRONGLIFTS_A = createTemplate(
  'stronglifts-a',
  'StrongLifts Workout A',
  'Full-body A: Squat, Bench, Row - 5x5 strength workout',
  [
    { name: 'Barbell Squat', sets: 5, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: 'Barbell Bench Press', sets: 5, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: 'Barbell Row', sets: 5, reps: 5, rest: 180, warmup: 1, rir: 1 },
  ]
);

// Workout B (StrongLifts 5x5)
export const STRONGLIFTS_B = createTemplate(
  'stronglifts-b',
  'StrongLifts Workout B',
  'Full-body B: Squat, Overhead Press, Deadlift - 5x5 strength workout',
  [
    { name: 'Barbell Squat', sets: 5, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: 'Barbell Overhead Press', sets: 5, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: 'Deadlift', sets: 1, reps: 5, rest: 240, warmup: 3, rir: 1, notes: 'Only 1 working set' },
  ]
);

// Program Template
export function createStrongLifts5x5(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 12; week++) {
    // Alternate A and B each workout (A-B-A, then B-A-B)
    const isWeekA = week % 2 === 1;
    const workouts: ScheduledWorkout[] = [
      { dayOfWeek: 1, templateId: isWeekA ? 'builtin-stronglifts-a' : 'builtin-stronglifts-b', templateName: isWeekA ? 'StrongLifts Workout A' : 'StrongLifts Workout B' },  // Monday
      { dayOfWeek: 3, templateId: isWeekA ? 'builtin-stronglifts-b' : 'builtin-stronglifts-a', templateName: isWeekA ? 'StrongLifts Workout B' : 'StrongLifts Workout A' },  // Wednesday
      { dayOfWeek: 5, templateId: isWeekA ? 'builtin-stronglifts-a' : 'builtin-stronglifts-b', templateName: isWeekA ? 'StrongLifts Workout A' : 'StrongLifts Workout B' },  // Friday
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      name: (week === 4 || week === 8) ? 'Deload Week' : undefined,
      notes: (week === 4 || week === 8) ? 'Reduce working weight by 10% this week' : 'Add 5 lb to Squat/Deadlift, 2.5 lb to Bench/Press each session',
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: 'StrongLifts 5x5 (12-Week)',
    description: 'Beginner program featuring 5x5 Squat, Bench, Press, Row and 1x5 Deadlifts. Train 3x/week, adding weight each workout. Simple and effective for building strength.',
    duration: 12,
    daysPerWeek: 3,
    weeks,
    goal: 'strength',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// STARTING STRENGTH TEMPLATE
// Starting Strength (by Mark Rippetoe) is a renowned beginner program using 3 workouts
// per week. It alternates Workout A and Workout B on non-consecutive days. Each session
// has 3 core barbell exercises: Squat every workout (3x5), Bench Press and Overhead
// Press alternating (3x5), Deadlift (1x5) alternating with Power Cleans (5x3). Linear
// progression is key: add ~5 lb to upper body lifts and 10 lb to squats/deadlifts each
// workout as long as form allows. This builds a strength foundation on compound movements
// with proper technique emphasis
// ============================================

// Workout A (Starting Strength)
export const STARTING_STRENGTH_A = createTemplate(
  'starting-strength-a',
  'Starting Strength Workout A',
  'Squat, Bench, Deadlift - 3x5 basics for strength',
  [
    { name: 'Barbell Squat', sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: 'Barbell Bench Press', sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: 'Deadlift', sets: 1, reps: 5, rest: 240, warmup: 3, rir: 1, notes: 'Only 1 heavy set (high fatigue)' },
  ]
);

// Workout B (Starting Strength)
export const STARTING_STRENGTH_B = createTemplate(
  'starting-strength-b',
  'Starting Strength Workout B',
  'Squat, Overhead Press, Power Clean - 3x5 (PC 5x3) strength training',
  [
    { name: 'Barbell Squat', sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: 'Barbell Overhead Press', sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: 'Power Clean', sets: 5, reps: 3, rest: 150, warmup: 2, rir: 1 },
  ]
);

// Program Template
export function createStartingStrength(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 12; week++) {
    // Alternate A and B each session (A-B-A, then B-A-B)
    const isWeekA = week % 2 === 1;
    const workouts: ScheduledWorkout[] = [
      { dayOfWeek: 1, templateId: isWeekA ? 'builtin-starting-strength-a' : 'builtin-starting-strength-b', templateName: isWeekA ? 'Starting Strength Workout A' : 'Starting Strength Workout B' }, // Monday
      { dayOfWeek: 3, templateId: isWeekA ? 'builtin-starting-strength-b' : 'builtin-starting-strength-a', templateName: isWeekA ? 'Starting Strength Workout B' : 'Starting Strength Workout A' }, // Wednesday
      { dayOfWeek: 5, templateId: isWeekA ? 'builtin-starting-strength-a' : 'builtin-starting-strength-b', templateName: isWeekA ? 'Starting Strength Workout A' : 'Starting Strength Workout B' }, // Friday
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      name: week === 7 ? 'Deload Week' : undefined,
      notes: week === 7 ? 'Lighten load ~10% to consolidate gains' : 'Increase weight each workout (5lb upper, 10lb lower)',
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: 'Starting Strength (12-Week)',
    description: 'Beginner full-body program (Mark Rippetoe). 3 days/week of Squat 3x5 every session, alternating Bench Press and Overhead Press (3x5), Deadlift 1x5 alternating with Power Clean 5x3. Linear progression each workout.',
    duration: 12,
    daysPerWeek: 3,
    weeks,
    goal: 'strength',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// WENDLER 5/3/1 BBB TEMPLATE
// Wendler's 5/3/1 is a popular intermediate program focusing on four main lifts:
// Squat, Bench Press, Deadlift, and Overhead Press.
// It operates on a 4-week cycle:
// Week 1 uses 3x5,
// Week 2 uses 3x3,
// Week 3 uses 3x5/3/1, then
// Week 4 is a deload (light 3x5).
// The final set each week is taken for as many reps as possible (AMRAP) to drive progress.
// After each cycle, training weights increase
// (typically +10 lb for squat/deadlift, +5 lb for bench/press).
// The Boring But Big (BBB) template adds high-volume assistance:
// 5x10 back-off sets of the main lift and additional accessory work,
// to build muscle and reinforce the main lifts.
// This program schedules 4 workouts per week (one for each main lift).
// ============================================

// 5/3/1 Press Day (with BBB assistance)
export const W531_PRESS_DAY = createTemplate(
  '531-press-day',
  '5/3/1 Press Day (OHP)',
  'Overhead Press 5/3/1 + assistance (BBB and lat work)',
  [
    { name: 'Barbell Overhead Press', sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1, notes: '5/3/1 main sets (week-dependent reps, last set 1+ AMRAP)' },
    { name: 'Barbell Overhead Press', sets: 5, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'BBB assistance: ~50% 1RM for volume' },
    { name: 'Lat Pulldown', sets: 5, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'Lat assistance (5x10)' },
  ]
);

// 5/3/1 Deadlift Day (with BBB assistance)
export const W531_DEADLIFT_DAY = createTemplate(
  '531-deadlift-day',
  '5/3/1 Deadlift Day',
  'Deadlift 5/3/1 + assistance (BBB and core)',
  [
    { name: 'Deadlift', sets: 3, reps: 5, rest: 240, warmup: 2, rir: 1, notes: '5/3/1 main sets (last set AMRAP)' },
    { name: 'Deadlift', sets: 5, reps: 10, rest: 120, warmup: 0, rir: 2, notes: 'BBB assistance: 5x10 at ~50% training max' },
    { name: 'Hanging Leg Raise', sets: 3, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'Core assistance' },
  ]
);

// 5/3/1 Bench Day (with BBB assistance)
export const W531_BENCH_DAY = createTemplate(
  '531-bench-day',
  '5/3/1 Bench Day',
  'Bench Press 5/3/1 + assistance (BBB and lat work)',
  [
    { name: 'Barbell Bench Press', sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1, notes: '5/3/1 main sets (last set AMRAP)' },
    { name: 'Barbell Bench Press', sets: 5, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'BBB assistance: 5x10 volume' },
    { name: 'Pull-ups', sets: 5, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'Lat assistance (or Chin-ups) 5x10' },
  ]
);

// 5/3/1 Squat Day (with BBB assistance)
export const W531_SQUAT_DAY = createTemplate(
  '531-squat-day',
  '5/3/1 Squat Day',
  'Squat 5/3/1 + assistance (BBB and core)',
  [
    { name: 'Barbell Squat', sets: 3, reps: 5, rest: 240, warmup: 2, rir: 1, notes: '5/3/1 main sets (last set AMRAP)' },
    { name: 'Barbell Squat', sets: 5, reps: 10, rest: 120, warmup: 0, rir: 2, notes: 'BBB assistance: 5x10 at ~50% 1RM' },
    { name: 'Ab Wheel Rollout', sets: 3, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'Core assistance' },
  ]
);

export function createWendler531_BBB(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  const days = [
    { dayOfWeek: 1, templateId: 'builtin-531-press-day', templateName: '5/3/1 Press Day (OHP)' },
    { dayOfWeek: 2, templateId: 'builtin-531-deadlift-day', templateName: '5/3/1 Deadlift Day' },
    { dayOfWeek: 4, templateId: 'builtin-531-bench-day', templateName: '5/3/1 Bench Day' },
    { dayOfWeek: 6, templateId: 'builtin-531-squat-day', templateName: '5/3/1 Squat Day' },
  ];
  for (let week = 1; week <= 12; week++) {
    weeks.push({
      weekNumber: week,
      workouts: days,
      name: week % 4 === 0 ? 'Deload Week' : undefined,
      notes: week % 4 === 0
        ? 'Deload – reduce training max by 10% for this week'
        : `Cycle ${Math.ceil(week/4)} Week ${((week-1)%4)+1}: Follow 5/3/1 rep scheme (W${((week-1)%4)+1})`,
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: 'Wendler 5/3/1 BBB (12-Week)',
    description: 'Intermediate 4-day program by Jim Wendler. Uses a 5/3/1 rep scheme with an AMRAP top set each week and a deload every 4th week. Main lifts: Squat, Bench, Deadlift, OHP. Boring But Big assistance adds 5x10 back-off sets and accessory work for hypertrophy.',
    duration: 12,
    daysPerWeek: 4,
    weeks,
    goal: 'strength',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// NSUNS 5-DAY TEMPLATE
// nSuns 5/3/1 is a high-volume program inspired by 5/3/1, popular on Reddit for rapid strength and size gains.
// It runs 5 days per week, each day centered on a main compound lift with heavy AMRAP sets and lots of volume.
// The basic structure: a main "5/3/1" lift with 8-9 sets (including a top AMRAP set) and a secondary compound
// lift with 8 sets, followed by assistance work (3–4 sets each of 2–3 accessories targeting supporting muscle groups).
// The five-day split is:
// Day 1: Bench Press (heavy) & Overhead Press (volume)
// Day 2: Squat (heavy) & Sumo Deadlift (volume)
// Day 3: Overhead Press (heavy) & Incline Bench (volume)
// Day 4: Deadlift (heavy) & Front Squat (volume)
// Day 5: Bench Press (heavy) & Close-Grip Bench (volume)
// The main lift's last set is taken to failure (AMRAP) to adjust weekly weight jumps. Progression is linear: if you hit rep targets on the AMRAP, increase training max for next week (typically +5 lb upper, +5–10 lb lower). This program is intense and time-consuming due to high volume, and benefits from periodic deloads (e.g. every 4 weeks).
// ============================================

// Day 1: Bench (Heavy) & OHP (Volume)
export const NSUNS_5DAY_DAY1 = createTemplate(
  'nsuns-5day-day1',
  'nSuns 5-Day - Day 1 (Bench/OHP)',
  'Bench Press heavy (5/3/1) + OHP volume, plus back and biceps',
  [
    { name: 'Barbell Bench Press', sets: 9, reps: 5, rest: 180, warmup: 0, rir: 1, notes: 'Main Bench 5/3/1 sets (8 sets ramp + 1 AMRAP set)' },
    { name: 'Barbell Overhead Press', sets: 8, reps: 8, rest: 120, warmup: 0, rir: 2, notes: 'Secondary OHP volume sets' },
    { name: 'Barbell Row', sets: 3, reps: 8, rest: 120, warmup: 1, rir: 1, notes: 'Back accessory' },
    { name: 'Barbell Curl', sets: 3, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'Biceps accessory' },
  ]
);

// Day 2: Squat (Heavy) & Sumo Deadlift (Volume)
export const NSUNS_5DAY_DAY2 = createTemplate(
  'nsuns-5day-day2',
  'nSuns 5-Day - Day 2 (Squat/Sumo)',
  'Squat heavy (5/3/1) + Sumo Deadlift volume, plus hamstrings and abs',
  [
    { name: 'Barbell Squat', sets: 9, reps: 5, rest: 240, warmup: 0, rir: 1, notes: 'Main Squat 5/3/1 (last set AMRAP)' },
    { name: 'Sumo Deadlift', sets: 8, reps: 8, rest: 180, warmup: 0, rir: 1, notes: 'Secondary Deadlift volume sets' },
    { name: 'Leg Curl', sets: 3, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'Hamstring accessory' },
    { name: 'Hanging Leg Raise', sets: 3, reps: 12, rest: 60, warmup: 0, rir: 2, notes: 'Core/abs accessory' },
  ]
);

// Day 3: Overhead Press (Heavy) & Incline Bench (Volume)
export const NSUNS_5DAY_DAY3 = createTemplate(
  'nsuns-5day-day3',
  'nSuns 5-Day - Day 3 (OHP/Incline)',
  'Overhead Press heavy (5/3/1) + Incline Bench volume, plus shoulder accessories',
  [
    { name: 'Barbell Overhead Press', sets: 9, reps: 5, rest: 180, warmup: 0, rir: 1, notes: 'Main OHP 5/3/1 (last set AMRAP)' },
    { name: 'Incline Barbell Press', sets: 8, reps: 8, rest: 120, warmup: 0, rir: 1, notes: 'Secondary Incline Bench volume' },
    { name: 'Face Pulls', sets: 3, reps: 12, rest: 60, warmup: 0, rir: 2, notes: 'Rear delt/upper back accessory' },
    { name: 'Lateral Raise', sets: 3, reps: 12, rest: 60, warmup: 0, rir: 2, notes: 'Shoulder accessory' },
  ]
);

// Day 4: Deadlift (Heavy) & Front Squat (Volume)
export const NSUNS_5DAY_DAY4 = createTemplate(
  'nsuns-5day-day4',
  'nSuns 5-Day - Day 4 (Deadlift/Front Squat)',
  'Deadlift heavy (5/3/1) + Front Squat volume, plus back and abs',
  [
    { name: 'Deadlift', sets: 9, reps: 5, rest: 240, warmup: 0, rir: 1, notes: 'Main Deadlift 5/3/1 (last set AMRAP)' },
    { name: 'Barbell Front Squat', sets: 8, reps: 8, rest: 180, warmup: 0, rir: 1, notes: 'Secondary Front Squat volume' },
    { name: 'Lat Pulldown', sets: 3, reps: 10, rest: 90, warmup: 0, rir: 1, notes: 'Back accessory' },
    { name: 'Ab Wheel Rollout', sets: 3, reps: 10, rest: 60, warmup: 0, rir: 2, notes: 'Core accessory' },
  ]
);

// Day 5: Bench (Heavy) & Close-Grip Bench (Volume)
export const NSUNS_5DAY_DAY5 = createTemplate(
  'nsuns-5day-day5',
  'nSuns 5-Day - Day 5 (Bench/CGBP)',
  'Bench Press heavy (5/3/1) + Close-Grip Bench volume, plus arms',
  [
    { name: 'Barbell Bench Press', sets: 9, reps: 5, rest: 180, warmup: 0, rir: 1, notes: 'Main Bench 5/3/1 (last set AMRAP)' },
    { name: 'Close Grip Bench Press', sets: 8, reps: 8, rest: 120, warmup: 0, rir: 1, notes: 'Secondary close-grip bench volume' },
    { name: 'Barbell Curl', sets: 3, reps: 10, rest: 90, warmup: 0, rir: 2, notes: 'Biceps accessory' },
    { name: 'Tricep Rope Pushdown', sets: 3, reps: 12, rest: 60, warmup: 0, rir: 2, notes: 'Triceps accessory' },
  ]
);

export function createNSuns5DayLP(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 12; week++) {
    const workouts: ScheduledWorkout[] = [
      { dayOfWeek: 1, templateId: 'builtin-nsuns-5day-day1', templateName: 'nSuns 5-Day - Day 1 (Bench/OHP)' },
      { dayOfWeek: 2, templateId: 'builtin-nsuns-5day-day2', templateName: 'nSuns 5-Day - Day 2 (Squat/Sumo)' },
      { dayOfWeek: 3, templateId: 'builtin-nsuns-5day-day3', templateName: 'nSuns 5-Day - Day 3 (OHP/Incline)' },
      { dayOfWeek: 4, templateId: 'builtin-nsuns-5day-day4', templateName: 'nSuns 5-Day - Day 4 (Deadlift/Front Squat)' },
      { dayOfWeek: 5, templateId: 'builtin-nsuns-5day-day5', templateName: 'nSuns 5-Day - Day 5 (Bench/CGBP)' },
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      name: week % 4 === 0 ? 'Deload Week' : undefined,
      notes: week % 4 === 0
        ? 'Deload week – reduce intensity/volume for recovery'
        : 'Follow nSuns 5/3/1 progression with AMRAP sets to adjust weight',
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: 'nSuns 5/3/1 LP (5-Day)',
    description: 'High-volume 5-day program derived from 5/3/1. Each day focuses on one main lift (with a 5/3/1-style AMRAP top set) and a secondary compound lift, followed by accessory work. Linear progression is driven by AMRAP performance – a challenging program for rapid strength gains.',
    duration: 12,
    daysPerWeek: 5,
    weeks,
    goal: 'strength',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ============================================
// TEXAS METHOD TEMPLATE
// The Texas Method is a classic intermediate program (credited to Mark Rippetoe) featuring a weekly Volume–Recovery–Intensity structure. It is a 3-day full-body routine:
// Monday – Volume Day: High volume at ~90% of 5RM – typically Squat 5x5, Bench Press or Overhead Press 5x5, plus a pulling exercise. This creates the stimulus for strength gains.
// Wednesday – Light Day: Low volume, lighter load (~80%) for recovery – Squat 2x5 (light), the other upper-body lift 3x5 (light), and assistance like Chin-Ups or back extensions. This aids recovery while maintaining frequency.
// Friday – Intensity Day: Low volume, high intensity – work up to a new 5RM (or 3RM/1RM) on Squat and on whichever press was trained Monday, and a heavy Deadlift 1x5 PR. This realizes the strength gain from Monday's volume
// Bench Press and Overhead Press alternate each week as the primary lift on volume/intensity days. For example, one week do Bench 5x5 (Mon) and 5RM (Fri) with Press 3x5 light (Wed); the next week Press is 5x5/5RM and Bench
// is light mid-week. Progression is weekly – aim to increase Friday's 5RM by ~5 lb (upper) or 5–10 lb (lower) each week. If stalled, reduce Monday's volume or reset slightly. This program requires careful recovery (eat and
// rest well) but is very effective at driving weekly strength PRs
// ============================================

// Volume Day (Bench-focused week)
export const TEXAS_VOLUME_BENCH = createTemplate(
  'texas-volume-bench',
  'Texas Method - Volume (Bench focus)',
  'Volume Day: Squat 5x5, Bench 5x5, Row 3x8 at ~90% 5RM',
  [
    { name: 'Barbell Squat', sets: 5, reps: 5, rest: 240, warmup: 3, rir: 1 },
    { name: 'Barbell Bench Press', sets: 5, reps: 5, rest: 240, warmup: 2, rir: 1 },
    { name: 'Barbell Row', sets: 3, reps: 8, rest: 180, warmup: 1, rir: 1 },
  ]
);

// Volume Day (Press-focused week)
export const TEXAS_VOLUME_PRESS = createTemplate(
  'texas-volume-press',
  'Texas Method - Volume (Press focus)',
  'Volume Day: Squat 5x5, Overhead Press 5x5, Row 3x8',
  [
    { name: 'Barbell Squat', sets: 5, reps: 5, rest: 240, warmup: 3, rir: 1 },
    { name: 'Barbell Overhead Press', sets: 5, reps: 5, rest: 240, warmup: 2, rir: 1 },
    { name: 'Barbell Row', sets: 3, reps: 8, rest: 180, warmup: 1, rir: 1 },
  ]
);

// Light Day (Bench light, mid-week of press-focus week)
export const TEXAS_LIGHT_BENCH = createTemplate(
  'texas-light-bench',
  'Texas Method - Light (Bench light)',
  'Light Day: Squat 2x5 light, Bench 3x5 light, Chin-Ups 3xAMRAP',
  [
    { name: 'Barbell Squat', sets: 2, reps: 5, rest: 120, warmup: 0, rir: 2, notes: '~80% of Monday' },
    { name: 'Barbell Bench Press', sets: 3, reps: 5, rest: 120, warmup: 0, rir: 2, notes: '~85% of Monday' },
    { name: 'Pull-ups', sets: 3, reps: 8, rest: 90, warmup: 0, rir: 0, notes: 'Chin-Up/Pull-Up 3xAMRAP' },
  ]
);

// Light Day (Press light, mid-week of bench-focus week)
export const TEXAS_LIGHT_PRESS = createTemplate(
  'texas-light-press',
  'Texas Method - Light (Press light)',
  'Light Day: Squat 2x5 light, Overhead Press 3x5 light, Chin-Ups 3xAMRAP',
  [
    { name: 'Barbell Squat', sets: 2, reps: 5, rest: 120, warmup: 0, rir: 2 },
    { name: 'Barbell Overhead Press', sets: 3, reps: 5, rest: 120, warmup: 0, rir: 2 },
    { name: 'Pull-ups', sets: 3, reps: 8, rest: 90, warmup: 0, rir: 0, notes: 'Bodyweight Chin-Ups/Pull-Ups to failure' },
  ]
);

// Intensity Day (Bench-focused week)
export const TEXAS_INTENSITY_BENCH = createTemplate(
  'texas-intensity-bench',
  'Texas Method - Intensity (Bench focus)',
  'Intensity Day: Squat 1x5 PR, Bench 1x5 PR, Deadlift 1x5 PR',
  [
    { name: 'Barbell Squat', sets: 1, reps: 5, rest: 300, warmup: 4, rir: 0, notes: 'Work up to new 5RM' },
    { name: 'Barbell Bench Press', sets: 1, reps: 5, rest: 240, warmup: 3, rir: 0, notes: 'Work up to new 5RM' },
    { name: 'Deadlift', sets: 1, reps: 5, rest: 300, warmup: 3, rir: 0, notes: 'All-out set (new 5RM)' },
  ]
);

// Intensity Day (Press-focused week)
export const TEXAS_INTENSITY_PRESS = createTemplate(
  'texas-intensity-press',
  'Texas Method - Intensity (Press focus)',
  'Intensity Day: Squat 1x5 PR, Overhead Press 1x5 PR, Deadlift 1x5 PR',
  [
    { name: 'Barbell Squat', sets: 1, reps: 5, rest: 300, warmup: 4, rir: 0 },
    { name: 'Barbell Overhead Press', sets: 1, reps: 5, rest: 240, warmup: 3, rir: 0, notes: 'Work up to new 5RM' },
    { name: 'Deadlift', sets: 1, reps: 5, rest: 300, warmup: 3, rir: 0 },
  ]
);

export function createTexasMethod(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 12; week++) {
    const isBenchWeek = week % 2 === 0;  // even weeks: Bench-focused, odd: Press-focused
    const workouts: ScheduledWorkout[] = [
      { dayOfWeek: 1, templateId: isBenchWeek ? 'builtin-texas-volume-bench' : 'builtin-texas-volume-press', templateName: isBenchWeek ? 'Texas Method - Volume (Bench focus)' : 'Texas Method - Volume (Press focus)' },
      { dayOfWeek: 3, templateId: isBenchWeek ? 'builtin-texas-light-press' : 'builtin-texas-light-bench', templateName: isBenchWeek ? 'Texas Method - Light (Press light)' : 'Texas Method - Light (Bench light)' },
      { dayOfWeek: 5, templateId: isBenchWeek ? 'builtin-texas-intensity-bench' : 'builtin-texas-intensity-press', templateName: isBenchWeek ? 'Texas Method - Intensity (Bench focus)' : 'Texas Method - Intensity (Press focus)' },
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      name: week % 4 === 0 ? 'Deload/Reset Week' : undefined,
      notes: week % 4 === 0
        ? 'Lighten Monday volume or reduce intensity this week if needed (planned deload)'
        : 'Aim to set new 5RM PRs on Friday\'s lifts',
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: 'Texas Method (12-Week)',
    description: 'Intermediate 3-day program (Volume/Light/Intensity). Monday: Squat 5x5, alternate Bench/Press 5x5, plus rows. Wednesday: Light Squat and light press (the opposite lift), plus chin-ups. Friday: Squat 1x5, alternate Bench/Press 1x5 (new 5RM), and Deadlift 1x5. Progression is weekly, adding weight to Friday\'s PR sets.',
    duration: 12,
    daysPerWeek: 3,
    weeks,
    goal: 'strength',
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Export all workout templates
export const BUILTIN_STRENGTH_WORKOUT_TEMPLATES = [
  STRONGLIFTS_A,
  STRONGLIFTS_B,
  STARTING_STRENGTH_A,
  STARTING_STRENGTH_B,
  W531_PRESS_DAY,
  W531_DEADLIFT_DAY,
  W531_BENCH_DAY,
  W531_SQUAT_DAY,
  NSUNS_5DAY_DAY1,
  NSUNS_5DAY_DAY2,
  NSUNS_5DAY_DAY3,
  NSUNS_5DAY_DAY4,
  NSUNS_5DAY_DAY5,
  TEXAS_VOLUME_BENCH,
  TEXAS_VOLUME_PRESS,
  TEXAS_LIGHT_BENCH,
  TEXAS_LIGHT_PRESS,
  TEXAS_INTENSITY_BENCH,
  TEXAS_INTENSITY_PRESS,
];

// Export all program templates
export const BUILTIN_STRENGTH_PROGRAM_TEMPLATES = [
  { id: 'stronglifts-5x5', name: 'StrongLifts 5x5 (12-Week)', factory: createStrongLifts5x5 },
  { id: 'starting-strength', name: 'Starting Strength (12-Week)', factory: createStartingStrength },
  { id: 'wendler-531-bbb', name: 'Wendler 5/3/1 BBB (12-Week)', factory: createWendler531_BBB },
  { id: 'nsuns-5day', name: 'nSuns 5/3/1 LP (5-Day)', factory: createNSuns5DayLP },
  { id: 'texas-method', name: 'Texas Method (12-Week)', factory: createTexasMethod },
];
