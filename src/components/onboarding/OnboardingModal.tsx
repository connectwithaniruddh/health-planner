import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserProfile } from '../../schemas/store.schema';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Award,
  Zap,
  Flame,
  HeartPulse,
  Scale,
  Leaf,
  Activity,
  Check,
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { store, completeOnboarding } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State with empty string defaults for numeric inputs (solves '0180' and shows '--')
  const [name, setName] = useState(store.profile.name || '');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>(store.profile.gender || 'female');
  const [ageStr, setAgeStr] = useState<string>(store.profile.age ? String(store.profile.age) : '28');
  const [primaryGoal, setPrimaryGoal] = useState<string>(
    store.profile.primaryGoal || 'Lose Fat & Reverse Metabolic Conditions'
  );

  const [heightStr, setHeightStr] = useState<string>(
    store.profile.heightCm ? String(store.profile.heightCm) : '165'
  );
  const [weightStr, setWeightStr] = useState<string>(
    store.profile.currentWeightKg ? String(store.profile.currentWeightKg) : '70'
  );
  const [targetWeightStr, setTargetWeightStr] = useState<string>(
    store.profile.targetWeightKg ? String(store.profile.targetWeightKg) : '62'
  );
  const [weeklyTarget, setWeeklyTarget] = useState<'0.25' | '0.50' | '0.75' | '1.00'>('0.50');
  const [activityLevel, setActivityLevel] = useState<UserProfile['activityLevel']>('lightly_active');

  const [dietaryPref, setDietaryPref] = useState<'pure_veg' | 'vegan' | 'eggetarian' | 'non_veg'>('pure_veg');
  const [dietMode, setDietMode] = useState<UserProfile['dietMode']>('intermittent_fasting_16_8');

  // Medical conditions checkboxes
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    store.profile.medicalConditions.length > 0 ? store.profile.medicalConditions : []
  );

  // Lab biomarkers
  const [hba1cStr, setHba1cStr] = useState<string>('5.4');
  const [b12Str, setB12Str] = useState<string>('320');
  const [d3Str, setD3Str] = useState<string>('24');
  const [hbStr, setHbStr] = useState<string>('13.2');
  const [altStr, setAltStr] = useState<string>('28');

  // Calculations for dynamic motivation
  const currentKg = parseFloat(weightStr) || 70;
  const targetKg = parseFloat(targetWeightStr) || 62;
  const kgToLose = Math.max(0, currentKg - targetKg);
  const weeklyRate = parseFloat(weeklyTarget);
  const weeksNeeded = weeklyRate > 0 ? Math.ceil(kgToLose / weeklyRate) : 12;
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + weeksNeeded * 7);
  const dateFormatted = projectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const totalCaloriesDeficit = Math.round(kgToLose * 7700);

  const toggleCondition = (cond: string) => {
    if (cond === 'None / Completely Healthy') {
      setSelectedConditions(['None / Completely Healthy']);
      return;
    }
    const filtered = selectedConditions.filter((c) => c !== 'None / Completely Healthy');
    if (filtered.includes(cond)) {
      setSelectedConditions(filtered.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...filtered, cond]);
    }
  };

  const handleFinish = async () => {
    const age = parseInt(ageStr, 10) || 28;
    const heightCm = parseFloat(heightStr) || 165;
    const currentWeightKg = parseFloat(weightStr) || 70;
    const targetWeightKg = parseFloat(targetWeightStr) || 62;

    await completeOnboarding({
      name: name.trim() || 'Health Pioneer',
      gender,
      age,
      heightCm,
      currentWeightKg,
      targetWeightKg,
      weeklyTargetKg: weeklyTarget,
      activityLevel,
      dietaryPreference: dietaryPref,
      dietMode,
      primaryGoal,
      medicalConditions: selectedConditions,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-neutral-900/90 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 md:p-8 space-y-6 text-slate-100 overflow-hidden">
        {/* Apple Dynamic Ambient Rim Glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />

        {/* Header & Step Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Health Journey Onboarding</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold tracking-wider text-slate-300">
              Step {step} of 5
            </span>
          </div>

          {/* Gamified Step Progress Bar */}
          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-full flex-1 rounded-full transition-all duration-500 ${
                  s <= step ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Hero Identity & Wellness Goal */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold font-rounded text-white">Welcome! What shall we call you?</h2>
              <p className="text-xs text-slate-400 mt-1">
                Let's calibrate your clinical baseline and build your personalized Indian health dashboard.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aniruddh"
                  className="w-full bg-neutral-800/80 border border-white/10 focus:border-emerald-400 text-white font-medium px-4 py-3 rounded-2xl outline-none transition-all placeholder:text-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                        gender === 'male'
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                          : 'bg-neutral-800/60 border-neutral-700/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('female')}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                        gender === 'female'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                          : 'bg-neutral-800/60 border-neutral-700/60 text-slate-400 hover:text-white'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ageStr}
                    onChange={(e) => setAgeStr(e.target.value.replace(/\D/g, ''))}
                    placeholder="--"
                    className="w-full bg-neutral-800/80 border border-white/10 focus:border-emerald-400 text-white font-bold px-4 py-2.5 rounded-2xl outline-none transition-all placeholder:text-slate-600 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Primary Transformation Mission
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    'Lose Fat & Reverse Metabolic Conditions',
                    'Fatty Liver (NAFLD) Reversal Protocol',
                    'Blood Sugar & Pre-diabetes Glycemic Control',
                    'Lean Muscle Gain & Stamina Boost',
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setPrimaryGoal(goal)}
                      className={`p-3 rounded-2xl text-left text-xs font-semibold border transition-all ${
                        primaryGoal === goal
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/10'
                          : 'bg-neutral-800/50 border-neutral-700/50 text-slate-400 hover:bg-neutral-800'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Body Metrics & Transformation Targets */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold font-rounded text-white">Your Biometrics & Target Deficit</h2>
              <p className="text-xs text-slate-400 mt-1">
                Precision BMR and TDEE calculation. Empty values will show as -- without leading zeros.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Height (cm)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={heightStr}
                  onChange={(e) => setHeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="--"
                  className="w-full bg-neutral-800/80 border border-white/10 focus:border-cyan-400 text-white font-bold text-center text-lg py-2.5 rounded-2xl outline-none tabular-nums placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Current (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weightStr}
                  onChange={(e) => setWeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="--"
                  className="w-full bg-neutral-800/80 border border-white/10 focus:border-cyan-400 text-white font-bold text-center text-lg py-2.5 rounded-2xl outline-none tabular-nums placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Target (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={targetWeightStr}
                  onChange={(e) => setTargetWeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="--"
                  className="w-full bg-neutral-800/80 border border-white/10 focus:border-cyan-400 text-white font-bold text-center text-lg py-2.5 rounded-2xl outline-none tabular-nums placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Live Motivational Projection Box */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Predictive Transformation Milestone</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                By losing <span className="font-bold text-emerald-400">{kgToLose.toFixed(1)} kg</span> at{' '}
                <span className="font-bold text-cyan-400">{weeklyTarget} kg/week</span>, you are projected to reach your
                target weight around <span className="font-bold text-white underline">{dateFormatted}</span>! Total body
                energy combustion: <span className="font-bold text-amber-300">{totalCaloriesDeficit.toLocaleString()} kcal</span>.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Weekly Deficit Rate
                </label>
                <select
                  value={weeklyTarget}
                  onChange={(e) => setWeeklyTarget(e.target.value as any)}
                  className="w-full bg-neutral-800 border border-white/10 text-white text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:border-emerald-400"
                >
                  <option value="0.25">0.25 kg/week (Gentle - 275 kcal/day)</option>
                  <option value="0.50">0.50 kg/week (Standard - 550 kcal/day)</option>
                  <option value="0.75">0.75 kg/week (Accelerated - 825 kcal/day)</option>
                  <option value="1.00">1.00 kg/week (Aggressive - 1100 kcal/day)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Activity Level
                </label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value as any)}
                  className="w-full bg-neutral-800 border border-white/10 text-white text-xs font-bold px-3 py-2.5 rounded-xl outline-none focus:border-emerald-400"
                >
                  <option value="sedentary">Sedentary (Desk Job, little exercise)</option>
                  <option value="lightly_active">Lightly Active (1-3 days brisk walk)</option>
                  <option value="moderately_active">Moderately Active (3-5 days gym/yoga)</option>
                  <option value="very_active">Very Active (6-7 days intense sport)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Dietary Philosophy & Fasting Lifestyle */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold font-rounded text-white">Your Dietary Philosophy & Habits</h2>
              <p className="text-xs text-slate-400 mt-1">
                Strict filtering guarantees non-veg dishes will never appear if you choose vegetarian.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Dietary Preference (Strict Enforcement)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'pure_veg', label: '🥦 Pure Veg', desc: 'No meat, poultry, fish or eggs' },
                  { id: 'vegan', label: '🌱 Vegan', desc: '100% plant-based, no dairy' },
                  { id: 'eggetarian', label: '🥚 Eggetarian', desc: 'Vegetarian + Eggs' },
                  { id: 'non_veg', label: '🍗 Non-Veg', desc: 'Includes chicken, fish & meats' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDietaryPref(item.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      dietaryPref === item.id
                        ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                        : 'bg-neutral-800/50 border-neutral-700/50 text-slate-400 hover:bg-neutral-800'
                    }`}
                  >
                    <span className="block font-bold text-xs text-white">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Preferred Diet Mode & Fasting Protocol
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { id: 'intermittent_fasting_16_8', label: '⏱️ 16:8 Intermittent Fasting (Recommended)', desc: '16h Fast / 8h Eating Window' },
                  { id: 'intermittent_fasting_18_6', label: '🔥 18:6 Deep Fasting', desc: '18h Fast / 6h Window (Ketosis & Autophagy)' },
                  { id: 'balanced_desi', label: '🍛 Balanced Desi Diet', desc: 'Whole grain rotis, dal tadka, sabzi, curd' },
                  { id: 'high_protein_desi', label: '💪 High Protein Desi', desc: 'Paneer, sattu, moong sprouts, lentils (1.8g/kg)' },
                  { id: 'low_carb_desi', label: '🥑 Low Carb Desi', desc: 'Reduced grain, higher cruciferous & nuts' },
                  { id: 'omad_23_1', label: '⚡ OMAD (23:1)', desc: 'One Nutrient-Dense Meal a Day' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDietMode(item.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all ${
                      dietMode === item.id
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md'
                        : 'bg-neutral-800/50 border-neutral-700/50 text-slate-400 hover:bg-neutral-800'
                    }`}
                  >
                    <span className="block font-bold text-xs text-white">{item.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Medical Health Panel & Lab Check */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold font-rounded text-white">Clinical & Medical Health Check</h2>
              <p className="text-xs text-slate-400 mt-1">
                Check any relevant conditions so our clinical advisory engine can protect and guide you.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                Diagnosed Conditions or Health Concerns
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Fatty Liver (NAFLD)',
                  'Type 2 Diabetes / Pre-diabetes',
                  'Hypertension (High BP)',
                  'High Cholesterol / Lipids',
                  'Vitamin B12 Deficiency',
                  'Vitamin D3 Deficiency',
                  'Anemia / Low Iron',
                  'PCOD / PCOS',
                  'None / Completely Healthy',
                ].map((cond) => {
                  const isChecked = selectedConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`p-2.5 rounded-2xl text-left text-xs font-semibold border flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-rose-500/20 border-rose-400 text-rose-200'
                          : 'bg-neutral-800/50 border-neutral-700/50 text-slate-400 hover:bg-neutral-800'
                      }`}
                    >
                      <span className="truncate mr-1">{cond}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lab Biomarkers (Optional baseline) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Latest Diagnostic Blood Reports (Optional / Editable Later)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                <div className="p-2 bg-neutral-800/60 rounded-xl border border-neutral-700 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">HbA1c (%)</span>
                  <input
                    type="text"
                    value={hba1cStr}
                    onChange={(e) => setHba1cStr(e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-center text-xs font-bold text-white outline-none"
                  />
                </div>
                <div className="p-2 bg-neutral-800/60 rounded-xl border border-neutral-700 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Vit B12 (pg/mL)</span>
                  <input
                    type="text"
                    value={b12Str}
                    onChange={(e) => setB12Str(e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-center text-xs font-bold text-white outline-none"
                  />
                </div>
                <div className="p-2 bg-neutral-800/60 rounded-xl border border-neutral-700 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Vit D3 (ng/mL)</span>
                  <input
                    type="text"
                    value={d3Str}
                    onChange={(e) => setD3Str(e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-center text-xs font-bold text-white outline-none"
                  />
                </div>
                <div className="p-2 bg-neutral-800/60 rounded-xl border border-neutral-700 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">Hb (g/dL)</span>
                  <input
                    type="text"
                    value={hbStr}
                    onChange={(e) => setHbStr(e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-center text-xs font-bold text-white outline-none"
                  />
                </div>
                <div className="p-2 bg-neutral-800/60 rounded-xl border border-neutral-700 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">ALT/SGPT (U/L)</span>
                  <input
                    type="text"
                    value={altStr}
                    onChange={(e) => setAltStr(e.target.value)}
                    placeholder="--"
                    className="w-full bg-transparent text-center text-xs font-bold text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Starter Perk Celebration & Launch */}
        {step === 5 && (
          <div className="space-y-6 text-center animate-fadeIn py-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Award className="w-10 h-10 text-white" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold font-rounded text-white">You're All Set, {name}!</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your clinical engine has calibrated your safe calorie budget and tailored your food suggestions.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-3 rounded-2xl bg-neutral-800/80 border border-emerald-500/40 text-center space-y-1">
                <Zap className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-lg font-bold text-white">+100 XP</span>
                <span className="text-[10px] text-slate-400 block">Starter Bonus</span>
              </div>

              <div className="p-3 rounded-2xl bg-neutral-800/80 border border-purple-500/40 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-purple-400 mx-auto" />
                <span className="text-xs font-bold text-purple-300 block">Badge Unlocked</span>
                <span className="text-[10px] text-slate-400 block">Pioneer Health Hero</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Your interactive anatomical avatar and tailored clinical guidance are now ready.
            </p>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-slate-300 font-semibold text-xs transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as any)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all ml-auto"
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 active:scale-95 transition-all"
            >
              Launch My Health Planner Dashboard 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
