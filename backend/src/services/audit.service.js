import { auditRepository } from '../repositories/audit.repository.js';

export const auditService = {
  async getLogs(params = {}) {
    return auditRepository.findAll(params);
  },

  async exportLogs(params = {}) {
    const { logs } = await auditRepository.findAll({ ...params, take: 1000 });
    return logs;
  },
};

