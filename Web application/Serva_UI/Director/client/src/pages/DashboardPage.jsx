import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Wrench,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  MapPin,
  LayoutGrid
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import SplineAreaChart from '../components/charts/SplineAreaChart';
import DonutChart from '../components/charts/DonutChart';
import { api } from '../services/api';
import { useUser } from '../context/UserContext';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { userName } = useUser();
  const [data, setData] = useState(null);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    api.getDashboard().then((res) => {
      if (res && res.success) {
        setData(res);
      }
    }).catch(console.error);
  }, []);

  const allRequests = data?.allRequests || [];
  const getReqDate = (r) => {
    const val = r?.created_at || r?.submittedDate || r?.createdAt || r?.date;
    if (!val) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  let rangeStart = null;
  let rangeEnd = null;

  if (timeFilter === 'Today') {
    rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    rangeEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (timeFilter === 'This Week') {
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    rangeStart = new Date(now);
    rangeStart.setDate(now.getDate() - distanceToMonday);
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeStart.getDate() + 6);
    rangeEnd.setHours(23, 59, 59, 999);
  } else if (timeFilter === 'This Month') {
    rangeStart = new Date(currentYear, currentMonth, 1, 0, 0, 0, 0);
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    rangeEnd = new Date(currentYear, currentMonth, lastDay, 23, 59, 59, 999);
  } else if (timeFilter === 'This Year') {
    rangeStart = new Date(currentYear, 0, 1, 0, 0, 0, 0);
    rangeEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
  } else if (timeFilter === 'Custom Range') {
    if (customStartDate) rangeStart = new Date(customStartDate + 'T00:00:00');
    if (customEndDate) rangeEnd = new Date(customEndDate + 'T23:59:59');
  }

  const filteredRequests = allRequests.filter(r => {
    if (timeFilter === 'All Time' && !customStartDate && !customEndDate) return true;
    const d = getReqDate(r);
    if (!d) return false;
    if (rangeStart && d < rangeStart) return false;
    if (rangeEnd && d > rangeEnd) return false;
    return true;
  });

  const totalReqCount = filteredRequests.length;
  const pendingCount = filteredRequests.filter(r => {
    const st = (r.mapped_status || r.status || '').toLowerCase();
    return st === 'pending' || st === 'pending review' || st === 'accepted';
  }).length;
  const scheduledCount = filteredRequests.filter(r => {
    const st = (r.mapped_status || r.status || '').toLowerCase();
    return st === 'scheduled' || st === 'on hold' || st === 'hold';
  }).length;
  const inProgressCount = filteredRequests.filter(r => {
    const st = (r.mapped_status || r.status || '').toLowerCase();
    return st === 'in progress' || st === 'assigned' || st === 'pending start';
  }).length;
  const completedCount = filteredRequests.filter(r => {
    const st = (r.mapped_status || r.status || '').toLowerCase();
    return st === 'completed';
  }).length;
  const rejectedCount = filteredRequests.filter(r => {
    const st = (r.mapped_status || r.status || '').toLowerCase();
    return st === 'rejected' || st === 'cancelled';
  }).length;

  const stats = allRequests.length > 0 ? {
    requests: totalReqCount,
    pending: pendingCount,
    scheduled: scheduledCount,
    inProgress: inProgressCount,
    completed: completedCount,
    rejected: rejectedCount
  } : {
    requests: data?.stats?.requests ?? 31,
    pending: 0,
    scheduled: 11,
    inProgress: 8,
    completed: 2,
    rejected: 10
  };

  const overview = data?.systemOverview || {
    totalUsers: 86,
    totalLabourers: 24,
    totalLocations: 12,
    totalCategories: 8
  };

  let chartData = [];
  if (timeFilter === 'Day' || timeFilter === 'Today') {
    const slots = [
      { label: '12 AM', start: 0, end: 4 },
      { label: '4 AM', start: 4, end: 8 },
      { label: '8 AM', start: 8, end: 12 },
      { label: '12 PM', start: 12, end: 16 },
      { label: '4 PM', start: 16, end: 20 },
      { label: '8 PM', start: 20, end: 24 }
    ];
    chartData = slots.map(s => ({
      month: s.label,
      value: filteredRequests.filter(r => {
        const d = getReqDate(r);
        const h = d ? d.getHours() : -1;
        return h >= s.start && h < s.end;
      }).length
    }));
  } else if (timeFilter === 'This Week') {
    const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    chartData = weekDayNames.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      const dateStr = d.toDateString();
      return {
        month: `${dayName} (${mName} ${dayNum})`,
        value: filteredRequests.filter(r => {
          const rd = getReqDate(r);
          return rd && rd.toDateString() === dateStr;
        }).length
      };
    });
  } else if (timeFilter === 'This Month') {
    const monthName = now.toLocaleString('en-US', { month: 'short' });
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const weeks = [
      { label: `${monthName} 1 - 7`, start: 1, end: 7 },
      { label: `${monthName} 8 - 14`, start: 8, end: 14 },
      { label: `${monthName} 15 - 21`, start: 15, end: 21 },
      { label: `${monthName} 22 - ${lastDay}`, start: 22, end: lastDay }
    ];
    chartData = weeks.map(w => ({
      month: w.label,
      value: filteredRequests.filter(r => {
        const d = getReqDate(r);
        const day = d ? d.getDate() : -1;
        return day >= w.start && day <= w.end;
      }).length
    }));
  } else {
    // All Time or This Year
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (filteredRequests.length > 0) {
      chartData = months.map((m, idx) => ({
        month: m,
        value: filteredRequests.filter(r => {
          const d = getReqDate(r);
          return d && d.getFullYear() === currentYear && d.getMonth() === idx;
        }).length
      }));
    } else if (data?.requestsOverview && data.requestsOverview.length > 0) {
      chartData = data.requestsOverview.map(d => ({
        month: d.month,
        value: d.value !== undefined ? d.value : (d.requests || 0)
      }));
    } else {
      chartData = months.map(m => ({
        month: m,
        value: m === 'Oct' ? 14 : 0
      }));
    }
  }

  const statusDonut = stats.requests > 0
    ? [
      { name: 'Pending', count: stats.pending, percentage: Math.round((stats.pending / stats.requests) * 100), color: '#f59e0b' },
      { name: 'Scheduled', count: stats.scheduled, percentage: Math.round((stats.scheduled / stats.requests) * 100), color: '#8b5cf6' },
      { name: 'In Progress', count: stats.inProgress, percentage: Math.round((stats.inProgress / stats.requests) * 100), color: '#3b82f6' },
      { name: 'Completed', count: stats.completed, percentage: Math.round((stats.completed / stats.requests) * 100), color: '#10b981' },
      { name: 'Rejected', count: stats.rejected, percentage: Math.round((stats.rejected / stats.requests) * 100), color: '#ef4444' }
    ]
    : [
      { name: 'No Requests', count: 0, percentage: 0, color: '#e2e8f0' }
    ];

  const recentJobs = data?.recentJobs || [];

  return (
    <div className="page-container">
      {/* Top Banner Row */}
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">
            Good morning, {userName}! <span>👋</span>
          </h1>
          <p className="page-header-subtitle">
            Here's an overview of the maintenance operations.
          </p>
        </div>

        {/* Date / Time Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#ffffff',
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '12px',
            color: '#334155'
          }}
        >
          <Calendar size={15} color="#64748b" />
          <div>
            <div style={{ fontWeight: '600', color: '#0f172a' }}>22 August 2026</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>Friday, 10:30 AM</div>
          </div>
        </div>
      </div>

      {/* Date Filter Toolbar under Good Morning */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#fff1f2',
              color: '#7a1521',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            <Calendar size={16} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>Filter by Date Range:</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569'
                }}
              >
                {timeFilter}
              </span>
            </div>
          </div>
        </div>

        {/* Filter buttons & Custom Range */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#f8fafc',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          >
            {['All Time', 'Today', 'This Week', 'This Month', 'This Year', 'Custom Range'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTimeFilter(opt)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: timeFilter === opt ? '#7a1521' : 'transparent',
                  color: timeFilter === opt ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          {timeFilter === 'Custom Range' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>From</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: '#1e293b',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>To</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    fontSize: '12px',
                    color: '#1e293b',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>
              {(customStartDate || customEndDate) && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomStartDate('');
                    setCustomEndDate('');
                    setTimeFilter('All Time');
                  }}
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#dc2626',
                    backgroundColor: '#fef2f2',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6 Stat Cards Row */}
      <div className="stats-grid-6">
        <StatCard label="Requests" value={stats.requests} icon={FileText} color="blue" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
        <StatCard label="Scheduled" value={stats.scheduled} icon={Calendar} color="purple" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Wrench} color="azure" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
        <StatCard label="Rejected" value={stats.rejected || 0} icon={XCircle} color="red" />
      </div>

      {/* Middle Row: Overview Spline, Status Donut, System Overview */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Requests Overview Spline Chart */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">Requests Overview</h2>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              style={{
                fontSize: '12px',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 8px',
                outline: 'none',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>
          <SplineAreaChart
            data={chartData}
            dataKey="value"
            labelKey="month"
            height={200}
            maxY={80}
            yTicks={[0, 20, 40, 60, 80]}
          />
        </div>

        {/* Requests by Status Donut */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">Requests by Status</h2>
          </div>
          <DonutChart data={statusDonut} totalLabel="Total" size={135} thickness={16} />
        </div>

        {/* System Overview 4-Item List */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">System Overview</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#f3e8ff',
                    color: '#9333ea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Users size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Users</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {overview.totalUsers}
              </span>
            </div>


            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ccfbf1',
                    color: '#0d9488',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <MapPin size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Locations</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {overview.totalLocations}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: '#ffedd5',
                    color: '#ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LayoutGrid size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Categories</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {overview.totalCategories}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Jobs Table */}
      <div className="content-card">
        <div className="card-header-row">
          <h2 className="card-title">Recent Jobs</h2>
          <span className="card-action-link" onClick={() => navigate('/requests')}>
            View All
          </span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Title</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr
                  key={job.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate('/requests')}
                >
                  <td style={{ fontWeight: '500', color: '#334155' }}>{job.id}</td>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{job.title}</td>
                  <td style={{ color: '#475569' }}>{job.location}</td>
                  <td>
                    <StatusBadge status={job.priority} />
                  </td>
                  <td>
                    <StatusBadge status={job.status} />
                  </td>
                  <td style={{ color: '#475569' }}>{job.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
