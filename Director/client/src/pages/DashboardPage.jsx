import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Users,
  UserCheck,
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
  const [yearFilter, setYearFilter] = useState('This Year');

  useEffect(() => {
    api.getDashboard().then((res) => {
      if (res && res.success) {
        setData(res);
      }
    }).catch(console.error);
  }, []);

  const stats = data?.stats || {
    requests: 128,
    pending: 14,
    inProgress: 32,
    overdue: 7,
    completed: 75
  };

  const overview = data?.systemOverview || {
    totalUsers: 86,
    totalLabourers: 24,
    totalLocations: 12,
    totalCategories: 8
  };

  const chartData = data?.requestsOverview || [
    { month: 'Jan', value: 20 },
    { month: 'Feb', value: 34 },
    { month: 'Mar', value: 28 },
    { month: 'Apr', value: 42 },
    { month: 'May', value: 38 },
    { month: 'Jun', value: 45 },
    { month: 'Jul', value: 50 },
    { month: 'Aug', value: 48 }
  ];

  const statusDonut = data?.requestsByStatus || [
    { name: 'Pending', count: 14, percentage: 11, color: '#f59e0b' },
    { name: 'In Progress', count: 32, percentage: 25, color: '#3b82f6' },
    { name: 'Completed', count: 75, percentage: 59, color: '#10b981' },
    { name: 'Overdue', count: 7, percentage: 5, color: '#ef4444' }
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

      {/* 5 Stat Cards Row */}
      <div className="stats-grid-5">
        <StatCard label="Requests" value={stats.requests} icon={FileText} color="blue" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Wrench} color="azure" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertCircle} color="red" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
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
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{
                fontSize: '12px',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 8px',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="This Year">This Year</option>
              <option value="Last Year">Last Year</option>
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
                    backgroundColor: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <UserCheck size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Labourers</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                {overview.totalLabourers}
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
