'use strict';

const { z } = require('zod');

const uuid = z.string().uuid();

const idParam = (name = 'id') => z.object({ [name]: uuid });

const pagination = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

const severity = z.enum([
  'CONTRAINDICATED',
  'CRITICAL',
  'MAJOR',
  'MODERATE',
  'MINOR',
  'INFORMATIONAL',
]);

const recordStatus = z.enum(['ACTIVE', 'INACTIVE', 'ARCHIVED']);

const medicationStatus = z.enum(['ACTIVE', 'STOPPED', 'ON_HOLD', 'PENDING_REVIEW']);

const isoDate = z.coerce.date();

module.exports = { uuid, idParam, pagination, severity, recordStatus, medicationStatus, isoDate, z };
