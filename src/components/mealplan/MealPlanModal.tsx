import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { generate30DayIndianMealPlan, DailyMealPlan } from '../../utils/mealPlanGenerator';
import { syncBatchEventsToCalendar } from '../../services/google/calendar.service';
import { isAuthenticatedWithGoogle, initGoogleAuthSDK, requestGoogleAccessToken } from '../../services/gdrive/auth.service';
import {
  Calendar,
  CheckSquare,
  Square,
  Sparkles,
  Utensils,
  Check,
  ChevronRight,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';

interface MealPlanModalProps {
  onClose: () => void;
}

export const MealPlanModal: React.FC<MealPlanModalProps> = ({ onClose }) => {
  const { store } = useAppStore();
  const [mealPlan, setMealPlan] = useState<DailyMealPlan[]>(() =>
    generate30DayIndianMealPlan(new Date(), store.profile.targetDailyCalories || 1500)
  );

  // Selected days for sync (defaults to first 7 days to prevent blind 30-day spam)
  const [selectedDayNumbers, setSelectedDayNumbers] = useState<number[]>([1, 2, 3, 4, 5, 6, 7]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const toggleDay = (dayNum: number) => {
    if (selectedDayNumbers.includes(dayNum)) {
      setSelectedDayNumbers(selectedDayNumbers.filter((d) => d !== dayNum));
    } else {
      setSelectedDayNumbers([...selectedDayNumbers, dayNum]);
    }
  };

  const selectAll = () => {
    setSelectedDayNumbers(mealPlan.map((d) => d.dayNumber));
  };

  const selectNext7Days = () => {
    setSelectedDayNumbers([1, 2, 3, 4, 5, 6, 7]);
  };

  const deselectAll = () => {
    setSelectedDayNumbers([]);
  };

  const handleSyncToCalendar = async () => {
    if (!isAuthenticatedWithGoogle()) {
      await initGoogleAuthSDK();
      requestGoogleAccessToken();
      return;
    }

    if (selectedDayNumbers.length === 0) {
      setSyncMessage('Please select at least one day to sync.');
      return;
    }

    setSyncing(true);
    setSyncMessage(null);

    const daysToSync = mealPlan.filter((d) => selectedDayNumbers.includes(d.dayNumber));

    // Construct Calendar events for lunch and dinner
    const events: Array<{
      summary: string;
      description: string;
      startDateTime: string;
      endDateTime: string;
    }> = [];

    daysToSync.forEach((plan) => {
      // Lunch event: 1:00 PM - 2:00 PM
      const lunchStart = `${plan.dateStr}T13:00:00+05:30`;
      const lunchEnd = `${plan.dateStr}T14:00:00+05:30`;
      events.push({
        summary: `🍛 Health Lunch: ${plan.lunch.split('+')[0].trim()}`,
        description: `🍏 Health Planner Personalized Meal Plan:\n\n• Lunch Menu: ${plan.lunch}\n• Breakfast: ${plan.breakfast}\n• Target Deficit Budget: ~${plan.targetCalories} kcal`,
        startDateTime: lunchStart,
        endDateTime: lunchEnd,
      });

      // Dinner event: 8:00 PM - 9:00 PM
      const dinnerStart = `${plan.dateStr}T20:00:00+05:30`;
      const dinnerEnd = `${plan.dateStr}T21:00:00+05:30`;
      events.push({
        summary: `🍲 Health Dinner: ${plan.dinner.split('+')[0].trim()}`,
        description: `🍏 Health Planner Personalized Meal Plan:\n\n• Dinner Menu: ${plan.dinner}\n• Evening Snack: ${plan.eveningSnack}\n• Target Deficit Budget: ~${plan.targetCalories} kcal`,
        startDateTime: dinnerStart,
        endDateTime: dinnerEnd,
      });
    });

    const res = await syncBatchEventsToCalendar(events);
    setSyncing(false);

    if (res.success) {
      setSyncMessage(`🎉 Successfully synced ${res.count} meal alarms to your Google Calendar!`);
    } else {
      setSyncMessage('Failed to sync. Please ensure Google Calendar permissions are granted.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl overflow-y-auto">
      <div className="relative w-full max-w-4xl my-auto rounded-3xl bg-neutral-900/95 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 md:p-8 space-y-6 text-slate-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400">
              <Calendar className="w-5 h-5" />
              <h2 className="text-xl font-bold font-rounded text-white">
                30-Day Indian Meal Plan & Calendar Picker
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select specific days to preview and schedule in your Google Calendar without dumping spam.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Selection Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-neutral-800/60 p-3 rounded-2xl border border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Selection:</span>
            <button
              onClick={selectNext7Days}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-bold transition-all"
            >
              Next 7 Days (Recommended)
            </button>
            <button
              onClick={selectAll}
              className="px-3 py-1.5 rounded-xl bg-white/10 text-slate-300 hover:bg-white/15 font-semibold transition-all"
            >
              Select All (30 Days)
            </button>
            <button
              onClick={deselectAll}
              className="px-3 py-1.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 transition-all"
            >
              Clear
            </button>
          </div>

          <span className="font-bold text-emerald-400">
            {selectedDayNumbers.length} of 30 Days Selected ({selectedDayNumbers.length * 2} Calendar Events)
          </span>
        </div>

        {/* Status Alert */}
        {syncMessage && (
          <div
            className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
              syncMessage.includes('Success')
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Day Cards Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {mealPlan.map((plan) => {
            const isSelected = selectedDayNumbers.includes(plan.dayNumber);
            return (
              <div
                key={plan.dayNumber}
                onClick={() => toggleDay(plan.dayNumber)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-neutral-800/80 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                    : 'bg-neutral-900/40 border-white/5 hover:border-white/15 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-emerald-500 border-emerald-400 text-white'
                          : 'bg-neutral-800 border-neutral-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm text-white font-rounded">
                      Day {plan.dayNumber} • {plan.dateStr}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    ~{plan.targetCalories} kcal
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-xl bg-neutral-900/60 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">🥞 Breakfast</span>
                    <p className="text-slate-200 line-clamp-2">{plan.breakfast}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-neutral-900/60 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-cyan-400 block mb-0.5">🍛 Lunch (Alarm)</span>
                    <p className="text-slate-200 line-clamp-2">{plan.lunch}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-neutral-900/60 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">🍿 Snack</span>
                    <p className="text-slate-200 line-clamp-2">{plan.eveningSnack}</p>
                  </div>

                  <div className="p-2 rounded-xl bg-neutral-900/60 border border-white/5">
                    <span className="text-[10px] uppercase font-bold text-purple-400 block mb-0.5">🍲 Dinner (Alarm)</span>
                    <p className="text-slate-200 line-clamp-2">{plan.dinner}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 text-xs font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSyncToCalendar}
            disabled={syncing || selectedDayNumbers.length === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Syncing {selectedDayNumbers.length} Days to Google Calendar...</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Confirm & Sync {selectedDayNumbers.length} Days to Calendar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
