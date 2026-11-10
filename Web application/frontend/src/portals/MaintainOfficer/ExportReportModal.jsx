import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { REPORT_TYPES, buildReportData, exportReportToExcel, exportReportToPdf } from '../../utils/reportGenerator';

export default function ExportReportModal({ isOpen, onClose, onExport }) {
  const [reportType, setReportType] = useState('Monthly Maintenance Summary Report');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [format, setFormat] = useState('PDF');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const reportData = buildReportData({
      reportType,
      startDate,
      endDate
    });

    if (format === 'PDF') {
      exportReportToPdf(reportData);
    } else {
      exportReportToExcel(reportData);
    }

    if (onExport) {
      onExport({ reportType, startDate, endDate, format });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', padding: '28px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
            Export Maintenance Report
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* Report Type */}
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <select 
              className="form-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input 
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input 
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Format Selection */}
          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">Export Format</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary, #7a1521)' }}></span>
              <span>PDF Document (.pdf)</span>
              <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>Official ITUM Format</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 16px'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '9px 22px' }}
            >
              Export Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
