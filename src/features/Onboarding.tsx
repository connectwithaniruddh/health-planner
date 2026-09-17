import React, { useMemo, useState } from 'react';
import { useHealthStore } from '../domain/healthStore';
import { authorizeGoogle } from '../services/gdrive/auth.service';
import { gDriveService } from '../services/gdrive/gdrive.service';
import { GOOGLE_SCOPES } from '../config/gdrive.config';
import { Sparkles, TrendingDown, Target, Award, Calendar, Check, ArrowRight, ShieldCheck, Cloud } from 'lucide-react';

const steps = [
  'Connect & restore',
  'Your starting point',
  'Food & preferences',
  'Everyday cooking',
  'Health context',
  'Movement',
  'Your schedule',
  'Review & begin'
];

const encouragement = [
  'Your data stays yours. Start from where you are.',
  'A few details make every suggestion and calorie target accurate.',
  'Food preferences are a strength, never a restriction.',
  'A practical plan fits the way you actually live and cook.',
  'Context helps you plan; it does not label or diagnose you.',
  'Small movement breaks count, especially on desk-heavy days.',
  'A reminder can turn intention into an easier next step.',
  'You built a resilient health plan that adapts with you.'
];

const DIETARY_OPTIONS = [
  { value: 'pure_veg', label: 'Pure Vegetarian (Zero Meat, Fish or Eggs)' },
  { value: 'vegan', label: 'Vegan (100% Plant-Based)' },
  { value: 'eggetarian', label: 'Eggetarian (Vegetarian with Eggs)' },
  { value: 'non_veg', label: 'Non-Vegetarian (Poultry, Meat & Fish)' },
];

const GOAL_OPTIONS = [
  { value: 'Weight loss / Fat burn & metabolic reset', label: 'Weight loss / Fat burn & metabolic reset' },
  { value: 'Manage weight with guidance', label: 'Manage weight with guidance' },
  { value: 'Metabolic health & fatty liver reversal', label: 'Metabolic health & fatty liver reversal (MASLD/NAFLD)' },
  { value: 'Diabetes & blood sugar management', label: 'Diabetes & blood sugar management (HbA1c care)' },
  { value: 'Build consistent healthy habits', label: 'Build consistent healthy habits' },
  { value: 'Improve strength and fitness', label: 'Improve strength and fitness' },
  { value: 'Support a clinician-led health plan', label: 'Support a clinician-led health plan' },
];

export function Onboarding({ onClose }: { onClose?: () => void }) {
  const { state, update, importData } = useHealthStore();
  const p = state.profile;
  const step = state.onboarding.step || 0;
  const [error, setError] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');

  // Target weeks slider state for weight loss planning
  const [targetWeeks, setTargetWeeks] = useState<number>(() => {
    return p.targetWeeks || 16;
  });

  const completionPercent = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  const save = (key: string, value: any) => void update(d => { d.profile[key] = value; });

  // Weight loss deficit calculations
  const weightKg = Number(p.weightKg) || 0;
  const targetWeightKg = Number(p.targetWeightKg) || 0;
  const isWeightLoss = weightKg > 0 && targetWeightKg > 0 && weightKg > targetWeightKg;
  const weightDiff = isWeightLoss ? weightKg - targetWeightKg : 0;

  const { targetDateStr, weeklyRate, dailyDeficit } = useMemo(() => {
    if (!isWeightLoss) return { targetDateStr: '', weeklyRate: 0, dailyDeficit: 0 };
    const weeks = Math.max(4, targetWeeks);
    const date = new Date();
    date.setDate(date.getDate() + weeks * 7);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const rate = Number((weightDiff / weeks).toFixed(2));
    // 7700 kcal per kg of fat loss
    const deficit = Math.round((weightDiff * 7700) / (weeks * 7));
    return { targetDateStr: dateStr, weeklyRate: rate, dailyDeficit: deficit };
  }, [isWeightLoss, weightDiff, targetWeeks]);

  const field = (key: string, label: string, type = 'text', hint = '') => (
    <label className="field" key={key}>
      <span className="font-semibold">{label}</span>
      <input
        type={type}
        value={p[key] ?? ''}
        min={type === 'number' ? 0 : undefined}
        onChange={e => save(key, type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value)}
        className="form-input"
      />
      {hint && <small className="text-muted">{hint}</small>}
    </label>
  );

  const csv = (key: string, label: string) => (
    <label className="field" key={key}>
      <span className="font-semibold">{label}</span>
      <input
        defaultValue={(p[key] || []).join(', ')}
        placeholder="Separate with commas; leave blank if unknown"
        onBlur={e => save(key, e.target.value.split(',').map(x => x.trim()).filter(Boolean))}
        className="form-input"
      />
    </label>
  );

  const selectCustom = (key: string, label: string, options: { value: string; label: string }[]) => (
    <label className="field" key={key}>
      <span className="font-semibold">{label}</span>
      <select
        value={p[key] || ''}
        onChange={e => save(key, e.target.value)}
        className="form-select"
      >
        <option value="">Choose or leave unknown</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );

  async function restore() {
    setError('');
    setRestoreStatus('Opening Google sign-in…');
    setRestoring(true);
    try {
      await authorizeGoogle(['openid', GOOGLE_SCOPES.DRIVE_APPDATA]);
      const file = await gDriveService.findStoreFile();
      if (!file) {
        setRestoreStatus('No Health Planner backup was found in this Google account. You can continue with this device.');
        return;
      }
      const data = await gDriveService.downloadStore(file.id);
      if (await importData(JSON.stringify(data))) {
        setRestoreStatus('✓ Saved items restored to this device. Continue to review your plan.');
      } else {
        setRestoreStatus('A backup was found but could not be safely restored. Your local data was left unchanged.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google restore could not finish. You can continue without restoring.');
      setRestoreStatus('');
    } finally {
      setRestoring(false);
    }
  }

  async function next() {
    setError('');
    if (step === 1 && (!p.name?.trim() || (p.age !== undefined && (p.age < 18 || p.age > 120)))) {
      setError('Enter your name and, if supplied, an adult age between 18 and 120.');
      return;
    }
    if (step === 1 && isWeightLoss) {
      save('targetWeeks', targetWeeks);
      save('targetDeficit', dailyDeficit);
    }
    if (step < 7) {
      await update(d => { d.onboarding.step++; });
    } else {
      const ok = await update(d => {
        d.onboarding.complete = true;
        d.profile.onboarded = true;
      });
      if (ok) onClose?.();
    }
  }

  return (
    <section className="panel onboarding">
      {/* Sleek horizontal progress line on top border of card */}
      <div className="onboarding-progress-bar-container">
        <div 
          className="onboarding-progress-bar-fill" 
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* Header with Title and Step Indicator */}
      <div className="onboarding-topline pt-2">
        <div>
          <div className="eyebrow uppercase font-bold tracking-wider text-xs">
            Personal Setup · Step {step + 1} of 8
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mt-1 text-ink">
            {steps[step]}
          </h1>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-muted px-3 py-1 bg-neutral-200/60 dark:bg-neutral-800/80 rounded-full">
            {completionPercent}% completed
          </span>
        </div>
      </div>

      <p className="muted text-sm mt-1">{encouragement[step]}</p>

      {/* Step 0: Google Drive Restore or Continue */}
      {step === 0 ? (
        <section className="restore-card mt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0 shadow-md">
              <Cloud className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <span className="eyebrow font-bold text-xs uppercase text-emerald-500">
                Optional · Private Google Drive Backup
              </span>
              <h2 className="text-xl font-bold mt-0.5 text-ink">Bring back your saved items</h2>
              <p className="text-sm muted mt-1">
                Connect your Google account to look only in Health Planner’s private app-data folder. 
                Your access token stays in memory and no health records are ever stored in public repositories.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              className="primary-btn flex items-center gap-2"
              disabled={restoring}
              onClick={() => void restore()}
            >
              <Cloud className="w-4 h-4" />
              <span>{restoring ? 'Checking Google Drive…' : 'Connect Google & restore saved items'}</span>
            </button>
          </div>

          {restoreStatus && (
            <p className="notice mt-2 text-sm" role="status">
              {restoreStatus}
            </p>
          )}

          <p className="muted text-xs border-t border-neutral-200 dark:border-neutral-800 pt-3">
            No backup? Click <strong>Continue with this device</strong> below. You can connect Calendar, Tasks, or Drive anytime in Settings.
          </p>
        </section>
      ) : (
        <div className="form-grid mt-6" key={step}>
          {/* Step 1: Your starting point (Biometrics & Interactive Weight Loss Deficit Slider + Trajectory Graph) */}
          {step === 1 && (
            <>
              {field('name', 'What should we call you?')}
              {field('age', 'Age (optional)', 'number')}
              {field('heightCm', 'Height · cm', 'number')}
              {field('weightKg', 'Current weight · kg', 'number')}
              {field('targetWeightKg', 'Target weight · kg (optional)', 'number')}
              {selectCustom('goal', 'Your primary focus', GOAL_OPTIONS)}

              {/* Dynamic Weight Loss Deficit Planner & Interactive Trajectory Graph */}
              {isWeightLoss && (
                <div className="col-span-full p-5 rounded-2xl bg-neutral-100 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <Target className="w-4 h-4" />
                      <span>Target Milestone & Negative Calorie Planner</span>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {weeklyRate} kg/week pace
                    </span>
                  </div>

                  {/* Target Event / Date Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-muted">
                      <span>Timeline: {targetWeeks} weeks ({targetWeeks >= 24 ? 'Steady & Gradual' : targetWeeks <= 8 ? 'Intensive' : 'Recommended'})</span>
                      <span className="text-ink font-bold">{targetDateStr}</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="48"
                      step="1"
                      value={targetWeeks}
                      onChange={e => {
                        const val = Number(e.target.value);
                        setTargetWeeks(val);
                        save('targetWeeks', val);
                      }}
                      className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
                    />
                    <div className="flex justify-between text-[11px] text-muted">
                      <span>4 Weeks (Aggressive)</span>
                      <span>16 Weeks (Optimal)</span>
                      <span>48 Weeks (Long-term)</span>
                    </div>
                  </div>

                  {/* EXACT Target Negative Calorie Deficit Text requested by user */}
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-sm font-medium leading-relaxed">
                    To reduce <strong>{weightDiff.toFixed(1)} kg</strong> by <strong>{targetDateStr}</strong>, you need <strong>{dailyDeficit.toLocaleString()} calories to be negative each day</strong> to achieve your <strong>{weeklyRate.toFixed(2)} kg/week</strong> reduction target.
                  </div>

                  {/* Interactive Dynamic 5-Point SVG Trajectory Graph Plan */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-semibold text-muted flex items-center gap-1.5">
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                      Projected Weight Trajectory Plan
                    </span>
                    <div className="h-28 w-full bg-white dark:bg-black/50 rounded-xl p-3 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                      <svg viewBox="0 0 400 90" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id="trajGrad" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="100%" stopColor="#06b6d4" />
                          </linearGradient>
                        </defs>
                        {/* Grid lines */}
                        <line x1="40" y1="15" x2="380" y2="15" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                        <line x1="40" y1="75" x2="380" y2="75" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />
                        
                        {/* Trajectory curve */}
                        <path
                          d="M 50,20 Q 150,30 220,52 T 370,72"
                          fill="none"
                          stroke="url(#trajGrad)"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />

                        {/* 5 Milestone checkpoints */}
                        {[
                          { cx: 50, cy: 20, w: weightKg, label: 'Today' },
                          { cx: 130, cy: 32, w: (weightKg - weightDiff * 0.25).toFixed(1), label: 'Wk ' + Math.round(targetWeeks * 0.25) },
                          { cx: 210, cy: 48, w: (weightKg - weightDiff * 0.5).toFixed(1), label: 'Midway' },
                          { cx: 290, cy: 62, w: (weightKg - weightDiff * 0.75).toFixed(1), label: 'Wk ' + Math.round(targetWeeks * 0.75) },
                          { cx: 370, cy: 72, w: targetWeightKg, label: 'Goal' },
                        ].map((pt, i) => (
                          <g key={i}>
                            <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                            <text x={pt.cx} y={pt.cy - 9} textAnchor="middle" fontSize="9" fontWeight="bold" fill="currentColor">
                              {pt.w} kg
                            </text>
                            <text x={pt.cx} y={pt.cy + 16} textAnchor="middle" fontSize="8" fill="gray">
                              {pt.label}
                            </text>
                          </g>
                        ))}
                      </svg>
                    </div>
                  </div>

                  {/* Gamified Milestone Bonus */}
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    <Award className="w-4 h-4" />
                    <span>Gamification Perk: +50 XP Milestone Target Locked • Level 1 Health Cadet</span>
                  </div>
                </div>
              )}

              {!isWeightLoss && (
                <section className="metric-preview col-span-full">
                  <strong>Sustainable Pace</strong>
                  <span>Progress is built through repeatable, manageable choices, not extreme restrictions.</span>
                </section>
              )}
            </>
          )}

          {/* Step 2: Food & preferences (Capitalized Dietary Preferences) */}
          {step === 2 && (
            <>
              {selectCustom('dietaryPreference', 'Dietary preference', DIETARY_OPTIONS)}
              {csv('allergies', 'Allergies — ingredients to exclude completely')}
              {csv('dislikes', 'Foods you dislike or avoid')}
              {csv('cuisines', 'Preferred cuisines (e.g. North Indian, South Indian, Maharashtrian, Mediterranean)')}
              {field('religiousRestrictions', 'Religious or cultural food preferences')}
            </>
          )}

          {/* Step 3: Everyday cooking */}
          {step === 3 && (
            <>
              {field('budget', 'Weekly food budget and currency (e.g. ₹2000 INR)')}
              {field('cookingMinutes', 'Available cooking time · minutes', 'number')}
              {field('householdSize', 'People you cook for', 'number')}
              {field('cookingEquipment', 'Available cooking equipment (e.g. Kadai, Pressure Cooker, Air Fryer, Microwave)')}
              {selectCustom('mealPrep', 'Meal preparation preference', [
                { value: 'Cook daily at home', label: 'Cook daily fresh meals at home' },
                { value: 'Batch cook ahead of time', label: 'Batch cook 2-3 days ahead of time' },
                { value: 'Mix of home cooking and healthy outside meals', label: 'Mix of home cooking and healthy outside meals' },
              ])}
            </>
          )}

          {/* Step 4: Health context */}
          {step === 4 && (
            <>
              {csv('conditions', 'Clinician-diagnosed conditions (e.g. Fatty Liver / MASLD, Pre-diabetes, Hypertension)')}
              {field('medications', 'Medicines and supplements (e.g. Metformin, Vitamin D3, B12)')}
              {selectCustom('pregnancy', 'Pregnancy / Breastfeeding status', [
                { value: 'Not applicable', label: 'Not applicable' },
                { value: 'Pregnant', label: 'Pregnant' },
                { value: 'Breastfeeding', label: 'Breastfeeding' },
              ])}
              {field('clinicalNotes', 'Clinician instructions or relevant medical history')}
              {field('kidneyHistory', 'Kidney disease or clinician-set protein/fluid limits')}
              {field('eatingHistory', 'Fasting restrictions or medical concerns (optional)')}
              <p className="muted text-xs col-span-full">
                Add dated blood laboratory markers (HbA1c, ALT/SGPT, Vitamin D3, B12) in Health after setup.
              </p>
            </>
          )}

          {/* Step 5: Movement */}
          {step === 5 && (
            <>
              <label className="field col-span-full">
                <span className="font-semibold">Typical desk-day active movement · minutes</span>
                <input
                  type="range"
                  min="0"
                  max="120"
                  step="5"
                  value={p.activityMinutes ?? 30}
                  onChange={e => save('activityMinutes', Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg"
                />
                <strong className="text-sm text-emerald-600 dark:text-emerald-400">{p.activityMinutes ?? 30} minutes per day</strong>
              </label>

              {selectCustom('exerciseExperience', 'Exercise experience', [
                { value: 'New to exercise / Beginner', label: 'New to exercise / Beginner' },
                { value: 'Returning after a break', label: 'Returning after a break' },
                { value: 'Consistently active / Regular', label: 'Consistently active / Regular' },
              ])}

              {field('limitations', 'Joint pain, back strain, injuries, or mobility restrictions')}
              {csv('equipment', 'Available exercise equipment (e.g. Yoga mat, Resistance band, Dumbbells, None)')}
              {field('exerciseMinutes', 'Preferred workout duration per session · minutes', 'number')}

              <section className="metric-preview col-span-full">
                <strong>{Math.max(1, Math.round((p.activityMinutes ?? 30) / 10))} movement breaks</strong>
                <span>easily fit into a sedentary desk schedule. Choose what feels refreshing and sustainable.</span>
              </section>
            </>
          )}

          {/* Step 6: Schedule & Reminders */}
          {step === 6 && (
            <>
              {field('timezone', 'Time zone (IANA name, e.g. Asia/Kolkata)')}
              {field('wakeTime', 'Typical wake-up time', 'time')}
              {field('mealTimes', 'Planned meal times (e.g. 08:30, 13:30, 19:30)')}
              {field('reminderTime', 'Preferred daily workout / movement time', 'time')}
              <p className="muted text-xs col-span-full">
                Google Calendar reminders and Tasks checklists are optional and can be synced in Settings.
              </p>
            </>
          )}

          {/* Step 7: Review & begin */}
          {step === 7 && (
            <>
              <dl className="review-list col-span-full">
                {Object.entries(p)
                  .filter(([k, v]) => !['onboarded', 'targetWeeks', 'targetDeficit'].includes(k) && v !== '' && v !== undefined && (!Array.isArray(v) || v.length))
                  .map(([k, v]) => (
                    <div key={k} className="p-2 border-b border-neutral-200 dark:border-neutral-800">
                      <dt className="text-xs text-muted font-semibold capitalize">{k.replace(/([A-Z])/g, ' $1')}</dt>
                      <dd className="text-sm font-medium text-ink mt-0.5">{Array.isArray(v) ? v.join(', ') : String(v)}</dd>
                    </div>
                  ))}
              </dl>
              <section className="metric-preview col-span-full">
                <strong>Plan Ready</strong>
                <span>Your personal health plan is ready. Personal data stays securely on your device or in your private Google Drive folder.</span>
              </section>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="notice error mt-4" role="alert">
          {error}
        </p>
      )}

      {/* Prominent, high-contrast, beautiful toolbar buttons */}
      <div className="toolbar mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          {step > 0 && (
            <button
              className="secondary-btn"
              onClick={() => void update(d => { d.onboarding.step--; })}
            >
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onClose && (
            <button className="secondary-btn" onClick={onClose}>
              Save & close
            </button>
          )}

          <button
            className="primary-btn flex items-center gap-2"
            onClick={() => void next()}
          >
            <span>
              {step === 0
                ? 'Continue with this device'
                : step === 7
                ? 'Start my planner'
                : 'Continue'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
