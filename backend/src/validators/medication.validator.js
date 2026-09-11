import { z } from 'zod';

export const createMedicationSchema = z.object({
  patientId: z.string().uuid().optional(),
  drugId: z.string().uuid().optional(),
  medicationName: z.string().min(2, 'Medication name is required'),
  genericName: z.string().optional(),
  strength: z.string().min(1, 'Strength is required'),
  form: z.string().min(1, 'Dosage form is required'),
  route: z.string().min(1, 'Administration route is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  source: z.enum(['Prescription', 'OTC', 'Supplement', 'Manual']).default('Prescription'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  prescribingDoctor: z.string().optional(),
  rxNormCode: z.string().optional(),
  notes: z.string().max(1000).optional(),
});

export const updateMedicationSchema = createMedicationSchema.partial();

