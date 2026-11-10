import React, { useState } from 'react';
import { SystemLogItem } from '../types';

interface SystemLogsScreenProps {
  logs: SystemLogItem[];
  onBack: () => void;
}

export const SystemLogsScreen: React.FC<SystemLogsScreenProps> = ({
  logs,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'sessions' | 'security'>('logs');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (severityFilter !== 'ALL' && log.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.module.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#debfbf]/40 shadow-sm">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#574141] hover:bg-[#fff0ef] transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#7a1521] text-white flex items-center justify-center font-bold text-xs shrink-0">
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
        </div>
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a1521]">
            ITUM • SERVA
          </span>
          <h1 className="text-[17px] font-bold text-[#241919] truncate">
            System & Sync Logs
          </h1>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#debfbf]/40 shadow-sm">
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'logs'
              ? 'bg-[#7a1521] text-white shadow-xs'
              : 'text-[#574141] hover:bg-[#fff0ef]'
          }`}
        >
          System Logs
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'sessions'
              ? 'bg-[#7a1521] text-white shadow-xs'
              : 'text-[#574141] hover:bg-[#fff0ef]'
          }`}
        >
          Active Sessions
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-[#7a1521] text-white shadow-xs'
              : 'text-[#574141] hover:bg-[#fff0ef]'
          }`}
        >
          Security
        </button>
      </div>

      {/* TAB 1: SYSTEM LOGS */}
      {activeTab === 'logs' && (
        <div className="flex flex-col gap-3">
          {/* Search & Severity Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-[#debfbf]/40 shadow-sm space-y-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#8a7170] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by action, module, or details..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-[#debfbf] bg-[#fff8f7] focus:ring-1 focus:ring-[#7a1521] outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="text-xs font-semibold rounded-lg border border-[#debfbf] bg-[#fff8f7] px-2.5 py-1.5 focus:ring-1 focus:ring-[#7a1521]"
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">Info Only</option>
                <option value="WARNING">Warnings</option>
                <option value="ERROR">Errors</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSeverityFilter('ALL');
                }}
                className="text-xs font-bold text-[#7a1521] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Log Feed Items */}
          <div className="flex flex-col gap-2.5">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`p-3 rounded-xl border bg-white shadow-sm flex flex-col gap-1.5 ${
                  log.severity === 'ERROR'
                    ? 'border-red-300 bg-red-50/30'
                    : log.severity === 'WARNING'
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-[#debfbf]/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'ERROR'
                        ? 'bg-red-100 text-red-800'
                        : log.severity === 'WARNING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {log.severity}
                  </span>
                  <span className="text-[10px] font-mono text-[#8a7170]">{log.timestamp}</span>
                </div>

                <h4 className="text-xs font-bold text-[#241919]">{log.action}</h4>
                <p className="text-[11px] text-[#574141]">{log.details}</p>

                <div className="pt-1 border-t border-[#ffe9e8] flex items-center justify-between text-[10px] text-[#8a7170]">
                  <span>IP: {log.ipAddress}</span>
                  <span className="font-semibold text-[#7a1521] bg-[#fff0ef] px-1.5 py-0.5 rounded">
                    Module: {log.module}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Export Action */}
          <button
            onClick={() => alert('Exporting 1,240 log entries to CSV file...')}
            className="w-full py-3 rounded-xl bg-[#7a1521] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#58000f]"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Audit Logs (.CSV)</span>
          </button>
        </div>
      )}

      {/* TAB 2: ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#debfbf]/40 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#ffe9e8]">
            <h3 className="text-sm font-bold text-[#241919]">Logged Devices</h3>
            <span className="text-xs font-bold text-[#7a1521]">2 Devices</span>
          </div>

          {/* Current Device */}
          <div className="p-3 rounded-xl bg-[#fff0ef] border border-[#ffdad9] flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#7a1521] text-[22px] mt-0.5">
                smartphone
              </span>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#241919]">Samsung Galaxy S24 Ultra</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#7a1521] text-white">
                    THIS DEVICE
                  </span>
                </div>
                <p className="text-[11px] text-[#574141]">Serva Mobile App v2.4.1 • Colombo, LK</p>
                <p className="text-[10px] text-[#8a7170] mt-0.5">IP: 192.248.64.12 • Active Now</p>
              </div>
            </div>
          </div>

          {/* Secondary Device */}
          <div className="p-3 rounded-xl bg-white border border-[#debfbf] flex items-start justify-between">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#5c5f61] text-[22px] mt-0.5">
                laptop_mac
              </span>
              <div>
                <span className="text-xs font-bold text-[#241919]">MacBook Pro 16" (Workshop Bay 3)</span>
                <p className="text-[11px] text-[#574141]">Chrome 124 • Moratuwa Campus</p>
                <p className="text-[10px] text-[#8a7170] mt-0.5">Last active 2 hours ago</p>
              </div>
            </div>
            <button
              onClick={() => alert('Session revoked for MacBook Pro.')}
              className="px-2 py-1 rounded bg-[#ffdad6] text-[#ba1a1a] text-[11px] font-bold"
            >
              Revoke
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-[#debfbf]/40 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#ffe9e8]">
            <span className="material-symbols-outlined text-[#7a1521] text-[20px]">lock_reset</span>
            <h3 className="text-sm font-bold text-[#241919]">Update Credentials</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="font-bold text-[#574141] block mb-1">Current Password</label>
              <input
                type="password"
                defaultValue="••••••••••••"
                className="w-full px-3 py-2 rounded-lg border border-[#debfbf] bg-[#fff8f7]"
              />
            </div>
            <div>
              <label className="font-bold text-[#574141] block mb-1">New Password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                className="w-full px-3 py-2 rounded-lg border border-[#debfbf] bg-[#fff8f7]"
              />
            </div>
            <button
              onClick={() => alert('Password updated successfully!')}
              className="w-full py-2.5 bg-[#7a1521] text-white font-bold rounded-lg mt-2"
            >
              Save New Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
