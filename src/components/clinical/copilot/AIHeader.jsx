import React from 'react';
import { Sparkles, Minus, X, History, Shield, Terminal, Maximize2 } from 'lucide-react';

export default function AIHeader({
  role = 'PATIENT',
  onClose,
  onMinimize,
  onToggleHistory,
  isHistoryOpen = false,
}) {
  const roleBadgeStyles = {
    PATIENT: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
    DOCTOR: 'bg-blue-950/60 text-blue-300 border-blue-500/40',
    PHARMACIST: 'bg-teal-950/60 text-teal-300 border-teal-500/40',
    ADMIN: 'bg-purple-950/60 text-purple-300 border-purple-500/40',
  };

  return (
    <div className="relative px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-sm">
      {/* Brand & Identity */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shadow-xs">
          <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs tracking-wide text-white uppercase">
              MEDISAFE AI
            </span>
            <span className="text-3xs px-1.5 py-0.5 rounded font-medium bg-slate-800 text-teal-300 border border-slate-700 uppercase tracking-wider">
              CLINICAL COPILOT
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="inline-flex items-center gap-1 text-3xs font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ENGINE ONLINE
            </span>
            <span className="text-3xs text-slate-500">•</span>
            <span
              className={`text-3xs px-1.5 py-0.5 rounded font-semibold uppercase ${
                roleBadgeStyles[role] || roleBadgeStyles.PATIENT
              }`}
            >
              {role} PERSPECTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1 text-slate-400">
        {/* Toggle Chat History */}
        <button
          type="button"
          onClick={onToggleHistory}
          title={isHistoryOpen ? 'Back to chat' : 'Recent Inquiries'}
          className={`p-1.5 rounded-lg border transition-colors ${
            isHistoryOpen
              ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
              : 'border-transparent hover:border-slate-800 hover:bg-slate-900 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
        </button>

        {/* Minimize */}
        <button
          type="button"
          onClick={onMinimize}
          title="Minimize Panel"
          className="p-1.5 rounded-lg border border-transparent hover:border-slate-800 hover:bg-slate-900 hover:text-slate-200 transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          title="Close Copilot"
          className="p-1.5 rounded-lg border border-transparent hover:border-red-900/60 hover:bg-red-950/30 hover:text-red-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
