import React from 'react';
import { Zap, Sparkles, AlertCircle, FileText, Activity, ShieldCheck } from 'lucide-react';

export default function AIQuickActions({
  role = 'PATIENT',
  onSelectAction,
  onRunSafetyAnalysis,
  isLoading = false,
  className = '',
}) {
  const roleActions = {
    PATIENT: [
      { id: 'pat-1', label: 'Explain my safety findings', icon: AlertCircle },
      { id: 'pat-2', label: 'Explain a medication', icon: Sparkles },
      { id: 'pat-3', label: 'Summarize my medications', icon: FileText },
      { id: 'pat-4', label: 'What should I discuss with my doctor?', icon: ShieldCheck },
    ],
    DOCTOR: [
      { id: 'doc-1', label: 'Explain interaction', icon: AlertCircle },
      { id: 'doc-2', label: 'Analyze current medications', icon: Activity },
      { id: 'doc-3', label: 'Summarize patient safety', icon: ShieldCheck },
      { id: 'doc-4', label: 'Compare medication history', icon: FileText },
      { id: 'doc-5', label: 'Show supporting evidence', icon: Sparkles },
    ],
    PHARMACIST: [
      { id: 'pharm-1', label: 'Review prescription', icon: FileText },
      { id: 'pharm-2', label: 'Explain interaction', icon: AlertCircle },
      { id: 'pharm-3', label: 'Check medication conflicts', icon: Activity },
      { id: 'pharm-4', label: 'Show evidence', icon: Sparkles },
      { id: 'pharm-5', label: 'Summarize dispensing concerns', icon: ShieldCheck },
    ],
    ADMIN: [
      { id: 'adm-1', label: 'Explain safety rule', icon: AlertCircle },
      { id: 'adm-2', label: 'Review rule coverage', icon: ShieldCheck },
      { id: 'adm-3', label: 'Analyze system safety activity', icon: Activity },
      { id: 'adm-4', label: 'Check knowledge-source status', icon: Sparkles },
      { id: 'adm-5', label: 'Summarize platform activity', icon: FileText },
    ],
  };

  const actions = roleActions[role] || roleActions.PATIENT;

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Prominent Run Safety Analysis Action Button */}
      {role !== 'ADMIN' && (
        <button
          type="button"
          disabled={isLoading}
          onClick={onRunSafetyAnalysis}
          className="w-full relative group px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-2xs font-bold tracking-wider uppercase shadow-md shadow-teal-950/40 transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
        >
          <Zap className="w-3.5 h-3.5 text-teal-100 fill-teal-100" />
          <span>RUN COMPREHENSIVE SAFETY ANALYSIS</span>
        </button>
      )}

      {/* Role-Specific Quick Chips */}
      <div>
        <div className="flex items-center justify-between mb-1.5 px-0.5">
          <span className="text-3xs font-semibold tracking-wider text-slate-400 uppercase">
            QUICK QUESTIONS & ACTIONS
          </span>
          <span className="text-3xs font-medium text-teal-400">READY</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                type="button"
                disabled={isLoading}
                onClick={() => onSelectAction(act.label)}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/80 hover:border-teal-500/50 text-slate-200 hover:text-white text-2xs transition-all duration-150 shadow-xs focus:outline-none focus:ring-1 focus:ring-teal-400/40 disabled:opacity-50"
              >
                <Icon className="w-3 h-3 text-teal-400 group-hover:text-teal-300 shrink-0" />
                <span className="truncate">{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
