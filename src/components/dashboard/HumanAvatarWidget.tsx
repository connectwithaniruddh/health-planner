import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, HeartPulse, ShieldAlert, Zap, Flame, Award, Info, X, CheckCircle2 } from 'lucide-react';

export const HumanAvatarWidget: React.FC = () => {
  const { store } = useAppStore();
  const [selectedZone, setSelectedZone] = useState<'liver' | 'heart' | 'core' | 'muscles' | null>(null);

  const conditions = store.profile.medicalConditions.map((c) => c.toLowerCase());
  const hasFattyLiver = conditions.some((c) => c.includes('fatty liver') || c.includes('nafld'));
  const hasDiabetes = conditions.some((c) => c.includes('diabet'));
  const hasHypertension = conditions.some((c) => c.includes('hypertension'));

  const streak = store.gamification.streakDays;
  const level = store.gamification.level;
  const xp = store.gamification.totalXp;

  // Metabolic Zone Colors
  const liverColor = hasFattyLiver ? '#FF453A' : store.fastingState?.isFasting ? '#30D158' : '#FF9F0A';
  const heartColor = hasHypertension ? '#FF9F0A' : '#FF2D55';
  const coreColor = '#FF9F0A';
  const muscleColor = '#64D2FF';

  return (
    <div className="p-6 rounded-3xl bg-[#161618] border border-white/10 backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
      {/* Dynamic Ambient Aura Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: store.fastingState?.isFasting ? '#30D158' : '#64D2FF' }}
      />

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-rounded">Metabolic Body Scan</h3>
            <p className="text-[11px] text-neutral-400">Anatomical organ & visceral fat visualization</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Level {level} • {streak}d Streak</span>
        </div>
      </div>

      {/* Realistic Anatomical Human Figure */}
      <div className="relative my-4 flex items-center justify-center min-h-[300px]">
        <svg className="w-56 h-80 filter drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]" viewBox="0 0 240 360">
          <defs>
            {/* Linear gradient for realistic human musculature silhouette */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2C2C2E" />
              <stop offset="50%" stopColor="#1C1C1E" />
              <stop offset="100%" stopColor="#161618" />
            </linearGradient>

            {/* Subtle muscle contour gradient */}
            <linearGradient id="muscleShading" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3A3A3C" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#48484A" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#3A3A3C" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Biological Energy Field (Apple Watch Activity Ring Style) */}
          <ellipse
            cx="120"
            cy="180"
            rx="95"
            ry="155"
            fill="none"
            stroke={store.fastingState?.isFasting ? '#30D158' : '#64D2FF'}
            strokeWidth="1.5"
            strokeDasharray="8 6"
            opacity="0.25"
          />

          {/* --- REALISTIC ANATOMICAL HUMAN BODY PATH --- */}
          <path
            d="
              M 120,20
              C 133,20 142,30 142,46
              C 142,60 135,68 131,74
              C 140,78 156,83 172,94
              C 177,98 181,105 180,114
              C 178,126 172,148 169,165
              C 166,182 163,205 162,220
              C 161,226 156,230 152,228
              C 148,226 149,218 151,206
              C 154,190 156,170 158,154
              C 152,158 144,166 142,176
              C 140,192 143,206 146,224
              C 149,242 153,266 153,290
              C 153,308 148,326 145,342
              C 144,346 138,348 134,346
              C 130,344 131,338 133,326
              C 136,310 137,294 135,278
              C 133,260 128,242 126,228
              C 124,218 122,212 120,210
              C 118,212 116,218 114,228
              C 112,242 107,260 105,278
              C 103,294 104,310 107,326
              C 109,338 110,344 106,346
              C 102,348 96,346 95,342
              C 92,326 87,308 87,290
              C 87,266 91,242 94,224
              C 97,206 100,192 98,176
              C 96,166 88,158 82,154
              C 84,170 86,190 89,206
              C 91,218 92,226 88,228
              C 84,230 79,226 78,220
              C 77,205 74,182 71,165
              C 68,148 62,126 60,114
              C 59,105 63,98 68,94
              C 84,83 100,78 109,74
              C 105,68 98,60 98,46
              C 98,30 107,20 120,20 Z
            "
            fill="url(#bodyGradient)"
            stroke="#3A3A3C"
            strokeWidth="1.5"
          />

          {/* Clavicle & Pectoral Muscle Contours */}
          <path d="M 100,78 Q 120,84 140,78" fill="none" stroke="#48484A" strokeWidth="1.2" opacity="0.6" />
          <path d="M 102,96 Q 112,106 120,106 Q 128,106 138,96" fill="none" stroke="#48484A" strokeWidth="1" opacity="0.5" />

          {/* Abdominal Rectus Line (Core Definition) */}
          <line x1="120" y1="106" x2="120" y2="175" stroke="#3A3A3C" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          <path d="M 112,130 Q 120,133 128,130" fill="none" stroke="#3A3A3C" strokeWidth="1" opacity="0.5" />
          <path d="M 113,150 Q 120,153 127,150" fill="none" stroke="#3A3A3C" strokeWidth="1" opacity="0.5" />

          {/* --- ANATOMICALLY ACCURATE ORGAN HOTSPOTS --- */}

          {/* 1. Heart Center (Left Thoracic Cavity) */}
          <g onClick={() => setSelectedZone('heart')} className="cursor-pointer group">
            <ellipse cx="114" cy="102" rx="11" ry="12" fill={`${heartColor}20`} stroke={heartColor} strokeWidth="1.5" className="animate-pulse" />
            <circle cx="114" cy="102" r="5" fill={heartColor} />
            <text x="114" y="103" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8">🫀</text>
          </g>

          {/* 2. Anatomical Liver (Right Upper Quadrant) */}
          <g onClick={() => setSelectedZone('liver')} className="cursor-pointer group">
            {/* Realistic anatomical wedge of human liver */}
            <path
              d="M 124,116 Q 139,114 142,122 Q 143,134 135,138 Q 122,138 123,126 Z"
              fill={`${liverColor}30`}
              stroke={liverColor}
              strokeWidth="2"
              className="transition-all hover:scale-105"
            />
            <circle cx="132" cy="126" r="3.5" fill={liverColor} className="animate-ping" style={{ animationDuration: '3s' }} />
            <text x="132" y="127" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="7">🧬</text>
          </g>

          {/* 3. Visceral Fat & Metabolic Core (Umbilical Cavity) */}
          <g onClick={() => setSelectedZone('core')} className="cursor-pointer group">
            <ellipse cx="120" cy="155" rx="15" ry="10" fill={`${coreColor}25`} stroke={coreColor} strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="120" cy="155" r="4" fill={coreColor} />
            <text x="120" y="156" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="7">⚡</text>
          </g>

          {/* 4. Musculoskeletal Frame Hotspots (Biceps & Deltoids) */}
          <g onClick={() => setSelectedZone('muscles')} className="cursor-pointer group">
            <ellipse cx="69" cy="118" rx="6" ry="12" fill={`${muscleColor}20`} stroke={muscleColor} strokeWidth="1" />
            <ellipse cx="171" cy="118" rx="6" ry="12" fill={`${muscleColor}20`} stroke={muscleColor} strokeWidth="1" />
            <ellipse cx="106" cy="245" rx="8" ry="16" fill={`${muscleColor}15`} stroke={muscleColor} strokeWidth="1" />
            <ellipse cx="134" cy="245" rx="8" ry="16" fill={`${muscleColor}15`} stroke={muscleColor} strokeWidth="1" />
          </g>
        </svg>

        {/* Anatomical Organ Chips with (i) Layman Info Triggers */}
        <div className="absolute right-0 top-2 flex flex-col gap-2 text-xs">
          <button
            onClick={() => setSelectedZone('liver')}
            className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              selectedZone === 'liver'
                ? 'bg-neutral-800 border-rose-400 text-white shadow-md'
                : 'bg-[#1C1C1E] border-white/10 hover:border-white/20 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: liverColor }} />
              <span className="font-semibold text-[11px]">Liver (NAFLD)</span>
            </div>
            <Info className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <button
            onClick={() => setSelectedZone('heart')}
            className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              selectedZone === 'heart'
                ? 'bg-neutral-800 border-rose-400 text-white shadow-md'
                : 'bg-[#1C1C1E] border-white/10 hover:border-white/20 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: heartColor }} />
              <span className="font-semibold text-[11px]">Cardio / BP</span>
            </div>
            <Info className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <button
            onClick={() => setSelectedZone('core')}
            className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              selectedZone === 'core'
                ? 'bg-neutral-800 border-amber-400 text-white shadow-md'
                : 'bg-[#1C1C1E] border-white/10 hover:border-white/20 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: coreColor }} />
              <span className="font-semibold text-[11px]">Visceral Fat</span>
            </div>
            <Info className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <button
            onClick={() => setSelectedZone('muscles')}
            className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              selectedZone === 'muscles'
                ? 'bg-neutral-800 border-cyan-400 text-white shadow-md'
                : 'bg-[#1C1C1E] border-white/10 hover:border-white/20 text-neutral-300'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: muscleColor }} />
              <span className="font-semibold text-[11px]">Muscle Tone</span>
            </div>
            <Info className="w-3.5 h-3.5 text-neutral-400" />
          </button>
        </div>
      </div>

      {/* Layman (i) Clinical Micro-Guide Popover */}
      {selectedZone && (
        <div className="p-4 rounded-2xl bg-[#1C1C1E] border border-white/15 backdrop-blur-2xl text-xs space-y-2 animate-fadeIn z-20 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs uppercase tracking-wider">
                {selectedZone === 'liver' && '🧬 Liver Health (NAFLD Explained Simply)'}
                {selectedZone === 'heart' && '🫀 Heart & Blood Flow in Layman Terms'}
                {selectedZone === 'core' && '⚡ Visceral Fat & Belly Deficit'}
                {selectedZone === 'muscles' && '💪 Lean Muscle & Protein Protection'}
              </span>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="text-neutral-300 text-xs leading-relaxed space-y-1.5">
            {selectedZone === 'liver' && (
              <>
                <p>
                  <strong>What is Fatty Liver (NAFLD)?</strong> Think of your liver as a storage battery. When we eat excess sugar, maida, or deep-fried food, the liver packs excess energy into fat droplets inside its own cells.
                </p>
                <p className="text-emerald-400">
                  <strong>How to reverse it:</strong> Clinical studies show losing 7-10% of body weight completely removes this fat. Intermittent Fasting (16:8) is powerful because after 12 hours without food, the liver is forced to burn its own stored fat (lipophagy) to clean itself.
                </p>
              </>
            )}

            {selectedZone === 'heart' && (
              <>
                <p>
                  <strong>Blood Pressure & Cardio:</strong> High salt and stress make blood vessels stiff like narrow pipes, forcing your heart to pump harder.
                </p>
                <p className="text-cyan-400">
                  <strong>Daily habit:</strong> Eating potassium-rich cucumber, tomato salad, and coconut water naturally flushes excess salt out through your kidneys.
                </p>
              </>
            )}

            {selectedZone === 'core' && (
              <>
                <p>
                  <strong>Visceral vs. Subcutaneous Fat:</strong> Visceral fat is the deep fat packed around internal organs. It releases inflammatory hormones that trigger insulin resistance.
                </p>
                <p className="text-amber-300">
                  <strong>The solution:</strong> Visceral fat is the first fat to burn when you maintain a consistent daily calorie deficit (e.g. 500 kcal/day negative).
                </p>
              </>
            )}

            {selectedZone === 'muscles' && (
              <>
                <p>
                  <strong>Why Muscle Matters:</strong> Muscles are your calorie-burning furnace. When losing weight, your body can accidentally burn muscle instead of fat if you don't eat enough protein.
                </p>
                <p className="text-cyan-300">
                  <strong>Target:</strong> Aim for 1.6-1.8g protein per kg (paneer, moong dal chilla, sattu, roasted chana) to preserve muscle while shedding pure fat.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer Level Progress */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10 z-10">
        <span className="text-neutral-400">Total Deficit Energy</span>
        <span className="font-bold text-emerald-400 font-mono tabular-nums">{xp} XP Earned</span>
      </div>
    </div>
  );
};
