import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import { Search, Eye, Download, FileText, Calendar, Filter, ArrowLeft, CheckCircle2, User, Building, BarChart2 } from 'lucide-react';

export default function RecentReportsModal({ isOpen, onClose, reportsList }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedReport, setSelectedReport] = useState(null);

  const defaultReports = [
    {
      id: 'REP-2026-08',
      reportName: 'August 2026 Monthly Maintenance Summary',
      reportType: 'Monthly Report',
      period: '01 Aug 2026 - 31 Aug 2026',
      generatedBy: 'Director',
      generatedDate: '22 Aug 2026, 09:30 AM',
      status: 'Completed',
      totalRequests: 128,
      completedRequests: 75,
      totalCost: '$12,450',
      description: 'Comprehensive evaluation of maintenance operations, building electrical loads, HVAC unit repair schedules, and staff productivity metrics across ITUM campuses.'
    },
    {
      id: 'REP-2026-07',
      reportName: 'July 2026 Monthly Operations Report',
      reportType: 'Monthly Report',
      period: '01 Jul 2026 - 31 Jul 2026',
      generatedBy: 'Director',
      generatedDate: '01 Aug 2026, 10:15 AM',
      status: 'Completed',
      totalRequests: 142,
      completedRequests: 130,
      totalCost: '$14,200',
      description: 'Monthly summary covering plumbing pipe installations in Chemistry lab, transformer overload resolution in reading hall, and preventative maintenance audit.'
    },
    {
      id: 'REP-BLD-08',
      reportName: 'Computer Center Infrastructure Audit',
      reportType: 'Building Wise Report',
      period: '01 Jan 2026 - 15 Aug 2026',
      generatedBy: 'Eng. K. Perera',
      generatedDate: '15 Aug 2026, 02:45 PM',
      status: 'Completed',
      totalRequests: 48,
      completedRequests: 42,
      totalCost: '$5,800',
      description: 'Detailed analysis of server room air conditioning units, network rack UPS backups, and lab 3 electrical distribution boxes.'
    },
    {
      id: 'REP-LAB-08',
      reportName: 'Q2 Labourer & Staff Performance Analytics',
      reportType: 'Labourer Performance Report',
      period: '01 Apr 2026 - 30 Jun 2026',
      generatedBy: 'Director',
      generatedDate: '05 Jul 2026, 11:20 AM',
      status: 'Completed',
      totalRequests: 96,
      completedRequests: 90,
      totalCost: '$9,100',
      description: 'Performance review matrix measuring mean time to resolution, team efficiency scores, safety compliance rates, and individual laborer output.'
    },
    {
      id: 'REP-CAT-07',
      reportName: 'Electrical Systems Reliability Breakdown',
      reportType: 'Category Wise Report',
      period: '01 Jun 2026 - 30 Jun 2026',
      generatedBy: 'Dr. Kamal Silva',
      generatedDate: '02 Jul 2026, 04:00 PM',
      status: 'Completed',
      totalRequests: 35,
      completedRequests: 31,
      totalCost: '$4,350',
      description: 'Category-specific audit focusing on high-voltage circuit breakers, lighting fixtures, and generator fuel line inspections.'
    },
    {
      id: 'REP-2026-06',
      reportName: 'June 2026 Executive Summary',
      reportType: 'Monthly Report',
      period: '01 Jun 2026 - 30 Jun 2026',
      generatedBy: 'Director',
      generatedDate: '01 Jul 2026, 08:30 AM',
      status: 'Archived',
      totalRequests: 110,
      completedRequests: 105,
      totalCost: '$11,600',
      description: 'Historical mid-year maintenance overview document for university administration review.'
    }
  ];

  const reports = reportsList && reportsList.length > 0 ? reportsList : defaultReports;

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.generatedBy.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || rep.reportType === typeFilter;
    const matchesStatus = statusFilter === 'All' || rep.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownload = (rep) => {
    alert(`Downloading PDF for ${rep.reportName} (${rep.id})...`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Full Reports Archive & Detailed Logs" maxWidth="920px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* If a report detail view is selected */}
        {selectedReport ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <button
              onClick={() => setSelectedReport(null)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: 'none',
                background: 'transparent',
                color: '#7a1521',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
                width: 'fit-content'
              }}
            >
              <ArrowLeft size={16} /> Back to Reports List
            </button>

            <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#7a1521', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {selectedReport.id}
                </span>
                <StatusBadge status={selectedReport.status} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                {selectedReport.reportName}
              </h2>
              <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                {selectedReport.description}
              </p>
            </div>

            {/* Quick Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Report Type</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedReport.reportType}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Period Covered</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedReport.period}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Total Requests</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#2563eb', marginTop: '2px' }}>{selectedReport.totalRequests || 128}</div>
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Generated Date</div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{selectedReport.generatedDate}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button className="btn-outline" onClick={() => setSelectedReport(null)}>
                Close View
              </button>
              <button className="btn-primary" onClick={() => handleDownload(selectedReport)}>
                <Download size={15} /> Download PDF
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Stat Summary Banner */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fff0ef', color: '#7a1521', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Total Reports</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{reports.length} Logs</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Monthly Summaries</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>12 Active</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Audit Status</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#059669' }}>Verified</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Compliance</div>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#d97706' }}>99.4%</div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '38px' }}
                  placeholder="Search report ID, report name, or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: '180px', height: '38px' }}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="All">All Report Types</option>
                <option value="Monthly Report">Monthly Report</option>
                <option value="Building Wise Report">Building Wise Report</option>
                <option value="Labourer Performance Report">Labourer Performance Report</option>
                <option value="Category Wise Report">Category Wise Report</option>
              </select>
            </div>

            {/* Reports Data Table */}
            <div className="data-table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0' }}>
              <table className="data-table">
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    <th>Report ID</th>
                    <th>Report Name</th>
                    <th>Report Type</th>
                    <th>Period</th>
                    <th>Generated By</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((rep) => (
                    <tr key={rep.id}>
                      <td style={{ fontWeight: '600', color: '#7a1521' }}>{rep.id}</td>
                      <td style={{ fontWeight: '600', color: '#0f172a' }}>{rep.reportName}</td>
                      <td style={{ color: '#475569' }}>{rep.reportType}</td>
                      <td style={{ color: '#475569', fontSize: '12px' }}>{rep.period}</td>
                      <td style={{ color: '#475569' }}>{rep.generatedBy}</td>
                      <td>
                        <StatusBadge status={rep.status} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                            title="View Report Details"
                            onClick={() => setSelectedReport(rep)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                            title="Download PDF"
                            onClick={() => handleDownload(rep)}
                          >
                            <Download size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                        No reports found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
              <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100px', justifyContent: 'center' }}>
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
