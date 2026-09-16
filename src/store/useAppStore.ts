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

export const useAppStore = create<AppStoreState>((set, get) => ({
  store: INITIAL_STORE,
  isInitialized: false,
  activeTab: 'dashboard',
  selectedDate: new Date().toISOString().split('T')[0],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  initStore: async () => {
    const loaded = await loadLocalStore();
    if (loaded) {
      set({ store: loaded, isInitialized: true });
    } else {
      await saveLocalStore(INITIAL_STORE);
      set({ store: INITIAL_STORE, isInitialized: true });
    }
  },

  setCompleteStore: async (newStore) => {
    set({ store: newStore });
    await saveLocalStore(newStore);
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
    const updatedFasting: FastingState = {
      ...state.store.fastingState,
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
