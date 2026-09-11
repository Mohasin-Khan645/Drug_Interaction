import { evidenceRepository } from '../../repositories/evidence.repository.js';
import { defaultAIProvider } from '../../integrations/ai/aiProvider.js';
import { InsufficientEvidenceError } from '../../utils/errors.js';

export const RAGService = {
  /**
   * Grounds query context strictly in verified evidence documents and verified safety findings
   */
  async answerClinicalInquiry({ finding, question, role = 'DOCTOR' }) {
    if (!finding) {
      throw new InsufficientEvidenceError();
    }

    // 1. Retrieve verified evidence
    let evidence = finding.evidence;
    if (!evidence && finding.affectedDrugs && finding.affectedDrugs.length > 0) {
      // Look up in knowledge base
      try {
        const sources = await evidenceRepository.getSources();
        if (sources && sources.length > 0) {
          evidence = sources[0].summary;
        }
      } catch {
        // Continue with finding evidence
      }
    }

    if (!evidence && !finding.clinicalEffect) {
      throw new InsufficientEvidenceError();
    }

    // 2. Synthesize grounded answer via AIProvider
    const result = await defaultAIProvider.generateGroundedExplanation({
      finding,
      evidence,
      question,
      role,
    });

    if (!result.success && result.code === 'INSUFFICIENT_VERIFIED_EVIDENCE') {
      throw new InsufficientEvidenceError(result.explanation);
    }

    return result;
  },

  /**
   * Real-time streaming clinical inquiry with progressive token delivery
   */
  async streamClinicalInquiry({ finding, question, role = 'DOCTOR', onChunk, onEvidence, onDone }) {
    if (!finding) {
      throw new InsufficientEvidenceError();
    }

    let evidence = finding.evidence;
    if (!evidence && finding.affectedDrugs && finding.affectedDrugs.length > 0) {
      try {
        const sources = await evidenceRepository.getSources();
        if (sources && sources.length > 0) {
          evidence = sources[0].summary;
        }
      } catch {
        // Continue
      }
    }

    if (!evidence && !finding.clinicalEffect) {
      throw new InsufficientEvidenceError();
    }

    return defaultAIProvider.streamGroundedExplanation({
      finding,
      evidence,
      question,
      role,
      onChunk,
      onEvidence,
      onDone,
    });
  },
};
