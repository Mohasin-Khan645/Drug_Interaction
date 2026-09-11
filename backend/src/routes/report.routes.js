import { Router } from 'express';
import { reportController } from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';

const router = Router();

router.use(authenticate);

router.get('/', reportController.getReports);

router.post(
  '/generate',
  auditLogMiddleware('GENERATE_SAFETY_REPORT', 'SafetyReport'),
  reportController.generateReport
);

router.get('/:id', reportController.getReportById);

router.get(
  '/:id/pdf',
  auditLogMiddleware('EXPORT_REPORT_PDF', 'SafetyReport'),
  reportController.downloadPdf
);

router.post(
  '/:id/share',
  auditLogMiddleware('SHARE_REPORT', 'SafetyReport'),
  reportController.shareReport
);

export default router;

