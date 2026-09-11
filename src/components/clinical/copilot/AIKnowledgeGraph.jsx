import React, { useState } from 'react';
import { User, Pill, Activity, AlertTriangle, BookOpen, Info } from 'lucide-react';

export default function AIKnowledgeGraph({ graphData, className = '' }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const defaultGraph = {
    nodes: [
      { id: 'pat', label: 'Sarah Jenkins', type: 'patient', detail: '67 yrs • Female • eGFR 48' },
      { id: 'med1', label: 'Warfarin 5mg', type: 'medication', detail: 'Vitamin K Antagonist (VKORC1)' },
      { id: 'med2', label: 'Aspirin 81mg', type: 'medication', detail: 'Antiplatelet (COX-1 Inhibitor)' },
      { id: 'target', label: 'Platelet / Coagulation', type: 'target', detail: 'Dual hemostasis pathway blockade' },
      { id: 'finding', label: 'Increased Bleeding Risk', type: 'finding', detail: 'Major GI & systemic hemorrhage risk' },
      { id: 'evidence', label: 'FDA DailyMed Warning', type: 'evidence', detail: 'Black Box Safety Labeling' },
    ],
  };

  const currentNodes = graphData?.nodes || defaultGraph.nodes;

  const nodeIcons = {
    patient: User,
    medication: Pill,
    target: Activity,
    factor: Activity,
    finding: AlertTriangle,
    evidence: BookOpen,
  };

  const nodeColors = {
    patient: 'border-blue-500/60 bg-blue-950/70 text-blue-300',
    medication: 'border-cyan-500/60 bg-cyan-950/70 text-cyan-300',
    target: 'border-amber-500/60 bg-amber-950/70 text-amber-300',
    factor: 'border-amber-500/60 bg-amber-950/70 text-amber-300',
    finding: 'border-rose-500/80 bg-rose-950/80 text-rose-300',
    evidence: 'border-emerald-500/60 bg-emerald-950/70 text-emerald-300',
  };

  return (
    <div className={`p-3 rounded-xl bg-slate-950 border border-cyan-500/30 font-mono text-2xs space-y-3 ${className}`}>
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-3xs font-black tracking-widest text-cyan-400 uppercase">
          KNOWLEDGE GRAPH PATHWAY
        </span>
        <span className="text-3xs text-slate-500">Grounded Graph Topology</span>
      </div>

      {/* Visual Flow Representation */}
      <div className="space-y-2 relative py-1">
        {/* Animated Flow Connector Line in background */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500 via-cyan-400 via-rose-500 to-emerald-400 opacity-40 -z-0" />

        {currentNodes.map((node, i) => {
          const Icon = nodeIcons[node.type] || Activity;
          const colorClass = nodeColors[node.type] || 'border-slate-700 bg-slate-900 text-slate-300';
          const isSelected = selectedNode?.id === node.id;

          return (
            <div key={node.id} className="relative pl-8 z-10">
              {/* Connector Dot */}
              <div className="absolute left-2.5 top-3 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-950 border border-cyan-400 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>

              <button
                type="button"
                onClick={() => setSelectedNode(isSelected ? null : node)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all ${colorClass} ${
                  isSelected ? 'ring-2 ring-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)] scale-[1.01]' : 'hover:border-opacity-100'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-bold text-white text-xs">{node.label}</span>
                  </div>
                  <span className="text-3xs uppercase tracking-wider font-semibold opacity-75">
                    {node.type}
                  </span>
                </div>

                {node.detail && (
                  <p className="text-3xs opacity-85 mt-1 font-sans leading-relaxed">
                    {node.detail}
                  </p>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selection Inspection Footnote */}
      <div className="p-2 rounded bg-slate-900/90 border border-slate-800 text-3xs text-slate-400 flex items-center gap-1.5">
        <Info className="w-3 h-3 text-cyan-400 shrink-0" />
        <span>
          {selectedNode
            ? `Inspecting ${selectedNode.label}: ${selectedNode.detail || 'Verified node entity'}`
            : 'Click any node to inspect mechanistic pathway properties.'}
        </span>
      </div>
    </div>
  );
}

