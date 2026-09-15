import { MIN_CALORIE_FLOOR_FEMALE, MIN_CALORIE_FLOOR_MALE, KCAL_PER_KG_FAT } from '../config/constants';

export interface BMRParams {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: 'male' | 'female' | 'other';
}

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor Equation
 */
export function calculateBMR({ weightKg, heightCm, age, gender }: BMRParams): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  const s = gender === 'female' ? -161 : 5; // Default male/other to +5
  return Math.round(base + s);
}

export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';

export const PAL_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.200,
  lightly_active: 1.375,
  moderately_active: 1.550,
  very_active: 1.725,
  extra_active: 1.900,
};

/**
 * Calculates Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = PAL_MULTIPLIERS[activityLevel] || 1.200;
  return Math.round(bmr * multiplier);
}

/**
 * Calculates Daily Calorie Intake Target with Clinical Safety Floor Enforcement
 */
export function calculateTargetCalories(
  tdee: number,
  weeklyTargetKgStr: '0.25' | '0.50' | '0.75' | '1.00',
  gender: 'male' | 'female' | 'other'
): number {
  const weeklyTargetKg = parseFloat(weeklyTargetKgStr);
  const dailyDeficitNeeded = (weeklyTargetKg * KCAL_PER_KG_FAT) / 7;
  const targetUncapped = tdee - dailyDeficitNeeded;

  const minimumFloor = gender === 'female' ? MIN_CALORIE_FLOOR_FEMALE : MIN_CALORIE_FLOOR_MALE;
  return Math.max(Math.round(targetUncapped), minimumFloor);
}

export interface BMICategory {
  bmi: number;
  whoCategory: string;
  asianCategory: string;
  colorHex: string;
}

/**
 * Calculates Body Mass Index (BMI) with WHO & Asian/Indian ICMR cutoffs
 */
export function calculateBMI(weightKg: number, heightCm: number): BMICategory {
  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let whoCategory = 'Normal Weight';
  let asianCategory = 'Normal Weight';
  let colorHex = '#30D158'; // Apple Green

  // WHO Standards
  if (bmi < 18.5) whoCategory = 'Underweight';
  else if (bmi < 25.0) whoCategory = 'Normal Weight';
  else if (bmi < 30.0) whoCategory = 'Overweight';
  else whoCategory = 'Obese';

  // Asian / ICMR Standards
  if (bmi < 18.5) {
    asianCategory = 'Underweight';
    colorHex = '#64D2FF'; // Cyan
  } else if (bmi < 23.0) {
    asianCategory = 'Normal Weight';
    colorHex = '#30D158'; // Green
  } else if (bmi < 25.0) {
    asianCategory = 'Overweight (Pre-obese)';
    colorHex = '#FFD60A'; // Yellow
  } else {
    asianCategory = 'Obese';
    colorHex = '#FF375F'; // Red
  }

  return { bmi, whoCategory, asianCategory, colorHex };
}

/**
 * Calculates Target Completion Date with Metabolic Adaptation Factor
 */
export function calculateTargetDate(
  currentWeightKg: number,
  targetWeightKg: number,
  dailyDeficitKcal: number
): { daysNeeded: number; estimatedDate: string } {
  const deltaKg = Math.max(0, currentWeightKg - targetWeightKg);
  if (deltaKg === 0 || dailyDeficitKcal <= 0) {
    return { daysNeeded: 0, estimatedDate: new Date().toISOString().split('T')[0] };
  }

  const totalDeficitNeeded = deltaKg * KCAL_PER_KG_FAT;
  const baseDays = totalDeficitNeeded / dailyDeficitKcal;

  // Metabolic Adaptation: Adds 5% slowdown per 5kg lost
  const adaptationMultiplier = 1 + 0.05 * Math.floor(deltaKg / 5);
  const adjustedDays = Math.round(baseDays * adaptationMultiplier);

  const targetDateObj = new Date();
  targetDateObj.setDate(targetDateObj.getDate() + adjustedDays);

  return {
    daysNeeded: adjustedDays,
    estimatedDate: targetDateObj.toISOString().split('T')[0],
  };
}

/**
 * Net Calorie Burn Formula: (MET - 1.0) * Weight (kg) * Duration (hrs)
 */
export function calculateNetExerciseBurn(met: number, weightKg: number, durationMinutes: number): number {
  const durationHours = durationMinutes / 60;
  const netMet = Math.max(0, met - 1.0);
  return Math.round(netMet * weightKg * durationHours);
}

/**
 * Calculates 7-Day Moving Average for weight noise filtering
 */
export function calculate7DayMovingAverage(weights: number[]): number {
  if (weights.length === 0) return 0;
  const slice = weights.slice(-7);
  const sum = slice.reduce((acc, curr) => acc + curr, 0);
  return parseFloat((sum / slice.length).toFixed(1));
}

/**
 * Home-Cooked Indian Calorie & Oil Adjustment Engine
 */
export function calculateAdjustedDishCalories(
  baseCaloriesPer100g: number,
  gramWeight: number,
  oilLevel: 'low' | 'standard' | 'restaurant'
): { totalCalories: number; oilCaloriesAdded: number } {
  const baseCalories = (baseCaloriesPer100g * gramWeight) / 100;
  
  let oilCaloriesAdded = 0;
  if (oilLevel === 'low') oilCaloriesAdded = 20; // ~0.5 tsp oil
  else if (oilLevel === 'standard') oilCaloriesAdded = 40; // ~1 tsp oil
  else if (oilLevel === 'restaurant') oilCaloriesAdded = 120; // ~1 tbsp oil

  return {
    totalCalories: Math.round(baseCalories + oilCaloriesAdded),
    oilCaloriesAdded,
  };
}
