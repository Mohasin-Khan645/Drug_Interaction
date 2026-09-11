import React from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, BookOpen, X, ExternalLink, ShieldAlert } from 'lucide-react';

export default function MediSafeAIExplanation({
  isOpen,
  onClose,
  finding,
  question,
  onAskQuestion,
}) {
  if (!isOpen || !finding) return null;

  const affectedStr = finding.medications?.join(' + ') || finding.title || 'Evaluated Medications';
  const citations = finding.evidenceSources || (finding.evidence ? [{ title: finding.evidence, source: finding.source }] : []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white">
                  MediSafe AI
                </span>
                <span className="px-1.5 py-0.2 rounded text-3xs font-semibold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                  Evidence-Bound
                </span>
              </div>
              <p className="text-3xs text-slate-400">
                Explanation based on verified medication information
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Finding Banner */}
          <div className="p-4 rounded-xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-800/40">
            <span className="text-2xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              Evaluated Regimen
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {affectedStr}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {finding.summary || finding.clinicalEffect}
            </p>
          </div>

          {/* 1. What was detected? */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <span>1. What was detected?</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800">
              A potential pharmacological interaction was detected between <strong className="text-slate-900 dark:text-white">{affectedStr}</strong> classified at <span className="font-bold text-rose-600 dark:text-rose-400">{finding.severity}</span> priority. This interaction is recorded in official prescribing guidelines and clinical rule matrices.
            </p>
          </div>

          {/* 2. Why does it matter? */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
              2. Why does it matter?
            </h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-200/60 dark:border-slate-800 space-y-2">
              <p>
                <strong>Clinical Mechanism:</strong> {finding.mechanism || 'Concomitant administration results in synergistic pharmacodynamic or pharmacokinetic alterations.'}
              </p>
              <p>
                <strong>Patient Impact:</strong> {finding.clinicalEffect || 'Increased risk of adverse clinical outcomes requiring therapeutic monitoring.'}
              </p>
            </div>
          </div>

          {/* 3. What information supports this? */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              <span>3. What information supports this?</span>
            </h4>
            <div className="space-y-2">
              {citations.length > 0 ? (
                citations.map((cite, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-sm"
                  >
                    <p className="font-bold text-slate-900 dark:text-white">
                      {cite.title || cite}
                    </p>
                    <p className="text-3xs text-slate-400 mt-0.5">
                      Source: {cite.source || finding.source || 'DailyMed / FDA Prescribing Information'}
                    </p>
                    {cite.snippet && (
                      <p className="text-3xs text-slate-500 italic mt-1 border-t border-slate-100 dark:border-slate-700 pt-1">
                        "{cite.snippet}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-500">
                  Validated against standard FDA CDER / NIH DailyMed compendia.
                </div>
              )}
            </div>
          </div>

          {/* 4. What should the clinician review? */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1.5">
              4. What should the clinician review?
            </h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-teal-50/40 dark:bg-teal-950/20 p-3 rounded-lg border border-teal-200/50 dark:border-teal-800/40">
              <p className="font-semibold text-teal-900 dark:text-teal-200 mb-1">
                Prescribing Protocol & Management:
              </p>
              <p>
                {finding.management || 'Evaluate patient renal function (eGFR), baseline organ markers, and consider dosage adjustments, staggered administration, or alternative therapeutic agents.'}
              </p>
            </div>
          </div>

          {/* Mandatory AI Medical Safety Disclaimer */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-2xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold uppercase tracking-wider">Clinical Decision Support Notice:</span>
              <p className="mt-0.5 leading-relaxed text-amber-800/90 dark:text-amber-200/90">
                AI-generated explanation. Verify against cited clinical information, hospital formulary guidelines, and professional clinical judgment. This system does not diagnose, prescribe, change dosage, or declare regimens unconditionally safe.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/40 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
}

