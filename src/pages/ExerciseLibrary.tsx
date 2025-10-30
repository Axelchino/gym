import { Search, Filter } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { exerciseService } from '../services/exerciseService';
import type { Exercise } from '../types/exercise';
import { searchExercises, type SearchFilters } from '../utils/searchEngine';

export function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  useEffect(() => {
    async function loadExercises() {
      try {
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
        <div className="text-gray-400">Loading exercises...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Exercise Library</h1>
        <p className="text-gray-400">{exercises.length} exercises available</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-blue transition-colors"
          />
        </div>
        <button className="btn-secondary px-4">
          <Filter size={20} />
        </button>
      </div>

      {/* Exercise Results */}
      {filteredExercises.length > 0 && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExercises.map((exercise) => (
              <div key={exercise.id} className="card hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{exercise.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      exercise.difficulty === 'Beginner'
                        ? 'bg-primary-green/20 text-primary-green'
                        : exercise.difficulty === 'Intermediate'
                          ? 'bg-primary-yellow/20 text-primary-yellow'
                          : 'bg-primary-red/20 text-primary-red'
                    }`}
                  >
                    {exercise.difficulty}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">
                  <span className="text-primary-blue">{exercise.category}</span> • {exercise.equipment}
                </p>
                <div className="space-y-1 mt-2">
                  {exercise.primaryMuscles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exercise.primaryMuscles.map((muscle) => (
                        <span key={muscle} className="text-xs bg-primary-blue/20 text-primary-blue px-2 py-1 rounded font-medium">
                          {muscle}
                        </span>
                      ))}
                    </div>
                  )}
                  {exercise.secondaryMuscles.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exercise.secondaryMuscles.map((muscle) => (
                        <span key={muscle} className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-400">
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
        <div className="card text-center py-12 text-gray-400">
          <p>No exercises found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
