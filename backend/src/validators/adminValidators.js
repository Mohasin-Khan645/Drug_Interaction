'use strict';

const { z, uuid, idParam, pagination, severity } = require('./common');

const strongPassword = z
  .string()
  .min(12)
  .max(128)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/);

const role = z.enum(['PATIENT', 'DOCTOR', 'PHARMACIST', 'ADMIN']);

const listUsers = {
  query: pagination.extend({
    role: role.optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    search: z.string().max(120).optional(),
  }),
};

const createUser = {
  body: z.object({
    name: z.string().min(2).max(120),
    email: z.string().email().max(255).toLowerCase(),
    password: strongPassword,
    role,
  }),
};

const updateUser = {
  params: idParam('userId'),
  body: z
    .object({
      name: z.string().min(2).max(120).optional(),
      role: role.optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, 'At least one field is required'),
};

const userParam = { params: idParam('userId') };

const drugBody = z.object({
  genericName: z.string().min(2).max(200),
  brandName: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
  drugClassId: uuid.optional(),
});

const createDrug = { body: drugBody };
const updateDrug = { params: idParam('drugId'), body: drugBody.partial() };
const drugParam = { params: idParam('drugId') };

const aliasBody = {
  params: idParam('drugId'),
  body: z.object({
    alias: z.string().min(2).max(200),
    type: z.enum(['BRAND', 'SYNONYM', 'ABBREVIATION', 'MISSPELLING']).default('SYNONYM'),
  }),
};

const identifierBody = {
  params: idParam('drugId'),
  body: z.object({
    type: z.enum(['RXNORM', 'NDC', 'ATC', 'SNOMED', 'OTHER']),
    value: z.string().min(1).max(120),
  }),
};

const RULE_KINDS = ['interaction', 'disease', 'allergy', 'duplication', 'factor'];

const ruleKindParam = z.object({ kind: z.enum(RULE_KINDS) });

const evidenceFields = {
  sourceId: uuid.optional(),
  documentId: uuid.optional(),
  evidenceLevel: z.string().max(60).optional(),
};

const ruleBodyByKind = {
  interaction: z.object({
    drugAId: uuid,
    drugBId: uuid,
    severity,
    interactionType: z.string().max(120).optional(),
    clinicalEffect: z.string().max(2000).optional(),
    mechanism: z.string().max(2000).optional(),
    management: z.string().max(2000).optional(),
    ...evidenceFields,
  }),
  disease: z.object({
    drugId: uuid,
    conditionId: uuid,
    ruleType: z.enum(['CONTRAINDICATION', 'PRECAUTION', 'WARNING']),
    severity,
    description: z.string().min(3).max(2000),
    management: z.string().max(2000).optional(),
    ...evidenceFields,
  }),
  allergy: z.object({
    drugId: uuid.optional(),
    ingredientId: uuid.optional(),
    drugClassId: uuid.optional(),
    allergen: z.string().min(2).max(160),
    relation: z.enum(['EXACT_DRUG', 'INGREDIENT', 'CLASS', 'CROSS_SENSITIVITY']),
    severity,
    certain: z.boolean().default(true),
    description: z.string().min(3).max(2000),
    management: z.string().max(2000).optional(),
    ...evidenceFields,
  }),
  duplication: z.object({
    ruleType: z.enum(['SAME_DRUG', 'SAME_INGREDIENT', 'THERAPEUTIC']),
    drugClassId: uuid.optional(),
    severity,
    description: z.string().min(3).max(2000),
    management: z.string().max(2000).optional(),
    ...evidenceFields,
  }),
  factor: z.object({
    drugId: uuid,
    factorType: z.enum([
      'AGE_MIN',
      'AGE_MAX',
      'WEIGHT_MIN',
      'WEIGHT_MAX',
      'RENAL_FUNCTION',
      'HEPATIC_FUNCTION',
      'LAB_VALUE',
    ]),
    labCode: z.string().max(60).optional(),
    operator: z.enum(['LT', 'LTE', 'GT', 'GTE', 'EQ']),
    threshold: z.number(),
    unit: z.string().max(40).optional(),
    severity,
    description: z.string().min(3).max(2000),
    management: z.string().max(2000).optional(),
    ...evidenceFields,
  }),
};

const listRules = { params: ruleKindParam, query: pagination };

const createRule = {
  params: ruleKindParam,
  body: z.record(z.unknown()),
};

const ruleParam = { params: z.object({ kind: z.enum(RULE_KINDS), ruleId: uuid }) };

const updateRule = { params: ruleParam.params, body: z.record(z.unknown()) };

const listAudit = {
  query: pagination.extend({
    userId: uuid.optional(),
    action: z.string().max(80).optional(),
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
  }),
};

const analytics = { query: z.object({ days: z.coerce.number().int().min(1).max(365).optional() }) };

const createSource = {
  body: z.object({
    name: z.string().min(2).max(200),
    url: z.string().url().max(500).optional(),
    version: z.string().max(60).optional(),
    description: z.string().max(2000).optional(),
  }),
};

const updateSource = { params: idParam('sourceId'), body: createSource.body.partial() };

const createDocument = {
  body: z.object({
    sourceId: uuid,
    title: z.string().min(2).max(300),
    content: z.string().min(3).max(20000),
    reference: z.string().max(500).optional(),
    version: z.string().max(60).optional(),
    evidenceLevel: z.string().max(60).optional(),
    retrievedAt: z.coerce.date().optional(),
    reviewedAt: z.coerce.date().optional(),
  }),
};

const updateDocument = { params: idParam('documentId'), body: createDocument.body.partial() };

const listDocuments = {
  query: pagination.extend({ sourceId: uuid.optional(), q: z.string().max(160).optional() }),
};

const documentParam = { params: idParam('documentId') };

module.exports = {
  listUsers,
  createUser,
  updateUser,
  userParam,
  createDrug,
  updateDrug,
  drugParam,
  aliasBody,
  identifierBody,
  listRules,
  createRule,
  updateRule,
  ruleParam,
  ruleBodyByKind,
  RULE_KINDS,
  listAudit,
  analytics,
  createSource,
  updateSource,
  createDocument,
  updateDocument,
  listDocuments,
  documentParam,
};
