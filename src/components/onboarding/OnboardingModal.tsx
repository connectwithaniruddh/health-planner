import React, { useState, useEffect, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserProfile } from '../../schemas/store.schema';
import { calculateBMR, calculateTDEE } from '../../utils/calculations';
import { gDriveService } from '../../services/gdrive/gdrive.service';
import { isAuthenticatedWithGoogle, initGoogleAuthSDK, requestGoogleAccessToken } from '../../services/gdrive/auth.service';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  Award,
  Zap,
  Flame,
  HeartPulse,
  Scale,
  Calendar,
  Info,
  X,
  Check,
  AlertTriangle,
  HelpCircle,
  Loader2,
} from 'lucide-react';

export const OnboardingModal: React.FC = () => {
  const { store, completeOnboarding } = useAppStore();
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Google Drive state
  const [isDriveConnecting, setIsDriveConnecting] = useState(false);
  const [driveMessage, setDriveMessage] = useState<string | null>(null);

  // Form State with string defaults (shows '--' when empty, zero '0180' bugs)
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

  // Special Event Slider State
  const [hasSpecialEvent, setHasSpecialEvent] = useState(false);
  const [customWeeks, setCustomWeeks] = useState(16);

  const [dietaryPref, setDietaryPref] = useState<'pure_veg' | 'vegan' | 'eggetarian' | 'non_veg'>('pure_veg');
  const [dietMode, setDietMode] = useState<UserProfile['dietMode']>('intermittent_fasting_16_8');
  const [activeInfoModal, setActiveInfoModal] = useState<string | null>(null);

  // Medical conditions checkboxes
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    store.profile.medicalConditions.length > 0 ? store.profile.medicalConditions : ['Fatty Liver (NAFLD)']
  );

  // Lab biomarkers
  const [hba1cStr, setHba1cStr] = useState<string>('5.4');
  const [b12Str, setB12Str] = useState<string>('320');
  const [d3Str, setD3Str] = useState<string>('24');
  const [hbStr, setHbStr] = useState<string>('13.2');
  const [altStr, setAltStr] = useState<string>('28');

  // Listen for Google OAuth callback
  useEffect(() => {
    const handleAuthSuccess = async () => {
      await retrieveDataFromDrive();
    };
    window.addEventListener('google-auth-success', handleAuthSuccess);
    return () => window.removeEventListener('google-auth-success', handleAuthSuccess);
  }, []);

  const retrieveDataFromDrive = async () => {
    setIsDriveConnecting(true);
    setDriveMessage('Connecting to Google Drive and scanning appDataFolder...');

    try {
      const file = await gDriveService.findStoreFile();
      if (file) {
        const remoteData = (await gDriveService.downloadStore(file.id)) as any;
        if (remoteData && remoteData.profile) {
          const p = remoteData.profile;
          if (p.name) setName(p.name);
          if (p.gender) setGender(p.gender);
          if (p.age) setAgeStr(String(p.age));
          if (p.heightCm) setHeightStr(String(p.heightCm));
          if (p.currentWeightKg) setWeightStr(String(p.currentWeightKg));
          if (p.targetWeightKg) setTargetWeightStr(String(p.targetWeightKg));
          if (p.dietaryPreference) setDietaryPref(p.dietaryPreference);
          if (p.dietMode) setDietMode(p.dietMode);
          if (p.medicalConditions) setSelectedConditions(p.medicalConditions);
          setDriveMessage(`✅ Successfully retrieved profile for "${p.name || 'User'}" from Google Drive!`);
        } else {
          setDriveMessage('Connected to Google Drive! No existing profile file found — continuing with setup.');
        }
      } else {
        setDriveMessage('Connected to Google Drive! Ready to create your cloud sync file.');
      }
    } catch (err) {
      console.warn('Drive retrieval error:', err);
      setDriveMessage('Connected to Google Drive! Ready for first-time sync.');
    } finally {
      setIsDriveConnecting(false);
    }
  };

  const handleConnectDriveClick = async () => {
    if (isAuthenticatedWithGoogle()) {
      await retrieveDataFromDrive();
    } else {
      setIsDriveConnecting(true);
      await initGoogleAuthSDK();
      requestGoogleAccessToken();
    }
  };

  // Transformation Math Calculations
  const currentKg = parseFloat(weightStr) || 70;
  const targetKg = parseFloat(targetWeightStr) || 62;
  const kgToLose = Math.max(0, currentKg - targetKg);

  // Standard or Special Event Duration
  const defaultWeeksNeeded = Math.max(1, Math.ceil(kgToLose / parseFloat(weeklyTarget)));
  const effectiveWeeks = hasSpecialEvent ? customWeeks : defaultWeeksNeeded;
  const effectiveWeeklyRate = (kgToLose / effectiveWeeks).toFixed(2);
  const requiredDailyDeficit = Math.round((kgToLose * 7700) / (effectiveWeeks * 7));

  // Projected Date
  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + effectiveWeeks * 7);
  const dateFormatted = projectedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // TDEE and Target Calories
  const bmr = calculateBMR({
    weightKg: currentKg,
    heightCm: parseFloat(heightStr) || 165,
    age: parseInt(ageStr, 10) || 28,
    gender,
  });
  const tdee = calculateTDEE(bmr, activityLevel);
  const dailyCalorieBudget = Math.max(1200, tdee - requiredDailyDeficit);

  // Dynamic Trajectory Graph Points (5 milestones)
  const trajectoryPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 4; i++) {
      const w = Math.round((effectiveWeeks / 4) * i);
      const kg = currentKg - (kgToLose / 4) * i;
      points.push({ week: `Wk ${w}`, kg: kg.toFixed(1) });
    }
    return points;
  }, [currentKg, kgToLose, effectiveWeeks]);

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

  // Biomarker Evaluation Helpers
  const getB12Status = (val: number) => {
    if (val < 200) return { label: 'Low / Deficient', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (val < 350) return { label: 'Borderline', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Optimal / In Range', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  const getD3Status = (val: number) => {
    if (val < 20) return { label: 'Deficient', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
    if (val < 30) return { label: 'Borderline', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Optimal / In Range', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
  };

  const getHbA1cStatus = (val: number) => {
    if (val < 5.7) return { label: 'Optimal / Normal', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (val < 6.5) return { label: 'Borderline / Pre-Diabetic', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'High / Diabetic Alert', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const getAltStatus = (val: number) => {
    if (val <= 35) return { label: 'Optimal / Healthy Liver', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (val <= 50) return { label: 'Borderline Elevated', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'High / Fatty Liver Alert', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto rounded-3xl bg-[#161618] border border-white/10 shadow-[0_24px_64px_rgba(0,0,0,0.85)] p-6 md:p-8 space-y-6 text-white overflow-hidden">
        {/* Apple Dynamic Ambient Rim Glow */}
        <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-60 h-60 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        {/* Header & Step Tracker */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Personalized Health Onboarding</span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-bold tracking-wider text-neutral-300">
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

        {/* STEP 1: Hero Identity & Google Drive Retrieval */}
        {step === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold font-rounded text-white">Welcome! Let's get started.</h2>
              <p className="text-xs text-neutral-400 mt-1">
                You can connect Google Drive to automatically retrieve any existing profile, or enter your details below.
              </p>
            </div>

            {/* Google Drive Connect & Auto-Retrieve Card */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Google Drive Cloud Synchronization</h4>
                  <p className="text-[11px] text-neutral-400">1-click profile & diet recovery from your private Drive</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConnectDriveClick}
                disabled={isDriveConnecting}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                {isDriveConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{isAuthenticatedWithGoogle() ? 'Scan & Retrieve from Drive' : 'Connect Google Drive'}</span>
                  </>
                )}
              </button>
            </div>

            {driveMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{driveMessage}</span>
              </div>
            )}

            <div className="space-y-4 pt-1">
              <div>
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aniruddh"
                  className="w-full bg-[#1C1C1E] border border-white/10 focus:border-emerald-400 text-white font-medium px-4 py-3 rounded-2xl outline-none transition-all placeholder:text-neutral-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('male')}
                      className={`py-2.5 rounded-xl font-bold text-xs border transition-all ${
                        gender === 'male'
                          ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                          : 'bg-[#1C1C1E] border-white/10 text-neutral-400 hover:text-white'
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
                          : 'bg-[#1C1C1E] border-white/10 text-neutral-400 hover:text-white'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ageStr}
                    onChange={(e) => setAgeStr(e.target.value.replace(/\D/g, ''))}
                    placeholder="--"
                    className="w-full bg-[#1C1C1E] border border-white/10 focus:border-emerald-400 text-white font-bold px-4 py-2.5 rounded-2xl outline-none transition-all placeholder:text-neutral-600 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
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
                          ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300 shadow-md'
                          : 'bg-[#1C1C1E] border-white/10 text-neutral-400 hover:bg-neutral-800'
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

        {/* STEP 2: Biometrics, Exact Deficit Math, Special Event Slider & Graph Plan */}
        {step === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold font-rounded text-white">Your Biometrics & Transformation Plan</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Precision BMR and daily negative calorie target to reach your goal safely.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                  Height (cm)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={heightStr}
                  onChange={(e) => setHeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="--"
                  className="w-full bg-[#1C1C1E] border border-white/10 focus:border-cyan-400 text-white font-bold text-center text-lg py-2.5 rounded-2xl outline-none tabular-nums placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                  Current (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weightStr}
                  onChange={(e) => setWeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="--"
                  className="w-full bg-[#1C1C1E] border border-white/10 focus:border-cyan-400 text-white font-bold text-center text-lg py-2.5 rounded-2xl outline-none tabular-nums placeholder:text-neutral-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-1">
                  Target (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={targetWeightStr}
                  onChange={(e) => setTargetWeightStr(e.target.value.replace(/[^0-9.]/g, ''))}
                  placeholder="--"
                  className="w-full bg-[#1C1C1E] border border-white/10 focus:border-cyan-400 text-white font-bold text-center text-lg py-2.5 rounded-2xl outline-none tabular-nums placeholder:text-neutral-600"
                />
              </div>
            </div>

            {/* Special Event Date Slider Option */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white">Have a Special Event or Deadline?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasSpecialEvent(!hasSpecialEvent)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    hasSpecialEvent
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {hasSpecialEvent ? 'Event Enabled' : 'Enable Date Marker'}
                </button>
              </div>

              {hasSpecialEvent && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Target Timeframe:</span>
                    <span className="font-bold text-amber-300">{customWeeks} Weeks ({dateFormatted})</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="48"
                    step="1"
                    value={customWeeks}
                    onChange={(e) => setCustomWeeks(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                    <span>4 Weeks (Rapid)</span>
                    <span>24 Weeks (Standard)</span>
                    <span>48 Weeks (Gentle)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actionable Negative Calorie Math Box */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-transparent border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>Your Exact Transformation Math</span>
                </div>
                <span className="text-[10px] font-mono text-neutral-400">Target: {dateFormatted}</span>
              </div>

              <p className="text-xs text-neutral-200 leading-relaxed">
                To achieve your goal of losing <span className="font-bold text-emerald-400">{kgToLose.toFixed(1)} kg</span> by{' '}
                <span className="font-bold text-white underline">{dateFormatted}</span>: you need{' '}
                <span className="font-bold text-amber-300 font-mono">{requiredDailyDeficit} calories to be negative</span> each day to
                meet your <span className="font-bold text-cyan-300 font-mono">{effectiveWeeklyRate} kg/week</span> reduction target.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] text-neutral-400 block">Maintenance (TDEE)</span>
                  <span className="font-bold text-neutral-200">{tdee} kcal</span>
                </div>
                <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] text-neutral-400 block">Daily Deficit</span>
                  <span className="font-bold text-amber-400">-{requiredDailyDeficit} kcal</span>
                </div>
                <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                  <span className="text-[10px] text-neutral-400 block">Daily Food Budget</span>
                  <span className="font-bold text-emerald-400">{dailyCalorieBudget} kcal</span>
                </div>
              </div>
            </div>

            {/* Visual Trajectory Graph Plan */}
            <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10 space-y-2">
              <span className="text-xs font-bold text-neutral-300 block">📉 Projected Weight Loss Trajectory</span>
              <div className="flex items-end justify-between gap-2 h-20 pt-4 px-2">
                {trajectoryPoints.map((pt, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <span className="text-[10px] font-bold text-cyan-300 font-mono">{pt.kg}kg</span>
                    <div
                      className="w-full bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-t-md opacity-80 group-hover:opacity-100 transition-all mt-1"
                      style={{ height: `${Math.max(15, 80 - i * 15)}%` }}
                    />
                    <span className="text-[9px] text-neutral-500 mt-1 font-mono">{pt.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Dietary Philosophy & NAFLD Verified Consensus */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold font-rounded text-white">Dietary Philosophy & Protocol</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Strict vegetarian enforcement guaranteed. Click (i) on any item for layman medical insights.
              </p>
            </div>

            {/* Verified Clinical Note for NAFLD */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Verified Clinical Guideline for Fatty Liver (NAFLD)</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                AASLD/EASL clinical consensus confirms that 7-10% weight loss via 16:8 Time-Restricted Eating activates
                hepatic lipophagy (clearing fat droplets from liver cells), while reducing high-GI refined grains stops
                new fat creation.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
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
                        : 'bg-[#1C1C1E] border-white/10 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <span className="block font-bold text-xs text-white">{item.label}</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
                Preferred Diet Mode & Fasting Protocol
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  {
                    id: 'intermittent_fasting_16_8',
                    label: '⏱️ 16:8 Fasting (Recommended)',
                    desc: '16h Fast / 8h Eating Window',
                    layman: 'Gives your digestive system 16 hours to rest. Ideal for reversing Fatty Liver and insulin resistance without starving.',
                  },
                  {
                    id: 'intermittent_fasting_18_6',
                    label: '🔥 18:6 Deep Fasting',
                    desc: '18h Fast / 6h Window',
                    layman: 'Accelerates autophagy (cellular cleanup) and ketosis. Excellent for breaking weight loss plateaus.',
                  },
                  {
                    id: 'balanced_desi',
                    label: '🍛 Balanced Desi Diet',
                    desc: 'Whole wheat rotis, dal tadka, sabzi, curd',
                    layman: 'Traditional home-cooked Indian meals with controlled portions and low cooking oil.',
                  },
                  {
                    id: 'high_protein_desi',
                    label: '💪 High Protein Desi',
                    desc: 'Paneer, sattu, moong sprouts, lentils (1.8g/kg)',
                    layman: 'Protects your lean muscle while burning pure belly fat. Keeps you full for longer.',
                  },
                  {
                    id: 'low_carb_desi',
                    label: '🥑 Low Carb Desi',
                    desc: 'Reduced grain, higher cruciferous & nuts',
                    layman: 'Minimizes blood sugar spikes. Ideal if you have Pre-Diabetes or high triglycerides.',
                  },
                  {
                    id: 'omad_23_1',
                    label: '⚡ OMAD (23:1)',
                    desc: 'One Nutrient-Dense Meal a Day',
                    layman: 'Extreme time-restricted protocol for experienced fasters.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-2 ${
                      dietMode === item.id
                        ? 'bg-purple-500/20 border-purple-400 text-purple-200 shadow-md'
                        : 'bg-[#1C1C1E] border-white/10 text-neutral-400 hover:bg-neutral-800'
                    }`}
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setDietMode(item.id as any)}
                    >
                      <span className="block font-bold text-xs text-white">{item.label}</span>
                      <span className="text-[10px] text-neutral-400 block mt-0.5">{item.desc}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveInfoModal(item.layman)}
                      className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 shrink-0"
                      title="Learn more in simple terms"
                    >
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Medical Health Panel & Biometric Ranges (Low / Borderline / In Range) */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold font-rounded text-white">Clinical & Biomarker Health Check</h2>
              <p className="text-xs text-neutral-400 mt-1">
                Enter your blood report values to see real-time indicators: Low, In Range, or Borderline.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block mb-2">
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
                          : 'bg-[#1C1C1E] border-white/10 text-neutral-400 hover:bg-neutral-800'
                      }`}
                    >
                      <span className="truncate mr-1">{cond}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Biometric Biomarker Inputs with Dynamic Status Chips */}
            <div className="space-y-3 pt-1">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
                Latest Diagnostic Blood Report Values (With Reference Status)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Vitamin B12 */}
                <div className="p-3 bg-[#1C1C1E] rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Vitamin B12</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getB12Status(parseFloat(b12Str) || 0).color}`}>
                      {getB12Status(parseFloat(b12Str) || 0).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={b12Str}
                      onChange={(e) => setB12Str(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="--"
                      className="w-24 bg-neutral-800 border border-white/10 rounded-xl px-2.5 py-1 text-sm font-bold text-white outline-none tabular-nums"
                    />
                    <span className="text-xs text-neutral-400 font-mono">pg/mL (Optimal: 350-900)</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">Supports nerve myelin and energy. Low causes lethargy and brain fog.</p>
                </div>

                {/* 2. Vitamin D3 */}
                <div className="p-3 bg-[#1C1C1E] rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Vitamin D3</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getD3Status(parseFloat(d3Str) || 0).color}`}>
                      {getD3Status(parseFloat(d3Str) || 0).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={d3Str}
                      onChange={(e) => setD3Str(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="--"
                      className="w-24 bg-neutral-800 border border-white/10 rounded-xl px-2.5 py-1 text-sm font-bold text-white outline-none tabular-nums"
                    />
                    <span className="text-xs text-neutral-400 font-mono">ng/mL (Optimal: 30-70)</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">Regulates insulin sensitivity. Low levels cause stubborn belly fat retention.</p>
                </div>

                {/* 3. HbA1c */}
                <div className="p-3 bg-[#1C1C1E] rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">HbA1c (Blood Sugar)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getHbA1cStatus(parseFloat(hba1cStr) || 0).color}`}>
                      {getHbA1cStatus(parseFloat(hba1cStr) || 0).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={hba1cStr}
                      onChange={(e) => setHba1cStr(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="--"
                      className="w-24 bg-neutral-800 border border-white/10 rounded-xl px-2.5 py-1 text-sm font-bold text-white outline-none tabular-nums"
                    />
                    <span className="text-xs text-neutral-400 font-mono">% (Normal: &lt;5.7%)</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">3-month glucose average. 5.7-6.4% indicates pre-diabetes.</p>
                </div>

                {/* 4. Liver Enzyme ALT/SGPT */}
                <div className="p-3 bg-[#1C1C1E] rounded-2xl border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">ALT / SGPT (Liver)</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getAltStatus(parseFloat(altStr) || 0).color}`}>
                      {getAltStatus(parseFloat(altStr) || 0).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={altStr}
                      onChange={(e) => setAltStr(e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="--"
                      className="w-24 bg-neutral-800 border border-white/10 rounded-xl px-2.5 py-1 text-sm font-bold text-white outline-none tabular-nums"
                    />
                    <span className="text-xs text-neutral-400 font-mono">U/L (Healthy: &lt;35)</span>
                  </div>
                  <p className="text-[10px] text-neutral-400">Liver enzyme marker. Over 45 indicates liver inflammation or Fatty Liver.</p>
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
              <p className="text-xs text-neutral-300 max-w-md mx-auto">
                Your clinical engine has calibrated your exact daily negative calorie budget and tailored your Indian meals.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-emerald-500/40 text-center space-y-1">
                <Zap className="w-5 h-5 text-emerald-400 mx-auto" />
                <span className="text-lg font-bold text-white">+100 XP</span>
                <span className="text-[10px] text-neutral-400 block">Starter Bonus</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#1C1C1E] border border-purple-500/40 text-center space-y-1">
                <ShieldCheck className="w-5 h-5 text-purple-400 mx-auto" />
                <span className="text-xs font-bold text-purple-300 block">Badge Unlocked</span>
                <span className="text-[10px] text-neutral-400 block">Pioneer Health Hero</span>
              </div>
            </div>

            <p className="text-xs text-neutral-400">
              Your realistic anatomical avatar and clinical guidance are now ready on your dashboard.
            </p>
          </div>
        )}

        {/* Layman (i) Info Popup Modal */}
        {activeInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#1C1C1E] border border-white/20 rounded-2xl p-5 max-w-md space-y-3 shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Clinical Layman Insight</span>
                </span>
                <button
                  onClick={() => setActiveInfoModal(null)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-neutral-200 leading-relaxed">{activeInfoModal}</p>
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-xs font-bold"
              >
                Got It
              </button>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          {step > 1 && step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs transition-all"
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
