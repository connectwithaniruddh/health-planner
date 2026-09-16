import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Timer, Zap, Flame, ShieldAlert, Sparkles, Play, Square } from 'lucide-react';

export const FastingWidget: React.FC = () => {
  const { store, startFast, endFast } = useAppStore();
  const fasting = store.fastingState || {
    isFasting: false,
    fastStartTime: null,
    fastTargetHours: 16,
    fastEndTime: null,
  };

  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    const calculateElapsed = () => {
      if (fasting.isFasting && fasting.fastStartTime) {
        const start = new Date(fasting.fastStartTime).getTime();
        const now = Date.now();
        const diffMinutes = Math.max(0, Math.floor((now - start) / 60000));
        setElapsedMinutes(diffMinutes);
      } else {
        setElapsedMinutes(0);
      }
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 30000); // update every 30s
    return () => clearInterval(interval);
  }, [fasting]);

  const targetMinutes = (fasting.fastTargetHours || 16) * 60;
  const progressPercent = Math.min(100, Math.round((elapsedMinutes / targetMinutes) * 100));

  const hoursElapsed = Math.floor(elapsedMinutes / 60);
  const minsElapsed = elapsedMinutes % 60;

  const remainingMinutes = Math.max(0, targetMinutes - elapsedMinutes);
  const hoursRemaining = Math.floor(remainingMinutes / 60);
  const minsRemaining = remainingMinutes % 60;

  // Determine Biological Fasting Stage
  let stageName = 'Anabolic / Digestion';
  let stageColor = '#64D2FF'; // Cyan
  let stageDesc = 'Blood sugar and insulin levels are stabilizing (0-4h)';

  if (hoursElapsed >= 18) {
    stageName = 'Autophagy & Cellular Cleanse';
    stageColor = '#BF5AF2'; // Purple
    stageDesc = 'Cellular recycling and cellular repair accelerated (18h+)';
  } else if (hoursElapsed >= 12) {
    stageName = 'Ketosis & Glycogen Depletion';
    stageColor = '#FF375F'; // Red / Pink
    stageDesc = 'Liver glycogen depleted; body utilizes ketones for fuel (12-18h)';
  } else if (hoursElapsed >= 4) {
    stageName = 'Fat Burning Mode';
    stageColor = '#FF9F0A'; // Orange
    stageDesc = 'Insulin dropped; body shifting to stored fat for energy (4-12h)';
  }

  const [selectedHours, setSelectedHours] = useState(fasting.fastTargetHours || 16);

  return (
    <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-6 relative overflow-hidden">
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -right-8 -top-8 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: stageColor }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">Intermittent Fasting</h3>
            <p className="text-[11px] text-slate-400 font-medium">Protocol: {fasting.fastTargetHours}:{24 - fasting.fastTargetHours} Window</p>
          </div>
        </div>

        <span
          className="px-3 py-1 rounded-full text-xs font-semibold border"
          style={{
            borderColor: `${stageColor}40`,
            backgroundColor: `${stageColor}15`,
            color: stageColor,
          }}
        >
          {fasting.isFasting ? stageName : 'Eating Window Active'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Apple Watch Style Circular Progress Gauge */}
        <div className="flex flex-col items-center justify-center relative">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="62"
              stroke="currentColor"
              strokeWidth="12"
              className="text-slate-800/80"
              fill="transparent"
            />
            <circle
              cx="80"
              cy="80"
              r="62"
              stroke={stageColor}
              strokeWidth="12"
              strokeDasharray={389.5}
              strokeDashoffset={389.5 - (389.5 * progressPercent) / 100}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {fasting.isFasting ? (
              <>
                <span className="text-2xl font-bold font-rounded tabular-nums text-white">
                  {hoursElapsed}h {minsElapsed}m
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {remainingMinutes === 0 ? 'Goal Reached!' : `${hoursRemaining}h ${minsRemaining}m left`}
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-bold text-slate-300">Fast Inactive</span>
                <span className="text-[10px] text-slate-400">Ready to start</span>
              </>
            )}
          </div>
        </div>

        {/* Biological Stage Cards & Action Buttons */}
        <div className="md:col-span-2 space-y-4">
          <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: stageColor }}>
              <Sparkles className="w-4 h-4" />
              <span>Current Stage: {stageName}</span>
            </div>
            <p className="text-xs text-slate-400">{stageDesc}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Protocol Selector Chips */}
            <div className="flex gap-1.5 p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60">
              {[14, 16, 18, 20].map((h) => (
                <button
                  key={h}
                  onClick={() => {
                    setSelectedHours(h);
                    if (fasting.isFasting) startFast(h);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                    fasting.fastTargetHours === h
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {h}:{24 - h}
                </button>
              ))}
            </div>

            {/* Fasting Toggle Button */}
            {fasting.isFasting ? (
              <button
                onClick={() => endFast()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>End Fast & Open Window</span>
              </button>
            ) : (
              <button
                onClick={() => startFast(selectedHours)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Start {selectedHours}h Fast</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
