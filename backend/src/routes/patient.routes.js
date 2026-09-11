import { Router } from 'express';
import { patientController } from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import {
  updatePatientSchema,
  addConditionSchema,
  addAllergySchema,
  addLabResultSchema,
} from '../validators/patient.validator.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  authorize(UserRole.DOCTOR, UserRole.PHARMACIST, UserRole.ADMIN, UserRole.PATIENT),
  auditLogMiddleware('VIEW_PATIENTS', 'Patient'),
  patientController.getPatients
);

router.get(
  '/:id',
  auditLogMiddleware('VIEW_PATIENT_PROFILE', 'Patient'),
  patientController.getPatientById
);

router.put(
  '/:id',
  validateBody(updatePatientSchema),
  auditLogMiddleware('UPDATE_PATIENT_PROFILE', 'Patient'),
  patientController.updatePatientProfile
);

router.get(
  '/:patientId/conditions',
  auditLogMiddleware('VIEW_PATIENT_CONDITIONS', 'PatientCondition'),
  patientController.getPatientConditions
);

router.post(
  '/:patientId/conditions',
  authorize(UserRole.DOCTOR, UserRole.ADMIN),
  validateBody(addConditionSchema),
  auditLogMiddleware('ADD_PATIENT_CONDITION', 'PatientCondition'),
  patientController.addPatientCondition
);

router.get(
  '/:patientId/allergies',
  auditLogMiddleware('VIEW_PATIENT_ALLERGIES', 'PatientAllergy'),
  patientController.getPatientAllergies
);

router.post(
  '/:patientId/allergies',
  validateBody(addAllergySchema),
  auditLogMiddleware('ADD_PATIENT_ALLERGY', 'PatientAllergy'),
  patientController.addPatientAllergy
);

router.get(
  '/:patientId/labs',
  auditLogMiddleware('VIEW_PATIENT_LABS', 'LabResult'),
  patientController.getPatientLabs
);

router.get(
  '/:patientId/factors',
  auditLogMiddleware('VIEW_PATIENT_FACTORS', 'PatientFactor'),
  patientController.getPatientFactors
);

export default router;

