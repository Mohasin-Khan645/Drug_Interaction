import { prisma } from '../config/database.js';
import { env } from '../config/env.js';

export const healthController = {
  async getHealth(req, res) {
    let databaseStatus = 'disconnected';

    try {
      if (prisma) {
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'connected';
      }
    } catch {
      databaseStatus = 'degraded_or_unreachable';
    }

    return res.status(200).json({
      status: 'healthy',
      apiStatus: 'ONLINE',
      database: databaseStatus,
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      version: '1.0.0',
    });
  },
};

