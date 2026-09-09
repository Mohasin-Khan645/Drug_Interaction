import { get, post } from './client';

export const authApi = {
  login: (credentials) => post('/auth/login', credentials),
  register: (payload) => post('/auth/register', payload),
  logout: () => post('/auth/logout'),
  refresh: () => post('/auth/refresh'),
  me: () => get('/auth/me'),
  verifyEmail: (token) => post('/auth/verify-email', { token }),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (payload) => post('/auth/reset-password', payload),
};
