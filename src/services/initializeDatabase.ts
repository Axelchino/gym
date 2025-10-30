/**
 * Database Initialization Service
 *
 * Loads the exercise database from JSON into IndexedDB on first run.
 * Uses a flag in localStorage to track if initialization has occurred.
 */

import { db } from './database';
import exercisesData from '../data/exercises.json';
import type { Exercise } from '../types/exercise';

const INIT_FLAG_KEY = 'gym-tracker-db-initialized';
const DB_VERSION_KEY = 'gym-tracker-db-version';
const CURRENT_DB_VERSION = '1.0.0';

/**
 * Initialize the exercise database if not already done
 */
export async function initializeDatabase(): Promise<void> {
  try {
    console.log('🔧 Checking database initialization...');

    // Check if already initialized
    const isInitialized = localStorage.getItem(INIT_FLAG_KEY);
    const dbVersion = localStorage.getItem(DB_VERSION_KEY);

    if (isInitialized === 'true' && dbVersion === CURRENT_DB_VERSION) {
      const count = await db.exercises.count();
      console.log(`✓ Database already initialized with ${count} exercises`);
      return;
    }

    // Check if database has exercises (might have been initialized previously)
    const existingCount = await db.exercises.count();

    if (existingCount > 0) {
      console.log(`⚠️  Database has ${existingCount} exercises but flag not set`);
      console.log('   Marking as initialized...');
      localStorage.setItem(INIT_FLAG_KEY, 'true');
      localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);
      return;
    }

    // Initialize database with exercises
    console.log('📥 Loading exercise database...');
    console.log(`   Found ${exercisesData.length} exercises in JSON`);

    // Convert dates from ISO strings to Date objects
    const exercises: Exercise[] = exercisesData.map((ex: any) => ({
      ...ex,
      createdAt: new Date(ex.createdAt),
      updatedAt: new Date(ex.updatedAt)
    }));

    console.log('💾 Importing exercises into IndexedDB...');

    // Bulk add all exercises (preserves IDs from JSON)
    await db.exercises.bulkAdd(exercises);

    const finalCount = await db.exercises.count();
    console.log(`✓ Successfully imported ${finalCount} exercises`);

    // Set initialization flag
    localStorage.setItem(INIT_FLAG_KEY, 'true');
    localStorage.setItem(DB_VERSION_KEY, CURRENT_DB_VERSION);

    console.log('✓ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

/**
 * Force re-initialization (clears existing exercises)
 * Use with caution - this will delete all existing exercises!
 */
export async function reinitializeDatabase(): Promise<void> {
  console.warn('⚠️  Re-initializing database (clearing all exercises)...');

  // Clear exercises
  await db.exercises.clear();

  // Clear initialization flags
  localStorage.removeItem(INIT_FLAG_KEY);
  localStorage.removeItem(DB_VERSION_KEY);

  // Re-initialize
  await initializeDatabase();
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  const totalExercises = await db.exercises.count();
  const isInitialized = localStorage.getItem(INIT_FLAG_KEY) === 'true';
  const dbVersion = localStorage.getItem(DB_VERSION_KEY);

  // Get equipment breakdown
  const exercises = await db.exercises.toArray();
  const equipmentCounts = exercises.reduce((acc, ex) => {
    acc[ex.equipment] = (acc[ex.equipment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    isInitialized,
    dbVersion,
    totalExercises,
    equipmentBreakdown: equipmentCounts
  };
}
