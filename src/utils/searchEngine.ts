import type { Exercise } from '../types/exercise';

// Filters interface
export interface SearchFilters {
  muscleGroups?: string[];
  equipment?: string[];
  difficulty?: string[];
  category?: string[];
}

// Search result with score
export interface SearchResult {
  exercise: Exercise;
  score: number;
  matchType: 'exact' | 'fuzzy' | 'alias' | 'idle';
}

/**
 * Levenshtein distance - measures difference between two strings
 * Used for typo tolerance (e.g., "banch" → "bench")
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
 * Fuzzy match with Levenshtein distance
 * Returns score: 1.0 (exact) → 0.9 (1 edit) → 0.7 (2 edits) → 0 (too different)
 */
function fuzzyMatch(query: string, target: string, maxDistance = 2): number {
  const distance = levenshteinDistance(query.toLowerCase(), target.toLowerCase());

  if (distance === 0) return 1.0;  // Exact match
  if (distance === 1) return 0.9;  // Very close (1 typo)
  if (distance === 2) return 0.7;  // Close (2 typos)
  return 0;                         // Too different
}

/**
 * Stem word - remove common suffixes for plural/tense matching
 * "presses" → "press", "flies" → "fly", "pressing" → "press"
 */
function stem(word: string): string {
  const lower = word.toLowerCase();

  if (lower.endsWith('ies') && lower.length > 4) {
    return lower.slice(0, -3) + 'y';  // flies → fly
  }
  if (lower.endsWith('es') && lower.length > 3) {
    return lower.slice(0, -2);  // presses → press
  }
  if (lower.endsWith('s') && lower.length > 2) {
    return lower.slice(0, -1);  // rows → row
  }
  if (lower.endsWith('ing') && lower.length > 4) {
    return lower.slice(0, -3);  // pressing → press
  }

  return lower;
}

/**
 * Main search function - ONE source of truth for all exercise search
 *
 * Features:
 * - Idle ranks: No query = sort by popularity
 * - Fuzzy matching: Typo tolerance up to 2 characters
 * - Search aliases: "db row" finds "dumbbell row"
 * - Stemming: "press" matches "presses"
 * - Multi-field: Name, muscles, equipment, category
 * - Relevance scoring: Weighted by field importance
 * - Filters: Muscle groups, equipment, difficulty
 */
export function searchExercises(
  exercises: Exercise[],
  query: string,
  filters?: SearchFilters
): SearchResult[] {
  // IDLE RANKS: No search = show by popularity
  if (!query || !query.trim()) {
    const idleResults = exercises
      .map(ex => ({
        exercise: ex,
        score: ex.popularityRank || 0,
        matchType: 'idle' as const
      }))
      .sort((a, b) => b.score - a.score);

    return filters ? applyFilters(idleResults, filters) : idleResults;
  }

  // Tokenize and stem query
  const terms = query.toLowerCase().split(/\s+/).map(stem).filter(Boolean);

  // Detect equipment keywords in query for precision boosting (with fuzzy tolerance)
  const equipmentKeywords = ['machine', 'cable', 'barbell', 'dumbbell', 'kettlebell', 'band', 'bodyweight', 'ez-bar'];
  const hasEquipmentInQuery = terms.some(term =>
    equipmentKeywords.some(eq => {
      // Exact or substring match
      if (eq.includes(term) || term.includes(eq)) return true;
      // Fuzzy match for typos (e.g., "dumbell" → "dumbbell")
      return fuzzyMatch(term, eq) >= 0.7;
    })
  );

  const results: SearchResult[] = [];

  for (const exercise of exercises) {
    let score = 0;
    let matchType: 'exact' | 'fuzzy' | 'alias' = 'exact';

    const exerciseName = exercise.name.toLowerCase();
    const exerciseWords = exerciseName.split(/\s+/);
    const aliases = (exercise.searchAliases || '').toLowerCase();
    const primaryMuscles = exercise.primaryMuscles.map(m => m.toLowerCase());
    const secondaryMuscles = exercise.secondaryMuscles.map(m => m.toLowerCase());
    const category = exercise.category.toLowerCase();
    const equipment = exercise.equipment.toLowerCase();

    let equipmentMatched = false;

    for (const term of terms) {
      // 1. EXACT NAME MATCH (3x weight = 30 points)
      if (exerciseName.includes(term)) {
        score += 30;

        // Bonus: name starts with query
        if (exerciseName.startsWith(term)) {
          score += 15;
        }
      }

      // 2. SEARCH ALIASES (2.5x weight = 25 points)
      if (aliases.includes(term)) {
        score += 25;
        matchType = 'alias';
      }

      // 3. FUZZY NAME MATCH (typo tolerance, 2x weight base)
      let bestFuzzyScore = 0;
      for (const word of exerciseWords) {
        const fuzzyScore = fuzzyMatch(term, word);
        if (fuzzyScore > bestFuzzyScore) {
          bestFuzzyScore = fuzzyScore;
        }
      }
      if (bestFuzzyScore > 0.6) {
        score += bestFuzzyScore * 20;  // Up to 20 points
        if (bestFuzzyScore < 1.0) {
          matchType = 'fuzzy';
        }
      }

      // 4. PRIMARY MUSCLES (2x weight = 20 points)
      for (const muscle of primaryMuscles) {
        if (muscle.includes(term)) {
          score += 20;
        }
      }

      // 5. CATEGORY (1.5x weight = 15 points)
      if (category.includes(term)) {
        score += 15;
      }

      // 6. EQUIPMENT (3x weight when equipment in query = 30 points, else 10)
      if (equipment.includes(term)) {
        // If user searches equipment term, prioritize equipment matches heavily
        score += hasEquipmentInQuery ? 30 : 10;
        equipmentMatched = true;
      } else {
        // Check fuzzy match for equipment typos (e.g., "dumbell" → "dumbbell")
        const equipmentWords = equipment.split(/[\s-]+/);
        for (const eqWord of equipmentWords) {
          const fuzzyScore = fuzzyMatch(term, eqWord);
          if (fuzzyScore >= 0.7) {
            score += hasEquipmentInQuery ? (fuzzyScore * 30) : 10;
            equipmentMatched = true;
            break;
          }
        }
      }

      // 7. SECONDARY MUSCLES (0.5x weight = 5 points)
      for (const muscle of secondaryMuscles) {
        if (muscle.includes(term)) {
          score += 5;
        }
      }
    }

    // PRECISION PENALTY: If query has equipment keyword but exercise doesn't match, penalize
    if (hasEquipmentInQuery && !equipmentMatched) {
      score = score * 0.5; // 50% penalty for wrong equipment
    }

    // Bonus: All query terms matched
    if (score > 0 && terms.length > 1) {
      score += 20;
    }

    // Add popularity boost - SUBTLE tiebreaker only (max 3.5 points)
    // User intent >> popularity when searching
    const popularityBoost = (exercise.popularityRank || 0) * 0.003;
    score += popularityBoost;

    // Only include if matched
    if (score > 0) {
      results.push({ exercise, score, matchType });
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  // Apply filters
  return filters ? applyFilters(results, filters) : results;
}

/**
 * Apply filters to search results
 */
function applyFilters(
  results: SearchResult[],
  filters: SearchFilters
): SearchResult[] {
  return results.filter(({ exercise }) => {
    // Muscle group filter (AND logic - exercise must work ALL selected muscles)
    if (filters.muscleGroups && filters.muscleGroups.length > 0) {
      const hasAllMuscles = filters.muscleGroups.every(muscle => {
        const muscleLower = muscle.toLowerCase();
        return exercise.primaryMuscles.some(m => m.toLowerCase().includes(muscleLower)) ||
               exercise.secondaryMuscles.some(m => m.toLowerCase().includes(muscleLower));
      });
      if (!hasAllMuscles) return false;
    }

    // Equipment filter (OR logic)
    if (filters.equipment && filters.equipment.length > 0) {
      const hasMatch = filters.equipment.some(equip =>
        exercise.equipment.toLowerCase().includes(equip.toLowerCase())
      );
      if (!hasMatch) return false;
    }

    // Difficulty filter (exact match)
    if (filters.difficulty && filters.difficulty.length > 0) {
      if (!filters.difficulty.includes(exercise.difficulty)) {
        return false;
      }
    }

    // Category filter (exact match)
    if (filters.category && filters.category.length > 0) {
      if (!filters.category.includes(exercise.category)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get unique filter options from exercises
 * Returns counts for each filter option
 */
export function getFilterOptions(exercises: Exercise[]) {
  const muscles = new Map<string, number>();
  const equipment = new Map<string, number>();
  const difficulty = new Map<string, number>();
  const category = new Map<string, number>();

  for (const exercise of exercises) {
    // Count muscle groups
    [...exercise.primaryMuscles, ...exercise.secondaryMuscles].forEach(muscle => {
      muscles.set(muscle, (muscles.get(muscle) || 0) + 1);
    });

    // Count equipment
    equipment.set(exercise.equipment, (equipment.get(exercise.equipment) || 0) + 1);

    // Count difficulty
    difficulty.set(exercise.difficulty, (difficulty.get(exercise.difficulty) || 0) + 1);

    // Count category
    category.set(exercise.category, (category.get(exercise.category) || 0) + 1);
  }

  return {
    muscles: Object.fromEntries(muscles),
    equipment: Object.fromEntries(equipment),
    difficulty: Object.fromEntries(difficulty),
    category: Object.fromEntries(category),
  };
}
