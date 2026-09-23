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
  const [timeFilter, setTimeFilter] = useState('This Year');
  const [activeOverviewModal, setActiveOverviewModal] = useState(null);

  const getFilteredData = () => {
    switch (timeFilter) {
      case 'Last 6 Months':
        return {
          stats: {
            totalRequests: 273,
            totalRequestsChange: 15,
            pending: 10,
            pendingChange: -5,
            inProgress: 24,
            inProgressChange: 3,
            overdue: 4,
            overdueChange: 40,
            completed: 235,
            completedChange: 14,
            totalUsers: 86,
            totalLabourers: 24,
            totalLocations: 12,
            totalCategories: 8
          },
          overviewData: [
            { month: 'Mar', requests: 28, completed: 25 },
            { month: 'Apr', requests: 42, completed: 38 },
            { month: 'May', requests: 38, completed: 35 },
            { month: 'Jun', requests: 45, completed: 42 },
            { month: 'Jul', requests: 50, completed: 48 },
            { month: 'Aug', requests: 48, completed: 46 }
          ],
          donutData: [
            { name: 'Pending', value: 10, percent: 4, color: '#f59e0b', desc: 'Awaiting Action' },
            { name: 'In Progress', value: 24, percent: 9, color: '#3b82f6', desc: 'Active Maintenance' },
            { name: 'Completed', value: 235, percent: 86, color: '#10b981', desc: 'Finished & Verified' },
            { name: 'Overdue', value: 4, percent: 1, color: '#ef4444', desc: 'Attention Needed' }
          ],
          totalCenterStat: 273
        };

      case 'Last Year':
        return {
          stats: {
            totalRequests: 412,
            totalRequestsChange: 8,
            pending: 8,
            pendingChange: -80,
            inProgress: 12,
            inProgressChange: -70,
            overdue: 2,
            overdueChange: 10,
            completed: 390,
            completedChange: 22,
            totalUsers: 72,
            totalLabourers: 20,
            totalLocations: 10,
            totalCategories: 8
          },
          overviewData: [
            { month: 'Jan', requests: 18, completed: 18 },
            { month: 'Feb', requests: 24, completed: 24 },
            { month: 'Mar', requests: 30, completed: 30 },
            { month: 'Apr', requests: 25, completed: 28 },
            { month: 'May', requests: 35, completed: 35 },
            { month: 'Jun', requests: 40, completed: 40 },
            { month: 'Jul', requests: 38, completed: 38 },
            { month: 'Aug', requests: 42, completed: 42 },
            { month: 'Sep', requests: 36, completed: 36 },
            { month: 'Oct', requests: 45, completed: 44 },
            { month: 'Nov', requests: 37, completed: 37 },
            { month: 'Dec', requests: 39, completed: 38 }
          ],
          donutData: [
            { name: 'Pending', value: 8, percent: 2, color: '#f59e0b', desc: 'Awaiting Action' },
            { name: 'In Progress', value: 12, percent: 3, color: '#3b82f6', desc: 'Active Maintenance' },
            { name: 'Completed', value: 390, percent: 94, color: '#10b981', desc: 'Finished & Verified' },
            { name: 'Overdue', value: 2, percent: 1, color: '#ef4444', desc: 'Attention Needed' }
          ],
          totalCenterStat: 412
        };

      case 'This Year':
      default:
        return {
          stats: dashboardData?.stats || {
            totalRequests: 128,
            totalRequestsChange: 12,
            pending: 14,
            pendingChange: -8,
            inProgress: 32,
            inProgressChange: 5,
            overdue: 7,
            overdueChange: 75,
            completed: 75,
            completedChange: 18,
            totalUsers: 86,
            totalLabourers: 24,
            totalLocations: 12,
            totalCategories: 8
          },
          overviewData: dashboardData?.overviewData || [
            { month: 'Jan', requests: 20, completed: 18 },
            { month: 'Feb', requests: 35, completed: 28 },
            { month: 'Mar', requests: 28, completed: 25 },
            { month: 'Apr', requests: 42, completed: 38 },
            { month: 'May', requests: 38, completed: 35 },
            { month: 'Jun', requests: 45, completed: 42 },
            { month: 'Jul', requests: 50, completed: 48 },
            { month: 'Aug', requests: 48, completed: 46 }
          ],
          donutData: [
            { name: 'Pending', value: dashboardData?.stats?.pending ?? 14, percent: 11, color: '#f59e0b', desc: 'Awaiting Action' },
            { name: 'In Progress', value: dashboardData?.stats?.inProgress ?? 32, percent: 25, color: '#3b82f6', desc: 'Active Maintenance' },
            { name: 'Completed', value: dashboardData?.stats?.completed ?? 75, percent: 59, color: '#10b981', desc: 'Finished & Verified' },
            { name: 'Overdue', value: dashboardData?.stats?.overdue ?? 7, percent: 5, color: '#ef4444', desc: 'Attention Needed' }
          ],
          totalCenterStat: 128
        };
    }
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

      {/* Row 1: 5 Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Requests */}
        <div className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500">Requests</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRequests}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500">Pending</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* In Progress */}
        <div className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500">In Progress</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.inProgress}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        {/* Overdue */}
        <div className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors">
          <div>
            <span className="text-xs font-medium text-slate-500">Overdue</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.overdue}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-sm">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        {/* Completed */}
        <div className="admin-card p-4 flex items-center justify-between hover:border-slate-300 transition-colors col-span-2 sm:col-span-1">
          <div>
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.completed}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
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
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 focus:outline-none focus:border-[#7a1521] bg-white"
            >
              <option value="This Year">This Year</option>
              <option value="Last Year">Last Year</option>
              <option value="Last 6 Months">Last 6 Months</option>
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
              onClick={() => onNavigate('jobs')}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#7a1521] text-white flex items-center justify-center">
                  <Plus className="w-4 h-4" />
                </div>
                <span>Add New Request</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('jobs')}
              className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>Assigned Jobs</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

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

      {/* Row 3: Recent Jobs (table) + Recent Activity + System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Jobs Table */}
        <div className="lg:col-span-6 admin-card p-5">
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

        {/* Recent Activity */}
        <div className="lg:col-span-3 admin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800">Recent Activity</h3>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs font-medium text-[#7a1521] hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {recentActivity.map((act, i) => (
              <div key={i} className="flex items-start gap-3 relative">
                <div className={`w-4 h-4 rounded-full border-2 border-white shrink-0 mt-0.5 z-10 ${act.type === 'new' ? 'bg-red-500' :
                  act.type === 'assign' ? 'bg-blue-500' :
                    act.type === 'complete' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></div>
                <div className="text-xs leading-tight">
                  <div className="text-[10px] text-slate-400 font-medium">{act.time}</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{act.title}</div>
                  <div className="text-[11px] text-slate-500">{act.user}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Overview Card */}
        <div className="lg:col-span-3 admin-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-800">System Overview</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-medium px-2 py-0.5 rounded">
              Click for Details
            </span>
          </div>

          <div className="space-y-3">
            {/* Users */}
            <div
              onClick={() => setActiveOverviewModal('users')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#7a1521]/40 hover:bg-[#fff8f7]/60 cursor-pointer transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Users2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="group-hover:text-[#58000f] transition-colors">Total Users</div>
                  <div className="text-[10px] text-slate-400 font-normal">79 Active • 7 Inactive</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">{stats.totalUsers}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#58000f] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Labourers */}
            <div
              onClick={() => setActiveOverviewModal('labourers')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#7a1521]/40 hover:bg-[#fff8f7]/60 cursor-pointer transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <UserCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="group-hover:text-[#58000f] transition-colors">Total Labourers</div>
                  <div className="text-[10px] text-slate-400 font-normal">15 On Duty • 3 Teams</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">{stats.totalLabourers}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#58000f] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Locations */}
            <div
              onClick={() => setActiveOverviewModal('locations')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#7a1521]/40 hover:bg-[#fff8f7]/60 cursor-pointer transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="group-hover:text-[#58000f] transition-colors">Total Locations</div>
                  <div className="text-[10px] text-slate-400 font-normal">7 Buildings • 5 Labs</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">{stats.totalLocations}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#58000f] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>

            {/* Categories */}
            <div
              onClick={() => setActiveOverviewModal('categories')}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-[#7a1521]/40 hover:bg-[#fff8f7]/60 cursor-pointer transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Grid className="w-4 h-4" />
                </div>
                <div>
                  <div className="group-hover:text-[#58000f] transition-colors">Total Categories</div>
                  <div className="text-[10px] text-slate-400 font-normal">HVAC, Electrical, etc.</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-slate-900">{stats.totalCategories}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#58000f] group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Overview Detail Modal */}
      {activeOverviewModal && (
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
                    <div className="text-lg font-bold text-emerald-700">79</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Active Users</div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <div className="text-lg font-bold text-amber-700">7</div>
                    <div className="text-[10px] text-amber-600 font-medium">Inactive/Pending</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PRIMARY SYSTEM USERS</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {[
                      { name: 'Dr. Anura Perera', role: 'Director / Chief Officer', dept: 'ITUM Central Admin', status: 'Active' },
                      { name: 'Mrs. Oshini Hewage', role: 'Department Head', dept: 'Civil Engineering Tech', status: 'Active' },
                      { name: 'Dr. Kasun Perera', role: 'Senior Lecturer / Requester', dept: 'Information Technology', status: 'Active' },
                      { name: 'Eng. Sarah Jenkins', role: 'Admin', dept: 'Central Maintenance Div', status: 'Active' },
                      { name: 'Mr. Amal Perera', role: 'Lab In-Charge', dept: 'Library Services & Archives', status: 'Active' },
                      { name: 'Ms. Dilani Silva', role: 'Technical Officer', dept: 'Electrical & Electronics', status: 'Active' },
                    ].map((u, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.role} • {u.dept}</div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-700 font-medium px-2 py-0.5 rounded text-[10px]">
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
                    <div className="text-lg font-bold text-blue-700">15</div>
                    <div className="text-[10px] text-blue-600 font-medium">Technicians On Duty</div>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="text-lg font-bold text-emerald-700">6</div>
                    <div className="text-[10px] text-emerald-600 font-medium">Available Dispatch</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">MAINTENANCE TEAMS</span>
                  <div className="space-y-2">
                    {[
                      { team: 'Team A', spec: 'High-voltage & internal wiring', lead: 'David Chen', count: '4 Members', status: '3 Active Jobs', color: 'text-amber-600 bg-amber-50' },
                      { team: 'Team B', spec: 'HVAC & Climate Control', lead: 'Sarah Jenkins', count: '4 Members', status: '1 Active Job', color: 'text-blue-600 bg-blue-50' },
                      { team: 'Team C', spec: 'Plumbing & Sanitation', lead: 'Marcus Johnson', count: '4 Members', status: 'Available', color: 'text-emerald-600 bg-emerald-50' },
                    ].map((t, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{t.team} <span className="text-slate-500 font-normal">({t.spec})</span></div>
                          <div className="text-[11px] text-slate-500 mt-0.5">Lead: {t.lead} • {t.count}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${t.color}`}>
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
                    <div className="text-[10px] text-emerald-600 font-medium">Total Locations</div>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <div className="text-lg font-bold text-blue-700">128</div>
                    <div className="text-[10px] text-blue-600 font-medium">Total Work Orders</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">KEY CAMPUS FACILITY LOCATIONS</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {[
                      { name: 'Science Building (Server Room U2017 & Chem Lab)', jobs: '24 Jobs', status: 'Active Critical HVAC', color: 'bg-red-50 text-red-700' },
                      { name: 'Computer Center (Main Lab Wing)', jobs: '28 Jobs', status: 'Routine Operations', color: 'bg-blue-50 text-blue-700' },
                      { name: 'Main Library (Reading Hall 2F)', jobs: '18 Jobs', status: 'Electrical Work Done', color: 'bg-emerald-50 text-emerald-700' },
                      { name: 'Engineering Building (Classroom Complex)', jobs: '16 Jobs', status: 'Scheduled Maintenance', color: 'bg-amber-50 text-amber-700' },
                      { name: 'Admin Building (Ground Floor Corridors)', jobs: '12 Jobs', status: 'Plastering In Progress', color: 'bg-purple-50 text-purple-700' },
                    ].map((loc, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{loc.name}</div>
                          <div className="text-[11px] text-slate-500">{loc.jobs} recorded</div>
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
                    <div className="text-lg font-bold text-blue-700">128</div>
                    <div className="text-[10px] text-blue-600 font-medium">Total Requests</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CATEGORY BREAKDOWN</span>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {[
                      { cat: 'Electrical', count: '30 Requests', share: '23% Share', color: 'bg-amber-100 text-amber-800' },
                      { cat: 'Plumbing', count: '25 Requests', share: '20% Share', color: 'bg-blue-100 text-blue-800' },
                      { cat: 'HVAC', count: '22 Requests', share: '17% Share', color: 'bg-emerald-100 text-emerald-800' },
                      { cat: 'Civil', count: '18 Requests', share: '14% Share', color: 'bg-purple-100 text-purple-800' },
                      { cat: 'Carpentry', count: '15 Requests', share: '12% Share', color: 'bg-pink-100 text-pink-800' },
                      { cat: 'Other Services', count: '18 Requests', share: '14% Share', color: 'bg-slate-100 text-slate-800' },
                    ].map((c, idx) => (
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

