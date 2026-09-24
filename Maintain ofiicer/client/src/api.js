const API_BASE = '/api';

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`);
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
    const res = await fetch(`${API_BASE}/requests?${query}`);
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
    const res = await fetch(`${API_BASE}/requests/${id}`);
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
  const res = await fetch(`${API_BASE}/requests/${id}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function rescheduleRequest(id, payload) {
  const res = await fetch(`${API_BASE}/requests/${id}/reschedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function actionRequest(id, payload) {
  const res = await fetch(`${API_BASE}/requests/${id}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function fetchJobs() {
  try {
    const res = await fetch(`${API_BASE}/jobs`);
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
    const res = await fetch(`${API_BASE}/jobs/${id}`);
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
    const res = await fetch(`${API_BASE}/teams`);
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
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamData)
  });
  return res.json();
}

export async function fetchLabourers() {
  try {
    const res = await fetch(`${API_BASE}/labourers`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return [];
}

export async function fetchReportsData() {
  try {
    const res = await fetch(`${API_BASE}/reports`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return null;
}

export async function generateReport(params) {
  const res = await fetch(`${API_BASE}/reports/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function exportReport(params) {
  const res = await fetch(`${API_BASE}/reports/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return res.json();
}

export async function fetchNotifications() {
  try {
    const res = await fetch(`${API_BASE}/notifications`);
    if (res.ok) {
      const data = await res.json();
      return data.data;
    }
  } catch (err) {
    console.warn('API error', err);
  }
  return [];
}

export async function updateNotification(id, payload) {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE}/notifications/mark-all-read`, {
    method: 'POST'
  });
  return res.json();
}

export async function fetchSettings() {
  try {
    const res = await fetch(`${API_BASE}/settings`);
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
  const res = await fetch(`${API_BASE}/settings/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  return res.json();
}

export async function updateNotificationSettings(settings) {
  const res = await fetch(`${API_BASE}/settings/notifications`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return res.json();
}

export async function revokeSession(sessionId) {
  const res = await fetch(`${API_BASE}/settings/sessions/${sessionId}`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function revokeOtherSessions() {
  const res = await fetch(`${API_BASE}/settings/sessions-all-others`, {
    method: 'DELETE'
  });
  return res.json();
}

export async function fetchLogs(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/logs?${query}`);
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
  const res = await fetch(`${API_BASE}/logs/clear`, {
    method: 'POST'
  });
  return res.json();
}
