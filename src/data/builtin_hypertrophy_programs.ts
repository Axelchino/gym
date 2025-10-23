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

/// Reddit PPL (Metallicadpa) – 6-Day Push/Pull/Legs (Beginner)
export const PPL_PUSH = createTemplate(
  "ppl-push",
  "Reddit PPL – Push Day",
  "Push day (chest/shoulders/triceps) focusing on bench press and overhead press",
  [
    {
      name: "Barbell Bench Press",
      sets: 4,
      reps: 5,
      rest: 180,
      warmup: 2,
      rir: 1,
      notes: "Last set 5+ reps (AMRAP)",
    },
    {
      name: "Barbell Overhead Press",
      sets: 3,
      reps: 8,
      rest: 150,
      warmup: 1,
      rir: 1,
      notes: "Alternate with bench press as main lift each session",
    },
    { name: "Incline Dumbbell Press", sets: 3, reps: 10, rest: 120, rir: 2 },
    {
      name: "Tricep Rope Pushdown",
      sets: 3,
      reps: 12,
      rest: 90,
      rir: 2,
      notes: "Superset with Lateral Raise",
    },
    {
      name: "Lateral Raise",
      sets: 3,
      reps: 15,
      rest: 90,
      rir: 2,
      notes: "Superset with Tricep Pushdown (no rest between exercises)",
    },
    {
      name: "Overhead Tricep Extension",
      sets: 3,
      reps: 12,
      rest: 90,
      rir: 2,
      notes: "Superset with Lateral Raise (second superset)",
    },
  ]
);
export const PPL_PULL_A = createTemplate(
  "ppl-pull-a",
  "Reddit PPL – Pull Day A (Deadlift Focus)",
  "Pull day focusing on deadlifts (back, biceps)",
  [
    {
      name: "Barbell Deadlift",
      sets: 1,
      reps: 5,
      rest: 180,
      warmup: 3,
      rir: 1,
      notes: "Heavy set 1x5+ (AMRAP)",
    },
    { name: "Lat Pulldown", sets: 3, reps: 10, rest: 120, warmup: 1, rir: 2 },
    { name: "Seated Cable Row", sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: "Face Pulls", sets: 3, reps: 15, rest: 90, rir: 2 },
    { name: "Barbell Curl", sets: 4, reps: 10, rest: 90, rir: 1 },
    { name: "Hammer Curl", sets: 4, reps: 10, rest: 90, rir: 1 },
  ]
);
export const PPL_PULL_B = createTemplate(
  "ppl-pull-b",
  "Reddit PPL – Pull Day B (Row Focus)",
  "Pull day focusing on barbell rows (back, biceps)",
  [
    {
      name: "Barbell Row",
      sets: 4,
      reps: 5,
      rest: 150,
      warmup: 2,
      rir: 1,
      notes: "Last set 5+ reps (AMRAP)",
    },
    {
      name: "Pull-ups",
      sets: 3,
      reps: 8,
      rest: 120,
      rir: 1,
      notes: "Can substitute chin-ups or assist if needed",
    },
    { name: "Seated Cable Row", sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: "Face Pulls", sets: 3, reps: 15, rest: 90, rir: 2 },
    { name: "Barbell Curl", sets: 4, reps: 10, rest: 90, rir: 1 },
    { name: "Hammer Curl", sets: 4, reps: 10, rest: 90, rir: 1 },
  ]
);
export const PPL_LEGS = createTemplate(
  "ppl-legs",
  "Reddit PPL – Legs Day",
  "Leg day (quads, hamstrings, calves) focusing on squats",
  [
    {
      name: "Barbell Squat",
      sets: 3,
      reps: 5,
      rest: 180,
      warmup: 2,
      rir: 1,
      notes: "Last set 5+ reps (AMRAP)",
    },
    {
      name: "Romanian Deadlift",
      sets: 3,
      reps: 10,
      rest: 150,
      warmup: 1,
      rir: 1,
    },
    { name: "Leg Press", sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: "Leg Curl", sets: 3, reps: 12, rest: 120, rir: 2 },
    { name: "Calf Raise", sets: 5, reps: 12, rest: 90, rir: 2 },
  ]
);
export function createRedditPPL(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  // 8-12 weeks recommended; repeat PPL split each week
  for (let week = 1; week <= 12; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1,
        templateId: "builtin-ppl-push",
        templateName: "Reddit PPL – Push Day",
      },
      {
        dayOfWeek: 2,
        templateId: "builtin-ppl-pull-b",
        templateName: "Reddit PPL – Pull Day B (Row Focus)",
      },
      {
        dayOfWeek: 3,
        templateId: "builtin-ppl-legs",
        templateName: "Reddit PPL – Legs Day",
      },
      {
        dayOfWeek: 4,
        templateId: "builtin-ppl-push",
        templateName: "Reddit PPL – Push Day",
      },
      {
        dayOfWeek: 5,
        templateId: "builtin-ppl-pull-a",
        templateName: "Reddit PPL – Pull Day A (Deadlift Focus)",
      },
      {
        dayOfWeek: 6,
        templateId: "builtin-ppl-legs",
        templateName: "Reddit PPL – Legs Day",
      },
      // Day 7 (Sunday) is rest
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      // No fixed deload in this novice program – deload when plateauing
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: "Reddit PPL 6-Day (Metallicadpa Beginner Program)",
    description:
      "6-day Push/Pull/Legs routine with linear progression and AMRAP top sets for beginners.",
    duration: 12,
    daysPerWeek: 6,
    weeks,
    goal: "hypertrophy",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/// PHAT – Power Hypertrophy Adaptive Training (Layne Norton) – 5-Day Hybrid (Intermediate)
export const PHAT_UPPER_POWER = createTemplate(
  "phat-upper-power",
  "PHAT – Upper Body Power",
  "Upper body strength day (heavy 3–5 rep compounds for chest, back, shoulders)",
  [
    { name: "Barbell Row", sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1 },
    {
      name: "Pull-ups",
      sets: 2,
      reps: 6,
      rest: 150,
      warmup: 0,
      rir: 1,
      notes: "Weighted if possible",
    },
    {
      name: "Pull-ups",
      sets: 2,
      reps: 8,
      rest: 150,
      rir: 1,
      notes: "If available, or Inverted Row 2x8",
    },
    {
      name: "Dumbbell Bench Press",
      sets: 3,
      reps: 5,
      rest: 180,
      warmup: 2,
      rir: 1,
    },
    {
      name: "Dips",
      sets: 2,
      reps: 8,
      rest: 150,
      rir: 1,
      notes: "Weighted if possible",
    },
    { name: "Dumbbell Shoulder Press", sets: 3, reps: 8, rest: 150, rir: 1 },
    { name: "Barbell Curl", sets: 3, reps: 8, rest: 120, rir: 1 },
    { name: "Dumbbell Skull Crusher", sets: 3, reps: 8, rest: 120, rir: 1 },
  ]
);
export const PHAT_LOWER_POWER = createTemplate(
  "phat-lower-power",
  "PHAT – Lower Body Power",
  "Lower body strength day (heavy 3–5 rep compounds for quads and hamstrings)",
  [
    { name: "Barbell Squat", sets: 3, reps: 5, rest: 180, warmup: 3, rir: 1 },
    { name: "Hack Squats Machine", sets: 2, reps: 8, rest: 150, rir: 1 },
    { name: "Leg Extension", sets: 2, reps: 10, rest: 120, rir: 1 },
    {
      name: "Stiff Leg Deadlift",
      sets: 3,
      reps: 5,
      rest: 180,
      warmup: 1,
      rir: 1,
    },
    { name: "Leg Curl", sets: 2, reps: 8, rest: 120, rir: 1 },
    {
      name: "Calf Raise",
      sets: 3,
      reps: 8,
      rest: 90,
      rir: 1,
    },
    { name: "Seated Calf Raise", sets: 2, reps: 8, rest: 90, rir: 1 },
  ]
);
export const PHAT_BACK_HYP = createTemplate(
  "phat-back-hyp",
  "PHAT – Back & Shoulders Hypertrophy",
  "Back and shoulder hypertrophy day (moderate weight, 8–20 reps, high volume)",
  [
    {
      name: "Barbell Row",
      sets: 4,
      reps: 8,
      rest: 120,
      warmup: 1,
      rir: 2,
      notes: "Use ~85% of power day weight",
    },
    {
      name: "Pull-ups",
      sets: 3,
      reps: 10,
      rest: 120,
      rir: 2,
      notes: "Or Inverted Row 3x10",
    },
    { name: "Seated Cable Row", sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: "Dumbbell Shrug", sets: 2, reps: 15, rest: 90, rir: 2 },
    { name: "Lat Pulldown (Close Grip)", sets: 2, reps: 20, rest: 90, rir: 2 },
    { name: "Dumbbell Shoulder Press", sets: 3, reps: 12, rest: 120, rir: 2 },
    { name: "Barbell Upright Row", sets: 2, reps: 15, rest: 90, rir: 2 },
    { name: "Lateral Raise", sets: 3, reps: 15, rest: 60, rir: 2 },
  ]
);
export const PHAT_LOWER_HYP = createTemplate(
  "phat-lower-hyp",
  "PHAT – Lower Body Hypertrophy",
  "Leg hypertrophy day (moderate weight, higher reps for quads, hamstrings, calves)",
  [
    {
      name: "Barbell Squat",
      sets: 4,
      reps: 10,
      rest: 150,
      warmup: 2,
      rir: 2,
      notes: "Use ~85% of power-day weight",
    },
    { name: "Leg Press", sets: 3, reps: 12, rest: 120, rir: 2 },
    { name: "Leg Extension", sets: 2, reps: 15, rest: 90, rir: 2 },
    { name: "Romanian Deadlift", sets: 3, reps: 10, rest: 150, rir: 2 },
    { name: "Leg Curl", sets: 2, reps: 12, rest: 90, rir: 2 },
    {
      name: "Donkey Calf Raise",
      sets: 4,
      reps: 12,
      rest: 90,
      rir: 2,
      notes: "Or Standing Calf Raise",
    },
    { name: "Seated Calf Raise", sets: 3, reps: 20, rest: 60, rir: 2 },
  ]
);
export const PHAT_CHEST_HYP = createTemplate(
  "phat-chest-hyp",
  "PHAT – Chest & Arms Hypertrophy",
  "Chest and arms hypertrophy day (moderate weight, high volume for chest, biceps, triceps)",
  [
    {
      name: "Dumbbell Bench Press",
      sets: 4,
      reps: 10,
      rest: 120,
      warmup: 1,
      rir: 2,
    },
    {
      name: "Incline Dumbbell Bench Press",
      sets: 3,
      reps: 12,
      rest: 120,
      rir: 2,
    },
    { name: "Cable Crossover", sets: 2, reps: 15, rest: 90, rir: 2 },
    {
      name: "Barbell Curl",
      sets: 3,
      reps: 10,
      rest: 90,
      rir: 2,
      notes: "EZ-bar biceps curl",
    },
    { name: "Concentration Curl", sets: 2, reps: 15, rest: 60, rir: 2 },
    { name: "Dumbbell Curl", sets: 2, reps: 20, rest: 60, rir: 2 },
    {
      name: "Single-Arm Tricep Extension (Dumbbell)",
      sets: 3,
      reps: 10,
      rest: 90,
      rir: 2,
    },
    { name: "Tricep Pushdown", sets: 2, reps: 15, rest: 60, rir: 2 },
    { name: "Cable Tricep Kickback", sets: 2, reps: 20, rest: 60, rir: 2 },
  ]
);
export function createPHAT(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 8; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1,
        templateId: "builtin-phat-upper-power",
        templateName: "PHAT – Upper Body Power",
      },
      {
        dayOfWeek: 2,
        templateId: "builtin-phat-lower-power",
        templateName: "PHAT – Lower Body Power",
      },
      {
        dayOfWeek: 4,
        templateId: "builtin-phat-back-hyp",
        templateName: "PHAT – Back & Shoulders Hypertrophy",
      },
      {
        dayOfWeek: 5,
        templateId: "builtin-phat-lower-hyp",
        templateName: "PHAT – Lower Body Hypertrophy",
      },
      {
        dayOfWeek: 6,
        templateId: "builtin-phat-chest-hyp",
        templateName: "PHAT – Chest & Arms Hypertrophy",
      },
      // Day 0 (Sunday) rest
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      name: week % 6 === 0 ? "Deload Week" : undefined,
      notes:
        week % 6 === 0
          ? "Deload this week: reduce volume ~40% or weight ~15%"
          : undefined,
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: "PHAT (Power Hypertrophy Adaptive Training) – 8-Week",
    description:
      "Layne Norton’s PHAT program combining powerlifting and bodybuilding: 8 weeks, 5 training days/week (upper/lower power days + hypertrophy days).",
    duration: 8,
    daysPerWeek: 5,
    weeks,
    goal: "hypertrophy",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/// PHUL – Power Hypertrophy Upper Lower (Brandon Campbell) – 4-Day Split (Intermediate)
export const PHUL_UPPER_POWER = createTemplate(
  "phul-upper-power",
  "PHUL – Upper Power Day",
  "Upper body strength focus (heavy bench and row)",
  [
    {
      name: "Barbell Bench Press",
      sets: 3,
      reps: 5,
      rest: 180,
      warmup: 2,
      rir: 1,
    },
    {
      name: "Incline Dumbbell Bench Press",
      sets: 3,
      reps: 8,
      rest: 150,
      warmup: 1,
      rir: 1,
    },
    { name: "Barbell Row", sets: 3, reps: 5, rest: 180, warmup: 1, rir: 1 },
    { name: "Lat Pulldown", sets: 3, reps: 8, rest: 150, rir: 1 },
    { name: "Barbell Overhead Press", sets: 2, reps: 8, rest: 150, rir: 1 },
    { name: "Barbell Curl", sets: 2, reps: 10, rest: 90, rir: 1 },
    { name: "Dumbbell Skull Crusher", sets: 2, reps: 10, rest: 90, rir: 1 },
  ]
);
export const PHUL_LOWER_POWER = createTemplate(
  "phul-lower-power",
  "PHUL – Lower Power Day",
  "Lower body strength focus (heavy squat and deadlift)",
  [
    { name: "Barbell Squat", sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: "Deadlift", sets: 3, reps: 5, rest: 180, warmup: 2, rir: 1 },
    { name: "Leg Press", sets: 3, reps: 12, rest: 150, rir: 2 },
    { name: "Leg Curl", sets: 3, reps: 8, rest: 120, rir: 1 },
    {
      name: "Calf Raise",
      sets: 4,
      reps: 10,
      rest: 90,
      rir: 1,
    },
  ]
);
export const PHUL_UPPER_HYP = createTemplate(
  "phul-upper-hyp",
  "PHUL – Upper Hypertrophy Day",
  "Upper body hypertrophy focus (higher volume chest/back/shoulders/arms)",
  [
    {
      name: "Incline Barbell Bench Press",
      sets: 3,
      reps: 10,
      rest: 120,
      rir: 2,
    },
    { name: "Dumbbell Fly", sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: "Seated Cable Row", sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: "Dumbbell Row", sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: "Lateral Raise", sets: 3, reps: 12, rest: 90, rir: 2 },
    {
      name: "Seated Incline Dumbbell Curl",
      sets: 3,
      reps: 12,
      rest: 90,
      rir: 2,
    },
    { name: "Tricep Rope Pushdown", sets: 3, reps: 12, rest: 90, rir: 2 },
  ]
);
export const PHUL_LOWER_HYP = createTemplate(
  "phul-lower-hyp",
  "PHUL – Lower Hypertrophy Day",
  "Lower body hypertrophy focus (higher volume quads/hamstrings/calves)",
  [
    { name: "Front Squat", sets: 3, reps: 10, rest: 150, rir: 2 },
    { name: "Barbell Lunge", sets: 3, reps: 10, rest: 120, rir: 2 },
    { name: "Leg Extension", sets: 3, reps: 15, rest: 90, rir: 2 },
    { name: "Leg Curl", sets: 3, reps: 15, rest: 90, rir: 2 },
    { name: "Seated Calf Raise", sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: "Calf Raise", sets: 3, reps: 12, rest: 90, rir: 2 },
  ]
);
export function createPHUL(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 12; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1,
        templateId: "builtin-phul-upper-power",
        templateName: "PHUL – Upper Power Day",
      },
      {
        dayOfWeek: 2,
        templateId: "builtin-phul-lower-power",
        templateName: "PHUL – Lower Power Day",
      },
      {
        dayOfWeek: 4,
        templateId: "builtin-phul-upper-hyp",
        templateName: "PHUL – Upper Hypertrophy Day",
      },
      {
        dayOfWeek: 5,
        templateId: "builtin-phul-lower-hyp",
        templateName: "PHUL – Lower Hypertrophy Day",
      },
      // Days 6-7 rest
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      name: week % 8 === 0 ? "Deload Week" : undefined,
      notes:
        week % 8 === 0
          ? "Take a light deload this week (reduce weight by ~15%)"
          : undefined,
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: "PHUL 4-Day Upper/Lower (12-Week)",
    description:
      "Power Hypertrophy Upper Lower split – 4 days/week. Each muscle trained with one strength day (3-5 reps) and one hypertrophy day (8-15 reps).",
    duration: 12,
    daysPerWeek: 4,
    weeks,
    goal: "hypertrophy",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/// Arnold’s Golden Six – 3-Day Full-Body Routine (Beginner)
export const GOLDEN_SIX_FULL_BODY = createTemplate(
  "arnold-golden-six",
  "Arnold’s Golden Six Full-Body",
  "Full-body workout of 6 classic exercises (performed 3x per week)",
  [
    { name: "Barbell Squat", sets: 4, reps: 10, rest: 180, warmup: 2, rir: 1 },
    {
      name: "Barbell Bench Press",
      sets: 3,
      reps: 10,
      rest: 150,
      warmup: 1,
      rir: 1,
      notes: "Use wide grip if comfortable",
    },
    {
      name: "Pull-ups",
      sets: 3,
      reps: 8,
      rest: 150,
      rir: 0,
      notes: "Do AMRAP each set (target ~8-10); use assist if needed",
    },
    {
      name: "Barbell Overhead Press",
      sets: 4,
      reps: 10,
      rest: 150,
      warmup: 1,
      rir: 1,
      notes: "Original routine used behind-the-neck press",
    },
    { name: "Barbell Curl", sets: 3, reps: 10, rest: 120, rir: 1 },
    {
      name: "Sit-ups",
      sets: 3,
      reps: 20,
      rest: 60,
      rir: 2,
      notes: "Bent-knee sit-up, go for 20+ reps per set",
    },
  ]
);
export function createArnoldGoldenSix(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 8; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1,
        templateId: "builtin-arnold-golden-six",
        templateName: "Arnold’s Golden Six Full-Body",
      },
      {
        dayOfWeek: 3,
        templateId: "builtin-arnold-golden-six",
        templateName: "Arnold’s Golden Six Full-Body",
      },
      {
        dayOfWeek: 5,
        templateId: "builtin-arnold-golden-six",
        templateName: "Arnold’s Golden Six Full-Body",
      },
      // Tuesdays, Thursdays, weekends are rest
    ];
    weeks.push({ weekNumber: week, workouts });
  }
  return {
    id: uuidv4(),
    userId,
    name: "Arnold’s Golden Six (8-Week)",
    description:
      "Classic 3-days-per-week full-body routine of 6 basic exercises popularized by Arnold Schwarzenegger. Ideal for beginners to build mass and strength.",
    duration: 8,
    daysPerWeek: 3,
    weeks,
    goal: "hypertrophy",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/// German Volume Training (10x10) – 6-Week High-Volume Routine (Advanced)
export const GVT_CHEST_BACK = createTemplate(
  "gvt-chest-back",
  "GVT – Chest & Back",
  "High-volume chest and back workout (10x10 method)",
  [
    {
      name: "Decline Dumbbell Press",
      sets: 10,
      reps: 10,
      rest: 90,
      warmup: 2,
      rir: 2,
      notes: "A1: Superset with Chin-ups. Use ~60% 1RM",
    },
    {
      name: "Pull-ups",
      sets: 10,
      reps: 10,
      rest: 90,
      warmup: 1,
      rir: 2,
      notes: "A2: Superset with Decline Press (assisted as needed)",
    },
    {
      name: "Incline Dumbbell Fly",
      sets: 10,
      reps: 10,
      rest: 60,
      rir: 2,
      notes: "B1: Superset with One-Arm Dumbbell Row",
    },
    {
      name: "Dumbbell Row",
      sets: 10,
      reps: 10,
      rest: 60,
      rir: 2,
      notes: "B2: Superset with Incline Flyes",
    },
  ]
);
export const GVT_LEGS_ABS = createTemplate(
  "gvt-legs-abs",
  "GVT – Legs & Abs",
  "High-volume leg workout (10x10 squats and leg curls) plus abs",
  [
    {
      name: "Barbell Squat",
      sets: 10,
      reps: 10,
      rest: 90,
      warmup: 3,
      rir: 2,
      notes: "A1: 10x10, ~60% 1RM",
    },
    {
      name: "Leg Curl",
      sets: 10,
      reps: 8,
      rest: 90,
      warmup: 2,
      rir: 2,
      notes: "A2: 10x8 (hamstrings), pair with Squats if possible",
    },
    {
      name: "Kneeling Cable Crunch",
      sets: 3,
      reps: 10,
      rest: 60,
      rir: 2,
      notes: "B1: Superset with Seated Calf Raise",
    },
    {
      name: "Seated Calf Raise",
      sets: 3,
      reps: 10,
      rest: 60,
      rir: 2,
      notes: "B2: Superset with Cable Crunch",
    },
  ]
);
export const GVT_ARMS_SHOULDERS = createTemplate(
  "gvt-arms-shoulders",
  "GVT – Arms & Shoulders",
  "High-volume arms and shoulders workout (10x10 for biceps/triceps)",
  [
    {
      name: "Dips",
      sets: 10,
      reps: 10,
      rest: 90,
      warmup: 1,
      rir: 2,
      notes: "A1: Superset with Hammer Curls",
    },
    {
      name: "Hammer Curl",
      sets: 10,
      reps: 10,
      rest: 90,
      warmup: 1,
      rir: 2,
      notes: "A2: Superset with Dips",
    },
    {
      name: "Bent Over Lateral Raise",
      sets: 3,
      reps: 10,
      rest: 60,
      rir: 2,
      notes: "B1: Superset with Lateral Raise",
    },
    {
      name: "Seated Dumbbell Lateral Raise",
      sets: 3,
      reps: 10,
      rest: 60,
      rir: 2,
      notes: "B2: Superset with Rear Delt Raise",
    },
  ]
);
export function createGVT10x10(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 6; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1,
        templateId: "builtin-gvt-chest-back",
        templateName: "GVT – Chest & Back",
      },
      {
        dayOfWeek: 2,
        templateId: "builtin-gvt-legs-abs",
        templateName: "GVT – Legs & Abs",
      },
      {
        dayOfWeek: 4,
        templateId: "builtin-gvt-arms-shoulders",
        templateName: "GVT – Arms & Shoulders",
      },
      // Days 6-7 repeat cycle or rest depending on rotation (5-day cycle repeating)
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      name: week === 6 ? "Deload/Transition" : undefined,
      notes:
        week === 6
          ? "End of GVT phase – transition to lower volume program"
          : undefined,
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: "German Volume Training (10x10) – 6 Week",
    description:
      "Advanced 6-week program using German Volume Training (10 sets of 10) for rapid hypertrophy. High frequency 5-day cycle: Chest/Back, Legs, Arms/Shoulders (two rest days).",
    duration: 6,
    daysPerWeek: 5,
    weeks,
    goal: "hypertrophy",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/// Coolcicada’s Push/Pull/Legs – 6-Day Split (Intermediate)
export const COOL_PUSH = createTemplate(
  "cool-push",
  "Coolcicada PPL – Push Day",
  "Push day (chest/shoulders/triceps) with heavy compounds and accessories",
  [
    {
      name: "Barbell Bench Press",
      sets: 3,
      reps: 5,
      rest: 180,
      warmup: 2,
      rir: 1,
    },
    {
      name: "Barbell Overhead Press",
      sets: 3,
      reps: 5,
      rest: 180,
      warmup: 1,
      rir: 1,
    },
    {
      name: "Incline Barbell Press",
      sets: 3,
      reps: 5,
      rest: 180,
      warmup: 1,
      rir: 1,
    },
    { name: "Dumbbell Lateral Raise", sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: "Tricep Rope Pushdown", sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: "Overhead Tricep Extension", sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: "Barbell Shrug", sets: 3, reps: 12, rest: 90, rir: 2 },
  ]
);
export const COOL_PULL_A = createTemplate(
  "cool-pull-a",
  "Coolcicada PPL – Pull Day 1",
  "Pull day with deadlifts and heavy rows (back/biceps)",
  [
    { name: "Deadlift", sets: 1, reps: 5, rest: 240, warmup: 3, rir: 1 },
    { name: "Barbell Row", sets: 3, reps: 5, rest: 180, warmup: 1, rir: 1 },
    { name: "Lat Pulldown", sets: 3, reps: 10, rest: 120, rir: 1 },
    { name: "Seated Cable Row", sets: 3, reps: 10, rest: 120, rir: 1 },
    { name: "Face Pulls", sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: "Barbell Curl", sets: 4, reps: 12, rest: 90, rir: 1 },
    { name: "Dumbbell Curl", sets: 3, reps: 12, rest: 90, rir: 1 },
  ]
);
export const COOL_PULL_B = createTemplate(
  "cool-pull-b",
  "Coolcicada PPL – Pull Day 2",
  "Pull day without deadlifts (horizontal pulling focus)",
  [
    { name: "Barbell Row", sets: 3, reps: 5, rest: 180, warmup: 1, rir: 1 },
    { name: "Lat Pulldown", sets: 3, reps: 10, rest: 120, rir: 1 },
    { name: "Seated Cable Row", sets: 3, reps: 10, rest: 120, rir: 1 },
    { name: "Face Pulls", sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: "Barbell Curl", sets: 4, reps: 12, rest: 90, rir: 1 },
    { name: "Dumbbell Curl", sets: 3, reps: 12, rest: 90, rir: 1 },
  ]
);
export const COOL_LEGS = createTemplate(
  "cool-legs",
  "Coolcicada PPL – Legs Day",
  "Leg day (quad, ham, calves) with heavy squats",
  [
    { name: "Barbell Squat", sets: 4, reps: 6, rest: 180, warmup: 2, rir: 1 },
    { name: "Leg Press", sets: 3, reps: 10, rest: 150, rir: 2 },
    { name: "Leg Extension", sets: 3, reps: 12, rest: 90, rir: 2 },
    { name: "Leg Curl", sets: 3, reps: 12, rest: 90, rir: 2 },
    {
      name: "Calf Raise",
      sets: 5,
      reps: 12,
      rest: 90,
      rir: 2,
    },
  ]
);
export function createCoolcicadaPPL(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 12; week++) {
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1,
        templateId: "builtin-cool-push",
        templateName: "Coolcicada PPL – Push Day",
      },
      {
        dayOfWeek: 2,
        templateId: "builtin-cool-pull-a",
        templateName: "Coolcicada PPL – Pull Day 1",
      },
      {
        dayOfWeek: 3,
        templateId: "builtin-cool-legs",
        templateName: "Coolcicada PPL – Legs Day",
      },
      {
        dayOfWeek: 4,
        templateId: "builtin-cool-push",
        templateName: "Coolcicada PPL – Push Day",
      },
      {
        dayOfWeek: 5,
        templateId: "builtin-cool-pull-b",
        templateName: "Coolcicada PPL – Pull Day 2",
      },
      {
        dayOfWeek: 6,
        templateId: "builtin-cool-legs",
        templateName: "Coolcicada PPL – Legs Day",
      },
      // Day 7 rest
    ];
    weeks.push({ weekNumber: week, workouts });
  }
  return {
    id: uuidv4(),
    userId,
    name: "Coolcicada 6-Day PPL (Indefinite)",
    description:
      "Popular 6-day bodybuilding Push/Pull/Legs split from the Bodybuilding.com forums. High frequency, moderate volume, linear progression.",
    duration: 12,
    daysPerWeek: 6,
    weeks,
    goal: "hypertrophy",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/// John Meadows – “Warlock” Program – 8-Week Upper/Lower (Advanced)
export const WARLOCK_UPPER_1 = createTemplate(
  "warlock-upper-1",
  "Warlock – Upper Body 1 (Chest Emphasis)",
  "Upper body workout – emphasis on chest (includes back, shoulders, arms)",
  [
    {
      name: "Incline Barbell Bench Press",
      sets: 3,
      reps: 8,
      rest: 180,
      warmup: 2,
      rir: 1,
    },
    {
      name: "Decline Dumbbell Press",
      sets: 2,
      reps: 10,
      rest: 180,
      warmup: 1,
      rir: 0,
      notes: "Second set: drop weight 30% after failure for ~8 more reps",
    },
    { name: "Pec Deck Fly", sets: 3, reps: 10, rest: 90, rir: 1 },
    {
      name: "Dumbbell Row",
      sets: 4,
      reps: 8,
      rest: 150,
      warmup: 1,
      rir: 1,
    },
    {
      name: "Assisted Pull-Up",
      sets: 4,
      reps: 10,
      rest: 150,
      rir: 1,
      notes: "Use machine or band to maintain strict form",
    },
    { name: "Dumbbell Shoulder Press", sets: 3, reps: 8, rest: 150, rir: 1 },
    { name: "Dumbbell Lateral Raise", sets: 3, reps: 12, rest: 90, rir: 1 },
    { name: "Hammer Curl", sets: 3, reps: 12, rest: 90, rir: 1 },
    { name: "Tricep Rope Pushdown", sets: 3, reps: 12, rest: 90, rir: 1 },
  ]
);
export const WARLOCK_LOWER_1 = createTemplate(
  "warlock-lower-1",
  "Warlock – Lower Body 1 (Quad Emphasis)",
  "Lower body workout – emphasis on quads (includes hamstrings, calves, abs)",
  [
    { name: "Barbell Squat", sets: 4, reps: 8, rest: 180, warmup: 3, rir: 1 },
    { name: "Leg Press", sets: 3, reps: 15, rest: 150, rir: 1 },
    { name: "Leg Extension", sets: 3, reps: 15, rest: 120, rir: 1 },
    {
      name: "Romanian Deadlift",
      sets: 3,
      reps: 8,
      rest: 180,
      warmup: 1,
      rir: 1,
    },
    { name: "Lying Leg Curl", sets: 3, reps: 12, rest: 120, rir: 1 },
    {
      name: "Calf Raise",
      sets: 4,
      reps: 12,
      rest: 90,
      rir: 1,
    },
    { name: "Hanging Leg Raise", sets: 3, reps: 12, rest: 60, rir: 1 },
  ]
);
export const WARLOCK_UPPER_2 = createTemplate(
  "warlock-upper-2",
  "Warlock – Upper Body 2 (Back Emphasis)",
  "Upper body workout – emphasis on back (includes chest, shoulders, arms)",
  [
    { name: "Barbell Pendlay Row", sets: 3, reps: 8, rest: 180, warmup: 2, rir: 1 },
    {
      name: "Pull-ups",
      sets: 3,
      reps: 6,
      rest: 180,
      warmup: 1,
      rir: 1,
    },
    { name: "Cable Straight Arm Pulldown", sets: 3, reps: 12, rest: 90, rir: 1 },
    { name: "Reverse Flyes", sets: 3, reps: 15, rest: 90, rir: 1 },
    {
      name: "Barbell Bench Press",
      sets: 3,
      reps: 8,
      rest: 180,
      warmup: 1,
      rir: 1,
    },
    { name: "Cable Crossover", sets: 2, reps: 12, rest: 90, rir: 1 },
    { name: "Barbell Curl", sets: 3, reps: 10, rest: 90, rir: 1 },
    { name: "Dips", sets: 3, reps: 10, rest: 90, rir: 1 },
  ]
);
export const WARLOCK_LOWER_2 = createTemplate(
  "warlock-lower-2",
  "Warlock – Lower Body 2 (Hamstring Emphasis)",
  "Lower body workout – emphasis on hamstrings/glutes (includes quads, calves, abs)",
  [
    {
      name: "Romanian Deadlift",
      sets: 3,
      reps: 8,
      rest: 180,
      warmup: 2,
      rir: 1,
    },
    { name: "Leg Curl", sets: 4, reps: 10, rest: 120, rir: 1 },
    { name: "Bulgarian Split Squat", sets: 3, reps: 10, rest: 120, rir: 1 },
    { name: "Leg Press", sets: 3, reps: 15, rest: 120, rir: 1 },
    { name: "Seated Calf Raise", sets: 4, reps: 15, rest: 90, rir: 1 },
    { name: "Decline Sit-Up", sets: 3, reps: 15, rest: 60, rir: 1 },
  ]
);
export function createWarlockProgram(userId: string): Program {
  const weeks: ProgramWeek[] = [];
  for (let week = 1; week <= 8; week++) {
    const phase2 = week > 4;
    const workouts: ScheduledWorkout[] = [
      {
        dayOfWeek: 1,
        templateId: phase2
          ? "builtin-warlock-upper-2"
          : "builtin-warlock-upper-1",
        templateName: phase2
          ? "Warlock – Upper Body 2 (Back Emphasis)"
          : "Warlock – Upper Body 1 (Chest Emphasis)",
      },
      {
        dayOfWeek: 2,
        templateId: phase2
          ? "builtin-warlock-lower-2"
          : "builtin-warlock-lower-1",
        templateName: phase2
          ? "Warlock – Lower Body 2 (Hamstring Emphasis)"
          : "Warlock – Lower Body 1 (Quad Emphasis)",
      },
      {
        dayOfWeek: 4,
        templateId: phase2
          ? "builtin-warlock-upper-2"
          : "builtin-warlock-upper-1",
        templateName: phase2
          ? "Warlock – Upper Body 2 (Back Emphasis)"
          : "Warlock – Upper Body 1 (Chest Emphasis)",
      },
      {
        dayOfWeek: 5,
        templateId: phase2
          ? "builtin-warlock-lower-2"
          : "builtin-warlock-lower-1",
        templateName: phase2
          ? "Warlock – Lower Body 2 (Hamstring Emphasis)"
          : "Warlock – Lower Body 1 (Quad Emphasis)",
      },
      // Day 0 (Sunday) Rest
    ];
    weeks.push({
      weekNumber: week,
      workouts,
      name: week === 4 ? "Mid-Program Deload" : undefined,
      notes:
        week === 4 ? "Reduce volume ~40% this week for recovery" : undefined,
    });
  }
  return {
    id: uuidv4(),
    userId,
    name: "John Meadows Warlock (8-Week Upper/Lower)",
    description:
      "Advanced 8-week Mountain Dog “Warlock” program – Upper/Lower split hitting each muscle 2x/week. Two 4-week phases with different exercise rotations, high intensity techniques, and planned deload.",
    duration: 8,
    daysPerWeek: 4,
    weeks,
    goal: "hypertrophy",
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// Export all workout templates
export const BUILTIN_HYPERTROPHY_WORKOUT_TEMPLATES = [
  PPL_PUSH,
  PPL_PULL_A,
  PPL_PULL_B,
  PPL_LEGS,
  PHAT_UPPER_POWER,
  PHAT_LOWER_POWER,
  PHAT_BACK_HYP,
  PHAT_LOWER_HYP,
  PHAT_CHEST_HYP,
  PHUL_UPPER_POWER,
  PHUL_LOWER_POWER,
  PHUL_UPPER_HYP,
  PHUL_LOWER_HYP,
  GOLDEN_SIX_FULL_BODY,
  GVT_CHEST_BACK,
  GVT_LEGS_ABS,
  GVT_ARMS_SHOULDERS,
  COOL_PUSH,
  COOL_PULL_A,
  COOL_PULL_B,
  COOL_LEGS,
  WARLOCK_UPPER_1,
  WARLOCK_LOWER_1,
  WARLOCK_UPPER_2,
  WARLOCK_LOWER_2,
];

// Export all program templates
export const BUILTIN_HYPERTROPHY_PROGRAM_TEMPLATES = [
  { id: 'reddit-ppl', name: 'Reddit PPL 6-Day (Metallicadpa)', factory: createRedditPPL },
  { id: 'phat', name: 'PHAT (8-Week)', factory: createPHAT },
  { id: 'phul', name: 'PHUL 4-Day Upper/Lower (12-Week)', factory: createPHUL },
  { id: 'arnold-golden-six', name: "Arnold's Golden Six (8-Week)", factory: createArnoldGoldenSix },
  { id: 'gvt-10x10', name: 'German Volume Training (10x10) – 6 Week', factory: createGVT10x10 },
  { id: 'coolcicada-ppl', name: 'Coolcicada 6-Day PPL', factory: createCoolcicadaPPL },
  { id: 'warlock', name: 'John Meadows Warlock (8-Week)', factory: createWarlockProgram },
];
