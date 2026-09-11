import { auditService } from '../services/audit.service.js';
import { successResponse } from '../utils/apiResponse.js';

export const auditController = {
  async getAuditLogs(req, res, next) {
    try {
      const logs = await auditService.getLogs(req.query);
      return successResponse(res, logs.logs || logs);
    } catch (err) {
      next(err);
    }
  },

  async exportAuditLogs(req, res, next) {
    try {
      const logs = await auditService.exportLogs(req.query);
      return successResponse(res, logs);
    } catch (err) {
      next(err);
    }
  },
};

