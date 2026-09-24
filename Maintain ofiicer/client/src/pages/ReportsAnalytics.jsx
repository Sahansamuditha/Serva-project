import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  Eye, 
  MoreVertical, 
  Settings, 
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Line, Doughnut, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import StatCard from '../components/StatCard';
import ExportReportModal from '../components/ExportReportModal';
import TeamPerformanceModal from '../components/TeamPerformanceModal';
import { fetchReportsData, generateReport, exportReport, fetchTeams } from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ReportsAnalytics({ setCurrentPage }) {
  const [reportsData, setReportsData] = useState(null);
  const [teams, setTeams] = useState([]);
  const [selectedPerformanceTeam, setSelectedPerformanceTeam] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [reportType, setReportType] = useState('Monthly Report');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [selectedYear, setSelectedYear] = useState('2026');

  useEffect(() => {
    loadReports();
    loadTeams();
  }, []);

  async function loadReports() {
    const data = await fetchReportsData();
    if (data) setReportsData(data);
  }

  async function loadTeams() {
    const teamData = await fetchTeams();
    if (teamData && teamData.length > 0) {
      setTeams(teamData);
    }
  }

  const handleGenerate = async () => {
    await generateReport({
      reportType,
      month: selectedMonth,
      year: selectedYear
    });
    alert(`Generated ${reportType} for ${selectedMonth} ${selectedYear}!`);
    loadReports();
  };

  const handleExport = async (params) => {
    await exportReport(params);
  };

  // Trend Line Chart (Image 11.png)
  const trendLineData = {
    labels: ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        label: 'Total Requests',
        data: [16, 28, 37, 30, 49, 47],
        borderColor: '#7a1521',
        backgroundColor: 'transparent',
        tension: 0.35,
        pointBackgroundColor: '#7a1521',
        pointRadius: 4
      },
      {
        label: 'Completed',
        data: [15, 26, 34, 28, 45, 42],
        borderColor: '#059669',
        borderDash: [4, 4],
        backgroundColor: 'transparent',
        tension: 0.35,
        pointBackgroundColor: '#059669',
        pointRadius: 3
      }
    ]
  };

  const trendLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 8, usePointStyle: true, font: { family: 'Inter', size: 11 } }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
      y: { min: 0, max: 60, grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 11 } } }
    }
  };

  // Status Donut Chart (Image 11.png)
  const statusDonutData = {
    labels: ['Pending', 'In Progress', 'Completed', 'Overdue'],
    datasets: [
      {
        data: [14, 32, 75, 7],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
        borderWidth: 0,
        cutout: '74%'
      }
    ]
  };

  // Category Pie Chart (Image 11.png)
  const categoryPieData = {
    labels: ['Electrical', 'Plumbing', 'HVAC', 'Civil', 'Carpentry', 'Other'],
    datasets: [
      {
        data: [30, 25, 22, 18, 15, 18],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#94a3b8'],
        borderWidth: 1,
        borderColor: '#ffffff'
      }
    ]
  };

  const categoryPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 className="headline-md" style={{ color: '#1e293b' }}>
            Reports & Analytics
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            View detailed reports and analytics about maintenance activities.
          </p>
        </div>

        <button 
          onClick={() => setShowExportModal(true)}
          className="btn btn-primary"
          style={{ padding: '9px 18px', gap: '8px' }}
        >
          <Download size={16} /> Export Report
        </button>
      </div>

      {/* Top 5 Stat Cards */}
      <div className="stat-cards-5-grid">
        <StatCard title="Requests" value="128" icon={FileText} color="blue" />
        <StatCard title="Pending" value="14" icon={Clock} color="amber" />
        <StatCard title="In Progress" value="32" icon={Wrench} color="blue" />
        <StatCard title="Overdue" value="7" icon={AlertCircle} color="red" />
        <StatCard title="Completed" value="75" icon={CheckCircle2} color="green" />
      </div>

      {/* ROW 1: Trend, Status, Generate Report */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Trend Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Maintenance Requests Trend</span>
            <span style={{ fontSize: '12px', color: '#64748b', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '4px' }}>
              Last 6 Months
            </span>
          </div>
          <div style={{ height: '200px', width: '100%' }}>
            <Line data={trendLineData} options={trendLineOptions} />
          </div>
        </div>

        {/* Status Donut */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Requests by Status</span>
          </div>
          <div style={{ position: 'relative', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Doughnut data={statusDonutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            <div style={{ position: 'absolute', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>128</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Total</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 10px', marginTop: '14px', fontSize: '11.5px', color: '#475569' }}>
            <div><span style={{ color: '#f59e0b' }}>●</span> Pending 14 (11%)</div>
            <div><span style={{ color: '#3b82f6' }}>●</span> In Progress 32 (25%)</div>
            <div><span style={{ color: '#10b981' }}>●</span> Completed 75 (59%)</div>
            <div><span style={{ color: '#ef4444' }}>●</span> Overdue 7 (6%)</div>
          </div>
        </div>

        {/* Generate Report Form Card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Generate Report</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Report Type</label>
              <select 
                className="form-select" 
                style={{ height: '34px', fontSize: '12.5px', marginTop: '4px' }}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Monthly Report">Monthly Report</option>
                <option value="Building Wise Report">Building Wise Report</option>
                <option value="Labourer Performance">Labourer Performance</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Month</label>
                <select 
                  className="form-select" 
                  style={{ height: '34px', fontSize: '12.5px', marginTop: '4px' }}
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="August">August</option>
                  <option value="July">July</option>
                  <option value="June">June</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Year</label>
                <select 
                  className="form-select" 
                  style={{ height: '34px', fontSize: '12.5px', marginTop: '4px' }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '6px', fontSize: '13px', padding: '8px' }}
            >
              <Settings size={14} /> Generate Report
            </button>
            <button 
              onClick={() => alert('Downloading report as PDF...')}
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '12px', padding: '6px' }}
            >
              <Download size={13} /> Download as PDF
            </button>
          </div>
        </div>
      </div>

      {/* ROW 2: Requests by Building, Requests by Category, Labourer Performance */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr 1.2fr',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* Requests by Building */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Requests by Building</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { name: 'Computer Center', count: 28 },
              { name: 'Science Building', count: 24 },
              { name: 'Library', count: 18 },
              { name: 'Engineering Building', count: 16 },
              { name: 'Admin Building', count: 12 },
              { name: 'Academic Building', count: 10 },
              { name: 'Other', count: 20 }
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                <span style={{ width: '120px', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</span>
                <div style={{ flex: 1, height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ width: `${(b.count / 30) * 100}%`, height: '100%', backgroundColor: '#7a1521', borderRadius: '5px' }} />
                </div>
                <span style={{ width: '20px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{b.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Requests by Category */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Requests by Category</span>
          </div>
          <div style={{ height: '150px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Pie data={categoryPieData} options={categoryPieOptions} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '12px', fontSize: '11px', color: '#475569' }}>
            <div><span style={{ color: '#f59e0b' }}>●</span> Electrical 30 (23%)</div>
            <div><span style={{ color: '#3b82f6' }}>●</span> Plumbing 25 (20%)</div>
            <div><span style={{ color: '#10b981' }}>●</span> HVAC 22 (17%)</div>
            <div><span style={{ color: '#8b5cf6' }}>●</span> Civil 18 (14%)</div>
            <div><span style={{ color: '#f97316' }}>●</span> Carpentry 15 (12%)</div>
            <div><span style={{ color: '#94a3b8' }}>●</span> Other 18 (14%)</div>
          </div>
        </div>

        {/* Labourer Performance (Teams) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Labourer Performance</span>
            <span 
              onClick={() => {
                if (setCurrentPage) {
                  setCurrentPage('labourers');
                } else if (teams.length > 0) {
                  setSelectedPerformanceTeam(teams[0]);
                }
              }}
              style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}
              title="Go to Labourers Management page"
            >
              View All
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', fontWeight: 600, paddingBottom: '6px', borderBottom: '1px solid #f1f5f9' }}>
              <span>Team</span>
              <div style={{ display: 'flex', gap: '28px' }}>
                <span>Jobs Completed</span>
                <span>Avg. Time</span>
              </div>
            </div>

            {(teams.length > 0 ? teams : [
              { id: 'team-a', name: 'Team A', lead: 'David Chen', specialization: 'High-voltage & internal wiring', completed: 40, totalJobs: 48, avgTime: '2h 10m', efficiency: 94, status: 'Active' },
              { id: 'team-b', name: 'Team B', lead: 'Sarah Jenkins', specialization: 'HVAC & Climate Control', completed: 27, totalJobs: 32, avgTime: '2h 35m', efficiency: 89, status: 'Active' },
              { id: 'team-c', name: 'Team C', lead: 'Marcus Johnson', specialization: 'Plumbing & Sanitation', completed: 23, totalJobs: 25, avgTime: '1h 55m', efficiency: 96, status: 'Idle' },
              { id: 'team-d', name: 'Team D', lead: 'Saman Wijesiri', specialization: 'Civil & Masonry Works', completed: 23, totalJobs: 28, avgTime: '3h 05m', efficiency: 91, status: 'Active' }
            ]).map((team, i) => {
              const getBadge = (name = '') => {
                if (name.includes('A')) return { bg: '#ffe4e6', color: '#be123c' };
                if (name.includes('B')) return { bg: '#dbeafe', color: '#1d4ed8' };
                if (name.includes('C')) return { bg: '#d1fae5', color: '#047857' };
                if (name.includes('D')) return { bg: '#fef3c7', color: '#b45309' };
                return { bg: '#e0e7ff', color: '#4338ca' };
              };
              const badge = getBadge(team.name);
              const jobsDone = team.completed ?? team.totalJobs ?? (40 - i * 6);
              const avgTime = team.avgTime || (i === 0 ? '2h 10m' : i === 1 ? '2h 35m' : i === 2 ? '1h 55m' : '3h 05m');
              const isActive = team.status === 'Active';

              return (
                <div 
                  key={team.id || i}
                  onClick={() => setSelectedPerformanceTeam(team)}
                  className="performance-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12.5px',
                    padding: '7px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                  title={`Click to view detailed analytics for ${team.name}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '6px',
                      backgroundColor: badge.bg,
                      color: badge.color,
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {team.name.replace('Team ', '').charAt(0) || team.name.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{team.name}</span>
                        <span 
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isActive ? '#10b981' : '#94a3b8'
                          }}
                          title={team.status || 'Active'}
                        />
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                        {team.specialization || `Lead: ${team.lead}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '38px', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 600, color: '#1e293b', minWidth: '22px', textAlign: 'right' }}>
                      {jobsDone}
                    </span>
                    <span style={{ color: '#64748b', minWidth: '48px', textAlign: 'right' }}>
                      {avgTime}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ROW 3: Recent Reports Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Reports</span>
          <span style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>View All</span>
        </div>

        <div className="table-container">
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(reportsData?.recentReportsList || []).map((rep) => (
                <tr key={rep.id}>
                  <td style={{ fontWeight: 600, color: '#7a1521', whiteSpace: 'nowrap' }}>{rep.id}</td>
                  <td style={{ fontWeight: 500 }}>{rep.name}</td>
                  <td style={{ color: '#64748b' }}>{rep.type}</td>
                  <td style={{ color: '#64748b' }}>{rep.period}</td>
                  <td style={{ color: '#475569' }}>{rep.generatedBy}</td>
                  <td style={{ color: '#64748b', fontSize: '12px' }}>{rep.generatedDate}</td>
                  <td>
                    <span className="badge badge-completed">
                      {rep.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} title="View">
                        <Eye size={15} />
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} title="Download">
                        <Download size={15} />
                      </button>
                      <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                        <MoreVertical size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Report Modal (Image 8.png) */}
      <ExportReportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      {/* Team Performance Analytics Modal (Image 19.png) */}
      <TeamPerformanceModal 
        isOpen={!!selectedPerformanceTeam}
        onClose={() => setSelectedPerformanceTeam(null)}
        team={selectedPerformanceTeam}
      />
    </div>
  );
}
