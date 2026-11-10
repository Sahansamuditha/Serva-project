import React, { useState, useEffect } from 'react';
import { getAuthUser } from '../../../utils/auth';
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
import { fetchStats, fetchRequests, fetchJobs } from '../api';

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
  const [allRequests, setAllRequests] = useState([]);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    async function loadData() {
      const [statsData, reqData, jobData] = await Promise.all([
        fetchStats(),
        fetchRequests(),
        fetchJobs()
      ]);

      if (statsData) {
        setStats(statsData);
        if (statsData.allRequests && Array.isArray(statsData.allRequests) && statsData.allRequests.length > 0) {
          setAllRequests(statsData.allRequests);
          setRecentJobs(statsData.allRequests.slice(0, 5));
          return;
        }
      }

      // Unified items combining 14 requests (Screenshot 1) + 20 jobs (Screenshot 2) = 34
      if (reqData && Array.isArray(reqData)) {
        const validReqs = reqData.filter(req => {
          const st = (req.status || '').toLowerCase();
          const isJobManaged = Boolean(
            (req.linked_job_id && (
              req.linked_job_status === 'Rejected' || 
              req.linked_job_notes?.includes('[REJECTED]') ||
              Number(req.linked_job_labourers || 0) > 0
            )) ||
            req.notes?.includes('[REJECTED]') ||
            st === 'assigned' ||
            st === 'in progress' ||
            st === 'completed'
          );
          return !isJobManaged;
        }).map(r => ({
          ...r,
          mapped_status: ['pending', 'pending review', 'accepted'].includes((r.status || '').toLowerCase())
            ? 'Pending'
            : (['scheduled', 'on hold', 'hold'].includes((r.status || '').toLowerCase()) ? 'Scheduled' : 'Rejected')
        }));

        const validJobs = (jobData || []).filter(j => {
          const s = (j.status || '').toLowerCase();
          const hasLabourers = Number(j.labourers_assigned || 0) > 0;
          if (s === 'rejected' || (j.notes || '').includes('[REJECTED]')) return true;
          return !(['scheduled', 'on hold', 'hold'].includes(s) && !hasLabourers);
        });

        const compJobs = validJobs.filter(j => (j.status || '').toLowerCase() === 'completed').map(j => ({
          ...j,
          mapped_status: 'Completed'
        }));
        const inProgJobs = validJobs.filter(j => ['in progress', 'pending start', 'assigned', 'pending'].includes((j.status || '').toLowerCase())).map(j => ({
          ...j,
          mapped_status: 'In Progress'
        }));
        const schedJobs = validJobs.filter(j => {
          const s = (j.status || '').toLowerCase();
          const hasLabourers = Number(j.labourers_assigned || 0) > 0;
          return s === 'rejected' || (j.notes || '').includes('[REJECTED]') || (['scheduled', 'on hold', 'hold'].includes(s) && hasLabourers);
        }).map(j => ({
          ...j,
          id: j.id.startsWith('JOB-') ? `${j.id}-SCHED` : j.id,
          mapped_status: 'Scheduled'
        }));

        const unified = [...validReqs, ...inProgJobs, ...schedJobs, ...compJobs];
        setAllRequests(unified);
        setRecentJobs(unified.slice(0, 5));
      }
    }
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, []);

  // Helper to parse dates safely
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

  const totalReq = allRequests.length > 0 ? filteredRequests.length : (stats?.totalRequests ?? 0);
  const pendingReq = allRequests.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'pending' || st === 'pending review' || st === 'accepted';
    }).length
    : ((stats?.pendingRequests ?? 0) + (stats?.acceptedRequests ?? 0));
  const schedReq = allRequests.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'scheduled' || st === 'on hold' || st === 'hold';
    }).length
    : (stats?.scheduledRequests ?? stats?.scheduled ?? 0);
  const inProgReq = allRequests.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'in progress' || st === 'assigned' || st === 'pending start';
    }).length
    : (stats?.inProgressJobs ?? stats?.inProgressRequests ?? stats?.inProgress ?? 0);
  const compReq = allRequests.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'completed';
    }).length
    : (stats?.completedJobs ?? stats?.completedRequests ?? stats?.completed ?? 0);
  const rejectedReq = allRequests.length > 0
    ? filteredRequests.filter(r => {
      const st = (r.mapped_status || r.status || '').toLowerCase();
      return st === 'rejected' || st === 'cancelled';
    }).length
    : (stats?.rejectedRequests ?? stats?.rejected ?? 0);
  const totalDonut = totalReq || 0;

  // Spline area chart data calculated dynamically based on timeFilter
  let chartLabels = [];
  let chartCounts = [];

  if (timeFilter === 'Day' || timeFilter === 'Today') {
    const slots = [
      { label: '12 AM', start: 0, end: 4 },
      { label: '4 AM', start: 4, end: 8 },
      { label: '8 AM', start: 8, end: 12 },
      { label: '12 PM', start: 12, end: 16 },
      { label: '4 PM', start: 16, end: 20 },
      { label: '8 PM', start: 20, end: 24 }
    ];
    chartLabels = slots.map(s => s.label);
    chartCounts = slots.map(s => filteredRequests.filter(r => {
      const d = getReqDate(r);
      const h = d ? d.getHours() : -1;
      return h >= s.start && h < s.end;
    }).length);
  } else if (timeFilter === 'This Week') {
    const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDay = now.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const weekDates = weekDayNames.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      const dayNum = d.getDate();
      return {
        label: `${dayName} (${mName} ${dayNum})`,
        dateStr: d.toDateString()
      };
    });
    chartLabels = weekDates.map(w => w.label);

    chartCounts = weekDates.map(item =>
      filteredRequests.filter(r => {
        const d = getReqDate(r);
        return d && d.toDateString() === item.dateStr;
      }).length
    );
  } else if (timeFilter === 'This Month') {
    const monthName = now.toLocaleString('en-US', { month: 'short' });
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
    const weeks = [
      { label: `${monthName} 1 - 7`, start: 1, end: 7 },
      { label: `${monthName} 8 - 14`, start: 8, end: 14 },
      { label: `${monthName} 15 - 21`, start: 15, end: 21 },
      { label: `${monthName} 22 - ${lastDay}`, start: 22, end: lastDay }
    ];
    chartLabels = weeks.map(w => w.label);
    chartCounts = weeks.map(w => filteredRequests.filter(r => {
      const d = getReqDate(r);
      const day = d ? d.getDate() : -1;
      return day >= w.start && day <= w.end;
    }).length);
  } else {
    // 'This Year' / 'All Time'
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    chartLabels = months;
    if (filteredRequests.length > 0) {
      chartCounts = months.map((_, idx) => filteredRequests.filter(r => {
        const d = getReqDate(r);
        return d && d.getFullYear() === currentYear && d.getMonth() === idx;
      }).length);
    } else {
      chartLabels = stats?.requestsOverviewMonthly?.map(m => m.month) || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
      chartCounts = stats?.requestsOverviewMonthly?.map(m => m.count) || [0, 0, 0, 0, 0, 0, 0, totalReq];
    }
  }

  const lineChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: chartCounts,
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
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, precision: 0 },
        grid: { color: '#f1f5f9' }
      }
    }
  };

  // Doughnut Chart Data (Requests by status)
  const doughnutData = {
    labels: ['Pending', 'Scheduled', 'In Progress', 'Completed', 'Rejected'],
    datasets: [
      {
        data: totalDonut > 0
          ? [pendingReq, schedReq, inProgReq, compReq, rejectedReq]
          : [1, 0, 0, 0, 0],
        backgroundColor: totalDonut > 0
          ? ['#f59e0b', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444']
          : ['#e2e8f0', '#e2e8f0', '#e2e8f0', '#e2e8f0', '#e2e8f0'],
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

  const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = `${now.toLocaleDateString('en-US', { weekday: 'long' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

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
            Good morning, {userProfile?.firstName || getAuthUser()?.firstName || 'Maintenance Officer'}! <span role="img" aria-label="wave">👋</span>
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
            <div style={{ fontWeight: 600, color: '#1e293b' }}>{dateStr}</div>
            <div style={{ fontSize: '11.5px' }}>{timeStr}</div>
          </div>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#7a1521] flex items-center justify-center font-bold text-xs shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Filter Operations:</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {timeFilter}
              </span>
            </div>
          </div>
        </div>

        {/* Preset filter chips + Custom Range inputs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200/60">
            {['All Time', 'Today', 'This Week', 'This Month', 'This Year', 'Custom Range'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTimeFilter(opt)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${timeFilter === opt
                    ? 'bg-[#7a1521] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {timeFilter === 'Custom Range' && (
            <div className="flex items-center gap-2 pl-1 animate-in fade-in duration-150">
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <span className="text-[11px] text-slate-400 font-medium">From</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <span className="text-[11px] text-slate-400 font-medium">To</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
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
                  className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top 6 Stat Cards */}
      <div className="stat-cards-6-grid">
        <StatCard
          title="Requests"
          value={totalReq}
          icon={FileText}
          color="blue"
          onClick={() => setCurrentPage('requests')}
        />
        <StatCard
          title="Pending"
          value={pendingReq}
          icon={Clock}
          color="amber"
          onClick={() => setCurrentPage('requests')}
        />
        <StatCard
          title="Scheduled"
          value={schedReq}
          icon={Calendar}
          color="purple"
          onClick={() => setCurrentPage('requests')}
        />
        <StatCard
          title="In Progress"
          value={inProgReq}
          icon={Wrench}
          color="blue"
          onClick={() => setCurrentPage('jobs')}
        />
        <StatCard
          title="Completed"
          value={compReq}
          icon={CheckCircle2}
          color="green"
          onClick={() => setCurrentPage('jobs')}
        />
        <StatCard
          title="Rejected"
          value={rejectedReq}
          icon={XCircle}
          color="red"
          onClick={() => setCurrentPage('requests')}
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
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  padding: '4px 28px 4px 10px',
                  fontSize: '12.5px',
                  color: '#475569',
                  cursor: 'pointer',
                  outline: 'none',
                  fontWeight: 500,
                  fontFamily: 'inherit'
                }}
              >
                <option value="All Time">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
                <option value="Custom Range">Custom Range</option>
              </select>
              <ChevronDown
                size={14}
                style={{
                  position: 'absolute',
                  right: '8px',
                  pointerEvents: 'none',
                  color: '#475569'
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, minHeight: '200px', width: '100%', position: 'relative' }}>
            <Line key={timeFilter} data={lineChartData} options={lineChartOptions} />
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
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b' }}>{totalDonut}</div>
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
              <span>Pending <b>{pendingReq} ({totalDonut ? Math.round((pendingReq / totalDonut) * 100) : 0}%)</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></span>
              <span>Scheduled <b>{schedReq} ({totalDonut ? Math.round((schedReq / totalDonut) * 100) : 0}%)</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></span>
              <span>In Progress <b>{inProgReq} ({totalDonut ? Math.round((inProgReq / totalDonut) * 100) : 0}%)</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
              <span>Completed <b>{compReq} ({totalDonut ? Math.round((compReq / totalDonut) * 100) : 0}%)</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></span>
              <span>Rejected <b>{rejectedReq} ({totalDonut ? Math.round((rejectedReq / totalDonut) * 100) : 0}%)</b></span>
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
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                {stats?.systemOverview?.totalUsers ?? stats?.totalUsers ?? 12}
              </span>
            </div>


            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Locations</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                {stats?.systemOverview?.totalLocations ?? stats?.totalLocations ?? 17}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <LayoutGrid size={16} />
                </div>
                <span style={{ fontSize: '13px', color: '#475569' }}>Total Categories</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                {stats?.systemOverview?.totalCategories ?? stats?.totalCategories ?? 7}
              </span>
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
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                    No recent maintenance jobs recorded.
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => (
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
                )))}
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
