'use strict';

const { z, uuid, idParam, pagination, medicationStatus, isoDate } = require('./common');

const MEDICATION_SOURCE = z.enum([
  'SELF_REPORTED',
  'PRESCRIPTION',
  'OTC',
  'SUPPLEMENT',
  'CLINICIAN_ENTERED',
  'RECONCILIATION',
]);

const list = {
  params: idParam('patientId'),
  query: pagination.extend({ status: medicationStatus.optional() }),
};

const create = {
  params: idParam('patientId'),
  body: z
    .object({
      drugId: uuid.optional(),
      rawName: z.string().min(2).max(200).optional(),
      strength: z.string().max(80).optional(),
      doseForm: z.string().max(80).optional(),
      route: z.string().max(80).optional(),
      frequency: z.string().max(120).optional(),
      startDate: isoDate.optional(),
      source: MEDICATION_SOURCE.default('SELF_REPORTED'),
      notes: z.string().max(2000).optional(),
    })
    .refine((data) => data.drugId || data.rawName, 'Either drugId or rawName is required'),
};

const update = {
  params: idParam('medicationId'),
  body: z
    .object({
      strength: z.string().max(80).optional(),
      doseForm: z.string().max(80).optional(),
      route: z.string().max(80).optional(),
      frequency: z.string().max(120).optional(),
      status: medicationStatus.optional(),
      endDate: isoDate.optional(),
      notes: z.string().max(2000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, 'At least one field is required'),
};

const stop = {
  params: idParam('medicationId'),
  body: z.object({ notes: z.string().max(2000).optional() }),
};

module.exports = { list, create, update, stop, MEDICATION_SOURCE };
