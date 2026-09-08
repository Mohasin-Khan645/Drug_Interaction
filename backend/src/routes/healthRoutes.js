'use strict';

const express = require('express');
const prisma = require('../config/prisma');
const config = require('../config');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    let database = 'up';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      database = 'down';
    }
    return sendSuccess(
      res,
      {
        status: database === 'up' ? 'ok' : 'degraded',
        database,
        environment: config.env,
        timestamp: new Date().toISOString(),
      },
      database === 'up' ? 200 : 503
    );
  })
);

module.exports = router;
