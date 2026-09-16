import { z } from 'zod';
import { CURRENT_SCHEMA_VERSION } from '../config/constants';

// --- Sub-Schemas ---
export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  gender: z.enum(['male', 'female', 'other']),
  age: z.number().int().positive(),
  heightCm: z.number().positive(),
  currentWeightKg: z.number().positive(),
  targetWeightKg: z.number().positive(),
  weeklyTargetKg: z.enum(['0.25', '0.50', '0.75', '1.00']),
  activityLevel: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active']),
  dietaryPreference: z.enum(['pure_veg', 'vegan', 'eggetarian', 'non_veg']).default('pure_veg'),
  primaryGoal: z.string().default('Lose Fat & Reverse Metabolic Conditions'),
  isOnboarded: z.boolean().default(false),
  dietMode: z.enum([
    'balanced_desi',
    'intermittent_fasting_16_8',
    'intermittent_fasting_18_6',
    'intermittent_fasting_14_10',
    'omad_23_1',
    'high_protein_desi',
    'low_carb_desi',
  ]).default('intermittent_fasting_16_8'),
  medicalConditions: z.array(z.string()).default([]),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  calculatedBmr: z.number().positive(),
  calculatedTdee: z.number().positive(),
  targetDailyCalories: z.number().positive(),
});

export const FastingStateSchema = z.object({
  isFasting: z.boolean().default(false),
  fastStartTime: z.string().nullable().default(null),
  fastTargetHours: z.number().positive().default(16),
  fastEndTime: z.string().nullable().default(null),
});

export const FoodLogEntrySchema = z.object({
  id: z.string(),
  foodId: z.string(),
  name: z.string(),
  mealCategory: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  quantity: z.number().positive(),
  servingUnit: z.string(),
  gramWeightTotal: z.number().positive(),
  calories: z.number().nonnegative(),
  proteinG: z.number().nonnegative(),
  carbsG: z.number().nonnegative(),
  fatG: z.number().nonnegative(),
  fiberG: z.number().nonnegative().optional(),
  oilLevel: z.enum(['low', 'standard', 'restaurant']).default('standard'),
  loggedAt: z.string(), // ISO timestamp
});

export const ExerciseLogEntrySchema = z.object({
  id: z.string(),
  activityName: z.string(),
  metValue: z.number().positive(),
  durationMinutes: z.number().positive(),
  grossCaloriesBurned: z.number().nonnegative(),
  netCaloriesBurned: z.number().nonnegative(),
  loggedAt: z.string(),
});

export const MedicalMarkerSchema = z.object({
  id: z.string(),
  markerName: z.string(),
  markerKey: z.string(),
  value: z.number(),
  unit: z.string(),
  status: z.enum(['optimal', 'normal', 'borderline', 'critical_low', 'critical_high']),
  testDate: z.string(),
});

export const DailyLogSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  weightKg: z.number().positive().optional(),
  movingAverage7DayKg: z.number().positive().optional(),
  waterMl: z.number().nonnegative().default(0),
  sleepHours: z.number().min(0).max(24).default(0),
  foodLogs: z.array(FoodLogEntrySchema).default([]),
  exerciseLogs: z.array(ExerciseLogEntrySchema).default([]),
  habits: z.record(z.string(), z.boolean()).default({}),
  notes: z.string().default(''),
  updatedAt: z.string(),
});

export const GamificationStateSchema = z.object({
  streakDays: z.number().int().nonnegative().default(0),
  totalXp: z.number().int().nonnegative().default(0),
  level: z.number().int().positive().default(1),
  calorieShields: z.number().int().min(0).max(2).default(1),
  unlockedBadges: z.array(z.string()).default([]),
  bossCurrentHp: z.number().nonnegative().default(3500),
  bossMaxHp: z.number().positive().default(3500),
  bossDefeatedThisWeek: z.boolean().default(false),
});

export const AppSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('dark'),
  autoSyncGoogleDrive: z.boolean().default(true),
  lastSyncedAt: z.string().nullable().default(null),
  units: z.object({
    weight: z.enum(['kg', 'lbs']).default('kg'),
    water: z.enum(['ml', 'oz']).default('ml'),
  }).default({ weight: 'kg', water: 'ml' }),
});

// --- Root Application Store Schema ---
export const HealthPlannerStoreSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  meta: z.object({
    lastModified: z.string(),
    deviceId: z.string(),
  }),
  profile: UserProfileSchema,
  fastingState: FastingStateSchema.default({
    isFasting: false,
    fastStartTime: null,
    fastTargetHours: 16,
    fastEndTime: null,
  }),
  dailyLogs: z.record(z.string(), DailyLogSchema),
  medicalMarkers: z.array(MedicalMarkerSchema).default([]),
  gamification: GamificationStateSchema,
  settings: AppSettingsSchema,
});

export type HealthPlannerStore = z.infer<typeof HealthPlannerStoreSchema>;
export type UserProfile = z.infer<typeof UserProfileSchema>;
export type FastingState = z.infer<typeof FastingStateSchema>;
export type FoodLogEntry = z.infer<typeof FoodLogEntrySchema>;
export type ExerciseLogEntry = z.infer<typeof ExerciseLogEntrySchema>;
export type DailyLog = z.infer<typeof DailyLogSchema>;
export type MedicalMarker = z.infer<typeof MedicalMarkerSchema>;
export type GamificationState = z.infer<typeof GamificationStateSchema>;
