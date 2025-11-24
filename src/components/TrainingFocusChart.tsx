/**
 * Training Focus Chart
 *
 * Spider/radar chart showing muscle group training distribution.
 * Uses effort-weighted algorithm with time decay.
 */

import { useState, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { getChartColors, useThemeTokens } from '../utils/themeHelpers';
import { getMuscleRadarData, type MuscleRadarData } from '../services/muscleEffortService';

interface TrainingFocusChartProps {
  userId: string;
}

// Standard muscle groups for the radar chart (8-point octagon)
// Arranged anatomically: Upper Push → Upper Pull → Arms → Legs
const MUSCLE_GROUPS = [
  'Chest',      // Upper push
  'Shoulders',  // Upper push
  'Triceps',    // Push arm
  'Back',       // Upper pull
  'Biceps',     // Pull arm
  'Quads',      // Front leg
  'Glutes',     // Hip
  'Hamstrings', // Back leg
];

// Map specific muscle names to general categories (8-point radar)
const MUSCLE_MAPPING: { [key: string]: string } = {
  // Back variations → Back
  'Lats': 'Back',
  'Lower Back': 'Back',
  'Traps': 'Back',
  'Trapezius': 'Back',
  'Lower Traps': 'Back',
  'Rhomboids': 'Back',
  'Upper Back': 'Back',
  'Serratus Anterior': 'Back', // Debatable, but closer to back

  // Shoulder variations → Shoulders
  'Front Delts': 'Shoulders',
  'Side Delts': 'Shoulders',
  'Rear Delts': 'Shoulders',
  'Delts': 'Shoulders',
  'Rotator Cuff': 'Shoulders',

  // Arm variations
  'Brachialis': 'Biceps',
  'Forearms': 'Biceps', // Groups with pulling muscles

  // Leg variations → appropriate leg muscle
  'Calves': 'Hamstrings', // Posterior chain
  'Soleus': 'Hamstrings',
  'Hip Flexors': 'Quads',
  'Adductors': 'Quads',
  'Hip Adductors': 'Quads',
  'Abductors': 'Glutes',
  'Hip Abductors': 'Glutes',
  'Hip External Rotators': 'Glutes',
  'Hip Internal Rotators': 'Glutes',
  'Piriformis': 'Glutes',
  'Legs': 'Quads', // Generic legs → quads

  // Core → Chest (or could skip entirely)
  'Abs': 'Chest',
  'Obliques': 'Chest',
  'Core': 'Chest',
  'Diaphragm': 'Chest',

  // Mobility/rehab muscles → skip (return null mapping)
  // These will pass through and not match any chart category
  'Achilles': '',
  'Ankles': '',
  'IT Band': '',
  'Neck': '',
  'Peroneals': '',
  'Thoracic Spine': '',
  'Tibialis Anterior': '',
  'Tibialis Posterior': '',
};

// Normalize muscle name to chart category
function normalizeMuscleName(muscle: string): string {
  return MUSCLE_MAPPING[muscle] || muscle;
};

export function TrainingFocusChart({ userId }: TrainingFocusChartProps) {
  const { theme } = useTheme();
  const chartColors = getChartColors(theme);
  const tokens = useThemeTokens();

  const [data, setData] = useState<MuscleRadarData>({});
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<30 | 60 | 90>(30);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const radarData = await getMuscleRadarData(userId, days);
        setData(radarData);
      } catch (error) {
        console.error('Failed to load training focus data:', error);
      }
      setLoading(false);
    }

    loadData();
  }, [userId, days]);

  // Aggregate data by normalized muscle groups
  const aggregatedData: { [key: string]: number } = {};
  for (const [muscle, value] of Object.entries(data)) {
    const normalized = normalizeMuscleName(muscle);

    // Skip mobility/rehab muscles (mapped to empty string)
    if (normalized === '') continue;

    aggregatedData[normalized] = (aggregatedData[normalized] || 0) + value;
  }

  // Convert to Recharts format
  const chartData = MUSCLE_GROUPS.map(muscle => ({
    muscle,
    value: aggregatedData[muscle] || 0,
    fullMark: 100,
  }));

  // Check if we have any data
  const hasData = Object.keys(data).length > 0;

  if (loading) {
    return (
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: tokens.statCard.background,
          border: `1px solid ${tokens.statCard.border}`,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Training Focus</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <span className="text-secondary">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-6"
      style={{
        backgroundColor: tokens.statCard.background,
        border: `1px solid ${tokens.statCard.border}`,
      }}
    >
      {/* Header with timeframe selector */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Training Focus</h3>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value) as 30 | 60 | 90)}
          className="text-sm rounded-lg px-3 py-1.5 text-primary"
          style={{
            backgroundColor: 'var(--surface-accent)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
        </select>
      </div>

      {hasData ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="80%">
              <PolarGrid stroke={chartColors.grid} />
              <PolarAngleAxis
                dataKey="muscle"
                tick={{
                  fill: 'var(--text-secondary)',
                  fontSize: 11,
                }}
              />
              <Radar
                name="Training"
                dataKey="value"
                stroke={chartColors.primary}
                fill={chartColors.primary}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          className="h-64 flex flex-col items-center justify-center text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          <p className="mb-2">No training data yet</p>
          <p className="text-sm">Complete workouts to see your training focus</p>
        </div>
      )}

      {/* Footer hint */}
      {hasData && (
        <p
          className="text-xs text-center mt-3"
          style={{ color: 'var(--text-muted)' }}
        >
          Based on effort-weighted muscle activation
        </p>
      )}
    </div>
  );
}

export default TrainingFocusChart;
