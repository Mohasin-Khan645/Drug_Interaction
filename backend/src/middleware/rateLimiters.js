'use strict';

const rateLimit = require('express-rate-limit');
const config = require('../config');
const { ERROR_CODES } = require('../constants');

const handler = (req, res) =>
  res.status(429).json({
    success: false,
    error: { code: ERROR_CODES.RATE_LIMITED, message: 'Too many requests, please try again later' },
  });

const buildLimiter = (max) =>
  rateLimit({
    windowMs: config.rateLimit.windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => config.env === 'test',
    handler,
  });

module.exports = {
  globalLimiter: buildLimiter(config.rateLimit.max),
  authLimiter: buildLimiter(config.rateLimit.authMax),
};
