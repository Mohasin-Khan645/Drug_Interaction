import { z } from 'zod';

export const medicationFormSchema = z.object({
  medicationName: z
    .string()
    .min(1, 'Medication name is required')
    .min(2, 'Name must be at least 2 characters'),
  genericName: z.string().optional(),
  strength: z
    .string()
    .min(1, 'Strength is required (e.g., 500 mg, 10 mg/mL)'),
  form: z.enum([
    'Tablet',
    'Capsule',
    'Liquid / Solution',
    'Suspension',
    'Injection',
    'Inhaler',
    'Topical Cream',
    'Transdermal Patch',
    'Eye Drops',
    'Other'
  ], {
    errorMap: () => ({ message: 'Please select a dosage form' }),
  }),
  route: z.enum([
    'Oral',
    'Sublingual',
    'Intravenous',
    'Subcutaneous',
    'Intramuscular',
    'Topical',
    'Inhalation',
    'Ophthalmic',
    'Nasal',
    'Rectal'
  ], {
    errorMap: () => ({ message: 'Please select an administration route' }),
  }),
  frequency: z.enum([
    'Once daily',
    'Twice daily (BID)',
    'Three times daily (TID)',
    'Four times daily (QID)',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'Every morning',
    'At bedtime (QHS)',
    'As needed (PRN)',
    'Weekly'
  ], {
    errorMap: () => ({ message: 'Please select a dosage frequency' }),
  }),
  source: z.enum([
    'Prescription',
    'OTC',
    'Supplement',
    'Manual'
  ], {
    errorMap: () => ({ message: 'Please select the medication source' }),
  }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  prescribingDoctor: z.string().optional(),
  rxNormCode: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});
