'use strict';

require('dotenv').config();

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const config = {
  env: process.env.NODE_ENV || 'development',
  port: toInt(process.env.PORT, 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  databaseUrl: process.env.DATABASE_URL,
  logLevel: process.env.LOG_LEVEL || 'info',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    refreshExpiresInDays: toInt(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS, 30),
  },
  cookies: {
    refreshName: 'drugsafe_refresh',
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/auth',
  },
  email: {
    host: process.env.SMTP_HOST,
    port: toInt(process.env.SMTP_PORT, 587),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.EMAIL_FROM || 'no-reply@drugsafe.local',
  },
  ocr: {
    provider: process.env.OCR_PROVIDER || 'tesseract',
    apiKey: process.env.OCR_API_KEY,
  },
  ai: {
    provider: process.env.AI_PROVIDER || 'null',
    apiKey: process.env.AI_API_KEY,
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
    bucket: process.env.STORAGE_BUCKET || 'drugsafe-uploads',
    localDir: process.env.STORAGE_LOCAL_DIR || 'uploads',
  },
  uploads: {
    maxFileSizeBytes: toInt(process.env.UPLOAD_MAX_BYTES, 5 * 1024 * 1024),
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
  },
  rateLimit: {
    windowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toInt(process.env.RATE_LIMIT_MAX, 300),
    authMax: toInt(process.env.RATE_LIMIT_AUTH_MAX, 20),
  },
};

const REQUIRED_IN_PRODUCTION = ['JWT_ACCESS_SECRET', 'REFRESH_TOKEN_SECRET', 'DATABASE_URL'];

function assertConfig() {
  const missing = REQUIRED_IN_PRODUCTION.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    if (config.env === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  if (!config.jwt.accessSecret) config.jwt.accessSecret = 'dev-access-secret-change-me';
  if (!config.jwt.refreshSecret) config.jwt.refreshSecret = 'dev-refresh-secret-change-me';
}

assertConfig();

module.exports = config;
