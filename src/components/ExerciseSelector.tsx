import { useState, useEffect, useMemo } from 'react';
import { Search, X, Dumbbell } from 'lucide-react';
import type { Exercise } from '../types/exercise';
import { db } from '../services/database';
import { searchExercises } from '../utils/searchEngine';
import { useTheme } from '../contexts/ThemeContext';
import { getAccentColors } from '../utils/themeHelpers';
import { useAuth } from '../contexts/AuthContext';

// Demo mode exercises - only show these exercises to guests (names match exercises.json)
const DEMO_EXERCISE_NAMES = [
  'Bench Press',
  'Incline Dumbbell Press',
  'One Arm Triceps Pushdown',
  'Dumbbell Shoulder Press',
  'Deadlift',
  'Pull-Up',
  'Barbell Bent Over Row',
  'Dumbbell Curl',
  'Barbell Squat',
  'Leg Press',
  'Leg Curl',
  'Standing Barbell Calf Raise',
];

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const accentColors = getAccentColors(theme);
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, [user]);

  async function loadExercises() {
    setIsLoading(true);
    const allExercises = await db.exercises.toArray();

    // GUEST MODE: Only show demo exercises (data protection - prevent scraping full database)
    if (!user) {
      const demoExercises = allExercises.filter(ex =>
        DEMO_EXERCISE_NAMES.includes(ex.name)
      );
      setExercises(demoExercises);
    } else {
      // AUTHENTICATED: Show all exercises
      setExercises(allExercises);
    }

    setIsLoading(false);
  }

  // Use unified search engine with memoization for performance
  const searchResults = useMemo(
    () => searchExercises(exercises, searchQuery),
    [exercises, searchQuery]
  );

  // Limit results: 50 for idle, 100 for searches
  const filteredExercises = searchQuery.trim()
    ? searchResults.slice(0, 100).map(r => r.exercise)
    : searchResults.slice(0, 50).map(r => r.exercise);

  function handleSelect(exercise: Exercise) {
    onSelect(exercise);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col" style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-subtle)' }}>
        {/* Header */}
        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 className="text-xl font-bold text-primary">Add Exercise</h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} size={20} />
            <input
              type="text"
              placeholder="Search by name, muscle, or equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg pl-10 pr-4 py-3 focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--surface-accent)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(180, 130, 255, 0.4)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-secondary">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-secondary">
              <p>No exercises found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleSelect(exercise)}
                className="w-full text-left p-3 rounded-lg transition-all"
                style={{
                  backgroundColor: 'var(--surface-accent)',
                  border: '1px solid var(--border-subtle)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  e.currentTarget.style.borderColor = accentColors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-primary">{exercise.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exercise.primaryMuscles.slice(0, 2).map((muscle) => (
                        <span
                          key={muscle}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: theme === 'amoled' ? 'rgba(212, 160, 23, 0.2)' : 'rgba(180, 130, 255, 0.2)',
                            color: accentColors.primary,
                            border: theme === 'amoled' ? '1px solid rgba(212, 160, 23, 0.4)' : '1px solid rgba(180, 130, 255, 0.4)'
                          }}
                        >
                          {muscle}
                        </span>
                      ))}
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}>
                        {exercise.equipment}
                      </span>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'var(--surface-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                        {exercise.movementType}
                      </span>
                    </div>
                  </div>
                  <Dumbbell size={20} className="flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
