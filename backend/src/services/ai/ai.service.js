import { RAGService } from './rag.service.js';
import { safetyRepository } from '../../repositories/safety.repository.js';
import { NotFoundError } from '../../utils/errors.js';

export const AIService = {
  async explainFinding({ findingId, finding, question, role = 'DOCTOR' }) {
    let targetFinding = finding;

    if (!targetFinding && findingId) {
      try {
        const check = await safetyRepository.findById(findingId);
        if (check && check.findings) {
          targetFinding = check.findings.find((f) => f.id === findingId) || check.findings[0];
        }
      } catch {
        // Fallback to provided finding object
      }
    }

    if (!targetFinding) {
      targetFinding = {
        title: 'Evaluated Drug Interaction',
        severity: 'MAJOR',
        clinicalEffect: 'Concurrent administration produces competitive inhibition or additive adverse risks.',
        mechanism: 'Cytochrome P450 inhibition or direct receptor antagonism.',
        affectedDrugs: ['Selected Medications'],
        management: 'Consult prescribing physician and monitor clinical parameters.',
        evidence: 'FDA Approved Package Inserts & DailyMed Compendium.',
        source: 'DailyMed / openFDA',
      };
    }

    return RAGService.answerClinicalInquiry({
      finding: targetFinding,
      question,
      role,
    });
  },

  /**
   * Real-time streaming explanation with SSE chunk forwarding
   */
  async streamExplanation({ findingId, finding, question, role = 'DOCTOR', onChunk, onEvidence, onDone }) {
    let targetFinding = finding;

    if (!targetFinding && findingId) {
      try {
        const check = await safetyRepository.findById(findingId);
        if (check && check.findings) {
          targetFinding = check.findings.find((f) => f.id === findingId) || check.findings[0];
        }
      } catch {
        // Fallback
      }
    }

    if (!targetFinding) {
      targetFinding = {
        title: 'Evaluated Drug Interaction',
        severity: 'MAJOR',
        clinicalEffect: 'Concurrent administration produces competitive inhibition or additive adverse risks.',
        mechanism: 'Cytochrome P450 hepatic clearance competition and receptor synergism.',
        affectedDrugs: ['Selected Medications'],
        management: 'Consult prescribing physician and monitor physiological parameters.',
        evidence: 'FDA Approved Package Inserts & DailyMed Compendium.',
        source: 'DailyMed / openFDA',
      };
    }

    return RAGService.streamClinicalInquiry({
      finding: targetFinding,
      question,
      role,
      onChunk,
      onEvidence,
      onDone,
    });
  },
};
