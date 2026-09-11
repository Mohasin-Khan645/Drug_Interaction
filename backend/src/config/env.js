import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_SECRET: z.string().min(16, 'REFRESH_TOKEN_SECRET must be at least 16 chars'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default('alerts@drugsafe.io'),
  OCR_PROVIDER: z.string().default('development'),
  OCR_API_KEY: z.string().optional(),
  AI_PROVIDER: z.string().default('development'),
  AI_API_KEY: z.string().optional(),
  STORAGE_PROVIDER: z.string().default('local'),
  STORAGE_BUCKET: z.string().default('drugsafe-prescriptions'),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables configuration:', parsedEnv.error.format());
  // In development/test mode, provide fallback for non-breaking local testing
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Proceeding with fallback defaults for missing environment variables in non-production.');
  } else {
    process.exit(1);
  }
}

export const env = parsedEnv.success ? parsedEnv.data : {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5000', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/drugsafe?schema=public',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'fallback-test-access-secret-32-chars-long',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'fallback-test-refresh-secret-32-chars-long',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  EMAIL_FROM: 'alerts@drugsafe.io',
  OCR_PROVIDER: 'development',
  AI_PROVIDER: 'development',
  STORAGE_PROVIDER: 'local',
  STORAGE_BUCKET: 'drugsafe-prescriptions',
};

