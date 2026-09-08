'use strict';

const { z, uuid, idParam, pagination } = require('./common');

const aiExplain = {
  body: z
    .object({
      question: z.string().min(5).max(1000),
      findingId: uuid.optional(),
      safetyCheckId: uuid.optional(),
    })
    .refine(
      (data) => data.findingId || data.safetyCheckId,
      'Either findingId or safetyCheckId is required'
    ),
};

const createReport = {
  body: z.object({
    safetyCheckId: uuid,
    status: z.enum(['DRAFT', 'FINAL']).default('DRAFT'),
  }),
};

const reportParam = { params: idParam('reportId') };

const listReports = { params: idParam('patientId'), query: pagination };

const listNotifications = {
  query: pagination.extend({ unreadOnly: z.coerce.boolean().optional() }),
};

const notificationParam = { params: idParam('notificationId') };

module.exports = {
  aiExplain,
  createReport,
  reportParam,
  listReports,
  listNotifications,
  notificationParam,
};
