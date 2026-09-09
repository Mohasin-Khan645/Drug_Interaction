'use strict';

const { app, request, prisma, login, auth } = require('./helpers');

let admin;

beforeAll(async () => {
  admin = await login('admin');
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('operations endpoints', () => {
  it('reports database connectivity on the health endpoint', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('serves the OpenAPI document', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
  });

  it('returns a structured error for an unknown route', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, error: { code: expect.any(String) } });
  });

  it('does not leak stack traces in error responses', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(JSON.stringify(res.body)).not.toMatch(/at .*\.js:\d+/);
  });
});

describe('admin surface', () => {
  it('creates a new rule version instead of overwriting the previous one', async () => {
    const rules = await request(app).get('/api/admin/rules/interaction').set(auth(admin.token));
    expect(rules.status).toBe(200);

    const existing = rules.body.data.items[0];
    const updated = await request(app)
      .patch(`/api/admin/rules/interaction/${existing.id}`)
      .set(auth(admin.token))
      .send({ management: 'Updated management guidance for testing.' });

    expect([200, 201]).toContain(updated.status);
    expect(updated.body.data.version).toBeGreaterThan(existing.version);

    const previous = await prisma.drugInteraction.findUnique({ where: { id: existing.id } });
    expect(previous).not.toBeNull();
  });

  it('lists audit entries', async () => {
    const res = await request(app).get('/api/admin/audit').set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('returns platform analytics', async () => {
    const res = await request(app).get('/api/admin/analytics').set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(expect.any(Object));
  });
});
