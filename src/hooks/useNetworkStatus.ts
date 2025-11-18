import { useState, useEffect } from 'react';
import { syncManager } from '../services/syncManager';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    // Update online status
    const handleOnline = () => {
      setIsOnline(true);
      console.log('📡 Network connected');
      // Trigger sync when coming back online
      syncManager.syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('📴 Network disconnected');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Poll for pending sync count
    const updatePendingCount = async () => {
      const count = await syncManager.getPendingCount();
      setPendingSyncCount(count);
    };

    // Update immediately
    updatePendingCount();

    // Then update every 5 seconds
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    pendingSyncCount,
    hasPendingSync: pendingSyncCount > 0,
  };
}
