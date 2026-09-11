import { notificationRepository } from '../repositories/notification.repository.js';

export const notificationService = {
  async getAlerts(currentUser, params = {}) {
    return notificationRepository.findByUserId(currentUser.id, params);
  },

  async markAsRead(currentUser, id) {
    await notificationRepository.markAsRead(id, currentUser.id);
    return { success: true, id, status: 'READ' };
  },

  async markAllAsRead(currentUser) {
    await notificationRepository.markAllAsRead(currentUser.id);
    return { success: true, status: 'ALL_READ' };
  },

  async archiveAlert(currentUser, id) {
    await notificationRepository.updateStatus(id, currentUser.id, 'ARCHIVED');
    return { success: true, id, status: 'ARCHIVED' };
  },
};

