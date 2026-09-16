import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import indianFoodsSeed from '../../data/indianFoods.json';
import { SearchableFood } from '../../utils/search';
import { calculateAdjustedDishCalories } from '../../utils/calculations';
import { IndianUnitSelector } from './IndianUnitSelector';
import { Search, Utensils, X, Plus, Trash2, Sparkles, Filter } from 'lucide-react';

export const FoodLogModal: React.FC = () => {
  const { store, selectedDate, logFoodItem, deleteFoodItem } = useAppStore();
  const dailyLog = store.dailyLogs[selectedDate] || { foodLogs: [] };

  const [query, setQuery] = useState('');
  const [selectedMealCategory, setSelectedMealCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('snack');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [activeFood, setActiveFood] = useState<SearchableFood | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedUnitName, setSelectedUnitName] = useState('1 Piece (40g)');
  const [oilLevel, setOilLevel] = useState<'low' | 'standard' | 'restaurant'>('standard');

  // Context-Aware Prioritized Foods Filter
  const prioritizedFoods = useMemo(() => {
    const foods = indianFoodsSeed as SearchableFood[];
    const cleanQuery = query.toLowerCase().trim();

    // Map meal categories to food category matches
    const categoryTargetMap: Record<string, string[]> = {
      snack: ['Snacks & Street Food', 'Sweets & Desserts', 'Beverages & Dairy'],
      breakfast: ['Breakfast Foods', 'Cereals & Flatbreads', 'Beverages & Dairy'],
      lunch: ['Cereals & Flatbreads', 'Pulses & Legumes', 'Curries & Gravies', 'Curries & Soups'],
      dinner: ['Cereals & Flatbreads', 'Pulses & Legumes', 'Curries & Gravies', 'Curries & Soups'],
    };

    const targetCategories = categoryTargetMap[selectedMealCategory] || [];

    return foods
      .filter((item) => {
        // Query search match
        const matchesQuery =
          cleanQuery === '' ||
          item.name.english.toLowerCase().includes(cleanQuery) ||
          (item.name.hindi && item.name.hindi.toLowerCase().includes(cleanQuery)) ||
          item.category.toLowerCase().includes(cleanQuery) ||
          (item.name.regional_aliases &&
            item.name.regional_aliases.some((alias) => alias.toLowerCase().includes(cleanQuery)));

        // Region filter match
        const matchesRegion = selectedRegion === 'ALL' || item.region === selectedRegion || item.region === 'PAN_INDIAN';

        return matchesQuery && matchesRegion;
      })
      .sort((a, b) => {
        // Prioritize matching category first
        const aMatchesCat = targetCategories.includes(a.category) ? 1 : 0;
        const bMatchesCat = targetCategories.includes(b.category) ? 1 : 0;
        if (aMatchesCat !== bMatchesCat) return bMatchesCat - aMatchesCat;

        return a.name.english.localeCompare(b.name.english);
      });
  }, [query, selectedMealCategory, selectedRegion]);

  const handleSelectFood = (food: SearchableFood) => {
    setActiveFood(food);
    const defaultUnit = food.serving_units.find((u) => u.is_default) || food.serving_units[0];
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

  return (
    <div className="space-y-6">
      {/* Header & Date */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-rounded text-white">Indian Food Calorie Tracker</h2>
          <p className="text-xs text-slate-400">
            80+ Authentic Indian Dishes (ICMR-NIN IFCT Standard • Log for {selectedDate})
          </p>
        </div>

        {/* Meal Category Priority Selector */}
        <div className="flex gap-1 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
          {(['breakfast', 'lunch', 'snack', 'dinner'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedMealCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedMealCategory === cat
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'snack' ? '🍿 Snacks' : cat === 'breakfast' ? '🥞 Breakfast' : cat === 'lunch' ? '🍛 Lunch' : '🍲 Dinner'}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Region Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${selectedMealCategory} dishes (e.g. Dhokla, Vada Pav, Samosa, Poha, Dal)...`}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
          {['ALL', 'NORTH', 'SOUTH', 'WEST', 'EAST'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              className={`px-3 py-2 rounded-xl font-medium transition-all ${
                selectedRegion === r
                  ? 'bg-slate-700 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Food Selection Drawer */}
      {activeFood ? (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-700/80 space-y-5 shadow-2xl backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white">{activeFood.name.english}</h3>
              {activeFood.name.hindi && <span className="text-xs text-slate-400">{activeFood.name.hindi}</span>}
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  {activeFood.dietary_type}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-medium">
                  {activeFood.region}
                </span>
                {activeFood.glycemic_profile && (
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-medium">
                    GI: {activeFood.glycemic_profile.category} ({activeFood.glycemic_profile.index})
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setActiveFood(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-xl shadow-blue-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Confirm & Log to {selectedMealCategory.toUpperCase()}</span>
          </button>
        </div>
      ) : (
        /* Prioritized Search Results Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-1">
          {prioritizedFoods.map((food) => (
            <div
              key={food.food_id}
              onClick={() => handleSelectFood(food)}
              className="p-4 rounded-3xl bg-slate-900/50 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-800/60 cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {food.name.english}
                  </h4>
                  <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {food.region}
                  </span>
                </div>
                {food.name.hindi && <p className="text-xs text-slate-400 mt-0.5">{food.name.hindi}</p>}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                <div>
                  <span className="font-bold font-rounded text-amber-400 tabular-nums">
                    {food.nutrients_per_100g.calories_kcal} kcal
                  </span>
                  <span className="text-[10px] text-slate-500 block">/ 100g base</span>
                </div>
                <button className="p-2 rounded-xl bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
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
