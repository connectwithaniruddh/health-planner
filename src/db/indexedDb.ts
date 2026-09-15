import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { HealthPlannerStore } from '../schemas/store.schema';
import { INDEXED_DB_NAME } from '../config/constants';

interface HealthPlannerDBSchema extends DBSchema {
  app_store: {
    key: string;
    value: HealthPlannerStore;
  };
}

let dbPromise: Promise<IDBPDatabase<HealthPlannerDBSchema>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HealthPlannerDBSchema>(INDEXED_DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('app_store')) {
          db.createObjectStore('app_store');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveLocalStore(store: HealthPlannerStore): Promise<void> {
  try {
    const db = await getDB();
    await db.put('app_store', store, 'latest_store');
  } catch (err) {
    console.error('Failed to save store to IndexedDB:', err);
  }
}

export async function loadLocalStore(): Promise<HealthPlannerStore | null> {
  try {
    const db = await getDB();
    const store = await db.get('app_store', 'latest_store');
    return store || null;
  } catch (err) {
    console.error('Failed to load store from IndexedDB:', err);
    return null;
  }
}
