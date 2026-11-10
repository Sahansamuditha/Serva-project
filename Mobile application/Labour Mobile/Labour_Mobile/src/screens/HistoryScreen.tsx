import React, { useState, useMemo } from 'react';
import { WorkHistoryLog, WorkOrder, LaborerProfile } from '../types';
import { historyDatabase } from '../services/historyDatabase';
import { MonthlyWorkLogPdfModal } from '../components/history/MonthlyWorkLogPdfModal';

interface HistoryScreenProps {
  historyLogs?: WorkHistoryLog[];
  workOrders?: WorkOrder[];
  onSelectOrder?: (order: WorkOrder) => void;
  profile?: LaborerProfile;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  workOrders = [],
  onSelectOrder,
  profile,
}) => {
  // Monthly Summary Dynamic Calculations
  const additionalCompleted = (workOrders || []).filter(
    (w) => w.status === 'Completed' || w.status === 'Signed Off'
  ).length;
  const completedJobs = additionalCompleted;
  const totalJobs = (workOrders || []).length;
  const completionPercentage = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : '100.0';

  // Filter States
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterDrawer, setActiveFilterDrawer] = useState<'none' | 'period' | 'trade' | 'search'>('none');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // PDF Export States
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Merge completed and rejected work orders with any saved history logs
  const combinedLogs: WorkHistoryLog[] = useMemo(() => {
    const dbLogs = historyDatabase.getAllHistoryLogs();
    const historyOrders: WorkHistoryLog[] = (workOrders || [])
      .filter((w) =>
        w.status === 'Completed' ||
        w.status === 'Signed Off' ||
        w.status === 'Rejected' ||
        w.status === 'Cancelled' ||
        Boolean(w.technicianRemarks?.includes('[REJECTED]'))
      )
      .map((w) => {
        const isRej = w.status === 'Rejected' || w.status === 'Cancelled' || Boolean(w.technicianRemarks?.includes('[REJECTED]'));
        const cleanRemarks = (w.technicianRemarks || '').replace('[REJECTED]:', '').trim();
        return {
          id: `HIST-${w.id}`,
          reqCode: w.jobCode || `#${w.id}`,
          title: w.title,
          division: w.department || 'Central Maintenance',
          tradeCategory: w.category || 'General',
          dateLabel: isRej ? 'Declined / Rejected' : (w.dueTime || 'Recently Completed'),
          periodCategory: 'this_month',
          resolvedAt: isRej ? 'Status: Declined by Technician' : `Resolved: ${w.dueTime || 'Completed'}`,
          durationSpent: isRej ? (cleanRemarks ? `Reason: ${cleanRemarks}` : 'Declined') : 'Completed on schedule',
          location: w.location,
          status: isRej ? 'Rejected' : w.status,
          verifierName: isRej ? 'Technician' : 'Maintenance Officer',
          verifierTitle: isRej ? 'Declined by Labourer' : 'Verified & Signed Off',
          remarksSnippet: w.technicianRemarks || (isRej ? 'Job declined by technician' : (w.description || 'Maintenance task completed satisfactorily')),
          photosCount: w.proofPhotoUrl ? 1 : 0,
          photoThumbnails: w.proofPhotoUrl ? [w.proofPhotoUrl] : [],
        };
      });

    const map = new Map<string, WorkHistoryLog>();
    for (const log of [...historyOrders, ...dbLogs]) {
      if (!map.has(log.reqCode)) {
        map.set(log.reqCode, log);
      }
    }
    return Array.from(map.values());
  }, [workOrders]);

  // All detailed records for the Monthly Work Log report table (matching Screenshot 1)
  const allDetailedRecords: WorkHistoryLog[] = useMemo(() => {
    return (workOrders || []).map((w, idx) => {
      const isRej = w.status === 'Rejected' || w.status === 'Cancelled' || Boolean(w.technicianRemarks?.includes('[REJECTED]'));
      const cleanRemarks = (w.technicianRemarks || '').replace('[REJECTED]:', '').trim();
      const rawNum = String(w.id || idx + 1000).replace(/[^0-9]/g, '');
      const reqId = w.id?.startsWith('REQ-') ? w.id : `REQ-${rawNum ? rawNum.padStart(4, '0').slice(-4) : (1600 + idx)}`;
      return {
        id: `REC-${w.id || idx}`,
        reqCode: reqId,
        reqId: reqId,
        title: w.title || 'General Maintenance',
        division: w.department || w.requesterDept || 'Maritime Studies',
        tradeCategory: w.category || 'General',
        issueType: w.category || 'General',
        dateLabel: w.assignedTime || w.dueTime || 'Oct 28, 2026',
        dateStr: w.assignedTime || w.dueTime || 'Oct 28, 2026',
        requesterName: w.requesterName || 'asel senath',
        requesterDept: w.requesterDept || w.department || 'Maritime Studies',
        priority: w.priority ? (w.priority.charAt(0).toUpperCase() + w.priority.slice(1).toLowerCase()) : 'Medium',
        location: w.location || 'Campus Facilities',
        status: isRej ? 'Rejected' : (w.status || 'In Progress'),
        durationSpent: isRej ? (cleanRemarks ? `Reason: ${cleanRemarks}` : 'Declined') : 'Completed on schedule',
        resolvedAt: isRej ? 'Status: Declined by Technician' : `Resolved: ${w.dueTime || 'Completed'}`,
        verifierName: 'Technician',
      };
    });
  }, [workOrders]);

  // Live filter query
  const filteredLogs = useMemo(() => {
    return combinedLogs.filter((item) => {
      if (selectedTrade !== 'all') {
        const itemTrade = (item.tradeCategory || '').toLowerCase();
        const sel = selectedTrade.toLowerCase();
        if (!itemTrade.includes(sel) && !(item.division || '').toLowerCase().includes(sel)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (item.title || '').toLowerCase().includes(q);
        const matchReq = (item.reqCode || '').toLowerCase().includes(q);
        const matchLoc = (item.location || '').toLowerCase().includes(q);
        if (!matchTitle && !matchReq && !matchLoc) return false;
      }
      return true;
    });
  }, [combinedLogs, selectedTrade, searchQuery]);

  const dbStats = historyDatabase.getDatabaseStats();

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSelectedPeriod('all');
    setSelectedTrade('all');
    setSearchQuery('');
    setActiveFilterDrawer('none');
    setToastMessage('Filters reset to All Database Records');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // View Details click handler (Navigates to full Job Details Screen)
  const handleOpenDetails = (log: WorkHistoryLog) => {
    const cleanReq = log.reqCode.replace('#', '');
    const matched = (workOrders || []).find(
      (w) => w.id === log.reqCode || w.id === cleanReq || w.jobCode === log.reqCode
    );

    const slip = historyDatabase.getWorkSlip(log.reqCode) || log.workSlip;
    const audit = historyDatabase.getJobDetailAudit(log.reqCode) || log.detailAudit;

    const orderToOpen: WorkOrder = matched || {
      id: cleanReq,
      jobCode: log.reqCode,
      title: log.title,
      category:
        log.tradeCategory === 'Electrical'
          ? 'ELECTRICAL'
          : log.tradeCategory === 'Plumbing'
          ? 'PLUMBING'
          : log.tradeCategory === 'HVAC'
          ? 'HVAC'
          : 'GENERAL',
      description:
        slip?.summaryOfWork ||
        audit?.reportedIssue ||
        log.remarksSnippet ||
        'Completed maintenance task executed on campus facilities.',
      department: slip?.requesterDept || log.division,
      location: log.location,
      subLocation: slip?.subLocation,
      priority: slip?.priority || audit?.severity || 'MEDIUM',
      status: 'Completed',
      assignedTime: slip?.timeStarted || '08:30 AM',
      dueTime: log.resolvedAt || 'Completed',
      requesterName: slip?.requesterName || 'Facilities & Campus Events Management',
      requesterDept: slip?.requesterDept || log.division,
      requesterExt: slip?.requesterContact || '+94 77 149 0016',
      reportedPhotoUrl: log.photoThumbnails?.[0] || slip?.photoThumbnails?.[0],
      reportedPhotoTimestamp: log.dateLabel || 'Completed',
      proofPhotoUrl:
        log.photoThumbnails?.[0] ||
        slip?.photoThumbnails?.[0] ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAm84UGWK9BoQ1beXiCNHf4gcXpMfp6DWzoIVKvJQKIQeNllURyL_usxq9rDcrxdaqILWGtuwphTz69n3xCo8ek7nAKYlfQbqOVUqJC7Elcrcewx0GA6dmHj75fbMS0X2dPQvcK6kboRDq6X0lQYsZU_dKjg7OEHWz4m6cggssJ5FGtN9bEAC0fSvVd-fV7QOoEwF26LCzf0m19Q5SWey0p5j1dg7o2oZJam_THQ7oPvst0lKRQEgVA',
      proofPhotoTimestamp: log.resolvedAt,
      technicianRemarks:
        log.remarksSnippet ||
        slip?.summaryOfWork ||
        'Task completed satisfactorily according to technical specifications.',
      partsUsed: slip?.partsUsed?.map((p) => `${p.name} (${p.partNumber})`) || [],
      verifierName: log.verifierName || slip?.verifierName,
      verifierRole: log.verifierTitle || slip?.verifierRole,
    };

    if (onSelectOrder) {
      onSelectOrder(orderToOpen);
    }
  };

  // Open Official PDF Preview & Download Modal
  const handleDownloadPdf = () => {
    setIsPdfModalOpen(true);
  };

  const getDivisionIcon = (division: string, tradeCategory?: string) => {
    const text = (tradeCategory || division).toLowerCase();
    if (text.includes('elect')) return 'bolt';
    if (text.includes('plumb')) return 'plumbing';
    if (text.includes('hvac') || text.includes('ac')) return 'mode_fan';
    return 'handyman';
  };

  const tradeOptions = useMemo(() => {
    const counts: Record<string, number> = {
      all: combinedLogs.length,
      Electrical: 0,
      Plumbing: 0,
      HVAC: 0,
      General: 0,
    };
    for (const log of combinedLogs) {
      const tc = (log.tradeCategory || log.division || '').toLowerCase();
      if (tc.includes('elect')) counts.Electrical++;
      else if (tc.includes('plumb')) counts.Plumbing++;
      else if (tc.includes('hvac') || tc.includes('ac')) counts.HVAC++;
      else counts.General++;
    }
    return [
      { id: 'all', label: 'All Trades', count: counts.all, icon: 'handyman' },
      { id: 'Electrical', label: 'Electrical', count: counts.Electrical, icon: 'bolt' },
      { id: 'Plumbing', label: 'Plumbing', count: counts.Plumbing, icon: 'plumbing' },
      { id: 'HVAC', label: 'HVAC Systems', count: counts.HVAC, icon: 'mode_fan' },
      { id: 'General', label: 'General Maint', count: counts.General, icon: 'build' },
    ];
  }, [combinedLogs]);

  const periodOptions = [
    { id: 'all', label: 'All Periods', desc: 'All history records', icon: 'all_inclusive' },
    { id: 'this_month', label: 'This Month', desc: 'Current month tasks', icon: 'calendar_today' },
    { id: 'yesterday', label: 'Recent', desc: 'Recent tasks', icon: 'history' },
  ];

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto">
      {/* Header Description */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-[#1e293b] tracking-tight">
            Work History & Audit Log
          </h1>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">
          Review completed campus work orders, verified job slips, and your performance benchmarks.
        </p>
      </div>

      {/* Performance Summary Banner */}
      <div className="relative overflow-hidden bg-[#7a1521] text-white rounded-xl p-4 shadow-sm border border-[#7a1521]">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#58000f]/40 pointer-events-none blur-xl" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffb3b2] text-[20px]">insights</span>
            <span className="text-base font-bold text-white">Performance Summary</span>
          </div>
          <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-md">
            ITUM Moratuwa
          </span>
        </div>

        {/* 3 Metric Columns: Total Jobs, Completed Jobs, Completion Percentage */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#ffb3b2]">Total Jobs</span>
              <span className="material-symbols-outlined text-[14px] text-[#ffb3b2]">assignment</span>
            </div>
            <div>
              <span className="text-[24px] font-bold leading-tight block text-white">{totalJobs}</span>
              <span className="text-[9px] text-white/80 uppercase tracking-wider">Total</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#ffb3b2]">Completed</span>
              <span className="material-symbols-outlined text-[14px] text-[#ffb3b2]">task_alt</span>
            </div>
            <div>
              <span className="text-[24px] font-bold leading-tight block text-white">{completedJobs}</span>
              <span className="text-[9px] text-white/80 uppercase tracking-wider">Completed</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#ffb3b2]">Percentage</span>
              <span className="material-symbols-outlined text-[14px] text-[#ffb3b2]">percent</span>
            </div>
            <div>
              <span className="text-[24px] font-bold leading-tight block text-white">
                {completionPercentage}<span className="text-xs font-semibold">%</span>
              </span>
              <span className="text-[9px] text-white/80 uppercase tracking-wider">Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH BAR & FILTER TOGGLE */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {/* Search Input Box */}
          <div className="flex-1 relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-[#7a1521] text-[20px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history, ticket, trade, location..."
              className="w-full h-11 pl-10 pr-9 rounded-2xl bg-white border border-[#e2e8f0] text-xs font-medium text-[#1e293b] placeholder:text-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#7a1521] shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 w-5 h-5 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#1e293b] flex items-center justify-center transition-colors cursor-pointer"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className={`relative h-11 px-3.5 rounded-2xl flex items-center justify-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer ${
              isFilterOpen || selectedTrade !== 'all' || selectedPeriod !== 'all'
                ? 'bg-[#7a1521] text-white shadow-sm ring-2 ring-[#7a1521]/20'
                : 'bg-white border border-[#e2e8f0] text-[#7a1521] hover:bg-[#fff0ef]'
            }`}
            title="Toggle Filter Options"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isFilterOpen ? 'tune' : 'filter_list'}
            </span>
            {(selectedTrade !== 'all' || selectedPeriod !== 'all') && (
              <span
                className={`w-5 h-5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                  isFilterOpen || selectedTrade !== 'all' || selectedPeriod !== 'all'
                    ? 'bg-white text-[#7a1521]'
                    : 'bg-[#7a1521] text-white'
                }`}
              >
                {(selectedTrade !== 'all' ? 1 : 0) + (selectedPeriod !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* Active Filter Pills (Shown when filter drawer is closed) */}
        {!isFilterOpen && (selectedTrade !== 'all' || selectedPeriod !== 'all' || searchQuery) && (
          <div className="flex items-center gap-1.5 flex-wrap px-1 text-[11px] animate-in fade-in duration-150">
            <span className="text-[#64748b] font-medium text-[10px]">Filtered by:</span>
            {selectedTrade !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#7a1521] text-white font-bold text-[10px]">
                {selectedTrade}
                <button
                  type="button"
                  onClick={() => setSelectedTrade('all')}
                  className="hover:text-red-200 ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            {selectedPeriod !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#7a1521] text-white font-bold text-[10px]">
                {selectedPeriod === 'yesterday' ? 'Yesterday' : selectedPeriod === 'this_month' ? 'This Month' : selectedPeriod}
                <button
                  type="button"
                  onClick={() => setSelectedPeriod('all')}
                  className="hover:text-red-200 ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fff0ef] text-[#7a1521] border border-[#ffe9e8] font-bold text-[10px]">
                "{searchQuery}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-[#58000f] ml-0.5 cursor-pointer"
                >
                  ✕
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[10px] text-[#7a1521] font-bold hover:underline ml-auto cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}

        {/* EXPANDABLE FILTER OPTIONS PANEL */}
        {isFilterOpen && (
          <div className="bg-white rounded-2xl p-3.5 border border-[#e2e8f0]/80 shadow-sm flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Filter Header Strip */}
            <div className="flex items-center justify-between pb-1 border-b border-[#f1f5f9]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#7a1521]">tune</span>
                <span className="text-xs font-bold text-[#1e293b] uppercase tracking-wider">
                  Filter Database Logs
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fff0ef] text-[#7a1521] font-bold border border-[#ffe9e8]">
                  {filteredLogs.length} of {dbStats.totalRecords}
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-bold text-[#7a1521] hover:underline flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                title="Clear all filters"
              >
                <span className="material-symbols-outlined text-[14px]">refresh</span>
                <span>Reset All</span>
              </button>
            </div>

            {/* Toast Feedback Notification */}
            {toastMessage && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                <span>{toastMessage}</span>
              </div>
            )}

            {/* 1. TRADE FILTER PILLS */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                Filter by Trade / Division:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {tradeOptions.map((trade) => {
                  const isActive = selectedTrade.toLowerCase() === trade.id.toLowerCase();
                  return (
                    <button
                      key={trade.id}
                      type="button"
                      onClick={() => setSelectedTrade(trade.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-[#7a1521] text-white shadow-sm ring-2 ring-[#7a1521]/30'
                          : 'bg-[#fff0ef] text-[#475569] hover:bg-[#ffe9e8] hover:text-[#1e293b]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{trade.icon}</span>
                      <span>{trade.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                          isActive ? 'bg-white/25 text-white' : 'bg-black/5 text-[#7a1521]'
                        }`}
                      >
                        {trade.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. PERIOD FILTER PILLS */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                Filter by Time Period:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {periodOptions.map((period) => {
                  const isActive = selectedPeriod === period.id;
                  return (
                    <button
                      key={period.id}
                      type="button"
                      onClick={() => setSelectedPeriod(period.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 cursor-pointer ${
                        isActive
                          ? 'bg-[#7a1521] text-white shadow-sm ring-2 ring-[#7a1521]/30'
                          : 'bg-[#fff0ef] text-[#475569] hover:bg-[#ffe9e8] hover:text-[#1e293b]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{period.icon}</span>
                      <span>{period.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE FILTER SUMMARY BADGES */}
            {(selectedTrade !== 'all' || selectedPeriod !== 'all') && (
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-[#f1f5f9] text-[11px]">
                <span className="text-[#475569] font-medium">Active:</span>

                {selectedTrade !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#7a1521] text-white font-bold">
                    Trade: {selectedTrade}
                    <button
                      type="button"
                      onClick={() => setSelectedTrade('all')}
                      className="hover:text-red-200 ml-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}

                {selectedPeriod !== 'all' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#7a1521] text-white font-bold">
                    Period: {selectedPeriod}
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('all')}
                      className="hover:text-red-200 ml-1 text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#7a1521] hover:underline font-bold ml-auto cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* HISTORY FEED ITEMS */}
      <div className="flex flex-col gap-3">
        {combinedLogs.length === 0 ? (
          /* Empty State when no completed jobs exist in system yet */
          <div className="bg-white rounded-2xl p-6 text-center border border-[#e2e8f0]/60 shadow-sm flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-[#fff0ef] text-[#7a1521] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">task_alt</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1e293b]">No Completed Work Records</h3>
              <p className="text-xs text-[#475569] mt-0.5 max-w-xs">
                Completed work orders and verified maintenance tasks will automatically appear here once signed off.
              </p>
            </div>
          </div>
        ) : filteredLogs.length === 0 ? (
          /* Empty State when no results match active filters */
          <div className="bg-white rounded-2xl p-6 text-center border border-[#e2e8f0]/60 shadow-sm flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-[#fff0ef] text-[#7a1521] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">filter_alt_off</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#1e293b]">No Logs Matching Filters</h3>
              <p className="text-xs text-[#475569] mt-0.5">
                No database records match your selected trade ({selectedTrade}) or period ({selectedPeriod}).
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-[#7a1521] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#58000f] transition-all"
            >
              Reset Filters to All Records
            </button>
          </div>
        ) : (
          /* Dynamic Log Feed Cards */
          filteredLogs.map((log) => {
            const iconName = getDivisionIcon(log.division, log.tradeCategory);

            return (
              <div
                key={log.id}
                className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0]/40 flex flex-col gap-2.5 hover:border-[#ba1a1a]/40 transition-colors"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#fff0ef] flex items-center justify-center shrink-0 text-[#7a1521]">
                      <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-[#1e293b] truncate leading-tight">
                        {log.title}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs font-bold text-[#7a1521]">{log.reqCode}</span>
                        <span className="text-xs text-[#64748b]">•</span>
                        <span className="text-xs text-[#475569]">{log.division}</span>
                        {log.dateLabel && (
                          <>
                            <span className="text-xs text-[#64748b]">•</span>
                            <span className="text-[11px] text-[#64748b] font-medium">{log.dateLabel}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {log.status === 'Rejected' || log.status === 'Cancelled' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fee2e2] text-[#b91c1c] text-[11px] font-bold shrink-0 border border-[#fca5a5]">
                      <span className="material-symbols-outlined text-[14px]">cancel</span>
                      {log.status}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      {log.status}
                    </span>
                  )}
                </div>

                {/* Location and Timing info */}
                <div className="flex flex-col gap-1 text-xs text-[#475569]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                      location_on
                    </span>
                    <span className="truncate">{log.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#64748b] shrink-0">
                      schedule
                    </span>
                    <span>
                      {log.resolvedAt} <span className="text-[#64748b]">({log.durationSpent})</span>
                    </span>
                  </div>
                </div>

                {/* Verifier Badge */}
                {log.verifierName && (
                  <div className="bg-[#fff0ef] rounded-lg p-2.5 flex items-center gap-2 mt-0.5">
                    <div className="w-7 h-7 rounded-full bg-[#ffdad9] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-[#7a1521]">
                        {log.status === 'Rejected' || log.status === 'Cancelled' ? 'person_cancel' : 'verified_user'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#1e293b] block truncate">
                        {log.status === 'Rejected' || log.status === 'Cancelled' ? `Declined by ${log.verifierName}` : `Verified by ${log.verifierName}`}
                      </span>
                      <span className="text-[10px] text-[#475569] truncate block">
                        {log.verifierTitle || (log.status === 'Rejected' ? 'Labourer Declined Dispatch' : 'Digital Signature Authenticated')}
                      </span>
                    </div>
                  </div>
                )}

                {/* Remarks snippet if any */}
                {log.remarksSnippet && (
                  <p className="text-[11px] text-[#475569] bg-[#f8fafc] px-2.5 py-1.5 rounded-lg border border-[#e2e8f0]">
                    <span className="font-semibold text-[#7a1521]">Remarks: </span>
                    {log.remarksSnippet}
                  </p>
                )}

                {/* Card Actions Footer with single View Details button */}
                <div className="pt-2 flex items-center justify-between border-t border-[#f1f5f9]">
                  <span className="text-xs text-[#64748b] font-medium flex items-center gap-1">
                    {log.status === 'Rejected' || log.status === 'Cancelled' ? (
                      <>
                        <span className="material-symbols-outlined text-[15px] text-rose-600">block</span>
                        <span>Job Declined by Labourer</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[15px] text-emerald-600">verified</span>
                        <span>
                          {log.photosCount && log.photosCount > 0
                            ? `${log.photosCount} Photos Attached`
                            : 'Completed & Verified'}
                        </span>
                      </>
                    )}
                  </span>

                  {/* SINGLE PRIMARY BUTTON: VIEW DETAILS */}
                  <button
                    type="button"
                    onClick={() => handleOpenDetails(log)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                    title="View Complete Job Details"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PDF Export Action */}
      <div className="pt-2 pb-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isCompilingPdf}
          className="w-full py-3.5 px-4 bg-[#7a1521] hover:bg-[#58000f] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-60"
        >
          {isCompilingPdf ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
              <span>Compiling August PDF Audit Log...</span>
            </>
          ) : pdfDownloaded ? (
            <>
              <span className="material-symbols-outlined text-[20px] text-emerald-300">task_alt</span>
              <span>August PDF Downloaded Successfully</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
              <span>Download Monthly Work Log PDF</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1 text-[#64748b]">
          <span className="material-symbols-outlined text-[15px]">lock_clock</span>
          <span className="text-[11px] font-medium">
            Official record verified by Central Facility Auditing
          </span>
        </div>
      </div>

      {/* Official Monthly Work Log PDF Preview & Download Modal */}
      <MonthlyWorkLogPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        logs={allDetailedRecords.length > 0 ? allDetailedRecords : (filteredLogs.length > 0 ? filteredLogs : combinedLogs)}
        profile={profile}
        stats={{
          total: totalJobs,
          completed: completedJobs,
          percentage: completionPercentage,
        }}
      />
    </div>
  );
};
