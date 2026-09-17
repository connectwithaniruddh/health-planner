import React, { useState, useMemo } from 'react';
import { Observation, useHealthStore } from '../domain/healthStore';
import {
  Activity,
  HeartPulse,
  TrendingDown,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  Sparkles,
  ShieldAlert,
  Flame,
  Scale
} from 'lucide-react';

// South Asian / ICMR / RSSDI / AASLD Clinical Cutoffs and Reference Standards
export interface MarkerMeta {
  key: string;
  name: string;
  unit: string;
  category: 'liver' | 'glucose' | 'lipids' | 'vitamins' | 'body';
  optimalMin?: number;
  optimalMax?: number;
  borderlineMax?: number;
  higherIsBetter?: boolean;
  explanation: string;
  laymanAction: string;
}

export const SOUTH_ASIAN_MARKERS: MarkerMeta[] = [
  // LIVER (NAFLD / MASLD)
  {
    key: 'ALT',
    name: 'ALT / SGPT (Liver Enzyme)',
    unit: 'U/L',
    category: 'liver',
    optimalMax: 30,
    borderlineMax: 45,
    explanation: 'AASLD guidelines state true healthy liver ALT is ≤30 U/L for men and ≤25 U/L for women. Elevated ALT indicates liver cell stress from excess fat accumulation (NAFLD/MASLD).',
    laymanAction: 'Every 5% weight loss reduces liver fat by 30-50%. Eliminating added fructose (sugary chai, juices, packaged sweets) directly stops liver fat manufacturing.'
  },
  {
    key: 'AST',
    name: 'AST / SGOT (Liver Enzyme)',
    unit: 'U/L',
    category: 'liver',
    optimalMax: 35,
    borderlineMax: 45,
    explanation: 'Marker of hepatocyte integrity. An AST/ALT ratio <0.8 is typical in early fatty liver. Values normalizing indicate active hepatic healing.',
    laymanAction: 'Avoid alcohol completely; replace refined seed oils with cold-pressed mustard or groundnut oil in minimal quantities.'
  },
  {
    key: 'Triglycerides',
    name: 'Serum Triglycerides',
    unit: 'mg/dL',
    category: 'liver',
    optimalMax: 150,
    borderlineMax: 199,
    explanation: 'Directly reflects liver VLDL production driven by carbohydrate overload. High triglycerides are the metabolic hallmark of fatty liver and insulin resistance.',
    laymanAction: 'Switch to Jowar/Bajra rotis; replace office biscuits with roasted bhuna chana. 16:8 intermittent fasting dramatically drops triglycerides.'
  },

  // GLUCOSE (DIABETES / PRE-DIABETES)
  {
    key: 'HbA1c',
    name: 'HbA1c (3-Month Glycation)',
    unit: '%',
    category: 'glucose',
    optimalMax: 5.6,
    borderlineMax: 6.4,
    explanation: 'Measures average blood sugar over 90 days. Under RSSDI criteria, 5.7% to 6.4% is Pre-Diabetes. ≥6.5% indicates Type 2 Diabetes.',
    laymanAction: 'A 10-minute walk within 30 minutes after lunch and dinner blunts glucose spikes by 35% through non-insulin muscle uptake.'
  },
  {
    key: 'Fasting glucose',
    name: 'Fasting Blood Glucose',
    unit: 'mg/dL',
    category: 'glucose',
    optimalMin: 70,
    optimalMax: 99,
    borderlineMax: 125,
    explanation: 'Reflects overnight liver glucose production. In insulin resistance, the liver continues leaking glucose into the blood even during sleep.',
    laymanAction: 'Drink soaked methi (fenugreek) water in the morning. Galactomannan fiber improves morning insulin sensitivity.'
  },

  // LIPIDS (CHOLESTEROL)
  {
    key: 'LDL cholesterol',
    name: 'LDL Cholesterol',
    unit: 'mg/dL',
    category: 'lipids',
    optimalMax: 100,
    borderlineMax: 130,
    explanation: 'Primary atherogenic particle. For individuals with fatty liver or pre-diabetes, the Lipid Association of India recommends LDL <70-100 mg/dL.',
    laymanAction: 'Eat 1-2 raw crushed garlic cloves daily (allicin naturally inhibits HMG-CoA reductase). Avoid commercial bakery fats and trans-fats.'
  },
  {
    key: 'HDL cholesterol',
    name: 'HDL (Good) Cholesterol',
    unit: 'mg/dL',
    category: 'lipids',
    optimalMin: 40,
    higherIsBetter: true,
    explanation: 'Protective cholesterol. Indians characteristically have lower HDL due to sedentary lifestyles and high-carbohydrate diets.',
    laymanAction: 'Brisk walking 30 minutes daily and consuming soaked chia/flaxseeds (omega-3 ALA) elevates protective HDL.'
  },

  // MICRONUTRIENT DEFICIENCIES
  {
    key: 'Vitamin B12',
    name: 'Serum Vitamin B12',
    unit: 'pg/mL',
    category: 'vitamins',
    optimalMin: 400,
    optimalMax: 900,
    borderlineMax: 399,
    higherIsBetter: true,
    explanation: 'Crucial for mitochondrial energy and nerve health. Highly deficient in 70%+ of Indian vegetarian desk workers due to absence in plant foods.',
    laymanAction: 'Include fresh homemade curd/dahi, paneer, and nutritional yeast daily. Consult your doctor for sublingual methylcobalamin 1500 mcg if <200 pg/mL.'
  },
  {
    key: '25-OH vitamin D',
    name: 'Vitamin D3 (25-Hydroxy)',
    unit: 'ng/mL',
    category: 'vitamins',
    optimalMin: 30,
    optimalMax: 100,
    borderlineMax: 29,
    higherIsBetter: true,
    explanation: 'Acts as a master metabolic hormone. Vitamin D deficiency exacerbates fatty liver inflammation and impairs insulin secretion from beta cells.',
    laymanAction: 'Take 15 minutes of morning sun (8-9 AM) without sunscreen. Indoor IT workers typically need clinician-prescribed Cholecalciferol 60,000 IU weekly.'
  },
  {
    key: 'Hemoglobin',
    name: 'Hemoglobin (Iron Health)',
    unit: 'g/dL',
    category: 'vitamins',
    optimalMin: 12.0,
    optimalMax: 17.0,
    higherIsBetter: true,
    explanation: 'Carries oxygen to tissues and brain. Low hemoglobin causes chronic 3 PM desk fatigue and brain fog.',
    laymanAction: 'Pair iron-rich spinach (Palak) or roasted black chana with fresh lemon juice (Vitamin C enhances plant iron absorption by 300%).'
  },

  // BODY & VISCERAL ADIPOSITY
  {
    key: 'Waist circumference',
    name: 'Waist Circumference',
    unit: 'cm',
    category: 'body',
    optimalMax: 90,
    borderlineMax: 95,
    explanation: 'South Asian cutoff is ≤90 cm (35.4") for men and ≤80 cm (31.5") for women. Best practical proxy for intra-abdominal visceral fat feeding the liver.',
    laymanAction: 'Target: Keep your waist circumference to less than half your height. Visceral fat is the first to burn when caloric deficit is maintained.'
  }
];

export function Health() {
  const { state, update } = useHealthStore();
  const [selectedMarkerKey, setSelectedMarkerKey] = useState<string>('ALT');
  const [inputValue, setInputValue] = useState<string>('');
  const [inputDate, setInputDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [inputNotes, setInputNotes] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<string>('');
  const [expandedCard, setExpandedCard] = useState<string | null>('liver');

  const selectedMeta = SOUTH_ASIAN_MARKERS.find(m => m.key === selectedMarkerKey) || SOUTH_ASIAN_MARKERS[0];

  // Group latest observations by marker
  const latestByMarker = useMemo(() => {
    const map = new Map<string, Observation>();
    const sorted = [...state.observations].sort((a, b) => b.date.localeCompare(a.date));
    for (const obs of sorted) {
      if (!map.has(obs.marker)) {
        map.set(obs.marker, obs);
      }
    }
    return map;
  }, [state.observations]);

  // Helper to evaluate health status
  function getStatus(meta: MarkerMeta, value: number) {
    if (meta.higherIsBetter) {
      if (meta.optimalMin && value >= meta.optimalMin) return { status: 'optimal', label: 'Optimal / In Range', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      if (meta.borderlineMax && value >= 20) return { status: 'borderline', label: 'Borderline / Insufficient', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      return { status: 'alert', label: 'Deficient / Low', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    } else {
      if (meta.optimalMax && value <= meta.optimalMax) return { status: 'optimal', label: 'Optimal / Healthy Range', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
      if (meta.borderlineMax && value <= meta.borderlineMax) return { status: 'borderline', label: 'Borderline Elevated', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
      return { status: 'alert', label: 'Elevated / High Risk', color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const val = Number(inputValue);
    if (!inputValue.trim() || !Number.isFinite(val) || val <= 0) {
      setError('Please enter a valid positive numerical measurement value from your lab report.');
      return;
    }

    const row: Observation = {
      id: editingId || crypto.randomUUID(),
      marker: selectedMeta.key,
      value: val,
      date: inputDate,
      unit: selectedMeta.unit,
      source: 'User entered lab test report',
      notes: inputNotes,
      referenceLow: selectedMeta.optimalMin,
      referenceHigh: selectedMeta.optimalMax,
      updatedAt: new Date().toISOString()
    };

    const ok = await update(d => {
      d.observations = d.observations.filter(x => x.id !== row.id);
      d.observations.push(row);
    });

    if (ok) {
      setInputValue('');
      setInputNotes('');
      setEditingId(null);
    }
  }

  const rows = [...state.observations]
    .filter(x => x.marker.toLowerCase().includes(filter.toLowerCase()) || (x.notes || '').toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="page-stack space-y-6">
      {/* Header */}
      <header className="page-heading">
        <div>
          <span className="eyebrow font-bold text-xs">CLINICAL BIOMETRICS & METABOLIC HEALTH</span>
          <h1 className="text-ink mt-1">Your Body Parameters & Ranges</h1>
          <p className="muted text-sm mt-1 max-w-3xl">
            Calibrated to South Asian clinical consensus (ICMR, RSSDI & AASLD). Track liver health, glucose tolerance, lipid profile, and micronutrient deficiencies to measure your progress beyond just body weight.
          </p>
        </div>
      </header>

      {/* 5 CLINICAL SPECTRUM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. LIVER HEALTH (NAFLD / MASLD) */}
        <section className="surface p-5 rounded-3xl border border-rule space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-rule">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Activity className="w-5 h-5" />
              <span>Liver Health (NAFLD / MASLD)</span>
            </div>
            <span className="text-[11px] font-semibold text-muted">AASLD Standard</span>
          </div>

          <div className="space-y-3 pt-1">
            {['ALT', 'AST', 'Triglycerides'].map(key => {
              const meta = SOUTH_ASIAN_MARKERS.find(m => m.key === key)!;
              const current = latestByMarker.get(key);
              const status = current ? getStatus(meta, current.value) : null;
              return (
                <div key={key} className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-rule">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-ink">{meta.name}</span>
                    {status ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted">No test logged</span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <strong className="text-lg font-bold text-ink">
                      {current ? `${current.value} ${meta.unit}` : '—'}
                    </strong>
                    <span className="text-[11px] text-muted">Optimal: ≤{meta.optimalMax} {meta.unit}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            <strong>Clinical Reversal Note:</strong> 5% body weight reduction triggers hepatic autophagy (lipophagy) and clears up to 50% of liver fat droplets.
          </div>
        </section>

        {/* 2. GLUCOSE & DIABETES PANEL */}
        <section className="surface p-5 rounded-3xl border border-rule space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rule">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-sm">
              <Flame className="w-5 h-5" />
              <span>Glycemic & Insulin Health</span>
            </div>
            <span className="text-[11px] font-semibold text-muted">RSSDI Cutoffs</span>
          </div>

          <div className="space-y-3 pt-1">
            {['HbA1c', 'Fasting glucose'].map(key => {
              const meta = SOUTH_ASIAN_MARKERS.find(m => m.key === key)!;
              const current = latestByMarker.get(key);
              const status = current ? getStatus(meta, current.value) : null;
              return (
                <div key={key} className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-rule">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-ink">{meta.name}</span>
                    {status ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted">No test logged</span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <strong className="text-lg font-bold text-ink">
                      {current ? `${current.value} ${meta.unit}` : '—'}
                    </strong>
                    <span className="text-[11px] text-muted">
                      {key === 'HbA1c' ? 'Optimal: <5.7%' : 'Optimal: 70–99 mg/dL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-800 dark:text-cyan-300 leading-relaxed">
            <strong>Desk IT Habit:</strong> A 10-minute post-meal walk blunts postprandial glucose spikes by 35% via non-insulin mediated GLUT4 muscle uptake.
          </div>
        </section>

        {/* 3. LIPIDS & CHOLESTEROL */}
        <section className="surface p-5 rounded-3xl border border-rule space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rule">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-sm">
              <HeartPulse className="w-5 h-5" />
              <span>Lipids & Cardiovascular</span>
            </div>
            <span className="text-[11px] font-semibold text-muted">Lipid Assoc. India</span>
          </div>

          <div className="space-y-3 pt-1">
            {['LDL cholesterol', 'HDL cholesterol'].map(key => {
              const meta = SOUTH_ASIAN_MARKERS.find(m => m.key === key)!;
              const current = latestByMarker.get(key);
              const status = current ? getStatus(meta, current.value) : null;
              return (
                <div key={key} className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-rule">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-ink">{meta.name}</span>
                    {status ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted">No test logged</span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <strong className="text-lg font-bold text-ink">
                      {current ? `${current.value} ${meta.unit}` : '—'}
                    </strong>
                    <span className="text-[11px] text-muted">
                      {meta.higherIsBetter ? 'Optimal: ≥40 mg/dL' : 'Optimal: <100 mg/dL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 leading-relaxed">
            <strong>TG/HDL Ratio:</strong> High triglycerides with low HDL indicates atherogenic small-dense LDL. Soluble fiber (Jowar/Oats) accelerates LDL clearance.
          </div>
        </section>

        {/* 4. MICRONUTRIENT DEFICIENCIES */}
        <section className="surface p-5 rounded-3xl border border-rule space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rule">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
              <Sparkles className="w-5 h-5" />
              <span>Vitamin B12 & D3 Deficiencies</span>
            </div>
            <span className="text-[11px] font-semibold text-muted">Vegetarian Care</span>
          </div>

          <div className="space-y-3 pt-1">
            {['Vitamin B12', '25-OH vitamin D'].map(key => {
              const meta = SOUTH_ASIAN_MARKERS.find(m => m.key === key)!;
              const current = latestByMarker.get(key);
              const status = current ? getStatus(meta, current.value) : null;
              return (
                <div key={key} className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-rule">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-ink">{meta.name}</span>
                    {status ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                        {status.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted">No test logged</span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <strong className="text-lg font-bold text-ink">
                      {current ? `${current.value} ${meta.unit}` : '—'}
                    </strong>
                    <span className="text-[11px] text-muted">
                      {key === 'Vitamin B12' ? 'Optimal: >400 pg/mL' : 'Optimal: 30–60 ng/mL'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            <strong>Indoor Coder Protocol:</strong> 70%+ of Indian IT vegetarians have B12/D3 deficits. Fresh curd, fortified soy, and clinician-prescribed D3 are essential.
          </div>
        </section>

        {/* 5. VISCERAL ADIPOSITY & BODY METRICS */}
        <section className="surface p-5 rounded-3xl border border-rule space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rule">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <Scale className="w-5 h-5" />
              <span>Visceral Adiposity & Waist</span>
            </div>
            <span className="text-[11px] font-semibold text-muted">Asian Standards</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-rule">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-ink">Waist Circumference</span>
                <span className="text-[10px] text-muted">Cutoff: ≤90 cm men / ≤80 cm women</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <strong className="text-lg font-bold text-ink">
                  {latestByMarker.get('Waist circumference')?.value ? `${latestByMarker.get('Waist circumference')!.value} cm` : '—'}
                </strong>
                <span className="text-[11px] text-muted">Visceral Fat Marker</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-rule">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-ink">Asian BMI Thresholds</span>
                <span className="text-[10px] text-emerald-500 font-bold">18.5 – 22.9 Normal</span>
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <strong className="text-lg font-bold text-ink">
                  {state.profile.weightKg && state.profile.heightCm
                    ? `${(state.profile.weightKg / Math.pow(state.profile.heightCm / 100, 2)).toFixed(1)} kg/m²`
                    : '—'}
                </strong>
                <span className="text-[11px] text-muted">Overweight ≥23 / Obese ≥25</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            <strong>Rule:</strong> Keep your waist circumference to less than half your height. Visceral fat is the first fat mobilized during a calorie deficit.
          </div>
        </section>
      </div>

      {/* QUICK LOG MEASUREMENT FORM */}
      <section className="surface p-6 rounded-3xl border border-rule space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-rule">
          <div>
            <span className="eyebrow font-bold text-xs">RECORD LAB RESULT</span>
            <h2 className="text-xl font-bold text-ink mt-0.5">
              {editingId ? 'Edit Measurement' : 'Log New Laboratory Observation'}
            </h2>
          </div>
          {editingId && (
            <button
              className="secondary-btn text-xs py-1 px-3"
              onClick={() => {
                setEditingId(null);
                setInputValue('');
                setInputNotes('');
              }}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Marker Selector */}
            <label className="field">
              <span className="text-xs font-semibold">Measurement</span>
              <select
                value={selectedMarkerKey}
                onChange={e => setSelectedMarkerKey(e.target.value)}
                className="form-select"
              >
                {SOUTH_ASIAN_MARKERS.map(m => (
                  <option key={m.key} value={m.key}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
            </label>

            {/* Value Input */}
            <label className="field">
              <span className="text-xs font-semibold">
                Result ({selectedMeta.unit})
              </span>
              <input
                type="number"
                step="any"
                required
                placeholder={`e.g. ${selectedMeta.optimalMax || 25}`}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="form-input"
              />
            </label>

            {/* Date Input */}
            <label className="field">
              <span className="text-xs font-semibold">Test Date</span>
              <input
                type="date"
                required
                value={inputDate}
                onChange={e => setInputDate(e.target.value)}
                className="form-input"
              />
            </label>
          </div>

          <label className="field">
            <span className="text-xs font-semibold">Context / Report Notes (Optional)</span>
            <input
              type="text"
              placeholder="e.g. Fasting 12 hours; Dr. Lal PathLabs; Ultrasound showed Grade 1 Steatosis"
              value={inputNotes}
              onChange={e => setInputNotes(e.target.value)}
              className="form-input"
            />
          </label>

          {/* Clinical explainer for selected marker */}
          <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-rule text-xs space-y-1">
            <p className="text-ink font-semibold">{selectedMeta.explanation}</p>
            <p className="text-muted font-medium">{selectedMeta.laymanAction}</p>
          </div>

          {error && <p className="notice error text-xs" role="alert">{error}</p>}

          <div className="flex justify-end">
            <button className="primary-btn flex items-center gap-2" type="submit">
              <Plus size={16} />
              <span>{editingId ? 'Update Measurement' : 'Save to Health Record'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* MEASUREMENT HISTORY TABLE */}
      <section className="surface p-6 rounded-3xl border border-rule space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-rule">
          <div>
            <span className="eyebrow font-bold text-xs">DATED RECORDS</span>
            <h2 className="text-xl font-bold text-ink mt-0.5">Measurement History</h2>
          </div>
          <input
            aria-label="Filter measurements"
            placeholder="Search measurements..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="form-input max-w-xs text-xs"
          />
        </div>

        {!rows.length ? (
          <p className="py-8 text-center text-sm text-muted">
            No lab measurements recorded yet. Add an ALT, HbA1c, or Triglycerides result above to track your reversal progress.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-rule text-xs text-muted">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Measurement</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">Status / Target</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const meta = SOUTH_ASIAN_MARKERS.find(m => m.key === row.marker);
                  const status = meta ? getStatus(meta, row.value) : null;
                  return (
                    <tr key={row.id} className="border-b border-rule hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-xs text-muted">{row.date}</td>
                      <td className="py-2.5 px-3 font-bold text-ink">{row.marker}</td>
                      <td className="py-2.5 px-3 font-bold text-ink">
                        {row.value} <span className="text-xs text-muted font-normal">{row.unit}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        {status && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${status.color}`}>
                            {status.label}
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-xs text-muted max-w-xs truncate">{row.notes || '—'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="text-xs text-muted hover:text-ink font-semibold"
                            onClick={() => {
                              setEditingId(row.id);
                              setSelectedMarkerKey(row.marker);
                              setInputValue(String(row.value));
                              setInputDate(row.date);
                              setInputNotes(row.notes || '');
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-xs text-red-500 hover:text-red-700 font-semibold"
                            onClick={() => void update(d => { d.observations = d.observations.filter(x => x.id !== row.id); })}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="muted text-xs pt-2">
          Clinical ranges are based on ICMR, RSSDI, and AASLD clinical consensus for South Asians. Always review abnormal blood panels with your physician or hepatologist.
        </p>
      </section>
    </div>
  );
}
