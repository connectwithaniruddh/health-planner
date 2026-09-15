import { create } from 'zustand';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

interface SyncStoreState {
  status: SyncStatus;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  setSyncStatus: (status: SyncStatus, errorMessage?: string) => void;
  setLastSyncedAt: (timestamp: string) => void;
}

export const useSyncStore = create<SyncStoreState>((set) => ({
  status: 'idle',
  lastSyncedAt: null,
  errorMessage: null,

  setSyncStatus: (status, errorMessage = undefined) => set({ status, errorMessage: errorMessage || null }),
  setLastSyncedAt: (timestamp) => set({ lastSyncedAt: timestamp }),
}));
