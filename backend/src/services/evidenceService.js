'use strict';

const evidenceRepository = require('../repositories/evidenceRepository');
const auditService = require('./auditService');
const ApiError = require('../utils/apiError');
const { AUDIT_ACTIONS } = require('../constants');
const { paginatedResult } = require('../utils/pagination');

const listSources = () => evidenceRepository.listSources();

const createSource = async (admin, payload, req) => {
  const source = await evidenceRepository.createSource(payload);
  await auditService.record({
    req,
    userId: admin.id,
    action: AUDIT_ACTIONS.ADMIN_CHANGE,
    resourceType: 'KnowledgeSource',
    resourceId: source.id,
    metadata: { operation: 'CREATE' },
  });
  return source;
};

const updateSource = async (admin, id, payload, req) => {
  const source = await evidenceRepository.updateSource(id, payload);
  await auditService.record({
    req,
    userId: admin.id,
    action: AUDIT_ACTIONS.ADMIN_CHANGE,
    resourceType: 'KnowledgeSource',
    resourceId: id,
    metadata: { operation: 'UPDATE' },
  });
  return source;
};

const listDocuments = async (filters) => {
  const { items, total, pagination } = await evidenceRepository.listDocuments(filters);
  return paginatedResult(items, total, pagination);
};

const getDocument = async (id) => {
  const document = await evidenceRepository.findDocumentById(id);
  if (!document) throw ApiError.notFound('Evidence document not found');
  return document;
};

const createDocument = async (admin, payload, req) => {
  const document = await evidenceRepository.createDocument({
    ...payload,
    retrievedAt: payload.retrievedAt ? new Date(payload.retrievedAt) : new Date(),
  });
  await auditService.record({
    req,
    userId: admin.id,
    action: AUDIT_ACTIONS.ADMIN_CHANGE,
    resourceType: 'KnowledgeDocument',
    resourceId: document.id,
    metadata: { operation: 'CREATE' },
  });
  return document;
};

const updateDocument = async (admin, id, payload, req) => {
  const document = await evidenceRepository.updateDocument(id, payload);
  await auditService.record({
    req,
    userId: admin.id,
    action: AUDIT_ACTIONS.ADMIN_CHANGE,
    resourceType: 'KnowledgeDocument',
    resourceId: id,
    metadata: { operation: 'UPDATE' },
  });
  return document;
};

module.exports = {
  listSources,
  createSource,
  updateSource,
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
};
