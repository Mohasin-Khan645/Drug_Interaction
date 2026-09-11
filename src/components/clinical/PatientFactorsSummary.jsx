import React from 'react';
import { Activity, AlertTriangle, CheckCircle2, FileText, HeartPulse, User } from 'lucide-react';
import Badge from '../common/Badge';

export default function PatientFactorsSummary({
  patient,
  factors = {},
  concerns = [],
  className = '',
}) {
  if (!patient && !factors) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Vital & Physiological Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Age & Demographics
          </span>
          <p className="text-base font-bold text-slate-900">
            {patient?.age ? `${patient.age} yrs` : '67 yrs'}
          </p>
          <span className="text-2xs text-slate-500">{patient?.gender || 'Female'}</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Weight & BMI
          </span>
          <p className="text-base font-bold text-slate-900">
            {patient?.weightKg ? `${patient.weightKg} kg` : '64.5 kg'}
          </p>
          <span className="text-2xs text-slate-500">BMI: 23.4 (Normal)</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Renal Function (eGFR)
          </span>
          <div className="flex items-center gap-1.5">
            <p className="text-base font-bold text-amber-800">
              {factors?.egfr || '48 mL/min'}
            </p>
            <Badge variant="amber" size="sm">CKD 3a</Badge>
          </div>
          <span className="text-2xs text-slate-500">Serum Cr: 1.4 mg/dL</span>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-subtle">
          <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Hepatic Function
          </span>
          <p className="text-base font-bold text-slate-900">
            {factors?.hepatic || 'Mild Impairment'}
          </p>
          <span className="text-2xs text-slate-500">AST: 38 U/L • ALT: 42 U/L</span>
        </div>
      </div>

      {/* Concerns Detected from Patient Factors */}
      {concerns && concerns.length > 0 && (
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Potential Patient-Factor Safety Concerns</span>
          </h4>

          {concerns.map((concern, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-950 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900">{concern.title}</span>
                <Badge variant="amber" size="sm">Patient Factor</Badge>
              </div>
              <p className="text-xs leading-relaxed text-amber-900">
                {concern.description}
              </p>
              {concern.evidence && (
                <div className="text-2xs text-amber-800 bg-white/70 p-2 rounded border border-amber-200 font-mono">
                  <strong>Evidence:</strong> {concern.evidence}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
