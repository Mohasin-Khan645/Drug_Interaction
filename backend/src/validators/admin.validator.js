import { z } from 'zod';
import { UserRole } from '../constants/roles.js';
import { AccountStatus } from '../constants/status.js';
import { SeverityLevel } from '../constants/severity.js';
import { RuleType } from '../constants/rules.js';

export const updateUserAdminSchema = z.object({
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(AccountStatus).optional(),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export const createRuleSchema = z.object({
  ruleType: z.nativeEnum(RuleType),
  primaryDrugId: z.string().min(1, 'Primary drug is required'),
  secondaryEntity: z.string().min(1, 'Secondary interacting entity is required'),
  severity: z.nativeEnum(SeverityLevel),
  title: z.string().min(5),
  clinicalEffect: z.string().min(10),
  mechanism: z.string().min(5),
  management: z.string().min(10),
  recommendation: z.string().optional(),
  evidenceSource: z.string().min(2),
  evidenceLevel: z.string().min(2),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('ACTIVE'),
});

export const updateRuleSchema = createRuleSchema.partial();

