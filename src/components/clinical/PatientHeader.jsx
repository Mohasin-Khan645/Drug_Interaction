import React from 'react';
import { User, AlertCircle, HeartPulse, Activity, ShieldAlert, Pill } from 'lucide-react';

export default function PatientHeader({
  patient,
  className = '',
}) {
  if (!patient) return null;

  const egfr = patient.renalFunction?.egfr;
  const isRenalImpaired = egfr != null && egfr < 60;

  return (
    <div
      className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Patient Identity */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 flex items-center justify-center font-black text-lg shrink-0">
            {patient.name?.charAt(0) || 'P'}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                {patient.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md text-3xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {patient.mrn || `ID: ${patient.id}`}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-3xs font-bold ${
                  patient.status === 'Needs Review'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                }`}
              >
                {patient.status || 'Active Monitored'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Age: <strong className="text-slate-700 dark:text-slate-200">{patient.age || '48'}</strong> yrs</span>
              <span>•</span>
              <span>Gender: <strong className="text-slate-700 dark:text-slate-200">{patient.gender || 'Female'}</strong></span>
              <span>•</span>
              <span>Blood: <strong className="text-slate-700 dark:text-slate-200">{patient.bloodGroup || 'A+'}</strong></span>
              <span>•</span>
              <span>Primary: <strong className="text-slate-700 dark:text-slate-200">{patient.primaryDoctor || 'Dr. Marcus Chen'}</strong></span>
            </div>
          </div>
        </div>

        {/* Renal & Organ Profile Badge */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div
            className={`p-3 rounded-xl border text-xs ${
              isRenalImpaired
                ? 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>Renal (eGFR): {egfr ? `${egfr} mL/min/1.73m²` : 'Preserved (90+)'}</span>
            </div>
            <p className="text-3xs text-slate-500 dark:text-slate-400 mt-0.5">
              {patient.renalFunction?.stage || 'Normal Renal Clearance'}
            </p>
          </div>
        </div>
      </div>

      {/* Clinical Factor Quick Chips */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Allergies */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-3xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Allergies ({patient.allergies?.length || 0})
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {patient.allergies?.length > 0 ? (
              patient.allergies.map((a, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-3xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800"
                >
                  {a.allergen || a}
                </span>
              ))
            ) : (
              <span className="text-3xs text-slate-400">No known allergies (NKDA)</span>
            )}
          </div>
        </div>

        {/* Chronic Conditions */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-3xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-1">
            <HeartPulse className="w-3 h-3" /> Conditions ({patient.conditions?.length || 0})
          </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {patient.conditions?.length > 0 ? (
              patient.conditions.slice(0, 2).map((c, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-3xs font-semibold bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800 truncate max-w-[140px]"
                >
                  {c.conditionName || c}
                </span>
              ))
            ) : (
              <span className="text-3xs text-slate-400">None documented</span>
            )}
            {patient.conditions?.length > 2 && (
              <span className="text-3xs text-slate-400 self-center">
                +{patient.conditions.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Active Meds Count & Alerts */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
              Active Regimen
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {patient.activeMedicationsCount || 4} Medications
            </p>
          </div>
          <div>
            <span className="text-3xs font-bold uppercase tracking-wider text-amber-500">
              Risk Findings
            </span>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {patient.riskFindingsCount || 1} Item
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

