import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import indianFoodsSeed from '../../data/indianFoods.json';
import { searchIndianFoods, SearchableFood } from '../../utils/search';
import { calculateAdjustedDishCalories } from '../../utils/calculations';
import { IndianUnitSelector } from './IndianUnitSelector';
import { Search, Utensils, X, Plus, Trash2 } from 'lucide-react';

export const FoodLogModal: React.FC = () => {
  const { store, selectedDate, logFoodItem, deleteFoodItem } = useAppStore();
  const dailyLog = store.dailyLogs[selectedDate] || { foodLogs: [] };

  const [query, setQuery] = useState('');
  const [selectedMealCategory, setSelectedMealCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [activeFood, setActiveFood] = useState<SearchableFood | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedUnitName, setSelectedUnitName] = useState('1 Standard Katori');
  const [oilLevel, setOilLevel] = useState<'low' | 'standard' | 'restaurant'>('standard');

  const filteredFoods = searchIndianFoods(indianFoodsSeed as SearchableFood[], query);

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

    const chosenUnitObj = activeFood.serving_units.find((u) => u.unit_name === selectedUnitName) || activeFood.serving_units[0];
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold font-rounded text-white">Indian Food Calorie Tracker</h2>
          <p className="text-xs text-slate-400">Log meals for {selectedDate} (ICMR-NIN IFCT Dataset)</p>
        </div>

        {/* Meal Category Filter */}
        <div className="flex gap-1 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedMealCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                selectedMealCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Indian dishes (e.g. Roti, Dal Tadka, Paneer, Idli, Poha)..."
          className="w-full pl-12 pr-4 py-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-all"
        />
      </div>

      {/* Food Selection Sheet / Drawer */}
      {activeFood ? (
        <div className="p-5 rounded-3xl bg-slate-800/90 border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">{activeFood.name.english}</h3>
              {activeFood.name.hindi && <span className="text-xs text-slate-400">{activeFood.name.hindi}</span>}
            </div>
            <button
              onClick={() => setActiveFood(null)}
              className="p-1 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300"
            >
              <X className="w-4 h-4" />
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
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Confirm & Log Food Item</span>
          </button>
        </div>
      ) : (
        /* Search Results List */
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {filteredFoods.map((food) => (
            <div
              key={food.food_id}
              onClick={() => handleSelectFood(food)}
              className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between transition-all"
            >
              <div>
                <p className="text-sm font-semibold text-slate-100">{food.name.english}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-[10px] font-medium text-slate-300">
                    {food.dietary_type}
                  </span>
                  <span>{food.nutrients_per_100g.calories_kcal} kcal / 100g</span>
                </div>
              </div>
              <button className="p-2 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Logged Foods for Selected Date */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today's Logged Meals</h3>

        {dailyLog.foodLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">No meals logged for this day yet.</p>
        ) : (
          <div className="space-y-2">
            {dailyLog.foodLogs.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/40 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{item.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-slate-400 capitalize">
                      {item.mealCategory}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.quantity} x {item.servingUnit} ({item.gramWeightTotal}g) • P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold font-rounded text-amber-400 tabular-nums">{item.calories} kcal</span>
                  <button
                    onClick={() => deleteFoodItem(item.id)}
                    className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
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
