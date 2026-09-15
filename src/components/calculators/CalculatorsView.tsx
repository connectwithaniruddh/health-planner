import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import metTableData from '../../data/metTable.json';
import { calculateBMI, calculateBMR, calculateTDEE, calculateTargetDate, calculateNetExerciseBurn } from '../../utils/calculations';
import { Calculator, Flame, Scale, Calendar, Dumbbell, Activity } from 'lucide-react';

export const CalculatorsView: React.FC = () => {
  const { store, logExercise } = useAppStore();

  // State for BMI/BMR/TDEE Calculator
  const [weightKg, setWeightKg] = useState(store.profile.currentWeightKg);
  const [heightCm, setHeightCm] = useState(store.profile.heightCm);
  const [age, setAge] = useState(store.profile.age);
  const [gender, setGender] = useState(store.profile.gender);
  const [activityLevel, setActivityLevel] = useState(store.profile.activityLevel);

  // State for Target Date Estimator
  const [targetWeightKg, setTargetWeightKg] = useState(store.profile.targetWeightKg);
  const [dailyDeficitKcal, setDailyDeficitKcal] = useState(500);

  // State for Exercise Burn Calculator
  const [selectedActivityId, setSelectedActivityId] = useState(metTableData[0].activityId);
  const [durationMinutes, setDurationMinutes] = useState(30);

  const bmiInfo = calculateBMI(weightKg, heightCm);
  const bmrVal = calculateBMR({ weightKg, heightCm, age, gender });
  const tdeeVal = calculateTDEE(bmrVal, activityLevel);

  const targetDateInfo = calculateTargetDate(weightKg, targetWeightKg, dailyDeficitKcal);

  const selectedActivityObj = metTableData.find((a) => a.activityId === selectedActivityId) || metTableData[0];
  const netBurnVal = calculateNetExerciseBurn(selectedActivityObj.met, weightKg, durationMinutes);

  const handleLogExerciseNow = async () => {
    await logExercise({
      activityName: selectedActivityObj.name,
      metValue: selectedActivityObj.met,
      durationMinutes,
      grossCaloriesBurned: Math.round(selectedActivityObj.met * weightKg * (durationMinutes / 60)),
      netCaloriesBurned: netBurnVal,
    });
    alert(`Logged ${selectedActivityObj.name} (${netBurnVal} net kcal) to today's diary!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-rounded text-white">Weight Loss Tools & Calculators</h2>
          <p className="text-xs text-slate-400">Clinical formulas (Mifflin-St Jeor, Asian ICMR BMI, MET Exercise Burn)</p>
        </div>
      </div>

      {/* Grid 1: BMI Spectrum Gauge & BMR/TDEE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BMI Spectrum Card */}
        <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Body Mass Index (BMI)</span>
            <span
              className="px-3 py-1 rounded-full text-xs font-bold border"
              style={{
                borderColor: `${bmiInfo.colorHex}40`,
                backgroundColor: `${bmiInfo.colorHex}15`,
                color: bmiInfo.colorHex,
              }}
            >
              {bmiInfo.asianCategory} (Asian ICMR)
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold font-rounded tabular-nums text-white">{bmiInfo.bmi}</span>
            <span className="text-xs text-slate-400">kg/m²</span>
          </div>

          {/* BMI Spectrum Visual Bar */}
          <div className="space-y-1">
            <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 border border-slate-700/50">
              <div className="w-[20%] bg-cyan-400 h-full" title="Underweight (<18.5)" />
              <div className="w-[30%] bg-emerald-400 h-full" title="Normal (18.5-22.9)" />
              <div className="w-[20%] bg-yellow-400 h-full" title="Overweight (23-24.9)" />
              <div className="w-[30%] bg-red-500 h-full" title="Obese (>=25)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
              <span>18.5</span>
              <span>23.0 (Asian cutoff)</span>
              <span>25.0</span>
              <span>30.0</span>
            </div>
          </div>
        </div>

        {/* BMR & TDEE Card */}
        <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Metabolic Energy Expenditure</span>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 text-center space-y-1">
              <span className="text-xs font-semibold text-slate-400">Basal Metabolic (BMR)</span>
              <p className="text-3xl font-bold font-rounded tabular-nums text-white">{bmrVal}</p>
              <span className="text-[10px] text-slate-500">kcal / day resting</span>
            </div>

            <div className="p-4 rounded-3xl bg-slate-800/50 border border-slate-700/40 text-center space-y-1">
              <span className="text-xs font-semibold text-blue-400">TDEE Daily Energy</span>
              <p className="text-3xl font-bold font-rounded tabular-nums text-blue-400">{tdeeVal}</p>
              <span className="text-[10px] text-slate-500">kcal / day maintenance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid 2: Target Date Estimator & MET Exercise Burn */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Target Date Estimator */}
        <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Weight Goal Target Date Estimator</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Weight (kg):</span>
              <input
                type="number"
                value={targetWeightKg}
                onChange={(e) => setTargetWeightKg(Number(e.target.value))}
                className="w-20 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-center text-white font-bold"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Daily Calorie Deficit (kcal):</span>
              <select
                value={dailyDeficitKcal}
                onChange={(e) => setDailyDeficitKcal(Number(e.target.value))}
                className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
              >
                <option value={250}>250 kcal (Mild ~0.25kg/wk)</option>
                <option value={500}>500 kcal (Moderate ~0.5kg/wk)</option>
                <option value={750}>750 kcal (Aggressive ~0.75kg/wk)</option>
              </select>
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
            <span className="text-xs text-amber-300 font-medium">Estimated Achievement Date</span>
            <p className="text-2xl font-bold font-rounded text-white">{targetDateInfo.estimatedDate}</p>
            <span className="text-[10px] text-slate-400">
              ~{targetDateInfo.daysNeeded} days (includes metabolic adaptation buffer)
            </span>
          </div>
        </div>

        {/* MET Exercise Burn Calculator */}
        <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400">
              <Dumbbell className="w-5 h-5" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">MET Exercise Burn Calculator</h3>
            </div>
            <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              MET: {selectedActivityObj.met}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Select Activity (Includes Indian Tasks):</label>
              <select
                value={selectedActivityId}
                onChange={(e) => setSelectedActivityId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
              >
                {metTableData.map((act) => (
                  <option key={act.activityId} value={act.activityId}>
                    {act.name} ({act.intensity})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Duration (Minutes):</span>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-24 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl text-center text-white font-bold"
              />
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
            <div>
              <span className="text-xs text-cyan-300 font-medium">Calculated Net Active Burn</span>
              <p className="text-2xl font-bold font-rounded text-white tabular-nums">{netBurnVal} net kcal</p>
            </div>
            <button
              onClick={handleLogExerciseNow}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
            >
              Log to Diary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
