const API_BASE = '/api';

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
  getDashboard: async () => {
    const res = await authFetch(`${API_BASE}/dashboard`);
    return res.json();
  },

  // Jobs
  getJobs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${API_BASE}/jobs${query ? `?${query}` : ''}`);
    return res.json();
  },
  getJobById: async (id) => {
    const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`);
    return res.json();
  },
  updateJob: async (id, data) => {
    const res = await fetch(`${API_BASE}/jobs/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Teams
  getTeams: async () => {
    const res = await fetch(`${API_BASE}/teams`);
    return res.json();
  },
  createTeam: async (data) => {
    const res = await fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getTeamAnalytics: async () => {
    const res = await fetch(`${API_BASE}/teams/analytics`);
    return res.json();
  },

  // Users
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${API_BASE}/users${query ? `?${query}` : ''}`);
    return res.json();
  },
  createUser: async (data) => {
    const res = await authFetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateUser: async (id, data) => {
    const res = await authFetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  resendInvite: async (id) => {
    const res = await authFetch(`${API_BASE}/users/${encodeURIComponent(id)}/resend-invite`, {
      method: 'POST'
    });
    return res.json();
  },
  verifyInviteToken: async (token) => {
    const res = await fetch(`${API_BASE}/auth/verify-invite?token=${encodeURIComponent(token)}`);
    return res.json();
  },
  setupAccount: async (data) => {
    const res = await fetch(`${API_BASE}/auth/setup-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deactivateUser: async (id) => {
    const res = await authFetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Deactivate' })
    });
    return res.json();
  },
  deleteUser: async (id) => {
    const res = await authFetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // Reports
  getReports: async () => {
    const res = await authFetch(`${API_BASE}/reports`);
    return res.json();
  },
  generateReport: async (data) => {
    const res = await authFetch(`${API_BASE}/reports/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  exportReport: async (data) => {
    const res = await authFetch(`${API_BASE}/reports/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Notifications
  getNotifications: async () => {
    const res = await authFetch(`${API_BASE}/notifications`);
    return res.json();
  },
  markAllNotificationsRead: async () => {
    const res = await authFetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH'
    });
    return res.json();
  },
  markNotificationRead: async (id) => {
    const res = await authFetch(`${API_BASE}/notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH'
    });
    return res.json();
  },

  // Settings
  getProfileSettings: async () => {
    let query = '';
    try {
      const auth = JSON.parse(localStorage.getItem('serva_user') || 'null');
      if (auth?.id) query = `?id=${auth.id}`;
      else if (auth?.email) query = `?email=${encodeURIComponent(auth.email)}`;
    } catch (e) {}
    const res = await authFetch(`${API_BASE}/settings/profile${query}`);
    return res.json();
  },
  updateProfileSettings: async (data) => {
    const res = await authFetch(`${API_BASE}/settings/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getNotificationSettings: async () => {
    const res = await fetch(`${API_BASE}/settings/notifications`);
    return res.json();
  },
  updateNotificationSettings: async (data) => {
    const res = await fetch(`${API_BASE}/settings/notifications`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getSessions: async () => {
    const res = await fetch(`${API_BASE}/settings/sessions`);
    return res.json();
  },
  revokeOtherSessions: async () => {
    const res = await fetch(`${API_BASE}/settings/sessions/revoke-others`, {
      method: 'POST'
    });
    return res.json();
  },
  updatePassword: async (data) => {
    const res = await fetch(`${API_BASE}/settings/password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Logs
  getLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/logs${query ? `?${query}` : ''}`);
    return res.json();
  },
  clearLogs: async () => {
    const res = await fetch(`${API_BASE}/logs`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
