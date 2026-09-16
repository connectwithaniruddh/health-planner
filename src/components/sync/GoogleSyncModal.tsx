import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useSyncStore } from '../../store/useSyncStore';
import { initGoogleAuthSDK, requestGoogleAccessToken, isAuthenticatedWithGoogle } from '../../services/gdrive/auth.service';
import { executeGoogleDriveSync } from '../../services/sync/syncManager';
import { syncFastingWindowToCalendar, sync30DayMealPlanToCalendar } from '../../services/google/calendar.service';
import { syncDailyChecklistToTasks } from '../../services/google/tasks.service';
import { sendWeeklyDigestEmail } from '../../services/google/gmail.service';
import { generate30DayIndianMealPlan } from '../../utils/mealPlanGenerator';
import { Cloud, Check, AlertCircle, RefreshCw, Calendar, CheckSquare, Mail, Timer, Utensils, Sparkles } from 'lucide-react';

export const GoogleSyncModal: React.FC = () => {
  const { store, setCompleteStore } = useAppStore();
  const { status, setSyncStatus } = useSyncStore();
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [actionStatus, setActionStatus] = useState<string | null>(null);

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
      setActionStatus('Successfully synced and updated with Google Drive appDataFolder!');
    } else {
      setSyncStatus('error', result.error);
      setActionStatus(`Sync error: ${result.error}`);
    }
  };

  const handleSyncFastingCalendar = async () => {
    if (!isAuthenticatedWithGoogle()) {
      await handleConnectGoogle();
      return;
    }

    setActionStatus('Scheduling Fasting Alarms in Google Calendar...');
    const res = await syncFastingWindowToCalendar(store.fastingState.fastTargetHours || 16);
    if (res.success) {
      setActionStatus(`Created ${res.count} Fasting & Eating Window reminders in your Google Calendar!`);
    } else {
      setActionStatus('Failed to sync to Calendar. Please grant calendar permissions.');
    }
  };

  const handleSync30DayMealPlan = async () => {
    if (!isAuthenticatedWithGoogle()) {
      await handleConnectGoogle();
      return;
    }

    setActionStatus('Generating and exporting 30-Day Indian Meal Plan to Google Calendar...');
    const mealPlans = generate30DayIndianMealPlan(new Date(), store.profile.targetDailyCalories);
    const res = await sync30DayMealPlanToCalendar(mealPlans);
    if (res.success) {
      setActionStatus(`Exported ${res.count} balanced Indian meal reminders (Lunch & Dinner) to Google Calendar!`);
    } else {
      setActionStatus('Failed to export meal plan to Calendar. Check permissions.');
    }
  };

  const handleSyncTasks = async () => {
    if (!isAuthenticatedWithGoogle()) {
      await handleConnectGoogle();
      return;
    }

    setActionStatus('Creating Daily Health Checklist in Google Tasks...');
    const res = await syncDailyChecklistToTasks();
    if (res.success) {
      setActionStatus(`Created ${res.count} daily routine action items in 'Health Planner Daily Routine' list in Google Tasks!`);
    } else {
      setActionStatus('Failed to create tasks in Google Tasks.');
    }
  };

  const handleSendDigestEmail = async () => {
    if (!isAuthenticatedWithGoogle()) {
      await handleConnectGoogle();
      return;
    }

    setActionStatus('Sending digest email...');
    const htmlContent = `
      <p><strong>Diet Mode:</strong> ${store.profile.dietMode}</p>
      <p><strong>Streak:</strong> ${store.gamification.streakDays} Days in Target Calorie Deficit</p>
      <p><strong>Boss Battle:</strong> ${store.gamification.bossCurrentHp} / ${store.gamification.bossMaxHp} HP remaining</p>
      <p><strong>Current Weight:</strong> ${store.profile.currentWeightKg} kg (Target: ${store.profile.targetWeightKg} kg)</p>
    `;
    const quote = "Consistency in your calorie deficit and fasting is what transforms effort into lifelong health.";

    const success = await sendWeeklyDigestEmail(userEmail, htmlContent, quote);
    if (success) {
      setActionStatus('Weekly digest email sent to ' + userEmail + '!');
    } else {
      setActionStatus('Failed to send digest email. Check Gmail OAuth scope.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
          <Cloud className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-rounded text-white">Google Services Automation & Sync</h2>
          <p className="text-xs text-slate-400">Google Drive Auto-Migration, Calendar Fasting/Meals, Tasks Checklists & Gmail</p>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionStatus && (
        <div className="p-4 rounded-3xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{actionStatus}</span>
          </div>
          <button onClick={() => setActionStatus(null)} className="text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Connection Card */}
      <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white">Google Account Cloud Storage</h3>
            <p className="text-xs text-slate-400">Stores health_planner_data.json in your personal Google Drive appDataFolder with auto-migration</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleConnectGoogle}
              className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
            >
              <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google G" className="w-4 h-4" />
              <span>Connect Account</span>
            </button>
            <button
              onClick={handleManualSyncNow}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${status === 'syncing' ? 'animate-spin' : ''}`} />
              <span>Sync Drive</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actionable Automations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calendar Fasting Sync Card */}
        <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Timer className="w-5 h-5" />
              <span>Intermittent Fasting Calendar Alarms</span>
            </div>
            <p className="text-xs text-slate-400">
              Adds daily Fast Start (8:00 PM) and Eating Window Open reminders for the next 7 days directly to your primary Google Calendar.
            </p>
          </div>
          <button
            onClick={handleSyncFastingCalendar}
            className="w-full py-3 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Sync Fasting Schedule to Google Calendar</span>
          </button>
        </div>

        {/* 30-Day Indian Meal Plan Exporter */}
        <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Utensils className="w-5 h-5" />
              <span>30-Day Indian Meal Plan to Calendar</span>
            </div>
            <p className="text-xs text-slate-400">
              Generates a full month of balanced Indian meals (Poha, Dhokla, Dal Tadka, Paneer, Rotis) and schedules Lunch & Dinner menu alarms.
            </p>
          </div>
          <button
            onClick={handleSync30DayMealPlan}
            className="w-full py-3 rounded-2xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Export 30-Day Indian Menu to Calendar</span>
          </button>
        </div>

        {/* Google Tasks Daily Checklist */}
        <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckSquare className="w-5 h-5" />
              <span>Google Tasks Daily Health Checklist</span>
            </div>
            <p className="text-xs text-slate-400">
              Provisions a dedicated checklist in Google Tasks with morning weigh-in, 3L hydration checkpoints, meal logging, and Surya Namaskar workouts.
            </p>
          </div>
          <button
            onClick={handleSyncTasks}
            className="w-full py-3 rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            <span>Create Daily Routine in Google Tasks</span>
          </button>
        </div>

        {/* Gmail Motivation Digest */}
        <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <Mail className="w-5 h-5" />
              <span>Gmail Motivation & Calorie Summary</span>
            </div>
            <p className="text-xs text-slate-400">
              Sends an HTML email summary of your active deficit streak, weight trajectory, and motivational quotes to your inbox.
            </p>
          </div>
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
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all"
            >
              Send Digest
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
