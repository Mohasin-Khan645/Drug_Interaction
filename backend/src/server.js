'use strict';

const createApp = require('./app');
const config = require('./config');
const logger = require('./config/logger');
const prisma = require('./config/prisma');

const app = createApp();
const server = app.listen(config.port, () => {
  logger.info({ port: config.port, env: config.env }, 'DrugSafe API listening');
});

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutting down');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = server;
