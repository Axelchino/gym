import { useState, useEffect, useMemo } from 'react';
import { Search, X, Dumbbell } from 'lucide-react';
import type { Exercise } from '../types/exercise';
import { db } from '../services/database';
import { searchExercises } from '../utils/searchEngine';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  async function loadExercises() {
    setIsLoading(true);
    const allExercises = await db.exercises.toArray();
    setExercises(allExercises);
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
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Exercise</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, muscle, or equipment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-primary-blue"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">Loading exercises...</div>
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p>No exercises found</p>
              <p className="text-sm mt-2">Try a different search term</p>
            </div>
          ) : (
            filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => handleSelect(exercise)}
                className="w-full text-left p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{exercise.name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {exercise.primaryMuscles.slice(0, 2).map((muscle) => (
                        <span
                          key={muscle}
                          className="text-xs bg-primary-blue/20 text-primary-blue px-2 py-1 rounded"
                        >
                          {muscle}
                        </span>
                      ))}
                      <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                        {exercise.equipment}
                      </span>
                      <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">
                        {exercise.movementType}
                      </span>
                    </div>
                  </div>
                  <Dumbbell size={20} className="text-gray-500 flex-shrink-0" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
