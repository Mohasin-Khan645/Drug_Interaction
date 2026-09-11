import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '../schemas/authSchemas';

describe('Authentication & RBAC Validation Schemas', () => {
  it('validates correct login credentials', () => {
    const validData = {
      email: 'physician@hospital.org',
      password: 'Password123!',
      rememberMe: true,
    };
    const result = loginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format in login', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'Password123!',
    };
    const result = loginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('valid email');
  });

  it('prohibits ADMIN registration from public register schema', () => {
    const adminAttempt = {
      fullName: 'David Vance',
      email: 'david.vance@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'ADMIN', // Not allowed in public schema
      termsAccepted: true,
    };
    const result = registerSchema.safeParse(adminAttempt);
    expect(result.success).toBe(false);
    expect(result.error.issues.some((i) => i.path.includes('role'))).toBe(true);
  });

  it('rejects registration when passwords do not match', () => {
    const mismatched = {
      fullName: 'Sarah Jenkins',
      email: 'sarah.jenkins@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!',
      role: 'PATIENT',
      termsAccepted: true,
    };
    const result = registerSchema.safeParse(mismatched);
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toBe('Passwords do not match');
  });
});
