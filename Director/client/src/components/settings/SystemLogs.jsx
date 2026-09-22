import React, { useEffect, useState } from 'react';
import { Search, Download, RotateCcw } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { api } from '../../services/api';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('All Severities');
  const [total, setTotal] = useState(1240);

  useEffect(() => {
    fetchLogs();
  }, [search, severity]);

  const fetchLogs = () => {
    const params = {};
    if (search) params.search = search;
    if (severity !== 'All Severities') params.severity = severity;

    api.getLogs(params)
      .then((res) => {
        if (res && res.success) {
          setLogs(res.logs);
          if (res.total) setTotal(res.total);
        }
      })
      .catch(console.error);
  };

  const handleResetFilters = () => {
    setSearch('');
    setSeverity('All Severities');
  };

  const handleExportLogs = () => {
    window.open('/api/logs/export', '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div>
          <h1 className="page-header-title" style={{ fontSize: '22px' }}>System Logs</h1>
          <p className="page-header-subtitle">
            Monitor system activities, errors, and administrative actions.
          </p>
        </div>

        <button className="btn-outline" onClick={handleExportLogs}>
          <Download size={15} />
          <span>Export Logs</span>
        </button>
      </div>

      {/* Main Logs Card */}
      <div className="content-card" style={{ marginBottom: 0 }}>
        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8'
              }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', height: '36px' }}
              placeholder="Search logs by user, action or module..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '150px', height: '36px' }}
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="All Severities">All Severities</option>
            <option value="Info">Info</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <button
            className="btn-outline"
            style={{ fontSize: '12px', padding: '5px 12px', height: '30px' }}
            onClick={handleResetFilters}
          >
            <RotateCcw size={13} />
            <span>Reset Filters</span>
          </button>
        </div>

        {/* Logs Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>SEVERITY</th>
                <th>USER</th>
                <th>ACTION</th>
                <th>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#475569' }}>
                    {log.timestamp}
                  </td>
                  <td>
                    <StatusBadge status={log.severity} />
                  </td>
                  <td style={{ fontWeight: '500', color: '#1e293b' }}>
                    {log.user}
                  </td>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>
                    {log.action}
                  </td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Counter */}
        <div
          style={{
            paddingTop: '16px',
            marginTop: '8px',
            borderTop: '1px solid #f1f5f9',
            fontSize: '12px',
            color: '#94a3b8'
          }}
        >
          Showing 1 to {logs.length} of {total.toLocaleString()} entries
        </div>
      </div>
    </div>
  );
}
