import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, RotateCcw, Bot, User } from 'lucide-react';

export default function MediSafeAIPanel({
  isOpen = false,
  onClose,
  onMinimize,
  role = 'PATIENT',
  messages = [],
  isLoading = false,
  onSendMessage,
  onNewConversation,
  className = '',
}) {
  const [inputQuery, setInputQuery] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const q = inputQuery.trim();
    if (!q || isLoading) return;
    onSendMessage(q);
    setInputQuery('');
  };

  const currentRole = (role || 'PATIENT').toUpperCase();

  const getQuickPrompts = () => {
    switch (currentRole) {
      case 'DOCTOR':
        return [
          { label: '🔬 Warfarin + Aspirin Mechanism', text: 'Explain the pharmacodynamic interaction between Warfarin and Aspirin' },
          { label: '⚠️ Clarithromycin + Simvastatin', text: 'What is the CYP3A4 collision mechanism between Clarithromycin and Simvastatin?' },
          { label: '🩺 Lisinopril + Spironolactone', text: 'What are the clinical hyperkalemia precautions for Lisinopril and Spironolactone?' },
          { label: '📉 Renal Dosage Adjustment', text: 'What are the dosage adjustments for Metformin in renal impairment?' },
          { label: '📋 Medication Reconciliation', text: 'Outline the medication reconciliation protocol' },
        ];
      case 'PHARMACIST':
        return [
          { label: '💊 Drug Collision Fast-Check', text: 'How do I fast-screen inbound prescriptions for critical interactions?' },
          { label: '🔄 Therapeutic Alternatives', text: 'What are safe therapeutic alternatives for Clarithromycin in a statin patient?' },
          { label: '🧪 Statin + Macrolide Interaction', text: 'Explain the rhabdomyolysis hazard with macrolides and statins' },
          { label: '⚖️ Cockcroft-Gault CrCl Guide', text: 'How do I calculate Cockcroft-Gault CrCl for renal medication dosing?' },
          { label: '📦 FDA Boxed Warnings', text: 'What are the primary boxed warnings for high-risk anticoagulants?' },
        ];
      case 'ADMIN':
        return [
          { label: '⚙️ Safety Engine Status', text: 'What is the operational status and uptime of the DrugSafe safety engine?' },
          { label: '🔄 DailyMed & RxNorm Pipelines', text: 'When were the DailyMed and RxNorm pipelines last synchronized?' },
          { label: '🛡️ Active Clinical Rules (1,482)', text: 'How many algorithmic clinical interaction rules are active?' },
          { label: '🔒 Audit Log Compliance', text: 'Explain the HIPAA compliance and immutable audit logging architecture' },
          { label: '👥 Role Access & Surveillance', text: 'How are clinical role boundaries and permissions enforced in DrugSafe?' },
        ];
      case 'PATIENT':
      default:
        return [
          { label: '💊 Warfarin + Aspirin', text: 'Why was Warfarin flagged with Aspirin?' },
          { label: '📋 My Medications', text: 'Summarize my active medications' },
          { label: '⚠️ Explain Safety Alerts', text: 'Explain my safety findings' },
          { label: '🍽️ Food Interactions', text: 'What foods should I avoid with my medicines?' },
          { label: '🩺 Questions for Doctor', text: 'What should I discuss with my doctor?' },
        ];
    }
  };

  const quickPrompts = getQuickPrompts();

  const roleLabel = {
    PATIENT: 'Patient',
    DOCTOR: 'Physician',
    PHARMACIST: 'Pharmacist',
    ADMIN: 'Admin',
  }[currentRole] || currentRole;

  const roleTheme = {
    PATIENT: {
      headerBg: 'bg-teal-600',
      headerText: 'text-white',
      badgeBg: 'bg-teal-950/40 border-teal-300/40 text-teal-100',
      statusDot: 'bg-emerald-300',
      userBubble: 'bg-teal-600 text-white',
      sendBtn: 'bg-teal-600 hover:bg-teal-500',
      focusRing: 'focus:ring-teal-500',
      quickHover: 'hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-300',
      iconColor: 'text-teal-600 dark:text-teal-400',
      iconBg: 'bg-teal-600/15 dark:bg-teal-500/20',
      cursor: 'bg-teal-500',
    },
    DOCTOR: {
      headerBg: 'bg-blue-600',
      headerText: 'text-white',
      badgeBg: 'bg-blue-950/40 border-blue-300/40 text-blue-100',
      statusDot: 'bg-blue-300',
      userBubble: 'bg-blue-600 text-white',
      sendBtn: 'bg-blue-600 hover:bg-blue-500',
      focusRing: 'focus:ring-blue-500',
      quickHover: 'hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
      iconBg: 'bg-blue-600/15 dark:bg-blue-500/20',
      cursor: 'bg-blue-500',
    },
    PHARMACIST: {
      headerBg: 'bg-emerald-600',
      headerText: 'text-white',
      badgeBg: 'bg-emerald-950/40 border-emerald-300/40 text-emerald-100',
      statusDot: 'bg-emerald-300',
      userBubble: 'bg-emerald-600 text-white',
      sendBtn: 'bg-emerald-600 hover:bg-emerald-500',
      focusRing: 'focus:ring-emerald-500',
      quickHover: 'hover:bg-emerald-50 dark:hover:bg-slate-700 hover:text-emerald-600 dark:hover:text-emerald-300',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-600/15 dark:bg-emerald-500/20',
      cursor: 'bg-emerald-500',
    },
    ADMIN: {
      headerBg: 'bg-purple-700',
      headerText: 'text-white',
      badgeBg: 'bg-purple-950/40 border-purple-300/40 text-purple-100',
      statusDot: 'bg-purple-300',
      userBubble: 'bg-purple-700 text-white',
      sendBtn: 'bg-purple-700 hover:bg-purple-600',
      focusRing: 'focus:ring-purple-500',
      quickHover: 'hover:bg-purple-50 dark:hover:bg-slate-700 hover:text-purple-600 dark:hover:text-purple-300',
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-600/15 dark:bg-purple-500/20',
      cursor: 'bg-purple-500',
    },
  }[currentRole] || {
    headerBg: 'bg-teal-600',
    headerText: 'text-white',
    badgeBg: 'bg-teal-950/40 border-teal-300/40 text-teal-100',
    statusDot: 'bg-emerald-300',
    userBubble: 'bg-teal-600 text-white',
    sendBtn: 'bg-teal-600 hover:bg-teal-500',
    focusRing: 'focus:ring-teal-500',
    quickHover: 'hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-600 dark:hover:text-teal-300',
    iconColor: 'text-teal-600 dark:text-teal-400',
    iconBg: 'bg-teal-600/15 dark:bg-teal-500/20',
    cursor: 'bg-teal-500',
  };

  const roleFooterNotice = {
    PATIENT: 'DrugSafe Personal Safety • Always consult your doctor or pharmacist before changing any medication.',
    DOCTOR: 'DrugSafe Clinician Decision Support • Grounded in FDA & NLM compendia • Physician authorization required.',
    PHARMACIST: 'DrugSafe Pharmacy Dispensing • Verify monograph & CrCl dosing prior to dispensing release.',
    ADMIN: 'DrugSafe Platform Supervisor • Real-time audit logging & 1,482 deterministic rules active.',
  }[currentRole] || 'DrugSafe Decision Support • Consult a healthcare provider for medical advice.';

  return (
    <div
      className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[410px] h-[560px] max-h-[calc(100vh-3rem)] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800 dark:text-slate-100 ${className}`}
    >
      {/* 1. Clean, Simple Header with Authorized Role Pill */}
      <div className={`px-4 py-3 ${roleTheme.headerBg} text-white flex items-center justify-between shadow-sm shrink-0`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shadow-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-wide">DrugSafe Assistant</h3>
              <span className={`px-1.5 py-0.2 rounded text-3xs font-mono font-bold ${roleTheme.badgeBg} border uppercase`}>
                {roleLabel} · Authorized
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/90">
              <span className={`w-2 h-2 rounded-full ${roleTheme.statusDot} animate-pulse`} />
              <span>Online • Ready to help</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onNewConversation && (
            <button
              type="button"
              onClick={onNewConversation}
              title="Reset conversation"
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Close Assistant"
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Spacious Message Stream */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/40">
        {messages.map((msg, idx) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id || idx}
              className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className={`w-7 h-7 rounded-full ${roleTheme.iconBg} ${roleTheme.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed max-w-[85%] ${
                  isUser
                    ? `${roleTheme.userBubble} rounded-tr-xs shadow-xs`
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs border border-slate-200 dark:border-slate-700/80 shadow-xs'
                }`}
              >
                {/* Message Content */}
                <div className="whitespace-pre-wrap font-sans space-y-2">
                  {msg.text}
                  {msg.isTyping && (
                    <span className={`inline-block w-1.5 h-3.5 ml-1 ${roleTheme.cursor} animate-pulse align-middle rounded-2xs`} />
                  )}
                </div>

                {/* Optional Timestamp */}
                <div
                  className={`text-3xs mt-1 text-right ${
                    isUser ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {msg.timestamp || 'Just now'}
                </div>
              </div>

              {isUser && (
                <div className={`w-7 h-7 rounded-full ${roleTheme.headerBg} text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}>
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator when waiting */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs pl-2">
            <div className={`w-6 h-6 rounded-full ${roleTheme.iconBg} flex items-center justify-center ${roleTheme.iconColor}`}>
              <Sparkles className="w-3 h-3 animate-spin" />
            </div>
            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className={`w-1.5 h-1.5 rounded-full ${roleTheme.cursor} animate-bounce`} />
              <span className={`w-1.5 h-1.5 rounded-full ${roleTheme.cursor} animate-bounce [animation-delay:0.2s]`} />
              <span className={`w-1.5 h-1.5 rounded-full ${roleTheme.cursor} animate-bounce [animation-delay:0.4s]`} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Compact Quick Question Pills */}
      <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            type="button"
            disabled={isLoading}
            onClick={() => onSendMessage(p.text)}
            className={`px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 ${roleTheme.quickHover} text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-3xs font-medium whitespace-nowrap transition-colors shadow-2xs shrink-0`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 4. Simple Chat Input */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputQuery}
            disabled={isLoading}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask about medications, interactions, or safety..."
            className={`flex-1 py-2 px-3.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 rounded-xl text-xs focus:outline-none focus:ring-2 ${roleTheme.focusRing} border border-transparent dark:border-slate-700`}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={`p-2 rounded-xl ${roleTheme.sendBtn} text-white disabled:opacity-40 transition-colors shadow-xs`}
            title="Send question"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-3xs text-center text-slate-400 dark:text-slate-500 mt-1.5">
          {roleFooterNotice}
        </p>
      </div>
    </div>
  );
}
