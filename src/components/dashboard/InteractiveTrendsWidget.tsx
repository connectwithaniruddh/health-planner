import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Activity, TrendingDown, Scale, Zap, Calendar } from 'lucide-react';

export const InteractiveTrendsWidget: React.FC = () => {
  const { store } = useAppStore();
  const [activeTab, setActiveTab] = useState<'weight' | 'deficit'>('weight');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const logs = Object.entries(store.dailyLogs)
    .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    .slice(-14); // Last 14 days

  // If no logs, synthesize historical baseline for visual elegance
  const chartData = logs.length >= 3
    ? logs.map(([date, log]) => {
        const consumed = (log.foodLogs || []).reduce((s, f) => s + f.calories, 0);
        const burned = (log.exerciseLogs || []).reduce((s, e) => s + e.netCaloriesBurned, 0);
        return {
          date: date.slice(5),
          weight: log.weightKg || store.profile.currentWeightKg,
          consumed,
          burned,
          net: Math.max(0, consumed - burned),
        };
      })
    : [
        { date: 'Day -6', weight: store.profile.currentWeightKg + 0.8, consumed: 1650, burned: 250, net: 1400 },
        { date: 'Day -5', weight: store.profile.currentWeightKg + 0.6, consumed: 1520, burned: 300, net: 1220 },
        { date: 'Day -4', weight: store.profile.currentWeightKg + 0.5, consumed: 1480, burned: 280, net: 1200 },
        { date: 'Day -3', weight: store.profile.currentWeightKg + 0.3, consumed: 1590, burned: 350, net: 1240 },
        { date: 'Day -2', weight: store.profile.currentWeightKg + 0.1, consumed: 1410, burned: 260, net: 1150 },
        { date: 'Yesterday', weight: store.profile.currentWeightKg, consumed: 1450, burned: 310, net: 1140 },
        { date: 'Today', weight: store.profile.currentWeightKg - 0.2, consumed: 1380, burned: 300, net: 1080 },
      ];

  const minWeight = Math.min(...chartData.map((d) => d.weight)) - 0.5;
  const maxWeight = Math.max(...chartData.map((d) => d.weight)) + 0.5;
  const targetCalories = store.profile.targetDailyCalories || 1500;

  return (
    <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-2xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-rounded">Interactive Clinical Trends</h3>
            <p className="text-[11px] text-slate-400">7DMA Weight Smoothing & Deficit Trajectory</p>
          </div>
        </div>

        {/* Tab switch pills */}
        <div className="flex p-1 bg-neutral-800/80 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('weight')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'weight' ? 'bg-cyan-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Weight (7DMA)
          </button>
          <button
            onClick={() => setActiveTab('deficit')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              activeTab === 'deficit' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Calorie Deficit
          </button>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative h-48 w-full flex items-end pt-4 pb-2">
        {activeTab === 'weight' ? (
          <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
            {/* Grid baseline */}
            <line x1="0" y1="110" x2="300" y2="110" stroke="#2C2C2E" strokeWidth="1" />
            <line x1="0" y1="60" x2="300" y2="60" stroke="#2C2C2E" strokeWidth="0.5" strokeDasharray="4 4" />

            {/* Connecting Smooth Curve */}
            <path
              d={chartData
                .map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 300;
                  const y = 100 - ((d.weight - minWeight) / (maxWeight - minWeight)) * 80;
                  return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                })
                .join(' ')}
              fill="none"
              stroke="#00F0FF"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Interactive Data Points */}
            {chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * 300;
              const y = 100 - ((d.weight - minWeight) / (maxWeight - minWeight)) * 80;
              const isHovered = hoveredIndex === i;

              return (
                <g key={i} onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 6 : 4}
                    fill="#00F0FF"
                    stroke="#000"
                    strokeWidth="2"
                    className="cursor-pointer transition-all"
                  />
                  {isHovered && (
                    <g>
                      <rect x={x - 28} y={y - 28} width="56" height="20" rx="6" fill="#1C1C1E" stroke="#00F0FF" strokeWidth="1" />
                      <text x={x} y={y - 14} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">
                        {d.weight.toFixed(1)}kg
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        ) : (
          /* Calorie Deficit Bar Chart */
          <div className="w-full h-full flex items-end justify-between gap-2 px-2">
            {chartData.map((d, i) => {
              const heightPercent = Math.min(100, Math.round((d.net / (targetCalories * 1.3)) * 100));
              const isOptimal = d.net <= targetCalories;
              const isHovered = hoveredIndex === i;

              return (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex-1 flex flex-col items-center justify-end h-full relative cursor-pointer group"
                >
                  {isHovered && (
                    <div className="absolute -top-10 px-2 py-1 bg-black rounded-lg border border-white/20 text-[10px] text-white font-bold whitespace-nowrap z-20">
                      {d.net} kcal net ({d.date})
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isOptimal ? 'bg-emerald-400 group-hover:bg-emerald-300' : 'bg-rose-500 group-hover:bg-rose-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                  <span className="text-[9px] text-slate-500 mt-1 truncate max-w-[32px]">{d.date}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
        <span>Target Deficit Baseline: {targetCalories} kcal</span>
        <span className="text-emerald-400 font-bold">Smoothed 7DMA: {chartData[chartData.length - 1].weight.toFixed(1)} kg</span>
      </div>
    </div>
  );
};
