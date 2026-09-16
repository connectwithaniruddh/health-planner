import { create } from 'zustand';
import { HealthPlannerStore, UserProfile, FoodLogEntry, ExerciseLogEntry, MedicalMarker, FastingState } from '../schemas/store.schema';
import { CURRENT_SCHEMA_VERSION } from '../config/constants';
import { loadLocalStore, saveLocalStore } from '../db/indexedDb';
import { calculateBMR, calculateTDEE, calculateTargetCalories } from '../utils/calculations';

interface AppStoreState {
  store: HealthPlannerStore;
  isInitialized: boolean;
  activeTab: 'dashboard' | 'food' | 'fasting' | 'calculators' | 'profile' | 'reports' | 'sync';
  selectedDate: string; // YYYY-MM-DD
  setActiveTab: (tab: AppStoreState['activeTab']) => void;
  setSelectedDate: (date: string) => void;
  initStore: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  startFast: (targetHours?: number) => Promise<void>;
  endFast: () => Promise<void>;
  logFoodItem: (entry: Omit<FoodLogEntry, 'id' | 'loggedAt'>) => Promise<void>;
  deleteFoodItem: (foodLogId: string) => Promise<void>;
  logExercise: (entry: Omit<ExerciseLogEntry, 'id' | 'loggedAt'>) => Promise<void>;
  deleteExercise: (exerciseLogId: string) => Promise<void>;
  logWeight: (weightKg: number) => Promise<void>;
  logWater: (amountMl: number) => Promise<void>;
  logSleep: (hours: number) => Promise<void>;
  addMedicalMarker: (marker: Omit<MedicalMarker, 'id'>) => Promise<void>;
  deleteMedicalMarker: (markerId: string) => Promise<void>;
  completeOnboarding: (profileData: Partial<UserProfile>) => Promise<void>;
  toggleDailyHabit: (habitKey: string, completed?: boolean) => Promise<void>;
  setCompleteStore: (newStore: HealthPlannerStore) => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  id: crypto.randomUUID(),
  name: 'Health Explorer',
  gender: 'female',
  age: 28,
  heightCm: 165,
  currentWeightKg: 70,
  targetWeightKg: 62,
  weeklyTargetKg: '0.50',
  activityLevel: 'lightly_active',
  dietaryPreference: 'pure_veg',
  primaryGoal: 'Lose Fat & Reverse Metabolic Conditions',
  isOnboarded: false,
  dietMode: 'intermittent_fasting_16_8',
  medicalConditions: [],
  dietaryRestrictions: ['Vegetarian'],
  allergies: [],
  calculatedBmr: 1420,
  calculatedTdee: 1953,
  targetDailyCalories: 1403,
};

const INITIAL_STORE: HealthPlannerStore = {
  schemaVersion: CURRENT_SCHEMA_VERSION,
  meta: {
    lastModified: new Date().toISOString(),
    deviceId: crypto.randomUUID(),
  },
  profile: DEFAULT_PROFILE,
  fastingState: {
    isFasting: true,
    fastStartTime: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours into fast by default
    fastTargetHours: 16,
    fastEndTime: null,
  },
  dailyLogs: {},
  medicalMarkers: [
    {
      id: crypto.randomUUID(),
      markerName: 'HbA1c',
      markerKey: 'hba1c',
      value: 5.4,
      unit: '%',
      status: 'optimal',
      testDate: '2026-08-15',
    },
    {
      id: crypto.randomUUID(),
      markerName: 'Vitamin D3',
      markerKey: 'vitamin_d',
      value: 24,
      unit: 'ng/mL',
      status: 'borderline',
      testDate: '2026-08-15',
    },
  ],
  gamification: {
    streakDays: 4,
    totalXp: 450,
    level: 3,
    calorieShields: 1,
    unlockedBadges: ['Desi Superfood Explorer', 'Hydration Hero'],
    bossCurrentHp: 2150,
    bossMaxHp: 3500,
    bossDefeatedThisWeek: false,
  },
  settings: {
    theme: 'dark',
    autoSyncGoogleDrive: true,
    lastSyncedAt: null,
    units: { weight: 'kg', water: 'ml' },
  },
};

function sanitizeAndMergeStore(rawStore: any): HealthPlannerStore {
  if (!rawStore) return INITIAL_STORE;
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    meta: {
      lastModified: rawStore.meta?.lastModified || new Date().toISOString(),
      deviceId: rawStore.meta?.deviceId || crypto.randomUUID(),
    },
    profile: {
      ...DEFAULT_PROFILE,
      ...(rawStore.profile || {}),
      isOnboarded: rawStore.profile?.isOnboarded ?? false,
      dietaryPreference: rawStore.profile?.dietaryPreference || 'pure_veg',
      primaryGoal: rawStore.profile?.primaryGoal || 'Lose Fat & Reverse Metabolic Conditions',
      dietMode: rawStore.profile?.dietMode || 'intermittent_fasting_16_8',
      medicalConditions: Array.isArray(rawStore.profile?.medicalConditions) ? rawStore.profile.medicalConditions : [],
      dietaryRestrictions: Array.isArray(rawStore.profile?.dietaryRestrictions) ? rawStore.profile.dietaryRestrictions : ['Vegetarian'],
      allergies: Array.isArray(rawStore.profile?.allergies) ? rawStore.profile.allergies : [],
    },
    fastingState: {
      isFasting: rawStore.fastingState?.isFasting ?? true,
      fastStartTime: rawStore.fastingState?.fastStartTime ?? new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      fastTargetHours: rawStore.fastingState?.fastTargetHours ?? 16,
      fastEndTime: rawStore.fastingState?.fastEndTime ?? null,
    },
    dailyLogs: rawStore.dailyLogs || {},
    medicalMarkers: Array.isArray(rawStore.medicalMarkers) && rawStore.medicalMarkers.length > 0 ? rawStore.medicalMarkers : INITIAL_STORE.medicalMarkers,
    gamification: {
      ...INITIAL_STORE.gamification,
      ...(rawStore.gamification || {}),
    },
    settings: {
      ...INITIAL_STORE.settings,
      ...(rawStore.settings || {}),
    },
  };
}

export const useAppStore = create<AppStoreState>((set, get) => ({
  store: INITIAL_STORE,
  isInitialized: false,
  activeTab: 'dashboard',
  selectedDate: new Date().toISOString().split('T')[0],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  initStore: async () => {
    const loaded = await loadLocalStore();
    const cleanStore = sanitizeAndMergeStore(loaded);
    await saveLocalStore(cleanStore);
    set({ store: cleanStore, isInitialized: true });
  },

  setCompleteStore: async (newStore) => {
    const cleanStore = sanitizeAndMergeStore(newStore);
    set({ store: cleanStore });
    await saveLocalStore(cleanStore);
  },

  updateProfile: async (profileData) => {
    const state = get();
    const updatedProfile: UserProfile = { ...state.store.profile, ...profileData };

    const bmr = calculateBMR({
      weightKg: updatedProfile.currentWeightKg,
      heightCm: updatedProfile.heightCm,
      age: updatedProfile.age,
      gender: updatedProfile.gender,
    });
    const tdee = calculateTDEE(bmr, updatedProfile.activityLevel);
    const targetDailyCalories = calculateTargetCalories(tdee, updatedProfile.weeklyTargetKg, updatedProfile.gender);

    updatedProfile.calculatedBmr = bmr;
    updatedProfile.calculatedTdee = tdee;
    updatedProfile.targetDailyCalories = targetDailyCalories;

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      profile: updatedProfile,
      meta: { ...state.store.meta, lastModified: new Date().toISOString() },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  startFast: async (targetHours = 16) => {
    const state = get();
    const now = new Date().toISOString();
    const updatedFasting: FastingState = {
      isFasting: true,
      fastStartTime: now,
      fastTargetHours: targetHours,
      fastEndTime: null,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      fastingState: updatedFasting,
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  endFast: async () => {
    const state = get();
    const now = new Date().toISOString();
    const currentFasting = state.store.fastingState || INITIAL_STORE.fastingState;
    const updatedFasting: FastingState = {
      ...currentFasting,
      isFasting: false,
      fastEndTime: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      fastingState: updatedFasting,
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  logFoodItem: async (entry) => {
    const state = get();
    const date = state.selectedDate;
    const now = new Date().toISOString();

    const existingLog = state.store.dailyLogs[date] || {
      date,
      waterMl: 0,
      sleepHours: 0,
      foodLogs: [],
      exerciseLogs: [],
      notes: '',
      updatedAt: now,
    };

    const newFoodEntry: FoodLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      loggedAt: now,
    };

    const updatedDailyLog = {
      ...existingLog,
      foodLogs: [...existingLog.foodLogs, newFoodEntry],
      updatedAt: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      dailyLogs: { ...state.store.dailyLogs, [date]: updatedDailyLog },
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  deleteFoodItem: async (foodLogId) => {
    const state = get();
    const date = state.selectedDate;
    const existingLog = state.store.dailyLogs[date];
    if (!existingLog) return;

    const now = new Date().toISOString();
    const updatedDailyLog = {
      ...existingLog,
      foodLogs: existingLog.foodLogs.filter((item) => item.id !== foodLogId),
      updatedAt: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      dailyLogs: { ...state.store.dailyLogs, [date]: updatedDailyLog },
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  logExercise: async (entry) => {
    const state = get();
    const date = state.selectedDate;
    const now = new Date().toISOString();

    const existingLog = state.store.dailyLogs[date] || {
      date,
      waterMl: 0,
      sleepHours: 0,
      foodLogs: [],
      exerciseLogs: [],
      notes: '',
      updatedAt: now,
    };

    const newExerciseEntry: ExerciseLogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      loggedAt: now,
    };

    const updatedDailyLog = {
      ...existingLog,
      exerciseLogs: [...existingLog.exerciseLogs, newExerciseEntry],
      updatedAt: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      dailyLogs: { ...state.store.dailyLogs, [date]: updatedDailyLog },
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  deleteExercise: async (exerciseLogId) => {
    const state = get();
    const date = state.selectedDate;
    const existingLog = state.store.dailyLogs[date];
    if (!existingLog) return;

    const now = new Date().toISOString();
    const updatedDailyLog = {
      ...existingLog,
      exerciseLogs: existingLog.exerciseLogs.filter((item) => item.id !== exerciseLogId),
      updatedAt: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      dailyLogs: { ...state.store.dailyLogs, [date]: updatedDailyLog },
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  logWeight: async (weightKg) => {
    const state = get();
    const date = state.selectedDate;
    const now = new Date().toISOString();

    const existingLog = state.store.dailyLogs[date] || {
      date,
      waterMl: 0,
      sleepHours: 0,
      foodLogs: [],
      exerciseLogs: [],
      notes: '',
      updatedAt: now,
    };

    const updatedDailyLog = {
      ...existingLog,
      weightKg,
      updatedAt: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      profile: { ...state.store.profile, currentWeightKg: weightKg },
      dailyLogs: { ...state.store.dailyLogs, [date]: updatedDailyLog },
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  logWater: async (amountMl) => {
    const state = get();
    const date = state.selectedDate;
    const now = new Date().toISOString();

    const existingLog = state.store.dailyLogs[date] || {
      date,
      waterMl: 0,
      sleepHours: 0,
      foodLogs: [],
      exerciseLogs: [],
      notes: '',
      updatedAt: now,
    };

    const updatedDailyLog = {
      ...existingLog,
      waterMl: Math.max(0, existingLog.waterMl + amountMl),
      updatedAt: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      dailyLogs: { ...state.store.dailyLogs, [date]: updatedDailyLog },
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  logSleep: async (hours) => {
    const state = get();
    const date = state.selectedDate;
    const now = new Date().toISOString();

    const existingLog = state.store.dailyLogs[date] || {
      date,
      waterMl: 0,
      sleepHours: 0,
      foodLogs: [],
      exerciseLogs: [],
      notes: '',
      updatedAt: now,
    };

    const updatedDailyLog = {
      ...existingLog,
      sleepHours: hours,
      updatedAt: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      dailyLogs: { ...state.store.dailyLogs, [date]: updatedDailyLog },
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  addMedicalMarker: async (marker) => {
    const state = get();
    const newMarker: MedicalMarker = { ...marker, id: crypto.randomUUID() };
    const updatedStore: HealthPlannerStore = {
      ...state.store,
      medicalMarkers: [...state.store.medicalMarkers, newMarker],
      meta: { ...state.store.meta, lastModified: new Date().toISOString() },
    };
    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  completeOnboarding: async (profileData) => {
    const state = get();
    const now = new Date().toISOString();
    const mergedProfile: UserProfile = {
      ...state.store.profile,
      ...profileData,
      isOnboarded: true,
    };

    const bmr = calculateBMR({
      weightKg: mergedProfile.currentWeightKg,
      heightCm: mergedProfile.heightCm,
      age: mergedProfile.age,
      gender: mergedProfile.gender,
    });
    const tdee = calculateTDEE(bmr, mergedProfile.activityLevel);
    const targetDailyCalories = calculateTargetCalories(tdee, mergedProfile.weeklyTargetKg, mergedProfile.gender);

    mergedProfile.calculatedBmr = bmr;
    mergedProfile.calculatedTdee = tdee;
    mergedProfile.targetDailyCalories = targetDailyCalories;

    // Gamification starter perk
    const gamification = {
      ...state.store.gamification,
      totalXp: state.store.gamification.totalXp + 100,
      unlockedBadges: Array.from(new Set([...state.store.gamification.unlockedBadges, 'Pioneer Health Hero'])),
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      profile: mergedProfile,
      gamification,
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  toggleDailyHabit: async (habitKey, completed) => {
    const state = get();
    const date = state.selectedDate;
    const now = new Date().toISOString();
    const existingLog = state.store.dailyLogs[date] || {
      date,
      waterMl: 0,
      sleepHours: 0,
      foodLogs: [],
      exerciseLogs: [],
      habits: {},
      notes: '',
      updatedAt: now,
    };

    const currentStatus = existingLog.habits?.[habitKey] ?? false;
    const newStatus = completed !== undefined ? completed : !currentStatus;

    const updatedDailyLog = {
      ...existingLog,
      habits: {
        ...(existingLog.habits || {}),
        [habitKey]: newStatus,
      },
      updatedAt: now,
    };

    const updatedStore: HealthPlannerStore = {
      ...state.store,
      dailyLogs: { ...state.store.dailyLogs, [date]: updatedDailyLog },
      meta: { ...state.store.meta, lastModified: now },
    };

    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },

  deleteMedicalMarker: async (markerId) => {
    const state = get();
    const updatedStore: HealthPlannerStore = {
      ...state.store,
      medicalMarkers: state.store.medicalMarkers.filter((m) => m.id !== markerId),
      meta: { ...state.store.meta, lastModified: new Date().toISOString() },
    };
    set({ store: updatedStore });
    await saveLocalStore(updatedStore);
  },
}));
