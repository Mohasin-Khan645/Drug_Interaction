'use strict';

const userRepository = require('../repositories/userRepository');
const drugRepository = require('../repositories/drugRepository');
const ruleRepository = require('../repositories/ruleRepository');
const auditService = require('./auditService');
const ApiError = require('../utils/apiError');
const { AUDIT_ACTIONS } = require('../constants');
const { hashPassword } = require('../utils/crypto');
const { paginatedResult } = require('../utils/pagination');

const recordChange = (req, user, resourceType, resourceId, metadata) =>
  auditService.record({
    req,
    userId: user.id,
    action: AUDIT_ACTIONS.ADMIN_CHANGE,
    resourceType,
    resourceId,
    metadata,
  });

const listUsers = async (filters) => {
  const { items, total, pagination } = await userRepository.list(filters);
  return paginatedResult(items, total, pagination);
};

const createUser = async (admin, { name, email, password, role }, req) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw ApiError.conflict('An account with this email already exists');
  const created = await userRepository.create({
    name,
    email,
    role,
    passwordHash: await hashPassword(password),
    emailVerified: true,
  });
  await recordChange(req, admin, 'User', created.id, { operation: 'CREATE', role });
  return userRepository.findPublicById(created.id);
};

const updateUser = async (admin, id, data, req) => {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  await userRepository.update(id, data);
  await recordChange(req, admin, 'User', id, { operation: 'UPDATE', fields: Object.keys(data) });
  return userRepository.findPublicById(id);
};

const deactivateUser = async (admin, id, req) => {
  const user = await userRepository.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  const updated = await userRepository.update(id, { status: 'SUSPENDED' });
  await recordChange(req, admin, 'User', id, { operation: 'SUSPEND' });
  return { id: updated.id, status: updated.status };
};

const createDrug = async (admin, payload, req) => {
  const drug = await drugRepository.create(payload);
  await recordChange(req, admin, 'Drug', drug.id, { operation: 'CREATE' });
  return drug;
};

const updateDrug = async (admin, id, payload, req) => {
  const drug = await drugRepository.update(id, payload);
  await recordChange(req, admin, 'Drug', id, { operation: 'UPDATE' });
  return drug;
};

// Drugs are deactivated rather than deleted so historical records stay resolvable.
const deactivateDrug = async (admin, id, req) => {
  const drug = await drugRepository.deactivate(id);
  await recordChange(req, admin, 'Drug', id, { operation: 'DEACTIVATE' });
  return drug;
};

const addAlias = async (admin, drugId, payload, req) => {
  const alias = await drugRepository.addAlias({ drugId, ...payload });
  await recordChange(req, admin, 'DrugAlias', alias.id, { operation: 'CREATE', drugId });
  return alias;
};

const removeAlias = async (admin, id, req) => {
  const alias = await drugRepository.removeAlias(id);
  await recordChange(req, admin, 'DrugAlias', id, { operation: 'DELETE' });
  return alias;
};

const addIdentifier = async (admin, drugId, payload, req) => {
  const identifier = await drugRepository.addIdentifier({ drugId, ...payload });
  await recordChange(req, admin, 'DrugIdentifier', identifier.id, { operation: 'CREATE', drugId });
  return identifier;
};

const removeIdentifier = async (admin, id, req) => {
  const identifier = await drugRepository.removeIdentifier(id);
  await recordChange(req, admin, 'DrugIdentifier', id, { operation: 'DELETE' });
  return identifier;
};

const listRules = async (kind, filters) => {
  const { items, total, pagination } = await ruleRepository.listRules(kind, filters);
  return paginatedResult(items, total, pagination);
};

const createRule = async (admin, kind, payload, req) => {
  if (kind === 'interaction') {
    const { drugAId, drugBId } = ruleRepository.orderPair(payload.drugAId, payload.drugBId);
    if (drugAId === drugBId) throw ApiError.badRequest('An interaction requires two different drugs');
    // Stored in canonical order so A+B and B+A always resolve to one rule.
    const rule = await ruleRepository.createRule(kind, { ...payload, drugAId, drugBId });
    await recordChange(req, admin, 'DrugInteraction', rule.id, { operation: 'CREATE' });
    return rule;
  }
  const rule = await ruleRepository.createRule(kind, payload);
  await recordChange(req, admin, kind, rule.id, { operation: 'CREATE' });
  return rule;
};

// Updating a rule archives the old version and creates a new one.
const updateRule = async (admin, kind, id, payload, req) => {
  const rule = await ruleRepository.supersedeRule(kind, id, payload);
  if (!rule) throw ApiError.notFound('Rule not found');
  await recordChange(req, admin, kind, rule.id, { operation: 'NEW_VERSION', supersededId: id });
  return rule;
};

const deactivateRule = async (admin, kind, id, req) => {
  const rule = await ruleRepository.deactivateRule(kind, id);
  await recordChange(req, admin, kind, id, { operation: 'DEACTIVATE' });
  return rule;
};

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deactivateUser,
  createDrug,
  updateDrug,
  deactivateDrug,
  addAlias,
  removeAlias,
  addIdentifier,
  removeIdentifier,
  listRules,
  createRule,
  updateRule,
  deactivateRule,
};
