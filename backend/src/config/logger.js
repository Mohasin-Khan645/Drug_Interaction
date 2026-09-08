'use strict';

const pino = require('pino');
const config = require('./index');

const logger = pino({
  level: config.env === 'test' ? 'silent' : config.logLevel,
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'password',
      'passwordHash',
      'token',
      'refreshToken',
      'apiKey',
    ],
    remove: true,
  },
});

module.exports = logger;
