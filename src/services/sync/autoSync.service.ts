import { isAuthenticatedWithGoogle } from '../gdrive/auth.service';
import { executeGoogleDriveSync } from './syncManager';
import { useAppStore } from '../../store/useAppStore';

type SyncState = 'idle' | 'syncing' | 'synced' | 'error';

let autoSyncInterval: any = null;
let currentSyncState: SyncState = 'idle';
let lastSyncTimestamp: number | null = null;
let syncListeners: Array<(state: SyncState, lastSync: number | null) => void> = [];

export function subscribeToSyncStatus(listener: (state: SyncState, lastSync: number | null) => void) {
  syncListeners.push(listener);
  listener(currentSyncState, lastSyncTimestamp);
  return () => {
    syncListeners = syncListeners.filter((l) => l !== listener);
  };
}

function notifyListeners() {
  syncListeners.forEach((l) => l(currentSyncState, lastSyncTimestamp));
}

/**
 * Triggers an immediate Google Drive sync if authenticated
 */
export async function triggerDriveSync(): Promise<boolean> {
  if (!isAuthenticatedWithGoogle()) return false;

  const store = useAppStore.getState().store;
  currentSyncState = 'syncing';
  notifyListeners();

  try {
    const result = await executeGoogleDriveSync(store);
    if (result.status === 'SUCCESS') {
      currentSyncState = 'synced';
      lastSyncTimestamp = Date.now();
      if (result.mergedStore) {
        useAppStore.setState({ store: result.mergedStore });
      }
      notifyListeners();
      return true;
    } else {
      currentSyncState = 'error';
      notifyListeners();
      return false;
    }
  } catch (e) {
    currentSyncState = 'error';
    notifyListeners();
    return false;
  }
}

/**
 * Initializes continuous 60-second (1 min) background auto-sync
 */
export function startContinuousAutoSync() {
  if (autoSyncInterval) return;

  // Initial trigger after 3 seconds
  setTimeout(() => {
    if (isAuthenticatedWithGoogle()) {
      triggerDriveSync();
    }
  }, 3000);

  // Heartbeat every 60 seconds (1 minute)
  autoSyncInterval = setInterval(() => {
    if (isAuthenticatedWithGoogle()) {
      triggerDriveSync();
    }
  }, 60000);
}

export function stopContinuousAutoSync() {
  if (autoSyncInterval) {
    clearInterval(autoSyncInterval);
    autoSyncInterval = null;
  }
}
