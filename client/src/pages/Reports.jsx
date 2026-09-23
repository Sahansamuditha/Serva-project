import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  Cog,
  FileDown,
  TrendingUp,
  BarChart3,
  X
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
import { api } from '../services/api';

export default function Reports({ onOpenExportModal }) {
  const [reportType, setReportType] = useState('Monthly Report');
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState('2026');
  const [timeFilter, setTimeFilter] = useState('Last 6 Months');
  const [reportsData, setReportsData] = useState(null);
  const [viewReportModal, setViewReportModal] = useState(null);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null);

  const loadData = async () => {
    try {
      const data = await api.getReports();
      setReportsData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await api.generateReport({ reportType, month, year });
      loadData();
      alert(`Generated ${reportType} for ${month} ${year}`);
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredReportsData = () => {
    switch (timeFilter) {
      case 'This Year':
        return {
          stats: {
            totalRequests: 306,
            pending: 14,
            inProgress: 32,
            overdue: 7,
            completed: 253
          },
          trendData: reportsData?.overviewData || [
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
            { name: 'Pending', value: 14, percent: 5, color: '#f59e0b' },
            { name: 'In Progress', value: 32, percent: 10, color: '#3b82f6' },
            { name: 'Completed', value: 253, percent: 83, color: '#10b981' },
            { name: 'Overdue', value: 7, percent: 2, color: '#ef4444' }
          ],
          totalCenterStat: 306
        };

      case 'Last Year':
        return {
          stats: {
            totalRequests: 412,
            pending: 0,
            inProgress: 0,
            overdue: 2,
            completed: 410
          },
          trendData: [
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
            { name: 'Pending', value: 0, percent: 0, color: '#f59e0b' },
            { name: 'In Progress', value: 0, percent: 0, color: '#3b82f6' },
            { name: 'Completed', value: 410, percent: 99, color: '#10b981' },
            { name: 'Overdue', value: 2, percent: 1, color: '#ef4444' }
          ],
          totalCenterStat: 412
        };

      case 'Last 6 Months':
      default:
        return {
          stats: reportsData?.stats || {
            totalRequests: 251,
            pending: 10,
            inProgress: 24,
            overdue: 4,
            completed: 213
          },
          trendData: [
            { month: 'Mar', requests: 28, completed: 25 },
            { month: 'Apr', requests: 42, completed: 38 },
            { month: 'May', requests: 38, completed: 35 },
            { month: 'Jun', requests: 45, completed: 42 },
            { month: 'Jul', requests: 50, completed: 48 },
            { month: 'Aug', requests: 48, completed: 46 }
          ],
          donutData: reportsData?.requestsByStatus || [
            { name: 'Pending', value: 10, percent: 4, color: '#f59e0b' },
            { name: 'In Progress', value: 24, percent: 10, color: '#3b82f6' },
            { name: 'Completed', value: 213, percent: 84, color: '#10b981' },
            { name: 'Overdue', value: 4, percent: 2, color: '#ef4444' }
          ],
          totalCenterStat: 251
        };
    }
  };

  const filtered = getFilteredReportsData();
  const stats = filtered.stats;
  const trendData = filtered.trendData;
  const donutData = filtered.donutData;
  const totalCenterStat = filtered.totalCenterStat;

  const buildingData = reportsData?.requestsByBuilding || [
    { name: 'Computer Center', count: 28 },
    { name: 'Science Building', count: 24 },
    { name: 'Library', count: 18 },
    { name: 'Engineering Build...', count: 16 },
    { name: 'Admin Building', count: 12 },
    { name: 'Academic Building', count: 10 },
    { name: 'Other', count: 20 }
  ];

  const categoryPieData = reportsData?.requestsByCategory || [
    { name: 'Electrical', count: 30, percentage: '23%', color: '#f59e0b' },
    { name: 'Plumbing', count: 25, percentage: '20%', color: '#3b82f6' },
    { name: 'HVAC', count: 22, percentage: '17%', color: '#10b981' },
    { name: 'Civil', count: 18, percentage: '14%', color: '#8b5cf6' },
    { name: 'Carpentry', count: 15, percentage: '12%', color: '#ec4899' },
    { name: 'Other', count: 18, percentage: '14%', color: '#6b7280' }
  ];

  const labourers = reportsData?.labourerPerformances || [
    { name: 'Kasun Perera', jobsCompleted: 18, avgTime: '2h 10m' },
    { name: 'Nimal Fernando', jobsCompleted: 15, avgTime: '2h 35m' },
    { name: 'Saman Wijesiri', jobsCompleted: 14, avgTime: '2h 50m' },
    { name: 'Tharindu Silva', jobsCompleted: 12, avgTime: '3h 05m' },
    { name: 'Chaminda Jayasena', jobsCompleted: 11, avgTime: '3h 20m' }
  ];

  const recentReports = reportsData?.recentReports || [];

  const handleDownloadReport = (r) => {
    if (!r) return;
    const cleanId = r.id || 'REP-0001';
    const cleanName = r.name || 'Maintenance Report';
    
    // Construct CSV content for spreadsheet download
    const csvLines = [
      '================================================',
      'SERVA MAINTENANCE MANAGEMENT SYSTEM - OFFICIAL REPORT',
      '================================================',
      `Report ID,${cleanId}`,
      `Report Name,${cleanName}`,
      `Report Type,${r.type || 'Monthly'}`,
      `Period,${r.period || 'August 2026'}`,
      `Generated By,${r.generatedBy || 'Admin'}`,
      `Generated Date,${r.generatedDate || new Date().toLocaleDateString()}`,
      `Status,${r.status || 'Completed'}`,
      '',
      '--- SUMMARY STATISTICS ---',
      `Total Requests,${stats.totalRequests}`,
      `Pending,${stats.pending}`,
      `In Progress,${stats.inProgress}`,
      `Overdue,${stats.overdue}`,
      `Completed,${stats.completed}`,
      `Downloaded Date,${new Date().toLocaleString()}`,
      '================================================'
    ];

    const content = csvLines.join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = `${cleanId}_${cleanName.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessToast(`Report "${cleanName}" (${cleanId}) downloaded as CSV!`);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Title & Top Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">View detailed reports and analytics about maintenance activities.</p>
        </div>

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-2 px-5 py-2 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Row 1: 5 Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Requests</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalRequests}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Pending</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">In Progress</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.inProgress}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Overdue</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.overdue}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-sm">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.completed}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Row 2: Trend Chart + Status Donut + Generate Report */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Chart */}
        <div className="lg:col-span-6 admin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800">Maintenance Requests Trend</h3>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2.5 py-1 text-slate-600 bg-white focus:outline-none focus:border-[#7a1521] cursor-pointer"
            >
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="This Year">This Year</option>
              <option value="Last Year">Last Year</option>
            </select>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 60]} />
                <Tooltip />
                <Area type="monotone" dataKey="requests" stroke="#7a1521" strokeWidth={2.5} fill="#fff0ef" dot={{ r: 3, fill: '#7a1521' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7a1521]"></span>
              <span>Total Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[#7a1521]"></span>
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Requests by Status Donut */}
        <div className="lg:col-span-3 admin-card p-5 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-800 mb-1">Requests by Status</h3>
          <div className="relative flex items-center justify-center my-2">
            <svg width="160" height="160" viewBox="0 0 160 160" className="overflow-visible">
              {(() => {
                const total = donutData.reduce((acc, curr) => acc + (curr.value || 0), 0);
                const C = 2 * Math.PI * 48; // circumference for r=48
                let cumulative = 0;

                if (total <= 0) {
                  return (
                    <circle cx="80" cy="80" r="48" fill="none" stroke="#e2e8f0" strokeWidth="18" />
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
                      cx="80"
                      cy="80"
                      r="48"
                      fill="none"
                      stroke={item.color}
                      strokeWidth="18"
                      strokeDasharray={dasharray}
                      strokeDashoffset={dashoffset}
                      style={{ transformOrigin: '80px 80px', transform: 'rotate(-90deg)' }}
                      className="transition-all duration-500 ease-out"
                    />
                  );
                });
              })()}
              <text x="80" y="75" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a">
                {totalCenterStat}
              </text>
              <text x="80" y="93" textAnchor="middle" fontSize="10" fontWeight="600" fill="#64748b">
                Total
              </text>
            </svg>
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            {donutData.map((item, i) => {
              const val = item.value || 0;
              const pct = totalCenterStat > 0 ? Math.round((val / totalCenterStat) * 100) : 0;
              return (
                <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50/80 border border-slate-100 text-[11px] text-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: item.color }}></span>
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    <span className="font-extrabold text-slate-900">{val}</span> <span className="text-slate-600 font-semibold">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Generate Report Card */}
        <div className="lg:col-span-3 admin-card p-5 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-800 mb-2">Generate Report</h3>

          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Report Type</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
              >
                <option value="Monthly Report">Monthly Report</option>
                <option value="Building Wise Report">Building Wise Report</option>
                <option value="Category Wise Report">Category Wise Report</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Month</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
                >
                  <option value="August">August</option>
                  <option value="July">July</option>
                  <option value="June">June</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Cog className="w-3.5 h-3.5" />
              <span>Generate Report</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadReport({
                id: `REP-GEN-${Date.now().toString().slice(-4)}`,
                name: `${reportType}`,
                type: reportType,
                period: `${month} ${year}`,
                generatedBy: 'Admin',
                generatedDate: new Date().toLocaleDateString(),
                status: 'Completed'
              })}
              className="w-full py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Download Report Summary</span>
            </button>
          </form>
        </div>
      </div>

      {/* Row 3: Requests by Building + Requests by Category + Labourer Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Requests by Building */}
        <div className="admin-card p-5">
          <h3 className="font-bold text-sm text-slate-800 mb-4">Requests by Building</h3>
          <div className="space-y-3">
            {buildingData.map((b, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-600 w-32 truncate">{b.name}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-[#7a1521] h-full rounded-full" style={{ width: `${(b.count / 30) * 100}%` }}></div>
                </div>
                <span className="font-bold text-slate-800 w-6 text-right">{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requests by Category */}
        <div className="admin-card p-5 flex flex-col justify-between">
          <h3 className="font-bold text-sm text-slate-800 mb-2">Requests by Category</h3>
          <div className="flex items-center justify-center py-2">
            <div className="w-36 h-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryPieData} cx="50%" cy="50%" outerRadius={60} dataKey="count">
                    {categoryPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-slate-600 pt-2 border-t border-slate-100">
            {categoryPieData.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                <span>{c.name} {c.count} ({c.percentage})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Labourer Performance */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800">Labourer Performance</h3>
            <button className="text-xs text-[#7a1521] hover:underline font-medium">View All</button>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 flex justify-between pb-2 border-b border-slate-100">
            <span>Labourer</span>
            <div className="flex gap-6">
              <span>Jobs Completed</span>
              <span>Avg. Time</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs text-slate-700">
            {labourers.map((l, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                      alt={l.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-medium text-slate-800">{l.name}</span>
                </div>
                <div className="flex items-center gap-10 text-right">
                  <span className="font-bold text-slate-900 w-8">{l.jobsCompleted}</span>
                  <span className="text-slate-500 w-12">{l.avgTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Reports Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-800">Recent Reports</h3>
          <button className="text-xs text-[#7a1521] hover:underline font-medium">View All</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Report ID</th>
                <th className="py-3 px-4">Report Name</th>
                <th className="py-3 px-4">Report Type</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4">Generated By</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {recentReports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#58000f]">{r.id}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">{r.name}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.type}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.period}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.generatedBy}</td>
                  <td className="py-3.5 px-4 text-slate-500">{r.generatedDate}</td>
                  <td className="py-3.5 px-4">
                    <span className="bg-emerald-50 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full text-[11px]">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-3 text-slate-400">
                      <button
                        onClick={() => setViewReportModal(r)}
                        className="hover:text-[#58000f] text-slate-500 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadReport(r)}
                        className="hover:text-[#58000f] text-slate-500 p-1 rounded hover:bg-slate-100 transition-colors"
                        title="Download Report File"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Report Modal */}
      {viewReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#58000f] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-red-200" />
                <div>
                  <h3 className="font-bold text-sm leading-tight">{viewReportModal.name}</h3>
                  <p className="text-[11px] text-red-200 font-mono">ID: {viewReportModal.id}</p>
                </div>
              </div>
              <button
                onClick={() => setViewReportModal(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Report Type</span>
                  <span className="font-semibold text-slate-800">{viewReportModal.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Time Period</span>
                  <span className="font-semibold text-slate-800">{viewReportModal.period}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Generated By</span>
                  <span className="font-semibold text-slate-800">{viewReportModal.generatedBy}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] font-medium">Generated Date</span>
                  <span className="font-semibold text-slate-800">{viewReportModal.generatedDate}</span>
                </div>
              </div>

              {/* Status & Summary Stats */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">Report Metrics Summary</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="block text-slate-500 text-[10px] font-semibold">Total Requests</span>
                    <span className="text-lg font-black text-blue-700">{stats.totalRequests}</span>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <span className="block text-slate-500 text-[10px] font-semibold">Completed</span>
                    <span className="text-lg font-black text-emerald-700">{stats.completed}</span>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                    <span className="block text-slate-500 text-[10px] font-semibold">Pending / Active</span>
                    <span className="text-lg font-black text-amber-700">{stats.pending + stats.inProgress}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setViewReportModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDownloadReport(viewReportModal);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Report (.txt)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Floating Success Download Toast */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#58000f] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-red-900/30 animate-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide">{downloadSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
