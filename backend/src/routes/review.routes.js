import { Router } from 'express';
import { reviewController } from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import { clinicianReviewSchema } from '../validators/review.validator.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/pending',
  authorize(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.ADMIN),
  reviewController.getPendingReviews
);

router.get(
  '/:id',
  authorize(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.ADMIN),
  reviewController.getReviewById
);

router.post(
  '/',
  authorize(UserRole.DOCTOR, UserRole.PHARMACIST),
  validateBody(clinicianReviewSchema),
  auditLogMiddleware('CLINICAL_REVIEW_SUBMIT', 'ClinicianReview'),
  reviewController.submitReview
);

router.post(
  '/:findingId',
  authorize(UserRole.DOCTOR, UserRole.PHARMACIST),
  auditLogMiddleware('CLINICAL_REVIEW_SUBMIT', 'ClinicianReview'),
  reviewController.submitReview
);

export default router;

