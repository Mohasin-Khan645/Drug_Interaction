import { z } from 'zod';

export const updatePatientSchema = z.object({
  fullName: z.string().min(2).optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other', 'Prefer not to disclose']).optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']).optional(),
  weightKg: z.coerce.number().positive().optional(),
  heightCm: z.coerce.number().positive().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  primaryDoctor: z.string().optional(),
  medicalHistory: z.string().optional(),
});

export const addConditionSchema = z.object({
  conditionName: z.string().min(2, 'Condition name is required'),
  icd10Code: z.string().optional(),
  status: z.enum(['Active', 'Chronic', 'In Remission', 'Resolved']).default('Active'),
  diagnosedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const addAllergySchema = z.object({
  allergen: z.string().min(2, 'Allergen name is required'),
  reaction: z.string().min(2, 'Reaction description is required'),
  severity: z.enum(['Mild', 'Moderate', 'Severe', 'Life-threatening']).default('Moderate'),
  diagnosedDate: z.string().optional(),
  notes: z.string().optional(),
});

export const addLabResultSchema = z.object({
  testName: z.string().min(2, 'Test name is required'),
  value: z.string().min(1, 'Value is required'),
  unit: z.string().min(1, 'Unit is required'),
  referenceRange: z.string().optional(),
  interpretation: z.enum(['Normal', 'Low', 'High', 'Critical']).optional(),
  testDate: z.string().min(1, 'Test date is required'),
});

