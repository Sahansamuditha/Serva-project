import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Download,
  Eye,
  Cog,
  FileDown,
  TrendingUp,
  BarChart3,
  X,
  XCircle
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
import GenerateReportCard from '../../../components/GenerateReportCard';
import { buildReportData, exportReportToPdf } from '../../../utils/reportGenerator';

const defaultInitialReports = [];

export default function Reports({ onOpenExportModal, setCurrentPage }) {
  const [reportType, setReportType] = useState('Monthly Report');
  const [month, setMonth] = useState('October');
  const [year, setYear] = useState('2026');
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [reportsData, setReportsData] = useState(null);
  const [viewReportModal, setViewReportModal] = useState(null);
  const [isAllReportsModalOpen, setIsAllReportsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportModalType, setExportModalType] = useState('Monthly Maintenance Summary Report');
  const [exportModalStartDate, setExportModalStartDate] = useState('');
  const [exportModalEndDate, setExportModalEndDate] = useState('');
  const [allReportsSearch, setAllReportsSearch] = useState('');
  const [allReportsFilterType, setAllReportsFilterType] = useState('All');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(null);

  const [recentReports, setRecentReports] = useState(() => {
    try {
      const saved = localStorage.getItem('serva_downloaded_reports') || localStorage.getItem('serva_recent_reports');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Remove mock / demo report IDs
          const cleaned = parsed.filter(
            r => r && r.id && !['REP-2026-001', 'REP-2026-002', 'REP-2026-003', 'REP-2026-004', 'REP-2026-005'].includes(r.id)
          );
          localStorage.setItem('serva_downloaded_reports', JSON.stringify(cleaned));
          localStorage.setItem('serva_recent_reports', JSON.stringify(cleaned));
          return cleaned;
        }
      }
    } catch (e) { }
    return [];
  });

  const loadData = async () => {
    try {
      const token = localStorage.getItem('serva_token') || localStorage.getItem('token') || '';
      const res = await fetch('/api/reports', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      setReportsData(data?.data || data);
    } catch (err) {
      console.error('Failed to fetch reports data:', err);
    }
  };

  const handleExportSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const repData = buildReportData({
      reportType: exportModalType,
      startDate: exportModalStartDate,
      endDate: exportModalEndDate,
      allRequests: reportsData?.allRequests || []
    });
    exportReportToPdf(repData);
    setIsExportModalOpen(false);
    setDownloadSuccessToast(`Report "${exportModalType}" downloaded as PDF!`);
    setTimeout(() => setDownloadSuccessToast(null), 4500);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (reportsData?.recentReports && Array.isArray(reportsData.recentReports)) {
      const valid = reportsData.recentReports.filter(
        r => r && r.id && !['REP-2026-001', 'REP-2026-002', 'REP-2026-003', 'REP-2026-004', 'REP-2026-005'].includes(r.id)
      );
      setRecentReports(valid);
      try {
        localStorage.setItem('serva_downloaded_reports', JSON.stringify(valid));
        localStorage.setItem('serva_recent_reports', JSON.stringify(valid));
      } catch (e) { }
    }
  }, [reportsData]);

  // Listen for reports generated in modals or elsewhere
  useEffect(() => {
    const handleNewReport = (e) => {
      const rep = e.detail;
      if (!rep) return;
      setRecentReports(prev => {
        const filtered = prev.filter(r => r.id !== rep.id && !['REP-2026-001', 'REP-2026-002', 'REP-2026-003', 'REP-2026-004', 'REP-2026-005'].includes(r.id));
        const updated = [rep, ...filtered];
        try {
          localStorage.setItem('serva_downloaded_reports', JSON.stringify(updated.slice(0, 50)));
          localStorage.setItem('serva_recent_reports', JSON.stringify(updated.slice(0, 50)));
        } catch (err) { }
        return updated;
      });
    };

    window.addEventListener('serva:report-generated', handleNewReport);
    window.addEventListener('serva:report-downloaded', handleNewReport);
    return () => {
      window.removeEventListener('serva:report-generated', handleNewReport);
      window.removeEventListener('serva:report-downloaded', handleNewReport);
    };
  }, []);

  const recordReport = async (rep) => {
    setRecentReports(prev => {
      const filtered = prev.filter(r => r.id !== rep.id && !['REP-2026-001', 'REP-2026-002', 'REP-2026-003', 'REP-2026-004', 'REP-2026-005'].includes(r.id));
      const updated = [rep, ...filtered];
      try {
        localStorage.setItem('serva_downloaded_reports', JSON.stringify(updated.slice(0, 50)));
        localStorage.setItem('serva_recent_reports', JSON.stringify(updated.slice(0, 50)));
      } catch (e) { }
      return updated;
    });

    try {
      await fetch('/api/reports/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rep)
      });
    } catch (e) {
      console.warn('Record report failed:', e);
    }
  };

  const handleGenerate = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const res = await api.generateReport({ reportType, month, year });
      const now = new Date();
      const newRep = {
        id: res?.report?.id || `REP-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        name: reportType,
        type: reportType,
        period: `${month} ${year}`,
        generatedBy: 'System Administrator',
        generatedDate: now.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'Ready',
        format: 'PDF',
        recordsCount: (reportsData?.allRequests || []).length || 31
      };

      const reportData = buildReportData({
        reportType,
        month,
        year,
        requests: reportsData?.allRequests || []
      });
      exportReportToPdf(reportData);

      recordReport(newRep);
      loadData();
      setDownloadSuccessToast(`Report "${reportType}" (${newRep.id}) generated & saved to history!`);
      setTimeout(() => setDownloadSuccessToast(null), 4500);
    } catch (err) {
      console.error(err);
    }
  };

  const getFilteredReportsData = () => {
    const allReqs = reportsData?.allRequests || [];
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

    const filteredRequests = allReqs.filter(r => {
      if (timeFilter === 'All Time' && !customStartDate && !customEndDate) return true;
      const d = getReqDate(r);
      if (!d) return false;
      if (rangeStart && d < rangeStart) return false;
      if (rangeEnd && d > rangeEnd) return false;
      return true;
    });

    const rawStats = reportsData?.stats || reportsData?.data?.stats || {};
    let pending, scheduled, inProgress, completed, cancelled, totalRequests;

    if (allReqs.length > 0) {
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
      pending = rawStats.pending !== undefined ? rawStats.pending : (((rawStats.pendingRequests || 0) + (rawStats.acceptedRequests || 0)) || 0);
      scheduled = rawStats.scheduledRequests ?? rawStats.scheduled ?? 0;
      inProgress = rawStats.inProgressRequests ?? rawStats.inProgress ?? 0;
      completed = rawStats.completedRequests ?? rawStats.completed ?? 0;
      cancelled = rawStats.cancelledRequests ?? rawStats.cancelled ?? rawStats.rejectedRequests ?? rawStats.rejected ?? 0;
      totalRequests = rawStats.totalRequests ?? rawStats.requests ?? (pending + scheduled + inProgress + completed + cancelled);
    }

    const stats = {
      totalRequests,
      pending,
      scheduled,
      inProgress,
      completed,
      cancelled
    };

    // 1. Dynamic Trend Data based on timeFilter
    let trendData = [];
    if (timeFilter === 'Today') {
      const slots = [
        { label: '12 AM', start: 0, end: 4 },
        { label: '4 AM', start: 4, end: 8 },
        { label: '8 AM', start: 8, end: 12 },
        { label: '12 PM', start: 12, end: 16 },
        { label: '4 PM', start: 16, end: 20 },
        { label: '8 PM', start: 20, end: 24 }
      ];
      const todayY = now.getFullYear();
      const todayM = now.getMonth();
      const todayD = now.getDate();

      const todayReqs = allReqs.filter(r => {
        const d = getReqDate(r);
        return d && d.getFullYear() === todayY && d.getMonth() === todayM && d.getDate() === todayD;
      });

      trendData = slots.map(slot => {
        const matching = todayReqs.filter(r => {
          const d = getReqDate(r);
          const h = d ? d.getHours() : -1;
          return h >= slot.start && h < slot.end;
        });
        const comp = matching.filter(r => (r.status || r.mapped_status || '').toLowerCase() === 'completed').length;
        return {
          month: slot.label,
          requests: matching.length,
          completed: comp
        };
      });
    } else if (timeFilter === 'This Week') {
      const currentDay = now.getDay();
      const distanceToMon = (currentDay + 6) % 7;
      const monday = new Date(now);
      monday.setDate(now.getDate() - distanceToMon);
      monday.setHours(0, 0, 0, 0);

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      trendData = days.map((dayName, idx) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + idx);
        const y = dayDate.getFullYear();
        const m = dayDate.getMonth();
        const d = dayDate.getDate();

        const matching = allReqs.filter(r => {
          const rd = getReqDate(r);
          return rd && rd.getFullYear() === y && rd.getMonth() === m && rd.getDate() === d;
        });
        const comp = matching.filter(r => (r.status || r.mapped_status || '').toLowerCase() === 'completed').length;
        return {
          month: dayName,
          requests: matching.length,
          completed: comp
        };
      });
    } else if (timeFilter === 'This Month') {
      const weeks = [
        { label: 'Week 1', start: 1, end: 7 },
        { label: 'Week 2', start: 8, end: 14 },
        { label: 'Week 3', start: 15, end: 21 },
        { label: 'Week 4', start: 22, end: 28 },
        { label: 'Week 5', start: 29, end: 31 }
      ];
      const monthReqs = allReqs.filter(r => {
        const d = getReqDate(r);
        return d && d.getFullYear() === currentYear && d.getMonth() === currentMonth;
      });

      trendData = weeks.map(w => {
        const matching = monthReqs.filter(r => {
          const d = getReqDate(r);
          const dateNum = d ? d.getDate() : -1;
          return dateNum >= w.start && dateNum <= w.end;
        });
        const comp = matching.filter(r => (r.status || r.mapped_status || '').toLowerCase() === 'completed').length;
        return {
          month: w.label,
          requests: matching.length,
          completed: comp
        };
      });
    } else if (timeFilter === 'Custom Range') {
      const sDate = customStartDate ? new Date(customStartDate + 'T00:00:00') : new Date(now.getFullYear(), now.getMonth(), 1);
      const eDate = customEndDate ? new Date(customEndDate + 'T23:59:59') : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const diffDays = Math.max(1, Math.ceil((eDate - sDate) / (1000 * 60 * 60 * 24)));

      if (diffDays <= 14) {
        const result = [];
        for (let i = 0; i <= diffDays; i++) {
          const cur = new Date(sDate);
          cur.setDate(sDate.getDate() + i);
          if (cur > eDate) break;
          const y = cur.getFullYear();
          const m = cur.getMonth();
          const d = cur.getDate();
          const matching = allReqs.filter(r => {
            const rd = getReqDate(r);
            return rd && rd.getFullYear() === y && rd.getMonth() === m && rd.getDate() === d;
          });
          const comp = matching.filter(r => (r.status || r.mapped_status || '').toLowerCase() === 'completed').length;
          result.push({
            month: cur.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            requests: matching.length,
            completed: comp
          });
        }
        trendData = result.length > 0 ? result : [{ month: 'No Data', requests: 0, completed: 0 }];
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const inRange = allReqs.filter(r => {
          const rd = getReqDate(r);
          return rd && rd >= sDate && rd <= eDate;
        });
        const grouped = {};
        inRange.forEach(r => {
          const rd = getReqDate(r);
          const key = `${rd.getFullYear()}-${rd.getMonth()}`;
          if (!grouped[key]) {
            grouped[key] = {
              month: `${months[rd.getMonth()]} '${String(rd.getFullYear()).slice(-2)}`,
              requests: 0,
              completed: 0
            };
          }
          grouped[key].requests += 1;
          if ((r.status || r.mapped_status || '').toLowerCase() === 'completed') grouped[key].completed += 1;
        });
        const vals = Object.values(grouped);
        trendData = vals.length > 0 ? vals : [{ month: 'No Data', requests: 0, completed: 0 }];
      }
    } else {
      // 'This Year' or 'All Time'
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      trendData = months.map((mName, mIdx) => {
        const matching = filteredRequests.filter(r => {
          const d = getReqDate(r);
          return d && d.getFullYear() === currentYear && d.getMonth() === mIdx;
        });
        const comp = matching.filter(r => (r.status || r.mapped_status || '').toLowerCase() === 'completed').length;
        return {
          month: mName,
          requests: matching.length,
          completed: comp
        };
      });
    }

    // 2. Dynamic Status Donut Data
    const donutData = [
      { name: 'Pending', value: pending, percent: totalRequests > 0 ? Math.round((pending / totalRequests) * 100) : 0, color: '#f59e0b' },
      { name: 'Scheduled', value: scheduled, percent: totalRequests > 0 ? Math.round((scheduled / totalRequests) * 100) : 0, color: '#8b5cf6' },
      { name: 'In Progress', value: inProgress, percent: totalRequests > 0 ? Math.round((inProgress / totalRequests) * 100) : 0, color: '#3b82f6' },
      { name: 'Completed', value: completed, percent: totalRequests > 0 ? Math.round((completed / totalRequests) * 100) : 0, color: '#10b981' },
      { name: 'Cancelled', value: cancelled, percent: totalRequests > 0 ? Math.round((cancelled / totalRequests) * 100) : 0, color: '#ef4444' }
    ];

    // 3. Dynamic Requests by Division Data from filteredRequests & standard institutional divisions
    const standardDivisions = [
      'Information Technology',
      'Civil Engineering Technology',
      'Electrical, Electronic & Telecommunication Engineering Technology',
      'Mechanical Engineering Technology',
      'Polymer & Chemical Engineering Technology',
      'Textile & Clothing Technology',
      'Maritime Studies',
      'Interdisciplinary Studies'
    ];

    const divisionCounts = {};
    standardDivisions.forEach(d => { divisionCounts[d] = 0; });

    filteredRequests.forEach(r => {
      const rawDiv = r.requester_dept || r.division || r.department || r.building;
      if (!rawDiv) return;
      const matched = standardDivisions.find(sd => sd.toLowerCase() === rawDiv.toLowerCase() || rawDiv.toLowerCase().includes(sd.toLowerCase()) || sd.toLowerCase().includes(rawDiv.toLowerCase()));
      if (matched) {
        divisionCounts[matched] = (divisionCounts[matched] || 0) + 1;
      } else {
        divisionCounts[rawDiv] = (divisionCounts[rawDiv] || 0) + 1;
      }
    });

    let divisionData = Object.entries(divisionCounts).map(([name, count]) => ({
      name,
      count
    })).sort((a, b) => b.count - a.count);

    // 4. Dynamic Requests by Category Data from filteredRequests
    const categoryColors = {
      'Cleaning': '#3b82f6',
      'Water': '#06b6d4',
      'Academic': '#8b5cf6',
      'Civil & Structural': '#f59e0b',
      'Civil': '#f59e0b',
      'HVAC': '#10b981',
      'Gardening': '#84cc16',
      'Electrical': '#f59e0b',
      'Electricity': '#f59e0b',
      'Plumbing': '#3b82f6',
      'Carpentry': '#ec4899',
      'Others': '#6b7280',
      'Other': '#6b7280'
    };
    const fallbackColors = ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#6b7280'];

    const categoryCounts = {};
    filteredRequests.forEach(r => {
      const cat = r.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    let categoryPieData = Object.entries(categoryCounts).map(([name, count], index) => {
      const pct = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0;
      return {
        name,
        count,
        percentage: `${pct}%`,
        color: categoryColors[name] || fallbackColors[index % fallbackColors.length]
      };
    }).sort((a, b) => b.count - a.count);

    if (categoryPieData.length === 0) {
      categoryPieData = [{
        name: 'No Data',
        count: 0,
        percentage: '0%',
        color: '#e2e8f0'
      }];
    }

    return {
      stats,
      trendData,
      donutData,
      divisionData,
      categoryPieData,
      totalCenterStat: totalRequests,
      totalCountAll: allReqs.length || totalRequests
    };
  };

  const filtered = getFilteredReportsData();
  const stats = filtered.stats;
  const trendData = filtered.trendData;
  const donutData = filtered.donutData;
  const divisionData = filtered.divisionData;
  const categoryPieData = filtered.categoryPieData;
  const totalCenterStat = filtered.totalCenterStat;
  const totalCountAll = filtered.totalCountAll || stats.totalRequests || 0;

  const supervisors = reportsData?.supervisorPerformance || [
    { id: '14', name: 'Kamal Bandara', totalRequests: 14, completed: 7, department: 'Civil & Plumbing Division', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80' },
    { id: '13', name: 'Sunil Shantha', totalRequests: 9, completed: 5, department: 'Electrical Maintenance Division', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80' },
    { id: '11', name: 'ra fsdgf', totalRequests: 8, completed: 4, department: 'ITUM Central Administration', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80' }
  ];

  const handleDownloadReport = (r) => {
    if (!r) return;
    const cleanId = r.id || `REP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const cleanName = r.name || r.reportName || 'Maintenance Report';

    // Generate clean PDF report from real system requests
    const reportData = buildReportData({
      reportType: r.type || r.reportType || r.name,
      period: r.period || 'October 2026',
      requests: reportsData?.allRequests || []
    });

    exportReportToPdf(reportData);

    const updated = {
      ...r,
      id: cleanId,
      name: cleanName,
      type: r.type || r.reportType || 'Monthly Report',
      period: r.period || 'October 2026',
      generatedBy: r.generatedBy || 'System Administrator',
      generatedDate: new Date().toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      status: 'Ready',
      format: 'PDF',
      recordsCount: (reportsData?.allRequests || []).length || 31
    };

    recordReport(updated);

    setDownloadSuccessToast(`Report "${cleanName}" (${cleanId}) downloaded as PDF!`);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4500);
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
          onClick={onOpenExportModal || (() => setIsExportModalOpen(true))}
          className="flex items-center gap-2 px-5 py-2 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Date Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
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

      {/* Row 1: 6 Stat Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <span className="text-xs font-medium text-slate-500">Scheduled</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.scheduled}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.completed}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Cancelled</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.cancelled}</div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-sm">
            <XCircle className="w-5 h-5" />
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
              <option value="All Time">All Time</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="requests" stroke="#7a1521" strokeWidth={2.5} fill="#fff0ef" dot={{ r: 3, fill: '#7a1521' }} name="Total Requests" />
                <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fill="transparent" dot={{ r: 3, fill: '#10b981' }} name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 mt-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7a1521]"></span>
              <span>Total Requests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-[#10b981]"></span>
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
        <div className="lg:col-span-3">
          <GenerateReportCard
            allRequests={reportsData?.allRequests || reportsData?.data?.allRequests || []}
            jobsList={reportsData?.jobs || reportsData?.jobsList || reportsData?.data?.jobs || []}
          />
        </div>
      </div>

      {/* Row 3: Requests by Division + Requests by Category + Labourer Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Requests by Division */}
        <div className="admin-card p-5">
          <h3 className="font-bold text-sm text-slate-800 mb-4">Requests by Division</h3>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {divisionData.map((b, i) => {
              const maxCount = Math.max(...divisionData.map(d => d.count), 1);
              const barWidth = b.count > 0 ? Math.min(100, Math.round((b.count / maxCount) * 100)) : 0;
              return (
                <div key={i} className="flex items-center justify-between gap-3 text-xs">
                  <span title={b.name} className="text-slate-600 w-44 truncate font-medium">{b.name}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#7a1521] h-full rounded-full transition-all duration-300" style={{ width: `${barWidth}%` }}></div>
                  </div>
                  <span className="font-bold text-slate-800 w-7 text-right">{b.count}</span>
                </div>
              );
            })}
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

        {/* Supervisor Performance */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-800">Supervisor Performance</h3>
            <span className="text-xs text-[#7a1521] font-semibold">{supervisors.length} Supervisors</span>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 flex justify-between pb-2 border-b border-slate-100">
            <span>Supervisor</span>
            <div className="flex gap-4">
              <span className="w-20 text-right">Total Requests</span>
              <span className="w-16 text-right">Completed</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs text-slate-700">
            {supervisors.map((s, i) => (
              <div key={s.id || i} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <img
                      src={s.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">{s.name}</span>
                    <span className="text-[10px] text-slate-400">{s.department || 'Supervisor'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="font-bold text-slate-900 w-20">{s.totalRequests}</span>
                  <span className="font-bold text-emerald-600 w-16">{s.completed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Reports Table */}
      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-sm text-slate-800">Recent Reports</h3>
            {recentReports.length > 0 && (
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {recentReports.length} Downloaded
              </span>
            )}
          </div>
          <button
            onClick={() => setIsAllReportsModalOpen(true)}
            className="text-xs text-[#7a1521] hover:underline font-semibold"
          >
            View All
          </button>
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
              {recentReports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <FileDown className="w-9 h-9 text-slate-300 mb-2 stroke-[1.5]" />
                      <p className="font-semibold text-xs text-slate-700">No Downloaded Reports Yet</p>
                      <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                        Reports you download or export will automatically appear here in your download history.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentReports.slice(0, 10).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#58000f] whitespace-nowrap">{r.id}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{r.name || r.reportName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{r.type || r.reportType}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{r.period}</td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{r.generatedBy}</td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{r.generatedDate}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full text-[11px] border border-emerald-200">
                        {r.status || 'Ready'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewReportModal(r)}
                          className="hover:text-[#58000f] text-slate-500 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(r)}
                          className="hover:text-emerald-700 text-emerald-600 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors font-medium flex items-center gap-1 text-[11px]"
                          title="Download Official PDF"
                        >
                          <Download className="w-4 h-4" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
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
                    setViewReportModal(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Official PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Reports History Modal */}
      {isAllReportsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#58000f] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base leading-tight">All Downloaded & Generated Reports History</h3>
                <p className="text-xs text-red-100 mt-0.5">Complete institutional audit trail of generated maintenance reports</p>
              </div>
              <button
                onClick={() => setIsAllReportsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3 justify-between">
              <input
                type="text"
                placeholder="Search reports by ID, title, or generator..."
                value={allReportsSearch}
                onChange={(e) => setAllReportsSearch(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#7a1521] bg-white"
              />
              <select
                value={allReportsFilterType}
                onChange={(e) => setAllReportsFilterType(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#7a1521] bg-white"
              >
                <option value="All">All Report Types</option>
                <option value="Monthly Report">Monthly Report</option>
                <option value="Division Wise Report">Division Wise Report</option>
                <option value="Supervisor Performance Report">Supervisor Performance Report</option>
                <option value="Category Wise Report">Category Wise Report</option>
              </select>
            </div>

            {/* Modal Table Content */}
            <div className="overflow-y-auto flex-1 p-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-white">
                    <th className="py-2.5 px-3">Report ID</th>
                    <th className="py-2.5 px-3">Report Name</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Period</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {(() => {
                    const filteredList = recentReports.filter((r) => {
                      const matchSearch = (r.name || '').toLowerCase().includes(allReportsSearch.toLowerCase()) || (r.id || '').toLowerCase().includes(allReportsSearch.toLowerCase()) || (r.generatedBy || '').toLowerCase().includes(allReportsSearch.toLowerCase());
                      const matchType = allReportsFilterType === 'All' || (r.type || '').includes(allReportsFilterType);
                      return matchSearch && matchType;
                    });
                    if (filteredList.length === 0) {
                      return (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400">
                            <FileDown className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-xs text-slate-600">No Downloaded Reports Found</p>
                            <p className="text-[11px] text-slate-400 mt-1">Download a report from the dashboard to log it here.</p>
                          </td>
                        </tr>
                      );
                    }
                    return filteredList.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 font-bold text-[#58000f] whitespace-nowrap">{r.id}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">{r.name}</td>
                        <td className="py-3 px-3 text-slate-600">{r.type}</td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.period}</td>
                        <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{r.generatedDate}</td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">
                            {r.status || 'Ready'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => {
                              handleDownloadReport(r);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 px-6">
              <span>Showing {recentReports.length} recorded maintenance reports</span>
              <button
                onClick={() => setIsAllReportsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 bg-white font-medium hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Report Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Export Maintenance Report</h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExportSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Report Type
                </label>
                <select
                  value={exportModalType}
                  onChange={(e) => setExportModalType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
                >
                  <option value="Monthly Maintenance Summary Report">Monthly Maintenance Summary Report</option>
                  <option value="Category-Wise Maintenance Breakdown">Category-Wise Maintenance Breakdown</option>
                  <option value="Division-Wise Maintenance Distribution">Division-Wise Maintenance Distribution</option>
                  <option value="Supervisor Performance & Workload">Supervisor Performance & Workload</option>
                  <option value="Overall Maintenance Performance">Overall Maintenance Performance</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={exportModalStartDate}
                    onChange={(e) => setExportModalStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={exportModalEndDate}
                    onChange={(e) => setExportModalEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Export Format
                </label>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-[#58000f]"></span>
                  <span>PDF Document (.pdf)</span>
                  <span className="text-[10px] text-slate-400 ml-auto font-normal">Official Print / Download</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-[#58000f] hover:bg-[#7a1521] rounded-lg shadow-sm transition-all"
                >
                  Export Report
                </button>
              </div>
            </form>
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
