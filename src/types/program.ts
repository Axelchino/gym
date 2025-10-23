import type { WorkoutTemplate } from './workout';
import type { TrainingGoal } from './user';

export interface ProgramWeek {
  weekNumber: number;
  name?: string; // e.g., "Deload Week", "Peak Week"
  workouts: WorkoutTemplate[];
  notes?: string;
}

export interface Program {
  id: string;
  userId: string;
  name: string;
  description: string;
  duration: number; // weeks
  daysPerWeek: number;
  weeks: ProgramWeek[];
  goal: TrainingGoal;
  isActive: boolean;
  startDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramProgress {
  programId: string;
  currentWeek: number;
  completedWorkouts: number;
  totalWorkouts: number;
  adherenceRate: number; // percentage
  startedAt: Date;
  lastWorkoutDate?: Date;
}
