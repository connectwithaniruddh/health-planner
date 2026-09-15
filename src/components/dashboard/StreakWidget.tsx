import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Flame, Shield, Award, Sparkles } from 'lucide-react';

export const StreakWidget: React.FC = () => {
  const { store } = useAppStore();
  const gamification = store.gamification;

  const multiplier =
    gamification.streakDays >= 15
      ? 2.0
      : gamification.streakDays >= 8
      ? 1.5
      : gamification.streakDays >= 4
      ? 1.25
      : 1.0;

  return (
    <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between space-y-4 relative">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Deficit Flame Streak</span>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
          {multiplier}x XP Multiplier
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-400 p-0.5 shadow-xl shadow-orange-500/30 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
            <Flame className="w-8 h-8 text-orange-500 fill-orange-500 animate-bounce" />
          </div>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold font-rounded tabular-nums text-white">{gamification.streakDays}</span>
            <span className="text-sm font-semibold text-slate-400">Continuous Days</span>
          </div>
          <p className="text-xs text-slate-400">Maintained target calorie deficit window</p>
        </div>
      </div>

      {/* Badges Preview */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
          <Shield className="w-4 h-4" />
          <span>{gamification.calorieShields} Calorie Shield Available</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Award className="w-4 h-4 text-amber-400" />
          <span>{gamification.unlockedBadges.length} Badges Unlocked</span>
        </div>
      </div>
    </div>
  );
};
