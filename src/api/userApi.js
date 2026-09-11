import apiClient from './client';

export const userApi = {
  getUsers: async (params = {}) => {
    return apiClient.get('/admin/users', { params });
  },

  getUserById: async (id) => {
    return apiClient.get(`/admin/users/${id}`);
  },

  createUser: async (data) => {
    return apiClient.post('/admin/users', data);
  },

  resetUserPassword: async (id) => {
    return apiClient.post(`/admin/users/${id}/reset-password`);
  },

  updateUser: async (id, data) => {
    return apiClient.put(`/admin/users/${id}`, data);
  },

  deactivateUser: async (id) => {
    return apiClient.put(`/admin/users/${id}`, { status: 'DEACTIVATED' });
  },

  reactivateUser: async (id) => {
    return apiClient.put(`/admin/users/${id}`, { status: 'ACTIVE' });
  },
};
