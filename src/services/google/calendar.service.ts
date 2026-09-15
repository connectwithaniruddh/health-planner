import { getAccessToken } from '../gdrive/auth.service';

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
    description: description || 'Scheduled meal / workout reminder from Health Planner App',
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
