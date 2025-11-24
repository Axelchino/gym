import { useEffect, useState } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  peakDotColor?: string;
  strokeWidth?: number;
  animate?: boolean;
}

export function Sparkline({
  data,
  width = 100,
  height = 24,
  color = 'rgba(180, 130, 255, 0.6)',
  peakDotColor,
  strokeWidth = 1,
  animate = true,
}: SparklineProps) {
  const [pathLength, setPathLength] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(animate);

  useEffect(() => {
    if (animate && data.length >= 2) {
      // Measure path length for animation
      const path = document.getElementById('sparkline-path') as SVGPathElement | null;
      if (path && path.getTotalLength) {
        const length = path.getTotalLength();
        setPathLength(length);
        setShouldAnimate(true);
      }
    }
  }, [data, animate]);

  if (data.length < 2) {
    return null;
  }

  // Calculate min/max for scaling
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  // Check if all values are the same (flat data)
  const isFlat = range === 0;

  // Generate path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    // If flat data, draw a horizontal line in the middle
    const y = isFlat ? height / 2 : height - ((value - min) / range) * height;
    return { x, y };
  });

  const pathData = points.map((point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${command} ${point.x},${point.y}`;
  }).join(' ');

  // Find peak point
  const peakIndex = data.indexOf(max);
  const peakPoint = points[peakIndex];

  return (
    <svg
      width={width}
      height={height}
      className="sparkline"
      style={{ overflow: 'visible' }}
    >
      <path
        id="sparkline-path"
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={shouldAnimate ? {
          strokeDasharray: pathLength,
          strokeDashoffset: pathLength,
          animation: 'drawPath 400ms ease-out forwards',
        } : undefined}
      />
      {/* Small dot at peak - hide when data is flat */}
      {!isFlat && (
        <circle
          cx={peakPoint.x}
          cy={peakPoint.y}
          r={2}
          fill={peakDotColor || color}
          style={shouldAnimate ? {
            opacity: 0,
            animation: 'fadeInDot 200ms ease-out 400ms forwards',
          } : undefined}
        />
      )}
      <style>{`
        @keyframes drawPath {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes fadeInDot {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </svg>
  );
}
