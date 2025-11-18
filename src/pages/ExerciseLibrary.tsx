import { Search, Filter, X } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { exerciseService } from '../services/exerciseService';
import type { Exercise, Difficulty, Equipment, MuscleGroup } from '../types/exercise';
import { searchExercises, type SearchFilters } from '../utils/searchEngine';
import { initializeDatabase } from '../services/initializeDatabase';

function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    async function loadExercises() {
      try {
        // Initialize database ONLY when ExerciseLibrary is loaded (lazy load 712KB JSON)
        await initializeDatabase();

        const allExercises = await exerciseService.getAll();
        setExercises(allExercises);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load exercises:', error);
        setLoading(false);
      }
    }
    loadExercises();
  }, []);

  // Use unified search engine with memoization for performance
  const searchResults = useMemo(
    () => searchExercises(exercises, searchTerm, filters),
    [exercises, searchTerm, filters]
  );

  const filteredExercises = searchResults.map(r => r.exercise);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-secondary">Loading exercises...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2 text-primary">Exercise Library</h1>
        <p className="text-sm text-secondary">{exercises.length} exercises available</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
            size={20}
          />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg pl-10 pr-4 py-3 focus:outline-none transition-all text-primary"
            style={{
              backgroundColor: 'var(--surface-accent)',
              border: '1px solid var(--border-subtle)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = '0 0 0 2px rgba(180, 130, 255, 0.4)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
        <button
          onClick={() => setShowFilterModal(true)}
          className="px-4 py-2 rounded-lg transition-colors relative"
          style={{
            backgroundColor: Object.keys(filters).length > 0 ? 'rgba(180, 130, 255, 0.2)' : 'var(--surface-accent)',
            border: Object.keys(filters).length > 0 ? '1px solid #B482FF' : '1px solid var(--border-subtle)',
            color: Object.keys(filters).length > 0 ? '#B482FF' : 'var(--text-secondary)'
          }}
          onMouseEnter={(e) => {
            if (Object.keys(filters).length === 0) {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (Object.keys(filters).length === 0) {
              e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
            }
          }}
        >
          <Filter size={20} />
          {Object.keys(filters).length > 0 && (
            <span
              className="absolute -top-1 -right-1 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
              style={{
                backgroundColor: '#B482FF',
                color: 'white'
              }}
            >
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>

      {/* Exercise Results */}
      {filteredExercises.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id}
                className="card-elevated transition-all cursor-pointer"
                style={{
                  border: '1px solid var(--border-subtle)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-hover)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-primary">{exercise.name}</h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: exercise.difficulty === 'Beginner'
                        ? '#BBF7D0'  // Green (easy)
                        : exercise.difficulty === 'Intermediate'
                          ? '#FEF08A'  // Yellow (medium)
                          : '#FCA5A5',  // Red (hard)
                      color: '#111216'
                    }}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-sm text-secondary mb-2">
                  {exercise.category.charAt(0).toUpperCase() + exercise.category.slice(1)} • {exercise.equipment.charAt(0).toUpperCase() + exercise.equipment.slice(1)}
                </p>
                <div className="space-y-1 mt-2">
                  {exercise.primaryMuscles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exercise.primaryMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{
                            backgroundColor: 'rgba(180, 130, 255, 0.2)',
                            color: '#B482FF',
                            border: '1px solid rgba(180, 130, 255, 0.4)'
                          }}
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  )}
                  {exercise.secondaryMuscles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondaryMuscles.map((muscle) => (
                        <span
                          key={muscle}
                          className="text-xs px-2 py-1 rounded"
                          style={{
                            backgroundColor: 'var(--surface-accent)',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border-subtle)'
                          }}
                        >
                          {muscle}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredExercises.length === 0 && (
        <div
          className="card-elevated text-center py-12"
          style={{
            border: '2px dashed var(--border-subtle)'
          }}
        >
          <p className="text-secondary">No exercises found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div
            className="rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <h2 className="text-2xl font-bold text-primary">Filter Exercises</h2>
              <button
                onClick={() => setShowFilterModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--surface-accent)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Options */}
            <div className="p-6 space-y-6">
              {/* Muscle Groups */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Muscle Groups</label>
                <div className="flex flex-wrap gap-2">
                  {(['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms', 'Abs', 'Obliques', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Traps', 'Lats', 'Lower Back', 'Neck', 'Hip Flexors', 'Adductors', 'Full Body'] as MuscleGroup[]).map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => {
                        setFilters(prev => {
                          const currentMuscles = prev.muscleGroups || [];
                          const hasMuscle = currentMuscles.includes(muscle);
                          return {
                            ...prev,
                            muscleGroups: hasMuscle
                              ? currentMuscles.filter(m => m !== muscle)
                              : [...currentMuscles, muscle]
                          };
                        });
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: filters.muscleGroups?.includes(muscle) ? '#EDE0FF' : 'var(--surface-accent)',
                        color: filters.muscleGroups?.includes(muscle) ? '#7E29FF' : 'var(--text-secondary)',
                        border: filters.muscleGroups?.includes(muscle) ? '1px solid #D7BDFF' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as Difficulty[]).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => {
                        setFilters(prev => {
                          const currentDiff = prev.difficulty || [];
                          const hasDiff = currentDiff.includes(diff);
                          return {
                            ...prev,
                            difficulty: hasDiff
                              ? currentDiff.filter(d => d !== diff)
                              : [...currentDiff, diff]
                          };
                        });
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: filters.difficulty?.includes(diff) ? '#EDE0FF' : 'var(--surface-accent)',
                        color: filters.difficulty?.includes(diff) ? '#7E29FF' : 'var(--text-secondary)',
                        border: filters.difficulty?.includes(diff) ? '1px solid #D7BDFF' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment */}
              <div>
                <label className="block text-sm font-medium text-primary mb-2">Equipment</label>
                <div className="flex flex-wrap gap-2">
                  {(['Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell'] as Equipment[]).map((equip) => (
                    <button
                      key={equip}
                      onClick={() => {
                        setFilters(prev => {
                          const currentEquip = prev.equipment || [];
                          const hasEquip = currentEquip.includes(equip);
                          return {
                            ...prev,
                            equipment: hasEquip
                              ? currentEquip.filter(e => e !== equip)
                              : [...currentEquip, equip]
                          };
                        });
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: filters.equipment?.includes(equip) ? '#EDE0FF' : 'var(--surface-accent)',
                        color: filters.equipment?.includes(equip) ? '#7E29FF' : 'var(--text-secondary)',
                        border: filters.equipment?.includes(equip) ? '1px solid #D7BDFF' : '1px solid var(--border-subtle)'
                      }}
                    >
                      {equip}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex gap-3 p-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => {
                  setFilters({});
                  setShowFilterModal(false);
                }}
                className="flex-1 py-2 rounded-md font-semibold transition-all"
                style={{
                  backgroundColor: 'var(--surface-accent)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surface-accent)';
                }}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="flex-1 py-2 rounded-md font-semibold transition-all"
                style={{
                  backgroundColor: '#EDE0FF',
                  color: '#7E29FF',
                  border: '1px solid #D7BDFF'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E4D2FF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EDE0FF';
                }}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExerciseLibrary;
