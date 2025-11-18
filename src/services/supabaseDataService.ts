/**
 * Supabase Data Service
 *
 * Replaces IndexedDB calls with Supabase cloud database calls
 * All data now syncs across devices via Supabase
 */

import { supabase } from './supabase';
import type { WorkoutTemplate, WorkoutLog, WorkoutExercise } from '../types/workout';
import type { PersonalRecord } from '../types/workout';

// ============================================
// AUTH HELPERS
// ============================================

/**
 * Get the current authenticated user's ID
 * Throws error if user is not authenticated
 */
export async function getCurrentUserId(): Promise<string> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('User not authenticated. Please sign in.');
  }

  return user.id;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('User not authenticated. Please sign in.');
  }

  return user;
}

// ============================================
// WORKOUT TEMPLATES
// ============================================

/**
 * Get all workout templates for the current user
 */
export async function getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching templates:', error);
    throw error;
  }

  // Convert Supabase format to app format
  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    exercises: row.exercises as WorkoutExercise[],
    isActive: row.is_active,
    schedule: row.schedule,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

/**
 * Create a new workout template
 */
export async function createWorkoutTemplate(template: Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<WorkoutTemplate> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('workout_templates')
    .insert({
      user_id: userId,
      name: template.name,
      description: template.description,
      exercises: template.exercises,
      is_active: template.isActive ?? true,
      schedule: template.schedule,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating template:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    exercises: data.exercises as WorkoutExercise[],
    isActive: data.is_active,
    schedule: data.schedule,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Update an existing workout template
 */
export async function updateWorkoutTemplate(
  templateId: string,
  updates: Partial<Omit<WorkoutTemplate, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const userId = await getCurrentUserId();

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.exercises !== undefined) updateData.exercises = updates.exercises;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.schedule !== undefined) updateData.schedule = updates.schedule;

  const { error } = await supabase
    .from('workout_templates')
    .update(updateData)
    .eq('id', templateId)
    .eq('user_id', userId); // Ensure user owns this template

  if (error) {
    console.error('Error updating template:', error);
    throw error;
  }
}

/**
 * Delete a workout template
 */
export async function deleteWorkoutTemplate(templateId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('workout_templates')
    .delete()
    .eq('id', templateId)
    .eq('user_id', userId); // Ensure user owns this template

  if (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

// ============================================
// WORKOUT LOGS
// ============================================

/**
 * Get all workout logs for the current user
 */
/**
 * Get workout logs with optional date range filter
 * @param startDate - Optional start date (inclusive)
 * @param endDate - Optional end date (inclusive)
 * @param limit - Optional limit for number of results (default: all)
 */
export async function getWorkoutLogs(
  startDate?: Date,
  endDate?: Date,
  limit?: number
): Promise<WorkoutLog[]> {
  const userId = await getCurrentUserId();

  let query = supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId);

  // Apply date filters if provided
  if (startDate) {
    query = query.gte('date', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('date', endDate.toISOString());
  }

  // Apply limit if provided
  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Error fetching workout logs:', error);
    throw error;
  }

  // Convert Supabase format to app format
  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    templateId: row.template_id,
    name: row.name,
    date: new Date(row.date),
    startTime: new Date(row.start_time),
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    duration: row.duration,
    totalVolume: parseFloat(row.total_volume),
    exercises: row.exercises as any[],
    notes: row.notes,
    synced: true, // Data from Supabase is always synced
    createdAt: new Date(row.created_at),
  }));
}

/**
 * Create a new workout log
 */
export async function createWorkoutLog(log: Omit<WorkoutLog, 'id' | 'userId' | 'synced' | 'createdAt'>): Promise<WorkoutLog> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: userId,
      template_id: log.templateId,
      name: log.name,
      date: log.date.toISOString(),
      start_time: log.startTime.toISOString(),
      end_time: log.endTime?.toISOString(),
      duration: log.duration,
      total_volume: log.totalVolume,
      exercises: log.exercises,
      notes: log.notes,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating workout log:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    templateId: data.template_id,
    name: data.name,
    date: new Date(data.date),
    startTime: new Date(data.start_time),
    endTime: data.end_time ? new Date(data.end_time) : undefined,
    duration: data.duration,
    totalVolume: parseFloat(data.total_volume),
    exercises: data.exercises as any[],
    notes: data.notes,
    synced: true,
    createdAt: new Date(data.created_at),
  };
}

/**
 * Update an existing workout log
 */
export async function updateWorkoutLog(
  logId: string,
  updates: Partial<Omit<WorkoutLog, 'id' | 'userId' | 'synced' | 'createdAt'>>
): Promise<void> {
  const userId = await getCurrentUserId();

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.date !== undefined) updateData.date = updates.date.toISOString();
  if (updates.startTime !== undefined) updateData.start_time = updates.startTime.toISOString();
  if (updates.endTime !== undefined) updateData.end_time = updates.endTime?.toISOString();
  if (updates.duration !== undefined) updateData.duration = updates.duration;
  if (updates.totalVolume !== undefined) updateData.total_volume = updates.totalVolume;
  if (updates.exercises !== undefined) updateData.exercises = updates.exercises;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  const { error } = await supabase
    .from('workout_logs')
    .update(updateData)
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating workout log:', error);
    throw error;
  }
}

/**
 * Delete a workout log
 */
export async function deleteWorkoutLog(logId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('workout_logs')
    .delete()
    .eq('id', logId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting workout log:', error);
    throw error;
  }
}

// ============================================
// PERSONAL RECORDS
// ============================================

/**
 * Get all personal records for the current user
 */
/**
 * Get personal records with optional date range filter
 * @param startDate - Optional start date (inclusive)
 * @param endDate - Optional end date (inclusive)
 */
export async function getPersonalRecords(
  startDate?: Date,
  endDate?: Date
): Promise<PersonalRecord[]> {
  const userId = await getCurrentUserId();

  let query = supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', userId);

  // Apply date filters if provided
  if (startDate) {
    query = query.gte('date', startDate.toISOString());
  }
  if (endDate) {
    query = query.lte('date', endDate.toISOString());
  }

  const { data, error } = await query.order('date', { ascending: false });

  if (error) {
    console.error('Error fetching personal records:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    exerciseId: row.exercise_id,
    exerciseName: row.exercise_name,
    type: row.type as 'weight' | 'reps' | 'volume' | '1rm',
    value: parseFloat(row.value),
    reps: row.reps,
    date: new Date(row.date),
    workoutLogId: row.workout_log_id,
    previousRecord: row.previous_record ? parseFloat(row.previous_record) : undefined,
  }));
}

/**
 * Create a new personal record
 */
export async function createPersonalRecord(pr: Omit<PersonalRecord, 'id' | 'userId'>): Promise<PersonalRecord> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('personal_records')
    .insert({
      user_id: userId,
      exercise_id: pr.exerciseId,
      exercise_name: pr.exerciseName,
      type: pr.type,
      value: pr.value,
      reps: pr.reps,
      date: pr.date.toISOString(),
      workout_log_id: pr.workoutLogId,
      previous_record: pr.previousRecord,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating personal record:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    exerciseId: data.exercise_id,
    exerciseName: data.exercise_name,
    type: data.type as 'weight' | 'reps' | 'volume' | '1rm',
    value: parseFloat(data.value),
    reps: data.reps,
    date: new Date(data.date),
    workoutLogId: data.workout_log_id,
    previousRecord: data.previous_record ? parseFloat(data.previous_record) : undefined,
  };
}

/**
 * Delete a personal record
 */
export async function deletePersonalRecord(prId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('personal_records')
    .delete()
    .eq('id', prId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting personal record:', error);
    throw error;
  }
}

// ============================================
// PROGRAMS
// ============================================

/**
 * Get all programs for the current user
 */
export async function getPrograms(): Promise<any[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching programs:', error);
    throw error;
  }

  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description,
    duration: row.duration,
    daysPerWeek: row.days_per_week,
    weeks: row.weeks,
    goal: row.goal,
    isActive: row.is_active,
    startDate: row.start_date ? new Date(row.start_date) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

/**
 * Create a new program
 */
export async function createProgram(program: any): Promise<any> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('programs')
    .insert({
      user_id: userId,
      name: program.name,
      description: program.description,
      duration: program.duration,
      days_per_week: program.daysPerWeek,
      weeks: program.weeks,
      goal: program.goal,
      is_active: program.isActive ?? false,
      start_date: program.startDate?.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating program:', error);
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    description: data.description,
    duration: data.duration,
    daysPerWeek: data.days_per_week,
    weeks: data.weeks,
    goal: data.goal,
    isActive: data.is_active,
    startDate: data.start_date ? new Date(data.start_date) : undefined,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Update an existing program
 */
export async function updateProgram(programId: string, updates: any): Promise<void> {
  const userId = await getCurrentUserId();

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.duration !== undefined) updateData.duration = updates.duration;
  if (updates.daysPerWeek !== undefined) updateData.days_per_week = updates.daysPerWeek;
  if (updates.weeks !== undefined) updateData.weeks = updates.weeks;
  if (updates.goal !== undefined) updateData.goal = updates.goal;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate?.toISOString();

  const { error } = await supabase
    .from('programs')
    .update(updateData)
    .eq('id', programId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating program:', error);
    throw error;
  }
}

/**
 * Delete a program
 */
export async function deleteProgram(programId: string): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', programId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting program:', error);
    throw error;
  }
}

// ============================================
// USER PROFILE
// ============================================

/**
 * Get the current user's profile
 */
export async function getUserProfile(): Promise<any> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    name: data.name,
    age: data.age,
    height: data.height ? parseFloat(data.height) : undefined,
    weight: data.weight ? parseFloat(data.weight) : undefined,
    currentWeight: data.weight ? parseFloat(data.weight) : undefined, // Alias for compatibility
    startingWeight: data.starting_weight ? parseFloat(data.starting_weight) : undefined,
    goal: data.goal,
    experienceLevel: data.experience_level,
    sex: data.sex,
    unitPreference: data.unit_preference === 'metric' ? 'metric' : 'imperial',
    actual1rm: data.actual_1rm,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Update the current user's profile
 */
export async function updateUserProfile(updates: any): Promise<void> {
  const userId = await getCurrentUserId();

  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.age !== undefined) updateData.age = updates.age;
  if (updates.height !== undefined) updateData.height = updates.height;
  if (updates.weight !== undefined) updateData.weight = updates.weight;
  if (updates.currentWeight !== undefined) updateData.weight = updates.currentWeight; // Handle both field names
  if (updates.startingWeight !== undefined) updateData.starting_weight = updates.startingWeight;
  if (updates.goal !== undefined) updateData.goal = updates.goal;
  if (updates.experienceLevel !== undefined) updateData.experience_level = updates.experienceLevel;
  if (updates.sex !== undefined) updateData.sex = updates.sex;
  if (updates.unitPreference !== undefined) {
    updateData.unit_preference = updates.unitPreference === 'metric' ? 'metric' : 'imperial';
  }
  if (updates.actual1rm !== undefined) updateData.actual_1rm = updates.actual1rm;

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
