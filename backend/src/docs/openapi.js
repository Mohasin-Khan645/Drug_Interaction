'use strict';

const { version } = require('../../package.json');

const ok = (description) => ({
  description,
  content: {
    'application/json': {
      schema: { $ref: '#/components/schemas/SuccessResponse' },
    },
  },
});

const errors = {
  400: { $ref: '#/components/responses/Error' },
  401: { $ref: '#/components/responses/Error' },
  403: { $ref: '#/components/responses/Error' },
  404: { $ref: '#/components/responses/Error' },
};

const json = (schema) => ({ required: true, content: { 'application/json': { schema } } });

const obj = (properties, required = []) => ({ type: 'object', properties, required });

const str = { type: 'string' };
const uuid = { type: 'string', format: 'uuid' };
const bool = { type: 'boolean' };
const num = { type: 'number' };

const pathParam = (name) => ({ name, in: 'path', required: true, schema: uuid });
const queryParams = [
  { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1 } },
  { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100 } },
];

const operation = ({ tag, summary, params = [], body, responses = { 200: ok('Success'), ...errors } }) => ({
  tags: [tag],
  summary,
  ...(params.length ? { parameters: params } : {}),
  ...(body ? { requestBody: json(body) } : {}),
  responses,
});

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'DrugSafe API',
    version,
    description:
      'Medication safety and drug interaction intelligence API. Safety findings are produced by deterministic curated rules; the AI layer only explains verified findings and never overrides them.',
  },
  servers: [{ url: '/api' }],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Patients' },
    { name: 'Medications' },
    { name: 'Drugs' },
    { name: 'Prescriptions' },
    { name: 'Safety' },
    { name: 'Reviews' },
    { name: 'Reports' },
    { name: 'Notifications' },
    { name: 'Evidence' },
    { name: 'AI' },
    { name: 'Admin' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      SuccessResponse: obj({ success: { type: 'boolean', enum: [true] }, data: { type: 'object' } }),
      ErrorResponse: obj({
        success: { type: 'boolean', enum: [false] },
        error: obj({ code: str, message: str, details: { type: 'array', items: { type: 'object' } } }, [
          'code',
          'message',
        ]),
      }),
      SafetyFinding: obj({
        id: uuid,
        category: {
          type: 'string',
          enum: ['DRUG_DRUG', 'DRUG_DISEASE', 'DRUG_ALLERGY', 'DUPLICATION', 'PATIENT_FACTOR'],
        },
        severity: {
          type: 'string',
          enum: ['CONTRAINDICATED', 'CRITICAL', 'MAJOR', 'MODERATE', 'MINOR', 'INFORMATIONAL'],
        },
        title: str,
        description: str,
        clinicalEffect: str,
        mechanism: str,
        management: str,
        status: {
          type: 'string',
          enum: ['OPEN', 'ACKNOWLEDGED', 'REVIEW_REQUIRED', 'ACCEPTED', 'RESOLVED'],
        },
        evidence: { type: 'array', items: { type: 'object' } },
      }),
    },
    responses: {
      Error: {
        description: 'Error',
        content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': { get: { tags: ['Health'], summary: 'Service and database health', security: [], responses: { 200: ok('Healthy'), 503: { $ref: '#/components/responses/Error' } } } },

    '/auth/register': {
      post: {
        ...operation({
          tag: 'Auth',
          summary: 'Register a patient account',
          body: obj({ name: str, email: { type: 'string', format: 'email' }, password: str }, [
            'name',
            'email',
            'password',
          ]),
          responses: { 201: ok('Created'), ...errors },
        }),
        security: [],
      },
    },
    '/auth/login': {
      post: {
        ...operation({
          tag: 'Auth',
          summary: 'Log in and receive an access token plus refresh cookie',
          body: obj({ email: str, password: str }, ['email', 'password']),
        }),
        security: [],
      },
    },
    '/auth/refresh': {
      post: { ...operation({ tag: 'Auth', summary: 'Rotate the refresh token' }), security: [] },
    },
    '/auth/logout': { post: { ...operation({ tag: 'Auth', summary: 'Revoke the current refresh token' }), security: [] } },
    '/auth/me': { get: operation({ tag: 'Auth', summary: 'Current authenticated user' }) },
    '/auth/verify-email': {
      post: { ...operation({ tag: 'Auth', summary: 'Verify an email address', body: obj({ token: str }, ['token']) }), security: [] },
    },
    '/auth/forgot-password': {
      post: { ...operation({ tag: 'Auth', summary: 'Request a password reset', body: obj({ email: str }, ['email']) }), security: [] },
    },
    '/auth/reset-password': {
      post: {
        ...operation({
          tag: 'Auth',
          summary: 'Reset a password with a token',
          body: obj({ token: str, password: str }, ['token', 'password']),
        }),
        security: [],
      },
    },

    '/patients': { get: operation({ tag: 'Patients', summary: 'List patients visible to the caller', params: queryParams }) },
    '/patients/{patientId}': {
      get: operation({ tag: 'Patients', summary: 'Get a patient with clinical data', params: [pathParam('patientId')] }),
      patch: operation({
        tag: 'Patients',
        summary: 'Update patient demographics',
        params: [pathParam('patientId')],
        body: obj({ dateOfBirth: str, sex: str, heightCm: num, weightKg: num, medicalHistory: str }),
      }),
    },
    '/patients/{patientId}/conditions': {
      get: operation({ tag: 'Patients', summary: 'List conditions', params: [pathParam('patientId')] }),
      post: operation({
        tag: 'Patients',
        summary: 'Add a condition',
        params: [pathParam('patientId')],
        body: obj({ conditionId: uuid, name: str, status: str, notes: str }),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/patients/{patientId}/allergies': {
      get: operation({ tag: 'Patients', summary: 'List allergies', params: [pathParam('patientId')] }),
      post: operation({
        tag: 'Patients',
        summary: 'Add an allergy',
        params: [pathParam('patientId')],
        body: obj({ allergen: str, reaction: str, severity: str }, ['allergen']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/patients/{patientId}/lab-results': {
      get: operation({ tag: 'Patients', summary: 'List lab results', params: [pathParam('patientId')] }),
      post: operation({
        tag: 'Patients',
        summary: 'Add a lab result',
        params: [pathParam('patientId')],
        body: obj({ code: str, name: str, value: num, unit: str }, ['code', 'name', 'value']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/patients/{patientId}/care-team': {
      get: operation({ tag: 'Patients', summary: 'List care team members', params: [pathParam('patientId')] }),
      post: operation({
        tag: 'Patients',
        summary: 'Grant a clinician access',
        params: [pathParam('patientId')],
        body: obj({ clinicianId: uuid }, ['clinicianId']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/patients/{patientId}/care-team/{clinicianId}': {
      delete: operation({
        tag: 'Patients',
        summary: 'Revoke clinician access',
        params: [pathParam('patientId'), pathParam('clinicianId')],
      }),
    },
    '/patients/{patientId}/medications': {
      get: operation({ tag: 'Medications', summary: 'List medications', params: [pathParam('patientId'), ...queryParams] }),
      post: operation({
        tag: 'Medications',
        summary: 'Add a medication',
        params: [pathParam('patientId')],
        body: obj({ drugId: uuid, rawName: str, strength: str, doseForm: str, route: str, frequency: str, source: str }),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/medications/{medicationId}': {
      patch: operation({
        tag: 'Medications',
        summary: 'Update a medication',
        params: [pathParam('medicationId')],
        body: obj({ strength: str, doseForm: str, route: str, frequency: str, status: str, notes: str }),
      }),
    },
    '/medications/{medicationId}/stop': {
      post: operation({
        tag: 'Medications',
        summary: 'Stop a medication (status change, record retained)',
        params: [pathParam('medicationId')],
        body: obj({ notes: str }),
      }),
    },

    '/drugs': { get: operation({ tag: 'Drugs', summary: 'List drugs', params: queryParams }) },
    '/drugs/search': {
      get: operation({
        tag: 'Drugs',
        summary: 'Search drugs by generic, brand, alias, ingredient or identifier',
        params: [{ name: 'q', in: 'query', required: true, schema: str }, ...queryParams],
      }),
    },
    '/drugs/classes': { get: operation({ tag: 'Drugs', summary: 'List drug classes' }) },
    '/drugs/ingredients': { get: operation({ tag: 'Drugs', summary: 'List ingredients' }) },
    '/drugs/normalize': {
      post: operation({
        tag: 'Drugs',
        summary: 'Normalize free-text medication names into scored candidates',
        body: obj({ names: { type: 'array', items: str } }, ['names']),
      }),
    },
    '/drugs/{drugId}': { get: operation({ tag: 'Drugs', summary: 'Get a drug', params: [pathParam('drugId')] }) },
    '/drugs/{drugId}/interactions': {
      get: operation({ tag: 'Drugs', summary: 'List curated interactions for a drug', params: [pathParam('drugId')] }),
    },

    '/prescriptions': {
      post: {
        tags: ['Prescriptions'],
        summary: 'Upload a prescription image',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: obj({ patientId: uuid, notes: str, image: { type: 'string', format: 'binary' } }, [
                'patientId',
                'image',
              ]),
            },
          },
        },
        responses: { 201: ok('Created'), ...errors, 415: { $ref: '#/components/responses/Error' } },
      },
    },
    '/prescriptions/{prescriptionId}': {
      get: operation({ tag: 'Prescriptions', summary: 'Get a prescription', params: [pathParam('prescriptionId')] }),
    },
    '/prescriptions/{prescriptionId}/process': {
      post: operation({
        tag: 'Prescriptions',
        summary: 'Run OCR and normalization; extracted items stay unconfirmed',
        params: [pathParam('prescriptionId')],
      }),
    },
    '/prescriptions/{prescriptionId}/items': {
      get: operation({ tag: 'Prescriptions', summary: 'List extracted items', params: [pathParam('prescriptionId')] }),
    },
    '/prescriptions/{prescriptionId}/reconciliation/preview': {
      post: operation({
        tag: 'Prescriptions',
        summary: 'Reconcile confirmed prescription items against current medications',
        params: [pathParam('prescriptionId')],
      }),
    },
    '/prescriptions/items/{itemId}': {
      patch: operation({
        tag: 'Prescriptions',
        summary: 'Confirm or reject an extracted item',
        params: [pathParam('itemId')],
        body: obj({ drugId: uuid, status: str, strength: str, doseForm: str, route: str, frequency: str }, ['status']),
      }),
    },
    '/patients/{patientId}/reconciliation/preview': {
      post: operation({
        tag: 'Prescriptions',
        summary: 'Classify incoming medications without writing anything',
        params: [pathParam('patientId')],
        body: obj({ items: { type: 'array', items: { type: 'object' } } }, ['items']),
      }),
    },
    '/patients/{patientId}/reconciliation/apply': {
      post: operation({
        tag: 'Prescriptions',
        summary: 'Apply approved additions and status changes',
        params: [pathParam('patientId')],
        body: obj({
          additions: { type: 'array', items: { type: 'object' } },
          statusUpdates: { type: 'array', items: { type: 'object' } },
        }),
      }),
    },

    '/safety/check': {
      post: operation({
        tag: 'Safety',
        summary: 'Run the deterministic safety pipeline for a patient',
        body: obj({ patientId: uuid, force: bool }, ['patientId']),
        responses: { 200: ok('Existing identical check returned'), 201: ok('New check created'), ...errors },
      }),
    },
    '/safety/checks/{checkId}': {
      get: operation({ tag: 'Safety', summary: 'Get a safety check with findings', params: [pathParam('checkId')] }),
    },
    '/patients/{patientId}/safety-checks': {
      get: operation({ tag: 'Safety', summary: 'List safety checks for a patient', params: [pathParam('patientId'), ...queryParams] }),
    },
    '/safety/findings': {
      get: operation({
        tag: 'Safety',
        summary: 'List findings',
        params: [
          { name: 'patientId', in: 'query', schema: uuid },
          { name: 'severity', in: 'query', schema: str },
          { name: 'category', in: 'query', schema: str },
          { name: 'status', in: 'query', schema: str },
          ...queryParams,
        ],
      }),
    },
    '/safety/findings/{findingId}': {
      get: operation({ tag: 'Safety', summary: 'Get a finding', params: [pathParam('findingId')] }),
    },
    '/safety/findings/{findingId}/reviews': {
      get: operation({ tag: 'Reviews', summary: 'List clinician reviews', params: [pathParam('findingId')] }),
      post: operation({
        tag: 'Reviews',
        summary: 'Record a clinician decision (doctor or pharmacist only)',
        params: [pathParam('findingId')],
        body: obj({ decision: { type: 'string', enum: ['ACCEPTED', 'ACKNOWLEDGED', 'REQUIRES_INVESTIGATION'] }, clinicalNote: str }, ['decision']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },

    '/reports': {
      post: operation({
        tag: 'Reports',
        summary: 'Create a report snapshot from a safety check',
        body: obj({ safetyCheckId: uuid, status: str }, ['safetyCheckId']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/reports/{reportId}': { get: operation({ tag: 'Reports', summary: 'Get a report', params: [pathParam('reportId')] }) },
    '/reports/{reportId}/pdf': {
      get: {
        tags: ['Reports'],
        summary: 'Download the report as PDF',
        parameters: [pathParam('reportId')],
        responses: {
          200: { description: 'PDF', content: { 'application/pdf': { schema: { type: 'string', format: 'binary' } } } },
          ...errors,
        },
      },
    },
    '/patients/{patientId}/reports': {
      get: operation({ tag: 'Reports', summary: 'List reports for a patient', params: [pathParam('patientId'), ...queryParams] }),
    },

    '/notifications': { get: operation({ tag: 'Notifications', summary: 'List notifications', params: queryParams }) },
    '/notifications/read-all': { post: operation({ tag: 'Notifications', summary: 'Mark all as read' }) },
    '/notifications/{notificationId}/read': {
      post: operation({ tag: 'Notifications', summary: 'Mark one as read', params: [pathParam('notificationId')] }),
    },

    '/evidence/sources': { get: operation({ tag: 'Evidence', summary: 'List knowledge sources' }) },
    '/evidence/documents': { get: operation({ tag: 'Evidence', summary: 'List evidence documents', params: queryParams }) },
    '/evidence/documents/{documentId}': {
      get: operation({ tag: 'Evidence', summary: 'Get an evidence document', params: [pathParam('documentId')] }),
    },

    '/ai/explain': {
      post: operation({
        tag: 'AI',
        summary: 'Explain verified findings; refuses without verified evidence',
        body: obj({ question: str, findingId: uuid, safetyCheckId: uuid }, ['question']),
        responses: {
          200: ok('Grounded explanation'),
          422: { $ref: '#/components/responses/Error' },
          ...errors,
        },
      }),
    },

    '/admin/users': {
      get: operation({ tag: 'Admin', summary: 'List users', params: queryParams }),
      post: operation({
        tag: 'Admin',
        summary: 'Create a user with any role',
        body: obj({ name: str, email: str, password: str, role: str }, ['name', 'email', 'password', 'role']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/admin/users/{userId}': {
      patch: operation({ tag: 'Admin', summary: 'Update a user', params: [pathParam('userId')], body: obj({ name: str, role: str, status: str }) }),
    },
    '/admin/users/{userId}/suspend': {
      post: operation({ tag: 'Admin', summary: 'Suspend a user', params: [pathParam('userId')] }),
    },
    '/admin/drugs': {
      post: operation({
        tag: 'Admin',
        summary: 'Create a drug',
        body: obj({ genericName: str, brandName: str, drugClassId: uuid }, ['genericName']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/admin/drugs/{drugId}': {
      patch: operation({ tag: 'Admin', summary: 'Update a drug', params: [pathParam('drugId')], body: obj({ genericName: str, brandName: str }) }),
    },
    '/admin/drugs/{drugId}/deactivate': {
      post: operation({ tag: 'Admin', summary: 'Deactivate a drug', params: [pathParam('drugId')] }),
    },
    '/admin/drugs/{drugId}/aliases': {
      post: operation({
        tag: 'Admin',
        summary: 'Add a drug alias',
        params: [pathParam('drugId')],
        body: obj({ alias: str, type: str }, ['alias']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/admin/drugs/{drugId}/identifiers': {
      post: operation({
        tag: 'Admin',
        summary: 'Add a drug identifier',
        params: [pathParam('drugId')],
        body: obj({ type: str, value: str }, ['type', 'value']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/admin/rules/{kind}': {
      get: operation({
        tag: 'Admin',
        summary: 'List rules of a kind',
        params: [{ name: 'kind', in: 'path', required: true, schema: { type: 'string', enum: ['interaction', 'disease', 'allergy', 'duplication', 'factor'] } }, ...queryParams],
      }),
      post: operation({
        tag: 'Admin',
        summary: 'Create a curated rule',
        params: [{ name: 'kind', in: 'path', required: true, schema: str }],
        body: { type: 'object' },
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/admin/rules/{kind}/{ruleId}': {
      patch: operation({
        tag: 'Admin',
        summary: 'Create the next rule version (archives the current one)',
        params: [{ name: 'kind', in: 'path', required: true, schema: str }, pathParam('ruleId')],
        body: { type: 'object' },
      }),
    },
    '/admin/rules/{kind}/{ruleId}/deactivate': {
      post: operation({
        tag: 'Admin',
        summary: 'Deactivate a rule',
        params: [{ name: 'kind', in: 'path', required: true, schema: str }, pathParam('ruleId')],
      }),
    },
    '/admin/evidence/sources': {
      get: operation({ tag: 'Admin', summary: 'List knowledge sources' }),
      post: operation({
        tag: 'Admin',
        summary: 'Create a knowledge source',
        body: obj({ name: str, url: str, version: str }, ['name']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/admin/evidence/documents': {
      get: operation({ tag: 'Admin', summary: 'List evidence documents', params: queryParams }),
      post: operation({
        tag: 'Admin',
        summary: 'Create an evidence document',
        body: obj({ sourceId: uuid, title: str, content: str, reference: str }, ['sourceId', 'title', 'content']),
        responses: { 201: ok('Created'), ...errors },
      }),
    },
    '/admin/audit': { get: operation({ tag: 'Admin', summary: 'Query the audit log', params: queryParams }) },
    '/admin/analytics': {
      get: operation({
        tag: 'Admin',
        summary: 'Aggregate platform analytics',
        params: [{ name: 'days', in: 'query', schema: { type: 'integer' } }],
      }),
    },
  },
};

module.exports = openApiDocument;
