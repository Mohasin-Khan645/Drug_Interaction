import { Router } from 'express';
import multer from 'multer';
import { prescriptionController } from '../controllers/prescription.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import { UserRole } from '../constants/roles.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const router = Router();

router.use(authenticate);

router.post(
  '/upload',
  authorize(UserRole.PATIENT, UserRole.DOCTOR, UserRole.PHARMACIST),
  upload.single('file'),
  auditLogMiddleware('PRESCRIPTION_UPLOAD_OCR', 'Prescription'),
  prescriptionController.upload
);

router.get('/', prescriptionController.getPrescriptions);
router.get('/:id', prescriptionController.getPrescriptionById);

export default router;

