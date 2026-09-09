import { get, post } from './client';

export const alertApi = {
  list: (params) => get('/notifications', params),
  markRead: (notificationId) => post(`/notifications/${notificationId}/read`),
  markAllRead: () => post('/notifications/read-all'),
};
