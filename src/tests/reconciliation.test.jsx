import { describe, it, expect } from 'vitest';
import { handleMockRequest } from '../api/mock/mockAdapter';

describe('Medication Reconciliation & Safety Detection', () => {
  it('detects duplicate active ingredient therapies and conflicts via reconciliation engine', async () => {
    const response = await handleMockRequest({
      url: '/reconciliation',
      method: 'post',
      data: {
        patientId: 'pt-101',
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.discrepancies.length).toBeGreaterThan(0);

    const dup = response.data.discrepancies.find((d) => d.type === 'DUPLICATE_THERAPY');
    expect(dup).toBeDefined();
    expect(dup.primaryMedication).toContain('Tylenol');
    expect(dup.reason).toContain('Acetaminophen');
  });

  it('detects critical drug interactions such as Warfarin + Aspirin', async () => {
    const response = await handleMockRequest({
      url: '/safety/check',
      method: 'post',
      data: {
        drugs: ['Warfarin', 'Aspirin'],
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.overallSafetyStatus).toBe('CRITICAL_CONCERN');
    expect(response.data.groupedFindings.CRITICAL.length).toBeGreaterThan(0);
    expect(response.data.groupedFindings.CRITICAL[0].title).toContain('Hemorrhage Risk');
  });

  it('detects major contraindications such as Simvastatin + Clarithromycin', async () => {
    const response = await handleMockRequest({
      url: '/safety/check',
      method: 'post',
      data: {
        drugs: ['Simvastatin', 'Clarithromycin'],
      },
    });

    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
    expect(response.data.overallSafetyStatus).toBe('CRITICAL_CONCERN');
    const myopathyFinding = response.data.findings.find((f) => f.title.includes('Rhabdomyolysis'));
    expect(myopathyFinding).toBeDefined();
  });
});
