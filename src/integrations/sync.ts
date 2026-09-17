import { openDB } from 'idb';
import { getAccessToken } from '../services/gdrive/auth.service';
export interface IntegrationOccurrence { id: string; title: string; date: string; startTime: string; durationMinutes: number; timeZone: string; completed?: boolean; revision?: number; cancelled?: boolean; }
export type Provider = 'calendar' | 'tasks';
interface Mapping { key: string; account: string; occurrence: IntegrationOccurrence; provider: Provider; externalId?: string; listId?: string; etag?: string; fingerprint?: string; completed?: boolean; state: 'queued' | 'synced' | 'conflict' | 'error'; message?: string; attempted?: boolean; }
const db = () => openDB('health-planner-integrations', 1, { upgrade(database) { database.createObjectStore('resources', { keyPath: 'key' }); } });
export async function integrationStatus(): Promise<Mapping[]> { return (await db()).getAll('resources'); }
async function save(row: Mapping) { await (await db()).put('resources', row); }
export class GoogleApiError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function googleRequest(path: string, init: RequestInit = {}): Promise<any> {
  const token = getAccessToken(); if (!token) throw new GoogleApiError(401, 'Reconnect Google to continue syncing.');
  const response = await fetch(path, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init.headers } });
  if (!response.ok) throw new GoogleApiError(response.status, response.status === 401 ? 'Google session expired. Reconnect.' : response.status === 403 ? 'Permission denied. Reconnect the required service.' : response.status === 429 ? 'Google is busy. Your changes are saved; retry shortly.' : `Google returned ${response.status}. Changes remain queued.`);
  return response.status === 204 ? null : response.json();
}
export async function googlePages(url: string, property = 'items'): Promise<any[]> {
  const all: any[] = []; let pageToken: string | undefined;
  do { const page = await googleRequest(url + (pageToken ? `${url.includes('?') ? '&' : '?'}pageToken=${encodeURIComponent(pageToken)}` : '')); all.push(...(page[property] || [])); pageToken = page.nextPageToken; } while (pageToken);
  return all;
}
export async function googleAccount(): Promise<string> { return (await googleRequest('https://openidconnect.googleapis.com/v1/userinfo')).sub; }
export async function taskList(): Promise<string> {
  const url = 'https://tasks.googleapis.com/tasks/v1/users/@me/lists';
  const lists = await googlePages(url); const found = lists.find(item => item.title === 'Health Planner');
  return found?.id || (await googleRequest(url, { method: 'POST', body: JSON.stringify({ title: 'Health Planner' }) })).id;
}
export function occurrenceFingerprint(value: IntegrationOccurrence) { return JSON.stringify([value.title, value.date, value.startTime, value.durationMinutes, value.timeZone, !!value.cancelled]); }
// Convert local wall time in an IANA zone. Reject nonexistent DST times rather than silently moving reminders.
export function occurrenceStart(value: IntegrationOccurrence): Date {
  const [year, month, day] = value.date.split('-').map(Number); const [hour, minute] = value.startTime.split(':').map(Number);
  const target = Date.UTC(year, month - 1, day, hour, minute); let timestamp = target;
  const format = new Intl.DateTimeFormat('en-CA', { timeZone: value.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  const localEpoch = (instant: number) => { const parts = Object.fromEntries(format.formatToParts(new Date(instant)).map(p => [p.type, p.value])); return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute); };
  for (let i = 0; i < 4; i++) timestamp += target - localEpoch(timestamp);
  if (localEpoch(timestamp) !== target || !Number.isFinite(timestamp)) throw new Error('This reminder time does not exist in the selected time zone. Choose another time.');
  return new Date(timestamp);
}
async function stableEventId(key: string) { const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key)); return 'hp' + [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, '0')).join(''); }
export async function queueOccurrences(account: string, occurrences: IntegrationOccurrence[], providers: Provider[]) {
  for (const occurrence of occurrences) for (const provider of providers) {
    const key = `${account}:${provider}:${occurrence.id}`; const old = await (await db()).get('resources', key) as Mapping | undefined;
    const changed = !old || occurrenceFingerprint(occurrence) !== occurrenceFingerprint(old.occurrence) || !!occurrence.completed !== !!old.occurrence.completed;
    await save({ ...old, key, account, provider, occurrence, state: old?.state === 'conflict' ? 'conflict' : changed ? 'queued' : old.state });
  }
}
const calendarBase = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
function remoteFingerprint(remote: any) { return JSON.stringify([remote.summary, remote.start?.dateTime, remote.end?.dateTime, remote.status]); }
export async function synchronize(account: string, onCompletion?: (id: string, completed: boolean) => void): Promise<void> {
  if (!navigator.onLine) return;
  for (const row of await integrationStatus()) {
    if (row.account !== account || row.state === 'conflict') continue;
    try {
      if (row.provider === 'calendar') {
        const id = row.externalId || await stableEventId(row.key); const url = `${calendarBase}/${id}`;
        let remote: any; try { remote = await googleRequest(url); } catch (e) { if (!(e instanceof GoogleApiError) || ![404, 410].includes(e.status)) throw e; }
        if (row.externalId && (!remote || remote.status === 'cancelled')) { row.state = 'conflict'; row.message = 'Deleted in Google. Keep removed or restore the app schedule.'; await save(row); continue; }
        if (remote && row.fingerprint && row.fingerprint !== remoteFingerprint(remote)) { row.state = 'conflict'; row.message = 'Changed in Google. Review before replacing its schedule.'; await save(row); continue; }
        if (row.occurrence.cancelled) { if (remote) await googleRequest(url, { method: 'DELETE', headers: remote.etag ? { 'If-Match': remote.etag } : {} }); row.externalId = undefined; }
        else if (row.state !== 'synced' || !remote) {
          const start = occurrenceStart(row.occurrence); const body = { summary: row.occurrence.title, start: { dateTime: start.toISOString(), timeZone: row.occurrence.timeZone }, end: { dateTime: new Date(start.getTime() + row.occurrence.durationMinutes * 60000).toISOString(), timeZone: row.occurrence.timeZone }, reminders: { useDefault: false, overrides: [{ method: 'popup', minutes: 15 }] }, extendedProperties: { private: { healthPlannerId: row.occurrence.id } } };
          const result = await googleRequest(remote ? url : calendarBase, { method: remote ? 'PATCH' : 'POST', headers: remote?.etag ? { 'If-Match': remote.etag } : {}, body: JSON.stringify(remote ? body : { ...body, id }) });
          row.externalId = result.id; row.etag = result.etag; row.fingerprint = remoteFingerprint(result);
        }
      } else {
        row.listId ||= await taskList(); const base = `https://tasks.googleapis.com/tasks/v1/lists/${encodeURIComponent(row.listId)}/tasks`;
        const marker = `[HealthPlanner:${row.occurrence.id}]`;
        let remote: any;
        if (row.externalId) { try { remote = await googleRequest(`${base}/${encodeURIComponent(row.externalId)}`); } catch (e) { if (!(e instanceof GoogleApiError) || e.status !== 404) throw e; } }
        else remote = (await googlePages(`${base}?showCompleted=true&showHidden=true&showDeleted=false`)).find(item => item.notes?.includes(marker));
        if (row.externalId && (!remote || remote.deleted)) { row.state = 'conflict'; row.message = 'Task removed in Google. Keep removed or restore it.'; await save(row); continue; }
        if (row.occurrence.cancelled) { if (remote) await googleRequest(`${base}/${remote.id}`, { method: 'DELETE' }); row.externalId = undefined; }
        else {
          if (remote && row.completed !== undefined && (remote.status === 'completed') !== row.completed) {
            if (!!row.occurrence.completed !== row.completed) { row.state = 'conflict'; row.message = 'Completion changed in both places.'; await save(row); continue; }
            row.occurrence.completed = remote.status === 'completed'; onCompletion?.(row.occurrence.id, !!row.occurrence.completed);
          }
          if (!remote && row.attempted) { row.state = 'conflict'; row.message = 'Previous task creation was uncertain. Check Google Tasks before restoring to avoid a duplicate.'; await save(row); continue; }
          if (!remote) { row.attempted = true; await save(row); }
          const body = { title: row.occurrence.title, notes: marker, due: `${row.occurrence.date}T00:00:00.000Z`, status: row.occurrence.completed ? 'completed' : 'needsAction' };
          const result = await googleRequest(remote ? `${base}/${remote.id}` : base, { method: remote ? 'PATCH' : 'POST', headers: remote?.etag ? { 'If-Match': remote.etag } : {}, body: JSON.stringify(body) });
          row.externalId = result.id; row.completed = result.status === 'completed'; row.etag = result.etag;
        }
      }
      row.state = 'synced'; row.message = undefined; await save(row);
    } catch (error) { row.state = error instanceof GoogleApiError && error.status === 412 ? 'conflict' : 'error'; row.message = error instanceof Error ? error.message : String(error); await save(row); if (error instanceof GoogleApiError && [401, 403, 429].includes(error.status)) break; }
  }
}
export async function resolveIntegrationConflict(key: string, restore: boolean) {
  const row = await (await db()).get('resources', key) as Mapping;
  if (!restore) { row.message = 'Google version retained. Automatic updates paused.'; await save(row); return; }
  row.state = 'queued'; row.fingerprint = undefined; row.externalId = undefined; row.attempted = false; row.completed = undefined; row.message = undefined; await save(row);
}
