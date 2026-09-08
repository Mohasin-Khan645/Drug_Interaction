'use strict';

const reportService = require('../services/reportService');
const pdfService = require('../services/pdfService');
const auditService = require('../services/auditService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const { AUDIT_ACTIONS } = require('../constants');

const create = asyncHandler(async (req, res) =>
  sendSuccess(res, await reportService.createReport(req.user, req.body, req), 201)
);

const get = asyncHandler(async (req, res) =>
  sendSuccess(res, await reportService.getReport(req.user, req.params.reportId, req))
);

const listForPatient = asyncHandler(async (req, res) =>
  sendSuccess(
    res,
    await reportService.listReports(req.user, req.params.patientId, req.validatedQuery, req)
  )
);

const download = asyncHandler(async (req, res) => {
  const report = await reportService.getReport(req.user, req.params.reportId, req);
  const pdf = await pdfService.renderReport(report);

  await auditService.record({
    req,
    userId: req.user.id,
    action: AUDIT_ACTIONS.REPORT_DOWNLOADED,
    resourceType: 'SafetyReport',
    resourceId: report.id,
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${report.reportNumber}.pdf"`);
  return res.send(pdf);
});

module.exports = { create, get, listForPatient, download };
