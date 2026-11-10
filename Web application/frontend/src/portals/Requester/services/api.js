import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('serva_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
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
  getAll: (params) => api.get('/notifications', { params: { role: 'requester', ...params } }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/mark-all-read', { role: 'requester' })
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
