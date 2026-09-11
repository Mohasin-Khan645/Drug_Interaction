import React, { useState } from 'react';
import { Sparkles, Terminal, Activity, ShieldCheck, ChevronRight } from 'lucide-react';

export default function MediSafeAITrigger({ onClick, isEngineOnline = true, isOpen = false }) {
  const [isHovered, setIsHovered] = useState(false);

  if (isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <button
        type="button"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-lg shadow-teal-950/20 hover:shadow-xl hover:shadow-teal-600/30 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-teal-400 border border-teal-400/30"
        aria-label="Open Clinical AI Copilot"
      >
        {/* Compact Production AI Icon with Online Pulse */}
        <div className="relative w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-teal-700" />
        </div>

        {/* Compact Single-Line Badge Typography */}
        <div className="flex items-center gap-1.5 text-left">
          <span className="font-bold text-2xs tracking-wide text-white uppercase">
            MEDISAFE AI
          </span>
          <span className="w-1 h-1 rounded-full bg-teal-200/60" />
          <span className="text-3xs font-medium text-teal-100 uppercase tracking-wider">
            COPILOT
          </span>
          <span className="inline-flex items-center gap-1 text-3xs font-semibold text-emerald-200 ml-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
            ONLINE
          </span>
        </div>

        {/* Sleek Tooltip on Hover */}
        {isHovered && (
          <div className="absolute -top-9 right-0 px-2.5 py-1 rounded-lg bg-slate-900 text-slate-100 text-3xs font-medium shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-150 border border-slate-700 pointer-events-none">
            Ask MediSafe AI (Ctrl + Space)
          </div>
        )}
      </button>
    </div>
  );
}

