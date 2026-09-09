'use strict';

const evidenceService = require('../services/evidenceService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const listSources = asyncHandler(async (req, res) => sendSuccess(res, await evidenceService.listSources()));

const listDocuments = asyncHandler(async (req, res) =>
  sendSuccess(res, await evidenceService.listDocuments(req.validatedQuery))
);

const getDocument = asyncHandler(async (req, res) =>
  sendSuccess(res, await evidenceService.getDocument(req.params.documentId))
);

module.exports = { listSources, listDocuments, getDocument };
