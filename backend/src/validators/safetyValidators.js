'use strict';

const { z, uuid, idParam, pagination, severity } = require('./common');

const runCheck = {
  body: z.object({
    patientId: uuid,
    force: z.boolean().default(false),
  }),
};

const checkParam = { params: idParam('checkId') };

const findingParam = { params: idParam('findingId') };

const listChecks = { params: idParam('patientId'), query: pagination };

const listFindings = {
  query: pagination.extend({
    patientId: uuid.optional(),
    severity: severity.optional(),
    category: z
      .enum(['DRUG_DRUG', 'DRUG_DISEASE', 'DRUG_ALLERGY', 'DUPLICATION', 'PATIENT_FACTOR'])
      .optional(),
    status: z.enum(['OPEN', 'ACKNOWLEDGED', 'REVIEW_REQUIRED', 'ACCEPTED', 'RESOLVED']).optional(),
  }),
};

const createReview = {
  params: idParam('findingId'),
  body: z.object({
    decision: z.enum(['ACCEPTED', 'ACKNOWLEDGED', 'REQUIRES_INVESTIGATION']),
    clinicalNote: z.string().max(4000).optional(),
  }),
};

module.exports = { runCheck, checkParam, findingParam, listChecks, listFindings, createReview };
