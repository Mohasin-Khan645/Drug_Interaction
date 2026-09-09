import { z } from 'zod';

/** Mirrors the backend password policy so users see failures before submitting. */
export const passwordSchema = z
  .string()
  .min(12, 'Use at least 12 characters')
  .max(128, 'Use at most 128 characters')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[0-9]/, 'Include a digit');

export const emailSchema = z.string().min(1, 'Email is required').email('Enter a valid email address');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Enter your full name').max(120),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    consent: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms to continue' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10, 'A valid reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const medicationSchema = z
  .object({
    drugId: z.string().uuid().optional().or(z.literal('')),
    rawName: z.string().max(200).optional().or(z.literal('')),
    strength: z.string().max(80).optional().or(z.literal('')),
    doseForm: z.string().max(80).optional().or(z.literal('')),
    route: z.string().max(80).optional().or(z.literal('')),
    frequency: z.string().max(120).optional().or(z.literal('')),
    startDate: z.string().optional().or(z.literal('')),
    source: z.enum(['SELF_REPORTED', 'PRESCRIPTION', 'OTC', 'SUPPLEMENT', 'CLINICIAN_ENTERED', 'RECONCILIATION']),
    notes: z.string().max(2000).optional().or(z.literal('')),
  })
  .refine((data) => Boolean(data.drugId) || Boolean(data.rawName && data.rawName.length >= 2), {
    path: ['rawName'],
    message: 'Select a drug from the catalog or type its name',
  });

export const passwordChecks = (value = '') => [
  { label: 'At least 12 characters', valid: value.length >= 12 },
  { label: 'Lowercase letter', valid: /[a-z]/.test(value) },
  { label: 'Uppercase letter', valid: /[A-Z]/.test(value) },
  { label: 'Number', valid: /[0-9]/.test(value) },
];
