import React from 'react';
import { X, FileDown, Printer, CheckCircle, Clock, AlertTriangle, Building, Wrench } from 'lucide-react';
import { exportReportToPdf } from '../utils/reportGenerator';

export default function GeneratedReportModal({ isOpen, onClose, reportData }) {
  if (!isOpen || !reportData) return null;

  const handleDownloadPdf = () => {
    exportReportToPdf(reportData);
  };

  const getBadgeClass = (val) => {
    const s = String(val).toLowerCase();
    if (s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'in progress') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'scheduled') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s === 'critical' || s === 'rejected') return 'bg-red-50 text-red-700 border-red-200';
    if (s === 'high') return 'bg-orange-50 text-orange-700 border-orange-200';
    return '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="University Logo"
              className="w-10 h-10 object-contain rounded-full border border-slate-200 p-0.5 bg-white shadow-xs shrink-0"
              onError={(e) => { e.target.src = '/campus_logo.png'; }}
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {reportData.reportType}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Institute of Technology, University of Moratuwa &bull; Period: <span className="font-semibold text-slate-700">{reportData.period}</span> &bull; {reportData.generatedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              title="Download official PDF report"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Executive Summary Metrics */}
          {reportData.summaryMetrics && Object.keys(reportData.summaryMetrics).length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Executive Summary
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(reportData.summaryMetrics).map(([k, v]) => {
                  const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  return (
                    <div key={k} className="p-3 rounded-xl border border-slate-100 bg-slate-50/70">
                      <div className="text-[11px] font-medium text-slate-500 truncate">{label}</div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">{v}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Applied Filters Info */}
          {reportData.filtersApplied && Object.keys(reportData.filtersApplied).length > 0 && (
            <div className="flex flex-wrap items-center gap-2 p-2.5 bg-red-50/40 border border-red-100 rounded-xl text-xs">
              <span className="font-bold text-[#58000f]">Active Filters:</span>
              {Object.entries(reportData.filtersApplied).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 bg-white border border-red-200/80 rounded-md text-[11px] text-slate-700 font-medium">
                  <span className="text-slate-400">{k}:</span> {v}
                </span>
              ))}
            </div>
          )}

          {/* Detailed Records Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Detailed Records ({reportData.tableRows?.length || 0})
              </h4>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto max-h-[360px]">
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
                    {reportData.tableRows && reportData.tableRows.length > 0 ? (
                      reportData.tableRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                          {row.map((cell, cIdx) => {
                            const badgeCls = getBadgeClass(cell);
                            return (
                              <td key={cIdx} className="px-3.5 py-2 text-slate-700 whitespace-nowrap">
                                {badgeCls ? (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeCls}`}>
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
                        <td colSpan={reportData.tableColumns?.length || 1} className="p-8 text-center text-slate-400 italic">
                          No matching records found for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            SERVA Institutional Maintenance System &bull; ITUM
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
