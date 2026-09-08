'use strict';

const prescriptionService = require('../services/prescriptionService');
const reconciliationService = require('../services/medicationReconciliationService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await prescriptionService.createPrescription(req.user, req.body, req.file, req), 201)
);

const get = asyncHandler(async (req, res) =>
  sendSuccess(res, await prescriptionService.getPrescription(req.user, req.params.prescriptionId, req))
);

const process = asyncHandler(async (req, res) =>
  sendSuccess(res, await prescriptionService.processPrescription(req.user, req.params.prescriptionId, req))
);

const listItems = asyncHandler(async (req, res) =>
  sendSuccess(res, await prescriptionService.listItems(req.user, req.params.prescriptionId, req))
);

const confirmItem = asyncHandler(async (req, res) =>
  sendSuccess(res, await prescriptionService.confirmItem(req.user, req.params.itemId, req.body, req))
);

const reconcilePrescription = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await reconciliationService.previewFromPrescription(req.user, req.params.prescriptionId, req)
  )
);

const reconcilePreview = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await reconciliationService.previewForPatient(req.user, req.params.patientId, req.body.items, req)
  )
);

const reconcileApply = asyncHandler(async (req, res) =>
  sendSuccess(res, await reconciliationService.apply(req.user, req.params.patientId, req.body, req))
);

module.exports = {
  create,
  get,
  process,
  listItems,
  confirmItem,
  reconcilePrescription,
  reconcilePreview,
  reconcileApply,
};
