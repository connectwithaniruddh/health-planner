import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useGamificationStore } from '../../store/useGamificationStore';
import { Swords, Skull, Trophy } from 'lucide-react';

export const BossFightWidget: React.FC = () => {
  const { store } = useAppStore();
  const { attackBoss } = useGamificationStore();
  const gamification = store.gamification;

  const hpPercentage = Math.round((gamification.bossCurrentHp / gamification.bossMaxHp) * 100);

  return (
    <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Weekly Boss Challenge</h3>
        </div>
        <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
          {gamification.bossDefeatedThisWeek ? 'SLAYED!' : 'ACTIVE BOSS'}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-red-950/80 border border-red-500/30 flex items-center justify-center">
          <Skull className="w-7 h-7 text-red-400 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-200">Calorie Surplus Monster</span>
            <span className="text-red-400 tabular-nums">
              {gamification.bossCurrentHp} / {gamification.bossMaxHp} HP
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 rounded-full transition-all duration-700"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Every calorie of deficit achieved this week deals direct damage to the Surplus Monster!
      </p>
    </div>
  );
};
