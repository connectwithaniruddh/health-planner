import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { startContinuousAutoSync } from './services/sync/autoSync.service';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { FuelGauge } from './components/dashboard/FuelGauge';
import { FastingWidget } from './components/dashboard/FastingWidget';
import { HumanAvatarWidget } from './components/dashboard/HumanAvatarWidget';
import { ClinicalAdvisoryWidget } from './components/dashboard/ClinicalAdvisoryWidget';
import { DailyHabitsWidget } from './components/dashboard/DailyHabitsWidget';
import { InteractiveTrendsWidget } from './components/dashboard/InteractiveTrendsWidget';
import { StreakWidget } from './components/dashboard/StreakWidget';
import { BossFightWidget } from './components/dashboard/BossFightWidget';
import { MacroRings } from './components/dashboard/MacroRings';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { FoodLogModal } from './components/food/FoodLogModal';
import { CalculatorsView } from './components/calculators/CalculatorsView';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { HealthReportView } from './components/reports/HealthReportView';
import { GoogleSyncModal } from './components/sync/GoogleSyncModal';
import { Calendar as CalendarIcon, Droplets, Moon, Scale, Plus, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  const { store, isInitialized, initStore, activeTab, selectedDate, setSelectedDate, logWater, logSleep, logWeight } = useAppStore();

  useEffect(() => {
    initStore();
    startContinuousAutoSync();
  }, [initStore]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-cyan-500 flex items-center justify-center animate-spin">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="animate-pulse text-slate-300 font-rounded text-sm font-semibold tracking-wider uppercase">
            Initializing Health Planner...
          </div>
        </div>
      </div>
    );
  }

  const dailyLog = store.dailyLogs[selectedDate] || { waterMl: 0, sleepHours: 0, foodLogs: [], exerciseLogs: [] };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Onboarding Wizard for New Users */}
      {!store.profile.isOnboarded && <OnboardingModal />}

      {/* Top Glass Header with Live Continuous Sync */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Clinical Advisory Card (High priority for Fatty Liver, Diabetes, B12, D3, Iron) */}
              <ClinicalAdvisoryWidget />

              {/* Date Bar & Quick Log Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <CalendarIcon className="w-5 h-5 text-emerald-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-neutral-800 border border-neutral-700 text-white text-sm font-bold px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Quick Trackers (Water, Sleep, Weight) with input sanitization */}
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

              {/* Hero Row: Fuel Gauge & Fasting Protocol */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FuelGauge />
                <FastingWidget />
              </div>

              {/* Visual Human Figure Gamification & Interactive Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HumanAvatarWidget />
                <InteractiveTrendsWidget />
              </div>

              {/* Daily Habits & Google Tasks Two-Way Sync + Macro Adherence */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyHabitsWidget />
                <MacroRings />
              </div>

              {/* Gamification Streak & Monster Battle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StreakWidget />
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
