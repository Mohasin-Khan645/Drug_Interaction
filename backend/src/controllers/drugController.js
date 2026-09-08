'use strict';

const drugService = require('../services/drugService');
const normalizationService = require('../services/normalizationService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const list = asyncHandler(async (req, res) => sendSuccess(res, await drugService.listDrugs(req.validatedQuery)));

const search = asyncHandler(async (req, res) =>
  sendSuccess(res, await drugService.searchDrugs(req.validatedQuery))
);

const get = asyncHandler(async (req, res) => sendSuccess(res, await drugService.getDrug(req.params.drugId)));

const interactions = asyncHandler(async (req, res) =>
  sendSuccess(res, await drugService.getDrugInteractions(req.params.drugId))
);

const classes = asyncHandler(async (req, res) => sendSuccess(res, await drugService.listClasses()));

const ingredients = asyncHandler(async (req, res) => sendSuccess(res, await drugService.listIngredients()));

const normalize = asyncHandler(async (req, res) =>
  sendSuccess(res, { results: await normalizationService.normalizeMany(req.body.names) })
);

module.exports = { list, search, get, interactions, classes, ingredients, normalize };
