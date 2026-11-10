import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Calendar } from 'lucide-react';
import { api } from '../../services/api';

export default function ExportReportModal({ isOpen, onClose, onExportSuccess }) {
  const [reportType, setReportType] = useState('Monthly Summary');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [format, setFormat] = useState('PDF');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.exportReport({ reportType, startDate, endDate, format });
      alert(res.message || `Exported ${reportType} as ${format} successfully!`);
      if (onExportSuccess) onExportSuccess(res);
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
            <option value="Monthly Summary">Monthly Summary</option>
            <option value="Building Wise Report">Building Wise Report</option>
            <option value="Labourer Performance">Labourer Performance</option>
            <option value="Category Wise Breakdown">Category Wise Breakdown</option>
            <option value="Stock & Inventory Usage">Stock & Inventory Usage</option>
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

        {/* Format Radio Selection */}
        <div className="form-group" style={{ marginTop: '8px' }}>
          <label className="form-label">Format</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '6px' }}>
            {['PDF', 'Excel', 'CSV'].map((fmt) => (
              <label
                key={fmt}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value={fmt}
                  checked={format === fmt}
                  onChange={() => setFormat(fmt)}
                  style={{ accentColor: '#7a1521' }}
                />
                <span>{fmt}</span>
              </label>
            ))}
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
