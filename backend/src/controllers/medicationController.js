'use strict';

const medicationService = require('../services/medicationService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const list = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await medicationService.listMedications(req.user, req.params.patientId, req.validatedQuery, req)
  )
);

const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await medicationService.addMedication(req.user, req.params.patientId, req.body, req), 201)
);

const update = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await medicationService.updateMedication(req.user, req.params.medicationId, req.body, req)
  )
);

const stop = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await medicationService.stopMedication(req.user, req.params.medicationId, req.body.notes, req)
  )
);

module.exports = { list, create, update, stop };
