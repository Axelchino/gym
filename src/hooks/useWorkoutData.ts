import { useQuery } from '@tanstack/react-query';
import {
  getWorkoutLogs,
  getPersonalRecords,
  getWorkoutTemplates,
  getPrograms
} from '../services/supabaseDataService';

/**
 * Custom hook to fetch workouts with React Query caching
 *
 * Benefits:
 * - First load: Fetch from Supabase (~200ms)
 * - Second load: Instant from cache (0ms)
 * - Auto-refetch in background every 5 minutes
 * - Shared cache across all components
 */
export function useWorkouts(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['workouts', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => getWorkoutLogs(startDate, endDate),
    enabled: !!startDate && !!endDate, // Only fetch when dates are provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch ALL workouts (no date filter)
 * Used by Analytics and other pages that need full history
 */
export function useAllWorkouts() {
  return useQuery({
    queryKey: ['workouts', 'all'],
    queryFn: () => getWorkoutLogs(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch personal records with React Query caching
 *
 * Benefits:
 * - Instant loads from cache on repeat visits
 * - Automatic background refetching
 * - Deduplication (multiple components can call this without extra requests)
 */
export function usePersonalRecords(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: ['prs', startDate?.toISOString(), endDate?.toISOString()],
    queryFn: () => getPersonalRecords(startDate, endDate),
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch ALL personal records (no date filter)
 */
export function useAllPersonalRecords() {
  return useQuery({
    queryKey: ['prs', 'all'],
    queryFn: () => getPersonalRecords(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch workout templates
 * Used by Program, WorkoutLogger, and other pages
 */
export function useWorkoutTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => getWorkoutTemplates(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Custom hook to fetch programs
 * Used by Program tab
 */
export function usePrograms() {
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
