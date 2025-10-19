import { Play, Pause, RotateCcw, FastForward, Plus, Minus } from 'lucide-react';
import { useRestTimer } from '../hooks/useRestTimer';

export function RestTimer() {
  const {
    isRunning,
    timeRemaining,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    addTime,
  } = useRestTimer(90);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed bottom-20 right-4 bg-gray-900 border-2 border-gray-700 rounded-lg p-4 shadow-xl z-40">
      <div className="text-center mb-3">
        <p className="text-xs text-gray-400 mb-1">Rest Timer</p>
        <p className={`text-3xl font-bold ${timeRemaining <= 10 && isRunning ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
      </div>

      {/* Time Adjustment */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => addTime(-15)}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded px-2 py-1.5 text-xs transition-colors"
        >
          <Minus size={14} className="inline mr-1" />
          15s
        </button>
        <button
          onClick={() => addTime(15)}
          className="flex-1 bg-gray-800 hover:bg-gray-700 text-white rounded px-2 py-1.5 text-xs transition-colors"
        >
          <Plus size={14} className="inline mr-1" />
          15s
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <button
            onClick={() => startTimer()}
            className="flex-1 bg-primary-blue hover:bg-primary-blue/80 text-white rounded px-3 py-2 flex items-center justify-center gap-1 transition-colors"
          >
            <Play size={16} />
            Start
          </button>
        ) : (
          <button
            onClick={pauseTimer}
            className="flex-1 bg-primary-yellow hover:bg-primary-yellow/80 text-white rounded px-3 py-2 flex items-center justify-center gap-1 transition-colors"
          >
            <Pause size={16} />
            Pause
          </button>
        )}
        <button
          onClick={resetTimer}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded px-3 py-2 transition-colors"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={skipTimer}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded px-3 py-2 transition-colors"
          title="Skip"
        >
          <FastForward size={16} />
        </button>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <button
          onClick={() => startTimer(60)}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded px-2 py-1.5 text-xs transition-colors"
        >
          1:00
        </button>
        <button
          onClick={() => startTimer(90)}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded px-2 py-1.5 text-xs transition-colors"
        >
          1:30
        </button>
        <button
          onClick={() => startTimer(120)}
          className="bg-gray-800 hover:bg-gray-700 text-white rounded px-2 py-1.5 text-xs transition-colors"
        >
          2:00
        </button>
      </div>
    </div>
  );
}
