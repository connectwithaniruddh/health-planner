import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { FuelGauge } from './components/dashboard/FuelGauge';
import { FastingWidget } from './components/dashboard/FastingWidget';
import { StreakWidget } from './components/dashboard/StreakWidget';
import { BossFightWidget } from './components/dashboard/BossFightWidget';
import { MacroRings } from './components/dashboard/MacroRings';
import { FoodLogModal } from './components/food/FoodLogModal';
import { CalculatorsView } from './components/calculators/CalculatorsView';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { HealthReportView } from './components/reports/HealthReportView';
import { GoogleSyncModal } from './components/sync/GoogleSyncModal';
import { Calendar as CalendarIcon, Droplets, Moon, Scale, Plus } from 'lucide-react';

export const App: React.FC = () => {
  const { store, isInitialized, initStore, activeTab, selectedDate, setSelectedDate, logWater, logSleep, logWeight } = useAppStore();

  useEffect(() => {
    initStore();
  }, [initStore]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="animate-pulse text-slate-400 font-rounded text-lg">Loading Health Planner...</div>
      </div>
    );
  }

  const dailyLog = store.dailyLogs[selectedDate] || { waterMl: 0, sleepHours: 0, foodLogs: [], exerciseLogs: [] };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Glass Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Date Bar & Quick Log Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-blue-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-white text-sm font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Quick Trackers (Water, Sleep, Weight) */}
                <div className="flex items-center gap-2 overflow-x-auto text-xs">
                  <button
                    onClick={() => logWater(250)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    <span>+250ml ({dailyLog.waterMl}ml)</span>
                  </button>

                  <button
                    onClick={() => {
                      const h = prompt('Enter sleep hours:', String(dailyLog.sleepHours || 8));
                      if (h) logSleep(Number(h));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-all"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span>{dailyLog.sleepHours || 0}h Sleep</span>
                  </button>

                  <button
                    onClick={() => {
                      const w = prompt('Enter today weight (kg):', String(store.profile.currentWeightKg));
                      if (w) logWeight(Number(w));
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-all"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>{store.profile.currentWeightKg}kg Weight</span>
                  </button>
                </div>
              </div>

              {/* Hero Widgets: Fuel Gauge & Intermittent Fasting */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FuelGauge />
                <FastingWidget />
              </div>

              {/* Middle Row Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StreakWidget />
                <MacroRings />
                <BossFightWidget />
              </div>
            </div>
          )}

          {/* Food Log Tab */}
          {activeTab === 'food' && <FoodLogModal />}

          {/* Calculators & Tools Tab */}
          {activeTab === 'calculators' && <CalculatorsView />}

          {/* User Profile Tab */}
          {activeTab === 'profile' && <UserProfileModal />}

          {/* Reports Tab */}
          {activeTab === 'reports' && <HealthReportView />}

          {/* Google Sync Tab */}
          {activeTab === 'sync' && <GoogleSyncModal />}
        </main>
      </div>

      {/* Floating Bottom Pill Dock for Mobile */}
      <MobileNav />
    </div>
  );
};
