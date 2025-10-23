import type { WorkoutTemplate, WorkoutLog } from '../types/workout';
import { db } from '../services/database';

/**
 * Export templates to CSV format
 */
export async function exportTemplatesToCSV(templates: WorkoutTemplate[]): Promise<string> {
  const headers = [
    'Template ID',
    'Template Name',
    'Exercise ID',
    'Exercise Name',
    'Order',
    'Target Sets',
    'Target Reps',
    'Target Weight',
    'Warmup Sets',
    'Target RIR',
    'Rest Time',
    'Notes'
  ];

  // Get all exercises from database to look up names
  const exercises = await db.exercises.toArray();
  const exerciseMap = new Map(exercises.map(ex => [ex.id, ex.name]));

  const rows = templates.flatMap(template =>
    template.exercises.map(exercise => [
      template.id,
      template.name,
      exercise.exerciseId,
      exerciseMap.get(exercise.exerciseId) || '',
      exercise.orderIndex.toString(),
      exercise.targetSets.toString(),
      exercise.targetReps.toString(),
      exercise.targetWeight?.toString() || '',
      exercise.warmupSets?.toString() || '0',
      exercise.targetRIR?.toString() || '',
      exercise.restSeconds?.toString() || '',
      exercise.notes || ''
    ])
  );

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
}

/**
 * Import templates from CSV format
 * Note: Exercise IDs will need to be remapped when import is called from the component
 */
export function importTemplatesFromCSV(csv: string): WorkoutTemplate[] {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length < 2) throw new Error('CSV file is empty or invalid');

  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  const data = lines.slice(1);

  const templatesMap = new Map<string, WorkoutTemplate>();

  data.forEach(line => {
    const values = parseCSVLine(line);
    if (values.length !== headers.length) return;

    const templateId = values[0];
    const templateName = values[1];
    const exerciseId = values[2]; // This ID needs remapping!
    const exerciseName = values[3];
    const orderIndex = parseInt(values[4]) || 0;
    const targetSets = parseInt(values[5]) || 3;
    const targetReps = parseInt(values[6]) || 10;
    const targetWeight = values[7] ? parseFloat(values[7]) : undefined;
    const warmupSets = parseInt(values[8]) || 0;
    const targetRIR = values[9] ? parseInt(values[9]) : undefined;
    const restTime = values[10] ? parseInt(values[10]) : undefined;
    const notes = values[11] || undefined;

    if (!templatesMap.has(templateId)) {
      templatesMap.set(templateId, {
        id: templateId,
        userId: 'default-user',
        name: templateName,
        exercises: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const template = templatesMap.get(templateId)!;
    (template.exercises as any[]).push({
      exerciseId, // Keep old ID temporarily - will be remapped in WorkoutLogger
      exerciseName, // This is what we'll use to find the correct exercise
      orderIndex,
      targetSets,
      targetReps,
      targetWeight,
      warmupSets,
      targetRIR,
      restTime,
      notes,
    });
  });

  // Sort exercises by order index
  templatesMap.forEach(template => {
    template.exercises.sort((a, b) => a.orderIndex - b.orderIndex);
  });

  return Array.from(templatesMap.values());
}

/**
 * Export workout logs to CSV format
 */
export function exportWorkoutLogsToCSV(workouts: WorkoutLog[]): string {
  const headers = [
    'Workout ID',
    'Workout Name',
    'Date',
    'Start Time',
    'End Time',
    'Duration (min)',
    'Total Volume',
    'Exercise ID',
    'Exercise Name',
    'Equipment',
    'Set Number',
    'Weight',
    'Reps',
    'RIR',
    'RPE',
    'Set Type',
    'Completed',
    'Notes'
  ];

  const rows = workouts.flatMap(workout =>
    workout.exercises.flatMap(exercise =>
      exercise.sets.map(set => [
        workout.id,
        workout.name,
        new Date(workout.date).toISOString().split('T')[0],
        new Date(workout.startTime).toLocaleTimeString(),
        workout.endTime ? new Date(workout.endTime).toLocaleTimeString() : '',
        workout.duration?.toString() || '',
        workout.totalVolume.toString(),
        exercise.exerciseId,
        exercise.exerciseName,
        exercise.equipment,
        set.setNumber.toString(),
        set.weight.toString(),
        set.reps.toString(),
        set.rir?.toString() || '',
        set.rpe?.toString() || '',
        set.isWarmup ? 'Warmup' : set.isFailure ? 'Failure' : 'Normal',
        set.completed ? 'Yes' : 'No',
        set.notes || ''
      ])
    )
  );

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');
}

/**
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Download CSV file to user's device
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read CSV file from file input
 */
export function readCSVFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
