import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSyncStore } from '../../store/useSyncStore';
import { initGoogleAuthSDK, requestGoogleAccessToken, isAuthenticatedWithGoogle } from '../../services/gdrive/auth.service';
import { executeGoogleDriveSync } from '../../services/sync/syncManager';
import { sendWeeklyDigestEmail } from '../../services/google/gmail.service';
import { Cloud, Check, AlertCircle, RefreshCw, Calendar, CheckSquare, Mail } from 'lucide-react';

export const GoogleSyncModal: React.FC = () => {
  const { store, setCompleteStore } = useAppStore();
  const { status, setSyncStatus } = useSyncStore();
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [digestStatus, setDigestStatus] = useState<string | null>(null);

  const handleConnectGoogle = async () => {
    await initGoogleAuthSDK();
    requestGoogleAccessToken();
  };

  const handleManualSyncNow = async () => {
    if (!isAuthenticatedWithGoogle()) {
      await handleConnectGoogle();
      return;
    }

    setSyncStatus('syncing');
    const result = await executeGoogleDriveSync(store);

    if (result.status === 'SUCCESS' && result.mergedStore) {
      await setCompleteStore(result.mergedStore);
      setSyncStatus('success');
    } else {
      setSyncStatus('error', result.error);
    }
  };

  const handleSendDigestEmail = async () => {
    if (!isAuthenticatedWithGoogle()) {
      alert('Please connect Google Drive first!');
      return;
    }

    setDigestStatus('Sending...');
    const htmlContent = `<p>Your net calories remaining target was maintained on 6/7 days this week!</p>`;
    const quote = "Consistency is what transforms average into excellence.";

    const success = await sendWeeklyDigestEmail(userEmail, htmlContent, quote);
    if (success) {
      setDigestStatus('Weekly digest email sent to ' + userEmail + '!');
    } else {
      setDigestStatus('Failed to send digest email. Check Gmail OAuth scope.');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
          <Cloud className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-rounded text-white">Google Services Integration</h2>
          <p className="text-xs text-slate-400">Auto-migrating Drive storage, Calendar & Tasks reminders, Gmail digest</p>
        </div>
      </div>

      {/* Connection Card */}
      <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">Google Account Connection</h3>
            <p className="text-xs text-slate-400">Stores health_planner_data.json safely in your personal Google Drive appDataFolder</p>
          </div>
          <button
            onClick={handleConnectGoogle}
            className="px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
          >
            <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google G" className="w-4 h-4" />
            <span>Connect Google Drive</span>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <span className="text-xs text-slate-400">Sync Status: <strong className="text-slate-200 capitalize">{status}</strong></span>
          <button
            onClick={handleManualSyncNow}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin' : ''}`} />
            <span>Sync Now with Drive</span>
          </button>
        </div>
      </div>

      {/* Services Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <Calendar className="w-4 h-4" />
            <span>Google Calendar</span>
          </div>
          <p className="text-slate-400">Sync meal prep reminders & workout appointments directly to your primary calendar.</p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckSquare className="w-4 h-4" />
            <span>Google Tasks</span>
          </div>
          <p className="text-slate-400">Creates a dedicated "Health Planner Daily Tasks" list for hydration and workout checklists.</p>
        </div>

        <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold">
            <Mail className="w-4 h-4" />
            <span>Gmail Weekly Digest</span>
          </div>
          <p className="text-slate-400">Self-sends weekly summary stats & motivational quotes to your email inbox.</p>
        </div>
      </div>

      {/* Test Gmail Digest Card */}
      <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gmail Weekly Motivation Trigger</h3>
        <div className="flex gap-2">
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Your Email Address"
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white"
          />
          <button
            onClick={handleSendDigestEmail}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
          >
            Send Test Digest
          </button>
        </div>
        {digestStatus && <p className="text-xs text-purple-300 font-medium">{digestStatus}</p>}
      </div>
    </div>
  );
};
