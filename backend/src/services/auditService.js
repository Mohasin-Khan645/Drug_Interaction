'use strict';

const auditRepository = require('../repositories/auditRepository');
const logger = require('../config/logger');

const FORBIDDEN_METADATA_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'apikey',
  'secret',
];

// Credentials must never reach the audit trail, even if a caller passes them by mistake.
const sanitizeMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return undefined;
  return Object.fromEntries(
    Object.entries(metadata).filter(([key]) => !FORBIDDEN_METADATA_KEYS.includes(key.toLowerCase()))
  );
};

const record = async ({ req, userId, action, resourceType, resourceId, metadata }) => {
  try {
    await auditRepository.create({
      userId: userId ?? req?.user?.id ?? null,
      action,
      resourceType,
      resourceId,
      metadata: sanitizeMetadata(metadata),
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    });
  } catch (err) {
    // Audit failures must never break the caller's request.
    logger.error({ err, action }, 'Failed to write audit log');
  }
};

const list = (filters) => auditRepository.list(filters);

module.exports = { record, list, sanitizeMetadata };
