import { PrismaClient } from '@prisma/client';
import net from 'net';
import { logger } from './logger.js';
import { env } from './env.js';

let prisma;

try {
  prisma = new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });
} catch (err) {
  logger.error({ err }, 'Failed to initialize PrismaClient');
}

let dbConnected = null;

/**
 * Fast non-blocking check to determine if a PostgreSQL daemon is actively reachable
 */
export async function isDatabaseAvailable() {
  if (dbConnected !== null) return dbConnected;

  // In test environment, default to fast in-memory mode unless explicitly configured
  if (env.NODE_ENV === 'test' && !process.env.TEST_WITH_LIVE_DB) {
    dbConnected = false;
    return false;
  }

  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(300); // 300ms quick probe
    socket.on('connect', () => {
      socket.destroy();
      dbConnected = true;
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      dbConnected = false;
      resolve(false);
    });
    socket.on('error', () => {
      socket.destroy();
      dbConnected = false;
      resolve(false);
    });
    // Parse host and port from DATABASE_URL or default to localhost:5432
    socket.connect(5432, '127.0.0.1');
  });
}

export { prisma };
export default prisma;

