'use strict';

const notificationService = require('../services/notificationService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const list = asyncHandler(async (req, res) =>
  sendSuccess(res, await notificationService.listForUser(req.user.id, req.validatedQuery))
);

const markRead = asyncHandler(async (req, res) =>
  sendSuccess(res, await notificationService.markRead(req.user.id, req.params.notificationId))
);

const markAllRead = asyncHandler(async (req, res) =>
  sendSuccess(res, await notificationService.markAllRead(req.user.id))
);

module.exports = { list, markRead, markAllRead };
