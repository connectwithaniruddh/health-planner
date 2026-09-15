import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Flame, Zap, Target } from 'lucide-react';

export const FuelGauge: React.FC = () => {
  const { store, selectedDate } = useAppStore();
  const dailyLog = store.dailyLogs[selectedDate] || { foodLogs: [], exerciseLogs: [] };
  const targetCalories = store.profile.targetDailyCalories;

  const consumedCalories = dailyLog.foodLogs.reduce((acc, item) => acc + item.calories, 0);
  const activeBurnedCalories = dailyLog.exerciseLogs.reduce((acc, item) => acc + item.netCaloriesBurned, 0);
  const netCalories = Math.max(0, consumedCalories - activeBurnedCalories);
  const remainingCalories = targetCalories - netCalories;

  const percentage = Math.min(100, Math.round((netCalories / targetCalories) * 100));

  // Dynamic status color
  let ringColor = '#30D158'; // Green
  let statusText = 'Optimal Calorie Deficit';
  if (remainingCalories < 0) {
    ringColor = '#FF375F'; // Red surplus
    statusText = 'Calorie Surplus';
  } else if (remainingCalories < 200) {
    ringColor = '#FFD60A'; // Yellow warning
    statusText = 'Approaching Limit';
  }

  return (
    <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-6 relative overflow-hidden">
      {/* Background Ambient Blur */}
      <div
        className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: ringColor }}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Daily Calorie Energy Budget</h2>
          <p className="text-xs text-slate-500 font-medium">Target Deficit Budget: {targetCalories} kcal</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-xs font-semibold border"
          style={{
            borderColor: `${ringColor}40`,
            backgroundColor: `${ringColor}15`,
            color: ringColor,
          }}
        >
          {statusText}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* SVG Liquid Fuel Gauge */}
        <div className="flex flex-col items-center justify-center relative">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke="currentColor"
              strokeWidth="14"
              className="text-slate-800"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="64"
              stroke={ringColor}
              strokeWidth="14"
              strokeDasharray={402}
              strokeDashoffset={402 - (402 * percentage) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-3xl font-bold font-rounded tabular-nums text-white">
              {Math.abs(remainingCalories)}
            </span>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {remainingCalories >= 0 ? 'kcal remaining' : 'kcal surplus'}
            </span>
          </div>
        </div>

        {/* Stats Breakdown */}
        <div className="md:col-span-2 grid grid-cols-3 gap-3">
          <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-orange-400">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold">Consumed</span>
            </div>
            <p className="text-2xl font-bold font-rounded tabular-nums text-slate-100">{consumedCalories}</p>
            <span className="text-[10px] text-slate-400">kcal food</span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-cyan-400">
              <Flame className="w-4 h-4" />
              <span className="text-xs font-semibold">Active Burn</span>
            </div>
            <p className="text-2xl font-bold font-rounded tabular-nums text-slate-100">{activeBurnedCalories}</p>
            <span className="text-[10px] text-slate-400">kcal exercise</span>
          </div>

          <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 text-center space-y-1">
            <div className="flex items-center justify-center gap-1 text-emerald-400">
              <Target className="w-4 h-4" />
              <span className="text-xs font-semibold">Net Intake</span>
            </div>
            <p className="text-2xl font-bold font-rounded tabular-nums text-slate-100">{netCalories}</p>
            <span className="text-[10px] text-slate-400">net kcal</span>
          </div>
        </div>
      </div>
    </div>
  );
};
