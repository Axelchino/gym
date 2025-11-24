/**
 * Muscle Cache
 *
 * Caches exercise → muscle mappings for fast lookup at workout save time.
 * This avoids storing duplicate muscle data in every workout log.
 */

import { exerciseService } from '../services/exerciseService';

// Lightweight map: exerciseId → muscle arrays
const muscleMap: Map<string, { primary: string[], secondary: string[] }> = new Map();
// Also map by name (lowercase) for fallback lookups
const muscleMapByName: Map<string, { primary: string[], secondary: string[] }> = new Map();
let isInitialized = false;

/**
 * Build muscle cache from exercises database
 * Call this once at app startup or on first workout save
 */
export async function initMuscleCache(): Promise<void> {
  if (isInitialized) return;

  try {
    const exercises = await exerciseService.getAll();

    for (const ex of exercises) {
      const muscleData = {
        primary: ex.primaryMuscles || [],
        secondary: ex.secondaryMuscles || []
      };

      // Map by ID
      muscleMap.set(ex.id, muscleData);

      // Also map by name (lowercase for case-insensitive lookup)
      muscleMapByName.set(ex.name.toLowerCase(), muscleData);
    }

    isInitialized = true;
    console.log(`✅ Muscle cache initialized: ${muscleMap.size} exercises`);
  } catch (error) {
    console.error('Failed to initialize muscle cache:', error);
    throw error;
  }
}

/**
 * Get muscles for an exercise (instant, sync lookup)
 * First tries by ID, then falls back to name lookup
 * Returns undefined if exercise not found (custom exercise without muscle data)
 */
export function getMuscles(exerciseId: string, exerciseName?: string): { primary: string[], secondary: string[] } | undefined {
  // Try by ID first
  const byId = muscleMap.get(exerciseId);
  if (byId) return byId;

  // Fallback: try by name (case-insensitive)
  if (exerciseName) {
    return muscleMapByName.get(exerciseName.toLowerCase());
  }

  return undefined;
}

/**
 * Check if cache is initialized
 */
export function isCacheReady(): boolean {
  return isInitialized;
}

/**
 * Get cache size (for debugging)
 */
export function getCacheSize(): number {
  return muscleMap.size;
}
