import { MedicalMarker, UserProfile } from '../../schemas/store.schema';

export interface ClinicalAdvisoryReport {
  id: string;
  category: 'VITAMINS' | 'METABOLIC' | 'HEPATIC' | 'LIPIDS' | 'CARDIO';
  severity: 'optimal' | 'moderate' | 'critical';
  title: string;
  badge: string;
  finding: string;
  clinicalExplanation: string;
  dietaryPrescription: string[];
  foodsToFavor: string[];
  foodsToAvoid: string[];
}

export class ClinicalAdvisoryService {
  /**
   * Evaluates patient profile, declared conditions, and lab biomarkers to produce comprehensive clinical guidance
   */
  public generateFullReport(profile: UserProfile, markers: MedicalMarker[]): ClinicalAdvisoryReport[] {
    const reports: ClinicalAdvisoryReport[] = [];
    const conditions = (profile.medicalConditions || []).map((c) => c.toLowerCase());

    const getMarker = (key: string) => markers.find((m) => m.markerKey.toLowerCase() === key.toLowerCase() || m.markerName.toLowerCase().includes(key.toLowerCase()));

    // 1. Vitamin B12 Evaluation
    const b12 = getMarker('b12');
    const b12Val = b12 ? b12.value : null;
    const hasB12Condition = conditions.some((c) => c.includes('b12'));

    if ((b12Val !== null && b12Val < 250) || hasB12Condition) {
      reports.push({
        id: 'clin_b12',
        category: 'VITAMINS',
        severity: b12Val && b12Val < 180 ? 'critical' : 'moderate',
        title: 'Vitamin B12 Deficiency / Sub-Optimal Alert',
        badge: '⚡ Vitamin B12 Low',
        finding: b12Val ? `Serum Cobalamin at ${b12Val} pg/mL (Optimal: 400-900 pg/mL)` : 'Active clinical B12 deficiency recorded',
        clinicalExplanation: 'B12 is essential for myelin sheath integrity, peripheral nerve conduction, and DNA synthesis during erythropoiesis. Deficiency causes chronic lethargy, neuropathy, and megaloblastic anemia.',
        dietaryPrescription: [
          'Incorporate fermented dairy daily (Homemade Dahi/Curd 200g, Fresh Paneer 60g).',
          'Opt for B12 fortified plant milks or nutritional yeast if strictly vegan.',
          'Consult your physician for sublingual Methylcobalamin (1000-1500 mcg/day) therapeutic supplementation.',
        ],
        foodsToFavor: ['Fresh Curd / Dahi', 'Paneer (Cottage Cheese)', 'Fortified Soya / Almond Milk', 'Sprouted Moong & Chana'],
        foodsToAvoid: ['Ultra-processed maida foods', 'Excessive alcohol (impairs ileal absorption)'],
      });
    }

    // 2. Vitamin D3 Evaluation
    const vitD = getMarker('vitamin_d') || getMarker('d3');
    const vitDVal = vitD ? vitD.value : null;
    const hasVitDCondition = conditions.some((c) => c.includes('vitamin d'));

    if ((vitDVal !== null && vitDVal < 30) || hasVitDCondition) {
      reports.push({
        id: 'clin_d3',
        category: 'VITAMINS',
        severity: vitDVal && vitDVal < 20 ? 'critical' : 'moderate',
        title: 'Vitamin D3 Insufficiency & Metabolic Impact',
        badge: '☀️ Vitamin D3 Low',
        finding: vitDVal ? `Serum 25(OH)D at ${vitDVal} ng/mL (Optimal: 40-70 ng/mL)` : 'Active clinical Vitamin D3 deficiency recorded',
        clinicalExplanation: 'Vitamin D acts as a steroid hormone regulating over 1,000 genes, calcium homeostasis, and insulin sensitivity in pancreatic beta cells. Low levels exacerbate fat retention and insulin resistance.',
        dietaryPrescription: [
          'Get 20 minutes of morning sunlight exposure (between 8:00 AM - 10:00 AM) on arms & face without sunscreen.',
          'Consume sun-exposed mushrooms and fortified milk or curd.',
          'Discuss high-dose Cholecalciferol (60,000 IU weekly for 8 weeks) with your medical doctor.',
        ],
        foodsToFavor: ['Sun-exposed Mushrooms', 'Fortified Curd & Milk', 'Almonds & Walnuts'],
        foodsToAvoid: ['Sedentary indoor confinement', 'High phytic acid unsoaked grains'],
      });
    }

    // 3. Iron, Hemoglobin & Ferritin (Anemia)
    const hb = getMarker('hemoglobin') || getMarker('iron') || getMarker('ferritin');
    const hbVal = hb ? hb.value : null;
    const isAnemic = (profile.gender === 'female' && hbVal !== null && hbVal < 12) || (profile.gender === 'male' && hbVal !== null && hbVal < 13);
    const hasAnemiaCondition = conditions.some((c) => c.includes('iron') || c.includes('anemia'));

    if (isAnemic || hasAnemiaCondition) {
      reports.push({
        id: 'clin_iron',
        category: 'METABOLIC',
        severity: hbVal && hbVal < 10.5 ? 'critical' : 'moderate',
        title: 'Iron Deficiency & Hemoglobin Oxygenation Care',
        badge: '🩸 Anemia / Iron Low',
        finding: hbVal ? `Hemoglobin at ${hbVal} g/dL (Target: >12.5 g/dL)` : 'Active iron deficiency / low hemoglobin indicated',
        clinicalExplanation: 'Iron is the core catalytic atom in hemoglobin transporting oxygen to muscle mitochondria for ATP combustion. Insufficient iron stalls cellular fat oxidation and induces chronic fatigue.',
        dietaryPrescription: [
          'Pair iron-rich foods with Vitamin C (squeeze fresh lemon on dal/palak) to boost non-heme iron absorption by up to 300%.',
          'Avoid drinking tea, green tea, or coffee within 1 hour of meals, as tannins and polyphenols bind to iron.',
          'Cook in cast-iron cookware to naturally bio-enrich Indian gravies.',
        ],
        foodsToFavor: ['Spinach / Palak', 'Roasted Black Chana (Chana-Gur)', 'Beetroot & Pomegranate', 'Rajma & Lobia'],
        foodsToAvoid: ['Chai/Coffee immediately with meals', 'Calcium supplements taken simultaneously with iron'],
      });
    }

    // 4. Hepatic Care: Fatty Liver (NAFLD) & Liver Enzymes
    const alt = getMarker('alt') || getMarker('sgpt') || getMarker('liver');
    const hasFattyLiver = conditions.some((c) => c.includes('fatty liver') || c.includes('nafld'));

    if (hasFattyLiver || (alt && alt.value > 45)) {
      reports.push({
        id: 'clin_fatty_liver',
        category: 'HEPATIC',
        severity: 'critical',
        title: 'Non-Alcoholic Fatty Liver Disease (NAFLD) Protocol',
        badge: '🧬 Fatty Liver Care Active',
        finding: alt ? `Hepatic transaminases (ALT/SGPT: ${alt.value} U/L) elevated` : 'Diagnosed hepatic steatosis (Fatty Liver Grade 1/2/3)',
        clinicalExplanation: 'Excess hepatic de novo lipogenesis converts refined carbohydrates, fructose, and saturated fats into intrahepatic triglycerides. 16:8 Fasting activates lipophagy to clean liver fat deposits.',
        dietaryPrescription: [
          'Strictly eliminate all refined sugars, sweetened fruit juices, and high fructose syrups.',
          'Follow a 16:8 Intermittent Fasting schedule to allow hepatic glycogen depletion and stimulate autophagy.',
          'Consume choline-rich foods and lipotropic spices (Turmeric/Curcumin, Methi seeds, Garlic).',
        ],
        foodsToFavor: ['Methi Dana (Fenugreek Water)', 'Moong Dal Sprouts', 'Fresh Green Tea / Matcha', 'Cruciferous Greens (Cabbage, Broccoli, Palak)', 'Raw Walnuts'],
        foodsToAvoid: ['Deep-fried Pakodas & Samosas', 'Commercial Bakery Goods & White Bread', 'Sweetened Carbonated Beverages', 'Excess Ghee / Reused cooking oil'],
      });
    }

    // 5. Diabetes & Pre-Diabetes (Glycemic Control)
    const hba1c = getMarker('hba1c');
    const hasDiabetes = conditions.some((c) => c.includes('diabet') || c.includes('sugar'));

    if (hasDiabetes || (hba1c && hba1c.value >= 5.7)) {
      const isFullDiabetic = (hba1c && hba1c.value >= 6.5) || hasDiabetes;
      reports.push({
        id: 'clin_diabetes',
        category: 'METABOLIC',
        severity: isFullDiabetic ? 'critical' : 'moderate',
        title: isFullDiabetic ? 'Type 2 Diabetes Clinical Management' : 'Pre-Diabetes & Insulin Resistance Warning',
        badge: isFullDiabetic ? '🩸 Diabetes Care' : '⚠️ Pre-Diabetes Alert',
        finding: hba1c ? `Glycated Hemoglobin (HbA1c): ${hba1c.value}% (Normal: <5.7%)` : 'Glycemic dysregulation profile active',
        clinicalExplanation: 'Chronic postprandial hyperinsulinemia blunts peripheral GLUT4 receptors. Keeping meals under a low-to-medium glycemic load prevents dangerous glucose surges.',
        dietaryPrescription: [
          'Replace polished white rice and maida with whole millets (Jowar, Bajra, Foxtail) or whole wheat with wheat bran.',
          'Eat salad (fiber) first, proteins second, and complex carbs last during meals to reduce glucose spikes by 40%.',
          'Take a brisk 10-minute walk immediately following your two major meals.',
        ],
        foodsToFavor: ['Bitter Gourd (Karela)', 'Khaman Dhokla (Steamed Besan)', 'Moong Dal Chilla', 'Cinnamon (Dalchini) Infused Water', 'Jamun & Apple'],
        foodsToAvoid: ['White Rice Thali portions (>1 cup)', 'Refined Flour Naan/Bhatura', 'Mithai & Gulab Jamun', 'Potatoes in excess'],
      });
    }

    // 6. Cardiovascular & Hypertension (Blood Pressure)
    const hasHypertension = conditions.some((c) => c.includes('hypertension') || c.includes('blood pressure') || c.includes('bp'));
    if (hasHypertension) {
      reports.push({
        id: 'clin_hypertension',
        category: 'CARDIO',
        severity: 'moderate',
        title: 'Hypertension & Endothelial Health Protocol',
        badge: '🫀 Blood Pressure Care',
        finding: 'Diagnosed hypertension / high sodium sensitivity',
        clinicalExplanation: 'Excess extracellular sodium increases fluid volume and vascular resistance, straining the left ventricle.',
        dietaryPrescription: [
          'Cap sodium intake to under 2,000 mg/day (less than 1 level teaspoon of salt total).',
          'Boost dietary Potassium from fresh vegetables to naturally promote natriuresis (sodium excretion).',
          'Eliminate commercial pickles (Achar), papads with baking soda, and processed namkeens.',
        ],
        foodsToFavor: ['Fresh Cucumber & Tomatoes', 'Coconut Water', 'Flaxseed Powder', 'Garlic (Allicin)'],
        foodsToAvoid: ['Commercial Achar (Pickle)', 'Roasted Salted Peanuts & Namkeens', 'Instant Noodles & Sauces'],
      });
    }

    return reports;
  }
}

export const clinicalAdvisoryService = new ClinicalAdvisoryService();
