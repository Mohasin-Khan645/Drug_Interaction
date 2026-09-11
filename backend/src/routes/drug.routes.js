import { Router } from 'express';
import { drugController } from '../controllers/drug.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import { drugQuerySchema, createDrugSchema } from '../validators/drug.validator.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

router.get('/', validateQuery(drugQuerySchema), drugController.searchDrugs);
router.get('/search', validateQuery(drugQuerySchema), drugController.searchDrugs);
router.get('/classes', drugController.getDrugClasses);
router.get('/:id', drugController.getDrugById);
router.get('/:id/interactions', drugController.getDrugInteractions);

router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validateBody(createDrugSchema),
  auditLogMiddleware('CREATE_DRUG', 'Drug'),
  drugController.createDrug
);

export default router;

