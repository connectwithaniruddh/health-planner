import { Migration } from './types';
import { v1_to_v2 } from './v1_to_v2';
import { v2_to_v3 } from './v2_to_v3';
import { HealthPlannerStoreSchema, HealthPlannerStore } from '../schemas/store.schema';
import { CURRENT_SCHEMA_VERSION } from '../config/constants';

const MIGRATIONS_REGISTRY: Migration[] = [
  v1_to_v2,
  v2_to_v3,
];

export interface MigrationResult {
  success: boolean;
  store: HealthPlannerStore | null;
  migratedFromVersion: number;
  error?: string;
}

export function migrateAndValidateStore(rawPayload: unknown): MigrationResult {
  if (typeof rawPayload !== 'object' || rawPayload === null) {
    return {
      success: false,
      store: null,
      migratedFromVersion: 0,
      error: 'Payload is not a valid JSON object',
    };
  }

  let data = JSON.parse(JSON.stringify(rawPayload)) as Record<string, any>;
  const inputVersion = typeof data.schemaVersion === 'number' ? data.schemaVersion : 1;

  if (inputVersion > CURRENT_SCHEMA_VERSION) {
    return {
      success: false,
      store: null,
      migratedFromVersion: inputVersion,
      error: `Payload version (${inputVersion}) is newer than supported version (${CURRENT_SCHEMA_VERSION}). Please update the app.`,
    };
  }

  let currentVersion = inputVersion;

  // Execute migration sequence until latest schema version is reached
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
      console.log(`Executing Schema Migration: v${migration.fromVersion} -> v${migration.toVersion}`);
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
