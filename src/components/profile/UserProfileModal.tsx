import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { UserProfile } from '../../schemas/store.schema';
import { User, ShieldAlert, HeartPulse, Sparkles, Check } from 'lucide-react';

export const UserProfileModal: React.FC = () => {
  const { store, updateProfile } = useAppStore();
  const profile = store.profile;

  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: profile.name,
    gender: profile.gender,
    age: profile.age,
    heightCm: profile.heightCm,
    currentWeightKg: profile.currentWeightKg,
    targetWeightKg: profile.targetWeightKg,
    weeklyTargetKg: profile.weeklyTargetKg,
    activityLevel: profile.activityLevel,
    medicalConditions: profile.medicalConditions || [],
    dietaryRestrictions: profile.dietaryRestrictions || [],
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const medicalConditionOptions = [
    'Hypertension (High BP)',
    'Type 2 Diabetes',
    'PCOD / PCOS',
    'Thyroid (Hypothyroidism)',
    'High Cholesterol',
    'Fatty Liver',
  ];

  const dietaryOptions = ['Vegetarian', 'Vegan', 'Eggetarian', 'Non-Vegetarian', 'Jain', 'Low Sodium', 'Keto Desi'];

  const toggleCondition = (cond: string) => {
    const list = formData.medicalConditions || [];
    const newList = list.includes(cond) ? list.filter((c) => c !== cond) : [...list, cond];
    setFormData({ ...formData, medicalConditions: newList });
  };

  const toggleDietary = (diet: string) => {
    const list = formData.dietaryRestrictions || [];
    const newList = list.includes(diet) ? list.filter((d) => d !== diet) : [...list, diet];
    setFormData({ ...formData, dietaryRestrictions: newList });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-rounded text-white">User Profile & Clinical Settings</h2>
            <p className="text-xs text-slate-400">Biometrics, target goals, dietary restrictions & medical profile</p>
          </div>
        </div>

        {savedSuccess && (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Check className="w-4 h-4" /> Profile Updated!
          </span>
        )}
      </div>

      {/* Basic Demographics */}
      <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Personal Demographics</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Full Name:</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Gender:</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Age (Years):</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* Biometrics & Weight Loss Target */}
      <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Biometrics & Target Loss Speed</h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Height (cm):</label>
            <input
              type="number"
              value={formData.heightCm}
              onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Current Weight (kg):</label>
            <input
              type="number"
              value={formData.currentWeightKg}
              onChange={(e) => setFormData({ ...formData, currentWeightKg: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Target Weight (kg):</label>
            <input
              type="number"
              value={formData.targetWeightKg}
              onChange={(e) => setFormData({ ...formData, targetWeightKg: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Weekly Speed (kg/wk):</label>
            <select
              value={formData.weeklyTargetKg}
              onChange={(e) => setFormData({ ...formData, weeklyTargetKg: e.target.value as any })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
            >
              <option value="0.25">0.25 kg/wk (Mild)</option>
              <option value="0.50">0.50 kg/wk (Moderate)</option>
              <option value="0.75">0.75 kg/wk (Aggressive)</option>
              <option value="1.00">1.00 kg/wk (Max Safe)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Clinical Profile & Dietary Restrictions */}
      <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-2 text-rose-400">
          <HeartPulse className="w-5 h-5" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-200">Clinical Conditions & Dietary Preferences</h3>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-2 font-medium">Medical Conditions Tag:</label>
            <div className="flex flex-wrap gap-2">
              {medicalConditionOptions.map((cond) => {
                const isSelected = (formData.medicalConditions || []).includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                      isSelected
                        ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:bg-slate-700'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-slate-400 mb-2 font-medium">Dietary Restrictions & Preferences:</label>
            <div className="flex flex-wrap gap-2">
              {dietaryOptions.map((diet) => {
                const isSelected = (formData.dietaryRestrictions || []).includes(diet);
                return (
                  <button
                    key={diet}
                    type="button"
                    onClick={() => toggleDietary(diet)}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:bg-slate-700'
                    }`}
                  >
                    {diet}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-4 rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400 text-white font-bold text-sm shadow-xl shadow-blue-500/25 active:scale-98 transition-all flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5" />
        <span>Save Profile & Recalculate Clinical Targets</span>
      </button>
    </form>
  );
};
