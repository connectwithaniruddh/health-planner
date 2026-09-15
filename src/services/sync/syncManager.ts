import { HealthPlannerStore } from '../../schemas/store.schema';
import { gDriveService } from '../gdrive/gdrive.service';
import { migrateAndValidateStore } from '../../migrations';

export type SyncResultStatus = 'SUCCESS' | 'CONFLICT' | 'ERROR';

export async function executeGoogleDriveSync(
  localStore: HealthPlannerStore
): Promise<{ status: SyncResultStatus; mergedStore?: HealthPlannerStore; error?: string }> {
  try {
    const remoteFile = await gDriveService.findStoreFile();

    if (!remoteFile) {
      // Remote file does not exist -> Push local store
      await gDriveService.uploadStore(localStore);
      return { status: 'SUCCESS', mergedStore: localStore };
    }

    // Remote file exists -> Download & Auto-migrate schema
    const rawRemote = await gDriveService.downloadStore(remoteFile.id);
    const migrationResult = migrateAndValidateStore(rawRemote);

    if (!migrationResult.success || !migrationResult.store) {
      return { status: 'ERROR', error: `Remote data validation error: ${migrationResult.error}` };
    }

    const remoteStore = migrationResult.store;

    const localTime = new Date(localStore.meta.lastModified).getTime();
    const remoteTime = new Date(remoteStore.meta.lastModified).getTime();

    if (localTime >= remoteTime) {
      // Local is newer or equal -> Push local to Google Drive
      await gDriveService.uploadStore(localStore, remoteFile.id);
      return { status: 'SUCCESS', mergedStore: localStore };
    } else {
      // Remote is newer -> Merge daily logs (Last-Write-Wins per date)
      const mergedDailyLogs = { ...remoteStore.dailyLogs };
      Object.entries(localStore.dailyLogs).forEach(([date, localLog]) => {
        const remoteLog = mergedDailyLogs[date];
        if (!remoteLog || new Date(localLog.updatedAt).getTime() > new Date(remoteLog.updatedAt).getTime()) {
          mergedDailyLogs[date] = localLog;
        }
      });

      const mergedStore: HealthPlannerStore = {
        ...remoteStore,
        dailyLogs: mergedDailyLogs,
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
