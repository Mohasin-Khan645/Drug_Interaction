import { describe, it, expect } from 'vitest';
import { handleMockRequest } from '../api/mock/mockAdapter';

describe('Clinical Decision Support & OCR Journeys', () => {
  it('searches formulary drugs by active ingredient or brand name', async () => {
    const res = await handleMockRequest({
      url: '/drugs',
      method: 'get',
      params: { search: 'Warfarin' },
    });

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);
    expect(res.data.data[0].genericName).toContain('Warfarin');
  });

  it('filters formulary drugs by pharmacological drug class', async () => {
    const res = await handleMockRequest({
      url: '/drugs',
      method: 'get',
      params: { drugClass: 'Aminopenicillin Antibiotic' },
    });

    expect(res.status).toBe(200);
    expect(res.data.data.every((d) => d.drugClass === 'Aminopenicillin Antibiotic')).toBe(true);
    expect(res.data.data[0].name).toBe('Amoxil');
  });

  it('processes prescription OCR extraction and returns confidence ratings', async () => {
    const res = await handleMockRequest({
      url: '/prescriptions/upload',
      method: 'post',
      data: {},
    });

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.detectedMedications.length).toBe(3);

    const highConf = res.data.detectedMedications.find((m) => m.confidence === 'High');
    expect(highConf).toBeDefined();
    expect(highConf.normalizedName).toBe('Amoxicillin');

    const lowConf = res.data.detectedMedications.find((m) => m.confidence === 'Low');
    expect(lowConf).toBeDefined();
    expect(lowConf.flagWarning).toContain('Please verify this medication manually');
  });

  it('evaluates multi-agent drug combination and returns prioritized severity groupings', async () => {
    const res = await handleMockRequest({
      url: '/interactions/check',
      method: 'post',
      data: {
        drugs: ['Warfarin', 'Aspirin', 'Lisinopril'],
      },
    });

    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.overallSafetyStatus).toBe('CRITICAL_CONCERN');
    expect(res.data.groupedFindings.CRITICAL.length).toBeGreaterThan(0);
    expect(res.data.totalFindings).toBeGreaterThan(0);
  });

  it('submits clinician review decision and creates audit entry', async () => {
    const reviewPayload = {
      findingId: 'fnd-wf-asp',
      patientId: 'pt-101',
      reviewerName: 'Dr. Marcus Chen, MD',
      reviewerRole: 'DOCTOR',
      decision: 'ACCEPTED',
      clinicalNote: 'Patient advised to add PPI protection and recheck INR in 72 hours.',
    };

    const res = await handleMockRequest({
      url: '/reviews',
      method: 'post',
      data: reviewPayload,
    });

    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data.status).toBe('COMPLETED');

    // Verify audit log has the new entry
    const auditRes = await handleMockRequest({
      url: '/admin/audit',
      method: 'get',
    });

    const latestAudit = auditRes.data.data[0];
    expect(latestAudit.action).toBe('CLINICAL_DECISION_SIGN_OFF');
    expect(latestAudit.user).toBe('Dr. Marcus Chen, MD');
  });
});
