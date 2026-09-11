import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

export default function AISafetyDisclaimer({ className = '' }) {
  return (
    <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 text-3xs text-slate-400 flex items-start gap-2 ${className}`}>
      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
      <div className="leading-relaxed font-sans">
        <span className="text-slate-300 font-semibold">CLINICAL SAFETY NOTICE: </span>
        MediSafe AI provides information grounded in FDA and DailyMed verified labeling. It does not replace professional medical judgment or prescribe medication.
      </div>
    </div>
  );
}

