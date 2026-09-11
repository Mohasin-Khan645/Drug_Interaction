import React from 'react';
import { Activity, Database, ShieldCheck, Cpu } from 'lucide-react';

export default function AIEngineStatus({ health, className = '' }) {
  const statusItems = [
    {
      id: 'safety',
      label: 'SAFETY ENGINE',
      status: health?.safetyEngine || 'ONLINE',
      color: 'emerald',
      icon: ShieldCheck,
    },
    {
      id: 'evidence',
      label: 'EVIDENCE RETRIEVAL',
      status: health?.evidenceRetrieval || 'READY',
      color: 'cyan',
      icon: Database,
    },
    {
      id: 'kb',
      label: 'KNOWLEDGE BASE',
      status: health?.knowledgeBase || 'CONNECTED',
      color: 'teal',
      icon: Cpu,
    },
    {
      id: 'ai',
      label: 'AI EXPLANATION',
      status: health?.aiExplanation || 'READY',
      color: 'emerald',
      icon: Activity,
    },
  ];

  return (
    <div className={`px-4 py-2 bg-slate-900/90 border-b border-slate-800/80 ${className}`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {statusItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex items-center justify-between px-2 py-1 rounded-md bg-slate-800/60 border border-slate-700/60"
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Icon className="w-3 h-3 text-teal-400 shrink-0" />
                <span className="text-3xs font-medium text-slate-300 truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-3xs font-semibold text-emerald-400">
                  {item.status}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

