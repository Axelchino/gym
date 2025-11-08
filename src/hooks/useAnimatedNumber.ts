import { useEffect, useState } from 'react';

/**
 * Animates a number from 0 to target value
 * @param target - The target number to animate to
 * @param duration - Animation duration in milliseconds (default: 400ms)
 * @param enabled - Whether animation is enabled (default: true)
 */
export function useAnimatedNumber(target: number, duration: number = 400, enabled: boolean = true): number {
  const [current, setCurrent] = useState(enabled ? 0 : target);

  useEffect(() => {
    if (!enabled) {
      setCurrent(target);
      return;
    }

    // If target is 0 or negative, don't animate
    if (target <= 0) {
      setCurrent(target);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic function
      const easeOut = 1 - Math.pow(1 - progress, 3);

      const currentValue = startValue + (target - startValue) * easeOut;
      setCurrent(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCurrent(target);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, enabled]);

  return current;
}
