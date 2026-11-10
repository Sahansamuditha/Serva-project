import React from 'react';
import { X, Briefcase, Clock, Calendar, CheckCircle2, TrendingUp } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TeamPerformanceModal({ isOpen, onClose, team, teamName = 'Team A' }) {
  if (!isOpen) return null;

  const targetName = typeof team === 'string' ? team : (team?.name || teamName || 'Team A');

  // Fallback metrics by team if not provided directly on the team object
  const defaultMetrics = {
    'Team A': { totalJobs: 48, inProgress: 3, scheduled: 5, completed: 40 },
    'Team B': { totalJobs: 32, inProgress: 1, scheduled: 4, completed: 27 },
    'Team C': { totalJobs: 25, inProgress: 0, scheduled: 2, completed: 23 },
    'Team D': { totalJobs: 28, inProgress: 2, scheduled: 3, completed: 23 },
    'Team Alpha': { totalJobs: 56, inProgress: 4, scheduled: 6, completed: 46 },
    'Team Beta': { totalJobs: 38, inProgress: 2, scheduled: 3, completed: 33 }
  };

  const fallback = defaultMetrics[targetName] || {
    totalJobs: 30,
    inProgress: 2,
    scheduled: 3,
    completed: 25
  };

  const stats = {
    totalJobs: team?.totalJobs ?? fallback.totalJobs,
    inProgress: team?.inProgress ?? fallback.inProgress,
    scheduled: team?.scheduled ?? fallback.scheduled,
    completed: team?.completed ?? fallback.completed
  };

  const monthlyDatasetsByTeam = {
    'Team A': {
      totalJobs:  [32, 28, 35, 42, 38, 45, 48, 52, 46, 55, 58, 62],
      inProgress: [4,  3,  5,  4,  3,  5,  4,  5,  4,  6,  5,  4],
      scheduled:  [3,  4,  3,  5,  4,  4,  5,  4,  4,  5,  4,  5],
      completed:  [25, 21, 27, 33, 31, 36, 39, 43, 38, 44, 49, 53]
    },
    'Team B': {
      totalJobs:  [22, 19, 24, 28, 26, 31, 34, 33, 35, 38, 36, 40],
      inProgress: [2,  2,  2,  3,  2,  3,  3,  3,  3,  3,  3,  3],
      scheduled:  [2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2,  2],
      completed:  [18, 15, 20, 23, 22, 26, 29, 28, 30, 33, 31, 35]
    },
    'Team C': {
      totalJobs:  [18, 16, 20, 24, 22, 26, 28, 27, 29, 32, 30, 34],
      inProgress: [2,  2,  1,  2,  2,  2,  2,  2,  2,  2,  2,  2],
      scheduled:  [1,  1,  2,  1,  1,  1,  2,  2,  2,  2,  2,  2],
      completed:  [15, 13, 17, 21, 19, 23, 24, 23, 25, 28, 26, 30]
    },
    'Team D': {
      totalJobs:  [20, 18, 22, 26, 25, 29, 31, 30, 32, 35, 33, 37],
      inProgress: [2,  2,  2,  2,  2,  3,  2,  3,  2,  2,  2,  2],
      scheduled:  [2,  2,  2,  2,  2,  2,  3,  2,  3,  2,  3,  3],
      completed:  [16, 14, 18, 22, 21, 24, 26, 25, 27, 31, 28, 32]
    },
    'Team Alpha': {
      totalJobs:  [38, 34, 40, 48, 44, 52, 56, 58, 54, 62, 65, 70],
      inProgress: [4,  4,  4,  4,  4,  5,  5,  5,  5,  5,  5,  5],
      scheduled:  [3,  3,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4],
      completed:  [31, 27, 33, 41, 37, 44, 48, 50, 46, 53, 56, 61]
    },
    'Team Beta': {
      totalJobs:  [25, 24, 28, 34, 32, 38, 40, 42, 39, 45, 46, 50],
      inProgress: [3,  3,  3,  3,  3,  3,  3,  3,  3,  4,  4,  4],
      scheduled:  [2,  2,  2,  3,  2,  3,  3,  3,  3,  3,  3,  3],
      completed:  [20, 19, 23, 28, 27, 32, 34, 36, 33, 38, 39, 43]
    }
  };

  const teamMonthlyData = monthlyDatasetsByTeam[targetName] || monthlyDatasetsByTeam['Team A'];

  const chartData = {
    labels: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    datasets: [
      {
        label: 'Total Jobs',
        data: teamMonthlyData.totalJobs,
        borderColor: '#7a1521',
        backgroundColor: '#7a1521',
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#7a1521',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'In Progress',
        data: teamMonthlyData.inProgress,
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#2563eb',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Scheduled',
        data: teamMonthlyData.scheduled,
        borderColor: '#d97706',
        backgroundColor: '#d97706',
        tension: 0.35,
        borderWidth: 2,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#d97706',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Completed',
        data: teamMonthlyData.completed,
        borderColor: '#059669',
        backgroundColor: '#059669',
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#059669',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          boxHeight: 8,
          padding: 16,
          color: '#475569',
          font: { family: 'Inter', size: 12, weight: '500' }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { family: 'Inter', size: 12, weight: '600' },
        bodyFont: { family: 'Inter', size: 12 },
        cornerRadius: 8,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return ` ${context.dataset.label}: ${context.parsed.y} jobs`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          maxRotation: 45,
          minRotation: 0,
          autoSkip: false
        }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: {
          color: '#64748b',
          font: { family: 'Inter', size: 11 },
          stepSize: 10
        }
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '880px', width: '92%', padding: '30px 34px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
                {targetName} Performance
              </h2>
              {team?.specialization && (
                <span className="badge badge-tag" style={{ fontSize: '11.5px', padding: '3px 8px' }}>
                  {team.specialization}
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Lead: <strong style={{ color: '#1e293b' }}>{team?.lead || 'David Chen'}</strong> • Efficiency: <strong style={{ color: '#16a34a' }}>{team?.efficiency || 94}%</strong> • Status: <strong style={{ color: '#2563eb' }}>{team?.status || 'Active'}</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* 4 Team Job Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginTop: '20px',
          marginBottom: '24px'
        }}>
          {/* 1. All Jobs */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>
                All Jobs
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
                {stats.totalJobs}
              </div>
            </div>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              backgroundColor: '#eff6ff', color: '#2563eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Briefcase size={20} />
            </div>
          </div>

          {/* 2. In Progress */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>
                In Progress
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#2563eb', lineHeight: 1 }}>
                {stats.inProgress}
              </div>
            </div>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              backgroundColor: '#dbeafe', color: '#1d4ed8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={20} />
            </div>
          </div>

          {/* 3. Scheduled */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>
                Scheduled
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#d97706', lineHeight: 1 }}>
                {stats.scheduled}
              </div>
            </div>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              backgroundColor: '#fef3c7', color: '#b45309',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <Calendar size={20} />
            </div>
          </div>

          {/* 4. Completed */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div>
              <div style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>
                Completed
              </div>
              <div style={{ fontSize: '26px', fontWeight: 700, color: '#059669', lineHeight: 1 }}>
                {stats.completed}
              </div>
            </div>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              backgroundColor: '#d1fae5', color: '#047857',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0
            }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Performance Trends Chart */}
        <div className="card" style={{ padding: '22px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '15.5px', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} style={{ color: '#7a1521' }} />
              <span>Monthly Jobs & Performance Trends</span>
            </div>
            <span style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 500 }}>Jan - Dec 2026</span>
          </div>
          <div style={{ height: '290px', width: '100%' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '22px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '9px 24px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
