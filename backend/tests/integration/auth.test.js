'use strict';

const { app, request, prisma, login, auth } = require('./helpers');

afterAll(async () => {
  await prisma.$disconnect();
});

describe('authentication', () => {
  const email = `new-user-${Date.now()}@example.com`;

  it('registers a patient without letting the client choose a role', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'New User', email, password: 'StrongPass!2345', role: 'ADMIN' });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('PATIENT');
  });

  it('never stores the password in plaintext', async () => {
    const user = await prisma.user.findUnique({ where: { email } });
    expect(user.passwordHash).not.toContain('StrongPass!2345');
    expect(user.passwordHash.startsWith('$2')).toBe(true);
  });

  it('rejects weak passwords', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Weak', email: `weak-${Date.now()}@example.com`, password: 'password' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects bad credentials without revealing which part was wrong', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'WrongPass!2345' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('issues an access token and an http-only refresh cookie', async () => {
    const res = await request(app).post('/api/auth/login').send({ email, password: 'StrongPass!2345' });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    const cookie = res.headers['set-cookie'].find((value) => value.startsWith('drugsafe_refresh='));
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it('rotates the refresh token and rejects the reused one', async () => {
    const first = await request(app).post('/api/auth/login').send({ email, password: 'StrongPass!2345' });
    const originalCookie = first.headers['set-cookie'];

    const refreshed = await request(app).post('/api/auth/refresh').set('Cookie', originalCookie);
    expect(refreshed.status).toBe(200);

    const replay = await request(app).post('/api/auth/refresh').set('Cookie', originalCookie);
    expect(replay.status).toBe(401);
  });

  it('returns the current user from the database, not from the token payload', async () => {
    const { token, user } = await login('doctor');
    const res = await request(app).get('/api/auth/me').set(auth(token));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: user.id, role: 'DOCTOR' });
  });

  it('rejects requests without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects a tampered token', async () => {
    const { token } = await login('doctor');
    const res = await request(app).get('/api/auth/me').set(auth(`${token}x`));
    expect(res.status).toBe(401);
  });
});
