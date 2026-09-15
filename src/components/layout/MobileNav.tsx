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
    <nav className="fixed bottom-4 inset-x-4 z-50 md:hidden">
      <div className="h-16 px-3 bg-slate-900/80 backdrop-blur-2xl border border-slate-700/60 rounded-full shadow-2xl shadow-black/80 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/40 border-2 border-slate-900 active:scale-95 transition-all"
              >
                <Icon className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive ? 'text-blue-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
