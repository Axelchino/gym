import { WifiOff, CloudOff, Cloud } from 'lucide-react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../contexts/ThemeContext';
import { getAccentColors } from '../utils/themeHelpers';

export function OfflineIndicator() {
  const { isOffline, hasPendingSync, pendingSyncCount } = useNetworkStatus();
  const { theme } = useTheme();
  const accentColors = getAccentColors(theme);

  // Don't show anything if online and no pending syncs
  if (!isOffline && !hasPendingSync) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Offline indicator */}
      {isOffline && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
          style={{
            backgroundColor: 'rgba(255, 165, 0, 0.15)',
            border: '1px solid rgba(255, 165, 0, 0.3)',
            color: '#FFA500',
          }}
          title="You're offline - workouts will sync when back online"
        >
          <WifiOff size={14} strokeWidth={2} />
          <span>Offline</span>
        </div>
      )}

      {/* Pending sync indicator */}
      {hasPendingSync && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
          style={{
            backgroundColor: isOffline
              ? (theme === 'amoled' ? 'rgba(212, 160, 23, 0.15)' : 'rgba(180, 130, 255, 0.15)')
              : 'rgba(34, 197, 94, 0.15)',
            border: isOffline
              ? (theme === 'amoled' ? '1px solid rgba(212, 160, 23, 0.3)' : '1px solid rgba(180, 130, 255, 0.3)')
              : '1px solid rgba(34, 197, 94, 0.3)',
            color: isOffline ? accentColors.primary : '#22C55E',
          }}
          title={
            isOffline
              ? `${pendingSyncCount} workout${pendingSyncCount > 1 ? 's' : ''} waiting to sync`
              : `Syncing ${pendingSyncCount} workout${pendingSyncCount > 1 ? 's' : ''}...`
          }
        >
          {isOffline ? (
            <CloudOff size={14} strokeWidth={2} />
          ) : (
            <Cloud size={14} strokeWidth={2} className="animate-pulse" />
          )}
          <span>
            {pendingSyncCount} {isOffline ? 'pending' : 'syncing'}
          </span>
        </div>
      )}
    </div>
  );
}
