import { db, type SyncQueueItem } from './database';
import {
  createWorkoutLog,
  updateWorkoutLog,
  deleteWorkoutLog,
  createWorkoutTemplate,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  createProgram,
  updateProgram,
  deleteProgram,
} from './supabaseDataService';
import { v4 as uuidv4 } from 'uuid';

const MAX_RETRY_ATTEMPTS = 3;
const SYNC_INTERVAL = 10000; // 10 seconds

class SyncManager {
  private syncInterval: number | null = null;
  private isSyncing = false;

  /**
   * Queue an operation for sync to Supabase
   */
  async queueSync(
    type: SyncQueueItem['type'],
    operation: SyncQueueItem['operation'],
    recordId: string,
    data: any
  ): Promise<void> {
    const queueItem: SyncQueueItem = {
      id: uuidv4(),
      type,
      operation,
      data,
      recordId,
      createdAt: new Date(),
      attempts: 0,
    };

    await db.syncQueue.add(queueItem);
    console.log(`📥 Queued ${operation} ${type} for sync:`, recordId);

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncNow();
    }
  }

  /**
   * Start background sync worker
   */
  start(): void {
    if (this.syncInterval) return;

    console.log('🔄 Starting sync manager...');

    // Sync immediately on start
    this.syncNow();

    // Then sync periodically
    this.syncInterval = setInterval(() => {
      this.syncNow();
    }, SYNC_INTERVAL);

    // Sync when coming back online
    window.addEventListener('online', () => {
      console.log('📡 Network back online - syncing...');
      this.syncNow();
    });
  }

  /**
   * Stop background sync worker
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏸️  Sync manager stopped');
    }
  }

  /**
   * Trigger immediate sync (if online)
   */
  async syncNow(): Promise<void> {
    if (!navigator.onLine) {
      console.log('📴 Offline - skipping sync');
      return;
    }

    if (this.isSyncing) {
      console.log('⏳ Sync already in progress - skipping');
      return;
    }

    this.isSyncing = true;

    try {
      const pendingItems = await db.syncQueue
        .where('attempts')
        .below(MAX_RETRY_ATTEMPTS)
        .toArray();

      if (pendingItems.length === 0) {
        console.log('✅ No pending items to sync');
        return;
      }

      console.log(`🔄 Syncing ${pendingItems.length} pending items...`);

      for (const item of pendingItems) {
        try {
          await this.syncItem(item);
          // Remove from queue on success
          await db.syncQueue.delete(item.id);
          console.log(`✅ Synced ${item.operation} ${item.type}:`, item.recordId);
        } catch (error) {
          // Update attempt count and error
          await db.syncQueue.update(item.id, {
            attempts: item.attempts + 1,
            lastAttempt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          console.error(`❌ Failed to sync ${item.operation} ${item.type}:`, error);
        }
      }

      console.log('✅ Sync complete');
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a single queue item to Supabase
   */
  private async syncItem(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'workout':
        return this.syncWorkout(item);
      case 'template':
        return this.syncTemplate(item);
      case 'program':
        return this.syncProgram(item);
      case 'pr':
        // PRs are created automatically by saveWorkout - no manual sync needed
        return;
      default:
        throw new Error(`Unknown sync type: ${item.type}`);
    }
  }

  /**
   * Sync workout log to Supabase
   */
  private async syncWorkout(item: SyncQueueItem): Promise<void> {
    switch (item.operation) {
      case 'create':
        await createWorkoutLog(item.data as any);
        // Mark as synced in local DB
        await db.workoutLogs.update(item.recordId, { synced: true });
        break;
      case 'update':
        await updateWorkoutLog(item.recordId, item.data as any);
        await db.workoutLogs.update(item.recordId, { synced: true });
        break;
      case 'delete':
        await deleteWorkoutLog(item.recordId);
        break;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Sync workout template to Supabase
   */
  private async syncTemplate(item: SyncQueueItem): Promise<void> {
    switch (item.operation) {
      case 'create':
        await createWorkoutTemplate(item.data as any);
        break;
      case 'update':
        await updateWorkoutTemplate(item.recordId, item.data as any);
        break;
      case 'delete':
        await deleteWorkoutTemplate(item.recordId);
        break;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Sync program to Supabase
   */
  private async syncProgram(item: SyncQueueItem): Promise<void> {
    switch (item.operation) {
      case 'create':
        await createProgram(item.data);
        break;
      case 'update':
        await updateProgram(item.recordId, item.data);
        break;
      case 'delete':
        await deleteProgram(item.recordId);
        break;
      default:
        throw new Error(`Unknown operation: ${item.operation}`);
    }
  }

  /**
   * Get count of pending sync items
   */
  async getPendingCount(): Promise<number> {
    return await db.syncQueue
      .where('attempts')
      .below(MAX_RETRY_ATTEMPTS)
      .count();
  }

  /**
   * Get all pending sync items
   */
  async getPendingItems(): Promise<SyncQueueItem[]> {
    return await db.syncQueue
      .where('attempts')
      .below(MAX_RETRY_ATTEMPTS)
      .toArray();
  }

  /**
   * Clear all pending sync items (use carefully!)
   */
  async clearQueue(): Promise<void> {
    await db.syncQueue.clear();
    console.log('🗑️  Sync queue cleared');
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
