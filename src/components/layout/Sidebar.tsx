import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LayoutDashboard, Utensils, SlidersHorizontal, User, FileText, Cloud, Flame, Shield, Award } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { store, activeTab, setActiveTab } = useAppStore();
  const gamification = store.gamification;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'food', label: 'Food Log & Indian Tracker', icon: Utensils },
    { id: 'calculators', label: 'Calculators & Tools', icon: SlidersHorizontal },
    { id: 'profile', label: 'User Profile & Clinical', icon: User },
    { id: 'reports', label: 'Health Progress Reports', icon: FileText },
    { id: 'sync', label: 'Google Services Sync', icon: Cloud },
  ] as const;

  return (
    <aside className="w-64 hidden md:flex flex-col justify-between p-4 bg-slate-900/40 border-r border-slate-800/80 backdrop-blur-xl">
      <div className="space-y-6">
        {/* Nav Links */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Gamification Stats Card */}
        <div className="p-4 rounded-3xl bg-slate-800/60 border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="font-semibold flex items-center gap-1.5 text-amber-400">
              <Award className="w-4 h-4" /> Level {gamification.level}
            </span>
            <span className="text-slate-400">{gamification.totalXp} XP</span>
          </div>

          <div className="w-full bg-slate-700/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-orange-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (gamification.totalXp % 300) / 3)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1 text-orange-400 font-bold">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{gamification.streakDays} Day Streak</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400 font-medium">
              <Shield className="w-3.5 h-3.5" />
              <span>{gamification.calorieShields} Shield</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-xs text-slate-500 space-y-1 text-center">
        <p>connectwithaniruddh.github.io</p>
        <p className="text-[10px] text-slate-600">Schema Version 3 • Offline PWA</p>
      </div>
    </aside>
  );
};
