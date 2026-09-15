import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSyncStore } from '../../store/useSyncStore';
import { Cloud, CloudOff, RefreshCw, User, Sparkles, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const { store, activeTab, setActiveTab } = useAppStore();
  const { status } = useSyncStore();

  return (
    <header className="sticky top-0 z-40 h-16 px-4 md:px-8 bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-0.5 shadow-lg shadow-blue-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent font-rounded">
            Health Planner
          </h1>
          <span className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">
            Weight Loss & Desi Calorie Tracker
          </span>
        </div>
      </div>

      {/* Cloud Sync Status & User Profile Actions */}
      <div className="flex items-center gap-3">
        {/* Google Drive Status Pill */}
        <button
          onClick={() => setActiveTab('sync')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-all"
        >
          {status === 'syncing' ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              <span className="text-blue-300 hidden sm:inline">Syncing Drive...</span>
            </>
          ) : status === 'success' ? (
            <>
              <div className="relative">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                <Check className="w-2 h-2 text-emerald-300 absolute -bottom-0.5 -right-0.5" />
              </div>
              <span className="text-emerald-300 hidden sm:inline">Synced to Drive</span>
            </>
          ) : (
            <>
              <CloudOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 hidden sm:inline">Local Storage</span>
            </>
          )}
        </button>

        {/* User Profile Button */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 p-2 rounded-2xl border transition-all ${
            activeTab === 'profile'
              ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:bg-slate-800'
          }`}
          title="User Profile & Settings"
        >
          <div className="w-7 h-7 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-xs text-white">
            {store.profile.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold hidden md:inline">{store.profile.name}</span>
        </button>
      </div>
    </header>
  );
};
