import React, { useState } from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Sparkles, BookOpen, Share2, Activity } from 'lucide-react';
import AIEvidencePanel from './AIEvidencePanel';
import AIKnowledgeGraph from './AIKnowledgeGraph';
import AIActionBar from './AIActionBar';

export default function AIFindingCard({
  finding,
  queryText = '',
  explanationText = '',
  evidenceSources = [],
  evidenceLevel = 'Evidence-backed',
  knowledgeGraph,
  modelTag = 'DrugSafe-RAG-v2.4',
  timestamp = 'Just now',
  onRegenerate,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('EXPLANATION'); // 'EXPLANATION' | 'EVIDENCE' | 'GRAPH'

  const severityStyles = {
    CRITICAL: {
      badge: 'bg-rose-950/80 text-rose-300 border-rose-500/50',
      banner: 'from-rose-950/40 to-slate-900/40 border-rose-500/40',
      dot: 'bg-rose-500',
      label: 'CRITICAL CONCERN',
    },
    MAJOR: {
      badge: 'bg-amber-950/80 text-amber-300 border-amber-500/50',
      banner: 'from-amber-950/40 to-slate-900/40 border-amber-500/40',
      dot: 'bg-amber-500',
      label: 'MAJOR ATTENTION REQUIRED',
    },
    MODERATE: {
      badge: 'bg-yellow-950/80 text-yellow-300 border-yellow-500/50',
      banner: 'from-yellow-950/40 to-slate-900/40 border-yellow-500/40',
      dot: 'bg-yellow-500',
      label: 'MODERATE MONITORING',
    },
    INFO: {
      badge: 'bg-blue-950/80 text-blue-300 border-blue-500/50',
      banner: 'from-blue-950/40 to-slate-900/40 border-blue-500/40',
      dot: 'bg-blue-400',
      label: 'INFORMATIONAL COMPLIANCE',
    },
  };

  const severity = finding?.severity || 'MAJOR';
  const currentSeverity = severityStyles[severity] || severityStyles.MAJOR;

  const pairTitle = finding?.medications?.join(' + ') || finding?.title || 'Warfarin + Aspirin';

  return (
    <div className={`p-4 rounded-xl bg-slate-950/95 border border-cyan-500/35 shadow-xl backdrop-blur-md space-y-3.5 relative overflow-hidden ${className}`}>
      {/* Top Cyber Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />

      {/* Intelligence Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-3xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-3 h-3" />
          </div>
          <span className="font-bold tracking-wider text-cyan-300 uppercase">
            MEDISAFE AI CLINICAL INTELLIGENCE
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span className="px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-400">
            {modelTag}
          </span>
          <span>{timestamp}</span>
        </div>
      </div>

      {/* Severity Alert Banner */}
      <div className={`p-3 rounded-lg bg-gradient-to-r ${currentSeverity.banner} border flex items-start gap-2.5`}>
        <div className="mt-0.5">
          <span className={`w-2 h-2 rounded-full ${currentSeverity.dot} inline-block animate-pulse`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-mono text-3xs font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${currentSeverity.badge}`}>
              {currentSeverity.label}
            </span>
            <span className="font-mono text-3xs text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              {evidenceLevel}
            </span>
          </div>

          <h4 className="text-xs font-bold text-white mt-1.5">
            {pairTitle}
          </h4>
          <p className="text-2xs text-slate-300 mt-0.5">
            {finding?.clinicalEffect || 'Potential increased bleeding risk due to concurrent antithrombotic therapy.'}
          </p>
        </div>
      </div>

      {/* View Switcher Tabs (EXPLANATION | EVIDENCE | RELATIONSHIP GRAPH) */}
      <div className="flex items-center gap-1 border-b border-slate-800/80 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('EXPLANATION')}
          className={`px-2.5 py-1 rounded text-3xs font-mono font-bold tracking-wider uppercase transition-colors ${
            activeTab === 'EXPLANATION'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          EXPLANATION
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EVIDENCE')}
          className={`px-2.5 py-1 rounded text-3xs font-mono font-bold tracking-wider uppercase transition-colors ${
            activeTab === 'EVIDENCE'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          EVIDENCE DOSSIER
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('GRAPH')}
          className={`px-2.5 py-1 rounded text-3xs font-mono font-bold tracking-wider uppercase transition-colors ${
            activeTab === 'GRAPH'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          RELATIONSHIP GRAPH
        </button>
      </div>

      {/* Tab 1: EXPLANATION */}
      {activeTab === 'EXPLANATION' && (
        <div className="space-y-3 text-xs leading-relaxed text-slate-200">
          {/* Plain English Summary Box */}
          <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 text-teal-100">
            <span className="text-3xs font-bold tracking-wider text-teal-300 uppercase block mb-1">
              💡 IN SIMPLE WORDS
            </span>
            <p className="text-xs text-teal-100 font-sans leading-relaxed">
              Taking <strong>{pairTitle}</strong> together significantly thins your blood. This makes you more prone to bruising, bleeding gums, nosebleeds, or stomach irritation. Talk to your healthcare provider before combining them.
            </p>
          </div>

          <div>
            <span className="text-3xs font-bold tracking-wider text-slate-400 uppercase block mb-1">
              WHY THIS WAS FLAGGED (CLINICAL MECHANISM)
            </span>
            <p className="text-2xs text-slate-300 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
              {finding?.mechanism ||
                'Warfarin inhibits vitamin K-dependent synthesis of clotting factors (II, VII, IX, X), whereas Aspirin irreversibly impairs platelet cyclooxygenase-1 (COX-1). Combined administration disrupts both primary and secondary hemostatic pathways, conferring synergistic risk for upper gastrointestinal hemorrhage.'}
            </p>
          </div>

          {finding?.management && (
            <div>
              <span className="text-3xs font-bold tracking-wider text-teal-400 uppercase block mb-1">
                RECOMMENDED ACTION & PROTOCOL
              </span>
              <p className="text-2xs text-slate-300 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                {finding.management}
              </p>
            </div>
          )}

          {explanationText && (
            <div className="text-2xs text-slate-300 whitespace-pre-wrap bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/80">
              {explanationText}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: EVIDENCE */}
      {activeTab === 'EVIDENCE' && (
        <AIEvidencePanel
          sources={evidenceSources.length > 0 ? evidenceSources : finding?.evidenceSources}
          evidenceLevel={evidenceLevel}
          lastVerified={finding?.lastVerified || '2026-08-15'}
        />
      )}

      {/* Tab 3: KNOWLEDGE GRAPH */}
      {activeTab === 'GRAPH' && (
        <AIKnowledgeGraph graphData={knowledgeGraph} />
      )}

      {/* Action Bar */}
      <AIActionBar
        textToCopy={explanationText || finding?.summary || pairTitle}
        onRegenerate={onRegenerate}
        onViewEvidence={() => setActiveTab('EVIDENCE')}
      />
    </div>
  );
}
