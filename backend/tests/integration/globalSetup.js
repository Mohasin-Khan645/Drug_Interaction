'use strict';

const { execSync } = require('node:child_process');
const path = require('node:path');

/*
 * Integration tests run against a real PostgreSQL database so Prisma
 * transactions, constraints and indexes are exercised, not mocked away.
 */
module.exports = async () => {
  const url =
    process.env.TEST_DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/drugsafe_test?schema=public';

  process.env.DATABASE_URL = url;
  process.env.NODE_ENV = 'test';
  process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
  process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'test-refresh-secret';

  const cwd = path.resolve(__dirname, '../..');
  const env = { ...process.env, DATABASE_URL: url };

  execSync('npx prisma migrate reset --force --skip-generate --skip-seed', { cwd, env, stdio: 'inherit' });
  execSync('node prisma/seed.js', { cwd, env, stdio: 'inherit' });
};
