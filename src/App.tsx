import { useEffect, useState } from 'react';
import {
  CalendarDays,
  ChefHat,
  Activity,
  HeartPulse,
  BarChart3,
  Settings,
  Menu,
  Plus,
  GlassWater,
  Moon,
  Scale,
  Download,
  Upload,
  CheckSquare,
  Square,
  Flame,
  ArrowRight,
  Sparkles,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useHealthStore } from './domain/healthStore';
import { Onboarding } from './features/Onboarding';
import { MealPlanner } from './features/MealPlanner';
import { Exercise } from './features/Exercise';
import { Health } from './features/Health';
import { Insights } from './features/Insights';
import { Glass } from './features/Glass';
import { today, dateLabel } from './features/dates';

type Tab = 'today' | 'plan' | 'exercise' | 'health' | 'insights' | 'settings';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'today', label: 'Today', icon: CalendarDays },
  { id: 'plan', label: 'Meal plan', icon: ChefHat },
  { id: 'exercise', label: 'Exercise', icon: Activity },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

const currentTab = (): Tab => {
  const value = location.hash.replace('#/', '') as Tab;
  return tabs.some(t => t.id === value) ? value : 'today';
};

export function App() {
  const store = useHealthStore();
  const [tab, setTab] = useState<Tab>(currentTab);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    void store.init();
    const h = () => setTab(currentTab());
    addEventListener('hashchange', h);
    return () => removeEventListener('hashchange', h);
  }, []);

  const go = (id: Tab) => {
    location.hash = `/${id}`;
    setTab(id);
    setMobile(false);
  };

  if (!store.ready) {
    return (
      <div className="splash">
        <div className="orbit" />
        <p>Opening your offline planner…</p>
      </div>
    );
  }

  if (!store.state.profile.onboarded) {
    return (
      <main className="onboarding-page">
        <Onboarding />
      </main>
    );
  }

  const themeClass = store.state.settings.theme === 'light' ? 'theme-light' : 'theme-dark';

  return (
    <div className={`app-shell ${themeClass} ${store.state.settings.reduceTransparency ? 'reduced-transparency' : ''}`}>
      {/* Sidebar for Desktop */}
      <aside className="app-sidebar">
        <Brand />
        <nav aria-label="Main navigation">
          {tabs.map(t => (
            <NavButton key={t.id} tab={t} active={tab === t.id} onClick={() => go(t.id)} />
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>Personal data stays on this device.</p>
          <button onClick={() => go('settings')}>Privacy & recovery</button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="mobile-top">
        <Brand />
        <button aria-label="Open navigation" onClick={() => setMobile(!mobile)}>
          <Menu />
        </button>
      </header>

      {mobile && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {tabs.map(t => (
            <NavButton key={t.id} tab={t} active={tab === t.id} onClick={() => go(t.id)} />
          ))}
        </nav>
      )}

      {/* Main Content Area */}
      <main className="app-main">
        {store.error && (
          <div className="notice error mb-4" role="alert">
            {store.error}
            <button onClick={store.clearError}>Dismiss</button>
          </div>
        )}

        {tab === 'today' && <Today />}
        {tab === 'plan' && <MealPlanner />}
        {tab === 'exercise' && <Exercise />}
        {tab === 'health' && <Health />}
        {tab === 'insights' && <Insights />}
        {tab === 'settings' && <SettingsPage />}
      </main>

      {/* Mobile Floating Liquid Glass Dock */}
      <Glass className="mobile-dock" disabled={store.state.settings.reduceTransparency}>
        {tabs.slice(0, 5).map(t => {
          const I = t.icon;
          return (
            <button
              key={t.id}
              aria-label={t.label}
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => go(t.id)}
            >
              <I size={20} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </Glass>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand flex items-center gap-3">
      <span className="brand-mark">H</span>
      <span>
        Health<br />
        <em>Planner</em>
      </span>
    </div>
  );
}

function NavButton({
  tab,
  active,
  onClick
}: {
  tab: { id: Tab; label: string; icon: any };
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button className={active ? 'nav-active' : ''} aria-current={active ? 'page' : undefined} onClick={onClick}>
      <Icon size={19} />
      <span>{tab.label}</span>
    </button>
  );
}

// Today Dashboard with Full Daily Tracker Tasks for Both Diet and Exercise
function Today() {
  const { state, update } = useHealthStore();
  const date = today(state.profile.timezone);
  const plan = state.plans[0];
  const meals = (plan?.entries || []).filter((e: any) => e.date === date);
  const workouts = (state.occurrences || []).filter((x: any) => x.date === date && !x.cancelled);
  const diary = state.diary.find((x: any) => x.date === date) || {};
  const first = state.profile.name.split(' ')[0] || 'there';

  const agenda = [
    ...meals.map((m: any) => ({ kind: 'Meal', name: m.recipe.name, detail: m.slot, locked: m.locked })),
    ...workouts.map((w: any) => ({ kind: 'Workout', name: w.title, detail: w.startTime }))
  ];

  // Daily Tracker Task definitions for Diet & Exercise
  const dietTasks = [
    { id: 'diet_breakfast', label: 'Log Healthy Breakfast', category: 'diet' },
    { id: 'diet_lunch', label: 'Log Balanced Lunch', category: 'diet' },
    { id: 'diet_snack', label: 'Log Evening Snack (Nuts/Fruit)', category: 'diet' },
    { id: 'diet_dinner', label: 'Log Light Dinner', category: 'diet' },
    { id: 'diet_deficit', label: 'Maintain Daily Negative Deficit Target', category: 'diet' },
    { id: 'diet_water', label: 'Drink 2,500ml+ Water', category: 'diet' }
  ];

  const exerciseTasks = [
    { id: 'ex_morning_walk', label: '30-Min Brisk Walk / Morning Movement', category: 'exercise' },
    { id: 'ex_desk_breaks', label: '2 Posture & Desk Stretch Breaks', category: 'exercise' },
    { id: 'ex_workout', label: 'Complete Daily Workout / Routine', category: 'exercise' },
    { id: 'ex_evening_stretch', label: 'Evening Mobility & Wind-Down Stretch', category: 'exercise' }
  ];

  const allTasks = [...dietTasks, ...exerciseTasks];
  const completedTaskIds: string[] = diary.tasks || [];
  const completedCount = allTasks.filter(t => completedTaskIds.includes(t.id)).length;
  const progressPercent = Math.round((completedCount / allTasks.length) * 100);

  function toggleTask(taskId: string) {
    void update(s => {
      let row = s.diary.find((x: any) => x.date === date);
      if (!row) {
        row = { id: crypto.randomUUID(), date, waterMl: 0, tasks: [] };
        s.diary.push(row);
      }
      if (!row.tasks) row.tasks = [];
      if (row.tasks.includes(taskId)) {
        row.tasks = row.tasks.filter((id: string) => id !== taskId);
      } else {
        row.tasks.push(taskId);
      }
    });
  }

  return (
    <div className="page-stack space-y-6">
      {/* Hero Welcome & Today's Intention */}
      <section className="today-hero surface">
        <div>
          <span className="eyebrow">{dateLabel(date, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1 className="text-ink mt-2">
            Good morning, {first}.<br />
            <em>Make today feel lighter.</em>
          </h1>
          <p className="muted text-sm mt-2">
            Your plan is an adaptable guide. Complete small daily wins, log what happens, and stay consistent.
          </p>
          <div className="button-row mt-4 flex flex-wrap gap-3">
            <button className="primary-btn flex items-center gap-2" onClick={() => (location.hash = '/plan')}>
              <ChefHat size={17} /> See today’s meals
            </button>
            <button className="secondary-btn flex items-center gap-2" onClick={() => (location.hash = '/exercise')}>
              <Activity size={17} /> Start a movement
            </button>
          </div>
        </div>

        <div className="scenic-panel">
          <span className="eyebrow text-xs uppercase text-emerald-300">Today’s Intention</span>
          <strong className="text-2xl font-bold mt-1">Small, Repeatable Care</strong>
          <p className="text-xs text-slate-200 mt-1">
            {meals.length ? `${meals.length} meals planned for today` : 'Build your first meal plan when you’re ready'}
          </p>
        </div>
      </section>

      {/* DAILY TRACKER TASKS FOR BOTH DIET AND EXERCISE */}
      <section className="surface p-6 rounded-3xl border border-rule space-y-4">
        <div className="section-heading flex items-center justify-between">
          <div>
            <span className="eyebrow font-bold text-xs">DAILY HABITS & TRACKER</span>
            <h2 className="text-xl font-bold text-ink mt-0.5">Today's Diet & Exercise Tasks</h2>
          </div>
          <span className="pill font-semibold text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {completedCount} of {allTasks.length} Completed ({progressPercent}%)
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* 🥗 Nutrition & Diet Tasks */}
          <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-rule space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rule">
              <h3 className="text-sm font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <ChefHat size={16} /> Nutrition & Diet Tasks
              </h3>
              <button
                className="text-xs font-semibold text-muted hover:text-ink flex items-center gap-1"
                onClick={() => (location.hash = '/plan')}
              >
                <span>Meal Plan</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {dietTasks.map(t => {
                const isDone = completedTaskIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex items-center gap-3 text-sm p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleTask(t.id)}
                      className="w-4 h-4 rounded text-emerald-500 accent-emerald-500 cursor-pointer"
                    />
                    <span className={isDone ? 'line-through text-muted' : 'text-ink font-medium'}>
                      {t.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 🏃 Movement & Exercise Tasks */}
          <div className="p-4 rounded-2xl bg-neutral-100/70 dark:bg-neutral-900/60 border border-rule space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rule">
              <h3 className="text-sm font-bold flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                <Activity size={16} /> Movement & Exercise Tasks
              </h3>
              <button
                className="text-xs font-semibold text-muted hover:text-ink flex items-center gap-1"
                onClick={() => (location.hash = '/exercise')}
              >
                <span>Workouts</span>
                <ArrowRight size={12} />
              </button>
            </div>

            <div className="space-y-2">
              {exerciseTasks.map(t => {
                const isDone = completedTaskIds.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className="flex items-center gap-3 text-sm p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => toggleTask(t.id)}
                      className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
                    />
                    <span className={isDone ? 'line-through text-muted' : 'text-ink font-medium'}>
                      {t.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Agenda Grid & Quick Check-in Checkers */}
      <section className="agenda-grid grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Your Agenda */}
        <section className="surface p-6 rounded-3xl border border-rule">
          <div className="section-heading flex items-center justify-between pb-2 border-b border-rule">
            <div>
              <span className="eyebrow font-bold text-xs">YOUR AGENDA</span>
              <h2 className="text-xl font-bold text-ink mt-0.5">What’s Next</h2>
            </div>
            <span className="pill font-semibold text-xs px-2.5 py-1 rounded-full">{agenda.length} items</span>
          </div>

          {agenda.length ? (
            <ol className="agenda-list mt-3 space-y-2.5">
              {agenda.map((item: any, i) => (
                <li key={`${item.kind}-${i}`} className="flex items-center gap-3 p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-rule">
                  <span className="agenda-marker w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                    {item.kind === 'Meal' ? <ChefHat size={16} /> : <Activity size={16} />}
                  </span>
                  <div className="flex-1">
                    <strong className="text-sm font-bold text-ink">{item.name}</strong>
                    <small className="block text-xs text-muted">
                      {item.kind} · {item.detail}
                      {item.locked ? ' · locked' : ''}
                    </small>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="empty-state py-8 text-center text-sm text-muted">
              No items planned yet for today. Start with a meal in{' '}
              <button className="text-emerald-600 dark:text-emerald-400 font-bold underline" onClick={() => (location.hash = '/plan')}>
                Meal Plan
              </button>{' '}
              or an exercise routine in{' '}
              <button className="text-cyan-600 dark:text-cyan-400 font-bold underline" onClick={() => (location.hash = '/exercise')}>
                Exercise
              </button>
              .
            </p>
          )}
        </section>

        {/* Quick Check-in (Water, Sleep, Weight) */}
        <section className="surface soft p-6 rounded-3xl border border-rule">
          <span className="eyebrow font-bold text-xs">QUICK LOG</span>
          <h2 className="text-xl font-bold text-ink mt-0.5">Check In</h2>
          <p className="muted text-xs mt-1">One-tap daily tracking. Missing days remain neutral and blank.</p>

          <div className="quick-grid grid grid-cols-3 gap-3 mt-4">
            <Quick
              icon={<GlassWater size={18} className="text-cyan-500" />}
              label="Water"
              value={`${diary.waterMl || 0} ml`}
              onClick={() =>
                void update(s => {
                  const row = s.diary.find((x: any) => x.date === date);
                  if (row) row.waterMl = (row.waterMl || 0) + 250;
                  else s.diary.push({ id: crypto.randomUUID(), date, waterMl: 250 });
                })
              }
            />

            <Quick
              icon={<Moon size={18} className="text-purple-500" />}
              label="Sleep"
              value={diary.sleepHours === undefined ? 'Add' : `${diary.sleepHours} h`}
              onClick={() => {
                const value = prompt('Sleep hours', String(diary.sleepHours ?? '8'));
                if (value !== null && value !== '' && !Number.isNaN(Number(value))) {
                  void update(s => {
                    const row = s.diary.find((x: any) => x.date === date);
                    if (row) row.sleepHours = Number(value);
                    else s.diary.push({ id: crypto.randomUUID(), date, sleepHours: Number(value) });
                  });
                }
              }}
            />

            <Quick
              icon={<Scale size={18} className="text-emerald-500" />}
              label="Weight"
              value={diary.weightKg === undefined ? 'Add' : `${diary.weightKg} kg`}
              onClick={() => {
                const value = prompt('Weight in kg', String(diary.weightKg ?? state.profile.weightKg ?? ''));
                if (value !== null && value !== '' && !Number.isNaN(Number(value))) {
                  void update(s => {
                    const row = s.diary.find((x: any) => x.date === date);
                    if (row) row.weightKg = Number(value);
                    else s.diary.push({ id: crypto.randomUUID(), date, weightKg: Number(value) });
                    s.profile.weightKg = Number(value);
                  });
                }
              }}
            />
          </div>
        </section>
      </section>
    </div>
  );
}

function Quick({
  icon,
  label,
  value,
  onClick
}: {
  icon: any;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="p-3 rounded-2xl border border-rule bg-white dark:bg-black/30 hover:bg-neutral-50 dark:hover:bg-white/5 flex flex-col items-start gap-1 transition-all text-left"
    >
      <div className="flex items-center justify-between w-full">
        {icon}
        <Plus size={14} className="text-muted" />
      </div>
      <span className="text-xs text-muted font-semibold mt-1">{label}</span>
      <strong className="text-sm font-bold text-ink">{value}</strong>
    </button>
  );
}

function SettingsPage() {
  const { state, update, exportData, importData } = useHealthStore();
  const [status, setStatus] = useState('');
  const profile = state.profile;

  return (
    <div className="page-stack space-y-6">
      <header>
        <span className="eyebrow font-bold text-xs uppercase">SETTINGS & RECOVERY</span>
        <h1 className="text-2xl md:text-3xl font-bold text-ink mt-1">Your data, your control</h1>
        <p className="muted text-sm mt-1">
          Private records live in this browser. Export a copy before clearing browser data or changing devices.
        </p>
      </header>

      <section className="workspace-split grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance & Profile */}
        <section className="surface p-6 rounded-3xl border border-rule space-y-4">
          <h2 className="text-xl font-bold text-ink">Appearance</h2>
          <div className="form-grid space-y-3">
            <label className="field">
              <span className="text-sm font-semibold">Theme</span>
              <select
                value={state.settings.theme}
                onChange={e =>
                  void update(s => {
                    s.settings.theme = e.target.value;
                  })
                }
                className="form-select"
              >
                <option value="dark">Dark Theme (Apple OLED)</option>
                <option value="light">Light Theme (Crisp High-Contrast)</option>
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={state.settings.reduceTransparency}
                onChange={e =>
                  void update(s => {
                    s.settings.reduceTransparency = e.target.checked;
                  })
                }
                className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
              />
              <span>Reduce transparency (Disable frosted blur effects)</span>
            </label>
          </div>

          <h2 className="text-xl font-bold text-ink pt-4 border-t border-rule">Profile Details</h2>
          <div className="form-grid space-y-3">
            <label className="field">
              <span className="text-sm font-semibold">Name</span>
              <input
                value={profile.name}
                onChange={e =>
                  void update(s => {
                    s.profile.name = e.target.value;
                  })
                }
                className="form-input"
              />
            </label>

            <label className="field">
              <span className="text-sm font-semibold">Daily planning reference (Calories)</span>
              <input
                type="number"
                min="800"
                max="6000"
                value={profile.targetCalories || ''}
                placeholder="Optional kcal"
                onChange={e =>
                  void update(s => {
                    s.profile.targetCalories = e.target.value ? Number(e.target.value) : undefined;
                  })
                }
                className="form-input"
              />
            </label>

            <label className="field">
              <span className="text-sm font-semibold">Clinician instructions & notes</span>
              <textarea
                value={profile.clinicalNotes}
                onChange={e =>
                  void update(s => {
                    s.profile.clinicalNotes = e.target.value;
                  })
                }
                className="form-input min-h-[80px]"
              />
            </label>
          </div>
        </section>

        {/* Recovery & Export */}
        <section className="surface p-6 rounded-3xl border border-rule space-y-4">
          <h2 className="text-xl font-bold text-ink">Backup & Recovery</h2>
          <p className="text-sm muted">
            Export contains only your personal health records, never the food catalog or OAuth access token.
          </p>

          <div className="button-row flex flex-wrap gap-3 pt-2">
            <button
              className="primary-btn flex items-center gap-2"
              onClick={() => {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(new Blob([exportData()], { type: 'application/json' }));
                a.download = `health-planner-backup-${today()}.json`;
                a.click();
                URL.revokeObjectURL(a.href);
                setStatus('Backup downloaded successfully.');
              }}
            >
              <Download size={17} /> Export backup
            </button>

            <label className="secondary-btn flex items-center gap-2 cursor-pointer">
              <Upload size={17} /> Import backup
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={async e => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setStatus(
                    (await importData(await f.text()))
                      ? 'Backup imported and merged.'
                      : 'Import was rejected; your current records are unchanged.'
                  );
                  e.target.value = '';
                }}
              />
            </label>
          </div>

          {state.conflicts.length > 0 && (
            <p className="notice error text-xs">
              {state.conflicts.length} concurrent edit conflict(s) retained. Export a backup, then review the newest records before removing duplicates.
            </p>
          )}

          {status && (
            <p className="notice text-xs" role="status">
              {status}
            </p>
          )}

          <h2 className="text-xl font-bold text-ink pt-4 border-t border-rule">Connected Services</h2>
          <p className="muted text-sm">
            Google Calendar and Google Tasks are available to receive session reminders and daily habits. Connections use temporary browser authorization.
          </p>
        </section>
      </section>
    </div>
  );
}
