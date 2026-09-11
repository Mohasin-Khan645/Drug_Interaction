import { z } from 'zod';

export const patientProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to disclose']),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).optional(),
  weightKg: z.coerce.number().positive('Weight must be a positive number').optional(),
  heightCm: z.coerce.number().positive('Height must be a positive number').optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
});

export const allergySchema = z.object({
  allergen: z.string().min(2, 'Allergen name is required'),
  reaction: z.string().min(2, 'Observed reaction is required (e.g., Anaphylaxis, Rash, Angioedema)'),
  severity: z.enum(['Mild', 'Moderate', 'Severe', 'Life-threatening']),
  diagnosedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const conditionSchema = z.object({
  conditionName: z.string().min(2, 'Condition or diagnosis name is required'),
  icd10Code: z.string().optional(),
  status: z.enum(['Active', 'Chronic', 'In Remission', 'Resolved']),
  diagnosedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const labResultSchema = z.object({
  testName: z.string().min(2, 'Test name is required'),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().min(1, 'Unit is required'),
  referenceRange: z.string().optional(),
  testDate: z.string().min(1, 'Test date is required'),
  interpretation: z.enum(['Normal', 'Low', 'High', 'Critical']).optional(),
});
