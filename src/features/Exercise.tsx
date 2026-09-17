import { useEffect, useMemo, useState } from 'react';
import { Play, Pause, Check, RotateCcw, Timer, ChevronRight, CalendarPlus, HeartPulse, Edit2, Trash2, X, Plus, ExternalLink } from 'lucide-react';
import { useHealthStore } from '../domain/healthStore';
import { today, addDays, dateLabel } from './dates';
import { IntegrationPanel, type IntegrationOccurrence } from '../integrations/IntegrationPanel';

type Category = 'Walk & cardio' | 'Strength' | 'Mobility' | 'Balance' | 'Seated' | 'Yoga';
type Exercise = {
  id: string;
  name: string;
  category: Category;
  minutes: number;
  reps: number;
  sets: number;
  equipment: string;
  impact: 'Low' | 'Moderate';
  muscle: string;
  steps: string[];
  cue: string;
  modification: string;
  avoid: string;
};

const seeds: [string, Category, string, string, string][] = [
  ['Brisk walk', 'Walk & cardio', 'None', 'Whole body', 'Walk tall, land softly, keep a pace that allows brief phrases.'],
  ['March in place', 'Walk & cardio', 'None', 'Whole body', 'Lift knees comfortably and swing arms in a steady rhythm.'],
  ['Step-up', 'Walk & cardio', 'Step', 'Legs', 'Place the full foot on a stable step, stand tall, then step down slowly.'],
  ['Sit-to-stand', 'Strength', 'Chair', 'Legs', 'Scoot forward, press through your feet, stand without pulling on your knees.'],
  ['Wall push-up', 'Strength', 'Wall', 'Chest', 'Hands at chest height, body in one line, bend elbows then press away.'],
  ['Glute bridge', 'Strength', 'Mat', 'Hips', 'Lie on your back, squeeze glutes to lift hips, lower with control.'],
  ['Bird dog', 'Strength', 'Mat', 'Core', 'From hands and knees, extend opposite arm and leg without twisting.'],
  ['Band row', 'Strength', 'Resistance band', 'Back', 'Anchor safely, pull elbows toward ribs, pause, return slowly.'],
  ['Calf raise', 'Strength', 'Chair', 'Calves', 'Hold support lightly, rise through forefeet, lower fully.'],
  ['Dead bug', 'Strength', 'Mat', 'Core', 'Keep ribs quiet, lower opposite arm and leg only as far as your back stays neutral.'],
  ['Cat-cow', 'Mobility', 'Mat', 'Spine', 'Move slowly between a rounded back and gentle chest opening.'],
  ['Hip hinge drill', 'Mobility', 'Chair', 'Hips', 'Reach hips back toward the chair while keeping a long spine.'],
  ['Ankle circles', 'Mobility', 'Chair', 'Ankles', 'Make slow controlled circles in each direction.'],
  ['Chest opener', 'Mobility', 'None', 'Shoulders', 'Clasp hands behind you only if comfortable; gently broaden across the chest.'],
  ['Single-leg balance', 'Balance', 'Chair', 'Balance', 'Stand close to a chair, shift weight to one leg, keep a soft knee.'],
  ['Heel-to-toe walk', 'Balance', 'Wall', 'Balance', 'Walk slowly with heel touching toe, using a wall for support.'],
  ['Seated march', 'Seated', 'Chair', 'Hips', 'Sit tall and alternate lifting one knee at a time.'],
  ['Seated press', 'Seated', 'Water bottles', 'Shoulders', 'Press light objects overhead only through a comfortable range.'],
  ['Box breathing', 'Yoga', 'None', 'Breath', 'Inhale four, pause four, exhale four, pause four without strain.'],
  ['Chair sun salutation', 'Yoga', 'Chair', 'Whole body', 'Use the chair to support a slow reach, fold, and stand sequence.'],
  ['Seated soleus pushup', 'Seated', 'Desk chair', 'Soleus / Calves', 'Sit upright with knees bent 90°. Lift heels as high as possible while keeping balls of feet planted, pause 1s at top, release slowly. Activates oxidative muscle metabolism to clear circulating blood glucose & triglycerides without fatigue.'],
  ['Seated figure-4 hip stretch', 'Mobility', 'Desk chair', 'Glutes & Piriformis', 'Sit tall, cross right ankle over left knee. Hinge gently forward from hips with a flat back until a deep stretch is felt in the outer hip. Hold 20-30s each side to reverse prolonged sitting stiffness.'],
  ['Desk incline push-up', 'Strength', 'Sturdy desk', 'Chest & Triceps', 'Place hands shoulder-width on desk edge, walk feet back into a strong plank. Lower chest toward desk keeping elbows at 45°, press firmly away.'],
  ['Chin tuck & thoracic extension', 'Mobility', 'Desk chair', 'Neck & Upper back', 'Sit tall, interlace fingers behind head, pull chin straight back like making a double chin, then gently arch upper back over the chair backrest to reverse laptop slouching.'],
  ['Post-meal glucose walk', 'Walk & cardio', 'None', 'Cardiovascular', '10-15 minute casual to brisk walk within 30 minutes of finishing lunch or dinner. Activates muscle GLUT4 glucose transporters independently of insulin, blunting glucose and triglyceride spikes by up to 35%.']
];

const variations = ['Foundation', 'Gentle', 'Steady', 'Supported'];

const exercises: Exercise[] = seeds.flatMap((s, base) =>
  variations.slice(0, base < 10 ? 4 : 3).map((v, n) => ({
    id: `${s[0].toLowerCase().replace(/[^a-z]+/g, '-')}-${n}`,
    name: `${v} ${s[0]}`,
    category: s[1],
    equipment: s[2],
    muscle: s[3],
    minutes: s[1] === 'Walk & cardio' ? 10 + n * 5 : 6 + n * 2,
    reps: s[1] === 'Walk & cardio' || s[1] === 'Yoga' ? 0 : 8 + n * 2,
    sets: s[1] === 'Walk & cardio' || s[1] === 'Yoga' ? 1 : 2 + (n % 2),
    impact: n < 2 ? 'Low' : 'Moderate',
    steps: [
      s[4],
      'Breathe steadily; stop if you feel sharp pain, dizziness, chest pressure, or unusual breathlessness.',
      'Rest and record how it felt before moving on.'
    ],
    cue: 'Move with control. A comfortable effort matters more than speed.',
    modification: 'Use less range, fewer repetitions, extra support, or choose the seated option.',
    avoid: 'Do not use this routine as a substitute for individualized clinical or rehabilitation advice.'
  }))
);

const routines = [
  ['IT Desk-Job Rescue', ['seated-soleus-pushup-0', 'chin-tuck-thoracic-extension-0', 'seated-figure-hip-stretch-0']],
  ['Post-Meal Glucose Clear', ['post-meal-glucose-walk-0', 'seated-soleus-pushup-0']],
  ['Gentle reset', ['cat-cow-0', 'sit-to-stand-1', 'seated-march-0']],
  ['Beginner strength', ['sit-to-stand-0', 'wall-push-up-0', 'glute-bridge-0']],
  ['Desk mobility', ['chest-opener-0', 'ankle-circles-0', 'cat-cow-0']],
  ['Walk steady', ['brisk-walk-0', 'calf-raise-0', 'single-leg-balance-0']],
  ['Chair confidence', ['seated-march-0', 'seated-press-0', 'heel-to-toe-walk-0']],
  ['Core basics', ['bird-dog-0', 'dead-bug-0', 'glute-bridge-0']],
  ['Balance basics', ['single-leg-balance-0', 'heel-to-toe-walk-0', 'calf-raise-0']],
  ['Band back', ['band-row-0', 'wall-push-up-0', 'hip-hinge-drill-0']],
  ['Low-impact cardio', ['march-in-place-1', 'step-up-1', 'box-breathing-0']],
  ['Yoga pause', ['chair-sun-salutation-0', 'cat-cow-0', 'box-breathing-0']],
  ['Full-body support', ['sit-to-stand-3', 'wall-push-up-3', 'band-row-3']],
  ['Weekend walk', ['brisk-walk-2', 'hip-hinge-drill-0', 'chest-opener-0']]
] as const;

// Curated quick YouTube video guides for exercises & desk movements
const exerciseVideoMap: Record<string, { id: string; title: string }> = {
  // Desk & Glucose Clearing Movements
  'seated-soleus-pushup': { id: 'qK420l8I5BY', title: 'Soleus Pushup & Seated Calf Raise Form' },
  'seated-figure-hip-stretch': { id: 'xNqUHQvJv3w', title: 'Seated Figure-4 Hip & Glute Stretch' },
  'desk-incline-push-up': { id: 'HmKlyaP3AsV', title: 'Desk Incline Push-Up Technique' },
  'chin-tuck-thoracic-extension': { id: 'q_tS5Z5gQ-o', title: 'Chin Tucks & Upper Back Posture Reset' },
  'post-meal-glucose-walk': { id: 'rO_my2Lqf_M', title: '10-Min Post-Meal Walking Workout' },

  // Cardio & Functional Walks
  'brisk-walk': { id: 'enYITYwvPAQ', title: 'Brisk Walking Technique' },
  'march-in-place': { id: 'c-S8sP1pUj0', title: 'March in Place Low Impact Cardio' },
  'step-up': { id: '3wB_N_wK0d8', title: 'Step Up Exercise Tutorial' },

  // Strength & Core
  'sit-to-stand': { id: 'GJ1PUehH2kn', title: 'Sit to Stand Chair Squats Form' },
  'wall-push-up': { id: 'HmKlyaP3AsV', title: 'Wall Push-Up for Absolute Beginners' },
  'glute-bridge': { id: 'OUgsJ8-Vigk', title: 'Glute Bridge Exercise Guide' },
  'bird-dog': { id: 'wiFNA3sqjCA', title: 'Bird Dog Core Stability' },
  'dead-bug': { id: 'g_BYB0R-4Ws', title: 'Dead Bug Abdominal Exercise' },
  'band-row': { id: 'dhk7Q8P7_bY', title: 'Resistance Band Row Technique' },
  'calf-raise': { id: 'qK420l8I5BY', title: 'Calf Raise Tutorial' },

  // Mobility & Yoga
  'cat-cow': { id: 'K_I_O_3b6qQ', title: 'Cat-Cow Spinal Mobility Stretch' },
  'hip-hinge-drill': { id: 'l23bQfF-bY0', title: 'Hip Hinge Movement Tutorial' },
  'ankle-circles': { id: 'M3y27G9a4Yg', title: 'Ankle Mobility Circles' },
  'chest-opener': { id: 'y4Kz4y8aX5M', title: 'Chest Opener & Shoulder Stretch' },
  'single-leg-balance': { id: 'vGj-0eYQkL4', title: 'Single-Leg Balance Training' },
  'heel-to-toe-walk': { id: 'd0Z0uQ6a_iM', title: 'Heel-to-Toe Tandem Walk' },
  'seated-march': { id: 'c-S8sP1pUj0', title: 'Seated March Chair Exercise' },
  'seated-press': { id: 'L8g3V0FzZ1Q', title: 'Seated Overhead Press Form' },
  'box-breathing': { id: 'bF_1YZ51TWw', title: 'Box Breathing 4-4-4-4 Technique' },
  'chair-sun-salutation': { id: 'H3vC2ZkP6q8', title: 'Chair Yoga Sun Salutation' }
};

function getVideoForExercise(exercise: Exercise) {
  const baseKey = Object.keys(exerciseVideoMap).find(k => exercise.id.startsWith(k));
  if (baseKey) return exerciseVideoMap[baseKey];

  // Default fallback YouTube tutorials by category
  if (exercise.category === 'Walk & cardio') return { id: 'enYITYwvPAQ', title: 'Low Impact Cardio Walk' };
  if (exercise.category === 'Mobility' || exercise.category === 'Yoga') return { id: 'K_I_O_3b6qQ', title: 'Gentle Mobility Flow' };
  return { id: 'GJ1PUehH2kn', title: 'Functional Strength Tutorial' };
}

// Compact, responsive YouTube video guide replacing oversized static images
function demo(exercise: Exercise, isDetailedView: boolean = false) {
  const video = getVideoForExercise(exercise);

  if (isDetailedView) {
    return (
      <div className="exercise-guide-container rounded-2xl overflow-hidden shadow-md border border-rule mb-3 bg-black/5 dark:bg-white/5">
        <div className="relative w-full aspect-video">
          <iframe
            className="w-full h-full rounded-t-2xl border-0"
            src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="p-2.5 flex items-center justify-between text-xs">
          <span className="font-bold text-ink truncate mr-2">{video.title}</span>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 shrink-0"
          >
            <span>Open in YouTube</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  // Compact card view preview with quick video launch
  return (
    <div className="exercise-guide-container rounded-xl overflow-hidden border border-rule mb-2 relative group bg-neutral-900">
      <div className="relative w-full h-28 overflow-hidden flex items-center justify-center">
        <img
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
          alt={video.title}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/10 transition-colors">
          <div className="w-9 h-9 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play size={16} className="fill-white ml-0.5" />
          </div>
        </div>
      </div>
      <div className="px-2 py-1 flex items-center justify-between text-[11px] bg-black/10 dark:bg-white/5">
        <span className="text-muted font-medium truncate">{exercise.category}</span>
        <span className="text-red-500 font-bold text-[10px] flex items-center gap-0.5">
          <span>YouTube Guide</span>
        </span>
      </div>
    </div>
  );
}

export function Exercise() {
  const { state, update } = useHealthStore();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [chosen, setChosen] = useState<Exercise | null>(null);
  const [active, setActive] = useState<any | null>(null);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [completed, setCompleted] = useState<Record<string, number>>({});
  const [effort, setEffort] = useState(4);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!running) return;
    const started = Date.now() - seconds * 1000;
    const timer = setInterval(() => setSeconds(Math.max(0, Math.round((Date.now() - started) / 1000))), 500);
    return () => clearInterval(timer);
  }, [running]);

  useEffect(() => {
    const saved = state.activeWorkout;
    if (saved) {
      setActive(saved);
      setCompleted(saved.completed || {});
      setSeconds(saved.seconds || 0);
      setEffort(saved.effort || 4);
    }
  }, [state.activeWorkout?.id]);

  const rows = useMemo(
    () => exercises.filter(e => (category === 'All' || e.category === category) && `${e.name} ${e.equipment} ${e.muscle}`.toLowerCase().includes(query.toLowerCase())),
    [query, category]
  );

  const suitable = state.profile.limitations || state.profile.conditions?.some((c: string) => /pregnan|advanced|recent surgery/i.test(c));
  const scheduled = (state.occurrences || []) as IntegrationOccurrence[];

  async function persist(next: any) {
    await update(s => { s.activeWorkout = next; });
  }

  async function start(list: Exercise[], title: string) {
    if (suitable) {
      setMessage('Your health context is marked for individual guidance. Review the movements and use clinician-approved options before starting.');
      return;
    }
    const next = {
      id: crypto.randomUUID(),
      title,
      startedAt: new Date().toISOString(),
      steps: list,
      completed: {},
      seconds: 0,
      effort: 4,
      status: 'active'
    };
    setActive(next);
    setCompleted({});
    setSeconds(0);
    setRunning(true);
    await persist(next);
  }

  async function finish() {
    if (!active) return;
    const session = { ...active, status: 'completed', endedAt: new Date().toISOString(), completed, seconds, effort };
    const ok = await update(s => {
      s.sessions.push(session);
      s.activeWorkout = null;
    });
    if (ok) {
      setActive(null);
      setRunning(false);
      setMessage('Workout saved. Your next progression stays a suggestion for you to accept.');
    }
  }

  const workout = active?.steps?.map((s: any) => exercises.find(e => e.id === s.id) || s) || [];

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <span className="eyebrow">MOVE AT YOUR OWN PACE</span>
          <h1>Strength is a practice.<br /><em>Start where you are.</em></h1>
          <p>Choose a routine, follow the cues, and record what you actually did.</p>
        </div>
        <button className="secondary-btn" onClick={() => setChosen(exercises.find(e => e.category === 'Seated') || null)}>
          Need a gentle start
        </button>
      </header>

      {message && <p className="notice" role="status">{message}</p>}

      {active ? (
        <section className="surface player">
          <header className="flex items-center justify-between pb-4 border-b border-rule">
            <div>
              <span className="eyebrow">ACTIVE SESSION</span>
              <h2>{active.title}</h2>
              <p className="timer text-xl font-bold flex items-center gap-2 mt-1">
                <Timer size={20} />
                {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
              </p>
            </div>
            <button className="primary-btn flex items-center gap-2" onClick={() => setRunning(!running)}>
              {running ? <Pause size={17} /> : <Play size={17} />} {running ? 'Pause' : 'Resume'}
            </button>
          </header>

          {workout.map((e: Exercise, index: number) => (
            <article className="workout-step py-4 border-b border-rule" key={e.id}>
              {demo(e, true)}
              <div>
                <span className="eyebrow">MOVEMENT {index + 1} · {e.category}</span>
                <h3>{e.name}</h3>
                <p className="text-sm font-medium text-muted">
                  {e.sets > 1 ? `${e.sets} sets × ${e.reps} reps` : `${e.minutes} minutes`} · {e.equipment}
                </p>
                <ol className="my-2 space-y-1 text-sm pl-4 list-decimal">
                  {e.steps.map(x => <li key={x}>{x}</li>)}
                </ol>
                <p className="muted text-xs">Modify: {e.modification}</p>
                <div className="button-row mt-3 flex items-center gap-3">
                  <label className="text-xs font-semibold flex items-center gap-2">
                    Completed sets
                    <input
                      type="number"
                      min="0"
                      max={e.sets || 1}
                      value={completed[e.id] || 0}
                      onChange={ev => {
                        const n = Math.max(0, Math.min(e.sets || 1, Number(ev.target.value)));
                        setCompleted(c => ({ ...c, [e.id]: n }));
                        void persist({ ...active, completed: { ...completed, [e.id]: n }, seconds, effort });
                      }}
                      className="w-16 p-1 border rounded text-center"
                    />
                  </label>
                  <button className="secondary-btn text-xs py-1" onClick={() => setChosen(e)}>
                    Substitute
                  </button>
                </div>
              </div>
            </article>
          ))}

          <div className="form-grid pt-4">
            <label className="text-sm font-semibold">
              Effort, 1 easy to 10 hard
              <input type="range" min="1" max="10" value={effort} onChange={e => setEffort(Number(e.target.value))} className="w-full accent-emerald-500 mt-1" />
            </label>
            <button className="primary-btn flex items-center gap-2 justify-center" onClick={() => void finish()}>
              <Check size={17} /> Finish and save
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="surface routine-strip">
            <div className="section-heading">
              <div>
                <span className="eyebrow">STARTER ROUTINES</span>
                <h2>Choose a small win</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {routines.map(([name, ids]) => (
                <button
                  key={name}
                  className="p-3 rounded-2xl border border-rule hover:bg-black/5 dark:hover:bg-white/5 text-left flex flex-col justify-between transition-all"
                  onClick={() => void start(ids.map(id => exercises.find(e => e.id === id)).filter(Boolean) as Exercise[], name)}
                >
                  <strong className="text-sm text-ink">{name}</strong>
                  <div className="flex items-center justify-between text-xs text-muted mt-2">
                    <span>{ids.length} movements</span>
                    <ChevronRight size={14} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="surface">
            <div className="section-heading">
              <div>
                <span className="eyebrow">EXERCISE LIBRARY</span>
                <h2>Find a movement</h2>
              </div>
              <input
                aria-label="Search exercises"
                placeholder="Search movement, equipment or muscle"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="form-input max-w-xs"
              />
            </div>

            <div className="segmented categories my-3 flex flex-wrap gap-1">
              <button className="px-3 py-1 rounded-full text-xs font-semibold" aria-pressed={category === 'All'} onClick={() => setCategory('All')}>
                All
              </button>
              {(['Walk & cardio', 'Strength', 'Mobility', 'Balance', 'Seated', 'Yoga'] as Category[]).map(c => (
                <button key={c} className="px-3 py-1 rounded-full text-xs font-semibold" aria-pressed={category === c} onClick={() => setCategory(c)}>
                  {c}
                </button>
              ))}
            </div>

            <div className="exercise-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {rows.map(e => (
                <button className="exercise-card p-3 rounded-2xl border border-rule hover:bg-black/5 dark:hover:bg-white/5 text-left transition-all" key={e.id} onClick={() => setChosen(e)}>
                  {demo(e)}
                  <span className="eyebrow text-[11px] font-bold">{e.category} · {e.impact} impact</span>
                  <h3 className="font-bold text-sm text-ink mt-0.5">{e.name}</h3>
                  <p className="text-xs text-muted mt-1">
                    {e.sets > 1 ? `${e.sets} × ${e.reps} reps` : `${e.minutes} minutes`} · {e.equipment}
                  </p>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {chosen && (
        <aside className="drawer p-6 rounded-3xl bg-surface-solid shadow-2xl border border-rule" role="dialog" aria-modal="true" aria-label={chosen.name}>
          <button className="close p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10" onClick={() => setChosen(null)}>
            <X size={20} />
          </button>
          {demo(chosen, true)}
          <span className="eyebrow text-xs font-bold">{chosen.category} · {chosen.impact} impact</span>
          <h2 className="text-xl font-bold mt-1 text-ink">{chosen.name}</h2>
          <p className="text-sm text-muted font-medium mt-1">
            {chosen.sets > 1 ? `${chosen.sets} sets × ${chosen.reps} reps` : `${chosen.minutes} minutes`} · {chosen.equipment}
          </p>
          <ol className="my-3 space-y-1.5 text-sm list-decimal pl-4">
            {chosen.steps.map(x => <li key={x}>{x}</li>)}
          </ol>
          <p className="text-sm"><strong>Technique cue:</strong> {chosen.cue}</p>
          <p className="text-sm mt-1"><strong>Modification:</strong> {chosen.modification}</p>
          <p className="muted text-xs mt-2">{chosen.avoid}</p>
          <button className="primary-btn mt-4 w-full flex items-center justify-center gap-2" onClick={() => void start([chosen], chosen.name)}>
            <Play size={17} /> Start movement
          </button>
        </aside>
      )}

      {/* Calendar Schedule with Full CRUD Operations */}
      <section className="workspace-split grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="surface p-6 rounded-3xl border border-rule">
          <CalendarScheduleManager
            occurrences={scheduled}
            onAdd={async entry => {
              await update(s => { s.occurrences.push(entry); });
              setMessage('Session scheduled. Review your reminders below.');
            }}
            onUpdate={async updated => {
              await update(s => {
                const idx = s.occurrences.findIndex((x: any) => x.id === updated.id);
                if (idx !== -1) {
                  s.occurrences[idx] = { ...s.occurrences[idx], ...updated, revision: (s.occurrences[idx].revision || 1) + 1 };
                }
              });
              setMessage('Session reminder updated.');
            }}
            onDelete={async id => {
              await update(s => {
                s.occurrences = s.occurrences.filter((x: any) => x.id !== id);
              });
              setMessage('Session removed from schedule.');
            }}
          />
        </section>

        <IntegrationPanel
          occurrences={scheduled}
          onCompletionChange={(id, done) =>
            void update(s => {
              const row = s.occurrences.find((x: any) => x.id === id);
              if (row) row.completed = done;
            })
          }
        />
      </section>
    </div>
  );
}

// Interactive Calendar Schedule Manager with Complete CRUD (Create, Read, Update, Delete)
function CalendarScheduleManager({
  occurrences,
  onAdd,
  onUpdate,
  onDelete
}: {
  occurrences: IntegrationOccurrence[];
  onAdd: (entry: IntegrationOccurrence) => Promise<void>;
  onUpdate: (entry: IntegrationOccurrence) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [date, setDate] = useState(today());
  const [time, setTime] = useState('07:00');
  const [title, setTitle] = useState('Health Planner workout');
  const [duration, setDuration] = useState(30);

  // Edit form states
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDuration, setEditDuration] = useState(30);

  function startEditing(occ: IntegrationOccurrence) {
    setEditingId(occ.id);
    setEditTitle(occ.title);
    setEditDate(occ.date);
    setEditTime(occ.startTime || '07:00');
    setEditDuration(occ.durationMinutes || 30);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    await onUpdate({
      id: editingId,
      title: editTitle,
      date: editDate,
      startTime: editTime,
      durationMinutes: editDuration,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      completed: false,
      revision: 2
    });
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-rule">
        <div>
          <span className="eyebrow font-bold text-xs">CALENDAR & SCHEDULE</span>
          <h2 className="text-xl font-bold text-ink mt-0.5">Manage Session Reminders</h2>
        </div>
        <button
          className="secondary-btn text-xs py-1.5 px-3 flex items-center gap-1.5"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? <X size={14} /> : <Plus size={14} />}
          <span>{showAddForm ? 'Cancel' : 'Add Event'}</span>
        </button>
      </div>

      {/* CREATE: Add Reminder Form */}
      {showAddForm && (
        <form
          className="p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-rule space-y-3"
          onSubmit={async e => {
            e.preventDefault();
            await onAdd({
              id: crypto.randomUUID(),
              title,
              date,
              startTime: time,
              durationMinutes: duration,
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              completed: false,
              revision: 1
            });
            setShowAddForm(false);
          }}
        >
          <div className="text-xs font-bold text-ink uppercase tracking-wide">Schedule New Reminder</div>
          <label className="field">
            <span className="text-xs font-semibold">Workout / Event Title</span>
            <input className="form-input text-sm" value={title} onChange={e => setTitle(e.target.value)} required />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="field">
              <span className="text-xs font-semibold">Date</span>
              <input type="date" min={today()} className="form-input text-sm" value={date} onChange={e => setDate(e.target.value)} required />
            </label>
            <label className="field">
              <span className="text-xs font-semibold">Time</span>
              <input type="time" className="form-input text-sm" value={time} onChange={e => setTime(e.target.value)} required />
            </label>
          </div>
          <button className="primary-btn text-sm w-full flex items-center justify-center gap-2">
            <CalendarPlus size={16} /> Save to Calendar
          </button>
        </form>
      )}

      {/* READ: List Scheduled Events */}
      <div className="space-y-2.5">
        <div className="text-xs font-bold text-muted flex items-center justify-between">
          <span>Scheduled Events ({occurrences.length})</span>
          <span className="text-[11px]">Synced with Google Calendar / Tasks</span>
        </div>

        {occurrences.length === 0 ? (
          <p className="text-sm text-muted py-6 text-center border border-dashed border-rule rounded-2xl">
            No events scheduled yet. Click <strong>+ Add Event</strong> above to schedule a workout or meal reminder.
          </p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {occurrences.map(occ => (
              <div
                key={occ.id}
                className="p-3 rounded-2xl border border-rule bg-white dark:bg-black/30 flex items-center justify-between gap-3 hover:bg-neutral-50 dark:hover:bg-white/5 transition-all"
              >
                {editingId === occ.id ? (
                  /* UPDATE: Inline Edit Form */
                  <form onSubmit={handleSaveEdit} className="w-full space-y-2 py-1">
                    <input
                      className="form-input text-sm font-semibold"
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="date"
                        className="form-input text-xs"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        required
                      />
                      <input
                        type="time"
                        className="form-input text-xs"
                        value={editTime}
                        onChange={e => setEditTime(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        className="secondary-btn text-xs py-1 px-2.5"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="primary-btn text-xs py-1 px-3">
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div>
                      <h4 className="text-sm font-bold text-ink">{occ.title}</h4>
                      <p className="text-xs text-muted flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{occ.date}</span>
                        <span>•</span>
                        <span>{occ.startTime || '07:00'} ({occ.durationMinutes || 30}m)</span>
                      </p>
                    </div>

                    {/* Action buttons: Edit & Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                        onClick={() => startEditing(occ)}
                        title="Edit Event"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-all"
                        onClick={() => void onDelete(occ.id)}
                        title="Delete Event"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
