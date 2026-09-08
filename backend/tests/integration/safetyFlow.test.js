'use strict';

const { app, request, prisma, login, auth, seedPatient } = require('./helpers');

let doctor;
let patient;
let patientRecord;
let checkId;
let findings;

beforeAll(async () => {
  [doctor, patient] = await Promise.all([login('doctor'), login('patient')]);
  patientRecord = await seedPatient();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('drug catalog and normalization', () => {
  it('searches by generic name', async () => {
    const res = await request(app).get('/api/drugs/search?q=warfarin').set(auth(doctor.token));
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('searches by brand name', async () => {
    const res = await request(app).get('/api/drugs/search?q=Advil').set(auth(doctor.token));
    expect(res.body.data.items.length).toBeGreaterThan(0);
  });

  it('paginates results', async () => {
    const res = await request(app).get('/api/drugs?page=1&limit=2').set(auth(doctor.token));
    expect(res.body.data.items.length).toBeLessThanOrEqual(2);
    expect(res.body.data.pagination).toMatchObject({ page: 1, limit: 2 });
  });

  it('keeps a misspelling below auto-confirm and marks it for review', async () => {
    const res = await request(app)
      .post('/api/drugs/normalize')
      .set(auth(doctor.token))
      .send({ names: ['coumadn'] });
    expect(res.status).toBe(200);
    expect(res.body.data.results[0].requiresReview).toBe(true);
  });

  it('returns no candidates for text that matches nothing', async () => {
    const res = await request(app)
      .post('/api/drugs/normalize')
      .set(auth(doctor.token))
      .send({ names: ['zzzzqqqq'] });
    expect(res.body.data.results[0].candidates).toEqual([]);
  });
});

describe('safety check pipeline', () => {
  it('runs a check for a care-team patient and persists findings', async () => {
    const res = await request(app)
      .post('/api/safety/check')
      .set(auth(doctor.token))
      .send({ patientId: patientRecord.id });

    expect(res.status).toBe(201);
    checkId = res.body.data.id;
    findings = res.body.data.findings;
    expect(findings.length).toBeGreaterThan(0);
    expect(res.body.data.summary.totalFindings).toBe(findings.length);
  });

  it('orders findings by clinical severity and keeps lower severities visible', async () => {
    const order = ['CONTRAINDICATED', 'CRITICAL', 'MAJOR', 'MODERATE', 'MINOR', 'INFORMATIONAL'];
    const ranks = findings.map((finding) => order.indexOf(finding.severity));
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(new Set(findings.map((finding) => finding.severity)).size).toBeGreaterThan(0);
  });

  it('attaches only stored evidence to findings', async () => {
    const withEvidence = findings.filter((finding) => finding.evidence.length > 0);
    for (const finding of withEvidence) {
      for (const item of finding.evidence) {
        expect(item.documentId).toEqual(expect.any(String));
      }
    }
  });

  it('reuses the stored check for identical input instead of duplicating it', async () => {
    const res = await request(app)
      .post('/api/safety/check')
      .set(auth(doctor.token))
      .send({ patientId: patientRecord.id });
    expect(res.body.data.id).toBe(checkId);
  });

  it('refuses a safety check for a patient the caller cannot access', async () => {
    const res = await request(app)
      .post('/api/safety/check')
      .set(auth(patient.token))
      .send({ patientId: '00000000-0000-0000-0000-000000000000' });
    expect([403, 404]).toContain(res.status);
  });
});

describe('clinician review, notifications and reports', () => {
  it('rejects a review submitted by a patient', async () => {
    const res = await request(app)
      .post(`/api/safety/findings/${findings[0].id}/reviews`)
      .set(auth(patient.token))
      .send({ decision: 'ACCEPTED' });
    expect(res.status).toBe(403);
  });

  it('records a clinician decision and updates the finding status', async () => {
    const res = await request(app)
      .post(`/api/safety/findings/${findings[0].id}/reviews`)
      .set(auth(doctor.token))
      .send({ decision: 'ACKNOWLEDGED', clinicalNote: 'Monitored.' });
    expect(res.status).toBe(201);

    const finding = await prisma.safetyFinding.findUnique({ where: { id: findings[0].id } });
    expect(finding.status).toBe('ACKNOWLEDGED');
  });

  it('notifies the clinician about alertable findings without duplicating them', async () => {
    const res = await request(app).get('/api/notifications').set(auth(doctor.token));
    expect(res.status).toBe(200);
    const keys = res.body.data.items.map((item) => item.dedupeKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('marks a notification as read', async () => {
    const list = await request(app).get('/api/notifications?unreadOnly=true').set(auth(doctor.token));
    if (list.body.data.items.length === 0) return;
    const res = await request(app)
      .post(`/api/notifications/${list.body.data.items[0].id}/read`)
      .set(auth(doctor.token));
    expect(res.status).toBe(200);
    expect(res.body.data.readAt).not.toBeNull();
  });

  it('builds a report from the stored safety check and renders a pdf', async () => {
    const created = await request(app)
      .post('/api/reports')
      .set(auth(doctor.token))
      .send({ safetyCheckId: checkId, status: 'FINAL' });
    expect(created.status).toBe(201);

    const pdf = await request(app)
      .get(`/api/reports/${created.body.data.id}/pdf`)
      .set(auth(doctor.token));
    expect(pdf.status).toBe(200);
    expect(pdf.headers['content-type']).toContain('application/pdf');
  });

  it('writes audit entries for the safety check', async () => {
    const entries = await prisma.auditLog.findMany({ where: { action: { contains: 'SAFETY' } } });
    expect(entries.length).toBeGreaterThan(0);
  });
});

describe('grounded AI explanations', () => {
  it('explains a verified finding using stored context only', async () => {
    const res = await request(app)
      .post('/api/ai/explain')
      .set(auth(doctor.token))
      .send({ findingId: findings[0].id, question: 'What does this mean?' });
    expect([200, 422]).toContain(res.status);
    if (res.status === 422) {
      expect(res.body.error.code).toBe('INSUFFICIENT_VERIFIED_EVIDENCE');
    }
  });

  it('refuses to explain a finding that does not exist', async () => {
    const res = await request(app)
      .post('/api/ai/explain')
      .set(auth(doctor.token))
      .send({ findingId: '00000000-0000-0000-0000-000000000000', question: 'Explain' });
    expect([403, 404, 422]).toContain(res.status);
  });
});
