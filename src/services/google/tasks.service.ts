import { getAccessToken } from '../gdrive/auth.service';

const TASKLIST_TITLE = '🍏 Health Planner Daily Routine';

export async function getOrCreateHealthTaskList(): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const listResponse = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const listData = await listResponse.json();
    const taskLists = listData.items || [];
    const existing = taskLists.find((t: any) => t.title === TASKLIST_TITLE);

    if (existing) return existing.id;

    const createResponse = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: TASKLIST_TITLE }),
    });
    const createData = await createResponse.json();
    return createData.id || null;
  } catch (err) {
    console.error('Failed to get/create TaskList:', err);
    return null;
  }
}

export async function createGoogleTaskItem(taskListId: string, title: string, notes?: string): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  const task = {
    title: title,
    notes: notes || 'Health Planner daily action checklist',
    due: new Date().toISOString(),
    status: 'needsAction',
  };

  try {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to create Task item:', err);
    return false;
  }
}

/**
 * Creates today's full health action items checklist in Google Tasks
 */
export async function syncDailyChecklistToTasks(): Promise<{ success: boolean; count: number }> {
  const taskListId = await getOrCreateHealthTaskList();
  if (!taskListId) return { success: false, count: 0 };

  const dailyChecklist = [
    { title: '⚖️ Morning Fasted Weigh-In', notes: 'Weigh upon waking up on calibrated scale and record in app' },
    { title: '💧 Drink 1st Liter Water (Hydration Milestone)', notes: 'Stay hydrated before noon' },
    { title: '🍛 Log Lunch Meals & Track Indian Portions (Katori/Grams)', notes: 'Record calories and tadka intensity' },
    { title: '💧 Drink 2nd Liter Water + Salted Chaas', notes: 'Afternoon electrolyte replenishment' },
    { title: '🏃 30 Min Workout / Surya Namaskar / Brisk Walk', notes: 'Burn active energy towards deficit' },
    { title: '🍲 Log Dinner & Review Daily Deficit Streak', notes: 'Check remaining calorie fuel gauge' },
    { title: '⏳ Start Intermittent Fasting Window at 8:00 PM', notes: 'Zero calorie intake until morning' },
  ];

  let count = 0;
  for (const item of dailyChecklist) {
    const ok = await createGoogleTaskItem(taskListId, item.title, item.notes);
    if (ok) count++;
  }

  return { success: count > 0, count };
}
