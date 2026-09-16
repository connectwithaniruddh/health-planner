import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clinicalAdvisoryService, ClinicalAdvisoryReport } from '../../services/clinical/clinicalAdvisory.service';
import { ShieldAlert, AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Utensils, HeartPulse, Sparkles } from 'lucide-react';

export const ClinicalAdvisoryWidget: React.FC = () => {
  const { store } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const reports = clinicalAdvisoryService.generateFullReport(store.profile, store.medicalMarkers);

  if (reports.length === 0) {
    return null;
  }

  return (
    <div className="p-6 rounded-3xl bg-neutral-900/70 border border-white/10 backdrop-blur-2xl space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <HeartPulse className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-rounded">Clinical & Lab Health Advisory</h3>
            <p className="text-[11px] text-slate-400">
              Personalized guidance based on your conditions & blood biomarkers ({reports.length} Active Protocols)
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
          Medical Care Active
        </span>
      </div>

      {/* Advisory Cards List */}
      <div className="space-y-3">
        {reports.map((report) => {
          const isExpanded = expandedId === report.id;
          return (
            <div
              key={report.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                report.severity === 'critical'
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-amber-950/20 border-amber-500/30'
              }`}
            >
              {/* Accordion Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : report.id)}
                className="p-4 flex items-center justify-between cursor-pointer hover:opacity-90 transition-all"
              >
                <div className="flex items-center gap-3">
                  {report.severity === 'critical' ? (
                    <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{report.title}</h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {report.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{report.finding}</p>
                  </div>
                </div>

                <div className="text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-white/5 text-xs text-slate-300 animate-fadeIn">
                  <p className="text-[11px] text-slate-400 leading-relaxed bg-black/30 p-2.5 rounded-xl border border-white/5">
                    {report.clinicalExplanation}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                      Clinical Dietary Actions:
                    </span>
                    <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-300">
                      {report.dietaryPrescription.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-400 block uppercase">
                        ✅ Desi Superfoods to Favor:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {report.foodsToFavor.map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-md"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                      <span className="text-[10px] font-bold text-rose-400 block uppercase">
                        🚫 Foods to Limit or Avoid:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {report.foodsToAvoid.map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-rose-500/20 text-rose-200 px-2 py-0.5 rounded-md"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
