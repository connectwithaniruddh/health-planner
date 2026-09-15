import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const MacroRings: React.FC = () => {
  const { store, selectedDate } = useAppStore();
  const dailyLog = store.dailyLogs[selectedDate] || { foodLogs: [] };

  const totalProtein = dailyLog.foodLogs.reduce((sum, item) => sum + item.proteinG, 0);
  const totalCarbs = dailyLog.foodLogs.reduce((sum, item) => sum + item.carbsG, 0);
  const totalFat = dailyLog.foodLogs.reduce((sum, item) => sum + item.fatG, 0);
  const totalFiber = dailyLog.foodLogs.reduce((sum, item) => sum + (item.fiberG || 0), 0);

  // Targets based on weight & target calories
  const targetProtein = Math.round(store.profile.currentWeightKg * 1.8); // 1.8g/kg
  const targetCarbs = Math.round((store.profile.targetDailyCalories * 0.45) / 4); // 45% calories
  const targetFat = Math.round((store.profile.targetDailyCalories * 0.25) / 9); // 25% calories
  const targetFiber = store.profile.gender === 'female' ? 25 : 38;

  const macros = [
    { label: 'Protein', current: Math.round(totalProtein), target: targetProtein, unit: 'g', color: '#64D2FF', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
    { label: 'Carbs', current: Math.round(totalCarbs), target: targetCarbs, unit: 'g', color: '#FFD60A', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
    { label: 'Fats', current: Math.round(totalFat), target: targetFat, unit: 'g', color: '#BF5AF2', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
    { label: 'Fiber', current: Math.round(totalFiber), target: targetFiber, unit: 'g', color: '#30D158', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  ];

  return (
    <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Macronutrient Targets & Adherence</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {macros.map((macro) => {
          const percentage = Math.min(100, Math.round((macro.current / macro.target) * 100));
          return (
            <div key={macro.label} className={`p-3.5 rounded-3xl ${macro.bg} border ${macro.border} space-y-2`}>
              <div className="flex items-center justify-between text-xs font-medium">
                <span style={{ color: macro.color }}>{macro.label}</span>
                <span className="text-slate-400 tabular-nums">
                  {macro.current}/{macro.target}{macro.unit}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%`, backgroundColor: macro.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
