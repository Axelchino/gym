import { useState, useEffect, useCallback } from 'react';
import { db } from '../services/database';
import type { UserProfile } from '../types/user';

type UnitPreference = 'metric' | 'imperial';

export function useUserSettings() {
  const [unitPreference, setUnitPreferenceState] = useState<UnitPreference>('imperial'); // Default to lbs for US
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserPreference();
  }, []);

  async function loadUserPreference() {
    try {
      const user = await db.users.get('default-user');
      if (user?.unitPreference) {
        setUnitPreferenceState(user.unitPreference);
      }
    } catch (error) {
      console.error('Error loading user preference:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const setUnitPreference = useCallback(async (unit: UnitPreference) => {
    try {
      await db.users.update('default-user', { unitPreference: unit });
      setUnitPreferenceState(unit);
    } catch (error) {
      console.error('Error updating unit preference:', error);
    }
  }, []);

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
