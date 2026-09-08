'use strict';

const { z, uuid, idParam, pagination, isoDate } = require('./common');

const list = { query: pagination.extend({ search: z.string().max(120).optional() }) };

const patientIdParam = { params: idParam('patientId') };

const update = {
  params: idParam('patientId'),
  body: z
    .object({
      dateOfBirth: isoDate.optional(),
      sex: z.enum(['MALE', 'FEMALE', 'OTHER', 'UNKNOWN']).optional(),
      heightCm: z.number().positive().max(300).optional(),
      weightKg: z.number().positive().max(700).optional(),
      medicalHistory: z.string().max(5000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, 'At least one field is required'),
};

const addCondition = {
  params: idParam('patientId'),
  body: z
    .object({
      conditionId: uuid.optional(),
      name: z.string().min(2).max(160).optional(),
      status: z.enum(['ACTIVE', 'RESOLVED', 'SUSPECTED']).default('ACTIVE'),
      notes: z.string().max(2000).optional(),
    })
    .refine((data) => data.conditionId || data.name, 'Either conditionId or name is required'),
};

const addAllergy = {
  params: idParam('patientId'),
  body: z.object({
    allergen: z.string().min(2).max(160),
    ingredientId: uuid.optional(),
    drugClassId: uuid.optional(),
    reaction: z.string().max(500).optional(),
    severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'UNKNOWN']).default('UNKNOWN'),
    notes: z.string().max(2000).optional(),
  }),
};

const addLabResult = {
  params: idParam('patientId'),
  body: z.object({
    code: z.string().min(1).max(60),
    name: z.string().min(1).max(160),
    value: z.number(),
    unit: z.string().max(40).optional(),
    takenAt: isoDate.optional(),
  }),
};

const careTeamMember = {
  params: idParam('patientId'),
  body: z.object({ clinicianId: uuid }),
};

const careTeamMemberParams = { params: z.object({ patientId: uuid, clinicianId: uuid }) };

module.exports = {
  list,
  patientIdParam,
  update,
  addCondition,
  addAllergy,
  addLabResult,
  careTeamMember,
  careTeamMemberParams,
};
