import { getAccessToken } from '../gdrive/auth.service';
import { DailyMealPlan } from '../../utils/mealPlanGenerator';

export interface CalendarEventPayload {
  title: string;
  description?: string;
  startTimeIso: string;
  durationMinutes: number;
}

export async function createGoogleCalendarReminder({
  title,
  description,
  startTimeIso,
  durationMinutes,
}: CalendarEventPayload): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  const startTime = new Date(startTimeIso);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  const event = {
    summary: `🍏 Health Planner: ${title}`,
    description: description || 'Scheduled reminder from Health Planner App',
    start: { dateTime: startTime.toISOString() },
    end: { dateTime: endTime.toISOString() },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 15 },
        { method: 'email', minutes: 30 },
      ],
    },
  };

  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to create Calendar event:', err);
    return false;
  }
}

/**
 * Syncs daily Intermittent Fasting schedule (Start & End Alarms) to Google Calendar
 */
export async function syncFastingWindowToCalendar(fastTargetHours: number): Promise<{ success: boolean; count: number }> {
  const token = getAccessToken();
  if (!token) return { success: false, count: 0 };

  let createdCount = 0;
  const today = new Date();

  // Schedule for the next 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Fast Starts at 8:00 PM (20:00)
    const fastStart = new Date(date);
    fastStart.setHours(20, 0, 0, 0);

    // Fast Ends next day based on target hours (e.g. 16h fast ends at 12:00 PM next day)
    const fastEnd = new Date(fastStart.getTime() + fastTargetHours * 60 * 60 * 1000);

    const startOk = await createGoogleCalendarReminder({
      title: `⏳ Fast Starts (Begin ${fastTargetHours}h Fast)`,
      description: `Intermittent Fasting ${fastTargetHours}:8 Window. Stop eating, hydrate with water/green tea.`,
      startTimeIso: fastStart.toISOString(),
      durationMinutes: 30,
    });

    const endOk = await createGoogleCalendarReminder({
      title: `🍽️ Eating Window Opens (End ${fastTargetHours}h Fast)`,
      description: `Break your fast with a nutritious meal (e.g. Sprouts, Dahi, Moong Dal Chilla).`,
      startTimeIso: fastEnd.toISOString(),
      durationMinutes: 30,
    });

    if (startOk) createdCount++;
    if (endOk) createdCount++;
  }

  return { success: createdCount > 0, count: createdCount };
}

/**
 * Exports 30-Day Indian Meal Plan to Google Calendar
 */
export async function sync30DayMealPlanToCalendar(mealPlans: DailyMealPlan[]): Promise<{ success: boolean; count: number }> {
  const token = getAccessToken();
  if (!token) return { success: false, count: 0 };

  let createdCount = 0;

  for (const plan of mealPlans.slice(0, 14)) { // Batch sync next 14 days to prevent quota throttle
    const date = new Date(plan.dateStr);

    // Lunch Event (1:00 PM)
    const lunchTime = new Date(date);
    lunchTime.setHours(13, 0, 0, 0);

    const lunchOk = await createGoogleCalendarReminder({
      title: `🍛 Lunch: ${plan.lunch.split('+')[0]}`,
      description: `Full Menu: ${plan.lunch}\nEvening Snack: ${plan.eveningSnack}\nPlanned by Health Planner Indian Nutrition Engine`,
      startTimeIso: lunchTime.toISOString(),
      durationMinutes: 45,
    });

    // Dinner Event (8:00 PM)
    const dinnerTime = new Date(date);
    dinnerTime.setHours(20, 0, 0, 0);

    const dinnerOk = await createGoogleCalendarReminder({
      title: `🍲 Dinner: ${plan.dinner.split('+')[0]}`,
      description: `Full Menu: ${plan.dinner}\nTarget Daily Budget: ${plan.targetCalories} kcal`,
      startTimeIso: dinnerTime.toISOString(),
      durationMinutes: 45,
    });

    if (lunchOk) createdCount++;
    if (dinnerOk) createdCount++;
  }

  return { success: createdCount > 0, count: createdCount };
}
