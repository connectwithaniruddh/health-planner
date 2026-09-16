import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { fetchGoogleTasks, updateGoogleTaskStatus, syncDailyChecklistToTasks } from '../../services/google/tasks.service';
import { isAuthenticatedWithGoogle } from '../../services/gdrive/auth.service';
import { CheckSquare, Check, RefreshCw, Sparkles, Plus } from 'lucide-react';

interface HabitItem {
  key: string;
  title: string;
  category: string;
}

const DEFAULT_HABITS: HabitItem[] = [
  { key: 'weigh_in', title: '⚖️ Morning Fasted Weigh-In', category: 'Biometrics' },
  { key: 'water_1l', title: '💧 Drink 1st Liter Water (Hydration Milestone)', category: 'Hydration' },
  { key: 'log_lunch', title: '🍛 Log Lunch Meals & Track Indian Portions', category: 'Nutrition' },
  { key: 'water_2l', title: '💧 Drink 2nd Liter Water + Salted Chaas', category: 'Hydration' },
  { key: 'workout_30m', title: '🏃 30 Min Workout / Surya Namaskar', category: 'Activity' },
  { key: 'log_dinner', title: '🍲 Log Dinner & Review Calorie Deficit', category: 'Nutrition' },
  { key: 'fasting_start', title: '⏳ Start Intermittent Fasting Window at 8 PM', category: 'Fasting' },
];

export const DailyHabitsWidget: React.FC = () => {
  const { store, selectedDate, toggleDailyHabit } = useAppStore();
  const dailyLog = store.dailyLogs[selectedDate] || { habits: {} };
  const habitsState = dailyLog.habits || {};

  const [remoteTasks, setRemoteTasks] = useState<Array<{ id: string; title: string; status: string }>>([]);
  const [syncing, setSyncing] = useState(false);

  // Reconcile with Google Tasks
  const handleReconcileTasks = async () => {
    if (!isAuthenticatedWithGoogle()) return;
    setSyncing(true);
    const tasks = await fetchGoogleTasks();
    setRemoteTasks(tasks);

    // Sync any completed tasks into local store
    for (const remote of tasks) {
      const match = DEFAULT_HABITS.find((h) => remote.title.includes(h.key) || remote.title.includes(h.title.slice(3, 15)));
      if (match && remote.status === 'completed' && !habitsState[match.key]) {
        await toggleDailyHabit(match.key, true);
      }
    }
    setSyncing(false);
  };

  useEffect(() => {
    if (isAuthenticatedWithGoogle()) {
      handleReconcileTasks();
    }
  }, [selectedDate]);

  const handleToggle = async (habit: HabitItem) => {
    const nextVal = !habitsState[habit.key];
    await toggleDailyHabit(habit.key, nextVal);

    // Push to Google Tasks if authenticated and task exists
    if (isAuthenticatedWithGoogle()) {
      const matched = remoteTasks.find((t) => t.title.includes(habit.title.slice(3, 15)));
      if (matched) {
        await updateGoogleTaskStatus(matched.id, nextVal);
      }
    }
  };

  const handlePushToGoogleTasks = async () => {
    if (!isAuthenticatedWithGoogle()) return;
    setSyncing(true);
    await syncDailyChecklistToTasks();
    await handleReconcileTasks();
    setSyncing(false);
  };

  const completedCount = DEFAULT_HABITS.filter((h) => habitsState[h.key]).length;

  return (
    <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-2xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-rounded">Daily Health Routine & Google Tasks</h3>
            <p className="text-[11px] text-slate-400">Bi-directional habit synchronization</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReconcileTasks}
            disabled={syncing}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 transition-all text-xs flex items-center gap-1 px-2.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Tasks</span>
          </button>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 tabular-nums">
            {completedCount}/{DEFAULT_HABITS.length} Done
          </span>
        </div>
      </div>

      {/* Habits Checklist */}
      <div className="space-y-2">
        {DEFAULT_HABITS.map((habit) => {
          const isDone = habitsState[habit.key] || false;
          return (
            <div
              key={habit.key}
              onClick={() => handleToggle(habit)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isDone
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                  : 'bg-neutral-800/40 border-white/5 hover:border-white/15 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                    isDone
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'bg-neutral-800 border-neutral-700 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <span className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                  {habit.title}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{habit.category}</span>
            </div>
          );
        })}
      </div>

      {/* Push Checklist to Google Tasks if empty */}
      {remoteTasks.length === 0 && isAuthenticatedWithGoogle() && (
        <button
          onClick={handlePushToGoogleTasks}
          disabled={syncing}
          className="w-full py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold text-xs hover:bg-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Provision this Routine Checklist in Google Tasks</span>
        </button>
      )}
    </div>
  );
};
