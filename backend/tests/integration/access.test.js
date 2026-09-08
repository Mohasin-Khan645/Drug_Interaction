'use strict';

const { app, request, prisma, login, auth, seedPatient } = require('./helpers');

let doctor;
let patient;
let admin;
let patientRecord;
let otherPatientId;

beforeAll(async () => {
  [doctor, patient, admin] = await Promise.all([login('doctor'), login('patient'), login('admin')]);
  patientRecord = await seedPatient();

  const outsiderUser = await prisma.user.create({
    data: {
      name: 'Outsider Patient',
      email: `outsider-${Date.now()}@example.com`,
      passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
      role: 'PATIENT',
      status: 'ACTIVE',
    },
  });
  const outsider = await prisma.patient.create({
    data: { userId: outsiderUser.id, dateOfBirth: new Date('1990-01-01'), sex: 'FEMALE' },
  });
  otherPatientId = outsider.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('role based access control', () => {
  it('blocks a patient from the admin API', async () => {
    const res = await request(app).get('/api/admin/users').set(auth(patient.token));
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('blocks a doctor from the admin API', async () => {
    const res = await request(app).get('/api/admin/users').set(auth(doctor.token));
    expect(res.status).toBe(403);
  });

  it('allows an admin into the admin API', async () => {
    const res = await request(app).get('/api/admin/users').set(auth(admin.token));
    expect(res.status).toBe(200);
  });
});

describe('patient object level authorization', () => {
  it('lets a patient read their own record', async () => {
    const res = await request(app).get(`/api/patients/${patientRecord.id}`).set(auth(patient.token));
    expect(res.status).toBe(200);
  });

  it('lets a care-team doctor read the record', async () => {
    const res = await request(app).get(`/api/patients/${patientRecord.id}`).set(auth(doctor.token));
    expect(res.status).toBe(200);
  });

  it('refuses another patient id supplied in the url', async () => {
    const res = await request(app).get(`/api/patients/${otherPatientId}`).set(auth(patient.token));
    expect([403, 404]).toContain(res.status);
  });

  it('refuses a doctor who is not on the care team', async () => {
    const res = await request(app).get(`/api/patients/${otherPatientId}`).set(auth(doctor.token));
    expect([403, 404]).toContain(res.status);
  });

  it('refuses medication writes on someone else patient record', async () => {
    const res = await request(app)
      .post(`/api/patients/${otherPatientId}/medications`)
      .set(auth(patient.token))
      .send({ rawName: 'Ibuprofen', strength: '200mg' });
    expect([400, 403, 404]).toContain(res.status);
  });
});
