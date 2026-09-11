import { z } from 'zod';

export const clinicianReviewSchema = z.object({
  decision: z.enum([
    'ACCEPTED',
    'ACKNOWLEDGED',
    'REQUIRES_INVESTIGATION'
  ], {
    errorMap: () => ({ message: 'Please select a clinical decision' }),
  }),
  clinicalNote: z
    .string()
    .min(5, 'Clinical review note must be at least 5 characters')
    .max(1000, 'Note cannot exceed 1000 characters'),
  recommendationOverride: z.boolean().optional().default(false),
  rationale: z.string().optional(),
  notifyPrescriber: z.boolean().optional().default(false),
});
