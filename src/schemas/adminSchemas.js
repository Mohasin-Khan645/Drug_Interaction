import { z } from 'zod';

export const adminUserUpdateSchema = z.object({
  role: z.enum(['PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN']),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const adminDrugSchema = z.object({
  name: z.string().min(2, 'Brand/Primary name is required'),
  genericName: z.string().min(2, 'Generic name is required'),
  drugClass: z.string().min(2, 'Drug class is required'),
  activeIngredient: z.string().min(2, 'Active ingredient is required'),
  rxNormCode: z.string().optional(),
  atcCode: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  dosageForms: z.string().min(2, 'Dosage forms are required (comma separated)'),
  route: z.string().min(2, 'Route is required'),
  controlledSubstanceSchedule: z.string().optional(),
  blackBoxWarning: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const adminRuleSchema = z.object({
  ruleType: z.enum([
    'DRUG_DRUG',
    'DRUG_DISEASE',
    'DRUG_ALLERGY',
    'DUPLICATION',
    'PATIENT_FACTOR'
  ]),
  primaryDrugId: z.string().min(1, 'Primary drug identifier is required'),
  secondaryEntity: z.string().min(1, 'Interacting drug, disease, or factor is required'),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MODERATE', 'MINOR', 'INFORMATIONAL']),
  clinicalEffect: z.string().min(10, 'Clinical effect description is required'),
  mechanism: z.string().min(5, 'Pharmacological mechanism is required'),
  recommendation: z.string().min(10, 'Clinical recommendation is required'),
  evidenceSource: z.string().min(2, 'Evidence source is required (e.g., FDA Label, RxNorm, PubMed)'),
  evidenceLevel: z.enum(['Level 1 (RCT / Meta-analysis)', 'Level 2 (Cohort / Case-control)', 'Level 3 (FDA Approved Labeling)', 'Level 4 (Expert Opinion)']),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('ACTIVE'),
});
