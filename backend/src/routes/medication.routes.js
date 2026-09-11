import { Router } from 'express';
import { medicationController } from '../controllers/medication.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import {
  createMedicationSchema,
  updateMedicationSchema,
} from '../validators/medication.validator.js';

const router = Router();

router.use(authenticate);

router.get('/', medicationController.getMedications);
router.get('/:id', medicationController.getMedicationById);

router.post(
  '/',
  validateBody(createMedicationSchema),
  auditLogMiddleware('ADD_MEDICATION', 'PatientMedication'),
  medicationController.addMedication
);

router.put(
  '/:id',
  validateBody(updateMedicationSchema),
  auditLogMiddleware('UPDATE_MEDICATION', 'PatientMedication'),
  medicationController.updateMedication
);

router.delete(
  '/:id',
  auditLogMiddleware('DISCONTINUE_MEDICATION', 'PatientMedication'),
  medicationController.deleteMedication
);

export default router;

