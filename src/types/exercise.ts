export type MuscleGroup =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Forearms'
  | 'Abs'
  | 'Obliques'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Traps'
  | 'Lats'
  | 'Lower Back'
  | 'Neck'
  | 'Hip Flexors'
  | 'Adductors'
  | 'Full Body'
  | 'Cardio';

export type Equipment =
  | 'Barbell'
  | 'Dumbbell'
  | 'Cable'
  | 'Machine'
  | 'Bodyweight'
  | 'Resistance Band'
  | 'Kettlebell'
  | 'Smith Machine'
  | 'Rope'
  | 'Foam Roller'
  | 'Stability Ball'
  | 'Suspension'
  | 'Other';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type MovementType = 'compound' | 'isolation' | 'stretch' | 'cardio' | 'mobility';

export type MuscleInvolvement = 'primary' | 'secondary';

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup | string; // Allow string for flexibility with scraped data
  equipment: Equipment;
  difficulty: Difficulty;
  movementType: MovementType;
  popularityRank: number; // 1-100 scale
  primaryMuscles: (MuscleGroup | string)[]; // Allow string for flexibility
  secondaryMuscles: (MuscleGroup | string)[]; // Allow string for flexibility
  muscleMap: Record<string, MuscleInvolvement>;
  instructions: string;
  searchAliases?: string; // Comma-separated alternate search terms
  videoUrl?: string;
  imageUrl?: string;
  bodyweightMultiplier?: number; // Percentage of bodyweight (0.64 for push-ups, 1.0 for pull-ups, etc.)
  isCustom: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExerciseSearchParams {
  query?: string;
  category?: MuscleGroup;
  equipment?: Equipment;
  difficulty?: Difficulty;
  movementType?: MovementType;
  isCustom?: boolean;
  sortBy?: 'name' | 'popularity' | 'difficulty';
  sortOrder?: 'asc' | 'desc';
}
