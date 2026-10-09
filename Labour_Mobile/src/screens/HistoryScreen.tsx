import React, { useState, useMemo } from 'react';
import { WorkHistoryLog, WorkSlip, JobDetailAudit } from '../types';
import { historyDatabase } from '../services/historyDatabase';
import { WorkSlipModal } from '../components/history/WorkSlipModal';
import { JobDetailsAuditModal } from '../components/history/JobDetailsAuditModal';

interface HistoryScreenProps {
  historyLogs?: WorkHistoryLog[];
  onViewWorkSlip?: (log: WorkHistoryLog) => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onViewWorkSlip,
}) => {
  // Filter States
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilterDrawer, setActiveFilterDrawer] = useState<'none' | 'period' | 'trade' | 'search'>('none');

  // Modals States
  const [activeWorkSlip, setActiveWorkSlip] = useState<WorkSlip | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState<boolean>(false);

  const [activeJobAudit, setActiveJobAudit] = useState<JobDetailAudit | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  // PDF Export States
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live filter query
  const filteredLogs = useMemo(() => {
    return historyDatabase.filterLogs({
      trade: selectedTrade,
      period: selectedPeriod,
      searchQuery: searchQuery,
    });
  }, [selectedTrade, selectedPeriod, searchQuery]);

  const dbStats = historyDatabase.getDatabaseStats();

  // Reset Filters Handler
  const handleResetFilters = () => {
    setSelectedPeriod('all');
    setSelectedTrade('all');
    setSearchQuery('');
    setActiveFilterDrawer('none');
    setToastMessage('Filters reset to All Database Records (7 Total)');
    setTimeout(() => setToastMessage(null), 2500);
  };

  // View Work Slip click handler (Form ITUM-MO-402 completion voucher)
  const handleOpenSlip = (log: WorkHistoryLog) => {
    const slip = historyDatabase.getWorkSlip(log.reqCode) || log.workSlip || null;
    setActiveWorkSlip(slip);
    setIsSlipModalOpen(true);

    if (onViewWorkSlip) {
      onViewWorkSlip(log);
    }
  };

  // View Details click handler (Engineering Diagnostics & Technical Audit)
  const handleOpenDetails = (log: WorkHistoryLog) => {
    const audit = historyDatabase.getJobDetailAudit(log.reqCode) || log.detailAudit || null;
    setActiveJobAudit(audit);
    setIsAuditModalOpen(true);
  };

  // PDF Compilation Simulation
  const handleDownloadPdf = () => {
    setIsCompilingPdf(true);
    setTimeout(() => {
      setIsCompilingPdf(false);
      setPdfDownloaded(true);
      setTimeout(() => setPdfDownloaded(false), 3000);
    }, 1500);
  };

  const getDivisionIcon = (division: string, tradeCategory?: string) => {
    const text = (tradeCategory || division).toLowerCase();
    if (text.includes('elect')) return 'bolt';
    if (text.includes('plumb')) return 'plumbing';
    if (text.includes('hvac') || text.includes('ac')) return 'mode_fan';
    return 'handyman';
  };

  const tradeOptions = [
    { id: 'all', label: 'All Trades', count: 7, icon: 'handyman' },
    { id: 'Electrical', label: 'Electrical', count: 2, icon: 'bolt' },
    { id: 'Plumbing', label: 'Plumbing', count: 2, icon: 'plumbing' },
    { id: 'HVAC', label: 'HVAC Systems', count: 2, icon: 'mode_fan' },
    { id: 'General', label: 'General Maint', count: 1, icon: 'build' },
  ];

  const periodOptions = [
    { id: 'all', label: 'All Periods', desc: 'All August records', icon: 'all_inclusive' },
    { id: 'this_month', label: 'This Month', desc: 'August 2026', icon: 'calendar_today' },
    { id: 'yesterday', label: 'Yesterday', desc: 'Aug 21 tasks', icon: 'history' },
    { id: 'earlier', label: 'Earlier', desc: 'Aug 05 tasks', icon: 'schedule' },
  ];

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto">
      {/* Header Description */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-center justify-between">
          <h1 className="text-[22px] font-bold text-[#241919] tracking-tight">
            Work History & Audit Log
          </h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Database Synced
          </span>
        </div>
        <p className="text-xs text-[#574141] leading-relaxed">
          Review completed campus work orders, verified job slips, and your performance benchmarks.
        </p>
      </div>

      {/* Performance Summary Banner */}
      <div className="relative overflow-hidden bg-[#7a1521] text-white rounded-xl p-4 shadow-sm border border-[#7a1521]">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-[#58000f]/40 pointer-events-none blur-xl" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#ffb3b2] text-[20px]">insights</span>
            <span className="text-base font-bold text-white">August 2026 Summary</span>
          </div>
          <span className="text-[10px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-md">
            ITUM Moratuwa
          </span>
        </div>

        {/* 3 Metric Columns */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#ffb3b2]">Jobs</span>
              <span className="material-symbols-outlined text-[14px] text-[#ffb3b2]">task_alt</span>
            </div>
            <div>
              <span className="text-[24px] font-bold leading-tight block text-white">28</span>
              <span className="text-[9px] text-white/80 uppercase tracking-wider">Completed</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#ffb3b2]">SLA</span>
              <span className="material-symbols-outlined text-[14px] text-[#ffb3b2]">verified</span>
            </div>
            <div>
              <span className="text-[24px] font-bold leading-tight block text-white">98.5%</span>
              <span className="text-[9px] text-white/80 uppercase tracking-wider">On-Time</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-[#ffb3b2]">Avg Res</span>
              <span className="material-symbols-outlined text-[14px] text-[#ffb3b2]">timer</span>
            </div>
            <div>
              <span className="text-[24px] font-bold leading-tight block text-white">
                2.4<span className="text-xs font-normal">h</span>
              </span>
              <span className="text-[9px] text-white/80 uppercase tracking-wider">Turnaround</span>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER LOGS SECTION */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#debfbf]/60 shadow-xs flex flex-col gap-3">
        {/* Filter Header Strip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-[#7a1521]">tune</span>
            <span className="text-xs font-bold text-[#241919] uppercase tracking-wider">
              Filter Database Logs
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#fff0ef] text-[#7a1521] font-bold border border-[#ffe9e8]">
              {filteredLogs.length} of {dbStats.totalRecords}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs font-bold text-[#7a1521] hover:underline flex items-center gap-1 active:scale-95 transition-transform"
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

        {/* 1. TRADE FILTER PILLS (Direct One-Tap Toggle) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#574141] uppercase tracking-wider">
            Filter by Trade / Division:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {tradeOptions.map((trade) => {
              const isActive = selectedTrade.toLowerCase() === trade.id.toLowerCase();
              return (
                <button
                  key={trade.id}
                  type="button"
                  onClick={() => {
                    setSelectedTrade(trade.id);
                    setActiveFilterDrawer('none');
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#7a1521] text-white shadow-sm ring-2 ring-[#7a1521]/30'
                      : 'bg-[#fff0ef] text-[#574141] hover:bg-[#ffe9e8] hover:text-[#241919]'
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

        {/* 2. PERIOD FILTER PILLS (Direct One-Tap Toggle) */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-[#574141] uppercase tracking-wider">
            Filter by Time Period:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {periodOptions.map((period) => {
              const isActive = selectedPeriod === period.id;
              return (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => {
                    setSelectedPeriod(period.id);
                    setActiveFilterDrawer('none');
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 ${
                    isActive
                      ? 'bg-[#7a1521] text-white shadow-sm ring-2 ring-[#7a1521]/30'
                      : 'bg-[#fff0ef] text-[#574141] hover:bg-[#ffe9e8] hover:text-[#241919]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{period.icon}</span>
                  <span>{period.label}</span>
                </button>
              );
            })}

            {/* Keyword Search Pill */}
            <button
              type="button"
              onClick={() => setActiveFilterDrawer(activeFilterDrawer === 'search' ? 'none' : 'search')}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all active:scale-95 ${
                searchQuery || activeFilterDrawer === 'search'
                  ? 'bg-[#7a1521] text-white shadow-sm ring-2 ring-[#7a1521]/30'
                  : 'bg-[#fff0ef] text-[#574141] hover:bg-[#ffe9e8]'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">search</span>
              <span>{searchQuery ? `"${searchQuery}"` : 'Search...'}</span>
            </button>
          </div>
        </div>

        {/* 3. KEYWORD SEARCH DRAWER (Expands in flow without clipping) */}
        {activeFilterDrawer === 'search' && (
          <div className="p-3 bg-[#fff0ef] rounded-xl border border-[#ffe9e8] flex flex-col gap-2 animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#7a1521]">Search Keyword or Ticket #</span>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilterDrawer('none');
                }}
                className="text-[#574141] hover:text-black font-semibold text-[11px]"
              >
                Close Search
              </button>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#7a1521] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type ticket (e.g. 8285), keyword (Ballast, Valve)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#debfbf] text-xs font-medium text-[#241919] placeholder:text-[#8a7170] focus:outline-none focus:ring-2 focus:ring-[#7a1521]"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#574141] hover:text-black"
                >
                  <span className="material-symbols-outlined text-[16px]">clear</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5 text-[11px]">
              <span className="text-[#574141] shrink-0 font-medium">Quick search:</span>
              {['Ballast', 'Valve', 'Refrigerant', 'Auditorium', 'Lift'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSearchQuery(k)}
                  className="px-2 py-0.5 bg-white hover:bg-[#7a1521] hover:text-white rounded-md text-[#7a1521] font-semibold transition-colors border border-[#ffe9e8] shrink-0"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ACTIVE FILTER SUMMARY BADGES */}
        {(selectedTrade !== 'all' || selectedPeriod !== 'all' || searchQuery) && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#ffe9e8] text-[11px]">
            <span className="text-[#574141] font-medium">Active:</span>

            {selectedTrade !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#7a1521] text-white font-bold">
                Trade: {selectedTrade}
                <button
                  type="button"
                  onClick={() => setSelectedTrade('all')}
                  className="hover:text-red-200 ml-1 text-xs"
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
                  className="hover:text-red-200 ml-1 text-xs"
                >
                  ✕
                </button>
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#7a1521] text-white font-bold">
                "{searchQuery}"
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-red-200 ml-1 text-xs"
                >
                  ✕
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[#7a1521] hover:underline font-bold ml-auto"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* HISTORY FEED ITEMS */}
      <div className="flex flex-col gap-3">
        {filteredLogs.length === 0 ? (
          /* Empty State when no results match filters */
          <div className="bg-white rounded-2xl p-6 text-center border border-[#debfbf]/60 shadow-sm flex flex-col items-center gap-2.5">
            <div className="w-12 h-12 rounded-full bg-[#fff0ef] text-[#7a1521] flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">filter_alt_off</span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#241919]">No Logs Matching Filters</h3>
              <p className="text-xs text-[#574141] mt-0.5">
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
                className="bg-white rounded-xl p-4 shadow-sm border border-[#debfbf]/40 flex flex-col gap-2.5 hover:border-[#ba1a1a]/40 transition-colors"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#fff0ef] flex items-center justify-center shrink-0 text-[#7a1521]">
                      <span className="material-symbols-outlined text-[20px]">{iconName}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-[#241919] truncate leading-tight">
                        {log.title}
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-xs font-bold text-[#7a1521]">{log.reqCode}</span>
                        <span className="text-xs text-[#8a7170]">•</span>
                        <span className="text-xs text-[#574141]">{log.division}</span>
                        {log.dateLabel && (
                          <>
                            <span className="text-xs text-[#8a7170]">•</span>
                            <span className="text-[11px] text-[#8a7170] font-medium">{log.dateLabel}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold shrink-0">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    {log.status}
                  </span>
                </div>

                {/* Location and Timing info */}
                <div className="flex flex-col gap-1 text-xs text-[#574141]">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#8a7170] shrink-0">
                      location_on
                    </span>
                    <span className="truncate">{log.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#8a7170] shrink-0">
                      schedule
                    </span>
                    <span>
                      {log.resolvedAt} <span className="text-[#8a7170]">({log.durationSpent})</span>
                    </span>
                  </div>
                </div>

                {/* Verifier Badge */}
                {log.verifierName && (
                  <div className="bg-[#fff0ef] rounded-lg p-2.5 flex items-center gap-2 mt-0.5">
                    <div className="w-7 h-7 rounded-full bg-[#ffdad9] flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px] text-[#7a1521]">
                        verified_user
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#241919] block truncate">
                        Verified by {log.verifierName}
                      </span>
                      <span className="text-[10px] text-[#574141] truncate block">
                        {log.verifierTitle || 'Digital Signature Authenticated'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Remarks snippet if any */}
                {log.remarksSnippet && (
                  <p className="text-[11px] text-[#574141] bg-[#fcf8f8] px-2.5 py-1.5 rounded-lg border border-[#f3dedd]">
                    <span className="font-semibold text-[#7a1521]">Remarks: </span>
                    {log.remarksSnippet}
                  </p>
                )}

                {/* Card Actions Footer with distinct View Details vs View Work Slip buttons */}
                <div className="pt-2 flex items-center justify-between border-t border-[#ffe9e8]">
                  <span className="text-xs text-[#574141] font-medium">
                    {log.photosCount && log.photosCount > 0
                      ? `${log.photosCount} Photos Attached`
                      : 'Audit Verified'}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* BUTTON 1: VIEW DETAILS (Technical Diagnostics, Root Cause & Readings Modal) */}
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(log)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors active:scale-95"
                      title="View Technical Diagnostics & Measurements Audit"
                    >
                      <span className="material-symbols-outlined text-[15px] text-sky-600">troubleshoot</span>
                      <span>View Details</span>
                    </button>

                    {/* BUTTON 2: VIEW WORK SLIP (Official ITUM Signed Completion Slip & Parts Voucher) */}
                    <button
                      type="button"
                      onClick={() => handleOpenSlip(log)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#7a1521] hover:bg-[#58000f] text-white font-bold text-xs shadow-2xs active:scale-95 transition-all"
                      title="View Official Signed Work Slip & Dispatched Parts Voucher"
                    >
                      <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                      <span>View Work Slip</span>
                    </button>
                  </div>
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

        <div className="flex items-center justify-center gap-1 text-[#8a7170]">
          <span className="material-symbols-outlined text-[15px]">lock_clock</span>
          <span className="text-[11px] font-medium">
            Official record compliant with ISO 9001 Facility Auditing
          </span>
        </div>
      </div>

      {/* MODAL 1: Official Signed Work Slip & Parts Voucher (Voucher Form) */}
      <WorkSlipModal
        isOpen={isSlipModalOpen}
        onClose={() => setIsSlipModalOpen(false)}
        workSlip={activeWorkSlip}
      />

      {/* MODAL 2: Job Technical Diagnostics & Engineering Audit (Diagnostics Form) */}
      <JobDetailsAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditDetail={activeJobAudit}
      />
    </div>
  );
};
