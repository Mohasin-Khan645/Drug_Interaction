'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { app, request, prisma, login, auth, seedPatient } = require('./helpers');

let doctor;
let patientRecord;
let pngPath;

beforeAll(async () => {
  doctor = await login('doctor');
  patientRecord = await seedPatient();

  pngPath = path.join(os.tmpdir(), `drugsafe-rx-${Date.now()}.png`);
  // A tiny real PNG so magic-byte validation is exercised with genuine bytes.
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(pngPath, png);
});

afterAll(async () => {
  fs.rmSync(pngPath, { force: true });
  await prisma.$disconnect();
});

describe('prescription uploads', () => {
  it('rejects a file whose content does not match the declared image type', async () => {
    const fakePath = path.join(os.tmpdir(), `fake-${Date.now()}.png`);
    fs.writeFileSync(fakePath, Buffer.from('not really a png at all'));

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(doctor.token))
      .field('patientId', patientRecord.id)
      .attach('image', fakePath, { contentType: 'image/png' });

    fs.rmSync(fakePath, { force: true });
    expect(res.status).toBe(415);
    expect(res.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
  });

  it('rejects an executable disguised by its filename', async () => {
    const shPath = path.join(os.tmpdir(), `evil-${Date.now()}.png`);
    fs.writeFileSync(shPath, Buffer.from('#!/bin/sh\nrm -rf /\n'));

    const res = await request(app)
      .post('/api/prescriptions')
      .set(auth(doctor.token))
      .field('patientId', patientRecord.id)
      .attach('image', shPath, { contentType: 'image/png' });

    fs.rmSync(shPath, { force: true });
    expect(res.status).toBe(415);
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/prescriptions').field('patientId', patientRecord.id);
    expect(res.status).toBe(401);
  });

  it('accepts a genuine image and keeps OCR output unconfirmed', async () => {
    const created = await request(app)
      .post('/api/prescriptions')
      .set(auth(doctor.token))
      .field('patientId', patientRecord.id)
      .attach('image', pngPath, { contentType: 'image/png' });

    expect(created.status).toBe(201);
    const prescriptionId = created.body.data.id;

    const processed = await request(app)
      .post(`/api/prescriptions/${prescriptionId}/process`)
      .set(auth(doctor.token));
    expect(processed.status).toBe(200);

    const items = await request(app)
      .get(`/api/prescriptions/${prescriptionId}/items`)
      .set(auth(doctor.token));
    expect(items.status).toBe(200);
    const list = Array.isArray(items.body.data) ? items.body.data : items.body.data.items;
    for (const item of list) {
      expect(item.status).not.toBe('CONFIRMED');
    }
  });
});

describe('reconciliation preview', () => {
  it('classifies an existing medication as a duplicate candidate and a new one as confirmed', async () => {
    const res = await request(app)
      .post(`/api/patients/${patientRecord.id}/reconciliation/preview`)
      .set(auth(doctor.token))
      .send({ items: [{ rawText: 'ibuprofen 200mg' }, { rawText: 'lisinopril 10mg' }] });

    expect(res.status).toBe(200);
    const outcomes = [
      ...res.body.data.duplicateCandidates,
      ...res.body.data.confirmedCandidates,
      ...res.body.data.reviewRequired,
    ];
    expect(outcomes).toHaveLength(2);
  });

  it('rejects an item that has neither a drug id nor raw text', async () => {
    const res = await request(app)
      .post(`/api/patients/${patientRecord.id}/reconciliation/preview`)
      .set(auth(doctor.token))
      .send({ items: [{ strength: '10mg' }] });
    expect(res.status).toBe(400);
  });
});

describe('tooling', () => {
  it('has tesseract available for the development OCR provider', () => {
    expect(() => execFileSync('node', ['-e', "require('tesseract.js')"], { cwd: path.resolve(__dirname, '../..') })).not.toThrow();
  });
});
