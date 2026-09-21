import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  Wrench, 
  Puzzle,
  CheckCircle2, 
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Calendar
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { useProfile } from '../context/ProfileContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [data, setData] = useState(null);
  const [timeRange, setTimeRange] = useState('This Year');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then((res) => {
        setData(res.data?.data || res.data);
      })
      .catch((err) => {
        console.error('Failed to load dashboard stats:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats || {
    totalRequests: 0,
    pending: 0,
    inProgress: 0,
    scheduled: 0,
    completed: 0,
    overdue: 0
  };

  const monthlyData = data?.monthlyOverview && data.monthlyOverview.length > 0
    ? data.monthlyOverview
    : [
        { month: 'Jan', count: 0 },
        { month: 'Feb', count: 0 },
        { month: 'Mar', count: 0 },
        { month: 'Apr', count: 0 },
        { month: 'May', count: 0 },
        { month: 'Jun', count: 0 },
        { month: 'Jul', count: 0 },
        { month: 'Aug', count: 0 }
      ];

  const totalCount = stats.totalRequests || 0;
  const donutData = totalCount > 0 ? [
    { name: 'Pending', value: stats.pending, color: '#f59e0b', percent: `${Math.round((stats.pending / totalCount) * 100)}%` },
    { name: 'In Progress', value: stats.inProgress, color: '#2563eb', percent: `${Math.round((stats.inProgress / totalCount) * 100)}%` },
    { name: 'Scheduled', value: stats.scheduled || 0, color: '#7c3aed', percent: `${Math.round(((stats.scheduled || 0) / totalCount) * 100)}%` },
    { name: 'Completed', value: stats.completed, color: '#10b981', percent: `${Math.round((stats.completed / totalCount) * 100)}%` }
  ] : [
    { name: 'No Requests', value: 1, color: '#e2e8f0', percent: '0%' }
  ];

  const recentJobs = data?.recentJobs || [];

  const now = new Date();
  const currentDateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const currentDayTimeStr = `${now.toLocaleDateString('en-US', { weekday: 'long' })}, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in">
      {/* Greeting Banner & Date/Time on the right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#241919] flex items-center gap-2">
            Good morning, {profile?.firstName || 'Requester'}! <span className="text-xl">👋</span>
          </h1>
          <p className="text-sm text-[#574141] mt-0.5">
            Here's an overview of the maintenance operations.
          </p>
        </div>

        <div className="text-right shrink-0">
          <div className="flex items-center sm:justify-end gap-1.5 text-xs font-bold text-[#241919]">
            <Calendar className="w-3.5 h-3.5 text-[#8a7170]" />
            <span>{currentDateStr}</span>
          </div>
          <p className="text-[11px] text-[#8a7170] font-medium mt-0.5">
            {currentDayTimeStr}
          </p>
        </div>
      </div>

      {/* 5 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        {/* Card 1: Requests */}
        <div 
          onClick={() => navigate('/requests')}
          className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-card hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-[#574141]">Requests</p>
            <p className="text-3xl font-bold text-[#241919] mt-1">{stats.totalRequests}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Pending */}
        <div 
          onClick={() => navigate('/requests?status=Pending')}
          className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-card hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-[#574141]">Pending</p>
            <p className="text-3xl font-bold text-[#241919] mt-1">{stats.pending}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: In Progress */}
        <div 
          onClick={() => navigate('/requests?status=In%20Progress')}
          className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-card hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-[#574141]">In Progress</p>
            <p className="text-3xl font-bold text-[#241919] mt-1">{stats.inProgress}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-sm">
            <Puzzle className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Scheduled */}
        <div 
          onClick={() => navigate('/requests?status=Scheduled')}
          className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-card hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-[#574141]">Scheduled</p>
            <p className="text-3xl font-bold text-[#241919] mt-1">{stats.scheduled || 0}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#7c3aed] text-white flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Card 5: Completed */}
        <div 
          onClick={() => navigate('/requests?status=Completed')}
          className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-card hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-[#574141]">Completed</p>
            <p className="text-3xl font-bold text-[#241919] mt-1">{stats.completed}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-[#059669] text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Middle Section: 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Requests Overview */}
        <div className="lg:col-span-8 bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-[#241919]">Requests Overview</h3>
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-[#241919] cursor-pointer input-focus"
              >
                <option value="This Year">This Year</option>
                <option value="Last 6 Months">Last 6 Months</option>
                <option value="Last Year">Last Year</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#8a7170] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="maroonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7a1521" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#7a1521" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={{ stroke: '#e2e8f0' }} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis 
                  domain={[0, 80]} 
                  ticks={[0, 20, 40, 60, 80]} 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    borderRadius: '8px', 
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#7a1521" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#maroonGradient)"
                  dot={{ r: 3, fill: '#7a1521', strokeWidth: 1, stroke: '#ffffff' }}
                  activeDot={{ r: 5, fill: '#58000f' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Requests by Status */}
        <div className="lg:col-span-4 bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card flex flex-col justify-between">
          <h3 className="text-base font-bold text-[#241919] mb-2">Requests by Status</h3>
          
          <div className="relative h-48 flex items-center justify-center my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-[#241919] leading-tight">{stats.totalRequests}</span>
              <span className="text-[11px] text-[#64748b] font-medium">Total</span>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#f1f5f9] text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0"></span>
              <div>
                <p className="text-[#574141] font-medium">Pending</p>
                <p className="text-[#241919] font-bold text-[11px]">{stats.pending} ({totalCount ? Math.round((stats.pending / totalCount) * 100) : 0}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb] shrink-0"></span>
              <div>
                <p className="text-[#574141] font-medium">In Progress</p>
                <p className="text-[#241919] font-bold text-[11px]">{stats.inProgress} ({totalCount ? Math.round((stats.inProgress / totalCount) * 100) : 0}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed] shrink-0"></span>
              <div>
                <p className="text-[#574141] font-medium">Scheduled</p>
                <p className="text-[#241919] font-bold text-[11px]">{stats.scheduled || 0} ({totalCount ? Math.round(((stats.scheduled || 0) / totalCount) * 100) : 0}%)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shrink-0"></span>
              <div>
                <p className="text-[#574141] font-medium">Completed</p>
                <p className="text-[#241919] font-bold text-[11px]">{stats.completed} ({totalCount ? Math.round((stats.completed / totalCount) * 100) : 0}%)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Jobs */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-card overflow-hidden">
        <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#241919]">Recent Jobs</h3>
          <button
            onClick={() => navigate('/requests')}
            className="text-xs font-semibold text-[#7a1521] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-wider font-bold text-[#574141] border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3 px-6">Job ID</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Location</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Assigned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {recentJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#8a7170]">
                    No recent maintenance requests found. Click "Requests" to create a new ticket.
                  </td>
                </tr>
              ) : (
                recentJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => navigate(`/requests/${job.id}`)}
                    className="hover:bg-[#fff8f7] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-semibold text-[#241919] group-hover:text-[#7a1521]">
                      {job.id}
                    </td>
                    <td className="py-4 px-6 font-medium text-[#241919]">{job.title}</td>
                    <td className="py-4 px-6 text-[#574141] text-xs">{job.location}</td>
                    <td className="py-4 px-6">
                      <PriorityBadge priority={job.priority} />
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-[#574141]">
                      {job.assignedTo || 'Unassigned'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
