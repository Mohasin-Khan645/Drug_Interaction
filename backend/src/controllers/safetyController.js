'use strict';

const safetyService = require('../services/safetyService');
const reviewService = require('../services/reviewService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const runCheck = asyncHandler(async (req, res) => {
  const result = await safetyService.runCheck(
    req.user,
    req.body.patientId,
    { force: req.body.force },
    req
  );
  return sendSuccess(res, result, result.reused ? 200 : 201);
});

const getCheck = asyncHandler(async (req, res) =>
  sendSuccess(res, await safetyService.getCheck(req.user, req.params.checkId, req))
);

const listChecks = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await safetyService.listChecks(req.user, req.params.patientId, req.validatedQuery, req)
  )
);

const getFinding = asyncHandler(async (req, res) =>
  sendSuccess(res, await safetyService.getFinding(req.user, req.params.findingId, req))
);

const listFindings = asyncHandler(async (req, res) =>
  sendSuccess(res, await safetyService.listFindings(req.user, req.validatedQuery, req))
);

const createReview = asyncHandler(async (req, res) =>
  sendSuccess(res, await reviewService.createReview(req.user, req.params.findingId, req.body, req), 201)
);

const listReviews = asyncHandler(async (req, res) =>
  sendSuccess(res, await reviewService.listReviews(req.user, req.params.findingId, req))
);

module.exports = { runCheck, getCheck, listChecks, getFinding, listFindings, createReview, listReviews };
