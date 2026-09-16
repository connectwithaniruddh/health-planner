import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { foodCatalog, FoodItem } from '../../services/data/foodCatalog.service';
import { duckDuckGoResearcher, RecipeResearchResult } from '../../services/research/duckduckgoResearch.service';
import { calculateAdjustedDishCalories } from '../../utils/calculations';
import { IndianUnitSelector } from './IndianUnitSelector';
import { Search, Utensils, X, Plus, Trash2, Sparkles, Filter, Globe, Loader2, AlertCircle } from 'lucide-react';

export const FoodLogModal: React.FC = () => {
  const { store, selectedDate, logFoodItem, deleteFoodItem } = useAppStore();
  const dailyLog = store.dailyLogs[selectedDate] || { foodLogs: [] };

  const [query, setQuery] = useState('');
  const [selectedMealCategory, setSelectedMealCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [activeFood, setActiveFood] = useState<FoodItem | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedUnitName, setSelectedUnitName] = useState('1 Piece (40g)');
  const [oilLevel, setOilLevel] = useState<'low' | 'standard' | 'restaurant'>('standard');

  // Web research state
  const [isResearching, setIsResearching] = useState(false);
  const [researchResult, setResearchResult] = useState<RecipeResearchResult | null>(null);

  // Context-Aware Prioritized Foods Filter with Strict Dietary Segregation
  const prioritizedFoods = useMemo(() => {
    const cleanQuery = query.toLowerCase().trim();

    // Map meal categories to food category matches
    const categoryTargetMap: Record<string, string[]> = {
      snack: ['Snacks & Street Food', 'Sweets & Desserts', 'Beverages & Dairy'],
      breakfast: ['Breakfast Foods', 'Cereals & Flatbreads', 'Beverages & Dairy'],
      lunch: ['Cereals & Flatbreads', 'Pulses & Legumes', 'Curries & Gravies', 'Curries & Soups'],
      dinner: ['Cereals & Flatbreads', 'Pulses & Legumes', 'Curries & Gravies', 'Curries & Soups'],
    };

    const targetCategories = categoryTargetMap[selectedMealCategory] || [];

    // Query through central food catalog with strict dietary enforcement
    const foods = foodCatalog.query({
      search: cleanQuery,
      region: selectedRegion,
      dietaryPreference: store.profile.dietaryPreference || 'pure_veg',
      medicalConditions: store.profile.medicalConditions,
    });

    return [...foods].sort((a, b) => {
      // Prioritize matching category first
      const aMatchesCat = targetCategories.includes(a.category) ? 1 : 0;
      const bMatchesCat = targetCategories.includes(b.category) ? 1 : 0;
      if (aMatchesCat !== bMatchesCat) return bMatchesCat - aMatchesCat;

      return a.name.english.localeCompare(b.name.english);
    });
  }, [query, selectedMealCategory, selectedRegion, store.profile.dietaryPreference, store.profile.medicalConditions]);

  const handleSelectFood = (food: FoodItem) => {
    setActiveFood(food);
    const defaultUnit = food.serving_units.find((u: any) => u.is_default) || food.serving_units[0];
    if (defaultUnit) {
      setSelectedUnitName(defaultUnit.unit_name);
    }
    setQuantity(1);
  };

  const handleConfirmLog = async () => {
    if (!activeFood) return;

    const chosenUnitObj =
      activeFood.serving_units.find((u) => u.unit_name === selectedUnitName) || activeFood.serving_units[0];
    const totalGramWeight = Math.round(chosenUnitObj.gram_weight * quantity);

    const { totalCalories } = calculateAdjustedDishCalories(
      activeFood.nutrients_per_100g.calories_kcal,
      totalGramWeight,
      oilLevel
    );

    const proteinG = parseFloat(((activeFood.nutrients_per_100g.protein_g * totalGramWeight) / 100).toFixed(1));
    const carbsG = parseFloat(((activeFood.nutrients_per_100g.carbohydrates_g * totalGramWeight) / 100).toFixed(1));
    const fatG = parseFloat(((activeFood.nutrients_per_100g.fat_g * totalGramWeight) / 100).toFixed(1));
    const fiberG = activeFood.nutrients_per_100g.fiber_g
      ? parseFloat(((activeFood.nutrients_per_100g.fiber_g * totalGramWeight) / 100).toFixed(1))
      : 0;

    await logFoodItem({
      foodId: activeFood.food_id,
      name: activeFood.name.english,
      mealCategory: selectedMealCategory,
      quantity,
      servingUnit: selectedUnitName,
      gramWeightTotal: totalGramWeight,
      calories: totalCalories,
      proteinG,
      carbsG,
      fatG,
      fiberG,
      oilLevel,
    });

    setActiveFood(null);
    setQuery('');
  };

  const handleWebResearch = async () => {
    if (!query.trim()) return;
    setIsResearching(true);
    const res = await duckDuckGoResearcher.researchDish(query);
    setResearchResult(res);
    setIsResearching(false);
  };

  const handleLogResearchedDish = async () => {
    if (!researchResult) return;
    await logFoodItem({
      foodId: `CUSTOM_${Date.now()}`,
      name: researchResult.title,
      mealCategory: selectedMealCategory,
      quantity: 1,
      servingUnit: '1 Standard Serving',
      gramWeightTotal: 150,
      calories: researchResult.estimatedMacros.caloriesKcal,
      proteinG: researchResult.estimatedMacros.proteinG,
      carbsG: researchResult.estimatedMacros.carbsG,
      fatG: researchResult.estimatedMacros.fatG,
      fiberG: researchResult.estimatedMacros.fiberG,
      oilLevel: 'standard',
    });
    setResearchResult(null);
    setQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-rounded text-white">Indian Food Calorie Tracker</h2>
          <p className="text-xs text-slate-400">
            80+ Authentic Dishes • Strict {store.profile.dietaryPreference.replace('_', ' ').toUpperCase()} Filter • Log for {selectedDate}
          </p>
        </div>

        {/* Meal Category Priority Selector */}
        <div className="flex gap-1 p-1 bg-neutral-800/80 rounded-2xl border border-white/10">
          {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedMealCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedMealCategory === cat
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search & DuckDuckGo Open Web Research Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={`Search ${selectedMealCategory} dishes (Dhokla, Poha, Vada Pav, Dal Tadka...)...`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResearchResult(null);
            }}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-900/80 border border-white/10 focus:border-emerald-400 text-white text-xs font-medium outline-none transition-all placeholder:text-slate-500"
          />
        </div>

        {query.trim().length > 1 && (
          <button
            type="button"
            onClick={handleWebResearch}
            disabled={isResearching}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 text-xs font-bold transition-all shrink-0"
          >
            {isResearching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Researching...</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>Research on Web</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* DuckDuckGo Web Research Result Card */}
      {researchResult && (
        <div className="p-4 rounded-3xl bg-purple-950/40 border border-purple-500/40 backdrop-blur-xl space-y-3 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                🌐 DuckDuckGo Open Nutrition Research
              </span>
              <h4 className="text-sm font-bold text-white">{researchResult.title}</h4>
              <p className="text-xs text-slate-300 line-clamp-2">{researchResult.abstract}</p>
            </div>
            <button
              onClick={handleLogResearchedDish}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md transition-all shrink-0 ml-3"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Dish</span>
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            <div className="p-2 bg-neutral-900/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">Calories</span>
              <span className="font-bold text-amber-400">{researchResult.estimatedMacros.caloriesKcal} kcal</span>
            </div>
            <div className="p-2 bg-neutral-900/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">Protein</span>
              <span className="font-bold text-cyan-400">{researchResult.estimatedMacros.proteinG}g</span>
            </div>
            <div className="p-2 bg-neutral-900/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">Carbs</span>
              <span className="font-bold text-yellow-400">{researchResult.estimatedMacros.carbsG}g</span>
            </div>
            <div className="p-2 bg-neutral-900/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">Fat</span>
              <span className="font-bold text-rose-400">{researchResult.estimatedMacros.fatG}g</span>
            </div>
            <div className="p-2 bg-neutral-900/60 rounded-xl border border-white/5">
              <span className="text-[10px] text-slate-400 block">Diet Type</span>
              <span className="font-bold text-emerald-400">{researchResult.dietaryType}</span>
            </div>
          </div>
        </div>
      )}

      {/* Selected Food Detail / Serving Customizer */}
      {activeFood ? (
        <div className="p-6 rounded-3xl bg-neutral-900/70 border border-white/10 backdrop-blur-xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{activeFood.name.english}</h3>
              {activeFood.name.hindi && <p className="text-xs text-slate-400">{activeFood.name.hindi}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-bold">
                  {activeFood.dietary_type}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-[10px] font-medium">
                  {activeFood.region}
                </span>
                {activeFood.glycemic_profile && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-[10px] font-medium">
                    GI: {activeFood.glycemic_profile.category} ({activeFood.glycemic_profile.index})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveFood(null)}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clinical Advisories for Active Food */}
          {foodCatalog.getClinicalAdvisories(activeFood, store.profile.medicalConditions).length > 0 && (
            <div className="space-y-1.5">
              {foodCatalog.getClinicalAdvisories(activeFood, store.profile.medicalConditions).map((badge, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-2xl border text-xs flex items-start gap-2 ${
                    badge.level === 'warning'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">{badge.text}: </span>
                    <span>{badge.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <IndianUnitSelector
            quantity={quantity}
            setQuantity={setQuantity}
            selectedUnit={selectedUnitName}
            setSelectedUnit={setSelectedUnitName}
            unitOptions={activeFood.serving_units}
            oilLevel={oilLevel}
            setOilLevel={setOilLevel}
          />

          <button
            onClick={handleConfirmLog}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Confirm & Log to {selectedMealCategory.toUpperCase()}</span>
          </button>
        </div>
      ) : (
        /* Prioritized Search Results Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {prioritizedFoods.map((food) => {
            const advisories = foodCatalog.getClinicalAdvisories(food, store.profile.medicalConditions);
            return (
              <div
                key={food.food_id}
                onClick={() => handleSelectFood(food)}
                className="p-4 rounded-3xl bg-neutral-900/60 border border-white/10 hover:border-emerald-500/50 hover:bg-neutral-800/80 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {food.name.english}
                    </h4>
                    <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      {food.region}
                    </span>
                  </div>
                  {food.name.hindi && <p className="text-xs text-slate-400">{food.name.hindi}</p>}

                  {/* Clinical safety tags */}
                  {advisories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {advisories.slice(0, 2).map((adv, i) => (
                        <span
                          key={i}
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                            adv.level === 'warning'
                              ? 'bg-rose-500/20 border-rose-500/30 text-rose-300'
                              : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
                          }`}
                        >
                          {adv.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800 text-xs">
                  <div>
                    <span className="font-bold font-rounded text-amber-400 tabular-nums">
                      {food.nutrients_per_100g.calories_kcal} kcal
                    </span>
                    <span className="text-[10px] text-slate-500 block">/ 100g base</span>
                  </div>
                  <button className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Logged Foods for Selected Date */}
      <div className="pt-6 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Meals Logged for {selectedDate}
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Total: {dailyLog.foodLogs.reduce((sum, item) => sum + item.calories, 0)} kcal
          </span>
        </div>

        {dailyLog.foodLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No meals logged for this day yet.</p>
        ) : (
          <div className="space-y-2">
            {dailyLog.foodLogs.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-100">{item.name}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-cyan-300 font-semibold uppercase">
                      {item.mealCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {item.quantity} x {item.servingUnit} ({item.gramWeightTotal}g) • P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold font-rounded text-amber-400 tabular-nums">
                    {item.calories} kcal
                  </span>
                  <button
                    onClick={() => deleteFoodItem(item.id)}
                    className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
