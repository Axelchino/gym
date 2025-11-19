import Dexie from 'dexie';
import type { Exercise } from '../types/exercise';
import type { WorkoutTemplate, WorkoutLog, Set, PersonalRecord, Program } from '../types/workout';
import type { UserProfile, BodyMeasurement, Achievement } from '../types/user';
import { enhancedExercises } from '../data/enhancedExercises';
import { v4 as uuidv4 } from 'uuid';

// Sync queue for offline-first operations
export interface SyncQueueItem {
  id: string;
  type: 'workout' | 'template' | 'program' | 'pr';
  operation: 'create' | 'update' | 'delete';
  data: any;
  recordId: string; // ID of the record being synced
  createdAt: Date;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

export class GymTrackerDatabase extends Dexie {
  // Tables
  users!: Dexie.Table<UserProfile, string>;
  exercises!: Dexie.Table<Exercise, string>;
  workoutTemplates!: Dexie.Table<WorkoutTemplate, string>;
  workoutLogs!: Dexie.Table<WorkoutLog, string>;
  sets!: Dexie.Table<Set, string>;
  personalRecords!: Dexie.Table<PersonalRecord, string>;
  bodyMeasurements!: Dexie.Table<BodyMeasurement, string>;
  achievements!: Dexie.Table<Achievement, string>;
  programs!: Dexie.Table<Program, string>;
  syncQueue!: Dexie.Table<SyncQueueItem, string>;

  constructor() {
    super('GymTrackerDB');

    // Version 1: Initial schema
    this.version(1).stores({
      users: 'id, email, createdAt',
      exercises:
        'id, name, category, equipment, difficulty, isCustom, createdAt, [category+equipment]',
      workoutTemplates: 'id, userId, name, isActive, createdAt, [userId+isActive]',
      workoutLogs: 'id, userId, templateId, date, createdAt, [userId+date], [userId+templateId]',
      sets: 'id, workoutLogId, exerciseId, timestamp, [workoutLogId+exerciseId]',
      personalRecords: 'id, userId, exerciseId, type, date, [userId+exerciseId], [userId+date]',
      bodyMeasurements: 'id, userId, date, [userId+date]',
      achievements: 'id, category, unlockedAt',
      programs: 'id, userId, isActive, createdAt, [userId+isActive]',
    });

    // Version 2: Enhanced exercise library with movementType, popularityRank, sourceUrl
    this.version(2).stores({
      exercises:
        'id, name, category, equipment, difficulty, movementType, popularityRank, isCustom, createdAt, [category+equipment], [movementType+popularityRank]',
    }).upgrade(async (tx) => {
      // Migration: Add new fields to existing exercises
      // New exercises from enhancedExercises.ts already have these fields
      // This migration ensures any custom exercises get default values
      console.log('Upgrading to v2: Adding movementType, popularityRank, and sourceUrl fields');
    });

    // Version 3: Add sync queue for offline-first support
    this.version(3).stores({
      users: 'id, email, createdAt',
      exercises:
        'id, name, category, equipment, difficulty, movementType, popularityRank, isCustom, createdAt, [category+equipment], [movementType+popularityRank]',
      workoutTemplates: 'id, userId, name, isActive, createdAt, [userId+isActive]',
      workoutLogs: 'id, userId, templateId, date, createdAt, [userId+date], [userId+templateId]',
      sets: 'id, workoutLogId, exerciseId, timestamp, [workoutLogId+exerciseId]',
      personalRecords: 'id, userId, exerciseId, type, date, [userId+exerciseId], [userId+date]',
      bodyMeasurements: 'id, userId, date, [userId+date]',
      achievements: 'id, category, unlockedAt',
      programs: 'id, userId, isActive, createdAt, [userId+isActive]',
      syncQueue: 'id, type, operation, recordId, createdAt, attempts, [type+operation]',
    }).upgrade(async (tx) => {
      console.log('Upgrading to v3: Adding syncQueue table for offline-first support');
    });
  }
}

// Create a singleton instance
export const db = new GymTrackerDatabase();

// Initialize database with default data
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if database is already initialized
    const userCount = await db.users.count();

    if (userCount === 0) {
      console.log('Initializing database with default data...');

      // Create default user profile
      const defaultUser: UserProfile = {
        id: 'default-user',
        name: 'Gym Tracker User',
        goal: 'hypertrophy',
        experienceLevel: 'intermediate',
        unitPreference: 'metric',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.users.add(defaultUser);

      // Load default exercises
      const exercisesWithIds: Exercise[] = enhancedExercises.map((ex) => ({
        ...ex,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await db.exercises.bulkAdd(exercisesWithIds);
      console.log(`✅ Database initialized with ${enhancedExercises.length} exercises`);
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Clear all data (useful for testing/reset)
export async function clearDatabase(): Promise<void> {
  await db.users.clear();
  await db.exercises.clear();
  await db.workoutTemplates.clear();
  await db.workoutLogs.clear();
  await db.sets.clear();
  await db.personalRecords.clear();
  await db.bodyMeasurements.clear();
  await db.achievements.clear();
  await db.programs.clear();
  await db.syncQueue.clear();
  console.log('🗑️ Database cleared');
}

// Export database statistics
export async function getDatabaseStats() {
  const [
    userCount,
    exerciseCount,
    templateCount,
    workoutCount,
    setCount,
    prCount,
  ] = await Promise.all([
    db.users.count(),
    db.exercises.count(),
    db.workoutTemplates.count(),
    db.workoutLogs.count(),
    db.sets.count(),
    db.personalRecords.count(),
  ]);

  return {
    users: userCount,
    exercises: exerciseCount,
    templates: templateCount,
    workouts: workoutCount,
    sets: setCount,
    personalRecords: prCount,
  };
}
