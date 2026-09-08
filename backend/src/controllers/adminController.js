'use strict';

const adminService = require('../services/adminService');
const evidenceService = require('../services/evidenceService');
const analyticsService = require('../services/analyticsService');
const auditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');
const { sendSuccess } = require('../utils/response');
const { paginatedResult } = require('../utils/pagination');
const { ruleBodyByKind } = require('../validators/adminValidators');

// Rule payloads differ per kind, so the kind-specific schema is applied here
// rather than in a single route-level schema.
const parseRuleBody = (kind, body, { partial = false } = {}) => {
  const schema = partial ? ruleBodyByKind[kind].partial() : ruleBodyByKind[kind];
  const result = schema.safeParse(body);
  if (!result.success) {
    throw ApiError.badRequest(
      `Invalid ${kind} rule payload`,
      result.error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    );
  }
  return result.data;
};

const listUsers = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.listUsers(req.validatedQuery))
);

const createUser = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.createUser(req.user, req.body, req), 201)
);

const updateUser = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.updateUser(req.user, req.params.userId, req.body, req))
);

const deactivateUser = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.deactivateUser(req.user, req.params.userId, req))
);

const createDrug = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.createDrug(req.user, req.body, req), 201)
);

const updateDrug = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.updateDrug(req.user, req.params.drugId, req.body, req))
);

const deactivateDrug = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.deactivateDrug(req.user, req.params.drugId, req))
);

const addAlias = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.addAlias(req.user, req.params.drugId, req.body, req), 201)
);

const addIdentifier = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.addIdentifier(req.user, req.params.drugId, req.body, req), 201)
);

const listRules = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.listRules(req.params.kind, req.validatedQuery))
);

const createRule = asyncHandler(async (req, res) => {
  const payload = parseRuleBody(req.params.kind, req.body);
  return sendSuccess(res, await adminService.createRule(req.user, req.params.kind, payload, req), 201);
});

const updateRule = asyncHandler(async (req, res) => {
  const payload = parseRuleBody(req.params.kind, req.body, { partial: true });
  return sendSuccess(
    res,
    await adminService.updateRule(req.user, req.params.kind, req.params.ruleId, payload, req)
  );
});

const deactivateRule = asyncHandler(async (req, res) =>
  sendSuccess(res, await adminService.deactivateRule(req.user, req.params.kind, req.params.ruleId, req))
);

const listSources = asyncHandler(async (req, res) => sendSuccess(res, await evidenceService.listSources()));

const createSource = asyncHandler(async (req, res) =>
  sendSuccess(res, await evidenceService.createSource(req.user, req.body, req), 201)
);

const updateSource = asyncHandler(async (req, res) =>
  sendSuccess(res, await evidenceService.updateSource(req.user, req.params.sourceId, req.body, req))
);

const listDocuments = asyncHandler(async (req, res) =>
  sendSuccess(res, await evidenceService.listDocuments(req.validatedQuery))
);

const createDocument = asyncHandler(async (req, res) =>
  sendSuccess(res, await evidenceService.createDocument(req.user, req.body, req), 201)
);

const updateDocument = asyncHandler(async (req, res) =>
  sendSuccess(res, await evidenceService.updateDocument(req.user, req.params.documentId, req.body, req))
);

const listAudit = asyncHandler(async (req, res) => {
  const { items, total, pagination } = await auditService.list(req.validatedQuery);
  return sendSuccess(res, paginatedResult(items, total, pagination));
});

const analytics = asyncHandler(async (req, res) =>
  sendSuccess(res, await analyticsService.overview(req.validatedQuery))
);

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  createDrug,
  updateDrug,
  deactivateDrug,
  addAlias,
  addIdentifier,
  listRules,
  createRule,
  updateRule,
  deactivateRule,
  listSources,
  createSource,
  updateSource,
  listDocuments,
  createDocument,
  updateDocument,
  listAudit,
  analytics,
};
