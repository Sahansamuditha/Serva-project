import React, { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  Wrench,
  AlertCircle,
  CheckCircle2,
  Download,
  Settings,
  Eye
} from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import SplineAreaChart from '../components/charts/SplineAreaChart';
import DonutChart from '../components/charts/DonutChart';
import PieChart from '../components/charts/PieChart';
import HorizontalBarChart from '../components/charts/HorizontalBarChart';
import ExportReportModal from '../components/reports/ExportReportModal';
import LabourerPerformanceModal from '../components/reports/LabourerPerformanceModal';
import RecentReportsModal from '../components/reports/RecentReportsModal';
import { api } from '../services/api';

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [trendRange, setTrendRange] = useState('Last 6 Months');
  const [reportType, setReportType] = useState('Monthly Report');
  const [month, setMonth] = useState('August');
  const [year, setYear] = useState('2026');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [isRecentReportsModalOpen, setIsRecentReportsModalOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = () => {
    api.getReports()
      .then((res) => {
        if (res && res.success) {
          setData(res);
        }
      })
      .catch(console.error);
  };

  const stats = data?.stats || {
    requests: 128,
    pending: 14,
    inProgress: 32,
    overdue: 7,
    completed: 75
  };

  const trendData = data?.maintenanceRequestsTrend || [
    { month: 'Jan', total: 20, completed: 12 },
    { month: 'Feb', total: 34, completed: 20 },
    { month: 'Mar', total: 28, completed: 22 },
    { month: 'Apr', total: 42, completed: 30 },
    { month: 'May', total: 38, completed: 28 },
    { month: 'Jun', total: 45, completed: 35 }
  ];

  const statusDonut = data?.requestsByStatus || [
    { name: 'Pending', count: 14, percentage: 11, color: '#f59e0b' },
    { name: 'In Progress', count: 32, percentage: 25, color: '#3b82f6' },
    { name: 'Completed', count: 75, percentage: 59, color: '#10b981' },
    { name: 'Overdue', count: 7, percentage: 5, color: '#ef4444' }
  ];

  const buildingData = data?.requestsByBuilding || [
    { building: 'Computer Center', count: 28 },
    { building: 'Science Building', count: 24 },
    { building: 'Library', count: 18 },
    { building: 'Engineering Building', count: 16 },
    { building: 'Admin Building', count: 12 },
    { building: 'Academic Building', count: 10 },
    { building: 'Other', count: 20 }
  ];

  const categoryData = data?.requestsByCategory || [
    { category: 'Electrical', count: 30, percentage: 23, color: '#f59e0b' },
    { category: 'Plumbing', count: 25, percentage: 20, color: '#3b82f6' },
    { category: 'HVAC', count: 22, percentage: 17, color: '#10b981' },
    { category: 'Civil', count: 18, percentage: 14, color: '#8b5cf6' },
    { category: 'Carpentry', count: 15, percentage: 12, color: '#f97316' },
    { category: 'Other', count: 18, percentage: 14, color: '#64748b' }
  ];

  const labourerPerformance = data?.labourerPerformance || [
    { id: '1', name: 'Kasun Perera', jobsCompleted: 18, avgTime: '2h 10m', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80' },
    { id: '2', name: 'Nimal Fernando', jobsCompleted: 15, avgTime: '2h 35m', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80' },
    { id: '3', name: 'Saman Wijesiri', jobsCompleted: 14, avgTime: '2h 50m', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80' },
    { id: '4', name: 'Tharindu Silva', jobsCompleted: 12, avgTime: '3h 05m', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80' },
    { id: '5', name: 'Chaminda Jayasena', jobsCompleted: 11, avgTime: '3h 20m', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80' }
  ];

  const recentReports = data?.recentReports || [];

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await api.generateReport({ reportType, month, year });
      if (res && res.success) {
        alert(`Report "${res.report.reportName}" generated successfully!`);
        loadReportsData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = (rep) => {
    alert(`Downloading ${rep.reportName} (${rep.id}) as PDF...`);
  };

  return (
    <div className="page-container">
      {/* Title & Export Button */}
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">Reports & Analytics</h1>
          <p className="page-header-subtitle">
            View detailed reports and analytics about maintenance activities.
          </p>
        </div>

        <button className="btn-primary" onClick={() => setIsExportModalOpen(true)}>
          <Download size={16} />
          <span>Export Report</span>
        </button>
      </div>

      {/* 5 Stat Cards */}
      <div className="stats-grid-5">
        <StatCard label="Requests" value={stats.requests} icon={FileText} color="blue" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="amber" />
        <StatCard label="In Progress" value={stats.inProgress} icon={Wrench} color="azure" />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertCircle} color="red" />
        <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="green" />
      </div>

      {/* Row 2: Trend Spline, Status Donut, Generate Report */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Maintenance Requests Trend */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">Maintenance Requests Trend</h2>
            <select
              value={trendRange}
              onChange={(e) => setTrendRange(e.target.value)}
              style={{
                fontSize: '12px',
                color: '#475569',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '4px 8px',
                outline: 'none',
                background: '#ffffff'
              }}
            >
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last 12 Months">Last 12 Months</option>
            </select>
          </div>
          <SplineAreaChart
            data={trendData}
            dataKey="total"
            labelKey="month"
            secondaryKey="completed"
            height={180}
            maxY={60}
            yTicks={[0, 10, 20, 30, 40, 50, 60]}
            strokeColor="#7a1521"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', marginTop: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#7a1521' }} />
              <span>Total Requests</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#991b1b' }} />
              <span>Completed</span>
            </div>
          </div>
        </div>

        {/* Requests by Status Donut */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">Requests by Status</h2>
          </div>
          <DonutChart data={statusDonut} totalLabel="Total" size={135} thickness={16} />
        </div>

        {/* Generate Report Card */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">Generate Report</h2>
          </div>
          <form onSubmit={handleGenerate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                Report Type
              </label>
              <select
                className="form-select"
                style={{ height: '34px', fontSize: '12px' }}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Monthly Report">Monthly Report</option>
                <option value="Building Wise Report">Building Wise Report</option>
                <option value="Labourer Performance Report">Labourer Performance Report</option>
                <option value="Category Wise Report">Category Wise Report</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Month
                </label>
                <select
                  className="form-select"
                  style={{ height: '34px', fontSize: '12px' }}
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                >
                  <option value="August">August</option>
                  <option value="July">July</option>
                  <option value="June">June</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>
                  Year
                </label>
                <select
                  className="form-select"
                  style={{ height: '34px', fontSize: '12px' }}
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
              disabled={generating}
            >
              <Settings size={14} />
              <span>{generating ? 'Generating...' : 'Generate Report'}</span>
            </button>

            <button
              type="button"
              className="btn-outline"
              style={{ width: '100%', justifyContent: 'center', fontSize: '12px' }}
              onClick={() => alert('Downloading latest monthly report as PDF...')}
            >
              <Download size={14} />
              <span>Download as PDF</span>
            </button>
          </form>
        </div>
      </div>

      {/* Row 3: Requests by Building, Requests by Category, Labourer Performance */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.3fr 1.1fr',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        {/* Requests by Building */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">Requests by Building</h2>
          </div>
          <HorizontalBarChart data={buildingData} maxCount={30} />
        </div>

        {/* Requests by Category */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">Requests by Category</h2>
          </div>
          <PieChart data={categoryData} size={140} />
        </div>

        {/* Labourer Performance */}
        <div className="content-card" style={{ marginBottom: 0 }}>
          <div className="card-header-row">
            <h2 className="card-title">Labourer Performance</h2>
            <span className="card-action-link" onClick={() => setIsPerformanceModalOpen(true)}>
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '600', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Labourer</span>
              <div style={{ display: 'flex', gap: '16px' }}>
                <span>Jobs Completed</span>
                <span>Avg. Time</span>
              </div>
            </div>

            {labourerPerformance.map((lab) => (
              <div key={lab.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img
                    src={lab.avatar}
                    alt={lab.name}
                    style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <span style={{ fontWeight: '500', color: '#1e293b' }}>{lab.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
                  <span style={{ fontWeight: '600', color: '#334155' }}>{lab.jobsCompleted}</span>
                  <span style={{ color: '#64748b' }}>{lab.avgTime}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Recent Reports Data Table */}
      <div className="content-card" style={{ marginBottom: 0 }}>
        <div className="card-header-row">
          <h2 className="card-title">Recent Reports</h2>
          <span className="card-action-link" onClick={() => setIsRecentReportsModalOpen(true)}>
            View All
          </span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Name</th>
                <th>Report Type</th>
                <th>Period</th>
                <th>Generated By</th>
                <th>Generated Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((rep) => (
                <tr key={rep.id}>
                  <td style={{ fontWeight: '600', color: '#7a1521' }}>{rep.id}</td>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>{rep.reportName}</td>
                  <td style={{ color: '#475569' }}>{rep.reportType}</td>
                  <td style={{ color: '#475569' }}>{rep.period}</td>
                  <td style={{ color: '#475569' }}>{rep.generatedBy}</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{rep.generatedDate}</td>
                  <td>
                    <StatusBadge status={rep.status} />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <button
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        title="View Report"
                        onClick={() => alert(`Viewing details for ${rep.reportName}`)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
                        title="Download"
                        onClick={() => handleDownloadReport(rep)}
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="page-footer-copyright">
        © 2026 Institute of Technology, University of Moratuwa. All rights reserved.
      </div>

      {/* Screen 4 Export Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExportSuccess={loadReportsData}
      />

      {/* Labourer Performance Modal */}
      <LabourerPerformanceModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
      />

      {/* Recent Reports Archive Modal */}
      <RecentReportsModal
        isOpen={isRecentReportsModalOpen}
        onClose={() => setIsRecentReportsModalOpen(false)}
        reportsList={recentReports}
      />
    </div>
  );
}
