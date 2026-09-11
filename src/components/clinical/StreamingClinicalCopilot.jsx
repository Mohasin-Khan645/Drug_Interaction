import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  Send,
  Square,
  Copy,
  Check,
  RotateCcw,
  Activity,
  Cpu,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Pill,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import SeverityBadge from '../common/SeverityBadge';
import { safetyApi } from '../../api/safetyApi';

export default function StreamingClinicalCopilot({
  isOpen,
  onClose,
  finding,
  initialQuestion = 'What is the clinical safety impact and underlying mechanism of this interaction?',
}) {
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [inquiryQuestion, setInquiryQuestion] = useState(initialQuestion);
  const [evidenceList, setEvidenceList] = useState([]);
  const [completionMeta, setCompletionMeta] = useState(null);
  const [streamError, setStreamError] = useState(null);
  const [hasCopied, setHasCopied] = useState(false);

  const abortControllerRef = useRef(null);
  const textContainerRef = useRef(null);

  // Suggested high-yield clinical questions
  const SUGGESTED_QUESTIONS = [
    'Can we stagger dosing to bypass competitive peak absorption?',
    'What non-interacting therapeutic alternatives are recommended?',
    'Explain the metabolic CYP pathway and renal excretion dynamics.',
  ];

  // Start real-time stream
  const startStream = async (questionToAsk) => {
    if (!finding) return;

    // Abort any ongoing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStreamedText('');
    setEvidenceList([]);
    setCompletionMeta(null);
    setStreamError(null);
    setIsStreaming(true);

    await safetyApi.streamExplainFinding(
      {
        findingId: finding.id,
        finding,
        question: questionToAsk || inquiryQuestion,
      },
      {
        signal: controller.signal,
        onInit: () => {
          setIsStreaming(true);
        },
        onChunk: ({ token }) => {
          setStreamedText((prev) => prev + token);
          if (textContainerRef.current) {
            textContainerRef.current.scrollTop = textContainerRef.current.scrollHeight;
          }
        },
        onEvidence: (citations) => {
          setEvidenceList(citations);
        },
        onDone: (summary) => {
          setCompletionMeta(summary);
          setIsStreaming(false);
        },
        onError: (err) => {
          setStreamError(err.message || 'Stream connection interrupted');
          setIsStreaming(false);
        },
      }
    );
  };

  // Automatically start streaming when modal opens for a finding
  useEffect(() => {
    if (isOpen && finding) {
      setInquiryQuestion(initialQuestion);
      startStream(initialQuestion);
    }
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isOpen, finding?.id]);

  const handleStopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  };

  const handleCopy = () => {
    if (!streamedText) return;
    navigator.clipboard.writeText(streamedText);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!inquiryQuestion.trim() || isStreaming) return;
    startStream(inquiryQuestion.trim());
  };

  if (!isOpen || !finding) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-700">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div className="text-left">
            <span className="text-sm font-black tracking-tight text-slate-900 block">
              DrugSafe Real-Time Clinical Copilot
            </span>
            <span className="text-2xs font-semibold text-teal-700 uppercase tracking-widest block">
              Grounded Pharmacological Intelligence Engine
            </span>
          </div>
        </div>
      }
      subtitle={null}
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-2xs text-slate-500 font-mono">
            <Activity className="w-3.5 h-3.5 text-teal-600 animate-pulse" />
            <span>Telemetry: {isStreaming ? 'STREAMING ACTIVE' : 'COMPLETE'}</span>
            {completionMeta?.confidenceScore && (
              <span className="px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-bold">
                Confidence: {(completionMeta.confidenceScore * 100).toFixed(1)}%
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isStreaming ? (
              <Button variant="danger" size="sm" onClick={handleStopStream} className="text-xs">
                <Square className="w-3 h-3 mr-1 fill-current" /> Stop Stream
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => startStream(inquiryQuestion)}
                className="text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Re-Analyze
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              disabled={!streamedText}
              className="text-xs"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Summary
                </>
              )}
            </Button>

            <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
              Close Copilot
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* 3D Medical EKG Waveform Banner */}
        <div className="relative overflow-hidden rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-950 via-slate-900 to-teal-950 p-4 text-white shadow-3d">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 600 80" preserveAspectRatio="none">
              <path
                className="ekg-wave"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                d="M0,40 L120,40 L130,10 L140,70 L150,20 L160,50 L170,40 L320,40 L330,10 L340,70 L350,20 L360,50 L370,40 L600,40"
              />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center shrink-0 shadow-glow-teal">
                <Pill className="w-5 h-5 -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xs font-black uppercase tracking-wider text-teal-400">
                    Live Instance Evaluation
                  </span>
                  <SeverityBadge severity={finding.severity} size="sm" />
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight mt-0.5">
                  {finding.title || finding.interactionTitle || 'Identified Pharmacological Conflict'}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-900/80 border border-teal-500/30 px-3 py-1.5 rounded-lg text-2xs font-mono text-teal-300">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></div>
              <span>RxNorm Linked</span>
            </div>
          </div>
        </div>

        {/* Real-Time Streaming Terminal Display */}
        <div className="relative rounded-2xl glass-hud-dark border border-teal-500/30 shadow-3d overflow-hidden">
          {/* Terminal Titlebar */}
          <div className="px-4 py-2 bg-slate-900/90 border-b border-teal-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
              <span className="text-3xs font-mono text-slate-400 ml-2">
                DRUGSAFE_STREAM_PROCESSOR // PID: 7492
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-3xs font-mono text-teal-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-400 animate-spin" />
                {isStreaming ? 'SYNTHESIZING REAL-TIME TOKENS' : 'SYNTHESIS SECURED'}
              </span>
            </div>
          </div>

          {/* Terminal Content Body */}
          <div
            ref={textContainerRef}
            className="p-5 max-h-80 overflow-y-auto font-mono text-xs text-slate-100 space-y-3 leading-relaxed selection:bg-teal-500 selection:text-black"
          >
            {streamError ? (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>Error generating explanation: {streamError}</span>
              </div>
            ) : streamedText ? (
              <div className="whitespace-pre-wrap">
                {streamedText}
                {isStreaming && <span className="ai-cursor"></span>}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <div className="inline-block p-2 rounded-full bg-teal-500/10 text-teal-400 animate-spin">
                  <Sparkles className="w-5 h-5" />
                </div>
                <p className="text-xs font-mono">Initializing grounded clinical knowledge base...</p>
              </div>
            )}
          </div>
        </div>

        {/* Real-Time Interactive Inquiry Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-2xs text-slate-500 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
              Ask Specific Inquiry About This Instance
            </span>
            <span>Real-Time Stream Engine</span>
          </div>

          <form onSubmit={handleInquirySubmit} className="flex gap-2">
            <input
              type="text"
              value={inquiryQuestion}
              onChange={(e) => setInquiryQuestion(e.target.value)}
              placeholder="e.g. Can we adjust dosing, or what non-interacting alternatives exist?"
              disabled={isStreaming}
              className="flex-1 px-3.5 py-2 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600 disabled:opacity-50"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isStreaming}
              disabled={!inquiryQuestion.trim() || isStreaming}
              className="text-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Ask AI
            </Button>
          </form>

          {/* Preset Clinical Inquiry Prompts */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setInquiryQuestion(q);
                  startStream(q);
                }}
                disabled={isStreaming}
                className="text-3xs font-medium px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-600 hover:text-teal-900 transition-colors disabled:opacity-50 text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Verified Grounded Evidence Citations */}
        {evidenceList.length > 0 && (
          <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
            <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-teal-700" />
              Authoritative Compendium Evidence & Literature Links
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {evidenceList.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className="p-2.5 rounded-lg border border-slate-200/80 bg-slate-50/70 hover:bg-teal-50/40 transition-colors text-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800 font-semibold truncate max-w-[200px]">
                      {ev.source}
                    </strong>
                    <span className="px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 text-3xs font-bold">
                      {ev.evidenceLevel || 'Verified'}
                    </span>
                  </div>
                  <p className="text-slate-600 line-clamp-2">{ev.title}</p>
                  {ev.snippet && (
                    <p className="text-3xs text-slate-500 font-mono italic truncate">
                      &ldquo;{ev.snippet}&rdquo;
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mandatory Healthcare AI Regulatory Notice */}
        <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200 text-3xs text-teal-900 flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-700 shrink-0 mt-0.5" />
          <span>
            <strong>Clinical Safety Disclaimer:</strong> This real-time AI explanation is synthesized strictly from verified pharmacology compendia. It provides clinical decision-support and educational reference only, and does not replace the professional clinical judgment of licensed medical practitioners.
          </span>
        </div>
      </div>
    </Modal>
  );
}

StreamingClinicalCopilot.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  finding: PropTypes.object,
  initialQuestion: PropTypes.string,
};

