import React, { useEffect, useState } from 'react';
import { authorizeGoogle, disconnectGoogle, hasGoogleScope } from '../services/gdrive/auth.service';
import { GOOGLE_SCOPES } from '../config/gdrive.config';
import { googleAccount, integrationStatus, queueOccurrences, resolveIntegrationConflict, synchronize, type IntegrationOccurrence, type Provider } from './sync';
export type { IntegrationOccurrence } from './sync';
export function IntegrationPanel({ occurrences = [], onCompletionChange }: { occurrences?: IntegrationOccurrence[]; onCompletionChange?: (id: string, completed: boolean) => void }) {
  const [account, setAccount] = useState(''); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  const [rows, setRows] = useState<Awaited<ReturnType<typeof integrationStatus>>>([]);
  const refresh = async () => setRows(await integrationStatus());
  useEffect(() => { void refresh(); }, []);
  const perform = async (action: () => Promise<void>) => { setBusy(true); setMessage(''); try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : String(error)); } finally { await refresh(); setBusy(false); } };
  const connect = (provider: Provider) => perform(async () => { await authorizeGoogle(['openid', provider === 'calendar' ? GOOGLE_SCOPES.CALENDAR_EVENTS : GOOGLE_SCOPES.TASKS]); setAccount(await googleAccount()); setMessage(`${provider === 'calendar' ? 'Calendar' : 'Tasks'} connected. Review your schedule, then sync.`); });
  const sync = () => perform(async () => {
    if (!account) throw new Error('Connect Calendar or Tasks first.');
    const providers: Provider[] = [];
    if (hasGoogleScope(GOOGLE_SCOPES.CALENDAR_EVENTS)) providers.push('calendar');
    if (hasGoogleScope(GOOGLE_SCOPES.TASKS)) providers.push('tasks');
    if (!providers.length) throw new Error('Reconnect Google to sync your saved changes.');
    await queueOccurrences(account, occurrences, providers); await synchronize(account, onCompletionChange);
    setMessage(navigator.onLine ? 'Sync checked. Any conflicts or unfinished items are listed below.' : 'Saved offline. Sync again when connected.');
  });
  const visible = rows.filter(row => row.account === account);
  return <section className="glass-panel p-6 space-y-4" aria-label="Google reminders">
    <div><h2 className="text-xl font-semibold">Your reminders, connected</h2><p className="text-sm text-slate-400">Calendar sends timed reminders. Tasks keeps a dated checklist; Google’s API does not support task reminder times.</p></div>
    <div className="flex flex-wrap gap-3">
      <button disabled={busy} onClick={() => connect('calendar')} className="px-4 py-2 rounded-xl border border-current">Connect Calendar</button>
      <button disabled={busy} onClick={() => connect('tasks')} className="px-4 py-2 rounded-xl border border-current">Connect Tasks</button>
      <button disabled={busy || !account} onClick={sync} className="px-4 py-2 rounded-xl bg-emerald-600 text-white">{busy ? 'Working…' : `Sync ${occurrences.length} scheduled items`}</button>
      {account && <button disabled={busy} onClick={() => { disconnectGoogle(); setAccount(''); setMessage('Disconnected. Existing Google reminders remain in your account.'); }}>Disconnect</button>}
    </div>
    <p className="text-sm">Only schedule titles and times are shared. Diagnoses and lab results stay out of reminders. Google reminders can arrive while this app is closed; changes sync while it is open and connected.</p>
    {message && <p role="status" className="text-sm">{message}</p>}
    <p className="text-sm text-slate-400">{visible.filter(r => r.state === 'synced').length} synced · {visible.filter(r => r.state !== 'synced').length} need attention</p>
    {visible.filter(row => row.state !== 'synced').map(row => <div key={row.key} className="p-3 rounded-xl border border-current"><strong>{row.occurrence.title}</strong> <span className="text-sm">{row.provider} · {row.occurrence.date}</span><p>{row.message || 'Waiting to sync'}</p>{row.state === 'conflict' && <div className="flex gap-4"><button disabled={busy} onClick={() => perform(() => resolveIntegrationConflict(row.key, false))}>Keep Google version</button><button disabled={busy} onClick={() => perform(() => resolveIntegrationConflict(row.key, true))}>Restore app version on next sync</button></div>}</div>)}
  </section>;
}
