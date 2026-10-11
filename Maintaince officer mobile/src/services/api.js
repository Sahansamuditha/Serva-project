import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  INITIAL_STATS,
  INITIAL_REQUESTS,
  INITIAL_JOBS,
  INITIAL_TEAMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_REPORTS_DATA,
  INITIAL_SETTINGS
} from './mockData';

// Configurable backend base URL (for connecting to local or production API)
// Android Emulator uses 10.0.2.2 to reach host machine, Web / iOS use localhost
const getDefaultApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

let API_BASE_URL = getDefaultApiUrl();

export function setApiBaseUrl(url) {
  API_BASE_URL = url;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

// Admin credentials for automatic authentication
const OFFICER_CREDENTIALS = {
  email: 'admin@itum.mrt.ac.lk',
  password: 'password123'
};

// Storage Keys
const KEYS = {
  TOKEN: 'serva_auth_token',
  USER: 'serva_auth_user',
  STATS: 'serva_stats',
  REQUESTS: 'serva_requests',
  JOBS: 'serva_jobs',
  TEAMS: 'serva_teams',
  NOTIFICATIONS: 'serva_notifications',
  REPORTS: 'serva_reports',
  SETTINGS: 'serva_settings',
  PROFILE: 'serva_user_profile'
};

// Helper: load from AsyncStorage with default fallback
async function getStorageData(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    await AsyncStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  } catch (err) {
    return fallback;
  }
}

// Helper: save to AsyncStorage
async function setStorageData(key, data) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error storing ${key}:`, err);
  }
}

// Auth Token Manager
export async function getAuthToken() {
  try {
    let token = await AsyncStorage.getItem(KEYS.TOKEN);
    let cachedUser = null;
    try {
      const uStr = await AsyncStorage.getItem(KEYS.USER);
      if (uStr) cachedUser = JSON.parse(uStr);
    } catch (e) {}

    // Check backend for current active officer
    let targetEmail = OFFICER_CREDENTIALS.email;
    try {
      const offRes = await fetch(`${API_BASE_URL}/auth/active-officer`);
      if (offRes.ok) {
        const offData = await offRes.json();
        if (offData?.officer?.email) {
          targetEmail = offData.officer.email;
        }
      }
    } catch (e) {}

    // If cached token already matches target officer, return it
    if (token && cachedUser?.email && cachedUser.email.toLowerCase() === targetEmail.toLowerCase()) {
      return token;
    }

    // Auto-login as current Maintenance Officer
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targetEmail, password: 'password123' })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.token) {
        await AsyncStorage.setItem(KEYS.TOKEN, data.token);
        if (data.user) {
          await AsyncStorage.setItem(KEYS.USER, JSON.stringify(data.user));
          await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify({
            id: data.user.id,
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            name: `${data.user.firstName || ''} ${data.user.lastName || ''}`.trim() || data.user.name,
            email: data.user.email,
            phone: data.user.phone || '+94 77 123 4567',
            department: data.user.department || 'Works & Maintenance Division',
            designation: data.user.designation || 'Maintenance Officer',
            avatar: data.user.avatar || ''
          }));
        }
        return data.token;
      }
    }
  } catch (err) {
    console.warn('API auto-login attempt failed:', err?.message);
  }
  return null;
}

// Authenticated fetch wrapper with token retry logic
async function authFetch(url, options = {}) {
  let token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  try {
    let res = await fetch(url, { ...options, headers });
    // If expired token (401), clear and retry once
    if (res.status === 401) {
      await AsyncStorage.removeItem(KEYS.TOKEN);
      token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        res = await fetch(url, { ...options, headers });
      }
    }
    return res;
  } catch (err) {
    throw err;
  }
}

// -------------------------------------------------------------
// DATA NORMALIZERS (Maps MySQL schema to Mobile Component expectations)
// -------------------------------------------------------------

function normalizeRequest(r) {
  if (!r) return null;
  const d = r.created_at ? new Date(r.created_at) : null;
  const submittedDate = d && !isNaN(d.getTime())
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' - ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '';

  const name = r.requester_name || r.requester?.name || '';
  const cleanName = name ? name.replace(/Dr\.|Prof\.|Mr\.|Mrs\.|Ms\./gi, '').trim() : '';
  const initials = cleanName
    ? cleanName.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : (name ? name.slice(0, 2).toUpperCase() : '');

  const baseOrigin = API_BASE_URL.replace(/\/api\/?$/, '');

  let evidence = [];
  try {
    const raw = typeof r.images === 'string' ? JSON.parse(r.images) : (r.images || r.evidence || []);
    evidence = Array.isArray(raw)
      ? raw.map((img, i) => {
          if (!img) return null;
          if (typeof img === 'object') {
            const rawUrl = img.url || img.uri || '';
            const fullUrl = rawUrl.startsWith('http') || rawUrl.startsWith('data:')
              ? rawUrl
              : `${baseOrigin}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`;
            return {
              id: img.id || `img-${i}`,
              label: img.label || img.name || `Evidence ${i + 1}`,
              type: img.type || 'image',
              uri: fullUrl,
              url: fullUrl
            };
          }
          const str = String(img);
          const fullUrl = str.startsWith('http') || str.startsWith('data:')
            ? str
            : `${baseOrigin}${str.startsWith('/') ? '' : '/'}${str}`;
          return {
            id: `img-${i}`,
            label: `Evidence ${i + 1}`,
            type: 'image',
            uri: fullUrl,
            url: fullUrl
          };
        }).filter(Boolean)
      : [];
  } catch (e) {
    evidence = [];
  }

  const history = Array.isArray(r.history) && r.history.length > 0 ? r.history : [
    ...(r.scheduled_date ? [{ title: `Scheduled for ${new Date(r.scheduled_date).toLocaleDateString()}`, time: 'Procurement Scheduled', note: 'Rescheduled by Maintenance Officer' }] : []),
    ...(r.status === 'In Progress' ? [{ title: `Assigned to ${r.assigned_team_name || 'Assigned Crew'}`, time: 'Underway', note: 'Technician dispatched for execution' }] : []),
    ...(r.status === 'Completed' ? [{ title: 'Task Completed', time: 'Completed', note: 'Maintenance job finalized and verified' }] : []),
    ...(r.status === 'Accepted' && r.updated_at ? [{ title: 'Request Accepted', time: new Date(r.updated_at).toLocaleString(), note: 'Accepted by Maintenance Officer.' }] : []),
    ...(submittedDate ? [
      { title: 'Request Submitted', time: submittedDate, note: name ? `Submitted by ${name} via Staff Portal.` : 'Submitted via Staff Portal.' }
    ] : [])
  ];

  return {
    ...r,
    id: r.id,
    title: r.title || '',
    category: r.category || '',
    priority: r.priority || '',
    status: r.status || 'Pending',
    location: r.location || '',
    description: r.description || '',
    submittedDate: r.submittedDate || submittedDate,
    requester: {
      name,
      department: r.requester_dept || r.requester?.department || '',
      phone: r.requester_phone || r.requester?.phone || '',
      email: r.requester_email || r.requester?.email || '',
      initials
    },
    assignedTo: r.assigned_team_name || r.assignedTo || '',
    evidence,
    images: evidence,
    history
  };
}

function normalizeJob(j) {
  if (!j) return null;
  const d = j.created_at ? new Date(j.created_at) : new Date();
  const reportedDate = !isNaN(d.getTime())
    ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Oct 7, 2026';

  const techName = j.lead_person ? j.lead_person.split(' - ')[0].trim() : (j.assignedPersonnel?.name || 'Sunil Shantha');
  const techRole = j.lead_person && j.lead_person.includes(' - ') ? j.lead_person.split(' - ')[1].trim() : (j.category ? `${j.category} Specialist` : 'Senior Technician');

  return {
    ...j,
    id: j.id,
    requestRef: j.request_id || j.requestRef || 'REQ-8291',
    title: j.title || 'Campus Maintenance Work Order',
    location: j.location || 'Campus Facility',
    category: j.category || 'General',
    priority: j.priority || 'Medium',
    status: j.status || 'In Progress',
    assignedTeam: j.team_name || j.assignedTeam || 'Works Response Team',
    reportedDate: j.reportedDate || reportedDate,
    targetDate: j.due_date ? new Date(j.due_date).toLocaleDateString() : (j.targetDate || 'Pending'),
    description: j.notes || j.description || 'Maintenance task assigned for technical execution.',
    progress: j.progress || 35,
    assignedPersonnel: {
      name: techName,
      role: techRole,
      phone: j.assignedPersonnel?.phone || '+94 77 123 4567',
      email: j.assignedPersonnel?.email || `${techName.toLowerCase().replace(/\s+/g, '.')}@itum.mrt.ac.lk`,
      rating: j.assignedPersonnel?.rating || 4.9
    },
    history: Array.isArray(j.history) && j.history.length > 0 ? j.history : [
      { title: `Assigned to ${techName}`, time: 'Commenced', completed: true },
      { title: j.status === 'Completed' ? 'Job Completed' : `Work In Progress (${j.progress || 35}%)`, time: j.status, completed: j.status === 'Completed' }
    ]
  };
}

function normalizeTeam(t) {
  if (!t) return null;
  return {
    ...t,
    id: String(t.id),
    name: t.name,
    specialization: t.specialization || t.category || 'General Maintenance',
    category: t.category || t.specialization || 'General',
    lead: t.lead || 'Supervisor',
    workload: t.workload || (t.activeJobs > 2 ? 'High' : 'Available'),
    membersCount: t.membersCount || t.members_count || (t.members?.length || 4),
    status: t.status || 'Active',
    totalJobs: t.totalJobs || 0,
    inProgress: t.inProgress || t.activeJobs || 0,
    scheduled: t.scheduled || 0,
    completed: t.completed || t.completedJobs || 0,
    avgTime: t.avgTime || '1.8 Days',
    efficiency: t.efficiency || 95,
    members: t.members || []
  };
}

function normalizeNotification(n) {
  if (!n) return null;
  let requestId = null;
  const match = (n.link || n.title || n.message || '').match(/REQ-\d+/i);
  if (match) requestId = match[0].toUpperCase();
  const d = n.created_at ? new Date(n.created_at) : new Date();
  const time = !isNaN(d.getTime())
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' })
    : 'Recently';

  return {
    ...n,
    id: String(n.id),
    title: n.title,
    message: n.message || n.description || '',
    description: n.message || n.description || '',
    type: n.type || 'info',
    read: Boolean(n.is_read || n.read),
    is_read: Boolean(n.is_read || n.read),
    requestId: requestId || n.requestId,
    time
  };
}

// -------------------------------------------------------------
// API FUNCTIONS (Connected to Central Backend with Storage Backup)
// -------------------------------------------------------------

// 1. STATS
export async function fetchStats() {
  try {
    const res = await authFetch(`${API_BASE_URL}/stats`);
    if (res.ok) {
      const data = await res.json();
      const s = data.data || data;
      const normalized = {
        totalRequests: s.totalRequests ?? s.requests ?? 5,
        pendingRequests: s.pendingRequests ?? s.pending ?? 1,
        scheduledRequests: s.scheduledRequests ?? s.scheduled ?? 1,
        inProgressRequests: s.inProgressRequests ?? s.inProgress ?? 2,
        completedRequests: s.completedRequests ?? s.completed ?? 1,
        rejectedRequests: s.rejectedRequests ?? s.rejected ?? 0,
        overdueRequests: s.overdueRequests ?? s.overdue ?? 0,
        requestsOverviewMonthly: s.requestsOverviewMonthly || INITIAL_STATS.requestsOverviewMonthly,
        statusDistribution: s.statusDistribution || {
          pending: s.pendingRequests ?? 1,
          scheduled: s.scheduledRequests ?? 1,
          inProgress: s.inProgressRequests ?? 2,
          completed: s.completedRequests ?? 1,
          rejected: s.rejectedRequests ?? 0
        },
        systemOverview: {
          totalUsers: s.totalUsers || 86,
          totalLabourers: s.totalLabourers || 24,
          totalLocations: s.totalLocations || 12,
          totalCategories: s.totalCategories || 8
        }
      };
      await setStorageData(KEYS.STATS, normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('API error in fetchStats, using cached data:', err?.message);
  }

  // Local fallback computed from stored requests
  const requests = await getStorageData(KEYS.REQUESTS, INITIAL_REQUESTS);
  if (requests && requests.length > 0) {
    const total = requests.length;
    const pending = requests.filter(r => (r.status || '').toLowerCase().includes('pending')).length;
    const scheduled = requests.filter(r => (r.status || '').toLowerCase().includes('schedul')).length;
    const inProgress = requests.filter(r => (r.status || '').toLowerCase().includes('progress')).length;
    const completed = requests.filter(r => (r.status || '').toLowerCase().includes('complet')).length;
    const rejected = requests.filter(r => (r.status || '').toLowerCase().includes('reject')).length;

    const computed = {
      ...INITIAL_STATS,
      totalRequests: total,
      pendingRequests: pending,
      scheduledRequests: scheduled,
      inProgressRequests: inProgress,
      completedRequests: completed,
      rejectedRequests: rejected
    };
    await setStorageData(KEYS.STATS, computed);
    return computed;
  }

  return await getStorageData(KEYS.STATS, INITIAL_STATS);
}

// 2. REQUESTS
export async function fetchRequests(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${API_BASE_URL}/requests?${query}`);
    if (res.ok) {
      const data = await res.json();
      const rawList = data.data || data.requests || [];
      const normalizedList = rawList.map(normalizeRequest);
      await setStorageData(KEYS.REQUESTS, normalizedList);
      return normalizedList;
    }
  } catch (err) {
    console.warn('API error in fetchRequests, using cached data:', err?.message);
  }

  let allRequests = await getStorageData(KEYS.REQUESTS, INITIAL_REQUESTS.map(normalizeRequest));
  let filtered = [...allRequests];
  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      r => (r.id && r.id.toLowerCase().includes(s)) ||
        (r.title && r.title.toLowerCase().includes(s)) ||
        (r.requester?.name && r.requester.name.toLowerCase().includes(s)) ||
        (r.location && r.location.toLowerCase().includes(s))
    );
  }
  if (params.status && params.status !== 'All') {
    filtered = filtered.filter(r => r.status && r.status.toLowerCase() === params.status.toLowerCase());
  }
  if (params.priority && params.priority !== 'All') {
    filtered = filtered.filter(r => r.priority && r.priority.toLowerCase() === params.priority.toLowerCase());
  }
  if (params.category && params.category !== 'All') {
    filtered = filtered.filter(r => r.category && r.category.toLowerCase() === params.category.toLowerCase());
  }
  if (params.unassignedOnly) {
    filtered = filtered.filter(r => {
      const st = (r.status || '').toLowerCase();
      return st !== 'in progress' && st !== 'completed';
    });
  }
  return filtered;
}

export async function fetchRequestById(id) {
  if (!id) return null;
  try {
    const res = await authFetch(`${API_BASE_URL}/requests/${id}`);
    if (res.ok) {
      const data = await res.json();
      const raw = data.data || data.request;
      if (raw) {
        const normalized = normalizeRequest(raw);
        return normalized;
      }
    }
  } catch (err) {
    console.warn(`API error in fetchRequestById(${id}), using cached:`, err?.message);
  }

  const requests = await getStorageData(KEYS.REQUESTS, []);
  return requests.find(r => String(r.id).toLowerCase() === String(id).toLowerCase()) || null;
}

export async function assignRequest(id, payload) {
  try {
    const apiPayload = {
      technician: payload.technician,
      completionDate: payload.completionDate || payload.scheduledDate,
      scheduledDate: payload.scheduledDate || payload.completionDate,
      instructions: payload.instructions || payload.notes,
      notes: payload.instructions || payload.notes,
      priority: payload.priority
    };

    const res = await authFetch(`${API_BASE_URL}/requests/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify(apiPayload)
    });

    if (res.ok) {
      const result = await res.json();
      // Refresh local requests cache
      await fetchRequests();
      await fetchJobs();
      return result;
    }
  } catch (err) {
    console.warn(`API error in assignRequest(${id}):`, err?.message);
  }

  // Update local storage backup
  const requests = await getStorageData(KEYS.REQUESTS, INITIAL_REQUESTS);
  const updatedRequests = requests.map(r => {
    if (r.id === id) {
      return {
        ...r,
        status: 'In Progress',
        assignedTo: payload.technician || 'Assigned',
        instructions: payload.instructions,
        completionDate: payload.completionDate
      };
    }
    return r;
  });
  await setStorageData(KEYS.REQUESTS, updatedRequests);
  return { success: true, message: 'Job assigned successfully' };
}

export async function rescheduleRequest(id, payload) {
  try {
    const apiPayload = {
      scheduledDate: payload.nextDate || payload.scheduledDate,
      nextDate: payload.nextDate || payload.scheduledDate,
      reason: payload.reason || 'Procurement delay',
      delayReason: payload.reason,
      billNumber: payload.billNumber,
      notes: payload.notes
    };

    const res = await authFetch(`${API_BASE_URL}/requests/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(apiPayload)
    });

    if (res.ok) {
      const result = await res.json();
      await fetchRequests();
      return result;
    }
  } catch (err) {
    console.warn(`API error in rescheduleRequest(${id}):`, err?.message);
  }

  const requests = await getStorageData(KEYS.REQUESTS, INITIAL_REQUESTS);
  const updatedRequests = requests.map(r => {
    if (r.id === id) {
      return {
        ...r,
        status: 'Scheduled',
        rescheduleReason: payload.reason,
        nextDate: payload.nextDate,
        billNumber: payload.billNumber,
        officerNote: payload.notes
      };
    }
    return r;
  });
  await setStorageData(KEYS.REQUESTS, updatedRequests);
  return { success: true, message: 'Request rescheduled successfully' };
}

export async function actionRequest(id, payload) {
  try {
    const res = await authFetch(`${API_BASE_URL}/requests/${id}/action`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const result = await res.json();
      await fetchRequests();
      return result;
    }
  } catch (err) {
    console.warn(`API error in actionRequest(${id}):`, err?.message);
  }

  const requests = await getStorageData(KEYS.REQUESTS, INITIAL_REQUESTS);
  let updatedRequests;
  if (payload.action === 'reject') {
    updatedRequests = requests.map(r => r.id === id ? { ...r, status: 'Rejected' } : r);
  } else {
    updatedRequests = requests.map(r => r.id === id ? { ...r, status: 'Accepted' } : r);
  }
  await setStorageData(KEYS.REQUESTS, updatedRequests);
  return { success: true, action: payload.action };
}

// 3. JOBS
export async function fetchJobs(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${API_BASE_URL}/jobs?${query}`);
    if (res.ok) {
      const data = await res.json();
      const rawJobs = data.data || data.jobs || [];
      const normalizedJobs = rawJobs.map(normalizeJob);
      await setStorageData(KEYS.JOBS, normalizedJobs);
      return normalizedJobs;
    }
  } catch (err) {
    console.warn('API error in fetchJobs, using cached data:', err?.message);
  }

  const allJobs = await getStorageData(KEYS.JOBS, INITIAL_JOBS.map(normalizeJob));
  let filtered = [...allJobs];
  if (params.search) {
    const s = params.search.toLowerCase();
    filtered = filtered.filter(
      j => (j.id && j.id.toLowerCase().includes(s)) ||
        (j.title && j.title.toLowerCase().includes(s)) ||
        (j.assignedTeam && j.assignedTeam.toLowerCase().includes(s)) ||
        (j.location && j.location.toLowerCase().includes(s))
    );
  }
  if (params.status && params.status !== 'All') {
    filtered = filtered.filter(j => j.status && j.status.toLowerCase() === params.status.toLowerCase());
  }
  if (params.priority && params.priority !== 'All') {
    filtered = filtered.filter(j => j.priority && j.priority.toLowerCase() === params.priority.toLowerCase());
  }
  if (params.category && params.category !== 'All') {
    filtered = filtered.filter(j => j.category && j.category.toLowerCase() === params.category.toLowerCase());
  }
  return filtered;
}

export async function fetchJobById(id) {
  try {
    const cleanId = (id || '').replace(/^#/, '');
    const res = await authFetch(`${API_BASE_URL}/jobs/${cleanId}`);
    if (res.ok) {
      const data = await res.json();
      const normalized = normalizeJob(data.data || data.job);
      return normalized;
    }
  } catch (err) {
    console.warn(`API error in fetchJobById(${id}), using cached:`, err?.message);
  }

  const jobs = await getStorageData(KEYS.JOBS, INITIAL_JOBS.map(normalizeJob));
  return jobs.find(j => j.id === id || j.id === `#${id}`) || jobs[0] || null;
}

export async function updateJob(id, payload) {
  try {
    const cleanId = (id || '').replace(/^#/, '');
    const res = await authFetch(`${API_BASE_URL}/jobs/${cleanId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const result = await res.json();
      await fetchJobs();
      return result;
    }
  } catch (err) {
    console.warn(`API error in updateJob(${id}):`, err?.message);
  }
  return { success: true };
}

// 4. TEAMS & LABOURERS
export async function fetchTeams() {
  try {
    const res = await authFetch(`${API_BASE_URL}/teams/analytics`);
    if (res.ok) {
      const data = await res.json();
      const raw = data.data || data.analytics || [];
      const normalized = raw.map(normalizeTeam);
      await setStorageData(KEYS.TEAMS, normalized);
      return normalized;
    }
    const plainRes = await authFetch(`${API_BASE_URL}/teams`);
    if (plainRes.ok) {
      const plainData = await plainRes.json();
      const normalized = (plainData.data || plainData.teams || []).map(normalizeTeam);
      await setStorageData(KEYS.TEAMS, normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('API error in fetchTeams, using cached data:', err?.message);
  }
  return await getStorageData(KEYS.TEAMS, INITIAL_TEAMS.map(normalizeTeam));
}

export async function createTeam(teamData) {
  try {
    const apiPayload = {
      name: teamData.name,
      lead: teamData.lead,
      category: teamData.specialization || teamData.category || 'General Maintenance',
      specialization: teamData.specialization || teamData.category,
      contact: teamData.contact || '+94 77 123 4567',
      members_count: teamData.members?.length || teamData.members_count || 4
    };

    const res = await authFetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      body: JSON.stringify(apiPayload)
    });

    if (res.ok) {
      const result = await res.json();
      await fetchTeams();
      return result;
    }
  } catch (err) {
    console.warn('API error in createTeam:', err?.message);
  }

  const teams = await getStorageData(KEYS.TEAMS, INITIAL_TEAMS);
  const newTeam = normalizeTeam({
    id: `team-${Date.now()}`,
    name: teamData.name,
    specialization: teamData.specialization || 'General Maintenance',
    lead: teamData.lead || 'Supervisor',
    membersCount: teamData.members?.length || 4,
    members: teamData.members || []
  });
  const updated = [newTeam, ...teams];
  await setStorageData(KEYS.TEAMS, updated);
  return { success: true, data: newTeam };
}

export async function fetchLabourers() {
  try {
    const res = await authFetch(`${API_BASE_URL}/labourers`);
    if (res.ok) {
      const data = await res.json();
      return data.data || data.labourers || [];
    }
  } catch (err) {
    console.warn('API error in fetchLabourers, using fallback:', err?.message);
  }
  return [];
}

// 5. REPORTS & ANALYTICS
export async function fetchReportsData() {
  try {
    const res = await authFetch(`${API_BASE_URL}/reports`);
    if (res.ok) {
      const data = await res.json();
      const payload = data.data || data;
      await setStorageData(KEYS.REPORTS, payload);
      return payload;
    }
  } catch (err) {
    console.warn('API error in fetchReportsData, using cached data:', err?.message);
  }
  return await getStorageData(KEYS.REPORTS, INITIAL_REPORTS_DATA);
}

export async function generateReport(params) {
  try {
    const res = await authFetch(`${API_BASE_URL}/reports/generate`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error in generateReport:', err?.message);
  }

  const reports = await getStorageData(KEYS.REPORTS, INITIAL_REPORTS_DATA);
  const newReport = {
    id: `REP-${params.year || '2026'}-${Date.now().toString().slice(-4)}`,
    name: `${params.month || 'Current'} ${params.reportType || 'Maintenance Report'}`,
    type: params.reportType || 'Monthly Report',
    period: `${params.month || 'August'} ${params.year || '2026'}`,
    generatedBy: 'Chaminda Bandara',
    generatedDate: new Date().toLocaleString(),
    status: 'Completed'
  };
  reports.recentReportsList = [newReport, ...(reports.recentReportsList || [])];
  await setStorageData(KEYS.REPORTS, reports);
  return { success: true, data: newReport };
}

export async function exportReport(params) {
  try {
    const res = await authFetch(`${API_BASE_URL}/reports/export`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error in exportReport:', err?.message);
  }
  return { success: true, message: `Report exported as ${params.format || 'PDF'}` };
}

// 6. NOTIFICATIONS
export async function fetchNotifications() {
  try {
    const res = await authFetch(`${API_BASE_URL}/notifications?role=maintenance_officer`);
    if (res.ok) {
      const data = await res.json();
      const raw = data.data || data.notifications || [];
      const normalized = raw.map(normalizeNotification);
      await setStorageData(KEYS.NOTIFICATIONS, normalized);
      return normalized;
    }
  } catch (err) {
    console.warn('API error in fetchNotifications, using cached data:', err?.message);
  }
  return await getStorageData(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS.map(normalizeNotification));
}

export async function updateNotification(id, payload) {
  try {
    if (payload.dismiss) {
      const res = await authFetch(`${API_BASE_URL}/notifications/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchNotifications();
        return await res.json();
      }
    } else {
      const res = await authFetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchNotifications();
        return await res.json();
      }
    }
  } catch (err) {
    console.warn(`API error in updateNotification(${id}):`, err?.message);
  }

  const notifs = await getStorageData(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  let updated;
  if (payload.dismiss) {
    updated = notifs.filter(n => n.id !== id);
  } else {
    updated = notifs.map(n => n.id === id ? { ...n, ...payload, read: true, is_read: true } : n);
  }
  await setStorageData(KEYS.NOTIFICATIONS, updated);
  return { success: true };
}

export async function markAllNotificationsRead() {
  try {
    const res = await authFetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'POST'
    });
    if (res.ok) {
      await fetchNotifications();
      return await res.json();
    }
  } catch (err) {
    console.warn('API error in markAllNotificationsRead:', err?.message);
  }

  const notifs = await getStorageData(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const updated = notifs.map(n => ({ ...n, read: true, is_read: true }));
  await setStorageData(KEYS.NOTIFICATIONS, updated);
  return { success: true };
}

// 7. SETTINGS & PROFILE
export async function fetchSettings() {
  try {
    const res = await authFetch(`${API_BASE_URL}/settings?role=maintenance_officer`);
    if (res.ok) {
      const data = await res.json();
      const profile = data.data || data.profile || {};

      // Also get notification preferences
      let notifSettings = null;
      try {
        const notifRes = await authFetch(`${API_BASE_URL}/settings/notifications`);
        if (notifRes.ok) {
          const nd = await notifRes.json();
          notifSettings = {
            inApp: Boolean(nd.data?.push_notifications ?? true),
            email: Boolean(nd.data?.email_alerts ?? true),
            desktopPush: Boolean(nd.data?.push_notifications ?? true),
            newMaintenanceRequests: true,
            statusUpdates: true,
            urgentAlerts: true,
            digestFrequency: nd.data?.weekly_digest ? 'Weekly Digest' : 'Real-time (No Digest)'
          };
        }
      } catch (e) { }

      // Also get active sessions
      let activeSessions = [];
      try {
        const sessRes = await authFetch(`${API_BASE_URL}/settings/sessions`);
        if (sessRes.ok) {
          const sd = await sessRes.json();
          activeSessions = sd.data || sd.sessions || [];
        }
      } catch (e) { }

      // Also get logs
      let auditLogs = [];
      try {
        const logRes = await authFetch(`${API_BASE_URL}/logs`);
        if (logRes.ok) {
          const ld = await logRes.json();
          auditLogs = (ld.data || []).map(l => ({
            id: String(l.id),
            time: l.created_at ? new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(l.created_at).toLocaleDateString() : 'Today',
            action: l.action || 'System Action',
            user: l.user_name || 'Maintenance Officer',
            ip: l.ip_address || '192.168.1.10',
            severity: l.action?.toLowerCase().includes('delete') || l.action?.toLowerCase().includes('reject') ? 'Warning' : 'Info'
          }));
        }
      } catch (e) { }

      const pFirstName = profile.firstName || profile.first_name || '';
      const pLastName = profile.lastName || profile.last_name || '';
      const pFullName = (pFirstName || pLastName) ? `${pFirstName} ${pLastName}`.trim() : (profile.name || 'Maintenance Officer');
      const pTitleName = pFullName.startsWith('Eng.') ? pFullName : `Eng. ${pFullName}`;

      const rawAvatar = profile.avatar || profile.avatarUrl || '';
      const sanitizedAvatar = (typeof rawAvatar === 'string' && (rawAvatar.startsWith('data:image/') || rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('blob:'))) ? rawAvatar : '';

      const consolidated = {
        profile: {
          id: profile.id,
          firstName: pFirstName,
          lastName: pLastName,
          name: profile.name || pTitleName,
          email: profile.email || 'officer@itum.mrt.ac.lk',
          phone: profile.phone || '+94 77 123 4567',
          department: profile.department || profile.division || 'Works & Maintenance Division',
          designation: profile.designation || 'Maintenance Officer',
          avatar: sanitizedAvatar,
          role: profile.role || 'Maintenance Officer'
        },
        notifications: notifSettings || INITIAL_SETTINGS.notifications,
        security: {
          activeSessions: activeSessions.length ? activeSessions : INITIAL_SETTINGS.security.activeSessions
        },
        logs: auditLogs.length ? auditLogs : INITIAL_SETTINGS.logs
      };

      await setStorageData(KEYS.SETTINGS, consolidated);
      await setStorageData(KEYS.PROFILE, consolidated.profile);
      return consolidated;
    }
  } catch (err) {
    console.warn('API error in fetchSettings, using cached data:', err?.message);
  }

  const cached = await getStorageData(KEYS.SETTINGS, {
    ...INITIAL_SETTINGS,
    profile: {
      firstName: '',
      lastName: '',
      name: 'Maintenance Officer',
      email: 'officer@itum.mrt.ac.lk',
      phone: '+94 77 123 4567',
      department: 'Works & Maintenance Division',
      designation: 'Maintenance Officer',
      avatar: ''
    }
  });

  if (cached?.profile) {
    const rawAv = cached.profile.avatar;
    const isValid = typeof rawAv === 'string' && (rawAv.startsWith('data:image/') || rawAv.startsWith('http://') || rawAv.startsWith('https://') || rawAv.startsWith('blob:'));
    if (!isValid) {
      cached.profile.avatar = '';
    }
  }

  return cached;
}

export async function updateProfile(profile) {
  const fName = profile.firstName?.trim() || '';
  const lName = profile.lastName?.trim() || '';
  const fullName = (fName || lName) ? `${fName} ${lName}`.trim() : (profile.name || 'Maintenance Officer');
  const titleName = fullName.startsWith('Eng.') ? fullName : `Eng. ${fullName}`;

  const rawAv = profile.avatar;
  const validAvatar = (typeof rawAv === 'string' && (rawAv.startsWith('data:') || rawAv.startsWith('http://') || rawAv.startsWith('https://') || rawAv.startsWith('blob:'))) ? rawAv : '';

  const normalizedProfile = {
    ...profile,
    firstName: fName || profile.firstName,
    lastName: lName || profile.lastName,
    name: titleName,
    avatar: validAvatar
  };

  // 1. Immediately persist to local AsyncStorage first so offline/cached state is never lost
  try {
    const settings = await getStorageData(KEYS.SETTINGS, INITIAL_SETTINGS);
    settings.profile = { ...settings.profile, ...normalizedProfile };
    await setStorageData(KEYS.SETTINGS, settings);
    await setStorageData(KEYS.PROFILE, normalizedProfile);
  } catch (storageErr) {
    console.warn('Error saving profile locally:', storageErr);
  }

  // 2. Try background API sync
  try {
    const res = await authFetch(`${API_BASE_URL}/settings/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...normalizedProfile,
        id: normalizedProfile.id,
        role: 'Maintenance Officer',
        email: normalizedProfile.email
      })
    });
    if (res.ok) {
      const data = await res.json();
      const updated = data.data || data.profile || data.user || normalizedProfile;
      const merged = { ...normalizedProfile, ...updated, name: titleName };
      await setStorageData(KEYS.PROFILE, merged);
      const settings = await getStorageData(KEYS.SETTINGS, INITIAL_SETTINGS);
      settings.profile = { ...settings.profile, ...merged };
      await setStorageData(KEYS.SETTINGS, settings);
      return { success: true, data: merged };
    }
  } catch (err) {
    console.warn('API error in updateProfile sync:', err?.message);
  }

  return { success: true, data: normalizedProfile };
}

export async function updateNotificationSettings(notificationPrefs) {
  try {
    const apiPayload = {
      emailAlerts: notificationPrefs.email ?? true,
      pushNotifications: notificationPrefs.inApp ?? notificationPrefs.desktopPush ?? true,
      weeklyDigest: notificationPrefs.digestFrequency?.includes('Weekly') ?? false
    };

    const res = await authFetch(`${API_BASE_URL}/settings/notifications`, {
      method: 'PUT',
      body: JSON.stringify(apiPayload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error in updateNotificationSettings:', err?.message);
  }

  const settings = await getStorageData(KEYS.SETTINGS, INITIAL_SETTINGS);
  settings.notifications = { ...settings.notifications, ...notificationPrefs };
  await setStorageData(KEYS.SETTINGS, settings);
  return { success: true, data: settings.notifications };
}

export async function revokeSession(sessionId) {
  try {
    const res = await authFetch(`${API_BASE_URL}/settings/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      const sessRes = await authFetch(`${API_BASE_URL}/settings/sessions`);
      if (sessRes.ok) {
        const sd = await sessRes.json();
        return { success: true, data: sd.data || sd.sessions || [] };
      }
    }
  } catch (err) {
    console.warn(`API error in revokeSession(${sessionId}):`, err?.message);
  }

  const settings = await getStorageData(KEYS.SETTINGS, INITIAL_SETTINGS);
  if (settings.security?.activeSessions) {
    settings.security.activeSessions = settings.security.activeSessions.filter(s => s.id !== sessionId);
    await setStorageData(KEYS.SETTINGS, settings);
  }
  return { success: true, data: settings.security?.activeSessions || [] };
}

export async function revokeOtherSessions() {
  try {
    const res = await authFetch(`${API_BASE_URL}/settings/sessions/revoke-others`, {
      method: 'POST'
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, data: data.data || data.sessions || [] };
    }
  } catch (err) {
    console.warn('API error in revokeOtherSessions:', err?.message);
  }

  const settings = await getStorageData(KEYS.SETTINGS, INITIAL_SETTINGS);
  if (settings.security?.activeSessions) {
    settings.security.activeSessions = settings.security.activeSessions.filter(s => s.current || s.is_current);
    await setStorageData(KEYS.SETTINGS, settings);
  }
  return { success: true, data: settings.security?.activeSessions || [] };
}

export async function fetchLogs(params = {}) {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await authFetch(`${API_BASE_URL}/logs?${query}`);
    if (res.ok) {
      const data = await res.json();
      const list = (data.data || []).map(l => ({
        id: String(l.id),
        time: l.created_at ? new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date(l.created_at).toLocaleDateString() : 'Today',
        action: l.action || 'System Action',
        user: l.user_name || 'Chaminda Bandara',
        ip: l.ip_address || '192.168.1.10',
        severity: l.action?.toLowerCase().includes('delete') || l.action?.toLowerCase().includes('reject') ? 'Warning' : 'Info'
      }));
      return list;
    }
  } catch (err) {
    console.warn('API error in fetchLogs, using cached data:', err?.message);
  }

  const settings = await getStorageData(KEYS.SETTINGS, INITIAL_SETTINGS);
  let logs = settings.logs || [];
  if (params.search) {
    const s = params.search.toLowerCase();
    logs = logs.filter(l => l.action.toLowerCase().includes(s) || l.user.toLowerCase().includes(s));
  }
  return logs;
}

export async function clearLogs() {
  try {
    const res = await authFetch(`${API_BASE_URL}/logs`, {
      method: 'DELETE'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('API error in clearLogs:', err?.message);
  }

  const settings = await getStorageData(KEYS.SETTINGS, INITIAL_SETTINGS);
  settings.logs = [];
  await setStorageData(KEYS.SETTINGS, settings);
  return { success: true };
}
