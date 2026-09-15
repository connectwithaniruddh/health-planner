import { Migration } from './types';

export const v1_to_v2: Migration = {
  fromVersion: 1,
  toVersion: 2,
  migrate: (v1Data: Record<string, any>) => {
    return {
      schemaVersion: 2,
      meta: {
        lastModified: v1Data.lastUpdated || new Date().toISOString(),
        deviceId: v1Data.deviceId || crypto.randomUUID(),
      },
      profile: v1Data.profile || {},
      dailyLogs: v1Data.dailyLogs || v1Data.logs || {},
      gamification: v1Data.gamification || {
        streakDays: 0,
        totalXp: 0,
        level: 1,
        calorieShields: 1,
        unlockedBadges: [],
        bossCurrentHp: 3500,
        bossMaxHp: 3500,
        bossDefeatedThisWeek: false,
      },
      settings: v1Data.settings || {
        theme: 'dark',
        autoSyncGoogleDrive: true,
        lastSyncedAt: null,
        units: { weight: 'kg', water: 'ml' },
      },
    };
  },
};
