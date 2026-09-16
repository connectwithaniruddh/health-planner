import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Sparkles, HeartPulse, ShieldAlert, Zap, Flame, Award, Info, X } from 'lucide-react';

export const HumanAvatarWidget: React.FC = () => {
  const { store } = useAppStore();
  const [selectedZone, setSelectedZone] = useState<'liver' | 'heart' | 'core' | 'muscles' | null>(null);

  const conditions = store.profile.medicalConditions.map((c) => c.toLowerCase());
  const hasFattyLiver = conditions.some((c) => c.includes('fatty liver'));
  const hasDiabetes = conditions.some((c) => c.includes('diabet'));
  const hasHypertension = conditions.some((c) => c.includes('hypertension'));

  const streak = store.gamification.streakDays;
  const level = store.gamification.level;
  const xp = store.gamification.totalXp;

  // Metabolic Zone Colors
  const liverColor = hasFattyLiver ? '#FF375F' : store.fastingState?.isFasting ? '#30D158' : '#FF9F0A';
  const heartColor = hasHypertension ? '#FF9F0A' : '#FF375F';
  const coreColor = '#FF9F0A';
  const muscleColor = '#64D2FF';

  return (
    <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/10 backdrop-blur-2xl relative overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      {/* Dynamic Ambient Aura Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: store.fastingState?.isFasting ? '#30D158' : '#64D2FF' }}
      />

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-rounded">Metabolic Body Avatar</h3>
            <p className="text-[11px] text-slate-400">Interactive organ & body composition status</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-bold text-white">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span>Level {level} • {streak}d Streak</span>
        </div>
      </div>

      {/* Interactive Anatomical SVG Human Silhouette */}
      <div className="relative my-4 flex items-center justify-center">
        <svg className="w-48 h-64 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" viewBox="0 0 200 320">
          {/* Glowing Aura Ring */}
          <ellipse
            cx="100"
            cy="160"
            rx="80"
            ry="140"
            fill="none"
            stroke={store.fastingState?.isFasting ? '#30D158' : '#00F0FF'}
            strokeWidth="1.5"
            strokeDasharray="6 4"
            opacity="0.3"
            className="animate-spin"
            style={{ animationDuration: '30s' }}
          />

          {/* Head & Neck */}
          <circle cx="100" cy="40" r="22" fill="#1C1C1E" stroke="#3A3A3C" strokeWidth="2" />
          <path d="M 94 62 L 94 72 L 106 72 L 106 62 Z" fill="#1C1C1E" />

          {/* Torso & Shoulders */}
          <path
            d="M 60 76 Q 100 68 140 76 L 132 170 Q 100 180 68 170 Z"
            fill="#1C1C1E"
            stroke="#2C2C2E"
            strokeWidth="2"
          />

          {/* Left Arm & Bicep */}
          <path
            d="M 60 76 L 40 140 L 46 190 L 52 190 L 50 144 L 66 84 Z"
            fill="#1C1C1E"
            stroke={muscleColor}
            strokeWidth="1"
            strokeOpacity="0.4"
            onClick={() => setSelectedZone('muscles')}
            className="cursor-pointer hover:opacity-80 transition-all"
          />

          {/* Right Arm & Bicep */}
          <path
            d="M 140 76 L 160 140 L 154 190 L 148 190 L 150 144 L 134 84 Z"
            fill="#1C1C1E"
            stroke={muscleColor}
            strokeWidth="1"
            strokeOpacity="0.4"
            onClick={() => setSelectedZone('muscles')}
            className="cursor-pointer hover:opacity-80 transition-all"
          />

          {/* Pelvis & Legs */}
          <path
            d="M 68 170 L 64 250 L 62 300 L 76 300 L 84 250 L 96 180 Z"
            fill="#1C1C1E"
            stroke="#2C2C2E"
            strokeWidth="1.5"
          />
          <path
            d="M 132 170 L 136 250 L 138 300 L 124 300 L 116 250 L 104 180 Z"
            fill="#1C1C1E"
            stroke="#2C2C2E"
            strokeWidth="1.5"
          />

          {/* --- INTERACTIVE ORGAN HOTSPOTS --- */}

          {/* 1. Heart / Cardio Zone (Chest Left) */}
          <g onClick={() => setSelectedZone('heart')} className="cursor-pointer group">
            <circle cx="94" cy="98" r="10" fill={`${heartColor}30`} stroke={heartColor} strokeWidth="2" className="animate-pulse" />
            <circle cx="94" cy="98" r="4" fill={heartColor} />
            <text x="94" y="99" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="6">🫀</text>
          </g>

          {/* 2. Liver Zone (Right Hypochondrium) */}
          <g onClick={() => setSelectedZone('liver')} className="cursor-pointer group">
            <ellipse cx="112" cy="116" rx="14" ry="9" fill={`${liverColor}35`} stroke={liverColor} strokeWidth="2" />
            <circle cx="112" cy="116" r="4" fill={liverColor} className="animate-ping" style={{ animationDuration: '3s' }} />
            <text x="112" y="117" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="7">🧬</text>
          </g>

          {/* 3. Visceral Fat Core (Umbilical Zone) */}
          <g onClick={() => setSelectedZone('core')} className="cursor-pointer group">
            <circle cx="100" cy="142" r="11" fill={`${coreColor}25`} stroke={coreColor} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="100" cy="142" r="4" fill={coreColor} />
            <text x="100" y="143" textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="6">⚡</text>
          </g>
        </svg>

        {/* Hotspot Legend Chips */}
        <div className="absolute right-0 top-2 flex flex-col gap-1.5 text-[10px]">
          <button
            onClick={() => setSelectedZone('liver')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-800/90 border border-white/10 hover:border-emerald-400 text-slate-300 transition-all"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: liverColor }} />
            <span>Liver (NAFLD)</span>
          </button>
          <button
            onClick={() => setSelectedZone('heart')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-800/90 border border-white/10 hover:border-rose-400 text-slate-300 transition-all"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: heartColor }} />
            <span>Cardio / BP</span>
          </button>
          <button
            onClick={() => setSelectedZone('core')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-800/90 border border-white/10 hover:border-amber-400 text-slate-300 transition-all"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: coreColor }} />
            <span>Visceral Fat</span>
          </button>
          <button
            onClick={() => setSelectedZone('muscles')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-800/90 border border-white/10 hover:border-cyan-400 text-slate-300 transition-all"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: muscleColor }} />
            <span>Lean Muscle</span>
          </button>
        </div>
      </div>

      {/* Interactive Micro-Modal Popover for Selected Zone */}
      {selectedZone && (
        <div className="p-3.5 rounded-2xl bg-neutral-800/90 border border-white/20 backdrop-blur-xl text-xs space-y-1.5 animate-fadeIn z-20">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              {selectedZone === 'liver' && '🧬 Hepatic & Liver Health'}
              {selectedZone === 'heart' && '🫀 Cardiovascular & Endothelial Health'}
              {selectedZone === 'core' && '⚡ Visceral Adipose & Calorie Deficit'}
              {selectedZone === 'muscles' && '💪 Skeletal Muscle & Protein Synthesis'}
            </span>
            <button onClick={() => setSelectedZone(null)} className="text-slate-400 hover:text-white p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-300 text-[11px] leading-relaxed">
            {selectedZone === 'liver' && (
              <>
                {hasFattyLiver
                  ? '⚠️ Active Fatty Liver alert: Hepatic steatosis requires zero added fructose, 16:8 fasting, and choline-rich cruciferous vegetables to clear liver lipid accumulation.'
                  : '🟢 Optimal Hepatic State: Your liver glycogen is steadily depleted during fasting windows, stimulating autophagic lipolysis.'}
              </>
            )}
            {selectedZone === 'heart' && (
              <>
                Cardiovascular tone is sustained by brisk walking (30 mins daily) and potassium-rich Indian foods (cucumber, coconut water, tomato) to balance vascular resistance.
              </>
            )}
            {selectedZone === 'core' && (
              <>
                Visceral fat responds primarily to sustained daily caloric deficits and lowering high-GI insulin spikes. Every 7,700 kcal deficit burns ~1kg of adipose tissue.
              </>
            )}
            {selectedZone === 'muscles' && (
              <>
                Maintain 1.6-1.8g protein per kg of body weight (paneer, moong dal, roasted chana) to prevent sarcopenic lean mass loss during weight reduction.
              </>
            )}
          </p>
        </div>
      )}

      {/* Footer Level Progress */}
      <div className="flex items-center justify-between text-xs pt-3 border-t border-white/10 z-10">
        <span className="text-slate-400">Total Deficit Energy</span>
        <span className="font-bold text-emerald-400 font-rounded tabular-nums">{xp} XP Earned</span>
      </div>
    </div>
  );
};
