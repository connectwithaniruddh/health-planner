export const APP_NAME = 'Health Planner';
export const CURRENT_SCHEMA_VERSION = 3;

export const LOCAL_STORAGE_KEY = 'health_planner_store_v3';
export const INDEXED_DB_NAME = 'health_planner_db';
export const GDRIVE_FILENAME = 'health_planner_data.json';

// Minimum Calorie Intake Floor (Clinical Guardrails)
export const MIN_CALORIE_FLOOR_FEMALE = 1200;
export const MIN_CALORIE_FLOOR_MALE = 1500;

// Fat Mass Energy Constant
export const KCAL_PER_KG_FAT = 7700;

// Household Portion Preset Conversions (Grams/ml)
export const KATORI_VOLUMES = {
  small: { name: 'Small Katori', volumeMl: 100, gramWeight: 100 },
  medium: { name: 'Standard Katori', volumeMl: 150, gramWeight: 150 },
  large: { name: 'Large Bowl', volumeMl: 220, gramWeight: 220 },
} as const;
