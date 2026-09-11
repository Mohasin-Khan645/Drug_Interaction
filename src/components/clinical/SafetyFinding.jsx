import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Clock,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: {
    label: 'CRITICAL',
    icon: AlertOctagon,
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-400',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    cardBorder: 'border-l-4 border-l-rose-600 border-slate-200 dark:border-slate-800',
    indicator: '🔴',
  },
  MAJOR: {
    label: 'MAJOR',
    icon: AlertTriangle,
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-400',
    badgeBorder: 'border-amber-200 dark:border-amber-800',
    cardBorder: 'border-l-4 border-l-amber-500 border-slate-200 dark:border-slate-800',
    indicator: '🟠',
  },
  MONITOR: {
    label: 'MONITOR',
    icon: Info,
    badgeBg: 'bg-yellow-50 dark:bg-yellow-950/40',
    badgeText: 'text-yellow-700 dark:text-yellow-400',
    badgeBorder: 'border-yellow-200 dark:border-yellow-800',
    cardBorder: 'border-l-4 border-l-yellow-500 border-slate-200 dark:border-slate-800',
    indicator: '🟡',
  },
  INFO: {
    label: 'INFO',
    icon: Info,
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeText: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200 dark:border-slate-700',
    cardBorder: 'border-l-4 border-l-slate-400 border-slate-200 dark:border-slate-800',
    indicator: '🔵',
  },
  NO_FINDING_IDENTIFIED: {
    label: 'NO FINDING IDENTIFIED',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-400',
    badgeBorder: 'border-emerald-200 dark:border-emerald-800',
    cardBorder: 'border-l-4 border-l-emerald-500 border-slate-200 dark:border-slate-800',
    indicator: '🟢',
  },
};

export default function SafetyFinding({
  severity = 'MONITOR',
  title,
  medications = [],
  summary,
  clinicalEffect,
  mechanism,
  management,
  evidence,
  evidenceSources = [],
  source,
  lastVerified,
  status,
  onReview,
  onExplainAI,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sevKey = (severity || 'MONITOR').toUpperCase();
  const config = SEVERITY_CONFIG[sevKey] || SEVERITY_CONFIG.MONITOR;
  const Icon = config.icon;

  const normalizedEvidence =
    evidenceSources.length > 0
      ? evidenceSources
      : evidence
      ? [{ title: evidence, source: source || 'DailyMed / FDA Prescribing Info' }]
      : [];

  return (
    <div
      className={`rounded-xl bg-white dark:bg-slate-900 border p-5 shadow-sm transition-all duration-200 ${config.cardBorder} ${className}`}
    >
      {/* Finding Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-2xs font-bold border ${config.badgeBg} ${config.badgeText} ${config.badgeBorder}`}
              title={`Severity rank: ${config.label}`}
            >
              <span>{config.indicator}</span>
              <span>{config.label}</span>
            </span>
          </div>

          <div className="min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
              {title || (medications.length >= 2 ? `${medications[0]} + ${medications[1]}` : 'Clinical Safety Finding')}
            </h4>
            {medications.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                <span className="text-2xs font-semibold text-slate-400">Affected:</span>
                {medications.map((med, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-3xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    {med}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {onExplainAI && (
            <button
              type="button"
              onClick={onExplainAI}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 transition-colors shadow-sm"
              title="Stream AI verified pharmacological rationale"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>AI Rationale</span>
            </button>
          )}

          {onReview && (
            <button
              type="button"
              onClick={onReview}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors"
            >
              <span>Review finding</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Short Summary */}
      {(summary || clinicalEffect) && (
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
          {summary || clinicalEffect}
        </p>
      )}

      {/* Expandable Comprehensive Clinical Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3.5 animate-in fade-in duration-150">
          {mechanism && (
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pharmacological Mechanism
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                {mechanism}
              </p>
            </div>
          )}

          {management && (
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Prescribing & Management Protocol
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-teal-50/50 dark:bg-teal-950/20 p-3 rounded-lg border border-teal-200/40 dark:border-teal-800/40">
                {management}
              </p>
            </div>
          )}

          {/* Evidence Citations */}
          {normalizedEvidence.length > 0 && (
            <div>
              <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Verified Evidence & Compendium Citations</span>
              </p>
              <div className="space-y-1.5">
                {normalizedEvidence.map((ev, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs p-2 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800"
                  >
                    <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {ev.title || ev}
                    </span>
                    <span className="text-3xs text-slate-400 font-medium ml-2 shrink-0">
                      {ev.source || source || 'DailyMed / FDA CDER'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-3xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Last verified: {lastVerified || 'March 2026'}
            </span>
            {status && (
              <span className="font-semibold uppercase tracking-wider">
                Status: {status}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

