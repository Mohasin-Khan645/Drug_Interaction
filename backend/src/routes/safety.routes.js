import { Router } from 'express';
import { safetyController } from '../controllers/safety.controller.js';
import { optionalAuthenticate } from '../middleware/auth.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import { safetyCheckSchema, pairwiseCheckSchema, aiExplainSchema } from '../validators/safety.validator.js';

const router = Router();

router.use(optionalAuthenticate);

router.post(
  '/check',
  validateBody(safetyCheckSchema),
  auditLogMiddleware('RUN_SAFETY_CHECK', 'SafetyCheck'),
  safetyController.runSafetyCheck
);

router.get('/pairwise', validateQuery(pairwiseCheckSchema), safetyController.getPairwise);
router.get('/history/:patientId', safetyController.getPatientSafetyHistory);
router.post('/explain', validateBody(aiExplainSchema), safetyController.explainWithAI);
router.post('/explain/stream', safetyController.streamExplainWithAI);
router.get('/explain/stream', safetyController.streamExplainWithAI);

export default router;

