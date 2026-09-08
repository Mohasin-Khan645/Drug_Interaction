'use strict';

const request = require('supertest');
const createApp = require('../../src/app');
const prisma = require('../../src/config/prisma');

const app = createApp();

const SEED_USERS = {
  admin: { email: 'admin@example.com', password: process.env.SEED_ADMIN_PASSWORD || 'DevAdmin!2345' },
  doctor: { email: 'doctor@example.com', password: process.env.SEED_DOCTOR_PASSWORD || 'DevDoctor!2345' },
  pharmacist: {
    email: 'pharmacist@example.com',
    password: process.env.SEED_PHARMACIST_PASSWORD || 'DevPharm!2345',
  },
  patient: { email: 'patient@example.com', password: process.env.SEED_PATIENT_PASSWORD || 'DevPatient!2345' },
};

const login = async (who) => {
  const credentials = SEED_USERS[who];
  const res = await request(app).post('/api/auth/login').send(credentials);
  if (res.status !== 200) throw new Error(`login failed for ${who}: ${JSON.stringify(res.body)}`);
  return { token: res.body.data.accessToken, user: res.body.data.user, cookies: res.headers['set-cookie'] };
};

const auth = (token) => ({ Authorization: `Bearer ${token}` });

const seedPatient = async () => {
  const user = await prisma.user.findUnique({ where: { email: SEED_USERS.patient.email } });
  return prisma.patient.findUnique({ where: { userId: user.id } });
};

module.exports = { app, request, prisma, login, auth, seedPatient, SEED_USERS };
