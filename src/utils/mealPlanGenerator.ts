export interface DailyMealPlan {
  dayNumber: number;
  dateStr: string;
  breakfast: string;
  lunch: string;
  eveningSnack: string;
  dinner: string;
  targetCalories: number;
}

const BREAKFAST_ROTATION = [
  'Kanda Poha (1.5 Katori) + 1 Cup Masala Chai',
  '2 Steamed Idlis + 1 Bowl Sambar + Coconut Chutney',
  '1 Plain Dosa + 1 Bowl Sambar',
  'Moong Dal Chilla (2 Pcs) + Green Mint Chutney',
  'Besan Chilla (2 Pcs) with Paneer Filling',
  'Methi Thepla (2 Pcs) + 1 Katori Fresh Dahi',
  'Rava Upma (1.5 Katori) with Veggies + 1 Cup Filter Coffee',
];

const LUNCH_ROTATION = [
  '2 Whole Wheat Rotis + Dal Tadka (1 Katori) + Bhindi Masala + Cucumber Salad',
  'Rajma Masala (1 Bowl) + Steamed White Rice (1 Katori) + Chaas',
  'Chole Punjabi (1 Bowl) + 2 Phulkas + Spiced Onion Salad',
  'Palak Paneer (1 Katori) + 2 Whole Wheat Rotis + Curd',
  'Moong Dal Khichdi (1.5 Bowl) + Kadhi + Roasted Papad',
  'Paneer Butter Masala (1 Katori) + 2 Phulkas + Dal Fry',
  'Mix Vegetable Biryani (1 Plate) + Cucumber Onion Raita',
];

const SNACK_ROTATION = [
  'Khaman Dhokla (2 Pcs) + Green Tea',
  'Roasted Makhana (1 Bowl) + Spiced Buttermilk / Chaas',
  'Moong Sprouts Chaat (1 Katori) with Lemon & Mint',
  '1 Samosa (or 1 Vada Pav) + 1 Cup Masala Chai',
  'Bhel Puri (1 Plate) with tamarind & mint chutney',
  'Sev Puri (4 Pcs) + Coconut Water',
  'Paneer Tikka (3 Pcs) with Mint Dip',
];

const DINNER_ROTATION = [
  '2 Phulkas (No Oil) + Yellow Moong Dal (1 Katori) + Aloo Gobi Sabzi',
  'Vegetable Khichdi (1 Bowl) + 1 Glass Salted Chaas',
  '2 Methi Theplas + Palak Paneer (1 Katori)',
  'Steamed Rice (1 Katori) + South Indian Sambar + Beans Poriyal',
  '2 Whole Wheat Rotis + Kadai Paneer + Fresh Green Salad',
  'Dahi Rice / Curd Rice (1 Katori) with Pomegranate & Mustard Tadka',
  'Moong Dal Chilla (2 Pcs) with Stuffed Paneer & Tomato Soup',
];

/**
 * Generates a 30-day comprehensive Indian Meal Plan based on diet preference and calories
 */
export function generate30DayIndianMealPlan(startDate: Date, targetCalories = 1500): DailyMealPlan[] {
  const plan: DailyMealPlan[] = [];

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    plan.push({
      dayNumber: i + 1,
      dateStr,
      breakfast: BREAKFAST_ROTATION[i % BREAKFAST_ROTATION.length],
      lunch: LUNCH_ROTATION[i % LUNCH_ROTATION.length],
      eveningSnack: SNACK_ROTATION[i % SNACK_ROTATION.length],
      dinner: DINNER_ROTATION[i % DINNER_ROTATION.length],
      targetCalories,
    });
  }

  return plan;
}
