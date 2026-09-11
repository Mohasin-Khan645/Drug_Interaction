import React from 'react';
import MediSafeAI from './copilot/MediSafeAI';

/**
 * AIAssistant - Backwards-compatible wrapper delegating to
 * the upgraded Cyber-Clinical MediSafe AI Copilot.
 */
export default function AIAssistant({ activeFinding = null, className = '' }) {
  return <MediSafeAI activeFinding={activeFinding} className={className} />;
}
