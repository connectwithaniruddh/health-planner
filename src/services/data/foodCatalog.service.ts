import rawFoods from '../../data/indianFoods.json';

export interface FoodServingUnit {
  unit_name: string;
  gram_weight: number;
  is_default: boolean;
}

export interface FoodNutrients {
  calories_kcal: number;
  carbohydrates_g: number;
  protein_g: number;
  fat_g: number;
  fiber_g?: number;
  iron_mg?: number;
  calcium_mg?: number;
}

export interface FoodItem {
  food_id: string;
  ifct_code: string;
  name: {
    english: string;
    hindi: string;
    regional_aliases?: string[];
  };
  category: string;
  region: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST' | 'PAN_INDIAN';
  dietary_type: 'VEGAN' | 'VEGETARIAN' | 'EGGETARIAN' | 'NON_VEGETARIAN';
  nutrients_per_100g: FoodNutrients;
  glycemic_profile: {
    index: number;
    category: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  serving_units: FoodServingUnit[];
  clinical_tags?: string[];
}

export interface ClinicalAdvisoryBadge {
  level: 'safe' | 'warning' | 'superfood';
  text: string;
  description: string;
}

export class FoodCatalogService {
  private foods: FoodItem[];

  constructor() {
    this.foods = (rawFoods as any[]).map((f) => ({
      ...f,
      dietary_type: f.dietary_type || 'VEGETARIAN',
    }));
  }

  public getAll(): FoodItem[] {
    return this.foods;
  }

  public getById(id: string): FoodItem | undefined {
    return this.foods.find((f) => f.food_id === id);
  }

  /**
   * Strict Dietary and Clinical Query Filter
   */
  public query(params: {
    search?: string;
    category?: string;
    region?: string;
    dietaryPreference?: 'pure_veg' | 'vegan' | 'eggetarian' | 'non_veg';
    medicalConditions?: string[];
  }): FoodItem[] {
    const searchClean = (params.search || '').trim().toLowerCase();
    const pref = params.dietaryPreference || 'pure_veg';

    return this.foods.filter((food) => {
      // 1. STRICT DIETARY FILTERING
      if (pref === 'pure_veg') {
        if (food.dietary_type === 'NON_VEGETARIAN' || food.dietary_type === 'EGGETARIAN') {
          return false;
        }
      } else if (pref === 'vegan') {
        if (food.dietary_type !== 'VEGAN') {
          return false;
        }
      } else if (pref === 'eggetarian') {
        if (food.dietary_type === 'NON_VEGETARIAN') {
          return false;
        }
      }

      // 2. REGION FILTER
      if (params.region && params.region !== 'ALL') {
        if (food.region !== params.region && food.region !== 'PAN_INDIAN') {
          return false;
        }
      }

      // 3. SEARCH FILTER
      if (searchClean) {
        const matchesEnglish = food.name.english.toLowerCase().includes(searchClean);
        const matchesHindi = food.name.hindi ? food.name.hindi.toLowerCase().includes(searchClean) : false;
        const matchesCategory = food.category.toLowerCase().includes(searchClean);
        const matchesAlias = food.name.regional_aliases?.some((a) => a.toLowerCase().includes(searchClean)) || false;

        if (!matchesEnglish && !matchesHindi && !matchesCategory && !matchesAlias) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Generates Clinical Advisories for a specific food based on active patient conditions
   */
  public getClinicalAdvisories(food: FoodItem, medicalConditions: string[] = []): ClinicalAdvisoryBadge[] {
    const badges: ClinicalAdvisoryBadge[] = [];
    const gi = food.glycemic_profile.index;
    const fat = food.nutrients_per_100g.fat_g;
    const fiber = food.nutrients_per_100g.fiber_g || 0;
    const isFried = fat >= 14;
    const isHighGI = gi >= 68;

    const hasFattyLiver = medicalConditions.some((c) => c.toLowerCase().includes('fatty liver'));
    const hasDiabetes = medicalConditions.some((c) => c.toLowerCase().includes('diabet'));
    const hasCholesterol = medicalConditions.some((c) => c.toLowerCase().includes('cholesterol'));
    const hasB12Def = medicalConditions.some((c) => c.toLowerCase().includes('b12'));
    const hasIronDef = medicalConditions.some((c) => c.toLowerCase().includes('iron') || c.toLowerCase().includes('anemia'));

    // Fatty Liver (NAFLD)
    if (hasFattyLiver) {
      if (isFried) {
        badges.push({
          level: 'warning',
          text: '⚠️ Limit: Fatty Liver',
          description: 'High saturated fats and deep frying exacerbate hepatic lipid accumulation in NAFLD.',
        });
      } else if (fiber >= 3 && !isHighGI) {
        badges.push({
          level: 'superfood',
          text: '🌿 Hepatic Friendly',
          description: 'High fiber & low glycemic impact support liver glycogen stability.',
        });
      }
    }

    // Diabetes / Pre-diabetes
    if (hasDiabetes) {
      if (isHighGI) {
        badges.push({
          level: 'warning',
          text: '⚠️ High GI (Diabetes)',
          description: 'High glycemic index spikes postprandial blood glucose and insulin levels.',
        });
      } else if (gi <= 50 && fiber >= 2.5) {
        badges.push({
          level: 'superfood',
          text: '🩸 Low GI Diabetic Safe',
          description: 'Slow-digesting complex carbs sustain steady insulin response.',
        });
      }
    }

    // High Cholesterol / Dyslipidemia
    if (hasCholesterol && fat >= 12) {
      badges.push({
        level: 'warning',
        text: '⚠️ High Fat',
        description: 'Contains high lipid density. Prefer grilled, steamed, or boiled options.',
      });
    }

    // Iron / Anemia
    if (hasIronDef && (food.name.english.toLowerCase().includes('palak') || food.name.english.toLowerCase().includes('chana') || food.name.english.toLowerCase().includes('beetroot') || food.category === 'Pulses & Legumes')) {
      badges.push({
        level: 'superfood',
        text: '🩸 Iron Rich',
        description: 'Excellent plant-based iron source. Pair with Lemon (Vit C) for 3x iron absorption.',
      });
    }

    // Vitamin B12 Deficiency
    if (hasB12Def && (food.name.english.toLowerCase().includes('dahi') || food.name.english.toLowerCase().includes('paneer') || food.name.english.toLowerCase().includes('curd') || food.name.english.toLowerCase().includes('egg'))) {
      badges.push({
        level: 'superfood',
        text: '⚡ B12 Support',
        description: 'Natural vegetarian/dairy source supporting red blood cell maturation & nerve health.',
      });
    }

    return badges;
  }
}

export const foodCatalog = new FoodCatalogService();
