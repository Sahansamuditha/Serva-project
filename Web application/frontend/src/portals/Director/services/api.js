const BASE_URL = '/api';

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('serva_token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
};

export const api = {
  // Dashboard
  async getDashboard() {
    const res = await authFetch(`${BASE_URL}/dashboard`);
    return res.json();
  },

  // Requests
  async getRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${BASE_URL}/requests${query ? `?${query}` : ''}`);
    return res.json();
  },

  async getRequestById(id) {
    const res = await authFetch(`${BASE_URL}/requests/${encodeURIComponent(id)}`);
    return res.json();
  },

  async updateRequestStatus(id, action, status) {
    const res = await authFetch(`${BASE_URL}/requests/${encodeURIComponent(id)}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, status })
    });
    return res.json();
  },

  // Reports
  async getReports() {
    const res = await authFetch(`${BASE_URL}/reports`);
    return res.json();
  },

  async generateReport(payload) {
    const res = await authFetch(`${BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async exportReport(payload) {
    const res = await authFetch(`${BASE_URL}/reports/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Notifications
  async getNotifications(unreadOnly = false) {
    const res = await authFetch(`${BASE_URL}/notifications?unreadOnly=${unreadOnly}`);
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await authFetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await authFetch(`${BASE_URL}/notifications/mark-all-read`, {
      method: 'POST'
    });
    return res.json();
  },

  async dismissNotification(id) {
    const res = await authFetch(`${BASE_URL}/notifications/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Settings & Profile
  async getProfile() {
    let query = '';
    try {
      const auth = JSON.parse(localStorage.getItem('serva_user') || 'null');
      if (auth?.id) query = `?id=${auth.id}`;
      else if (auth?.email) query = `?email=${encodeURIComponent(auth.email)}`;
    } catch (e) {}
    const res = await authFetch(`${BASE_URL}/settings/profile${query}`);
    return res.json();
  },

  async updateProfile(profileData) {
    const auth = JSON.parse(localStorage.getItem('serva_user') || 'null');
    const res = await authFetch(`${BASE_URL}/settings/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...profileData, id: auth?.id || profileData.id })
    });
    return res.json();
  },

  async getNotificationSettings() {
    const res = await authFetch(`${BASE_URL}/settings/notifications`);
    return res.json();
  },

  async updateNotificationSettings(settings) {
    const res = await authFetch(`${BASE_URL}/settings/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async getSessions() {
    const res = await authFetch(`${BASE_URL}/settings/sessions`);
    return res.json();
  },

  async logoutOtherSessions() {
    const res = await authFetch(`${BASE_URL}/settings/logout-sessions`, {
      method: 'POST'
    });
    return res.json();
  },

  async changePassword(currentPassword, newPassword) {
    const res = await authFetch(`${BASE_URL}/settings/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return res.json();
  },

  // Logs
  async getLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${BASE_URL}/logs${query ? `?${query}` : ''}`);
    return res.json();
  }
};
