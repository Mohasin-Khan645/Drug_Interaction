import { describe, it, expect, vi } from 'vitest';
import { AIService } from '../../src/services/ai/ai.service.js';
import { defaultAIProvider } from '../../src/integrations/ai/aiProvider.js';

describe('Real-Time Streaming AI Clinical Explanation Engine', () => {
  const sampleFinding = {
    id: 'fnd-test-warfarin-aspirin',
    title: 'Severe Pharmacodynamic Hemorrhagic Synergism',
    severity: 'CONTRAINDICATED',
    clinicalEffect: 'Severe synergistic potentiation of hypoprothrombinemia and thrombocyte inhibition.',
    mechanism: 'Irreversible COX-1 platelet inactivation combined with vitamin K epoxide reductase inhibition.',
    affectedDrugs: ['Warfarin', 'Aspirin'],
    management: 'Discontinue concurrent self-administered antiplatelet therapy unless explicitly monitored by cardiology.',
    evidence: 'DailyMed Package Insert & CHEST Antithrombotic Guidelines 2024.',
    source: 'DailyMed / FDA CDER',
  };

  it('progressively streams tokens, clinical mechanism, and management protocol', async () => {
    const receivedChunks = [];
    let receivedEvidence = null;
    let completedPayload = null;

    const result = await AIService.streamExplanation({
      finding: sampleFinding,
      question: 'Can the patient take low-dose aspirin instead?',
      onChunk: async (chunk) => {
        receivedChunks.push(chunk);
      },
      onEvidence: async (citations) => {
        receivedEvidence = citations;
      },
      onDone: async (summary) => {
        completedPayload = summary;
      },
    });

    // Verify token streaming delivered multiple tokens
    expect(receivedChunks.length).toBeGreaterThan(15);
    const combinedText = receivedChunks.map((c) => c.token).join('');

    expect(combinedText).toContain('CLINICAL SAFETY ASSESSMENT');
    expect(combinedText).toContain('Molecular & Pharmacological Mechanism');
    expect(combinedText).toContain('Pharmacokinetics & Dynamic Alterations');
    expect(combinedText).toContain('Prescribing Protocol & Patient Safety Management');
    expect(combinedText).toContain('Addressing: "Can the patient take low-dose aspirin instead?"');

    // Verify verified citations
    expect(receivedEvidence).toBeDefined();
    expect(Array.isArray(receivedEvidence)).toBe(true);
    expect(receivedEvidence.length).toBeGreaterThanOrEqual(2);
    expect(receivedEvidence[0].title).toContain('Warfarin');

    // Verify completion summary
    expect(completedPayload).toBeDefined();
    expect(completedPayload.success).toBe(true);
    expect(completedPayload.confidenceScore).toBeGreaterThan(0.9);
    expect(completedPayload.disclaimer).toContain('clinical decision-support only');
  });

  it('rejects streaming when clinical evidence and finding data are missing', async () => {
    await expect(
      defaultAIProvider.streamGroundedExplanation({
        finding: {},
        evidence: null,
      })
    ).rejects.toThrow(/Insufficient verified clinical evidence/i);
  });
});

