export type WorkOrderStatus = 'Pending Start' | 'In Progress' | 'On Hold' | 'Completed' | 'Signed Off' | 'Assigned' | 'Pending' | 'Rejected' | 'Cancelled';
export type PriorityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface WorkOrder {
  id: string; // e.g. "REQ-8291"
  jobCode: string; // e.g. "JOB-1024"
  title: string;
  category: 'AC REPAIR' | 'ELECTRICAL' | 'PLUMBING' | 'HVAC' | 'GENERAL';
  description: string;
  department: string;
  location: string;
  subLocation?: string;
  priority: PriorityLevel;
  status: WorkOrderStatus;
  assignedTime: string;
  dueTime: string;
  requesterName: string;
  requesterDept: string;
  requesterExt: string;
  reportedPhotoUrl?: string;
  reportedPhotoTimestamp?: string;
  reportedPhotos?: Array<{ url: string; name?: string; size?: string }>;
  proofPhotoUrl?: string;
  proofPhotoTimestamp?: string;
  technicianRemarks?: string;
  partsUsed?: string[];
  verifierName?: string;
  verifierRole?: string;
  signatureTimestamp?: string;
}

export type AlertCategory = 'hazard' | 'dispatch' | 'system';

export interface AlertNotice {
  id: string;
  title: string;
  description: string;
  category: AlertCategory;
  severity: 'CRITICAL' | 'HIGH' | 'INFO';
  timestamp: string;
  location?: string;
  reqNumber?: string;
  isRead: boolean;
  actionType?: 'navigate' | 'view_advisory' | 'open_ticket' | 'pickup_token';
  pickupToken?: string;
}

export interface WorkSlipPart {
  partNumber: string;
  name: string;
  quantity: number;
  costLkr: number;
}

export interface WorkSlip {
  id: string;
  reqCode: string;
  dbRecordId: string;
  timestamp: string;
  dateLabel: string;
  periodCategory: 'yesterday' | 'this_month' | 'earlier';
  jobTitle: string;
  division: string;
  location: string;
  subLocation?: string;
  technicianName: string;
  technicianEmpId: string;
  requesterName: string;
  requesterDept: string;
  requesterContact: string;
  priority: PriorityLevel;
  status: 'Completed' | 'Signed Off';
  timeStarted: string;
  timeFinished: string;
  durationSpent: string;
  summaryOfWork: string;
  partsUsed: WorkSlipPart[];
  verifierName: string;
  verifierRole: string;
  digitalSignatureHash: string;
  isoComplianceCert: string;
  photoThumbnails?: string[];
  dbSyncStatus: 'synced' | 'local_cached';
}

export interface TechnicalTimelineStep {
  step: string;
  time: string;
  note: string;
  done: boolean;
}

export interface TechnicalMeasurement {
  parameter: string;
  reading: string;
  nominalRange: string;
  status: 'OPTIMAL' | 'PASS' | 'WARNING';
}

export interface JobDetailAudit {
  reqCode: string;
  title: string;
  division: string;
  tradeCategory: 'Electrical' | 'Plumbing' | 'HVAC' | 'General';
  severity: PriorityLevel;
  location: string;
  reportedIssue: string;
  rootCauseAnalysis: string;
  assignedTechnician: string;
  technicianRole: string;
  timeSpent: string;
  slaTargetHours: string;
  measurements: TechnicalMeasurement[];
  timeline: TechnicalTimelineStep[];
  safetyChecklist: Array<{ check: string; passed: boolean }>;
  requesterFeedback: {
    rating: number;
    comment: string;
    submittedBy: string;
  };
  photoUrls?: string[];
  dbAuditHash: string;
}

export interface WorkHistoryLog {
  id: string;
  reqCode: string;
  reqId?: string;
  title: string;
  division: string;
  tradeCategory?: 'Electrical' | 'Plumbing' | 'HVAC' | 'General' | string;
  issueType?: string;
  requesterName?: string;
  requesterDept?: string;
  priority?: string;
  dateStr?: string;
  dateLabel?: string;
  periodCategory?: 'yesterday' | 'this_month' | 'earlier' | string;
  resolvedAt: string;
  durationSpent: string;
  location: string;
  status: WorkOrderStatus | 'Completed' | 'Signed Off' | 'Rejected' | 'In Progress' | 'Pending' | string;
  verifierName?: string;
  verifierTitle?: string;
  photosCount?: number;
  photoThumbnails?: string[];
  remarksSnippet?: string;
  workSlip?: WorkSlip;
  detailAudit?: JobDetailAudit;
}

export interface CampusZone {
  id: string;
  name: string;
  buildingsCount: number;
  assignedLaborers: number;
  activeTickets: number;
  isCachedOffline: boolean;
  status: 'Active Assignment' | 'Secondary Zone' | 'Standby';
}

export interface SystemLogItem {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  action: string;
  userRole: string;
  module: string;
  ipAddress: string;
  details: string;
}

export interface LaborerProfile {
  name: string;
  email?: string;
  phone?: string;
  employeeId: string;
  title: string;
  division: string;
  institution: string;
  isOnDuty: boolean;
  shift: string;
  workshopBase: string;
  totalJobs: number;
  satisfactionRating: number;
  attendanceRate: string;
  avatarUrl: string;
  pushNotificationsEnabled: boolean;
  emergencyRingtoneOverride: boolean;
  language: 'en' | 'si' | 'ta';
  assignedZones: string[];
}
