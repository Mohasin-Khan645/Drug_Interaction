import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import MediSafeAITrigger from './MediSafeAITrigger';
import MediSafeAIPanel from './MediSafeAIPanel';
import aiService from '../../../services/aiService';

export default function MediSafeAI({
  activeFinding = null,
  initialOpen = false,
  className = '',
}) {
  const { user, currentUser, role } = useAuth();
  const currentRole = (role || currentUser?.role || user?.role || 'PATIENT').toUpperCase();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [engineHealth, setEngineHealth] = useState(null);
  const [patientContext, setPatientContext] = useState(null);
  const [systemContext, setSystemContext] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisPipeline, setAnalysisPipeline] = useState(null);

  const getRoleWelcomeMessage = (r) => {
    switch (r) {
      case 'DOCTOR':
        return {
          id: 'welcome-doctor',
          sender: 'bot',
          text:
            `👋 Hello! I'm MediSafe AI, your clinical decision support copilot for physicians.\n\n` +
            `I am calibrated to assist you with:\n` +
            `• Pharmacodynamic & pharmacokinetic collision mechanisms\n` +
            `• Organ clearance thresholds (eGFR, CrCl, hepatic impairment)\n` +
            `• Drug-drug and drug-disease interaction override evaluations\n` +
            `• Prescribing adjustments and clinical monitoring guidelines\n\n` +
            `Select a clinical prompt below or type any pharmacological inquiry.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelTag: 'DrugSafe-Clinician-v2.4',
        };
      case 'PHARMACIST':
        return {
          id: 'welcome-pharmacist',
          sender: 'bot',
          text:
            `👋 Hello! I'm MediSafe AI, your pharmacy dispensing and safety verification copilot.\n\n` +
            `I am calibrated to assist you with:\n` +
            `• Rapid inbound prescription collision fast-checks\n` +
            `• Evidence-based therapeutic substitutions & non-interacting alternatives\n` +
            `• Duplicate therapy elimination and maximum daily dosing ceilings\n` +
            `• Cockcroft-Gault CrCl calculations and FDA boxed warning verifications\n\n` +
            `Select a dispensing check below or query any order verification.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelTag: 'DrugSafe-Pharmacist-v2.4',
        };
      case 'ADMIN':
        return {
          id: 'welcome-admin',
          sender: 'bot',
          text:
            `👋 Hello! I'm MediSafe AI, your platform governance and safety engine supervisor.\n\n` +
            `I am calibrated to assist you with:\n` +
            `• Safety engine uptime, latency, and throughput telemetry\n` +
            `• 1,482 active deterministic interaction rules compendium audit\n` +
            `• NLM RxNorm and FDA DailyMed SPL ingestion pipeline health\n` +
            `• HIPAA Security Rule (45 CFR § 164.312(b)) immutable audit ledger\n\n` +
            `Select an administrative query below or inspect system status.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelTag: 'DrugSafe-Governance-v2.4',
        };
      case 'PATIENT':
      default:
        return {
          id: 'welcome-patient',
          sender: 'bot',
          text:
            `👋 Hello! I'm MediSafe AI, your personal medication safety assistant.\n\n` +
            `I can help you:\n` +
            `• Check if your medications are safe to take together\n` +
            `• Explain safety alerts and potential side effects in simple words\n` +
            `• Prepare questions to discuss with your doctor or pharmacist\n\n` +
            `Feel free to ask a question below or pick one of the quick suggestions!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelTag: 'DrugSafe-RAG-v2.4',
        };
    }
  };

  // Initial welcome message calibrated to active role
  const [messages, setMessages] = useState(() => [getRoleWelcomeMessage(currentRole)]);

  // Saved Session Conversations
  const [savedConversations, setSavedConversations] = useState([
    {
      id: 'conv-1',
      title: 'Why was aspirin flagged?',
      dateLabel: 'Today',
      messages: [
        {
          id: 'm1',
          sender: 'user',
          text: 'Why was aspirin flagged with Warfarin?',
        },
        {
          id: 'm2',
          sender: 'bot',
          text: 'Dual antithrombotic therapy results in synergistic bleeding risks.',
        },
      ],
    },
    {
      id: 'conv-2',
      title: 'Summarize active medications',
      dateLabel: 'Yesterday',
      messages: [
        {
          id: 'm3',
          sender: 'user',
          text: 'Summarize my medications',
        },
      ],
    },
  ]);

  // Load telemetry and context
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const health = await aiService.getEngineHealth();
      if (isMounted) setEngineHealth(health);

      if (currentRole === 'ADMIN') {
        const sys = aiService.getSystemContext();
        if (isMounted) setSystemContext(sys);
      } else {
        const ctx = await aiService.getPatientContext(undefined, currentRole);
        if (isMounted) setPatientContext(ctx);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [currentRole]);

  // Global hotkey: Ctrl + Space to toggle Copilot
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Update when activeFinding prop changes
  useEffect(() => {
    if (activeFinding) {
      setIsOpen(true);
      const findingMsg = {
        id: 'finding-' + Date.now(),
        sender: 'bot',
        query: `Inspection of ${activeFinding.medications?.join(' + ') || activeFinding.title}`,
        text: `Target clinical finding loaded for evaluation: ${activeFinding.summary || activeFinding.clinicalEffect}`,
        finding: activeFinding,
        evidenceSources: activeFinding.evidenceSources,
        evidenceLevel: 'Evidence-backed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelTag: 'DrugSafe-RAG-v2.4',
      };
      setMessages((prev) => [...prev, findingMsg]);
    }
  }, [activeFinding]);

  const typingIntervalRef = useRef(null);

  // Clean up any ongoing typing animation when component unmounts
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleSendMessage = async (queryText) => {
    const q = queryText.trim();
    if (!q || isLoading) return;

    // Abort previous typing stream if user sends a new message quickly
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const aiResponse = await aiService.getAIResponse(
        q,
        patientContext,
        currentRole,
        activeFinding
      );

      const botId = 'bot-' + Date.now();
      const fullText = aiResponse.text || '';
      const isTest = typeof process !== 'undefined' && (process.env?.NODE_ENV === 'test' || process.env?.VITEST);

      if (isTest || !fullText) {
        // Direct assignment in automated test runs
        const botMsg = {
          ...aiResponse,
          id: botId,
          sender: 'bot',
          text: fullText,
          isTyping: false,
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsLoading(false);
        return;
      }

      // Progressive typing stream: Start typing immediately
      const botMsgPlaceholder = {
        ...aiResponse,
        id: botId,
        sender: 'bot',
        text: '',
        isTyping: true,
      };

      setMessages((prev) => [...prev, botMsgPlaceholder]);
      setIsLoading(false);

      // Stream words smoothly (2 words every 16ms -> ~125 words/sec)
      const words = fullText.split(' ');
      let currentWordIndex = 0;
      const chunkSize = 2;
      const intervalMs = 16;

      typingIntervalRef.current = setInterval(() => {
        currentWordIndex += chunkSize;
        const currentText = words.slice(0, currentWordIndex).join(' ');
        const isDone = currentWordIndex >= words.length;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  text: isDone ? fullText : currentText,
                  isTyping: !isDone,
                }
              : m
          )
        );

        if (isDone) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      }, intervalMs);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'bot',
          text: 'AI explanation temporarily unavailable. Safety engine deterministic rules remain active.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelTag: 'DrugSafe-SystemFallback',
          isTyping: false,
        },
      ]);
      setIsLoading(false);
    }
  };

  const handleRunSafetyAnalysis = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setAnalysisPipeline({
      currentStep: 0,
      currentStepLabel: 'Loading authorized patient context...',
    });

    try {
      const analysisResult = await aiService.runSafetyAnalysis(
        patientContext?.id,
        patientContext?.medications,
        currentRole,
        (stepIndex, stepLabel) => {
          setAnalysisPipeline({
            currentStep: stepIndex,
            currentStepLabel: stepLabel,
          });
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          ...analysisResult,
          sender: 'bot',
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          sender: 'bot',
          text: 'Safety analysis could not be completed at this time.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelTag: 'DrugSafe-Fallback',
        },
      ]);
    } finally {
      setAnalysisPipeline(null);
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    if (messages.length > 1) {
      const firstUserMsg = messages.find((m) => m.sender === 'user');
      const newSaved = {
        id: 'conv-' + Date.now(),
        title: firstUserMsg ? firstUserMsg.text : 'Safety Consultation',
        dateLabel: 'Today',
        messages: [...messages],
      };
      setSavedConversations((prev) => [newSaved, ...prev]);
    }

    setMessages([getRoleWelcomeMessage(currentRole)]);
  };

  const handleSelectConversation = (conv) => {
    if (conv.messages) {
      setMessages(conv.messages);
    }
  };

  const handleClearHistory = () => {
    setSavedConversations([]);
  };

  return (
    <div className={className}>
      {/* Collapsed Cyber-Clinical Floating Trigger */}
      <MediSafeAITrigger
        isOpen={isOpen}
        onClick={() => setIsOpen(true)}
        isEngineOnline={engineHealth?.safetyEngine === 'ONLINE'}
      />

      {/* Expanded Cyber-Clinical AI Command Center Drawer */}
      <MediSafeAIPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onMinimize={() => setIsOpen(false)}
        role={currentRole}
        engineHealth={engineHealth}
        patientContext={patientContext}
        systemContext={systemContext}
        messages={messages}
        isLoading={isLoading}
        analysisPipeline={analysisPipeline}
        savedConversations={savedConversations}
        onSendMessage={handleSendMessage}
        onRunSafetyAnalysis={handleRunSafetyAnalysis}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onClearHistory={handleClearHistory}
        onRegenerate={() => {
          const lastUser = [...messages].reverse().find((m) => m.sender === 'user');
          if (lastUser) handleSendMessage(lastUser.text);
        }}
      />
    </div>
  );
}

