import { Router } from 'express';
import { alertController } from '../controllers/alert.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', alertController.getAlerts);
router.put('/mark-all-read', alertController.markAllAsRead);
router.put('/:id', alertController.markAsRead);

export default router;

