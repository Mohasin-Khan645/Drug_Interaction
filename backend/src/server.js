import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { prisma } from './config/database.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`========================================================`);
  logger.info(` DRUGSAFE - Clinical Medication Safety Engine Backend`);
  logger.info(` Status: RUNNING on http://localhost:${PORT}`);
  logger.info(` Health: http://localhost:${PORT}/api/health`);
  logger.info(` OpenAPI Docs: http://localhost:${PORT}/api/docs`);
  logger.info(` Environment: ${env.NODE_ENV}`);
  logger.info(`========================================================`);
});

// Graceful Shutdown Management
async function shutdown(signal) {
  logger.info(`${signal} received. Initiating graceful shutdown of DrugSafe clinical backend...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Prisma database connection pool released.');
    }
    process.exit(0);
  });

  // Force close after 10s if hanging
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default server;

