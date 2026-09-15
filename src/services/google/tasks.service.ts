import { getAccessToken } from '../gdrive/auth.service';

export async function createGoogleTaskReminder(title: string, notes?: string): Promise<boolean> {
  const token = getAccessToken();
  if (!token) return false;

  const task = {
    title: `🍏 Health Task: ${title}`,
    notes: notes || 'Health Planner daily action item',
    due: new Date().toISOString(),
  };

  try {
    const res = await fetch('https://www.googleapis.com/tasks/v1/lists/@default/tasks', {
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
