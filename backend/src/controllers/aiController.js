'use strict';

const aiService = require('../services/aiService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const explain = asyncHandler(async (req, res) =>
  sendSuccess(res, await aiService.explain(req.user, req.body, req))
);

module.exports = { explain };
