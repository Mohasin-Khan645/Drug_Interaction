import { Router } from 'express';
import { evidenceController } from '../controllers/evidence.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

router.get('/', evidenceController.getSources);
router.get('/sources', evidenceController.getSources);
router.get('/drugs/:drugId', evidenceController.getEvidenceForDrug);
router.get('/:drugId', evidenceController.getEvidenceForDrug);

router.post(
  '/:sourceId/sync',
  authenticate,
  authorize(UserRole.ADMIN),
  evidenceController.syncSource
);

export default router;

