import { z } from 'zod';
import { ReviewDecision } from '../constants/status.js';

export const clinicianReviewSchema = z.object({
  findingId: z.string().min(1, 'Finding ID is required'),
  decision: z.nativeEnum(ReviewDecision, {
    errorMap: () => ({ message: 'Please select a valid clinical decision: ACCEPTED, ACKNOWLEDGED, OVERRIDDEN, or REQUIRES_INVESTIGATION' }),
  }),
  clinicalNote: z
    .string()
    .min(5, 'Clinical review note must be at least 5 characters')
    .max(1500, 'Note cannot exceed 1500 characters'),
  recommendationOverride: z.boolean().optional().default(false),
  rationale: z.string().optional(),
  notifyPrescriber: z.boolean().optional().default(false),
});

