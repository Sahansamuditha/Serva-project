const API_BASE = '/api';

const authFetch = (url, options = {}) => {
  const token = localStorage.getItem('serva_token');
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  return fetch(url, { ...options, headers });
};

export async function fetchStats() {
  try {
    const res = await authFetch(`${API_BASE}/stats`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error, falling back', err);
  }
  return null;
}

export async function fetchRequests(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${API_BASE}/requests?${query}`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return [];
}

export async function fetchRequestById(id) {
  try {
    const res = await authFetch(`${API_BASE}/requests/${id}`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return null;
}

export async function assignRequest(id, payload) {
  const res = await authFetch(`${API_BASE}/requests/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function rescheduleRequest(id, payload) {
  const res = await authFetch(`${API_BASE}/requests/${id}/reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function actionRequest(id, payload) {
  const res = await authFetch(`${API_BASE}/requests/${id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchJobs() {
  try {
    const res = await authFetch(`${API_BASE}/jobs`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return [];
}

export async function fetchJobById(id) {
  try {
    const res = await authFetch(`${API_BASE}/jobs/${id}`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return null;
}

export async function fetchTeams() {
  try {
    const res = await authFetch(`${API_BASE}/teams`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return [];
}

export async function createTeam(teamData) {
  const res = await authFetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamData)
  });
  return res.json();
}

export async function fetchLabourers() {
  try {
    const res = await authFetch(`${API_BASE}/labourers`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return [];
}

export async function fetchSupervisors() {
  try {
    const res = await authFetch(`${API_BASE}/supervisors`);
    if (res.ok) {
      const data = await res.json();
      return data.data || [];
    }
  } catch (err) {
    console.warn('API error fetching supervisors', err);
  }
  return [];
}

export async function fetchReportsData() {
  try {
    const res = await authFetch(`${API_BASE}/reports`);
    if (res.ok) {
      const data = await res.json();
      return data.data || data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return null;
}

export async function generateReport(params) {
  const res = await authFetch(`${API_BASE}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function exportReport(params) {
  const res = await authFetch(`${API_BASE}/reports/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function fetchNotifications() {
  try {
    let query = '?role=maintenance_officer';
    try {
      const auth = JSON.parse(localStorage.getItem('serva_user') || 'null');
      if (auth?.role) query = `?role=${encodeURIComponent(auth.role)}`;
    } catch (e) { }
    const res = await authFetch(`${API_BASE}/notifications${query}`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return { notifications: [], unreadCount: 0 };
}

export async function updateNotification(id, payload) {
  const res = await authFetch(`${API_BASE}/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function markAllNotificationsRead() {
  let query = '?role=maintenance_officer';
  try {
    const auth = JSON.parse(localStorage.getItem('serva_user') || 'null');
    if (auth?.role) query = `?role=${encodeURIComponent(auth.role)}`;
  } catch (e) { }
  const res = await authFetch(`${API_BASE}/notifications/mark-all-read${query}`, {
    method: 'POST'
  });
  return res.json();
}

export async function fetchSettings() {
  try {
    let query = '?role=maintenance_officer';
    try {
      const auth = JSON.parse(localStorage.getItem('serva_user') || 'null');
      if (auth?.id) query = `?id=${auth.id}&role=maintenance_officer`;
      else if (auth?.email) query = `?email=${encodeURIComponent(auth.email)}&role=maintenance_officer`;
    } catch (e) { }
    const res = await authFetch(`${API_BASE}/settings${query}`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return null;
}

export async function updateProfile(profile) {
  const auth = JSON.parse(localStorage.getItem('serva_user') || 'null');
  const res = await authFetch(`${API_BASE}/settings/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...profile,
      id: auth?.id || profile.id,
      email: profile.email || auth?.email,
      role: 'Maintenance Officer'
    })
  });
  return res.json();
}

export async function updateNotificationSettings(settings) {
  const res = await authFetch(`${API_BASE}/settings/notifications`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return res.json();
}

export async function revokeSession(sessionId) {
  const res = await authFetch(`${API_BASE}/settings/sessions/${sessionId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function revokeOtherSessions() {
  const res = await authFetch(`${API_BASE}/settings/sessions-all-others`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchLogs(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${API_BASE}/logs?${query}`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return [];
}

export async function clearLogs() {
  const res = await authFetch(`${API_BASE}/logs/clear`, {
    method: 'POST'
  });
  return res.json();
}
