import React, { useState } from 'react';
import { Copy, Check, RotateCw, BookOpen, ThumbsUp, ThumbsDown } from 'lucide-react';

export default function AIActionBar({
  textToCopy = '',
  onRegenerate,
  onViewEvidence,
  className = '',
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'helpful' | 'unhelpful' | null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className={`flex items-center justify-between pt-2 border-t border-slate-800/80 text-3xs font-mono text-slate-400 ${className}`}>
      {/* Evidence & Action Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
          title="Copy Response"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>

        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
            title="Regenerate"
          >
            <RotateCw className="w-3 h-3" />
            <span>Regenerate</span>
          </button>
        )}

        {onViewEvidence && (
          <button
            type="button"
            onClick={onViewEvidence}
            className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400/50 transition-colors"
          >
            <BookOpen className="w-3 h-3" />
            <span>View Evidence</span>
          </button>
        )}
      </div>

      {/* Helpful / Not Helpful Utility Feedback */}
      <div className="flex items-center gap-1">
        <span className="text-slate-500 mr-1 hidden sm:inline">Helpful?</span>
        <button
          type="button"
          onClick={() => setFeedback(feedback === 'helpful' ? null : 'helpful')}
          className={`p-1 rounded hover:bg-slate-800 transition-colors ${
            feedback === 'helpful' ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Helpful"
        >
          <ThumbsUp className="w-3 h-3" />
        </button>
        <button
          type="button"
          onClick={() => setFeedback(feedback === 'unhelpful' ? null : 'unhelpful')}
          className={`p-1 rounded hover:bg-slate-800 transition-colors ${
            feedback === 'unhelpful' ? 'text-rose-400 bg-rose-950/60' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Not helpful"
        >
          <ThumbsDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

