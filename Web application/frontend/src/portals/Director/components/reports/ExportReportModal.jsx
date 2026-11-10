import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { REPORT_TYPES, buildReportData, exportReportToExcel, exportReportToPdf } from '../../../../utils/reportGenerator';

export default function ExportReportModal({ isOpen, onClose, onExportSuccess }) {
  const [reportType, setReportType] = useState('Monthly Maintenance Summary Report');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [format, setFormat] = useState('PDF');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
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

      await api.exportReport({ reportType, startDate, endDate, format });
      if (onExportSuccess) onExportSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Maintenance Report">
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

        {/* Date Pickers */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="form-input"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                className="form-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="form-group" style={{ marginTop: '8px' }}>
          <label className="form-label">Export Format</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7a1521' }}></span>
            <span>PDF Document (.pdf)</span>
            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: 'auto' }}>Official ITUM Format</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '28px'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px 12px'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Exporting...' : 'Export Report'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
