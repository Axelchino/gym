import { Check, X } from 'lucide-react';
import type { Set } from '../types/workout';

interface SetRowProps {
  set: Set;
  onUpdate: (updates: Partial<Set>) => void;
  onDelete: () => void;
  isPreviousSet?: boolean;
  weightUnit?: string;
}

export function SetRow({ set, onUpdate, onDelete, isPreviousSet = false, weightUnit = 'kg' }: SetRowProps) {
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
      className={`grid grid-cols-[auto,auto,1fr,1fr,1fr,auto,auto] gap-2 items-center p-2 rounded ${borderColor} ${
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
              onUpdate({ isWarmup: false, isFailure: false });
            } else if (!set.isWarmup && !set.isFailure) {
              onUpdate({ isWarmup: false, isFailure: true });
            } else if (set.isFailure) {
              onUpdate({ isWarmup: true, isFailure: false });
            }
          }}
          className={`w-10 h-8 flex items-center justify-center rounded text-xs font-bold ${setTypeColor} hover:opacity-80 transition-opacity cursor-pointer`}
          title={`Set Type: ${set.isWarmup ? 'Warmup' : set.isFailure ? 'Until Failure' : 'Normal'} (click to change)`}
        >
          {setType}
        </button>
      ) : (
        <div className={`w-10 h-8 flex items-center justify-center rounded text-xs font-bold ${setTypeColor} opacity-50`}>
          {setType}
        </div>
      )}

      {/* Set Number */}
      <div className="w-8 text-center font-semibold text-gray-400">
        {set.setNumber}
      </div>

      {/* Weight */}
      <input
        type="number"
        value={set.weight || ''}
        onChange={(e) => onUpdate({ weight: parseFloat(e.target.value) || 0 })}
        placeholder={weightUnit}
        disabled={isPreviousSet}
        className={`bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-center ${
          isPreviousSet ? 'text-gray-500' : 'text-white'
        } focus:outline-none focus:border-primary-blue`}
      />

      {/* Reps */}
      <input
        type="number"
        value={set.reps || ''}
        onChange={(e) => onUpdate({ reps: parseInt(e.target.value) || 0 })}
        placeholder="reps"
        disabled={isPreviousSet}
        className={`bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-center ${
          isPreviousSet ? 'text-gray-500' : 'text-white'
        } focus:outline-none focus:border-primary-blue`}
      />

      {/* RIR (Reps in Reserve) */}
      <input
        type="number"
        value={set.rir ?? ''}
        onChange={(e) => onUpdate({ rir: parseInt(e.target.value) || undefined })}
        placeholder="RIR"
        disabled={isPreviousSet}
        className={`bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-center text-sm ${
          isPreviousSet ? 'text-gray-500' : 'text-white'
        } focus:outline-none focus:border-primary-blue`}
      />

      {/* Complete Button */}
      {!isPreviousSet && (
        <button
          onClick={() => onUpdate({ completed: !set.completed })}
          className={`p-2 rounded transition-colors ${
            set.completed
              ? 'bg-primary-green text-white'
              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
          }`}
          title="Mark as complete"
        >
          <Check size={18} />
        </button>
      )}

      {/* Delete Button */}
      {!isPreviousSet && (
        <button
          onClick={onDelete}
          className="p-2 rounded bg-gray-700 text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          title="Delete set"
        >
          <X size={18} />
        </button>
      )}

      {isPreviousSet && (
        <>
          <div className="text-xs text-gray-500 text-center">Previous</div>
          <div></div>
        </>
      )}
    </div>
  );
}
