import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';

export default function ExportReportModal({ isOpen, onClose, onExport }) {
  const [reportType, setReportType] = useState('Monthly Summary');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('PDF');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onExport({ reportType, startDate, endDate, format });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Export Maintenance Report</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
            >
              <option value="Monthly Summary">Monthly Summary</option>
              <option value="Building Wise Report">Building Wise Report</option>
              <option value="Labourer Performance Report">Labourer Performance Report</option>
              <option value="Category Wise Report">Category Wise Report</option>
              <option value="Stock Usage Report">Stock Usage Report</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Format
            </label>
            <div className="flex items-center gap-6">
              {['PDF', 'Excel', 'CSV'].map((fmt) => (
                <label key={fmt} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    value={fmt}
                    checked={format === fmt}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-4 h-4 text-[#58000f] focus:ring-[#7a1521] accent-[#58000f]"
                  />
                  <span>{fmt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
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
  );
}
