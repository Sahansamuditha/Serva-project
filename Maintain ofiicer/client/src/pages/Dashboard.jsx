import React, { useState, useEffect } from 'react';
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
  LayoutGrid,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import StatCard from '../components/StatCard';
import { fetchStats, fetchRequests } from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard({ setCurrentPage, setSelectedRequestId, userProfile }) {
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [timeRange, setTimeRange] = useState('This Year');

  useEffect(() => {
    async function loadData() {
      const statsData = await fetchStats();
      if (statsData) setStats(statsData);

      const reqData = await fetchRequests();
      if (reqData) setRecentJobs(reqData.slice(0, 5));
    }
    loadData();
  }, []);

  // Line Chart Data (Spline area with deep maroon line & soft gradient fill matching Image 3.png)
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        data: stats?.requestsOverviewMonthly?.map(m => m.count) || [20, 34, 28, 42, 38, 47, 52, 49],
        borderColor: '#7a1521',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 200);
          gradient.addColorStop(0, 'rgba(122, 21, 33, 0.18)');
          gradient.addColorStop(1, 'rgba(122, 21, 33, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.45,
        pointBackgroundColor: '#7a1521',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 6
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      y: {
        min: 0,
        max: 80,
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, stepSize: 20 },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  // Doughnut Chart Data (Requests by status matching Image 3.png)
  const doughnutData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    datasets: [
      {
        data: [14, 32, 75, 7],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
        borderWidth: 0,
        hoverOffset: 4,
        cutout: '76%'
      }
    ]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleFont: { family: 'Inter', size: 12 },
        bodyFont: { family: 'Inter', size: 12 },
        padding: 10,
        cornerRadius: 6
      }
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-overdue';
      case 'medium': return 'badge-pending';
      case 'low': return 'badge-completed';
      default: return 'badge-tag';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress': return 'badge-in-progress';
      case 'completed': return 'badge-completed';
      case 'pending review':
      case 'pending': return 'badge-pending';
      case 'scheduled': return 'badge-scheduled';
      default: return 'badge-tag';
    }
  };

  return (
    <div>
      {/* Welcome Banner & Date */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            Good morning, {userProfile?.firstName || 'Maintenance Officer'}! <span role="img" aria-label="wave">👋</span>
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Here's an overview of the maintenance operations.
          </p>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: '#64748b',
          fontSize: '13px',
          backgroundColor: '#ffffff',
          padding: '8px 14px',
          borderRadius: '8px',
          border: '1px solid var(--color-border)'
        }}>
          <Calendar size={16} style={{ color: '#7a1521' }} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600, color: '#1e293b' }}>22 August 2026</div>
            <div style={{ fontSize: '11.5px' }}>Friday, 10:30 AM</div>
          </div>
        </div>
      </div>

      {/* Top 5 Stat Cards */}
      <div className="stat-cards-5-grid">
        <StatCard 
          title="Requests" 
          value={stats?.totalRequests || 128} 
          icon={FileText} 
          color="blue"
          onClick={() => setCurrentPage('requests')}
        />
        <StatCard 
          title="Pending" 
          value={stats?.pendingRequests || 14} 
          icon={Clock} 
          color="amber"
          onClick={() => setCurrentPage('requests')}
        />
        <StatCard 
          title="In Progress" 
          value={stats?.inProgressRequests || 32} 
          icon={Wrench} 
          color="blue"
          onClick={() => setCurrentPage('jobs')}
        />
        <StatCard 
          title="Overdue" 
          value={stats?.overdueRequests || 7} 
          icon={AlertCircle} 
          color="red"
          onClick={() => setCurrentPage('requests')}
        />
        <StatCard 
          title="Completed" 
          value={stats?.completedRequests || 75} 
          icon={CheckCircle2} 
          color="green"
          onClick={() => setCurrentPage('jobs')}
        />
      </div>

      {/* Middle Row: 3 Visual Analysis Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 0.9fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Requests Overview Line Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">Requests Overview</span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              color: '#475569',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              padding: '4px 10px',
              cursor: 'pointer'
            }}>
              <span>{timeRange}</span>
              <ChevronDown size={14} />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: '200px', width: '100%', position: 'relative' }}>
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Card 2: Requests by Status Donut Chart */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">Requests by Status</span>
          </div>
          <div style={{ position: 'relative', height: '140px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>128</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Total</div>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px 12px',
            marginTop: '16px',
            fontSize: '12px',
            color: '#475569'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></span>
              <span>Pending <b>14 (11%)</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
              <span>In Progress <b>32 (25%)</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>Completed <b>75 (59%)</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              <span>Overdue <b>7 (5%)</b></span>
            </div>
          </div>
        </div>

        {/* Card 3: System Overview */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <span className="card-title">System Overview</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Users</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>86</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Labourers</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>24</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Locations</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>12</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutGrid size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Categories</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>8</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Jobs */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)' }}>
          <span className="card-title">Recent Jobs</span>
          <button 
            onClick={() => setCurrentPage('jobs')}
            className="btn btn-secondary btn-sm"
            style={{ color: '#2563eb', borderColor: '#dbeafe', backgroundColor: '#eff6ff', fontWeight: 600 }}
          >
            View All
          </button>
        </div>

        <div className="table-container" style={{ overflowX: 'auto', scrollbarWidth: 'none' }}>
          <table className="data-table" style={{ width: '100%', tableLayout: 'auto' }}>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Title</th>
                <th>Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th style={{ textAlign: 'right', paddingRight: '20px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentJobs.map((job) => (
                <tr 
                  key={job.id} 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedRequestId(job.id);
                    setCurrentPage('request-review');
                  }}
                >
                  <td style={{ fontWeight: 600, color: '#7a1521', whiteSpace: 'nowrap' }}>{job.id}</td>
                  <td style={{ fontWeight: 500 }}>{job.title}</td>
                  <td style={{ color: '#64748b' }}>{job.location}</td>
                  <td>
                    <span className={`badge ${getPriorityBadgeClass(job.priority)}`}>
                      {job.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ color: job.assignedTo === 'Unassigned' ? '#94a3b8' : '#334155' }}>
                    {job.assignedTo}
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '16px' }} onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => {
                        setSelectedRequestId(job.id);
                        setCurrentPage('request-review');
                      }}
                      className="btn btn-primary btn-sm"
                      style={{ 
                        backgroundColor: '#7a1521', 
                        color: '#ffffff',
                        fontSize: '12px', 
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer copyright */}
      <div className="page-footer">
        © 2026 Institute of Technology, University of Moratuwa. All rights reserved.
      </div>
    </div>
  );
}
