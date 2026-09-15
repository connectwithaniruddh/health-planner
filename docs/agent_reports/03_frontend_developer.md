# Frontend Architecture Specification: Health Planner PWA

**Target Environment:** GitHub Pages (`github.io`)  
**Architecture Paradigm:** Offline-First Progressive Web App (PWA) with Google Drive Cloud Backup & JSON Migration Pipeline  
**Target OS/Platforms:** Mobile (iOS/Android Web App), Desktop (Chrome/Safari/Edge)  

---

## 1. Executive Summary & Core Requirements

The **Health Planner** web application is designed as a privacy-focused, offline-first health management platform. Data primary residency is local to the user's browser (IndexedDB), with optional seamless cloud synchronization to the user's personal Google Drive storage (`drive.appdata` sandbox). 

### Key Constraints & Technical Objectives
- **Zero Server Overhead:** Built static HTML/JS/CSS hosted on GitHub Pages.
- **Offline Reliability:** Service workers cache all static assets, while IndexedDB persists local store state.
- **Data Safety & Upgradability:** Strict runtime JSON validation with Zod and step-by-step schema migrations.
- **Installable PWA:** Full Web App Manifest & Workbox runtime caching for native-like standalone installation.

---

## 2. Directory & File Structure

```
health-planner/
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions static deployment to GitHub Pages
├── public/
│   ├── favicon.ico
│   ├── icon-192.png               # PWA icon (192x192)
│   ├── icon-512.png               # PWA icon (512x512)
│   ├── apple-touch-icon.png
│   └── 404.html                   # SPA routing fallback on GitHub Pages
├── src/
│   ├── assets/                    # Static SVG/Image assets
│   ├── components/
│   │   ├── ui/                    # Reusable atomic UI (Buttons, Cards, Dialogs)
│   │   ├── charts/                # Recharts wrapper components (WeightChart, WorkoutProgress)
│   │   ├── layout/                # App shell, navbar, sidebar, bottom nav for mobile
│   │   └── sync/                  # Sync status indicator, conflict resolution modal
│   ├── config/
│   │   ├── constants.ts           # App constants (SCHEMA_VERSION, STORAGE_KEYS)
│   │   └── gdrive.config.ts       # Google OAuth Client ID & Scope config
│   ├── db/
│   │   ├── indexedDb.ts           # IndexedDB wrapper (using idb library)
│   │   └── storageAdapter.ts      # Storage interface abstraction
│   ├── hooks/
│   │   ├── useSync.ts             # Hook for triggering & monitoring sync state
│   │   └── useHealthData.ts       # Query & mutation hooks for store interaction
│   ├── migrations/
│   │   ├── index.ts               # Migration engine & registry entrypoint
│   │   ├── types.ts               # Migration interface definitions
│   │   ├── v1_to_v2.ts            # Migration script v1 -> v2
│   │   └── v2_to_v3.ts            # Migration script v2 -> v3
│   ├── schemas/
│   │   ├── store.schema.ts        # Latest Zod Schema (v2 / Current)
│   │   └── v1.schema.ts           # Legacy Zod Schemas for validation
│   ├── services/
│   │   ├── gdrive/
│   │   │   ├── auth.service.ts    # Google Identity Services (GIS) token manager
│   │   │   └── gdrive.service.ts  # Drive AppData REST API operations
│   │   └── sync/
│   │       ├── syncManager.ts     # Main push/pull sync engine
│   │       └── conflictResolver.ts# Conflict detection & merge strategy
│   ├── store/
│   │   ├── useAppStore.ts         # Main Zustand domain store (health data)
│   │   ├── useSyncStore.ts        # Sync metadata & state store
│   │   └── useUIStore.ts          # Local UI state (modals, active tabs)
│   ├── types/
│   │   └── store.types.ts         # TypeScript types generated from Zod schemas
│   ├── utils/
│   │   ├── date.utils.ts
│   │   └── crypto.utils.ts        # MD5/SHA256 checksum utility for payload diffing
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css                  # Tailwind directive imports
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 3. Tech Stack Selection & Configuration

| Tool / Library | Version / Selection | Purpose |
| :--- | :--- | :--- |
| **UI Framework** | React 18 | Declarative UI with Concurrent Rendering |
| **Build Tool** | Vite | Ultra-fast ESM bundler & dev server |
| **Language** | TypeScript 5.x | End-to-end strict static typing |
| **Styling** | Tailwind CSS v3 | Utility-first responsive CSS framework |
| **Icons** | Lucide React | Lightweight, tree-shakeable SVG icon collection |
| **Visualizations** | Recharts | Responsive SVG charts (weight history, macros, workouts) |
| **PWA Engine** | `vite-plugin-pwa` + Workbox | Service Worker generator & Web Manifest tooling |
| **Schema Validation** | Zod v3 | Runtime JSON validation & TypeScript inference |
| **State Management** | Zustand v4 | Lightweight reactive client state store |
| **Async & Sync Cache** | TanStack Query v5 | Async state management & network re-validation |
| **Storage Engine** | `idb` | Promises-based IndexedDB engine |

### `vite.config.ts` Configuration

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Set base path matching repository name for GitHub Pages deployment
const BASE_PATH = process.env.NODE_ENV === 'production' ? '/health-planner/' : '/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Health Planner',
        short_name: 'HealthPlanner',
        description: 'Offline-first health, workout, and nutrition tracking web app',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: BASE_PATH,
        start_url: BASE_PATH,
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/www\.googleapis\.com\/drive\/.*/i,
            handler: 'NetworkOnly', // Drive sync requests bypass SW cache
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## 4. JSON Versioning & Schema Migration Pipeline

To ensure data integrity across software updates, the storage model uses explicit version numbers, Zod validation schemas, and an ordered migration engine.

### Data Model & Zod Schemas (`src/schemas/store.schema.ts`)

```typescript
import { z } from 'zod';

export const CURRENT_SCHEMA_VERSION = 2;

// --- Sub-schemas ---
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  birthDate: z.string().optional(),
  heightCm: z.number().positive(),
  targetWeightKg: z.number().positive().optional(),
  dailyCalorieGoal: z.number().int().positive().optional(),
});

export const HealthLogEntrySchema = z.object({
  id: z.string(),
  date: z.string(), // ISO Date String: YYYY-MM-DD
  weightKg: z.number().positive().optional(),
  caloriesConsumed: z.number().nonnegative().optional(),
  waterMl: z.number().nonnegative().optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  notes: z.string().max(1000).optional(),
  updatedAt: z.string(), // ISO Timestamp
});

export const AppSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  syncIntervalMinutes: z.number().min(1).default(15),
  autoSyncDrive: z.boolean().default(true),
  units: z.object({
    weight: z.enum(['kg', 'lbs']),
    water: z.enum(['ml', 'oz']),
  }),
});

// --- Root Application Store Schema (Version 2) ---
export const HealthPlannerStoreSchema = z.object({
  version: z.literal(CURRENT_SCHEMA_VERSION),
  meta: z.object({
    lastModified: z.string(), // ISO timestamp
    deviceId: z.string(),
    checksum: z.string().optional(),
  }),
  profile: UserProfileSchema,
  healthLogs: z.array(HealthLogEntrySchema),
  settings: AppSettingsSchema,
});

export type HealthPlannerStore = z.infer<typeof HealthPlannerStoreSchema>;
export type HealthLogEntry = z.infer<typeof HealthLogEntrySchema>;
```

### Migration Registry & Version Scripts (`src/migrations/`)

#### Migration Interface (`src/migrations/types.ts`)
```typescript
export interface Migration {
  fromVersion: number;
  toVersion: number;
  migrate: (rawPayload: Record<string, any>) => Record<string, any>;
}
```

#### Sample Migration Script `v1 -> v2` (`src/migrations/v1_to_v2.ts`)
```typescript
import { Migration } from './types';

/**
 * Migration v1 to v2:
 * - Adds meta object with deviceId & lastModified.
 * - Renames legacy `logs` array to `healthLogs`.
 * - Adds units settings default object.
 */
export const v1_to_v2: Migration = {
  fromVersion: 1,
  toVersion: 2,
  migrate: (v1Data: Record<string, any>) => {
    return {
      version: 2,
      meta: {
        lastModified: v1Data.lastUpdated || new Date().toISOString(),
        deviceId: v1Data.deviceId || crypto.randomUUID(),
      },
      profile: {
        id: v1Data.profile?.id || crypto.randomUUID(),
        name: v1Data.profile?.name || 'User',
        birthDate: v1Data.profile?.birthDate,
        heightCm: v1Data.profile?.heightCm || 170,
        targetWeightKg: v1Data.profile?.targetWeight,
        dailyCalorieGoal: v1Data.profile?.calorieGoal,
      },
      healthLogs: (v1Data.logs || []).map((log: any) => ({
        id: log.id || crypto.randomUUID(),
        date: log.date,
        weightKg: log.weight,
        caloriesConsumed: log.calories,
        waterMl: log.water,
        sleepHours: log.sleep,
        notes: log.notes || '',
        updatedAt: log.timestamp || new Date().toISOString(),
      })),
      settings: {
        theme: v1Data.theme || 'system',
        syncIntervalMinutes: 15,
        autoSyncDrive: true,
        units: {
          weight: 'kg',
          water: 'ml',
        },
      },
    };
  },
};
```

#### Migration Engine & Runner (`src/migrations/index.ts`)
```typescript
import { Migration } from './types';
import { v1_to_v2 } from './v1_to_v2';
import { HealthPlannerStoreSchema, HealthPlannerStore, CURRENT_SCHEMA_VERSION } from '../schemas/store.schema';

const MIGRATIONS_REGISTRY: Migration[] = [
  v1_to_v2,
  // Future migrations added here (e.g. v2_to_v3)
];

export interface MigrationResult {
  success: boolean;
  store: HealthPlannerStore | null;
  migratedFromVersion: number;
  error?: string;
}

export function migrateAndValidateStore(rawPayload: unknown): MigrationResult {
  if (typeof rawPayload !== 'object' || rawPayload === null) {
    return { success: false, store: null, migratedFromVersion: 0, error: 'Payload is not a valid JSON object' };
  }

  let data = JSON.parse(JSON.stringify(rawPayload)) as Record<string, any>;
  const inputVersion = typeof data.version === 'number' ? data.version : 1;

  if (inputVersion > CURRENT_SCHEMA_VERSION) {
    return {
      success: false,
      store: null,
      migratedFromVersion: inputVersion,
      error: `Payload version (${inputVersion}) is newer than supported version (${CURRENT_SCHEMA_VERSION}). Please update the app.`,
    };
  }

  let currentVersion = inputVersion;

  // Sequentially execute pending migrations
  while (currentVersion < CURRENT_SCHEMA_VERSION) {
    const migration = MIGRATIONS_REGISTRY.find((m) => m.fromVersion === currentVersion);
    if (!migration) {
      return {
        success: false,
        store: null,
        migratedFromVersion: inputVersion,
        error: `Missing migration step from version ${currentVersion}`,
      };
    }
    try {
      data = migration.migrate(data);
      currentVersion = migration.toVersion;
    } catch (err) {
      return {
        success: false,
        store: null,
        migratedFromVersion: inputVersion,
        error: `Migration failed at step v${migration.fromVersion} -> v${migration.toVersion}: ${String(err)}`,
      };
    }
  }

  // Runtime Zod Schema Validation
  const validationResult = HealthPlannerStoreSchema.safeParse(data);
  if (!validationResult.success) {
    console.error('Zod Validation Failure:', validationResult.error.format());
    return {
      success: false,
      store: null,
      migratedFromVersion: inputVersion,
      error: `Schema validation failed: ${validationResult.error.issues.map((i) => i.message).join(', ')}`,
    };
  }

  return {
    success: true,
    store: validationResult.data,
    migratedFromVersion: inputVersion,
  };
}
```

---

## 5. State Management & Offline-First Architecture

### Data Persistence Architecture

```
                      +-----------------------------+
                      |     UI React Components     |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |  Zustand Main Store         |
                      |  (In-Memory State & Actions)|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   IndexedDB Storage Adapter |
                      |   (Local Persistent Storage)|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |   Google Drive Sync Engine  |
                      |   (OAuth 2.0 / drive.appdata)|
                      +-----------------------------+
```

### 1. IndexedDB Persistence Layer (`src/db/indexedDb.ts`)
```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { HealthPlannerStore } from '../schemas/store.schema';

interface HealthPlannerDB extends DBSchema {
  store: {
    key: string;
    value: HealthPlannerStore;
  };
  sync_queue: {
    key: string;
    value: { id: string; action: string; payload: any; timestamp: string };
  };
}

const DB_NAME = 'health_planner_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HealthPlannerDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HealthPlannerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('store')) {
          db.createObjectStore('store');
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveLocalStore(store: HealthPlannerStore): Promise<void> {
  const db = await getDB();
  await db.put('store', store, 'latest_store');
}

export async function loadLocalStore(): Promise<HealthPlannerStore | null> {
  const db = await getDB();
  const store = await db.get('store', 'latest_store');
  return store || null;
}
```

### 2. Main Zustand Store (`src/store/useAppStore.ts`)
```typescript
import { create } from 'zustand';
import { HealthPlannerStore, HealthLogEntry } from '../schemas/store.schema';
import { saveLocalStore, loadLocalStore } from '../db/indexedDb';

interface AppStoreState {
  store: HealthPlannerStore | null;
  isInitialized: boolean;
  isDirty: boolean;
  initStore: (initialStore: HealthPlannerStore) => void;
  upsertLog: (entry: Partial<HealthLogEntry> & { date: string }) => Promise<void>;
  updateProfile: (profileData: Partial<HealthPlannerStore['profile']>) => Promise<void>;
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  store: null,
  isInitialized: false,
  isDirty: false,

  initStore: (initialStore) => {
    set({ store: initialStore, isInitialized: true, isDirty: false });
  },

  upsertLog: async (entry) => {
    const state = get();
    if (!state.store) return;

    const existingIdx = state.store.healthLogs.findIndex((l) => l.date === entry.date);
    const updatedLogs = [...state.store.healthLogs];

    const now = new Date().toISOString();
    if (existingIdx >= 0) {
      updatedLogs[existingIdx] = {
        ...updatedLogs[existingIdx],
        ...entry,
        updatedAt: now,
      };
    } else {
      updatedLogs.push({
        id: crypto.randomUUID(),
        date: entry.date,
        updatedAt: now,
        ...entry,
      });
    }

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      meta: {
        ...state.store.meta,
        lastModified: now,
      },
      healthLogs: updatedLogs,
    };

    set({ store: updatedStore, isDirty: true });
    await saveLocalStore(updatedStore);
  },

  updateProfile: async (profileData) => {
    const state = get();
    if (!state.store) return;

    const now = new Date().toISOString();
    const updatedStore: HealthPlannerStore = {
      ...state.store,
      meta: {
        ...state.store.meta,
        lastModified: now,
      },
      profile: {
        ...state.store.profile,
        ...profileData,
      },
    };

    set({ store: updatedStore, isDirty: true });
    await saveLocalStore(updatedStore);
  },
}));
```

### 3. Google Drive Sync Engine & Conflict Resolution

#### Google Drive Service (`src/services/gdrive/gdrive.service.ts`)
- Uses the `https://www.googleapis.com/auth/drive.appdata` scope.
- Files stored in `appDataFolder` are invisible to user's regular Google Drive, keeping data isolated and safe from accidental deletion.

```typescript
const GDRIVE_FILENAME = 'health_planner_store.json';

export class GDriveService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  // Find existing file in appDataFolder
  async findStoreFile(): Promise<{ id: string; modifiedTime: string } | null> {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${GDRIVE_FILENAME}'&fields=files(id,modifiedTime)`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      }
    );
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  }

  // Download store payload
  async downloadStore(fileId: string): Promise<unknown> {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return await res.json();
  }

  // Create or Update store payload
  async uploadStore(payload: object, fileId?: string): Promise<void> {
    const metadata = {
      name: GDRIVE_FILENAME,
      parents: fileId ? undefined : ['appDataFolder'],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));

    const url = fileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
      : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

    const method = fileId ? 'PATCH' : 'POST';

    await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${this.accessToken}` },
      body: form,
    });
  }
}
```

#### Sync Strategy & Conflict Detection (`src/services/sync/syncManager.ts`)

```typescript
import { HealthPlannerStore } from '../../schemas/store.schema';
import { migrateAndValidateStore } from '../../migrations';

export type SyncStatus = 'IDLE' | 'SYNCING' | 'SUCCESS' | 'CONFLICT' | 'ERROR';

export async function executeSync(
  localStore: HealthPlannerStore,
  gDriveService: GDriveService
): Promise<{ status: SyncStatus; mergedStore?: HealthPlannerStore; error?: string }> {
  try {
    const remoteFile = await gDriveService.findStoreFile();

    if (!remoteFile) {
      // Remote does not exist -> Push local
      await gDriveService.uploadStore(localStore);
      return { status: 'SUCCESS', mergedStore: localStore };
    }

    const rawRemote = await gDriveService.downloadStore(remoteFile.id);
    const migrationResult = migrateAndValidateStore(rawRemote);

    if (!migrationResult.success || !migrationResult.store) {
      return { status: 'ERROR', error: `Remote data invalid: ${migrationResult.error}` };
    }

    const remoteStore = migrationResult.store;

    const localTime = new Date(localStore.meta.lastModified).getTime();
    const remoteTime = new Date(remoteStore.meta.lastModified).getTime();

    if (localTime === remoteTime) {
      return { status: 'SUCCESS', mergedStore: localStore };
    }

    if (localTime > remoteTime) {
      // Local is newer -> Push to Remote
      await gDriveService.uploadStore(localStore, remoteFile.id);
      return { status: 'SUCCESS', mergedStore: localStore };
    } else {
      // Remote is newer -> Merged using Last-Write-Wins (LWW) per log entry
      const mergedLogsMap = new Map();

      localStore.healthLogs.forEach((log) => mergedLogsMap.set(log.date, log));
      remoteStore.healthLogs.forEach((log) => {
        const existing = mergedLogsMap.get(log.date);
        if (!existing || new Date(log.updatedAt).getTime() > new Date(existing.updatedAt).getTime()) {
          mergedLogsMap.set(log.date, log);
        }
      });

      const mergedStore: HealthPlannerStore = {
        ...remoteStore,
        healthLogs: Array.from(mergedLogsMap.values()),
        meta: {
          ...remoteStore.meta,
          lastModified: new Date().toISOString(),
        },
      };

      await gDriveService.uploadStore(mergedStore, remoteFile.id);
      return { status: 'SUCCESS', mergedStore };
    }
  } catch (err) {
    return { status: 'ERROR', error: String(err) };
  }
}
```

---

## 6. GitHub Pages Deployment Pipeline

### 1. SPA Fallback (`public/404.html`)
To prevent HTTP 404 errors when navigating directly to client-side routes on GitHub Pages, add a `404.html` fallback page in `public/` that redirects to `index.html`.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Health Planner</title>
    <script type="text/javascript">
      // SPA redirect for GitHub Pages
      var pathSegmentsToKeep = 1;
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

### 2. GitHub Actions Deployment Workflow (`.github/workflows/deploy.yml`)

```yaml
name: Deploy Health Planner PWA to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup Node.js Environment
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Typecheck TypeScript
        run: npx tsc --noEmit

      - name: Build Application with Vite
        run: npm run build
        env:
          NODE_ENV: production

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 7. Key Architecture Principles & Guarantees

1. **Schema Integrity:** Any payload retrieved from LocalStorage, IndexedDB, or Google Drive MUST pass through `migrateAndValidateStore()`. Raw JSON is never directly injected into application state.
2. **Offline-First:** All mutations update IndexedDB asynchronously immediately. Sync with Google Drive runs in the background when an active internet connection (`navigator.onLine`) and valid OAuth session are detected.
3. **Privacy First:** User data is strictly confined to local browser storage and the user's private Google Drive `appDataFolder`. No custom backend servers handle personal health data.
4. **Resilient Upgrades:** Migration functions (`v1_to_v2.ts`, `v2_to_v3.ts`) are modular, unit-testable, and guaranteed to execute sequentially to support any historical schema version upgrade path.

This specification provides a complete blueprint for the frontend architecture.
