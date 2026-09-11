import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app.js';
import { signAccessToken } from '../../src/utils/jwt.js';

describe('DrugSafe API Integration Tests', () => {
  it('GET /api/health - returns healthy status and metadata', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.apiStatus).toBe('ONLINE');
    expect(res.body.version).toBe('1.0.0');
  });

  it('POST /api/normalization/resolve - normalizes medication name', async () => {
    const res = await request(app)
      .post('/api/normalization/resolve')
      .send({ rawName: 'Warfarin 5mg tab' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('POST /api/safety/check - evaluates multi-drug safety combination', async () => {
    const res = await request(app)
      .post('/api/safety/check')
      .send({
        drugs: ['Warfarin', 'Aspirin'],
        saveRecord: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.overallSafetyStatus).toBe('CRITICAL_CONCERN');
    expect(res.body.data.findings.length).toBeGreaterThan(0);
    expect(res.body.data.findings[0].severity).toBe('CRITICAL');
  });

  it('GET /api/interactions/pairwise - evaluates pairwise interaction', async () => {
    const res = await request(app)
      .get('/api/interactions/pairwise')
      .query({ drugA: 'Warfarin', drugB: 'Aspirin' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.hasInteraction).toBe(true);
    expect(res.body.data.finding).toBeDefined();
  });

  it('POST /api/safety/explain - returns grounded AI explanation', async () => {
    const res = await request(app)
      .post('/api/safety/explain')
      .send({
        finding: {
          title: 'Warfarin + Aspirin Bleed Hazard',
          severity: 'CRITICAL',
          clinicalEffect: 'Severe gastrointestinal hemorrhage.',
          mechanism: 'Dual antithrombotic inhibition.',
          affectedDrugs: ['Warfarin', 'Aspirin'],
          evidence: 'CHEST 2024 Guidelines and FDA Prescribing Labeling.',
          source: 'FDA Approved Package Labeling',
        },
        question: 'Explain the mechanism of this interaction.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.explanation).toContain('VKORC1');
    expect(res.body.data.disclaimer).toBeDefined();
  });

  it('POST /api/reconciliation - identifies conflicting orders', async () => {
    const token = signAccessToken({ id: 'usr-doctor-1', role: 'DOCTOR', name: 'Dr. Marcus Chen' });
    const res = await request(app)
      .post('/api/reconciliation')
      .set('Authorization', `Bearer ${token}`)
      .send({
        existingMedications: [{ medicationName: 'Tylenol', activeIngredient: 'Acetaminophen' }],
        newPrescriptionItems: [{ medicationName: 'Vicodin', activeIngredient: 'Acetaminophen' }],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ACTION_REQUIRED');
  });

  it('Protected routes reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/patients');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});

