import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

export function auditLogMiddleware(action, resourceType) {
  return async (req, res, next) => {
    // Intercept finish event to capture outcome
    res.on('finish', async () => {
      // Only audit successful or explicit clinical write/access events
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const userId = req.user?.id || null;
          const ipAddress = req.ip || req.socket?.remoteAddress || null;
          const userAgent = req.headers['user-agent'] || null;

          // Redact sensitive data from metadata
          const safeBody = { ...req.body };
          delete safeBody.password;
          delete safeBody.confirmPassword;
          delete safeBody.token;

          const resourceId = req.params?.id || req.params?.patientId || req.params?.findingId || null;

          if (prisma && prisma.auditLog) {
            await prisma.auditLog.create({
              data: {
                userId,
                action,
                resourceType,
                resourceId: resourceId ? String(resourceId) : null,
                ipAddress,
                userAgent,
                status: 'SUCCESS',
                metadata: JSON.stringify({
                  method: req.method,
                  path: req.originalUrl,
                  params: req.params,
                }),
              },
            });
          }
        } catch (err) {
          logger.warn({ err }, 'Failed to asynchronously write audit log');
        }
      }
    });

    next();
  };
}

