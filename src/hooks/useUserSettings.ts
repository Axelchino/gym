import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import type { UserProfile } from '../types/user';
import { useAuth } from '../contexts/AuthContext';

type UnitPreference = 'metric' | 'imperial';

export function useUserSettings() {
  const { user } = useAuth();
  const [unitPreference, setUnitPreferenceState] = useState<UnitPreference>('imperial'); // Default to lbs for US
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPreference();
  }, [user]);

  async function loadUserPreference() {
    try {
      if (!user) {
        setIsLoading(false);
        return;
      }
      const userProfile = await db.users.get(user.id);
      if (userProfile?.unitPreference) {
        setUnitPreferenceState(userProfile.unitPreference);
      }
    } catch (error) {
      console.error('Error loading user preference:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const setUnitPreference = useCallback(async (unit: UnitPreference) => {
    try {
      if (!user) return;
      await db.users.update(user.id, { unitPreference: unit });
      setUnitPreferenceState(unit);
    } catch (error) {
      console.error('Error updating unit preference:', error);
    }
  }, [user]);

  const toggleUnit = useCallback(async () => {
    const newUnit = unitPreference === 'metric' ? 'imperial' : 'metric';
    await setUnitPreference(newUnit);
  }, [unitPreference, setUnitPreference]);

  // Get the weight unit label
  const weightUnit = unitPreference === 'metric' ? 'kg' : 'lbs';

  return {
    unitPreference,
    setUnitPreference,
    toggleUnit,
    weightUnit,
    isLoading,
  };
}
