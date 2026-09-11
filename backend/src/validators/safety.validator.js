import { z } from 'zod';

export const safetyCheckSchema = z.object({
  patientId: z.string().optional(),
  drugs: z
    .array(
      z.union([
        z.string().min(1),
        z.object({
          name: z.string().optional(),
          medicationName: z.string().optional(),
          genericName: z.string().optional(),
          drugId: z.string().optional(),
          strength: z.string().optional(),
          doseForm: z.string().optional(),
          route: z.string().optional(),
          activeIngredient: z.string().optional(),
        }),
      ])
    )
    .optional(),
  medications: z.array(z.any()).optional(),
  medicationNames: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  patientFactors: z
    .object({
      age: z.number().optional(),
      weightKg: z.number().optional(),
      egfr: z.number().optional(),
      serumCr: z.number().optional(),
      crcl: z.number().optional(),
      hepaticImpairment: z.boolean().optional(),
      pregnancy: z.boolean().optional(),
    })
    .optional(),
  includeOtc: z.boolean().optional().default(true),
  includeSupplements: z.boolean().optional().default(true),
});

export const pairwiseCheckSchema = z.object({
  drugA: z.string().min(1, 'drugA parameter is required'),
  drugB: z.string().min(1, 'drugB parameter is required'),
});

export const aiExplainSchema = z.object({
  findingId: z.string().optional(),
  question: z.string().optional().default('What is the clinical safety impact and underlying mechanism of this interaction?'),
  finding: z
    .object({
      id: z.string().optional(),
      title: z.string().optional(),
      severity: z.string().optional(),
      clinicalEffect: z.string().optional(),
      mechanism: z.string().optional(),
      affectedDrugs: z.array(z.string()).optional(),
      evidence: z.string().optional(),
      source: z.string().optional(),
    })
    .optional(),
  role: z.enum(['PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN']).optional(),
});

