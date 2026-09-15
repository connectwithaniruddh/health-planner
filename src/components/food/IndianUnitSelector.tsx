import React from 'react';
import { KATORI_VOLUMES } from '../../config/constants';
import { Minus, Plus } from 'lucide-react';

interface IndianUnitSelectorProps {
  quantity: number;
  setQuantity: (val: number) => void;
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
  unitOptions: Array<{ unit_name: string; gram_weight: number; is_default: boolean }>;
  oilLevel: 'low' | 'standard' | 'restaurant';
  setOilLevel: (level: 'low' | 'standard' | 'restaurant') => void;
}

export const IndianUnitSelector: React.FC<IndianUnitSelectorProps> = ({
  quantity,
  setQuantity,
  selectedUnit,
  setSelectedUnit,
  unitOptions,
  oilLevel,
  setOilLevel,
}) => {
  return (
    <div className="space-y-4">
      {/* Unit Selection Pills */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Serving Unit Standard
        </label>
        <div className="flex flex-wrap gap-2">
          {unitOptions.map((opt) => (
            <button
              key={opt.unit_name}
              type="button"
              onClick={() => setSelectedUnit(opt.unit_name)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedUnit === opt.unit_name
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {opt.unit_name}
            </button>
          ))}
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
        <span className="text-xs font-medium text-slate-300">Quantity</span>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(0.25, quantity - 0.25))}
            className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-lg font-bold font-rounded tabular-nums text-white w-12 text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 0.25)}
            className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center font-bold"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Oil & Ghee Intensity Selector (Desi Home Cooking) */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
          Tadka / Oil & Ghee Intensity
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setOilLevel('low')}
            className={`p-2.5 rounded-xl text-center text-xs transition-all ${
              oilLevel === 'low'
                ? 'bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 font-semibold'
                : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Low Oil (+20 kcal)
          </button>
          <button
            type="button"
            onClick={() => setOilLevel('standard')}
            className={`p-2.5 rounded-xl text-center text-xs transition-all ${
              oilLevel === 'standard'
                ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300 font-semibold'
                : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Standard Home (+40 kcal)
          </button>
          <button
            type="button"
            onClick={() => setOilLevel('restaurant')}
            className={`p-2.5 rounded-xl text-center text-xs transition-all ${
              oilLevel === 'restaurant'
                ? 'bg-orange-600/30 border border-orange-500/50 text-orange-300 font-semibold'
                : 'bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:bg-slate-800'
            }`}
          >
            Rich / Hotel (+120 kcal)
          </button>
        </div>
      </div>
    </div>
  );
};
