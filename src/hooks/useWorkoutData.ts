import { useQuery } from '@tanstack/react-query';
import {
  getWorkoutLogs,
  getPersonalRecords,
  getWorkoutTemplates,
  getPrograms
} from '../services/supabaseDataService';
import { useAuth } from '../contexts/AuthContext';
import { getGuestWorkouts, getGuestPRs, getGuestTemplates, getGuestProgram } from '../data/guestMockData';

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
  const { isGuest } = useAuth();

  // GUEST MODE: Return filtered mock data
  if (isGuest) {
    const allWorkouts = getGuestWorkouts();
    // Filter workouts by date range if provided
    const filteredWorkouts = (startDate && endDate)
      ? allWorkouts.filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate >= startDate && workoutDate <= endDate;
        })
      : allWorkouts;

    return {
      data: filteredWorkouts,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: filteredWorkouts }),
    } as any;
  }

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
  const { isGuest } = useAuth();

  // GUEST MODE: Return mock data instantly
  if (isGuest) {
    return {
      data: getGuestWorkouts(),
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: getGuestWorkouts() }),
    } as any;
  }

  // REAL USER: Normal React Query flow
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
  const { isGuest } = useAuth();

  // GUEST MODE: Return filtered mock PRs
  if (isGuest) {
    const allPRs = getGuestPRs();
    // Filter PRs by date range if provided
    const filteredPRs = (startDate && endDate)
      ? allPRs.filter(pr => {
          const prDate = new Date(pr.date);
          return prDate >= startDate && prDate <= endDate;
        })
      : allPRs;

    return {
      data: filteredPRs,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: filteredPRs }),
    } as any;
  }

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
  const { isGuest } = useAuth();

  // GUEST MODE: Return mock PRs instantly
  if (isGuest) {
    return {
      data: getGuestPRs(),
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: getGuestPRs() }),
    } as any;
  }

  // REAL USER: Normal React Query flow
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
  const { isGuest } = useAuth();

  // GUEST MODE: Return mock templates instantly
  if (isGuest) {
    return {
      data: getGuestTemplates(),
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: getGuestTemplates() }),
    } as any;
  }

  // REAL USER: Normal React Query flow
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
  const { isGuest } = useAuth();

  // GUEST MODE: Return mock program instantly
  if (isGuest) {
    const mockProgram = getGuestProgram();
    return {
      data: [mockProgram], // Return as array since getPrograms returns array
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: [mockProgram] }),
    } as any;
  }

  // REAL USER: Normal React Query flow
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
