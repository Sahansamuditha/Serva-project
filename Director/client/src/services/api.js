const BASE_URL = '/api';

export const api = {
  // Dashboard
  async getDashboard() {
    const res = await fetch(`${BASE_URL}/dashboard`);
    return res.json();
  },

  // Reports
  async getReports() {
    const res = await fetch(`${BASE_URL}/reports`);
    return res.json();
  },

  async generateReport(payload) {
    const res = await fetch(`${BASE_URL}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async exportReport(payload) {
    const res = await fetch(`${BASE_URL}/reports/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Notifications
  async getNotifications(unreadOnly = false) {
    const res = await fetch(`${BASE_URL}/notifications?unreadOnly=${unreadOnly}`);
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH'
    });
    return res.json();
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${BASE_URL}/notifications/mark-all-read`, {
      method: 'POST'
    });
    return res.json();
  },

  async dismissNotification(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Settings & Profile
  async getProfile() {
    const res = await fetch(`${BASE_URL}/settings/profile`);
    return res.json();
  },

  async updateProfile(profileData) {
    const res = await fetch(`${BASE_URL}/settings/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
    return res.json();
  },

  async getNotificationSettings() {
    const res = await fetch(`${BASE_URL}/settings/notifications`);
    return res.json();
  },

  async updateNotificationSettings(settings) {
    const res = await fetch(`${BASE_URL}/settings/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    return res.json();
  },

  async getSessions() {
    const res = await fetch(`${BASE_URL}/settings/sessions`);
    return res.json();
  },

  async logoutOtherSessions() {
    const res = await fetch(`${BASE_URL}/settings/logout-sessions`, {
      method: 'POST'
    });
    return res.json();
  },

  async changePassword(currentPassword, newPassword) {
    const res = await fetch(`${BASE_URL}/settings/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return res.json();
  },

  // Logs
  async getLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/logs${query ? `?${query}` : ''}`);
    return res.json();
  }
};
