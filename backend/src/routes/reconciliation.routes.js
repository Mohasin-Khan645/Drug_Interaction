import { Router } from 'express';
import { reconciliationController } from '../controllers/reconciliation.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

router.use(authenticate, authorize(UserRole.DOCTOR, UserRole.PHARMACIST));

router.post(
  '/',
  auditLogMiddleware('RUN_MEDICATION_RECONCILIATION', 'Reconciliation'),
  reconciliationController.runReconciliation
);

router.post(
  '/discrepancies/:id/resolve',
  auditLogMiddleware('RESOLVE_RECONCILIATION_DISCREPANCY', 'Reconciliation'),
  reconciliationController.resolveDiscrepancy
);

export default router;

