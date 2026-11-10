import { WorkHistoryLog, WorkSlip, JobDetailAudit } from '../types';

const DB_HISTORY_KEY = 'itum_serva_db_work_history_v2';
const DB_SLIPS_KEY = 'itum_serva_db_work_slips_v2';
const DB_AUDITS_KEY = 'itum_serva_db_job_audits_v2';

export const workSlipsDataset: Record<string, WorkSlip> = {};
export const jobAuditsDataset: Record<string, JobDetailAudit> = {};
export const historyLogsDataset: WorkHistoryLog[] = [];

class HistoryDatabaseService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    try {
      const hist = localStorage.getItem(DB_HISTORY_KEY);
      if (hist) {
        const parsed = JSON.parse(hist);
        // Clean out legacy dummy records if they exist
        if (Array.isArray(parsed) && parsed.some((p: any) => p.id?.startsWith('HIST-80') || p.reqCode?.includes('8285'))) {
          localStorage.removeItem(DB_HISTORY_KEY);
          localStorage.removeItem(DB_SLIPS_KEY);
          localStorage.removeItem(DB_AUDITS_KEY);
        }
      }
    } catch (e) {
      console.warn('LocalStorage init check error:', e);
    }
  }

  public getAllHistoryLogs(): WorkHistoryLog[] {
    try {
      const data = localStorage.getItem(DB_HISTORY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed.filter((p: any) => !p.id?.startsWith('HIST-80') && !p.reqCode?.includes('8285'));
        }
      }
    } catch (e) {
      console.warn('Failed to parse history logs from DB', e);
    }
    return [];
  }

  public getWorkSlip(reqCodeOrId: string): WorkSlip | null {
    try {
      const data = localStorage.getItem(DB_SLIPS_KEY);
      const slips: Record<string, WorkSlip> = data ? JSON.parse(data) : {};
      
      const cleanKey = reqCodeOrId.startsWith('#') ? reqCodeOrId : `#${reqCodeOrId}`;
      if (slips[cleanKey]) return slips[cleanKey];
      if (slips[reqCodeOrId]) return slips[reqCodeOrId];
      const found = Object.values(slips).find(
        (s) => s.id === reqCodeOrId || s.reqCode === reqCodeOrId || s.reqCode === cleanKey
      );
      if (found) return found;
    } catch (e) {
      console.warn('Failed to get work slip from DB', e);
    }
    return null;
  }

  public getJobDetailAudit(reqCodeOrId: string): JobDetailAudit | null {
    try {
      const data = localStorage.getItem(DB_AUDITS_KEY);
      const audits: Record<string, JobDetailAudit> = data ? JSON.parse(data) : {};
      
      const cleanKey = reqCodeOrId.startsWith('#') ? reqCodeOrId : `#${reqCodeOrId}`;
      if (audits[cleanKey]) return audits[cleanKey];
      if (audits[reqCodeOrId]) return audits[reqCodeOrId];
      const found = Object.values(audits).find(
        (a) => a.reqCode === reqCodeOrId || a.reqCode === cleanKey
      );
      if (found) return found;
    } catch (e) {
      console.warn('Failed to get job audit from DB', e);
    }
    return null;
  }

  public filterLogs(options: {
    trade?: string;
    period?: string;
    searchQuery?: string;
  }): WorkHistoryLog[] {
    const all = this.getAllHistoryLogs();
    const { trade = 'all', period = 'all', searchQuery = '' } = options;

    return all.filter((item) => {
      // 1. Trade filter
      if (trade && trade !== 'all') {
        const itemTrade = (item.tradeCategory || '').toLowerCase();
        const selectedTrade = trade.toLowerCase();
        if (!itemTrade.includes(selectedTrade) && !(item.division || '').toLowerCase().includes(selectedTrade)) {
          return false;
        }
      }

      // 2. Search query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchReq = (item.reqCode || '').toLowerCase().includes(q);
        const matchLoc = (item.location || '').toLowerCase().includes(q);
        const matchDiv = (item.division || '').toLowerCase().includes(q);
        const matchVerifier = (item.verifierName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchReq && !matchLoc && !matchDiv && !matchVerifier) {
          return false;
        }
      }

      return true;
    });
  }

  public saveHistoryLog(log: WorkHistoryLog): void {
    try {
      const existing = this.getAllHistoryLogs();
      const updated = [log, ...existing.filter((item) => item.reqCode !== log.reqCode)];
      localStorage.setItem(DB_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save history log:', e);
    }
  }

  public resetDatabase(): WorkHistoryLog[] {
    try {
      localStorage.removeItem(DB_HISTORY_KEY);
      localStorage.removeItem(DB_SLIPS_KEY);
      localStorage.removeItem(DB_AUDITS_KEY);
    } catch (e) {
      console.warn('Failed to reset DB', e);
    }
    return [];
  }

  public getDatabaseStats() {
    const all = this.getAllHistoryLogs();
    return {
      totalRecords: all.length,
      storageEngine: 'ITUM Central DB (Live Synchronized)',
      lastSynced: 'Just now (Live)',
      status: 'Active Online',
    };
  }
}

export const historyDatabase = new HistoryDatabaseService();
