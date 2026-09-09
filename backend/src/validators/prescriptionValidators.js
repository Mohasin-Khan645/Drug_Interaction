'use strict';

const { z, uuid, idParam } = require('./common');

const create = {
  body: z.object({
    patientId: uuid,
    notes: z.string().max(2000).optional(),
  }),
};

const byId = { params: idParam('prescriptionId') };

const confirmItem = {
  params: idParam('itemId'),
  body: z.object({
    drugId: uuid.optional(),
    status: z.enum(['CONFIRMED', 'REJECTED', 'PENDING_REVIEW']),
    strength: z.string().max(80).optional(),
    doseForm: z.string().max(80).optional(),
    route: z.string().max(80).optional(),
    frequency: z.string().max(120).optional(),
  }),
};

const reconcilePreview = {
  params: idParam('patientId'),
  body: z.object({
    items: z
      .array(
        z
          .object({
            drugId: uuid.optional(),
            rawText: z.string().min(2).max(200).optional(),
            strength: z.string().max(80).optional(),
            doseForm: z.string().max(80).optional(),
            route: z.string().max(80).optional(),
            frequency: z.string().max(120).optional(),
          })
          .refine((item) => item.drugId || item.rawText, 'Each item needs a drugId or rawText')
      )
      .min(1)
      .max(50),
  }),
};

const reconcileApply = {
  params: idParam('patientId'),
  body: z
    .object({
      additions: z
        .array(
          z.object({
            drugId: uuid,
            prescriptionItemId: uuid.optional(),
            strength: z.string().max(80).optional(),
            doseForm: z.string().max(80).optional(),
            route: z.string().max(80).optional(),
            frequency: z.string().max(120).optional(),
            source: z
              .enum([
                'SELF_REPORTED',
                'PRESCRIPTION',
                'OTC',
                'SUPPLEMENT',
                'CLINICIAN_ENTERED',
                'RECONCILIATION',
              ])
              .optional(),
            notes: z.string().max(2000).optional(),
          })
        )
        .max(50)
        .default([]),
      statusUpdates: z
        .array(
          z.object({
            medicationId: uuid,
            status: z.enum(['ACTIVE', 'STOPPED', 'ON_HOLD', 'PENDING_REVIEW']),
            notes: z.string().max(2000).optional(),
          })
        )
        .max(50)
        .default([]),
    })
    .refine(
      (data) => data.additions.length > 0 || data.statusUpdates.length > 0,
      'Nothing to apply'
    ),
};

module.exports = { create, byId, confirmItem, reconcilePreview, reconcileApply };
