import { googlePages, googleRequest, taskList } from '../../integrations/sync';
import { hasGoogleScope } from '../gdrive/auth.service';
import { GOOGLE_SCOPES } from '../../config/gdrive.config';
export async function getOrCreateHealthTaskList(): Promise<string | null> { if (!hasGoogleScope(GOOGLE_SCOPES.TASKS)) return null; try { return await taskList(); } catch { return null; } }
export async function createGoogleTaskItem(taskListId: string, title: string, notes?: string): Promise<boolean> {
  if (!hasGoogleScope(GOOGLE_SCOPES.TASKS)) return false;
  try {
    const date = new Date().toLocaleDateString('en-CA');
    const base = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(taskListId)}/tasks`;
    const marker = `[HealthPlannerLegacy:${date}:${encodeURIComponent(title)}]`;
    const existing = (await googlePages(`${base}?showCompleted=true&showHidden=true`)).find(t => t.notes?.includes(marker));
    if (existing) return true;
    await googleRequest(base, { method: 'POST', body: JSON.stringify({ title, notes: `${notes || ''}\n${marker}`, due: `${date}T00:00:00.000Z`, status: 'needsAction' }) }); return true;
  } catch { return false; }
}
export async function fetchGoogleTasks(customTaskListId?: string): Promise<Array<{ id: string; title: string; status: 'needsAction' | 'completed'; due?: string }>> {
  if (!hasGoogleScope(GOOGLE_SCOPES.TASKS)) return [];
  try { const id = customTaskListId || await taskList(); const today = new Date().toLocaleDateString('en-CA'); return (await googlePages(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(id)}/tasks?showCompleted=true&showHidden=true`)).filter(t => t.due?.slice(0, 10) === today).map(t => ({ id: t.id, title: t.title, status: t.status, due: t.due })); } catch { return []; }
}
export async function updateGoogleTaskStatus(taskId: string, completed: boolean, customTaskListId?: string): Promise<boolean> {
  if (!hasGoogleScope(GOOGLE_SCOPES.TASKS)) return false;
  try { const id = customTaskListId || await taskList(); await googleRequest(`https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(id)}/tasks/${encodeURIComponent(taskId)}`, { method: 'PATCH', body: JSON.stringify({ status: completed ? 'completed' : 'needsAction' }) }); return true; } catch { return false; }
}
// Retained for older screens. New screens export actual dated plan occurrences instead.
export async function syncDailyChecklistToTasks(): Promise<{ success: boolean; count: number }> {
  const id = await getOrCreateHealthTaskList(); if (!id) return { success: false, count: 0 };
  const items = ['Review today’s meal plan', 'Review today’s movement plan']; let count = 0;
  for (const title of items) if (await createGoogleTaskItem(id, title)) count++;
  return { success: count === items.length, count };
}
