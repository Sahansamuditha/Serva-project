export const INITIAL_STATS = {
  totalRequests: 0,
  pendingRequests: 0,
  scheduledRequests: 0,
  inProgressRequests: 0,
  completedRequests: 0,
  rejectedRequests: 0,
  overdueRequests: 0,
  requestsOverviewMonthly: [],
  statusDistribution: {
    pending: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0
  },
  systemOverview: {
    totalUsers: 1,
    totalLabourers: 0,
    totalLocations: 0,
    totalCategories: 0
  }
};

export const INITIAL_REQUESTS = [];

export const INITIAL_JOBS = [];

export const INITIAL_TEAMS = [];

export const INITIAL_NOTIFICATIONS = [];

export const INITIAL_REPORTS_DATA = {
  trendData: [],
  buildingBreakdown: [],
  categoryBreakdown: [],
  recentReportsList: []
};

export const INITIAL_SETTINGS = {
  profile: {
    firstName: 'Chathu',
    lastName: 'Thathsarani',
    name: 'Eng. Chathu Thathsarani',
    email: 'chathupamathathsarani51@gmail.com',
    phone: '+94 77 123 4567',
    department: 'Works & Maintenance Division',
    designation: 'Maintenance Officer',
    avatar: ''
  },
  notifications: {
    inApp: true,
    email: true,
    desktopPush: false,
    newMaintenanceRequests: true,
    statusUpdates: true,
    urgentAlerts: true,
    digestFrequency: 'Real-time (No Digest)'
  },
  security: {
    activeSessions: []
  },
  logs: []
};
