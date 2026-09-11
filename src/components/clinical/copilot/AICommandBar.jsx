import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Mic, MicOff, Terminal, Sparkles, X } from 'lucide-react';

export default function AICommandBar({
  onSendMessage,
  isLoading = false,
  placeholder = '> Ask MediSafe AI...',
  className = '',
}) {
  const [inputQuery, setInputQuery] = useState('');
  const [showVoiceTooltip, setShowVoiceTooltip] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const q = inputQuery.trim();
    if (!q || isLoading) return;
    onSendMessage(q);
    setInputQuery('');
  };

  const handleKeyDown = (e) => {
    // Ctrl + Enter or Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={`p-3 bg-slate-900 border-t border-slate-800 relative ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-1.5">
        <div className="relative flex items-center rounded-xl bg-slate-800/90 border border-slate-700/80 focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-400 transition-all">
          {/* Friendly prompt symbol */}
          <div className="pl-3 pr-1 text-teal-400 text-sm select-none font-medium">
            &gt;
          </div>

          {/* Natural Language Command Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            disabled={isLoading}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full py-2.5 px-2 bg-transparent text-xs text-white placeholder-slate-400 font-sans focus:outline-none disabled:opacity-50"
          />

          {/* Clear Input Button */}
          {inputQuery && (
            <button
              type="button"
              onClick={() => setInputQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Disabled Voice Dictation Button (with readiness tooltip) */}
          <div className="relative">
            <button
              type="button"
              disabled
              onMouseEnter={() => setShowVoiceTooltip(true)}
              onMouseLeave={() => setShowVoiceTooltip(false)}
              className="p-1.5 text-slate-500 cursor-not-allowed hover:text-slate-400 transition-colors"
              title="Voice Dictation"
            >
              <MicOff className="w-3.5 h-3.5" />
            </button>

            {showVoiceTooltip && (
              <div className="absolute -top-12 right-0 px-2 py-1 rounded bg-slate-800 border border-slate-700 text-3xs text-slate-300 shadow-xl whitespace-nowrap z-50">
                Voice input interface ready for clinical audio stream
              </div>
            )}
          </div>

          {/* Send Action Trigger */}
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="m-1 p-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white disabled:bg-slate-700 disabled:text-slate-500 transition-colors focus:outline-none shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Console Footnote with Keyboard Shortcut Hint */}
        <div className="flex items-center justify-between px-1 text-3xs text-slate-400">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-teal-400/80" />
            <span>Ask in plain English or clinical terms</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Ctrl
            </span>
            <span>+</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
              Enter
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}

