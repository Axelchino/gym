import type { Exercise } from '../types/exercise';

/**
 * Exercise Name Matching System
 *
 * Provides fuzzy matching for exercise names across:
 * - Builtin templates (e.g., "Barbell Bench Press")
 * - Database (e.g., "Bench Press")
 * - CSV imports (e.g., "bench press", "Banch Press")
 *
 * 4-Tier Matching Algorithm:
 * 1. Exact match (fastest)
 * 2. Normalized match (remove prefixes, lowercase)
 * 3. Partial/contains match (shortest match wins)
 * 4. Fuzzy match (Levenshtein distance for typos)
 */

// Common equipment prefixes to remove during normalization
const EQUIPMENT_PREFIXES = [
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'smith machine',
  'smith',
  'kettlebell',
  'resistance band',
  'band',
  'ez-bar',
  'ez bar',
  'trap bar',
];

/**
 * Normalize exercise name for matching
 * - Convert to lowercase
 * - Remove equipment prefixes
 * - Trim whitespace
 * - Collapse multiple spaces
 */
function normalizeExerciseName(name: string): string {
  let normalized = name.toLowerCase().trim();

  // Remove equipment prefixes
  for (const prefix of EQUIPMENT_PREFIXES) {
    if (normalized.startsWith(prefix + ' ')) {
      normalized = normalized.substring(prefix.length + 1);
    }
  }

  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Calculate Levenshtein distance between two strings
 * Measures minimum number of single-character edits needed
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Calculate distances
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find exercise by name using 4-tier fuzzy matching
 *
 * @param searchName - Exercise name to search for
 * @param allExercises - Array of all exercises to search through
 * @returns Matched exercise or null if no match found
 */
export function findExerciseByName(
  searchName: string,
  allExercises: Exercise[]
): Exercise | null {
  if (!searchName || !allExercises || allExercises.length === 0) {
    return null;
  }

  const searchLower = searchName.toLowerCase().trim();
  const searchNormalized = normalizeExerciseName(searchName);

  // TIER 1: Exact match (fastest path)
  for (const exercise of allExercises) {
    if (exercise.name.toLowerCase() === searchLower) {
      return exercise;
    }
  }

  // TIER 2: Normalized match
  for (const exercise of allExercises) {
    const exerciseNormalized = normalizeExerciseName(exercise.name);
    if (exerciseNormalized === searchNormalized) {
      return exercise;
    }
  }

  // TIER 3: Partial/contains match (collect candidates, score by length)
  const partialMatches: Array<{ exercise: Exercise; score: number }> = [];

  for (const exercise of allExercises) {
    const exerciseLower = exercise.name.toLowerCase();
    const exerciseNormalized = normalizeExerciseName(exercise.name);

    // Check if search term is contained in exercise name
    if (exerciseLower.includes(searchLower) || exerciseNormalized.includes(searchNormalized)) {
      // Score by length difference (shorter = more specific = better)
      const lengthDiff = Math.abs(exercise.name.length - searchName.length);
      const score = 80 / (lengthDiff + 1); // Higher score for closer length
      partialMatches.push({ exercise, score });
    }
  }

  // If we have partial matches, return the best one
  if (partialMatches.length > 0) {
    partialMatches.sort((a, b) => b.score - a.score);
    return partialMatches[0].exercise;
  }

  // TIER 4: Fuzzy match (typo tolerance via Levenshtein distance)
  const fuzzyMatches: Array<{ exercise: Exercise; distance: number; score: number }> = [];
  const maxDistance = 2; // Allow up to 2 character edits

  for (const exercise of allExercises) {
    const exerciseLower = exercise.name.toLowerCase();
    const exerciseNormalized = normalizeExerciseName(exercise.name);

    // Calculate distance for both original and normalized
    const distanceOriginal = levenshteinDistance(searchLower, exerciseLower);
    const distanceNormalized = levenshteinDistance(searchNormalized, exerciseNormalized);

    // Use the better (smaller) distance
    const distance = Math.min(distanceOriginal, distanceNormalized);

    if (distance <= maxDistance && distance > 0) {
      // Score: 100 - (distance * 10)
      // 1 edit = 90 points, 2 edits = 80 points
      const score = 100 - (distance * 10);
      fuzzyMatches.push({ exercise, distance, score });
    }
  }

  // If we have fuzzy matches, return the best one
  if (fuzzyMatches.length > 0) {
    fuzzyMatches.sort((a, b) => {
      // Sort by distance first (lower is better)
      if (a.distance !== b.distance) {
        return a.distance - b.distance;
      }
      // Then by score
      return b.score - a.score;
    });
    return fuzzyMatches[0].exercise;
  }

  // No match found
  return null;
}

/**
 * Batch match multiple exercise names to IDs
 * Useful for CSV imports and template processing
 *
 * @param exerciseNames - Array of exercise names to match
 * @param allExercises - Array of all exercises to search through
 * @returns Map of exercise name → exercise ID
 */
export function batchMatchExerciseNames(
  exerciseNames: string[],
  allExercises: Exercise[]
): Map<string, string> {
  const nameToIdMap = new Map<string, string>();

  for (const name of exerciseNames) {
    const match = findExerciseByName(name, allExercises);
    if (match) {
      nameToIdMap.set(name, match.id);
    } else {
      console.warn(`No exercise match found for: "${name}"`);
    }
  }

  return nameToIdMap;
}
