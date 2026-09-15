import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { calculate7DayMovingAverage } from '../../utils/calculations';
import { FileText, Printer, TrendingDown, Activity, Plus, Trash2 } from 'lucide-react';

export const HealthReportView: React.FC = () => {
  const { store, addMedicalMarker, deleteMedicalMarker } = useAppStore();
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  // Medical marker form state
  const [newMarkerName, setNewMarkerName] = useState('Vitamin D3');
  const [newMarkerValue, setNewMarkerValue] = useState(28);
  const [newMarkerUnit, setNewMarkerUnit] = useState('ng/mL');
  const [newMarkerStatus, setNewMarkerStatus] = useState<'optimal' | 'normal' | 'borderline' | 'critical_low' | 'critical_high'>('borderline');

  const dailyLogsArray = Object.values(store.dailyLogs).sort((a, b) => a.date.localeCompare(b.date));
  const loggedWeights = dailyLogsArray.map((l) => l.weightKg).filter((w): w is number => typeof w === 'number');
  const movingAvg7Day = calculate7DayMovingAverage(loggedWeights);

  const startWeight = loggedWeights[0] || store.profile.currentWeightKg;
  const latestWeight = loggedWeights[loggedWeights.length - 1] || store.profile.currentWeightKg;
  const netDeltaKg = parseFloat((latestWeight - startWeight).toFixed(1));

  const handleAddMarker = async () => {
    await addMedicalMarker({
      markerName: newMarkerName,
      markerKey: newMarkerName.toLowerCase().replace(/\s+/g, '_'),
      value: newMarkerValue,
      unit: newMarkerUnit,
      status: newMarkerStatus,
      testDate: new Date().toISOString().split('T')[0],
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-rounded text-white">Health Progress Report</h2>
            <p className="text-xs text-slate-400">7DMA weight smoothing, compliance analytics & medical lab panel</p>
          </div>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl text-center space-y-1">
          <span className="text-xs font-semibold text-slate-400">Current Weight (7DMA)</span>
          <p className="text-3xl font-bold font-rounded text-white tabular-nums">{movingAvg7Day} kg</p>
          <span className="text-[10px] text-slate-500">7-day moving average</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl text-center space-y-1">
          <span className="text-xs font-semibold text-slate-400">Net Weight Change</span>
          <p className={`text-3xl font-bold font-rounded tabular-nums ${netDeltaKg <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netDeltaKg <= 0 ? `${netDeltaKg} kg` : `+${netDeltaKg} kg`}
          </p>
          <span className="text-[10px] text-slate-500">since tracking start</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl text-center space-y-1">
          <span className="text-xs font-semibold text-slate-400">Weight Goal Target</span>
          <p className="text-3xl font-bold font-rounded text-blue-400 tabular-nums">{store.profile.targetWeightKg} kg</p>
          <span className="text-[10px] text-slate-500">at {store.profile.weeklyTargetKg} kg/wk pace</span>
        </div>
      </div>

      {/* Medical Marker Matrix */}
      <div className="p-6 rounded-4xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Activity className="w-5 h-5" />
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-200">Medical Lab Markers Panel</h3>
          </div>
          <span className="text-xs text-slate-400">Tracking {store.medicalMarkers.length} Markers</span>
        </div>

        {/* Add Marker Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 pt-2 text-xs">
          <input
            type="text"
            value={newMarkerName}
            onChange={(e) => setNewMarkerName(e.target.value)}
            placeholder="Marker Name (e.g. HbA1c)"
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
          />
          <input
            type="number"
            value={newMarkerValue}
            onChange={(e) => setNewMarkerValue(Number(e.target.value))}
            placeholder="Value"
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
          />
          <input
            type="text"
            value={newMarkerUnit}
            onChange={(e) => setNewMarkerUnit(e.target.value)}
            placeholder="Unit (e.g. mg/dL)"
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white"
          />
          <select
            value={newMarkerStatus}
            onChange={(e) => setNewMarkerStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
          >
            <option value="optimal">Optimal</option>
            <option value="normal">Normal</option>
            <option value="borderline">Borderline</option>
            <option value="critical_high">High</option>
            <option value="critical_low">Low</option>
          </select>
          <button
            onClick={handleAddMarker}
            className="py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Marker
          </button>
        </div>

        {/* Marker Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
          {store.medicalMarkers.map((marker) => {
            const isBorder = marker.status === 'borderline';
            const isCritical = marker.status.includes('critical');
            const badgeColor = isCritical ? 'text-red-400 bg-red-500/10 border-red-500/30' : isBorder ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';

            return (
              <div key={marker.id} className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{marker.markerName}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold ${badgeColor}`}>
                      {marker.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Tested on {marker.testDate}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold font-rounded text-white tabular-nums">
                    {marker.value} <small className="text-xs text-slate-400">{marker.unit}</small>
                  </span>
                  <button
                    onClick={() => deleteMedicalMarker(marker.id)}
                    className="p-1.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
