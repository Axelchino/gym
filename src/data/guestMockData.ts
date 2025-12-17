// Mock data for guest mode - allows users to explore the app without signing up
// This data is never stored in the database, only computed on-the-fly

// ============================================
// HELPER: Calculate volume for exercises
// ============================================
function calculateVolume(exercises: any[]): number {
  let total = 0;
  exercises.forEach(ex => {
    ex.sets.forEach((set: any) => {
      if (!set.completed || set.isWarmup) return;
      total += set.weight * set.reps;
    });
  });
  return total;
}

// ============================================
// MOCK WORKOUTS (20 workouts over 30 days)
// ============================================
export const mockWorkoutTemplate = [
  // Week 1 - Current Week
  {
    daysAgo: 1,  // Yesterday
    name: "Push Day",
    duration: 3840, // 64 minutes
    exercises: [
      {
        exerciseId: "barbell-bench-press",
        exerciseName: "Bench Press",
        sets: [
          { weight: 135, reps: 12, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 185, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 185, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 185, reps: 7, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-incline-press",
        exerciseName: "Incline Dumbbell Press",
        sets: [
          { weight: 60, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 60, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 60, reps: 9, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "cable-tricep-pushdown",
        exerciseName: "One Arm Triceps Pushdown",
        sets: [
          { weight: 80, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 80, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 80, reps: 11, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-shoulder-press",
        exerciseName: "Dumbbell Shoulder Press",
        sets: [
          { weight: 50, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 50, reps: 9, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 50, reps: 8, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 3,  // 3 days ago
    name: "Pull Day",
    duration: 4200, // 70 minutes
    exercises: [
      {
        exerciseId: "barbell-deadlift",
        exerciseName: "Deadlift",
        sets: [
          { weight: 135, reps: 10, rir: 4, completed: true, isWarmup: true, isFailure: false },
          { weight: 225, reps: 8, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 315, reps: 5, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 315, reps: 5, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 315, reps: 4, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "pull-up",
        exerciseName: "Pull-Up",
        sets: [
          { weight: 0, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 9, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 8, rir: 1, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 7, rir: 0, completed: true, isWarmup: false, isFailure: true },
        ]
      },
      {
        exerciseId: "barbell-bent-over-row",
        exerciseName: "Barbell Bent Over Row",
        sets: [
          { weight: 135, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 135, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 135, reps: 9, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-bicep-curl",
        exerciseName: "Dumbbell Curl",
        sets: [
          { weight: 35, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 35, reps: 11, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 35, reps: 10, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 5,  // 5 days ago
    name: "Leg Day",
    duration: 4500, // 75 minutes
    exercises: [
      {
        exerciseId: "barbell-squat",
        exerciseName: "Barbell Squat",
        sets: [
          { weight: 135, reps: 10, rir: 4, completed: true, isWarmup: true, isFailure: false },
          { weight: 185, reps: 8, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 225, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 225, reps: 7, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 225, reps: 6, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "leg-press",
        exerciseName: "Leg Press",
        sets: [
          { weight: 360, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 360, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 360, reps: 11, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "leg-curl",
        exerciseName: "Leg Curl",
        sets: [
          { weight: 90, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 90, reps: 11, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 90, reps: 10, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "standing-calf-raise",
        exerciseName: "Standing Barbell Calf Raise",
        sets: [
          { weight: 200, reps: 15, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 200, reps: 15, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 200, reps: 14, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },

  // Week 2 - Last Week
  {
    daysAgo: 8,
    name: "Push Day",
    duration: 3720,
    exercises: [
      {
        exerciseId: "barbell-bench-press",
        exerciseName: "Bench Press",
        sets: [
          { weight: 135, reps: 12, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 180, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 180, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 180, reps: 7, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-incline-press",
        exerciseName: "Incline Dumbbell Press",
        sets: [
          { weight: 55, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 55, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 55, reps: 9, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "cable-tricep-pushdown",
        exerciseName: "One Arm Triceps Pushdown",
        sets: [
          { weight: 75, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 75, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 75, reps: 11, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-shoulder-press",
        exerciseName: "Dumbbell Shoulder Press",
        sets: [
          { weight: 45, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 45, reps: 9, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 45, reps: 8, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 10,
    name: "Pull Day",
    duration: 4080,
    exercises: [
      {
        exerciseId: "barbell-deadlift",
        exerciseName: "Deadlift",
        sets: [
          { weight: 135, reps: 10, rir: 4, completed: true, isWarmup: true, isFailure: false },
          { weight: 225, reps: 8, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 305, reps: 5, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 305, reps: 5, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 305, reps: 4, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "pull-up",
        exerciseName: "Pull-Up",
        sets: [
          { weight: 0, reps: 9, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 7, rir: 1, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 6, rir: 0, completed: true, isWarmup: false, isFailure: true },
        ]
      },
      {
        exerciseId: "barbell-bent-over-row",
        exerciseName: "Barbell Bent Over Row",
        sets: [
          { weight: 130, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 130, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 130, reps: 9, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-bicep-curl",
        exerciseName: "Dumbbell Curl",
        sets: [
          { weight: 32.5, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 32.5, reps: 11, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 32.5, reps: 10, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 12,
    name: "Leg Day",
    duration: 4380,
    exercises: [
      {
        exerciseId: "barbell-squat",
        exerciseName: "Barbell Squat",
        sets: [
          { weight: 135, reps: 10, rir: 4, completed: true, isWarmup: true, isFailure: false },
          { weight: 185, reps: 8, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 220, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 220, reps: 7, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 220, reps: 6, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "leg-press",
        exerciseName: "Leg Press",
        sets: [
          { weight: 350, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 350, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 350, reps: 11, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "leg-curl",
        exerciseName: "Leg Curl",
        sets: [
          { weight: 85, reps: 12, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 85, reps: 11, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 85, reps: 10, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "standing-calf-raise",
        exerciseName: "Standing Barbell Calf Raise",
        sets: [
          { weight: 195, reps: 15, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 195, reps: 15, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 195, reps: 14, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },

  // Week 3
  {
    daysAgo: 15,
    name: "Push Day",
    duration: 3660,
    exercises: [
      {
        exerciseId: "barbell-bench-press",
        exerciseName: "Bench Press",
        sets: [
          { weight: 135, reps: 12, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 175, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 175, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 175, reps: 7, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-incline-press",
        exerciseName: "Incline Dumbbell Press",
        sets: [
          { weight: 50, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 50, reps: 10, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 50, reps: 9, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "cable-tricep-pushdown",
        exerciseName: "One Arm Triceps Pushdown",
        sets: [
          { weight: 70, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 70, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 70, reps: 11, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-shoulder-press",
        exerciseName: "Dumbbell Shoulder Press",
        sets: [
          { weight: 42.5, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 42.5, reps: 9, completed: true, isWarmup: false, isFailure: false },
          { weight: 42.5, reps: 8, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 17,
    name: "Pull Day",
    duration: 4020,
    exercises: [
      {
        exerciseId: "barbell-deadlift",
        exerciseName: "Deadlift",
        sets: [
          { weight: 135, reps: 10, rir: 4, completed: true, isWarmup: true, isFailure: false },
          { weight: 225, reps: 8, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 295, reps: 5, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 295, reps: 5, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 295, reps: 4, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "pull-up",
        exerciseName: "Pull-Up",
        sets: [
          { weight: 0, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 7, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 6, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "barbell-bent-over-row",
        exerciseName: "Barbell Bent Over Row",
        sets: [
          { weight: 125, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 125, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 125, reps: 9, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-bicep-curl",
        exerciseName: "Dumbbell Curl",
        sets: [
          { weight: 30, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 30, reps: 11, completed: true, isWarmup: false, isFailure: false },
          { weight: 30, reps: 10, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 19,
    name: "Leg Day",
    duration: 4320,
    exercises: [
      {
        exerciseId: "barbell-squat",
        exerciseName: "Barbell Squat",
        sets: [
          { weight: 135, reps: 10, rir: 4, completed: true, isWarmup: true, isFailure: false },
          { weight: 185, reps: 8, rir: 3, completed: true, isWarmup: true, isFailure: false },
          { weight: 215, reps: 8, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 215, reps: 7, rir: 2, completed: true, isWarmup: false, isFailure: false },
          { weight: 215, reps: 6, rir: 1, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "leg-press",
        exerciseName: "Leg Press",
        sets: [
          { weight: 340, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 340, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 340, reps: 11, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "leg-curl",
        exerciseName: "Leg Curl",
        sets: [
          { weight: 80, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 80, reps: 11, completed: true, isWarmup: false, isFailure: false },
          { weight: 80, reps: 10, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "standing-calf-raise",
        exerciseName: "Standing Barbell Calf Raise",
        sets: [
          { weight: 190, reps: 15, completed: true, isWarmup: false, isFailure: false },
          { weight: 190, reps: 15, completed: true, isWarmup: false, isFailure: false },
          { weight: 190, reps: 14, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },

  // Week 4 - 3 weeks ago
  {
    daysAgo: 22,
    name: "Push Day",
    duration: 3600,
    exercises: [
      {
        exerciseId: "barbell-bench-press",
        exerciseName: "Bench Press",
        sets: [
          { weight: 135, reps: 12, completed: true, isWarmup: true, isFailure: false },
          { weight: 170, reps: 8, completed: true, isWarmup: false, isFailure: false },
          { weight: 170, reps: 8, completed: true, isWarmup: false, isFailure: false },
          { weight: 170, reps: 7, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-incline-press",
        exerciseName: "Incline Dumbbell Press",
        sets: [
          { weight: 47.5, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 47.5, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 47.5, reps: 9, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "cable-tricep-pushdown",
        exerciseName: "One Arm Triceps Pushdown",
        sets: [
          { weight: 65, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 65, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 65, reps: 11, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 24,
    name: "Pull Day",
    duration: 3960,
    exercises: [
      {
        exerciseId: "barbell-deadlift",
        exerciseName: "Deadlift",
        sets: [
          { weight: 135, reps: 10, completed: true, isWarmup: true, isFailure: false },
          { weight: 225, reps: 8, completed: true, isWarmup: true, isFailure: false },
          { weight: 285, reps: 5, completed: true, isWarmup: false, isFailure: false },
          { weight: 285, reps: 5, completed: true, isWarmup: false, isFailure: false },
          { weight: 285, reps: 4, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "pull-up",
        exerciseName: "Pull-Up",
        sets: [
          { weight: 0, reps: 7, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 6, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 5, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "barbell-bent-over-row",
        exerciseName: "Barbell Bent Over Row",
        sets: [
          { weight: 120, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 120, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 120, reps: 9, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 26,
    name: "Leg Day",
    duration: 4260,
    exercises: [
      {
        exerciseId: "barbell-squat",
        exerciseName: "Barbell Squat",
        sets: [
          { weight: 135, reps: 10, completed: true, isWarmup: true, isFailure: false },
          { weight: 185, reps: 8, completed: true, isWarmup: true, isFailure: false },
          { weight: 210, reps: 8, completed: true, isWarmup: false, isFailure: false },
          { weight: 210, reps: 7, completed: true, isWarmup: false, isFailure: false },
          { weight: 210, reps: 6, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "leg-press",
        exerciseName: "Leg Press",
        sets: [
          { weight: 330, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 330, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 330, reps: 11, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "leg-curl",
        exerciseName: "Leg Curl",
        sets: [
          { weight: 75, reps: 12, completed: true, isWarmup: false, isFailure: false },
          { weight: 75, reps: 11, completed: true, isWarmup: false, isFailure: false },
          { weight: 75, reps: 10, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },

  // Additional scattered workouts for variety
  {
    daysAgo: 6,
    name: "Upper Body",
    duration: 3300,
    exercises: [
      {
        exerciseId: "barbell-bench-press",
        exerciseName: "Bench Press",
        sets: [
          { weight: 135, reps: 12, completed: true, isWarmup: true, isFailure: false },
          { weight: 185, reps: 6, completed: true, isWarmup: false, isFailure: false },
          { weight: 185, reps: 6, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "pull-up",
        exerciseName: "Pull-Up",
        sets: [
          { weight: 0, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 9, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 8, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 13,
    name: "Full Body",
    duration: 3900,
    exercises: [
      {
        exerciseId: "barbell-squat",
        exerciseName: "Barbell Squat",
        sets: [
          { weight: 135, reps: 10, completed: true, isWarmup: true, isFailure: false },
          { weight: 185, reps: 8, completed: true, isWarmup: false, isFailure: false },
          { weight: 185, reps: 8, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "barbell-bench-press",
        exerciseName: "Bench Press",
        sets: [
          { weight: 135, reps: 10, completed: true, isWarmup: true, isFailure: false },
          { weight: 175, reps: 8, completed: true, isWarmup: false, isFailure: false },
          { weight: 175, reps: 7, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "barbell-deadlift",
        exerciseName: "Deadlift",
        sets: [
          { weight: 225, reps: 8, completed: true, isWarmup: true, isFailure: false },
          { weight: 275, reps: 5, completed: true, isWarmup: false, isFailure: false },
          { weight: 275, reps: 5, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 20,
    name: "Push Day",
    duration: 3540,
    exercises: [
      {
        exerciseId: "barbell-bench-press",
        exerciseName: "Bench Press",
        sets: [
          { weight: 135, reps: 12, completed: true, isWarmup: true, isFailure: false },
          { weight: 165, reps: 8, completed: true, isWarmup: false, isFailure: false },
          { weight: 165, reps: 8, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "dumbbell-shoulder-press",
        exerciseName: "Dumbbell Shoulder Press",
        sets: [
          { weight: 40, reps: 10, completed: true, isWarmup: false, isFailure: false },
          { weight: 40, reps: 9, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
  {
    daysAgo: 27,
    name: "Pull Day",
    duration: 3840,
    exercises: [
      {
        exerciseId: "barbell-deadlift",
        exerciseName: "Deadlift",
        sets: [
          { weight: 135, reps: 10, completed: true, isWarmup: true, isFailure: false },
          { weight: 225, reps: 6, completed: true, isWarmup: true, isFailure: false },
          { weight: 275, reps: 5, completed: true, isWarmup: false, isFailure: false },
          { weight: 275, reps: 5, completed: true, isWarmup: false, isFailure: false },
        ]
      },
      {
        exerciseId: "pull-up",
        exerciseName: "Pull-Up",
        sets: [
          { weight: 0, reps: 6, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 5, completed: true, isWarmup: false, isFailure: false },
          { weight: 0, reps: 5, completed: true, isWarmup: false, isFailure: false },
        ]
      },
    ]
  },
];

// ============================================
// HYDRATE WORKOUTS WITH DYNAMIC DATES
// ============================================
export function getGuestWorkouts() {
  const today = new Date();
  const workouts: any[] = [];

  // Helper: Get the most recent occurrence of a weekday (0=Sun, 1=Mon, ..., 6=Sat)
  function getMostRecentWeekday(targetDay: number, weeksAgo: number = 0): Date {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const currentDay = date.getDay();

    // Calculate days to go back
    let daysToSubtract = (currentDay - targetDay + 7) % 7;
    if (daysToSubtract === 0 && weeksAgo === 0) {
      // If today IS the target day and we want this week, use today
      daysToSubtract = 0;
    }
    daysToSubtract += weeksAgo * 7;

    date.setDate(date.getDate() - daysToSubtract);
    return date;
  }

  // Generate workouts for Mon/Wed/Fri going back 6 weeks
  const workoutTypes = ['Push Day', 'Pull Day', 'Leg Day'];
  const weekdays = [1, 3, 5]; // Monday, Wednesday, Friday

  for (let week = 0; week < 6; week++) {
    weekdays.forEach((day, idx) => {
      const workoutDate = getMostRecentWeekday(day, week);
      const templateIndex = (week * 3 + idx) % mockWorkoutTemplate.length;
      const template = mockWorkoutTemplate[templateIndex];

      const workout = {
        id: `guest-workout-${week}-${idx}`,
        userId: 'guest',
        date: workoutDate.toISOString().split('T')[0],
        name: workoutTypes[idx],
        duration: template.duration,
        exercises: template.exercises,
        totalVolume: calculateVolume(template.exercises),
        createdAt: workoutDate.toISOString(),
        updatedAt: workoutDate.toISOString(),
        syncStatus: 'synced' as const,
      };

      workouts.push(workout);
    });
  }

  return workouts;
}

// ============================================
// MOCK PROFILE
// ============================================
export function getGuestProfile() {
  return {
    userId: 'guest',
    weight: 180,
    sex: 'male' as const,
    unit: 'lbs' as const,
    theme: 'dark' as const,
    experience: 'intermediate' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ============================================
// MOCK PERSONAL RECORDS
// ============================================
export function getGuestPRs() {
  const today = new Date();

  return [
    {
      id: 'guest-pr-1',
      userId: 'guest',
      exerciseId: 'barbell-bench-press',
      exerciseName: 'Bench Press',
      type: 'weight' as const,
      value: 225,
      date: new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0],
      workoutId: 'guest-workout-7',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'guest-pr-2',
      userId: 'guest',
      exerciseId: 'barbell-squat',
      exerciseName: 'Barbell Squat',
      type: 'weight' as const,
      value: 275,
      date: new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0],
      workoutId: 'guest-workout-5',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'guest-pr-3',
      userId: 'guest',
      exerciseId: 'barbell-deadlift',
      exerciseName: 'Deadlift',
      type: 'weight' as const,
      value: 365,
      date: new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0],
      workoutId: 'guest-workout-3',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'guest-pr-4',
      userId: 'guest',
      exerciseId: 'dumbbell-shoulder-press',
      exerciseName: 'Dumbbell Shoulder Press',
      type: 'weight' as const,
      value: 55,
      date: new Date(today.getTime() - 10 * 86400000).toISOString().split('T')[0],
      workoutId: 'guest-workout-10',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'guest-pr-5',
      userId: 'guest',
      exerciseId: 'pull-up',
      exerciseName: 'Pull-Up',
      type: 'reps' as const,
      value: 12,
      date: new Date(today.getTime() - 14 * 86400000).toISOString().split('T')[0],
      workoutId: 'guest-workout-14',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'guest-pr-6',
      userId: 'guest',
      exerciseId: 'barbell-bench-press',
      exerciseName: 'Bench Press',
      type: 'reps' as const,
      value: 10,
      date: new Date(today.getTime() - 21 * 86400000).toISOString().split('T')[0],
      workoutId: 'guest-workout-21',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'guest-pr-7',
      userId: 'guest',
      exerciseId: 'leg-press',
      exerciseName: 'Leg Press',
      type: 'volume' as const,
      value: 4320,
      date: new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0],
      workoutId: 'guest-workout-5',
      createdAt: new Date().toISOString(),
    },
  ];
}

// ============================================
// MOCK TEMPLATES
// ============================================
export function getGuestTemplates() {
  return [
    {
      id: 'guest-template-1',
      userId: 'guest',
      name: 'Push Day',
      exercises: [
        {
          exerciseId: 'barbell-bench-press',
          exerciseName: 'Bench Press',
          targetSets: 4,
          targetReps: '8-10',
          targetRIR: 2,
          note: 'Focus on controlled descent'
        },
        {
          exerciseId: 'dumbbell-incline-press',
          exerciseName: 'Incline Dumbbell Press',
          targetSets: 3,
          targetReps: '10-12',
          targetRIR: 2,
        },
        {
          exerciseId: 'cable-tricep-pushdown',
          exerciseName: 'One Arm Triceps Pushdown',
          targetSets: 3,
          targetReps: '12-15',
          targetRIR: 2,
        },
        {
          exerciseId: 'dumbbell-shoulder-press',
          exerciseName: 'Dumbbell Shoulder Press',
          targetSets: 3,
          targetReps: '8-10',
          targetRIR: 2,
        },
      ],
      builtin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'guest-template-2',
      userId: 'guest',
      name: 'Pull Day',
      exercises: [
        {
          exerciseId: 'barbell-deadlift',
          exerciseName: 'Deadlift',
          targetSets: 5,
          targetReps: '5',
          targetRIR: 2,
          note: 'Heavy compound movement'
        },
        {
          exerciseId: 'pull-up',
          exerciseName: 'Pull-Up',
          targetSets: 4,
          targetReps: '8-10',
          targetRIR: 1,
        },
        {
          exerciseId: 'barbell-bent-over-row',
          exerciseName: 'Barbell Bent Over Row',
          targetSets: 3,
          targetReps: '10-12',
          targetRIR: 2,
        },
        {
          exerciseId: 'dumbbell-bicep-curl',
          exerciseName: 'Dumbbell Curl',
          targetSets: 3,
          targetReps: '10-12',
          targetRIR: 2,
        },
      ],
      builtin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'guest-template-3',
      userId: 'guest',
      name: 'Leg Day',
      exercises: [
        {
          exerciseId: 'barbell-squat',
          exerciseName: 'Barbell Squat',
          targetSets: 5,
          targetReps: '6-8',
          targetRIR: 2,
          note: 'King of exercises'
        },
        {
          exerciseId: 'leg-press',
          exerciseName: 'Leg Press',
          targetSets: 3,
          targetReps: '10-12',
          targetRIR: 2,
        },
        {
          exerciseId: 'leg-curl',
          exerciseName: 'Leg Curl',
          targetSets: 3,
          targetReps: '10-12',
          targetRIR: 2,
        },
        {
          exerciseId: 'standing-calf-raise',
          exerciseName: 'Standing Barbell Calf Raise',
          targetSets: 3,
          targetReps: '15-20',
          targetRIR: 2,
        },
      ],
      builtin: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

// ============================================
// MOCK PROGRAM
// ============================================
export function getGuestProgram() {
  const today = new Date();
  const programStartDate = new Date(today.getTime() - 84 * 86400000); // Started 12 weeks ago

  // Calculate how many weeks since program started
  const weeksSinceStart = Math.floor((today.getTime() - programStartDate.getTime()) / (7 * 86400000));
  const currentWeek = weeksSinceStart + 1;

  // Generate weeks dynamically - show 12 past weeks + current week + 4 future weeks
  const weeks = [];
  const totalWeeks = Math.max(16, currentWeek + 4); // Always show at least 16 weeks, or more if needed

  for (let weekNum = 1; weekNum <= totalWeeks; weekNum++) {
    const weekStartDate = new Date(programStartDate.getTime() + (weekNum - 1) * 7 * 86400000);
    const isPastWeek = weekNum < currentWeek;
    const isCurrentWeek = weekNum === currentWeek;

    weeks.push({
      weekNumber: weekNum,
      workouts: [
        {
          dayOfWeek: 1, // Monday
          templateId: 'guest-template-1',
          templateName: 'Push Day',
          completed: isPastWeek,
          completedDate: isPastWeek ? new Date(weekStartDate.getTime() + 0 * 86400000).toISOString().split('T')[0] : undefined
        },
        {
          dayOfWeek: 3, // Wednesday
          templateId: 'guest-template-2',
          templateName: 'Pull Day',
          completed: isPastWeek,
          completedDate: isPastWeek ? new Date(weekStartDate.getTime() + 2 * 86400000).toISOString().split('T')[0] : undefined
        },
        {
          dayOfWeek: 5, // Friday
          templateId: 'guest-template-3',
          templateName: 'Leg Day',
          completed: isPastWeek,
          completedDate: isPastWeek ? new Date(weekStartDate.getTime() + 4 * 86400000).toISOString().split('T')[0] : undefined
        }
      ]
    });
  }

  return {
    id: 'guest-program-1',
    userId: 'guest',
    name: 'PPL 3-Day Split',
    description: 'Push/Pull/Legs split running 3 days per week (Mon/Wed/Fri) for balanced muscle development',
    duration: 52, // Ongoing program (1 year shown)
    daysPerWeek: 3,
    goal: 'hypertrophy' as const,
    isActive: true,
    weeks,
    currentWeek,
    startDate: programStartDate.toISOString().split('T')[0],
    createdAt: programStartDate.toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
