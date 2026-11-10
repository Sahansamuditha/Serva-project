import React, { useState } from 'react';
import {
  X,
  FileDown,
  Printer,
  FileText,
  Table as TableIcon,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  ShieldCheck
} from 'lucide-react';
import { exportReportToPdf } from '../utils/reportGenerator';
import { UNIVERSITY_LOGO_BASE64 } from '../assets/logoBase64.js';

/**
 * Bulletproof modal wrapper:
 * If not open or no data, returns null BEFORE mounting ReportModalContent.
 * This completely prevents any React Hook mismatch or Error #310.
 */
export default function GeneratedReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;
  return <ReportModalContent onClose={onClose} reportData={reportData} />;
}

function ReportModalContent({ onClose, reportData }) {
  const [viewMode, setViewMode] = useState('pdf'); // 'pdf' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('report-pdf-document');
      if (element) {
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = html2pdfModule.default || html2pdfModule;

        const cleanTitle = (reportData.reportType || 'Maintenance_Report').replace(/[^a-zA-Z0-9_-]/g, '_');
        const cleanPeriod = (reportData.period || 'October_2026').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filename = `${cleanTitle}_${cleanPeriod}.pdf`;

        const opt = {
          margin: [8, 10, 8, 10],
          filename: filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'] }
        };

        await html2pdf().set(opt).from(element).save();
        setIsDownloading(false);
        return;
      }
    } catch (err) {
      console.warn('html2pdf direct download error, falling back to print dialog:', err);
    }

    exportReportToPdf(reportData);
    setIsDownloading(false);
  };

  const getBadgeClass = (val) => {
    const s = String(val).toLowerCase();
    if (s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'in progress') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'scheduled') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s === 'critical' || s === 'rejected') return 'bg-red-50 text-red-700 border-red-200';
    if (s === 'high') return 'bg-orange-50 text-orange-700 border-orange-200';
    if (s === 'medium') return 'bg-sky-50 text-sky-700 border-sky-200';
    if (s === 'low') return 'bg-slate-50 text-slate-600 border-slate-200';
    return '';
  };

  const allRows = reportData.tableRows || [];

  // Plain filter without hook dependencies
  const filteredRows = allRows.filter((row) => {
    if (statusFilter !== 'All') {
      const matchesStatus = row.some((cell) => String(cell).toLowerCase() === statusFilter.toLowerCase());
      if (!matchesStatus) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesQuery = row.some((cell) => String(cell).toLowerCase().includes(q));
      if (!matchesQuery) return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={UNIVERSITY_LOGO_BASE64}
              alt="University Logo"
              className="w-10 h-10 object-contain rounded-full border border-slate-200 p-0.5 bg-white shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {reportData.reportType}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#58000f] border border-red-200 uppercase">
                  Official PDF
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Institute of Technology, University of Moratuwa &bull; Period:{' '}
                <span className="font-semibold text-slate-700">{reportData.period}</span> &bull; {reportData.generatedDate}
              </p>
            </div>
          </div>

          {/* Action & View Mode Controls */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Full PDF Document vs Interactive Table */}
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg border border-slate-300/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('pdf')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'pdf'
                    ? 'bg-white text-[#58000f] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View authentic A4 PDF document preview"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full PDF Document</span>
                <span className="sm:hidden">PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  viewMode === 'table'
                    ? 'bg-white text-[#58000f] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View interactive data table with filters"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Data Table ({allRows.length})</span>
                <span className="sm:hidden">Table</span>
              </button>
            </div>

            {/* Download PDF button */}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                isDownloading ? 'opacity-70 cursor-wait' : ''
              }`}
              title="Download official PDF report directly"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Downloading PDF...' : 'Download PDF'}</span>
            </button>

            {/* Print button */}
            <button
              onClick={handleDownloadPdf}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer"
              title="Print Official Document"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors ml-1 cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto bg-slate-100/60 p-3 sm:p-6">
          {/* ============================================================== */}
          {/* VIEW MODE 1: FULL OFFICIAL PDF DOCUMENT (A4 PREVIEW)           */}
          {/* ============================================================== */}
          <div className={viewMode === 'pdf' ? 'block' : 'hidden'}>
            <div
              id="report-pdf-document"
              className="max-w-[850px] mx-auto bg-white rounded-xl shadow-lg border border-slate-200/90 p-6 sm:p-10 text-slate-800 transition-all"
            >
              {/* Document Header with Official Letterhead */}
              <div className="flex items-start justify-between pb-4 mb-5 border-b-2 border-[#58000f]">
                <div className="flex items-center gap-3.5">
                  <img
                    src={UNIVERSITY_LOGO_BASE64}
                    alt="University of Moratuwa Logo"
                    className="w-14 h-14 object-contain rounded-full border border-[#58000f] p-1 bg-white shadow-xs shrink-0"
                  />
                  <div>
                    <h1 className="text-base sm:text-lg font-black text-[#58000f] tracking-tight uppercase leading-tight">
                      Institute of Technology, University of Moratuwa
                    </h1>
                    <h2 className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                      SERVA - Central Maintenance Management System
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Official Institutional Audit &amp; Maintenance Operations Report
                    </p>
                  </div>
                </div>

                <div className="hidden sm:block text-right bg-red-50/80 border border-red-200/80 rounded-lg px-3 py-1.5">
                  <div className="text-[10px] font-extrabold text-[#58000f] tracking-wide">
                    OFFICIAL ITUM REPORT
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                    ID: ITUM-REP-{String(reportData.period || '2026').replace(/\s+/g, '-').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Report Meta Info Bar */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs mb-5">
                <div>
                  <span className="text-slate-500 font-medium">Report Type:</span>{' '}
                  <span className="font-bold text-slate-900">{reportData.reportType}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Reporting Period:</span>{' '}
                  <span className="font-bold text-[#58000f]">{reportData.period}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Generated On:</span>{' '}
                  <span className="font-semibold text-slate-700">{reportData.generatedDate}</span>
                </div>
              </div>

              {/* Applied Filters (if any) */}
              {reportData.filtersApplied && Object.keys(reportData.filtersApplied).length > 0 && (
                <div className="mb-5 flex flex-wrap items-center gap-2.5 px-3 py-2 bg-red-50/50 border border-red-100 rounded-lg text-xs">
                  <span className="font-bold text-[#58000f] text-[11px] uppercase tracking-wide shrink-0">
                    Applied Filters:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {Object.entries(reportData.filtersApplied).map(([k, v]) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-red-200/90 rounded-md text-[11px] leading-tight text-slate-700 font-medium shadow-2xs"
                      >
                        <span className="text-slate-400 font-normal">{k}:</span>
                        <span className="text-slate-800 font-semibold">{v}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Executive Summary KPI Grid */}
              {reportData.summaryMetrics && Object.keys(reportData.summaryMetrics).length > 0 && (
                <div className="mb-6">
                  <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-[#58000f] rounded-xs inline-block"></span>
                    <span>Executive Summary</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {Object.entries(reportData.summaryMetrics).map(([k, v]) => {
                      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                      return (
                        <div
                          key={k}
                          className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/70 border-t-2 border-t-[#58000f]"
                        >
                          <div className="text-[10px] font-semibold text-slate-500 uppercase truncate">
                            {label}
                          </div>
                          <div className="text-base sm:text-lg font-black text-slate-900 mt-0.5">
                            {v}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Detailed Records Table */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-[#58000f] rounded-xs inline-block"></span>
                    <span>Detailed Maintenance Records ({allRows.length} Entries)</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Showing all recorded maintenance entries
                  </span>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-[#58000f] text-white">
                        <tr>
                          {reportData.tableColumns?.map((col, idx) => (
                            <th
                              key={idx}
                              className="px-3 py-2 font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap border-b border-[#58000f]"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {allRows.length > 0 ? (
                          allRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={rIdx % 2 === 0 ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/40 hover:bg-slate-50'}
                            >
                              {row.map((cell, cIdx) => {
                                const badgeCls = getBadgeClass(cell);
                                return (
                                  <td
                                    key={cIdx}
                                    className={`px-3 py-2 text-slate-700 whitespace-nowrap ${
                                      cIdx === 0 ? 'font-bold text-[#58000f]' : ''
                                    }`}
                                  >
                                    {badgeCls ? (
                                      <span
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeCls}`}
                                      >
                                        {cell}
                                      </span>
                                    ) : (
                                      <span>{cell !== undefined && cell !== null ? String(cell) : '-'}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={reportData.tableColumns?.length || 1}
                              className="p-8 text-center text-slate-400 italic"
                            >
                              No records found for the selected period.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Institutional Sign-off & Audit Seal Section */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
                {/* Prepared By */}
                <div className="text-center sm:text-left">
                  <div className="border-b border-slate-800 h-9 mb-1.5 w-48 mx-auto sm:mx-0"></div>
                  <div className="text-xs font-bold text-slate-900">Prepared by: Maintenance Officer</div>
                  <div className="text-[10px] text-slate-500">SERVA Operations &bull; ITUM</div>
                </div>

                {/* Official Stamp */}
                <div className="text-center">
                  <div className="border-2 border-dashed border-[#991b1b] rounded-lg p-2.5 bg-red-50/60 max-w-[220px]">
                    <div className="text-[9px] font-extrabold text-[#991b1b] tracking-wider uppercase">
                      Institutional Audit Seal
                    </div>
                    <div className="text-xs font-black text-[#58000f] mt-0.5">
                      VERIFIED &amp; APPROVED
                    </div>
                    <div className="text-[8px] font-medium text-red-900 mt-0.5">
                      ITUM CENTRAL MAINTENANCE DIVISION
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Sub-footer */}
              <div className="mt-8 pt-3 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
                <span>ITUM Maintenance Division &bull; Diyagama, Homagama, Sri Lanka</span>
                <span>Generated automatically by SERVA System &bull; Confidential Institutional Document</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* VIEW MODE 2: INTERACTIVE TABLE VIEW WITH SEARCH & QUICK FILTER */}
          {/* ============================================================== */}
          <div className={viewMode === 'table' ? 'block' : 'hidden'}>
            <div className="space-y-4">
              {/* Executive Summary Cards */}
              {reportData.summaryMetrics && Object.keys(reportData.summaryMetrics).length > 0 && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Executive Summary Metrics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {Object.entries(reportData.summaryMetrics).map(([k, v]) => {
                      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
                      return (
                        <div key={k} className="p-3 rounded-lg border border-slate-100 bg-slate-50/70">
                          <div className="text-[11px] font-medium text-slate-500 truncate">{label}</div>
                          <div className="text-lg font-bold text-slate-900 mt-0.5">{v}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Table Controls (Search & Status Filters) */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search records by ID, issue, requester..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#58000f]"
                  />
                </div>

                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  {['All', 'Completed', 'In Progress', 'Pending', 'Critical'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                        statusFilter === st
                          ? 'bg-[#58000f] text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Component */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">
                    Detailed Records ({filteredRows.length} of {allRows.length})
                  </span>
                  {searchQuery && (
                    <span className="text-slate-500 text-[11px]">
                      Filtered by &quot;{searchQuery}&quot;
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#58000f] text-white sticky top-0 z-10">
                      <tr>
                        {reportData.tableColumns?.map((col, idx) => (
                          <th key={idx} className="px-3.5 py-2.5 font-semibold text-[11px] whitespace-nowrap">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredRows.length > 0 ? (
                        filteredRows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                            {row.map((cell, cIdx) => {
                              const badgeCls = getBadgeClass(cell);
                              return (
                                <td
                                  key={cIdx}
                                  className={`px-3.5 py-2.5 text-slate-700 whitespace-nowrap ${
                                    cIdx === 0 ? 'font-bold text-[#58000f]' : ''
                                  }`}
                                >
                                  {badgeCls ? (
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeCls}`}
                                    >
                                      {cell}
                                    </span>
                                  ) : (
                                    <span>{cell !== undefined && cell !== null ? String(cell) : '-'}</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={reportData.tableColumns?.length || 1}
                            className="p-8 text-center text-slate-400 italic"
                          >
                            No matching records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">SERVA Institutional Maintenance System</span>
            <span>&bull;</span>
            <span>ITUM Campus</span>
            <span>&bull;</span>
            <span className="font-bold text-[#58000f]">{allRows.length} Total Records</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className={`px-3.5 py-1.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ${
                isDownloading ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Downloading PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
