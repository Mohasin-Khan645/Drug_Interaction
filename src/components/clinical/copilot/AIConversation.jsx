import React, { useRef, useEffect } from 'react';
import { Sparkles, MessageSquare, Plus, Trash2, Clock, History, AlertCircle } from 'lucide-react';
import AIMessage from './AIMessage';
import AIAnalysisPipeline from './AIAnalysisPipeline';

export default function AIConversation({
  messages = [],
  isLoading = false,
  analysisPipeline = null, // { currentStep: number, currentStepLabel: string }
  isHistoryView = false,
  savedConversations = [],
  onSelectConversation,
  onNewConversation,
  onClearHistory,
  onRegenerate,
  className = '',
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!isHistoryView && typeof bottomRef.current?.scrollIntoView === 'function') {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, analysisPipeline, isHistoryView]);

  // History Drawer View
  if (isHistoryView) {
    return (
      <div className={`p-4 space-y-4 font-mono text-2xs overflow-y-auto h-full ${className}`}>
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <History className="w-3.5 h-3.5" />
            <span>RECENT INQUIRIES</span>
          </div>

          <button
            type="button"
            onClick={onNewConversation}
            className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/80 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>New Chat</span>
          </button>
        </div>

        {savedConversations.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-3xs">
            No saved prior inquiries for this clinical session.
          </div>
        ) : (
          <div className="space-y-2">
            {savedConversations.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectConversation(c)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 transition-colors space-y-1 group"
              >
                <div className="flex items-center justify-between text-3xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>{c.dateLabel || 'Today'}</span>
                  </span>
                  <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <p className="text-white font-sans text-xs truncate">
                  "{c.title || c.firstQuery}"
                </p>
              </button>
            ))}
          </div>
        )}

        {savedConversations.length > 0 && (
          <div className="pt-4 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 transition-colors text-3xs"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear Session History</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 space-y-4 overflow-y-auto ${className}`}>
      {/* Empty Initial Conversation State */}
      {messages.length === 0 && !isLoading && !analysisPipeline && (
        <div className="text-center py-10 space-y-3 font-mono">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-wider uppercase">
              CLINICAL COPILOT READY
            </h4>
            <p className="text-2xs text-slate-400 font-sans mt-1 max-w-xs mx-auto">
              Ask about potential drug-drug interactions, adverse mechanism pathways, or request an automated multi-stage safety analysis.
            </p>
          </div>
        </div>
      )}

      {/* Messages Stream */}
      {messages.map((m) => (
        <AIMessage
          key={m.id}
          message={m}
          onRegenerate={onRegenerate}
        />
      ))}

      {/* Live Stepped Analysis Pipeline Display */}
      {analysisPipeline && (
        <AIAnalysisPipeline
          currentStep={analysisPipeline.currentStep}
          currentStepLabel={analysisPipeline.currentStepLabel}
        />
      )}

      {/* Standard Loading Skeletons */}
      {isLoading && !analysisPipeline && (
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-white shadow-xl space-y-3 animate-pulse">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="h-3 w-36 bg-cyan-950/60 rounded" />
            <div className="h-3 w-16 bg-slate-800 rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full bg-slate-800 rounded" />
            <div className="h-3 w-5/6 bg-slate-800 rounded" />
            <div className="h-3 w-2/3 bg-slate-800 rounded" />
          </div>
          <div className="flex items-center gap-2 pt-2 text-3xs font-mono text-cyan-400">
            <Sparkles className="w-3 h-3 animate-spin" />
            <span>Retrieving grounded clinical evidence...</span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
