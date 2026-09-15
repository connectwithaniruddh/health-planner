import { Migration } from './types';

export const v2_to_v3: Migration = {
  fromVersion: 2,
  toVersion: 3,
  migrate: (v2Data: Record<string, any>) => {
    return {
      ...v2Data,
      schemaVersion: 3,
      medicalMarkers: v2Data.medicalMarkers || [],
      profile: {
        ...v2Data.profile,
        medicalConditions: v2Data.profile?.medicalConditions || [],
        dietaryRestrictions: v2Data.profile?.dietaryRestrictions || [],
        allergies: v2Data.profile?.allergies || [],
      },
    };
  },
};
