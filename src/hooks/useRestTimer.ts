import { useState, useEffect, useCallback } from 'react';

export function useRestTimer(defaultRestSeconds: number = 90) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(defaultRestSeconds);
  const [targetRestTime, setTargetRestTime] = useState(defaultRestSeconds);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          // Play notification sound or vibrate (optional)
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = useCallback((seconds?: number) => {
    const restTime = seconds ?? targetRestTime;
    setTimeRemaining(restTime);
    setTargetRestTime(restTime);
    setIsRunning(true);
  }, [targetRestTime]);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(targetRestTime);
  }, [targetRestTime]);

  const skipTimer = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(0);
  }, []);

  const addTime = useCallback((seconds: number) => {
    setTimeRemaining(prev => Math.max(0, prev + seconds));
  }, []);

  return {
    isRunning,
    timeRemaining,
    targetRestTime,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    addTime,
  };
}
