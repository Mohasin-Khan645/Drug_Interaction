import { z } from 'zod';

export const drugQuerySchema = z.object({
  search: z.string().optional(),
  drugClass: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  page: z.coerce.number().min(1).default(1),
  sortBy: z.enum(['brandName', 'genericName', 'createdAt']).default('genericName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const createDrugSchema = z.object({
  name: z.string().min(2),
  genericName: z.string().min(2),
  brandName: z.string().optional(),
  drugClass: z.string().min(2),
  activeIngredient: z.string().min(2),
  dosageForm: z.string().min(2),
  route: z.string().min(2),
  strength: z.string().min(1),
  description: z.string().optional(),
  rxNormCode: z.string().optional(),
  atcCode: z.string().optional(),
  blackBoxWarning: z.boolean().default(false),
  aliases: z.array(z.string()).optional(),
  identifiers: z
    .array(
      z.object({
        type: z.string(),
        value: z.string(),
      })
    )
    .optional(),
});

