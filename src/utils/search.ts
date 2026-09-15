export interface SearchableFood {
  food_id: string;
  name: {
    english: string;
    hindi?: string;
    regional_aliases?: string[];
  };
  category: string;
  region: string;
  dietary_type: string;
  nutrients_per_100g: {
    calories_kcal: number;
    carbohydrates_g: number;
    protein_g: number;
    fat_g: number;
    fiber_g?: number;
  };
  glycemic_profile?: {
    index: number;
    category: string;
  };
  serving_units: Array<{
    unit_name: string;
    gram_weight: number;
    is_default: boolean;
  }>;
}

/**
 * Performs fuzzy search on Indian food items matching English name, Hindi name, or regional aliases
 */
export function searchIndianFoods(foods: SearchableFood[], query: string): SearchableFood[] {
  if (!query || query.trim() === '') return foods.slice(0, 15);

  const cleanQuery = query.toLowerCase().trim();

  return foods.filter((item) => {
    const englishMatch = item.name.english.toLowerCase().includes(cleanQuery);
    const hindiMatch = item.name.hindi ? item.name.hindi.toLowerCase().includes(cleanQuery) : false;
    const categoryMatch = item.category.toLowerCase().includes(cleanQuery);
    const aliasMatch = item.name.regional_aliases
      ? item.name.regional_aliases.some((alias) => alias.toLowerCase().includes(cleanQuery))
      : false;

    return englishMatch || hindiMatch || categoryMatch || aliasMatch;
  });
}
