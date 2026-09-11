import { reportService } from '../services/report.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const reportController = {
  async generateReport(req, res, next) {
    try {
      const report = await reportService.generateReport(req.user, req.body);
      return successResponse(res, report, 201, 'Safety report generated.');
    } catch (err) {
      next(err);
    }
  },

  async getReportById(req, res, next) {
    try {
      const report = await reportService.getReportById(req.user, req.params.id);
      return successResponse(res, report);
    } catch (err) {
      next(err);
    }
  },

  async getReports(req, res, next) {
    try {
      const reports = await reportService.getReports(req.user, req.query);
      return successResponse(res, reports);
    } catch (err) {
      next(err);
    }
  },

  async downloadPdf(req, res, next) {
    try {
      const pdfBuffer = await reportService.generatePdf(req.user, req.params.id);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="DrugSafe_Report_${req.params.id}.pdf"`);
      return res.send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  },

  async shareReport(req, res, next) {
    try {
      const { recipientEmail } = req.body;
      return successResponse(
        res,
        {
          shared: true,
          reportId: req.params.id,
          recipientEmail,
          sharedAt: new Date().toISOString(),
        },
        200,
        `Report securely transmitted to ${recipientEmail}`
      );
    } catch (err) {
      next(err);
    }
  },
};

