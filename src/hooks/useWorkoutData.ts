import { useMemo } from 'react';
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

  // GUEST MODE: Return filtered mock data with stable reference
  const guestData = useMemo(() => {
    if (!isGuest) return null;
    const allWorkouts = getGuestWorkouts();
    // Filter workouts by date range if provided
    const filteredWorkouts = (startDate && endDate)
      ? allWorkouts.filter(w => {
          const workoutDate = new Date(w.date);
          return workoutDate >= startDate && workoutDate <= endDate;
        })
      : allWorkouts;
    return filteredWorkouts;
  }, [isGuest, startDate, endDate]);

  if (isGuest && guestData) {
    return {
      data: guestData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: guestData }),
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

  // GUEST MODE: Return mock data with stable reference to prevent infinite loops
  const guestWorkouts = useMemo(() => {
    return isGuest ? getGuestWorkouts() : null;
  }, [isGuest]);

  if (isGuest && guestWorkouts) {
    return {
      data: guestWorkouts,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: guestWorkouts }),
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

  // GUEST MODE: Return filtered mock PRs with stable reference
  const guestData = useMemo(() => {
    if (!isGuest) return null;
    const allPRs = getGuestPRs();
    // Filter PRs by date range if provided
    const filteredPRs = (startDate && endDate)
      ? allPRs.filter(pr => {
          const prDate = new Date(pr.date);
          return prDate >= startDate && prDate <= endDate;
        })
      : allPRs;
    return filteredPRs;
  }, [isGuest, startDate, endDate]);

  if (isGuest && guestData) {
    return {
      data: guestData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: guestData }),
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

  // GUEST MODE: Return mock PRs with stable reference to prevent infinite loops
  const guestPRs = useMemo(() => {
    return isGuest ? getGuestPRs() : null;
  }, [isGuest]);

  if (isGuest && guestPRs) {
    return {
      data: guestPRs,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: guestPRs }),
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

  // GUEST MODE: Return mock templates with stable reference
  const guestTemplates = useMemo(() => {
    return isGuest ? getGuestTemplates() : null;
  }, [isGuest]);

  if (isGuest && guestTemplates) {
    return {
      data: guestTemplates,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: guestTemplates }),
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

  // GUEST MODE: Return mock program with stable reference
  const guestPrograms = useMemo(() => {
    if (!isGuest) return null;
    const mockProgram = getGuestProgram();
    return [mockProgram]; // Return as array since getPrograms returns array
  }, [isGuest]);

  if (isGuest && guestPrograms) {
    return {
      data: guestPrograms,
      isLoading: false,
      isError: false,
      error: null,
      refetch: () => Promise.resolve({ data: guestPrograms }),
    } as any;
  }

  // REAL USER: Normal React Query flow
  return useQuery({
    queryKey: ['programs'],
    queryFn: () => getPrograms(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
