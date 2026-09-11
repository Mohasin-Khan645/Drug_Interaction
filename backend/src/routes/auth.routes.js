import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validation.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { auditLogMiddleware } from '../middleware/auditLogger.js';
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  mfaVerifySchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateBody(registerSchema),
  auditLogMiddleware('USER_REGISTER', 'User'),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateBody(loginSchema),
  auditLogMiddleware('USER_LOGIN', 'User'),
  authController.login
);

router.post('/refresh', authController.refreshSession);

router.post(
  '/logout',
  auditLogMiddleware('USER_LOGOUT', 'User'),
  authController.logout
);

router.get('/me', authenticate, authController.getCurrentUser);

router.post(
  '/forgot-password',
  authRateLimiter,
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authRateLimiter,
  validateBody(resetPasswordSchema),
  authController.resetPassword
);

router.post(
  '/verify-email',
  validateBody(verifyEmailSchema),
  authController.verifyEmail
);

// Multi-Factor Authentication
router.post(
  '/mfa/verify',
  authRateLimiter,
  validateBody(mfaVerifySchema),
  auditLogMiddleware('MFA_VERIFY', 'User'),
  authController.verifyMfa
);

router.post(
  '/mfa/toggle',
  authenticate,
  auditLogMiddleware('MFA_TOGGLE', 'User'),
  authController.toggleMfa
);

// Active Session Management
router.get('/sessions', authenticate, authController.getSessions);
router.delete('/sessions/:sessionId', authenticate, authController.revokeSession);
router.post('/sessions/revoke-all', authenticate, authController.revokeAllSessions);

export default router;

