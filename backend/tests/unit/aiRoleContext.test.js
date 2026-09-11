import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from '../../src/services/ai/ai.service.js';
import { RAGService } from '../../src/services/ai/rag.service.js';
import { defaultAIProvider } from '../../src/integrations/ai/aiProvider.js';

describe('Phase 9: MediSafe AI Role Context (Backend)', () => {
  const sampleFinding = {
    id: 'finding-warfarin-aspirin',
    title: 'Warfarin + Aspirin Interaction',
    severity: 'CONTRAINDICATED',
    clinicalEffect: 'Severe synergistic bleeding hazard.',
    mechanism: 'VKORC1 inhibition + irreversible platelet COX-1 acetylation.',
    affectedDrugs: ['Warfarin', 'Aspirin'],
    evidence: 'FDA Approved Package Insert and CHEST Guidelines.',
    source: 'FDA DailyMed',
  };

  describe('AIService.explainFinding Role Calibration', () => {
    it('produces patient-centered plain-language summary for PATIENT role', async () => {
      const result = await AIService.explainFinding({
        finding: sampleFinding,
        role: 'PATIENT',
      });

      expect(result.success).toBe(true);
      expect(result.role).toBe('PATIENT');
      expect(result.explanation).toContain('[PERSONAL MEDICATION SAFETY SUMMARY]');
      expect(result.explanation).toContain('In Plain Language');
      expect(result.explanation).toContain('Safe Steps For You');
      expect(result.explanation).toContain('Questions For Your Next Visit');
      expect(result.disclaimer).toContain('patient education only');
    });

    it('produces rigorous clinical evaluation for DOCTOR role', async () => {
      const result = await AIService.explainFinding({
        finding: sampleFinding,
        role: 'DOCTOR',
      });

      expect(result.success).toBe(true);
      expect(result.role).toBe('DOCTOR');
      expect(result.explanation).toContain('[AUTHORITATIVE CLINICAL EVALUATION]');
      expect(result.explanation).toContain('Pharmacological Mechanism');
      expect(result.explanation).toContain('VKORC1');
      expect(result.explanation).toContain('PK/PD');
      expect(result.explanation).toContain('Prescribing & Monitoring Guidelines');
    });

    it('produces dispensing audit & therapeutic substitution guidance for PHARMACIST role', async () => {
      const result = await AIService.explainFinding({
        finding: sampleFinding,
        role: 'PHARMACIST',
      });

      expect(result.success).toBe(true);
      expect(result.role).toBe('PHARMACIST');
      expect(result.explanation).toContain('[PHARMACY DISPENSING SAFETY AUDIT]');
      expect(result.explanation).toContain('Dispensing Triage & Verification Protocol');
      expect(result.explanation).toContain('Therapeutic Substitution & Management Options');
      expect(result.explanation).toContain('Prescriber Clarification Directive');
    });

    it('produces regulatory compliance & rule traceability for ADMIN role', async () => {
      const result = await AIService.explainFinding({
        finding: sampleFinding,
        role: 'ADMIN',
      });

      expect(result.success).toBe(true);
      expect(result.role).toBe('ADMIN');
      expect(result.explanation).toContain('[PLATFORM GOVERNANCE & SAFETY RULE TRACEABILITY]');
      expect(result.explanation).toContain('Deterministic Interaction Rule');
      expect(result.explanation).toContain('HIPAA Audit Ledger');
      expect(result.explanation).toContain('1,482 active deterministic safety rules');
    });
  });

  describe('AIService.streamExplanation Role Streaming Sections', () => {
    it('streams patient-friendly sections for PATIENT role', async () => {
      const chunkTypes = [];
      await AIService.streamExplanation({
        finding: sampleFinding,
        role: 'PATIENT',
        onChunk: async ({ type }) => {
          if (!chunkTypes.includes(type)) chunkTypes.push(type);
        },
      });

      expect(chunkTypes).toContain('header');
      expect(chunkTypes).toContain('plain_summary');
      expect(chunkTypes).toContain('warning_signs');
      expect(chunkTypes).toContain('safe_steps');
    });

    it('streams clinical biochemical sections for DOCTOR role', async () => {
      const chunkTypes = [];
      await AIService.streamExplanation({
        finding: sampleFinding,
        role: 'DOCTOR',
        onChunk: async ({ type }) => {
          if (!chunkTypes.includes(type)) chunkTypes.push(type);
        },
      });

      expect(chunkTypes).toContain('header');
      expect(chunkTypes).toContain('mechanism');
      expect(chunkTypes).toContain('pk_pd');
      expect(chunkTypes).toContain('management');
    });

    it('streams dispensing triage & alternative sections for PHARMACIST role', async () => {
      const chunkTypes = [];
      await AIService.streamExplanation({
        finding: sampleFinding,
        role: 'PHARMACIST',
        onChunk: async ({ type }) => {
          if (!chunkTypes.includes(type)) chunkTypes.push(type);
        },
      });

      expect(chunkTypes).toContain('header');
      expect(chunkTypes).toContain('dispensing_triage');
      expect(chunkTypes).toContain('alternatives');
      expect(chunkTypes).toContain('protocol');
    });

    it('streams rule provenance & HIPAA audit sections for ADMIN role', async () => {
      const chunkTypes = [];
      await AIService.streamExplanation({
        finding: sampleFinding,
        role: 'ADMIN',
        onChunk: async ({ type }) => {
          if (!chunkTypes.includes(type)) chunkTypes.push(type);
        },
      });

      expect(chunkTypes).toContain('header');
      expect(chunkTypes).toContain('rule_provenance');
      expect(chunkTypes).toContain('audit_compliance');
    });
  });
});

