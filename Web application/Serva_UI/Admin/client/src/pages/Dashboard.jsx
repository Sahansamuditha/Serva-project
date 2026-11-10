import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Calendar as CalendarIcon,
  Plus,
  UserPlus,
  FileSpreadsheet,
  UserCheck2,
  Users2,
  MapPin,
  Grid,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  TrendingUp,
  User,
  X,
  XCircle,
  ExternalLink
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Dashboard({
  onNavigate,
  onOpenAddUser,
  onOpenExportReport,
  dashboardData
}) {
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [activeOverviewModal, setActiveOverviewModal] = useState(null);

  const getFilteredData = () => {
    const rawStats = dashboardData?.stats || {};
    const allRequests = dashboardData?.allRequests || [];

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

    let totalRequests = 0;
    let pending = 0;
    let scheduled = 0;
    let inProgress = 0;
    let completed = 0;
    let cancelled = 0;

    if (allRequests.length > 0) {
      totalRequests = filteredRequests.length;
      pending = filteredRequests.filter(r => {
        const st = (r.mapped_status || r.status || '').toLowerCase();
        return st === 'pending' || st === 'pending review' || st === 'accepted';
      }).length;
      scheduled = filteredRequests.filter(r => {
        const st = (r.mapped_status || r.status || '').toLowerCase();
        return st === 'scheduled' || st === 'on hold' || st === 'hold';
      }).length;
      inProgress = filteredRequests.filter(r => {
        const st = (r.mapped_status || r.status || '').toLowerCase();
        return st === 'in progress' || st === 'assigned' || st === 'pending start';
      }).length;
      completed = filteredRequests.filter(r => {
        const st = (r.mapped_status || r.status || '').toLowerCase();
        return st === 'completed';
      }).length;
      cancelled = filteredRequests.filter(r => {
        const st = (r.mapped_status || r.status || '').toLowerCase();
        return st === 'rejected' || st === 'cancelled';
      }).length;
    } else {
      pending = rawStats.pending !== undefined ? rawStats.pending : 0;
      scheduled = rawStats.scheduled !== undefined ? rawStats.scheduled : 11;
      inProgress = rawStats.inProgress !== undefined ? rawStats.inProgress : 8;
      completed = rawStats.completed !== undefined ? rawStats.completed : 2;
      cancelled = rawStats.cancelled !== undefined ? rawStats.cancelled : (rawStats.rejected || 10);
      totalRequests = rawStats.totalRequests ?? (pending + scheduled + inProgress + completed + cancelled);
    }

    const sys = dashboardData?.systemOverview || {};
    const totalUsers = sys.totalUsers ?? rawStats.totalUsers ?? 9;
    const activeUsers = sys.activeUsers ?? rawStats.activeUsers ?? totalUsers;
    const inactiveUsers = sys.inactiveUsers ?? rawStats.inactiveUsers ?? 0;
    const totalLabourers = sys.totalLabourers ?? rawStats.totalLabourers ?? 12;
    const availableLabourers = sys.availableLabourers ?? rawStats.availableLabourers ?? totalLabourers;
    const onDutyLabourers = sys.onDutyLabourers ?? rawStats.onDutyLabourers ?? 0;
    const totalTeams = sys.totalTeams ?? rawStats.totalTeams ?? 4;
    const totalLocations = sys.totalLocations ?? rawStats.totalLocations ?? 27;
    const buildingsCount = sys.buildingsCount ?? 5;
    const facilitiesCount = sys.facilitiesCount ?? 27;
    const totalCategories = sys.totalCategories ?? rawStats.totalCategories ?? 7;

    const stats = {
      totalRequests,
      totalRequestsChange: 0,
      pending,
      pendingChange: 0,
      scheduled,
      scheduledChange: 0,
      inProgress,
      inProgressChange: 0,
      completed,
      completedChange: 0,
      cancelled,
      cancelledChange: 0,
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalLabourers,
      availableLabourers,
      onDutyLabourers,
      totalTeams,
      totalLocations,
      buildingsCount,
      facilitiesCount,
      totalCategories
    };

    let overviewData = [];
    if (timeFilter === 'Day' || timeFilter === 'Today') {
      const slots = [
        { label: '12 AM', start: 0, end: 4 },
        { label: '4 AM', start: 4, end: 8 },
        { label: '8 AM', start: 8, end: 12 },
        { label: '12 PM', start: 12, end: 16 },
        { label: '4 PM', start: 16, end: 20 },
        { label: '8 PM', start: 20, end: 24 }
      ];
      overviewData = slots.map(s => ({
        month: s.label,
        requests: filteredRequests.filter(r => {
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

      overviewData = weekDayNames.map((dayName, idx) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + idx);
        const mName = d.toLocaleString('en-US', { month: 'short' });
        const dayNum = d.getDate();
        const dateStr = d.toDateString();
        return {
          month: `${dayName} (${mName} ${dayNum})`,
          requests: filteredRequests.filter(r => {
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
      overviewData = weeks.map(w => ({
        month: w.label,
        requests: filteredRequests.filter(r => {
          const d = getReqDate(r);
          const day = d ? d.getDate() : -1;
          return day >= w.start && day <= w.end;
        }).length
      }));
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (filteredRequests.length > 0) {
        overviewData = months.map((m, idx) => ({
          month: m,
          requests: filteredRequests.filter(r => {
            const d = getReqDate(r);
            return d && d.getFullYear() === currentYear && d.getMonth() === idx;
          }).length
        }));
      } else {
        overviewData = months.map(m => ({
          month: m,
          requests: m === 'Oct' ? 14 : 0
        }));
      }
    }

    const donutData = totalRequests > 0 ? [
      { name: 'Pending', value: pending, percent: Math.round((pending / totalRequests) * 100), color: '#f59e0b', desc: 'Awaiting Action' },
      { name: 'Scheduled', value: scheduled, percent: Math.round((scheduled / totalRequests) * 100), color: '#8b5cf6', desc: 'Planned Maintenance' },
      { name: 'In Progress', value: inProgress, percent: Math.round((inProgress / totalRequests) * 100), color: '#3b82f6', desc: 'Active Maintenance' },
      { name: 'Completed', value: completed, percent: Math.round((completed / totalRequests) * 100), color: '#10b981', desc: 'Finished & Verified' },
      { name: 'Rejected', value: cancelled, percent: Math.round((cancelled / totalRequests) * 100), color: '#ef4444', desc: 'Cancelled / Rejected' }
    ] : [
      { name: 'No Requests', value: 1, percent: 0, color: '#e2e8f0', desc: 'No active tickets in selected range' }
    ];

    return {
      stats,
      overviewData,
      donutData,
      totalCenterStat: totalRequests,
      filteredCount: totalRequests,
      totalCountAll: allRequests.length || rawStats.totalRequests || 31
    };
  };

  const filtered = getFilteredData();
  const stats = filtered.stats;
  const overviewData = filtered.overviewData;
  const donutData = filtered.donutData;
  const totalCenterStat = filtered.totalCenterStat;

  const recentJobs = dashboardData?.recentJobs || [
    {
      id: 'REQ-8291',
      title: 'AC Failure & Overheating',
      location: 'Server Room (U2017)',
      priority: 'Critical',
      status: 'Pending',
      assignedTo: 'Unassigned'
    },
    {
      id: 'REQ-8290',
      title: 'Main Water Line Burst',
      location: 'Chemistry Lab (U2018)',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Kasun Perera'
    },
    {
      id: 'REQ-8289',
      title: 'Faulty Breaker in Library',
      location: 'Reading Hall 2F',
      priority: 'Medium',
      status: 'Completed',
      assignedTo: 'Nimal Fernando'
    },
    {
      id: 'REQ-8288',
      title: 'Lighting Issue',
      location: 'Engineering Building',
      priority: 'Low',
      status: 'Pending',
      assignedTo: 'Unassigned'
    },
    {
      id: 'REQ-8287',
      title: 'Wall Crack Repair',
      location: 'Admin Building',
      priority: 'Medium',
      status: 'In Progress',
      assignedTo: 'Saman Wijesiri'
    }
  ];

  const recentActivity = dashboardData?.recentActivity || [
    { time: '10:25 AM', title: 'New request REQ-8291 submitted', user: 'by Nimal Perera', type: 'new' },
    { time: '09:58 AM', title: 'REQ-8290 assigned to Kasun Perera', user: 'by Maintenance Officer', type: 'assign' },
    { time: '09:30 AM', title: 'REQ-8289 marked as completed', user: 'by Nimal Fernando', type: 'complete' },
    { time: '09:15 AM', title: 'New user added: Saman Wijesiri', user: 'by Admin', type: 'user' }
  ];

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return <span className="bg-red-50 text-red-600 border border-red-200/80 px-2 py-0.5 rounded text-[11px] font-semibold">Critical</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200/80 px-2 py-0.5 rounded text-[11px] font-semibold">High</span>;
      case 'medium':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200/80 px-2 py-0.5 rounded text-[11px] font-semibold">Medium</span>;
      case 'low':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/80 px-2 py-0.5 rounded text-[11px] font-semibold">Low</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">{priority}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[11px] font-medium">Pending</span>;
      case 'in progress':
        return <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[11px] font-medium">In Progress</span>;
      case 'completed':
        return <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-medium">Completed</span>;
      case 'overdue':
        return <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[11px] font-medium">Overdue</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Good morning, Admin! <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Here's an overview of the maintenance operations.</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm text-xs font-medium text-slate-700">
          <CalendarIcon className="w-4 h-4 text-slate-400" />
          <span>22 August 2026, Friday, 10:30 AM</span>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-50 text-[#7a1521] flex items-center justify-center font-bold text-xs shrink-0">
            <CalendarIcon className="w-4 h-4" />
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
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  timeFilter === opt
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

      {/* Row 1: 6 Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Requests */}
        <div
          onClick={() => onNavigate && onNavigate('requests')}
          className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">Requests</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRequests}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div
          onClick={() => onNavigate && onNavigate('requests')}
          className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">Pending</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Scheduled */}
        <div
          onClick={() => onNavigate && onNavigate('requests')}
          className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">Scheduled</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.scheduled}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
            <CalendarIcon className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div
          onClick={() => onNavigate && onNavigate('jobs')}
          className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">In Progress</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.inProgress}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div
          onClick={() => onNavigate && onNavigate('jobs')}
          className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.completed}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Rejected */}
        <div
          onClick={() => onNavigate && onNavigate('requests')}
          className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-xs font-medium text-slate-500">Rejected</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.cancelled}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-sm">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 2: Requests Overview Chart + Requests by Status + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Requests Overview Chart */}
        <div className="lg:col-span-6 admin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800">Requests Overview</h3>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 focus:outline-none focus:border-[#7a1521] bg-white cursor-pointer"
            >
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overviewData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="maroonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a1521" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7a1521" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 80]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="#7a1521"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#maroonGradient)"
                  dot={{ r: 3.5, fill: '#7a1521', strokeWidth: 1, stroke: '#fff' }}
                  activeDot={{ r: 6, fill: '#58000f' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Requests by Status Donut */}
        <div className="lg:col-span-3 admin-card p-5 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-800 mb-2">Requests by Status</h3>
          <div className="relative flex items-center justify-center my-2">
            <svg width="176" height="176" viewBox="0 0 176 176" className="overflow-visible">
              {(() => {
                const total = donutData.reduce((acc, curr) => acc + (curr.value || 0), 0);
                const C = 2 * Math.PI * 54; // circumference for r=54
                let cumulative = 0;

                if (total <= 0) {
                  return (
                    <circle cx="88" cy="88" r="54" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                  );
                }

                const activeSegments = donutData.filter((d) => (d.value || 0) > 0);

                return activeSegments.map((item, index) => {
                  const val = item.value || 0;
                  const portion = val / total;
                  const strokeLength = portion * C;
                  const visibleLength = activeSegments.length > 1 ? Math.max(0, strokeLength - 3) : strokeLength;
                  const dasharray = `${visibleLength} ${C - visibleLength}`;
                  const dashoffset = -cumulative;
                  cumulative += strokeLength;

                  return (
                    <circle
                      key={index}
                      cx="88"
                      cy="88"
                      r="54"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="20"
                      strokeDasharray={dasharray}
                      strokeDashoffset={dashoffset}
                      style={{ transformOrigin: '88px 88px', transform: 'rotate(-90deg)' }}
                      className="transition-all duration-500 ease-out"
                    />
                  );
                });
              })()}
              <text x="88" y="83" textAnchor="middle" fontSize="22" fontWeight="800" fill="#0f172a">
                {totalCenterStat}
              </text>
              <text x="88" y="101" textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">
                Total
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-y-2 gap-x-2.5 text-xs pt-3 border-t border-slate-100">
            {donutData.map((item, i) => {
              const val = item.value || 0;
              const pct = totalCenterStat > 0 ? Math.round((val / totalCenterStat) * 100) : 0;
              return (
                <div key={i} className="flex items-start gap-2 p-1.5 rounded-lg bg-slate-50/80 border border-slate-100">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 shadow-sm" style={{ backgroundColor: item.color }}></span>
                  <div className="text-[11px] text-slate-700 leading-tight">
                    <div className="font-bold text-slate-800">{item.name}</div>
                    {item.desc && <div className="text-[10px] text-slate-400 font-normal truncate">{item.desc}</div>}
                    <div className="text-slate-600 font-medium mt-0.5">
                      <span className="font-extrabold text-slate-900">{val}</span> <span className="text-slate-500 font-semibold">({pct}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-3 admin-card p-5 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-800 mb-3">Quick Actions</h3>
          <div className="space-y-2.5">
            <button
              onClick={onOpenAddUser}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Add New User</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={onOpenExportReport}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <span>Generate Report</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: Recent Jobs (table) */}
      <div className="admin-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-slate-800">Recent Jobs</h3>
          <button
            onClick={() => onNavigate('jobs')}
            className="text-xs font-medium text-[#7a1521] hover:underline"
          >
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="pb-2.5">Job ID</th>
                <th className="pb-2.5">Title</th>
                <th className="pb-2.5">Location</th>
                <th className="pb-2.5">Priority</th>
                <th className="pb-2.5">Status</th>
                <th className="pb-2.5">Assigned To</th>
                <th className="pb-2.5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {recentJobs.map((job) => (
                <tr
                  key={job.id}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  onClick={() => onNavigate('job-detail')}
                >
                  <td className="py-3 font-semibold text-slate-800">{job.id}</td>
                  <td className="py-3 font-medium text-slate-900 max-w-[130px] truncate">{job.title}</td>
                  <td className="py-3 text-slate-500 max-w-[120px] truncate">{job.location}</td>
                  <td className="py-3">{getPriorityBadge(job.priority)}</td>
                  <td className="py-3">{getStatusBadge(job.status)}</td>
                  <td className="py-3 text-slate-500 italic truncate max-w-[90px]">{job.assignedTo}</td>
                  <td className="py-3 text-right text-slate-400">
                    <MoreVertical className="w-4 h-4 inline" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Overview Detail Modal (removed) */}
      {false && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5 animate-in zoom-in-95 duration-150 relative max-h-[85vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl text-white font-bold shadow-xs ${
                  activeOverviewModal === 'users' ? 'bg-blue-600' :
                  activeOverviewModal === 'labourers' ? 'bg-purple-600' :
                  activeOverviewModal === 'locations' ? 'bg-emerald-600' : 'bg-amber-500'
                }`}>
                  {activeOverviewModal === 'users' && <Users2 className="w-5 h-5" />}
                  {activeOverviewModal === 'labourers' && <UserCheck2 className="w-5 h-5" />}
                  {activeOverviewModal === 'locations' && <MapPin className="w-5 h-5" />}
                  {activeOverviewModal === 'categories' && <Grid className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 capitalize">
                    {activeOverviewModal === 'users' && 'System Registered Users Details'}
                    {activeOverviewModal === 'labourers' && 'Maintenance Teams & Personnel Details'}
                    {activeOverviewModal === 'locations' && 'Campus Facility Locations Breakdown'}
                    {activeOverviewModal === 'categories' && 'Maintenance Service Categories Overview'}
                  </h3>
                  <p className="text-xs text-slate-500">Full system breakdown & operational status</p>
                </div>
              </div>
              <button
                onClick={() => setActiveOverviewModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content depending on type */}
            {activeOverviewModal === 'users' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="text-lg font-bold text-blue-700">{stats.totalUsers}</div>
                    <div className="text-[10px] text-blue-600 font-medium">Total Accounts</div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="text-lg font-bold text-emerald-700">{stats.activeUsers}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Active Users</div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="text-lg font-bold text-amber-700">{stats.inactiveUsers}</div>
                    <div className="text-[10px] text-amber-600 font-medium">Inactive/Pending</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PRIMARY SYSTEM USERS</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(sys.usersList && sys.usersList.length > 0 ? sys.usersList : [
                      { name: 'Dr. Anura Perera', role: 'Director', dept: 'ITUM Executive Directorate', status: 'active' },
                      { name: 'Dr. Kasun Perera', role: 'Requester', dept: 'Division of Information Technology', status: 'active' },
                      { name: 'Eng. Sarah Jenkins', role: 'Supervisor', dept: 'Electrical & Power Systems', status: 'active' },
                      { name: 'Amal Perera', role: 'Maintenance Officer', dept: 'Estates & Facilities Maintenance', status: 'active' },
                      { name: 'Marcus Johnson', role: 'Supervisor', dept: 'Water & Utilities Division', status: 'active' },
                    ]).map((u, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.role || u.designation} • {u.dept || u.department}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${(u.status || '').toLowerCase() === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {u.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeOverviewModal === 'labourers' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl">
                    <div className="text-lg font-bold text-purple-700">{stats.totalLabourers}</div>
                    <div className="text-[10px] text-purple-600 font-medium">Total Personnel</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="text-lg font-bold text-blue-700">{stats.availableLabourers}</div>
                    <div className="text-[10px] text-blue-600 font-medium">Available Dispatch</div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="text-lg font-bold text-emerald-700">{stats.totalTeams}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Active Crews</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MAINTENANCE TEAMS & CREWS</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(sys.teamsList && sys.teamsList.length > 0 ? sys.teamsList : [
                      { team: 'Electrical & Power Systems Crew', spec: 'Electricity', lead: 'Eng. Sarah Jenkins', count: '4 Members', status: 'Active / On Standby', color: 'text-emerald-600 bg-emerald-50' },
                      { team: 'Plumbing & Water Infrastructure Crew', spec: 'Water', lead: 'Marcus Johnson', count: '3 Members', status: 'Active / On Standby', color: 'text-emerald-600 bg-emerald-50' },
                      { team: 'HVAC & Refrigeration Services', spec: 'HVAC', lead: 'Kamal Wickramasinghe', count: '3 Members', status: 'Active / On Standby', color: 'text-emerald-600 bg-emerald-50' },
                      { team: 'Civil, Carpentry & Structural Maintenance', spec: 'Civil & Structural', lead: 'Nimal Gunawardena', count: '4 Members', status: 'Active / On Standby', color: 'text-emerald-600 bg-emerald-50' }
                    ]).map((t, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{t.team} <span className="text-slate-500 font-normal">({t.spec})</span></div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Lead: {t.lead} • {t.count}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${t.color || 'text-emerald-600 bg-emerald-50'}`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeOverviewModal === 'locations' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="text-lg font-bold text-emerald-700">{stats.totalLocations}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Total Facilities & Labs</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="text-lg font-bold text-blue-700">{stats.buildingsCount}</div>
                    <div className="text-[10px] text-blue-600 font-medium">Main Complex Buildings</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CAMPUS FACILITY COMPLEXES</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(sys.locationsList && sys.locationsList.length > 0 ? sys.locationsList : [
                      { name: 'IT Center Complex (Block C)', jobs: '6 Facilities (Labs U2017-U2019, Server Room, Staff Offices)', status: 'Operational', color: 'bg-blue-50 text-blue-700' },
                      { name: 'Science Building (Block S)', jobs: '5 Facilities (Chem Lab, Physics Lab, Materials Lab, Lecture Halls)', status: 'Operational', color: 'bg-emerald-50 text-emerald-700' },
                      { name: 'Main Block (Complex B)', jobs: '5 Facilities (Lecture Halls A & B, Auditorium, Directorate)', status: 'Operational', color: 'bg-amber-50 text-amber-700' },
                      { name: 'Library Complex', jobs: '5 Facilities (Reading Halls 1F/2F, Digital Library, Reference Section)', status: 'Operational', color: 'bg-purple-50 text-purple-700' },
                      { name: 'Engineering Workshop', jobs: '6 Facilities (Mechanical Bay, Welding Unit, Automotive Bay, Timber Section)', status: 'Operational', color: 'bg-red-50 text-red-700' }
                    ]).map((loc, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{loc.name}</div>
                          <div className="text-[11px] text-slate-500">{loc.jobs}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${loc.color}`}>
                          {loc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeOverviewModal === 'categories' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="text-lg font-bold text-amber-700">{stats.totalCategories}</div>
                    <div className="text-[10px] text-amber-600 font-medium">Service Categories</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="text-lg font-bold text-blue-700">100%</div>
                    <div className="text-[10px] text-blue-600 font-medium">Facility Coverage</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">OFFICIAL MAINTENANCE CATEGORIES</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {(sys.categoriesList && sys.categoriesList.length > 0 ? sys.categoriesList : [
                      { cat: 'Electricity', count: 'Power, Lighting, Panels, Wiring', share: 'Service Active', color: 'bg-amber-100 text-amber-800' },
                      { cat: 'Water & Plumbing', count: 'Supply, Leaks, Taps, Drainage, Pumps', share: 'Service Active', color: 'bg-blue-100 text-blue-800' },
                      { cat: 'HVAC & Climate Control', count: 'AC Units, Ventilation, Exhaust, Ducting', share: 'Service Active', color: 'bg-emerald-100 text-emerald-800' },
                      { cat: 'Civil & Structural', count: 'Walls, Flooring, Roofs, Doors, Windows', share: 'Service Active', color: 'bg-purple-100 text-purple-800' },
                      { cat: 'Academic Facilities', count: 'Classrooms, Lecture Theatres, Labs', share: 'Service Active', color: 'bg-indigo-100 text-indigo-800' },
                      { cat: 'Cleaning & Sanitation', count: 'Washrooms, Waste Disposal, Common Areas', share: 'Service Active', color: 'bg-teal-100 text-teal-800' },
                      { cat: 'Grounds & Gardening', count: 'Lawns, Tree Trimming, Outdoor Grounds', share: 'Service Active', color: 'bg-green-100 text-green-800' }
                    ]).map((c, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{c.cat}</div>
                          <div className="text-[11px] text-slate-500">{c.count}</div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${c.color}`}>
                          {c.share}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Navigation Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const targetPage = activeOverviewModal === 'users' ? 'users' :
                    activeOverviewModal === 'labourers' ? 'labourers' : 'reports';
                  setActiveOverviewModal(null);
                  onNavigate(targetPage);
                }}
                className="w-full py-2.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>
                  {activeOverviewModal === 'users' && 'Go to User Management Page'}
                  {activeOverviewModal === 'labourers' && 'Go to Labourers & Teams Page'}
                  {activeOverviewModal === 'locations' && 'View Full Location Reports'}
                  {activeOverviewModal === 'categories' && 'View Full Category Reports'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

