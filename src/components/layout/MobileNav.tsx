import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { LayoutDashboard, Utensils, SlidersHorizontal, FileText, Cloud, LucideIcon } from 'lucide-react';

interface NavItem {
  id: 'dashboard' | 'food' | 'calculators' | 'reports' | 'sync';
  label: string;
  icon: LucideIcon;
  isCenter?: boolean;
}

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab } = useAppStore();

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'food', label: 'Log Food', icon: Utensils, isCenter: true },
    { id: 'calculators', label: 'Tools', icon: SlidersHorizontal },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'sync', label: 'Cloud', icon: Cloud },
  ];

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 md:hidden w-[92vw] max-w-sm pointer-events-auto">
      <div className="h-16 px-2 bg-[#1C1C1E]/90 backdrop-blur-2xl border border-white/15 rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.85)] grid grid-cols-5 items-center justify-items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-label={item.label}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/35 border-2 border-[#1C1C1E] active:scale-95 transition-all"
              >
                <Icon className="w-5 h-5 stroke-[2.5]" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 w-full transition-all ${
                isActive ? 'text-emerald-400 font-bold' : 'text-neutral-400 hover:text-white font-medium'
              }`}
            >
              <Icon className="w-4 h-4 stroke-[2]" />
              <span className="text-[10px] tracking-tight">{item.label}</span>
              {isActive && <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
