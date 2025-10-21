import { Check, X } from 'lucide-react';
import type { Set } from '../types/workout';

interface SetRowProps {
  set: Set;
  onUpdate: (updates: Partial<Set>) => void;
  onDelete: () => void;
  isPreviousSet?: boolean;
  weightUnit?: string;
  previousSet?: Set; // Previous workout data for this set number
}

export function SetRow({ set, onUpdate, onDelete, isPreviousSet = false, weightUnit = 'kg', previousSet }: SetRowProps) {
  // Determine set type for display and styling
  const setType = set.isWarmup ? 'W' : set.isFailure ? 'UF' : 'N';
  const borderColor = set.isWarmup
    ? 'border-l-4 border-l-orange-500'
    : set.isFailure
    ? 'border-l-4 border-l-red-500'
    : 'border-l-4 border-l-blue-500';

  const setTypeColor = set.isWarmup
    ? 'text-orange-400 bg-orange-500/10'
    : set.isFailure
    ? 'text-red-400 bg-red-500/10'
    : 'text-blue-400 bg-blue-500/10';

  return (
    <div
      className={`grid grid-cols-[minmax(2.5rem,auto),minmax(2rem,auto),minmax(4rem,1fr),minmax(4rem,1fr),minmax(3.5rem,1fr),minmax(2.5rem,auto),minmax(2.5rem,auto)] gap-1.5 sm:gap-2 items-center p-2 rounded ${borderColor} ${
        set.completed
          ? 'bg-primary-blue/10 border border-primary-blue/30'
          : isPreviousSet
          ? 'bg-gray-800/50 border border-gray-700'
          : 'bg-gray-800 border border-gray-700'
      }`}
    >
      {/* Set Type Indicator - Click to cycle through types */}
      {!isPreviousSet ? (
        <button
          onClick={() => {
            // Cycle: Warmup -> Normal -> Failure -> Warmup
            if (set.isWarmup) {
              onUpdate({ isWarmup: false, isFailure: false, isUserInput: true, completed: true });
            } else if (!set.isWarmup && !set.isFailure) {
              onUpdate({ isWarmup: false, isFailure: true, isUserInput: true, completed: true });
            } else if (set.isFailure) {
              onUpdate({ isWarmup: true, isFailure: false, isUserInput: true, completed: true });
            }
          }}
          className={`w-full h-8 flex items-center justify-center rounded text-xs font-bold ${setTypeColor} hover:opacity-80 transition-opacity cursor-pointer`}
          title={`Set Type: ${set.isWarmup ? 'Warmup' : set.isFailure ? 'Until Failure' : 'Normal'} (click to change)`}
        >
          {setType}
        </button>
      ) : (
        <div className={`w-full h-8 flex items-center justify-center rounded text-xs font-bold ${setTypeColor} opacity-50`}>
          {setType}
        </div>
      )}

      {/* Set Number */}
      <div className="w-full text-center font-semibold text-gray-400 text-sm sm:text-base">
        {set.setNumber}
      </div>

      {/* Weight - Apple style with previous value */}
      <div className="relative">
        <input
          type="number"
          value={set.weight || ''}
          onChange={(e) => {
            const newWeight = parseFloat(e.target.value) || 0;
            // Auto-check if both weight and reps will be filled
            const shouldComplete = newWeight > 0 && set.reps > 0;
            onUpdate({ weight: newWeight, isUserInput: true, completed: shouldComplete });
          }}
          onFocus={(e) => {
            e.target.select();
            // Only auto-complete if this is pre-filled data (isUserInput === false)
            // Don't auto-complete for brand new sets (isUserInput === undefined)
            if (set.isUserInput === false) {
              onUpdate({ isUserInput: true, completed: true });
            }
          }}
          placeholder={weightUnit}
          disabled={isPreviousSet}
          className={`w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-center text-sm sm:text-base ${
            isPreviousSet ? 'text-gray-500' : set.isUserInput ? 'text-white' : 'text-gray-500'
          } focus:outline-none focus:border-primary-blue focus:text-white`}
        />
      </div>

      {/* Reps - Apple style with previous value */}
      <div className="relative">
        <input
          type="number"
          value={set.reps || ''}
          onChange={(e) => {
            const newReps = parseInt(e.target.value) || 0;
            // Auto-check if both weight and reps will be filled
            const shouldComplete = set.weight > 0 && newReps > 0;
            onUpdate({ reps: newReps, isUserInput: true, completed: shouldComplete });
          }}
          onFocus={(e) => {
            e.target.select();
            // Only auto-complete if this is pre-filled data (isUserInput === false)
            // Don't auto-complete for brand new sets (isUserInput === undefined)
            if (set.isUserInput === false) {
              onUpdate({ isUserInput: true, completed: true });
            }
          }}
          placeholder="reps"
          disabled={isPreviousSet}
          className={`w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-center text-sm sm:text-base ${
            isPreviousSet ? 'text-gray-500' : set.isUserInput ? 'text-white' : 'text-gray-500'
          } focus:outline-none focus:border-primary-blue focus:text-white`}
        />
      </div>

      {/* RIR - Apple style with previous value */}
      <div className="relative">
        <input
          type="number"
          value={set.rir ?? ''}
          onChange={(e) => onUpdate({ rir: parseInt(e.target.value) || undefined, isUserInput: true, completed: true })}
          onFocus={(e) => {
            e.target.select();
            if (!set.isUserInput) {
              onUpdate({ isUserInput: true, completed: true });
            }
          }}
          placeholder="RIR"
          disabled={isPreviousSet}
          className={`w-full bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-center text-xs sm:text-sm ${
            isPreviousSet ? 'text-gray-500' : set.isUserInput ? 'text-white' : 'text-gray-500'
          } focus:outline-none focus:border-primary-blue focus:text-white`}
        />
      </div>

      {/* Complete Button */}
      {!isPreviousSet && (
        <button
          onClick={() => onUpdate({ completed: !set.completed, isUserInput: true })}
          className={`w-full h-8 flex items-center justify-center rounded transition-colors ${
            set.completed
              ? 'bg-primary-green text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title="Mark as complete"
        >
          <Check size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      )}

      {/* Delete Button */}
      {!isPreviousSet && (
        <button
          onClick={onDelete}
          className="w-full h-8 flex items-center justify-center rounded bg-gray-700 text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          title="Delete set"
        >
          <X size={16} className="sm:w-[18px] sm:h-[18px]" />
        </button>
      )}

      {isPreviousSet && (
        <>
          <div className="text-xs text-gray-500 text-center">Prev</div>
          <div></div>
        </>
      )}
    </div>
  );
}
