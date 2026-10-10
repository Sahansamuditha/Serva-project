import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats')
};

export const requestsApi = {
  getAll: (params) => api.get('/requests', { params }),
  getById: (id) => api.get(`/requests/${id}`),
  create: (data) => api.post('/requests', data),
  rate: (id, data) => api.post(`/requests/${id}/rate`, data),
  delete: (id) => api.delete(`/requests/${id}`)
};

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read')
};

export const settingsApi = {
  getProfile: () => api.get('/settings/profile'),
  updateProfile: (data) => api.put('/settings/profile', data),
  getNotifications: () => api.get('/settings/notifications'),
  updateNotifications: (data) => api.put('/settings/notifications', data),
  getSecurity: () => api.get('/settings/security'),
  changePassword: (data) => api.post('/settings/security/change-password', data),
  logoutOthers: () => api.post('/settings/security/logout-others'),
  getLogs: (params) => api.get('/settings/logs', { params })
};

export const uploadApi = {
  uploadFiles: (formData) => api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;
