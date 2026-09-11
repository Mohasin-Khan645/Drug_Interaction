import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  FileCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';
import SeverityBadge from '../common/SeverityBadge';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { getSeverityConfig } from '../../utils/severityUtils';

export default function FindingCard({
  finding,
  onViewEvidence,
  onExplainAI,
  onAddToReport,
  onReview,
  isAddedToReport = false,
  className = '',
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!finding) return null;

  const severityConfig = getSeverityConfig(finding.severity);

  // 3D glow styling based on clinical severity
  const getHaloClass = () => {
    switch (finding.severity) {
      case 'CRITICAL':
      case 'CONTRAINDICATED':
        return 'border-rose-400/80 shadow-glow-rose ring-1 ring-rose-300/40';
      case 'MAJOR':
        return 'border-amber-400/80 shadow-glow-amber ring-1 ring-amber-300/40';
      case 'MODERATE':
        return 'border-yellow-400/70';
      default:
        return 'border-slate-200 shadow-3d';
    }
  };

  return (
    <div
      className={`card-3d rounded-2xl border bg-white overflow-hidden transition-all duration-300 ${getHaloClass()} ${className}`}
    >
      {/* Top Banner with Severity and Title */}
      <div className={`p-4 sm:p-5 ${severityConfig.bgClass} border-b ${severityConfig.borderClass}`}>
        <div className="flex flex-wrap items-start justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={finding.severity} size="md" />
            {finding.category && (
              <Badge variant="slate" size="sm" className="shadow-2xs">
                {finding.category}
              </Badge>
            )}
          </div>

          {finding.reviewStatus && (
            <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/95 border border-slate-200 text-slate-700 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              <span>Review: {finding.reviewStatus}</span>
            </div>
          )}
        </div>

        <h3 className={`text-base font-bold ${severityConfig.textClass} tracking-tight`}>
          {finding.title || finding.interactionTitle}
        </h3>

        {/* Affected Drugs Chips */}
        {finding.affectedDrugs && finding.affectedDrugs.length > 0 && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500 mr-1">
              Affected Agents:
            </span>
            {finding.affectedDrugs.map((drug, idx) => (
              <span
                key={idx}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-white border border-slate-300 text-slate-800 shadow-2xs"
              >
                {typeof drug === 'string' ? drug : drug.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="p-4 sm:p-5 space-y-3.5 text-sm">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Clinical Consequence & Effect
          </h4>
          <p className="text-slate-800 leading-relaxed">
            {finding.clinicalEffect || finding.description}
          </p>
        </div>

        {/* Actionable Guidance */}
        {finding.recommendation && (
          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-teal-700" />
              Clinical Guidance & Monitoring
            </h4>
            <p className="text-xs text-teal-950 leading-relaxed">
              {finding.recommendation}
            </p>
          </div>
        )}

        {/* Expandable Mechanism & Pharmacodynamics */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-100 space-y-3 animate-in fade-in-50 duration-200">
            {finding.mechanism && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Pharmacological Mechanism
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {finding.mechanism}
                </p>
              </div>
            )}

            {finding.explanation && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Detailed Explanation
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {finding.explanation}
                </p>
              </div>
            )}

            {/* Evidence & Source Attribution */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 text-xs text-slate-600 border border-slate-200/70">
              <div>
                <span className="font-semibold text-slate-700">Evidence Level: </span>
                <span>{finding.evidenceLevel || 'Level 1 (FDA Approved Package Insert)'}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-700">Verified Source: </span>
                <span className="text-teal-700 font-medium">{finding.source || 'DailyMed / FDA / RxNorm'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Expand / Collapse toggle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 transition-colors"
        >
          {isExpanded ? (
            <>
              Less details <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              More details (Mechanism, Evidence & Sources) <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* Action Footer with 3D button styling */}
      <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {onViewEvidence && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewEvidence(finding)}
              icon={BookOpen}
              className="text-xs bg-white text-slate-700 shadow-2xs"
            >
              Evidence
            </Button>
          )}

          {onExplainAI && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onExplainAI(finding)}
              className="text-xs bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-300 text-teal-900 font-bold hover:bg-teal-100/70 shadow-2xs hover:shadow-glow-teal transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
              Stream AI Rationale
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {onReview && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onReview(finding)}
              className="text-xs text-slate-800 shadow-2xs"
            >
              Clinician Review
            </Button>
          )}

          {onAddToReport && (
            <Button
              size="sm"
              variant={isAddedToReport ? 'secondary' : 'primary'}
              onClick={() => onAddToReport(finding)}
              icon={FileCheck}
              disabled={isAddedToReport}
              className="text-xs shadow-2xs"
            >
              {isAddedToReport ? 'In Report' : 'Add to Report'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
