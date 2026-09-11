import { Router } from 'express';
import authRoutes from './auth.routes.js';
import patientRoutes from './patient.routes.js';
import drugRoutes from './drug.routes.js';
import medicationRoutes from './medication.routes.js';
import safetyRoutes from './safety.routes.js';
import prescriptionRoutes from './prescription.routes.js';
import reconciliationRoutes from './reconciliation.routes.js';
import reviewRoutes from './review.routes.js';
import alertRoutes from './alert.routes.js';
import reportRoutes from './report.routes.js';
import evidenceRoutes from './evidence.routes.js';
import adminRoutes from './admin.routes.js';
import normalizationRoutes from './normalization.routes.js';
import healthRoutes from './health.routes.js';

const apiRouter = Router();

apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/patients', patientRoutes);
apiRouter.use('/drugs', drugRoutes);
apiRouter.use('/medications', medicationRoutes);
apiRouter.use('/safety', safetyRoutes);
apiRouter.use('/interactions', safetyRoutes); // Direct frontend alias
apiRouter.use('/prescriptions', prescriptionRoutes);
apiRouter.use('/ocr', prescriptionRoutes); // Direct frontend alias for candidate confirmation
apiRouter.use('/reconciliation', reconciliationRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/alerts', alertRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/evidence', evidenceRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/normalization', normalizationRoutes);

export default apiRouter;

