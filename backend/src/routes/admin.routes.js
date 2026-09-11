import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import {
  updateUserAdminSchema,
  createRuleSchema,
  updateRuleSchema,
} from '../validators/admin.validator.js';
import { UserRole } from '../constants/roles.js';

const router = Router();

// Strictly enforce ADMIN authentication for all admin routes
router.use(authenticate, authorize(UserRole.ADMIN));

// User Management
router.get('/users', adminController.getUsers);
router.put(
  '/users/:id',
  validateBody(updateUserAdminSchema),
  auditLogMiddleware('ADMIN_UPDATE_USER', 'User'),
  adminController.updateUser
);

// Rules Management
router.get('/rules', adminController.getRules);
router.post(
  '/rules',
  validateBody(createRuleSchema),
  auditLogMiddleware('ADMIN_CREATE_RULE', 'Rule'),
  adminController.createRule
);
router.put(
  '/rules/:id',
  validateBody(updateRuleSchema),
  auditLogMiddleware('ADMIN_UPDATE_RULE', 'Rule'),
  adminController.updateRule
);
router.put('/rules/:id/status', adminController.toggleRuleStatus);

// Analytics & Settings
router.get('/analytics', adminController.getAnalytics);
router.get('/settings', adminController.getSettings);
router.put(
  '/settings',
  auditLogMiddleware('ADMIN_UPDATE_SETTINGS', 'SystemSettings'),
  adminController.updateSettings
);

// Audit Logs
router.get('/audit', auditController.getAuditLogs);
router.get('/audit/export', auditController.exportAuditLogs);

export default router;

