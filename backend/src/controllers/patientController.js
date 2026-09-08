'use strict';

const patientService = require('../services/patientService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { paginatedResult } = require('../utils/pagination');

const list = asyncHandler(async (req, res) => {
  const { items, total, pagination } = await patientService.listPatients(req.user, req.validatedQuery);
  return sendSuccess(res, paginatedResult(items, total, pagination));
});

const get = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.getPatient(req.user, req.params.patientId, req))
);

const update = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.updatePatient(req.user, req.params.patientId, req.body, req))
);

const listConditions = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.listConditions(req.user, req.params.patientId, req))
);

const addCondition = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.addCondition(req.user, req.params.patientId, req.body, req), 201)
);

const listAllergies = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.listAllergies(req.user, req.params.patientId, req))
);

const addAllergy = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.addAllergy(req.user, req.params.patientId, req.body, req), 201)
);

const listLabResults = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.listLabResults(req.user, req.params.patientId, req))
);

const addLabResult = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.addLabResult(req.user, req.params.patientId, req.body, req), 201)
);

const listCareTeam = asyncHandler(async (req, res) =>
  sendSuccess(res, await patientService.listCareTeam(req.user, req.params.patientId, req))
);

const addCareTeamMember = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await patientService.addCareTeamMember(req.user, req.params.patientId, req.body.clinicianId, req),
    201
  )
);

const removeCareTeamMember = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await patientService.removeCareTeamMember(
      req.user,
      req.params.patientId,
      req.params.clinicianId,
      req
    )
  )
);

module.exports = {
  list,
  get,
  update,
  listConditions,
  addCondition,
  listAllergies,
  addAllergy,
  listLabResults,
  addLabResult,
  listCareTeam,
  addCareTeamMember,
  removeCareTeamMember,
};
