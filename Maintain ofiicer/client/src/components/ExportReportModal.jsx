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
    if (onExport) {
      onExport({ reportType, startDate, endDate, format });
    }
    alert(`Report (${reportType}) exported as ${format} successfully!`);
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
              <option value="Monthly Summary">Monthly Summary</option>
              <option value="Building Wise Summary">Building Wise Summary</option>
              <option value="Labourer Performance">Labourer Performance</option>
              <option value="Category Breakdown">Category Breakdown</option>
              <option value="Inventory / Stock Usage">Inventory / Stock Usage</option>
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

          {/* Format Radio Group */}
          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">Format</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '4px' }}>
              {['PDF', 'Excel', 'CSV'].map((fmt) => (
                <label 
                  key={fmt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <input 
                    type="radio" 
                    name="format" 
                    value={fmt}
                    checked={format === fmt}
                    onChange={() => setFormat(fmt)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  {fmt}
                </label>
              ))}
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
