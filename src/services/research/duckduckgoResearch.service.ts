export interface RecipeResearchResult {
  query: string;
  title: string;
  sourceUrl?: string;
  abstract: string;
  category: string;
  dietaryType: 'VEGAN' | 'VEGETARIAN' | 'EGGETARIAN' | 'NON_VEGETARIAN';
  estimatedMacros: {
    caloriesKcal: number;
    carbsG: number;
    proteinG: number;
    fatG: number;
    fiberG: number;
  };
  keyIngredients: string[];
  healthNotes: string[];
}

export class DuckDuckGoResearchService {
  /**
   * Free, zero-API-key open web researcher using DuckDuckGo Instant Answers and Indian recipe heuristics
   */
  public async researchDish(dishName: string): Promise<RecipeResearchResult> {
    const cleanQuery = dishName.trim();
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery + ' Indian food recipe nutrition')}&format=json&no_html=1&skip_disambig=1`;

    let abstract = '';
    let heading = cleanQuery;
    let sourceUrl = '';

    try {
      const response = await fetch(ddgUrl);
      if (response.ok) {
        const data = await response.json();
        abstract = data.AbstractText || data.Definition || '';
        heading = data.Heading || cleanQuery;
        sourceUrl = data.AbstractURL || '';
      }
    } catch (err) {
      console.warn('DuckDuckGo research fetch error (falling back to nutritional heuristics):', err);
    }

    if (!abstract) {
      abstract = `${cleanQuery} is an authentic traditional Indian preparation incorporating aromatic spices, lentils, grains, or vegetables tailored to regional Indian cuisine.`;
    }

    // Infer dietary type
    const lower = cleanQuery.toLowerCase();
    let dietaryType: RecipeResearchResult['dietaryType'] = 'VEGETARIAN';
    if (lower.includes('chicken') || lower.includes('mutton') || lower.includes('fish') || lower.includes('prawn') || lower.includes('meat') || lower.includes('keema')) {
      dietaryType = 'NON_VEGETARIAN';
    } else if (lower.includes('egg') || lower.includes('anda')) {
      dietaryType = 'EGGETARIAN';
    } else if (lower.includes('salad') || lower.includes('sprouts') || lower.includes('chana') || lower.includes('poha') || lower.includes('upma') || lower.includes('roti')) {
      dietaryType = 'VEGAN';
    }

    // Macro estimation heuristics based on dish category
    let caloriesKcal = 180;
    let carbsG = 24;
    let proteinG = 6;
    let fatG = 5;
    let fiberG = 3;

    if (lower.includes('paneer')) {
      caloriesKcal = 260;
      proteinG = 14;
      fatG = 18;
      carbsG = 8;
    } else if (lower.includes('dal') || lower.includes('rajma') || lower.includes('chole')) {
      caloriesKcal = 190;
      proteinG = 9;
      carbsG = 28;
      fatG = 4;
      fiberG = 6;
    } else if (lower.includes('chilla') || lower.includes('dosa')) {
      caloriesKcal = 160;
      proteinG = 7;
      carbsG = 25;
      fatG = 4;
    } else if (lower.includes('khichdi') || lower.includes('pulao') || lower.includes('biryani')) {
      caloriesKcal = 240;
      proteinG = 6;
      carbsG = 42;
      fatG = 6;
    } else if (lower.includes('pakoda') || lower.includes('puri') || lower.includes('bhatura') || lower.includes('samosa')) {
      caloriesKcal = 320;
      fatG = 18;
      carbsG = 35;
      proteinG = 5;
    }

    const keyIngredients = [
      'Cumin & Mustard Seeds',
      'Turmeric & Coriander Powder',
      'Fresh Ginger-Garlic & Green Chillies',
      'Himalayan Salt & Cold-Pressed Mustard or Sesame Oil',
    ];

    const healthNotes: string[] = [];
    if (fiberG >= 4) healthNotes.push('High dietary fiber supports gut microbiome diversity and glucose blunting.');
    if (proteinG >= 10) healthNotes.push('Quality protein density aids lean muscle preservation during calorie deficit.');
    if (fatG >= 15) healthNotes.push('Calorically dense in fats — recommend reducing cooking oil or opting for air-fried / steamed preparation.');

    return {
      query: cleanQuery,
      title: heading,
      sourceUrl,
      abstract,
      category: lower.includes('snack') || lower.includes('chaat') ? 'Snacks' : 'Main Course',
      dietaryType,
      estimatedMacros: {
        caloriesKcal,
        carbsG,
        proteinG,
        fatG,
        fiberG,
      },
      keyIngredients,
      healthNotes,
    };
  }
}

export const duckDuckGoResearcher = new DuckDuckGoResearchService();
