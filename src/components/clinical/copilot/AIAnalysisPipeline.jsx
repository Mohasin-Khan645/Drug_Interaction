import React from 'react';
import { CheckCircle2, Loader2, Sparkles, Activity } from 'lucide-react';

export default function AIAnalysisPipeline({ currentStep = 0, currentStepLabel = '', className = '' }) {
  const steps = [
    'Patient context loaded',
    'Medication data retrieved',
    'Medications normalized (RxNorm / ATC)',
    'Safety findings retrieved',
    'Evidence retrieved (DailyMed / FDA)',
    'Generating grounded explanation',
  ];

  return (
    <div className={`p-4 rounded-xl bg-slate-950/95 border border-cyan-500/40 shadow-xl backdrop-blur-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider uppercase">
            SAFETY ANALYSIS PIPELINE
          </span>
        </div>
        <span className="font-mono text-3xs text-cyan-400/80">
          STEP {Math.min(currentStep + 1, steps.length)} / {steps.length}
        </span>
      </div>

      {/* Cyber Scanning Line Animation */}
      <div className="relative h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-3.5">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300 rounded-full"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      {/* Stepped Process List */}
      <div className="space-y-2 font-mono text-2xs">
        {steps.map((label, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={label}
              className={`flex items-center gap-2 transition-all ${
                isDone
                  ? 'text-emerald-400'
                  : isCurrent
                  ? 'text-cyan-300 font-bold'
                  : 'text-slate-600'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex items-center justify-center text-3xs text-slate-600 shrink-0">
                  {idx + 1}
                </span>
              )}
              <span className="truncate">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

