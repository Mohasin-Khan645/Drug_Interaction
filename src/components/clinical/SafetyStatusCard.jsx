import React from 'react';
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SafetyStatusCard({
  medicationCount = 4,
  checksPerformed = 12,
  criticalIssues = 1,
  lastChecked = 'Today, 08:12 AM',
  status = 'REVIEW COMPLETE',
  onRunCheck,
  isLoading = false,
  className = '',
}) {
  const hasIssues = criticalIssues > 0;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Clinical Safety Protocol
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
            Medication Safety Status
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
              hasIssues
                ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
            }`}
          >
            <span>{hasIssues ? '🟡' : '🟢'}</span>
            <span>{status}</span>
          </span>

          {onRunCheck && (
            <button
              type="button"
              onClick={onRunCheck}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Run Check</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Medications Monitored
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {medicationCount}
          </p>
          <p className="text-3xs text-slate-500 mt-0.5">Active continuous regimen</p>
        </div>

        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Safety Checks Performed
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {checksPerformed}
          </p>
          <p className="text-3xs text-slate-500 mt-0.5">Rules & cross-reactions</p>
        </div>

        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Attention Items
          </p>
          <p
            className={`text-2xl font-black mt-1 ${
              hasIssues ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {criticalIssues} {criticalIssues === 1 ? 'finding' : 'findings'}
          </p>
          <p className="text-3xs text-slate-500 mt-0.5">Requires clinical review</p>
        </div>

        <div>
          <p className="text-2xs font-bold uppercase tracking-wider text-slate-400">
            Last Evaluation
          </p>
          <p className="text-sm font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-500" />
            {lastChecked}
          </p>
          <p className="text-3xs text-slate-500 mt-0.5">Continuous sync</p>
        </div>
      </div>

      {/* Medical UX Phrasing Banner */}
      <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {hasIssues
              ? 'Potential findings identified in current compendium sources. Please review clinical considerations.'
              : 'No new issues identified in the checked compendium sources.'}
          </span>
        </div>
        <span className="hidden md:inline-block text-3xs font-semibold text-slate-400">
          Compendium: RxNorm / DailyMed
        </span>
      </div>
    </div>
  );
}

