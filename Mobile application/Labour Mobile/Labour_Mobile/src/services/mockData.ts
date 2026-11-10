import { WorkOrder, AlertNotice, WorkHistoryLog, CampusZone, SystemLogItem, LaborerProfile } from '../types';

export const initialLaborerProfile: LaborerProfile = {
  name: '',
  email: '',
  phone: '',
  employeeId: '',
  title: 'Supervisor',
  division: 'ITUM Central Administration',
  institution: 'Institute of Technology, University of Moratuwa',
  isOnDuty: true,
  shift: 'Shift 1 (08:00 AM – 05:00 PM)',
  workshopBase: 'Central Maintenance Division',
  totalJobs: 0,
  satisfactionRating: 5.0,
  attendanceRate: '100%',
  avatarUrl: '',
  pushNotificationsEnabled: true,
  emergencyRingtoneOverride: true,
  language: 'en',
  assignedZones: ['zone-1', 'zone-2', 'zone-3'],
};

export const initialWorkOrders: WorkOrder[] = [];

export const initialAlertNotices: AlertNotice[] = [
  {
    id: '77',
    title: 'Job #JOB-1660 Placed On Hold',
    description: 'Work order #JOB-1660 (AC Unit Leaking Water in Computer Lab 3) has been placed on hold.',
    category: 'hazard',
    severity: 'HIGH',
    timestamp: 'Just now',
    reqNumber: '#JOB-1660',
    isRead: false,
    actionType: 'open_ticket',
  },
  {
    id: '78',
    title: 'Job #JOB-1041 Completed',
    description: 'Work order #JOB-1041 (ex 1) marked as completed and evidence submitted.',
    category: 'system',
    severity: 'INFO',
    timestamp: 'Just now',
    reqNumber: '#JOB-1041',
    isRead: false,
    actionType: 'open_ticket',
  },
  {
    id: '80',
    title: 'Job #JOB-6521 In Progress',
    description: 'Work order #JOB-6521 (ex 2) accepted and in progress.',
    category: 'dispatch',
    severity: 'INFO',
    timestamp: 'Just now',
    reqNumber: '#JOB-6521',
    isRead: false,
    actionType: 'open_ticket',
  },
  {
    id: '89',
    title: 'New Task Assigned: #REQ-9194',
    description: 'You have been assigned request #REQ-9194 (ex 4). Please review and accept.',
    category: 'dispatch',
    severity: 'INFO',
    timestamp: 'Just now',
    reqNumber: '#REQ-9194',
    isRead: false,
    actionType: 'open_ticket',
  },
  {
    id: '44',
    title: 'New Task Assigned: #REQ-7029',
    description: 'You have been assigned request #REQ-7029 (AC Unit Leaking Water in Computer Lab 3). Please review and accept.',
    category: 'dispatch',
    severity: 'INFO',
    timestamp: '2h ago',
    reqNumber: '#REQ-7029',
    isRead: true,
    actionType: 'open_ticket',
  }
];

export const initialWorkHistory: WorkHistoryLog[] = [];

export const initialCampusZones: CampusZone[] = [
  {
    id: 'zone-1',
    name: 'Sector 1 - Engineering & Admin Complex',
    buildingsCount: 6,
    assignedLaborers: 0,
    activeTickets: 0,
    isCachedOffline: true,
    status: 'Active Assignment',
  },
  {
    id: 'zone-2',
    name: 'Sector 2 - Central Library & Auditorium',
    buildingsCount: 4,
    assignedLaborers: 0,
    activeTickets: 0,
    isCachedOffline: true,
    status: 'Active Assignment',
  },
  {
    id: 'zone-3',
    name: 'Sector 3 - Science & Chemistry Labs',
    buildingsCount: 5,
    assignedLaborers: 0,
    activeTickets: 0,
    isCachedOffline: true,
    status: 'Active Assignment',
  },
  {
    id: 'zone-4',
    name: 'Sector 4 - Substation & Workshops',
    buildingsCount: 3,
    assignedLaborers: 0,
    activeTickets: 0,
    isCachedOffline: false,
    status: 'Secondary Zone',
  }
];

export const initialSystemLogs: SystemLogItem[] = [];
