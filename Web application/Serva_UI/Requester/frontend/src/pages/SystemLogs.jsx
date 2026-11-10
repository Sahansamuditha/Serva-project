import React, { useEffect, useState } from 'react';
import { 
  ScrollText, 
  Search, 
  ChevronDown, 
  Calendar, 
  Download, 
  AlertTriangle,
  Info,
  AlertCircle
} from 'lucide-react';
import SettingsNav from '../components/SettingsNav';
import { settingsApi } from '../services/api';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All Severities');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    settingsApi.getLogs({
      search: search || undefined,
      severity: severity !== 'All Severities' ? severity : undefined,
      date: date || undefined
    })
      .then((res) => setLogs(res.data.logs))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [severity, date]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Timestamp,Severity,User,Action"].concat(
          logs.map(l => `"${l.timestamp}","${l.severity}","${l.user}","${l.action}"`)
        ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ITUM_System_Logs_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const getSeverityBadge = (sev) => {
    const norm = (sev || '').toLowerCase();
    if (norm === 'info') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]">
          Info
        </span>
      );
    }
    if (norm === 'warning') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
          Warning
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#ffdad6] text-[#93000a] border border-[#ffb3b2]">
        Error
      </span>
    );
  };

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#241919]">System Logs</h1>
          <p className="text-sm text-[#574141] mt-0.5">
            Monitor system activities, errors, and administrative actions.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e2e8f0] text-[#241919] hover:bg-slate-50 text-xs font-semibold rounded-lg shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-[#7a1521]" />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Settings Menu */}
        <SettingsNav />

        {/* Right Content */}
        <div className="flex-1 space-y-4 w-full">
          {/* Filters Bar */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
            {/* Search */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-[#8a7170] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search logs by user, action or mo..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs input-focus"
              />
            </form>

            {/* Severity Filter */}
            <div className="relative">
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] rounded-lg pl-3 pr-8 py-1.5 text-xs font-semibold text-[#574141] cursor-pointer input-focus"
              >
                <option value="All Severities">All Severities</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Error">Error</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8a7170] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date filter */}
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-xs font-medium text-[#574141] input-focus cursor-pointer"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto min-h-[300px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] uppercase tracking-wider font-bold text-[#574141] border-b border-[#e2e8f0]">
                  <tr>
                    <th className="py-3 px-4">TIMESTAMP</th>
                    <th className="py-3 px-4">SEVERITY</th>
                    <th className="py-3 px-4">USER</th>
                    <th className="py-3 px-4">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-[#8a7170]">
                        No system logs found.
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-[#fff8f7] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[#574141] text-[11px] whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="py-3.5 px-4">
                          {getSeverityBadge(log.severity)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-[#241919]">
                          {log.user}
                        </td>
                        <td className="py-3.5 px-4 text-[#241919] font-medium leading-relaxed">
                          {log.action}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Copyright */}
          <p className="text-center text-[11px] text-[#8a7170] pt-6">
            © 2026 Institute of Technology, University of Moratuwa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
