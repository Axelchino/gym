export type TrainingGoal = 'strength' | 'hypertrophy' | 'endurance' | 'general';
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type UnitSystem = 'metric' | 'imperial';
export type Sex = 'male' | 'female' | 'prefer-not-to-say';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  age?: number;
  sex?: Sex;
  height?: number;
  startingWeight?: number;
  currentWeight?: number;
  goal: TrainingGoal;
  experienceLevel: ExperienceLevel;
  unitPreference: UnitSystem;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BodyMeasurement {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFatPercentage?: number;
  neck?: number;
  chest?: number;
  leftArm?: number;
  rightArm?: number;
  waist?: number;
  hips?: number;
  leftThigh?: number;
  rightThigh?: number;
  leftCalf?: number;
  rightCalf?: number;
  notes?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'workout' | 'volume' | 'streak' | 'pr' | 'strength';
  requirement: number;
  iconUrl?: string;
  unlockedAt?: Date;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoSync: boolean;
  defaultRestTimer: number; // seconds
  playSounds: boolean;
}
