import React from 'react';
import { User, Sparkles, Terminal } from 'lucide-react';
import AIFindingCard from './AIFindingCard';
import AIActionBar from './AIActionBar';

export default function AIMessage({
  message,
  onRegenerate,
  className = '',
}) {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div className={`flex items-start justify-end gap-2 text-2xs ${className}`}>
        <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-xs bg-teal-600 text-white shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-1 text-3xs text-teal-100 font-medium">
            <span>You</span>
            <span>{message.timestamp || 'Just now'}</span>
          </div>
          <p className="text-xs leading-relaxed font-sans text-white">
            {message.text}
          </p>
        </div>
        <div className="w-7 h-7 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
          <User className="w-3.5 h-3.5" />
        </div>
      </div>
    );
  }

  // MediSafe AI Message
  if (message.finding) {
    return (
      <AIFindingCard
        finding={message.finding}
        queryText={message.query}
        explanationText={message.text}
        evidenceSources={message.evidenceSources}
        evidenceLevel={message.evidenceLevel}
        knowledgeGraph={message.knowledgeGraph}
        modelTag={message.modelTag}
        timestamp={message.timestamp}
        onRegenerate={onRegenerate}
        className={className}
      />
    );
  }

  return (
    <div className={`p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-white shadow-sm space-y-2.5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/80 pb-2 text-3xs">
        <div className="flex items-center gap-1.5 text-teal-300">
          <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-bold tracking-wider uppercase">MEDISAFE AI CLINICAL INTELLIGENCE</span>
        </div>
        <span className="text-slate-400">{message.timestamp || 'Just now'}</span>
      </div>

      {/* Message Body */}
      <div className="text-2xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
        {message.text}
      </div>

      {/* Action Bar */}
      <AIActionBar
        textToCopy={message.text}
        onRegenerate={onRegenerate}
      />
    </div>
  );
}

