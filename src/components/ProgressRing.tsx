import { useEffect, useState } from 'react';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  animate?: boolean;
}

export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 2,
  color = 'rgba(180, 130, 255, 0.8)',
  backgroundColor = 'rgba(75, 85, 99, 0.2)',
  animate = true,
}: ProgressRingProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (animate) {
      // Animate from 0 to progress
      const timeout = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 50);
      return () => clearTimeout(timeout);
    } else {
      setAnimatedProgress(progress);
    }
  }, [progress, animate]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={backgroundColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: animate ? 'stroke-dashoffset 180ms ease-out' : 'none',
        }}
      />
    </svg>
  );
}
