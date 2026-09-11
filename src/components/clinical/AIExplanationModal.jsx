import React from 'react';
import StreamingClinicalCopilot from './StreamingClinicalCopilot';

/**
 * AIExplanationModal Wrapper
 * Automatically leverages the real-time SSE Streaming Clinical Copilot
 * with high-tech 3D aesthetic and interactive clinical inquiry.
 */
export default function AIExplanationModal({
  isOpen,
  onClose,
  finding,
  question = 'What is the clinical safety impact and underlying mechanism of this interaction?',
}) {
  return (
    <StreamingClinicalCopilot
      isOpen={isOpen}
      onClose={onClose}
      finding={finding}
      initialQuestion={question}
    />
  );
}
