// ==============================================================================
// SERVA - Institutional Report Generator Utility (ITUM)
// Supports all 5 reports:
// 1. Monthly Maintenance Summary Report (Total, Completed, Pending, In Progress, Rejected, Completion Rate %)
// 2. Maintenance Requests Report (Request ID, Date, Requester, Department, Location, Issue Type, Priority, Status)
// 3. Priority Analysis Report (Critical, High, Medium, Low breakdown)
// 4. Department-wise Maintenance Report (Department, Requests, Completed, Pending)
// 5. Staff Workload Report (Labourer, Assigned Date, Assign work ID, Completed)
// ==============================================================================

import { UNIVERSITY_LOGO_BASE64 } from './logoBase64.js';

export const REPORT_TYPES = [
  'Monthly Maintenance Summary Report',
  'Maintenance Requests Report',
  'Priority Analysis Report',
  'Department-wise Maintenance Report',
  'Staff Workload Report'
];

export const MONTH_NAMES = [
  'All Months',
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const STANDARD_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const YEARS = ['2026', '2025', '2024', '2027'];

export const STATUS_OPTIONS = [
  'All Statuses',
  'Pending',
  'Scheduled',
  'In Progress',
  'Completed',
  'Rejected'
];

export const PRIORITY_OPTIONS = [
  'All Priorities',
  'Critical',
  'High',
  'Medium',
  'Low'
];

export const ALL_DEPARTMENTS_LIST = [
  'All Departments',
  'Civil Engineering Technology',
  'Electrical, Electronic & Telecommunication Engineering Technology',
  'Mechanical Engineering Technology',
  'Maritime Studies',
  'Polymer & Chemical Engineering Technology',
  'Textile & Clothing Technology',
  'Information Technology',
  'Interdisciplinary Studies',
  'Industrial Training',
  'Library',
  'General Administration (Quarters)',
  'Finance',
  'Systems Management Unit',
  'Center for Innovation & Entrepreneurship',
  'Hostels',
  'Exam department',
  'Human resource unit(U7)',
  'Student affairs',
  'Executive Directorate',
  'Central Maintenance Division',
  'ITUM Central Administration'
];

// Helper to extract a valid Date from request object
export function getRequestDate(r) {
  if (!r) return null;
  const val = r.created_at || r.submittedDate || r.createdAt || r.date || r.scheduled_date || r.start_date;
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

// Format date nicely
export function formatDate(dateObj) {
  if (!dateObj) return 'N/A';
  const d = typeof dateObj === 'string' ? new Date(dateObj) : dateObj;
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Normalize request status into standard labels
export function normalizeStatus(statusRaw) {
  const s = (statusRaw || '').toString().toLowerCase().trim();
  if (s.includes('complete') || s === 'done' || s === 'resolved') return 'Completed';
  if (s.includes('progress') || s.includes('assigned') || s.includes('pending start') || s === 'active') return 'In Progress';
  if (s.includes('schedul') || s.includes('hold')) return 'Scheduled';
  if (s.includes('reject') || s.includes('cancel') || s.includes('declined')) return 'Rejected';
  return 'Pending';
}

// Generate report dataset based on filters
export function buildReportData(options = {}) {
  const {
    reportType = 'Monthly Maintenance Summary Report',
    month = 'October',
    year = '2026',
    startDate = '',
    endDate = '',
    department = 'All Departments',
    status = 'All Statuses',
    priority = 'All Priorities',
    location = '',
    labourer = 'All Labourers',
    allRequests = [],
    jobsList = []
  } = options;

  const monthIdx = STANDARD_MONTHS.indexOf(month);
  const targetYear = parseInt(year, 10) || 2026;

  // Filter requests based on time
  const timeFilteredRequests = allRequests.filter(r => {
    const d = getRequestDate(r);
    if (!d) return true; // Include if date is not parsed
    if (startDate && endDate) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      return d >= s && d <= e;
    }
    if (month && month !== 'All Months' && monthIdx !== -1) {
      return d.getFullYear() === targetYear && d.getMonth() === monthIdx;
    }
    return d.getFullYear() === targetYear;
  });

  // If timeFilteredRequests has records use them, else if allRequests has records but no month match, use allRequests if month is All Months or use filtered
  const activeRequests = (month === 'All Months' || timeFilteredRequests.length > 0) ? timeFilteredRequests : (allRequests.length > 0 && monthIdx === -1 ? allRequests : timeFilteredRequests);

  // -------------------------------------------------------------
  // 1. Monthly Maintenance Summary Report
  // -------------------------------------------------------------
  if (reportType === 'Monthly Maintenance Summary Report' || reportType === 'Monthly Report') {
    const totalRequests = activeRequests.length;
    let completedRequests = 0;
    let pendingRequests = 0;
    let inProgressRequests = 0;
    let rejectedRequests = 0;

    activeRequests.forEach(r => {
      const st = normalizeStatus(r.status || r.mapped_status);
      if (st === 'Completed') completedRequests++;
      else if (st === 'Pending' || st === 'Scheduled') pendingRequests++;
      else if (st === 'In Progress') inProgressRequests++;
      else if (st === 'Rejected') rejectedRequests++;
    });

    const completionRate = totalRequests > 0 ? Math.round((completedRequests / totalRequests) * 100) : 0;

    return {
      reportType: 'Monthly Maintenance Summary Report',
      period: `${month} ${year}`,
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      filtersApplied: { Month: month, Year: year },
      summaryMetrics: {
        totalRequests,
        completedRequests,
        pendingRequests,
        inProgressRequests,
        rejectedRequests,
        completionRate: `${completionRate}%`
      },
      tableColumns: ['Metric', 'Value', 'Status / Notes'],
      tableRows: [
        ['Total Requests', totalRequests, 'Total maintenance requests received in period'],
        ['Completed Requests', completedRequests, 'Work successfully completed & verified'],
        ['Pending Requests', pendingRequests, 'Awaiting review or work assignment'],
        ['In Progress Requests', inProgressRequests, 'Currently actively handled by technical teams'],
        ['Rejected Requests', rejectedRequests, 'Cancelled or dismissed by administration'],
        ['Completion Rate (%)', `${completionRate}%`, 'Completed vs Total requests ratio']
      ],
      rawItems: activeRequests
    };
  }

  // -------------------------------------------------------------
  // 2. Maintenance Requests Report
  // Columns: Request ID | Date | Requester | Department | Location | Issue Type | Priority | Status
  // Filters: Date Range, Department, Status, Priority, Location
  // -------------------------------------------------------------
  if (reportType === 'Maintenance Requests Report') {
    let filtered = activeRequests.filter(r => {
      // Department filter
      if (department && department !== 'All Departments') {
        const dept = (r.requester_dept || r.department || r.division || '').toLowerCase();
        if (!dept.includes(department.toLowerCase())) return false;
      }
      // Status filter
      if (status && status !== 'All Statuses') {
        const st = normalizeStatus(r.status || r.mapped_status);
        if (st.toLowerCase() !== status.toLowerCase()) return false;
      }
      // Priority filter
      if (priority && priority !== 'All Priorities') {
        const pr = (r.priority || 'Medium').toLowerCase();
        if (pr !== priority.toLowerCase()) return false;
      }
      // Location filter
      if (location && location.trim()) {
        const loc = (r.location || r.building || '').toLowerCase();
        if (!loc.includes(location.toLowerCase().trim())) return false;
      }
      return true;
    });

    const tableColumns = [
      'Request ID',
      'Date',
      'Requester',
      'Department',
      'Location',
      'Issue Type',
      'Priority',
      'Status'
    ];

    const tableRows = filtered.map(r => {
      const reqId = r.id ? (String(r.id).startsWith('REQ-') ? r.id : `REQ-${String(r.id).padStart(4, '0')}`) : 'REQ-0000';
      const dateStr = formatDate(getRequestDate(r));
      const requester = r.requester_name || r.requester || 'ITUM Staff';
      const dept = r.requester_dept || r.department || r.division || 'General Division';
      const loc = r.location || r.building || 'Main Campus';
      const issueType = r.category || r.issue_type || r.title || 'General Maintenance';
      const pr = r.priority || 'Medium';
      const st = normalizeStatus(r.status || r.mapped_status);

      return [reqId, dateStr, requester, dept, loc, issueType, pr, st];
    });

    return {
      reportType: 'Maintenance Requests Report',
      period: startDate && endDate ? `${startDate} to ${endDate}` : `${month} ${year}`,
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      filtersApplied: {
        'Date Range': startDate && endDate ? `${startDate} - ${endDate}` : `${month} ${year}`,
        Department: department,
        Status: status,
        Priority: priority,
        Location: location || 'All Locations'
      },
      summaryMetrics: {
        totalRecords: tableRows.length,
        departmentsRepresented: new Set(tableRows.map(row => row[3])).size,
        completedCount: tableRows.filter(row => row[7] === 'Completed').length,
        pendingCount: tableRows.filter(row => row[7] === 'Pending').length
      },
      tableColumns,
      tableRows,
      rawItems: filtered
    };
  }

  // -------------------------------------------------------------
  // 3. Priority Analysis Report
  // Contents: Critical | High | Medium | Low breakdown
  // -------------------------------------------------------------
  if (reportType === 'Priority Analysis Report') {
    const priorities = ['Critical', 'High', 'Medium', 'Low'];
    const summary = {};

    priorities.forEach(p => {
      summary[p] = { total: 0, completed: 0, inProgress: 0, pending: 0 };
    });

    activeRequests.forEach(r => {
      const rawPr = (r.priority || 'Medium').toString().trim();
      let matched = 'Medium';
      if (rawPr.toLowerCase().includes('crit')) matched = 'Critical';
      else if (rawPr.toLowerCase().includes('high')) matched = 'High';
      else if (rawPr.toLowerCase().includes('low')) matched = 'Low';

      summary[matched].total++;
      const st = normalizeStatus(r.status || r.mapped_status);
      if (st === 'Completed') summary[matched].completed++;
      else if (st === 'In Progress') summary[matched].inProgress++;
      else summary[matched].pending++;
    });

    const totalReqs = activeRequests.length || 1;
    const tableColumns = ['Priority Level', 'Total Requests', 'Completed', 'In Progress', 'Pending', 'Completion Rate (%)', 'Share of Total (%)'];
    const tableRows = priorities.map(p => {
      const data = summary[p];
      const rate = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
      const share = Math.round((data.total / totalReqs) * 100);
      return [
        p,
        data.total,
        data.completed,
        data.inProgress,
        data.pending,
        `${rate}%`,
        `${share}%`
      ];
    });

    return {
      reportType: 'Priority Analysis Report',
      period: `${month} ${year}`,
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      filtersApplied: { Month: month, Year: year },
      summaryMetrics: {
        criticalRequests: summary['Critical'].total,
        highRequests: summary['High'].total,
        mediumRequests: summary['Medium'].total,
        lowRequests: summary['Low'].total,
        totalAnalyzed: activeRequests.length
      },
      tableColumns,
      tableRows,
      rawItems: activeRequests
    };
  }

  // -------------------------------------------------------------
  // 4. Department-wise Maintenance Report
  // Columns: Department | Requests | Completed | Pending
  // -------------------------------------------------------------
  if (reportType === 'Department-wise Maintenance Report') {
    const deptMap = {};

    activeRequests.forEach(r => {
      let dept = r.requester_dept || r.department || r.division || 'General Administration';
      if (department && department !== 'All Departments') {
        if (!dept.toLowerCase().includes(department.toLowerCase())) return;
      }

      if (!deptMap[dept]) {
        deptMap[dept] = { requests: 0, completed: 0, pending: 0 };
      }
      deptMap[dept].requests++;
      const st = normalizeStatus(r.status || r.mapped_status);
      if (st === 'Completed') {
        deptMap[dept].completed++;
      } else {
        deptMap[dept].pending++;
      }
    });

    // If specific department chosen but has 0 records in current filter
    if (department && department !== 'All Departments' && !deptMap[department]) {
      deptMap[department] = { requests: 0, completed: 0, pending: 0 };
    }

    // If All Departments was chosen and empty, default to IT department
    if (Object.keys(deptMap).length === 0) {
      deptMap['Information Technology'] = { requests: 0, completed: 0, pending: 0 };
    }

    const tableColumns = ['Department', 'Requests', 'Completed', 'Pending'];
    const tableRows = Object.entries(deptMap)
      .sort((a, b) => b[1].requests - a[1].requests)
      .map(([name, data]) => [name, data.requests, data.completed, data.pending]);

    const totalDepts = tableRows.length;
    const totalReqs = tableRows.reduce((acc, row) => acc + (row[1] || 0), 0);
    const totalComp = tableRows.reduce((acc, row) => acc + (row[2] || 0), 0);

    return {
      reportType: 'Department-wise Maintenance Report',
      period: month === 'All Months' ? `Year ${year}` : `${month} ${year}`,
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      filtersApplied: { Month: month, Year: year, Department: department },
      summaryMetrics: {
        totalDepartments: totalDepts,
        totalRequests: totalReqs,
        totalCompleted: totalComp,
        pendingTotal: totalReqs - totalComp
      },
      tableColumns,
      tableRows,
      rawItems: activeRequests
    };
  }

  // -------------------------------------------------------------
  // 5. Staff Workload Report
  // Columns: Labourer | Assigned Date | Assign work ID | Completed
  // -------------------------------------------------------------
  if (reportType === 'Staff Workload Report') {
    let rows = [];

    // Filter jobs by time if specified
    const timeFilteredJobs = (jobsList || []).filter(j => {
      const d = getRequestDate(j) || (j.start_date ? new Date(j.start_date) : null);
      if (!d) return true;
      if (startDate && endDate) {
        const s = new Date(startDate);
        const e = new Date(endDate);
        e.setHours(23, 59, 59, 999);
        return d >= s && d <= e;
      }
      if (month && month !== 'All Months' && monthIdx !== -1) {
        return d.getFullYear() === targetYear && d.getMonth() === monthIdx;
      }
      return d.getFullYear() === targetYear;
    });

    const candidateJobs = timeFilteredJobs.length > 0 ? timeFilteredJobs : (jobsList || []);

    if (candidateJobs.length > 0) {
      rows = candidateJobs.map(j => {
        let staffName = j.lead_person || j.team_name || 'Technical Staff';
        if (staffName.includes(' - ')) {
          staffName = staffName.split(' - ')[0].trim();
        }
        const assignedDate = formatDate(j.start_date || j.created_at || j.scheduled_date || new Date());
        const assignWorkId = j.id || (j.request_id ? `JOB-${j.request_id.replace('REQ-', '')}` : 'JOB-1001');
        const completed = normalizeStatus(j.status);
        return [staffName, assignedDate, assignWorkId, completed];
      });
    } else {
      // If no jobs list provided, derive from assigned requests in database
      const assignedReqs = activeRequests.filter(r => r.assigned_team_name || r.assigned_officer);
      if (assignedReqs.length > 0) {
        assignedReqs.forEach(r => {
          let staffName = r.assigned_officer || (r.assigned_team_name ? r.assigned_team_name.replace(/Team/i, '').trim() : 'Technical Staff');
          const assignedDate = formatDate(getRequestDate(r) || new Date());
          const assignWorkId = r.id ? `JOB-${String(r.id).replace('REQ-', '')}` : 'JOB-1001';
          const completed = normalizeStatus(r.status || r.mapped_status);
          rows.push([staffName, assignedDate, assignWorkId, completed]);
        });
      }
    }

    // Filter by specific labourer if chosen
    if (labourer && labourer !== 'All Labourers') {
      rows = rows.filter(r => r[0].toLowerCase().includes(labourer.toLowerCase().trim()));
    }

    const tableColumns = ['Labourer', 'Assigned Date', 'Assign work ID', 'Completed'];

    return {
      reportType: 'Staff Workload Report',
      period: month === 'All Months' ? `Year ${year}` : `${month} ${year}`,
      generatedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      filtersApplied: { Month: month, Year: year, Labourer: labourer },
      summaryMetrics: {
        totalAssignments: rows.length,
        completedWorks: rows.filter(r => r[3] === 'Completed').length,
        inProgressWorks: rows.filter(r => r[3] === 'In Progress' || r[3] === 'Pending').length,
        staffCount: new Set(rows.map(r => r[0])).size
      },
      tableColumns,
      tableRows: rows,
      rawItems: activeRequests
    };
  }

  // Fallback
  return {
    reportType,
    period: `${month} ${year}`,
    generatedDate: new Date().toLocaleDateString(),
    tableColumns: ['Item', 'Details'],
    tableRows: [['Report Type', reportType]],
    summaryMetrics: {}
  };
}

// ==============================================================================
// EXPORT TO EXCEL (CSV with UTF-8 BOM for Microsoft Excel)
// ==============================================================================
export function exportReportToExcel(reportData) {
  if (!reportData) return;

  const cleanTitle = reportData.reportType || 'Maintenance Report';
  const period = reportData.period || 'August 2026';
  const filename = `${cleanTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${period.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;

  const lines = [];

  // Header Block
  lines.push('"INSTITUTE OF TECHNOLOGY UNIVERSITY OF MORATUWA (ITUM)"');
  lines.push('"SERVA - CENTRAL MAINTENANCE MANAGEMENT SYSTEM"');
  lines.push(`"OFFICIAL REPORT: ${cleanTitle.toUpperCase()}"`);
  lines.push(`"Reporting Period: ${period}"`);
  lines.push(`"Generated On: ${reportData.generatedDate || new Date().toLocaleString()}"`);
  lines.push(`"Generated By: Institutional Maintenance Administration"`);
  lines.push('""');

  // Filters Block
  if (reportData.filtersApplied && Object.keys(reportData.filtersApplied).length > 0) {
    lines.push('"--- APPLIED FILTERS ---"');
    Object.entries(reportData.filtersApplied).forEach(([k, v]) => {
      lines.push(`"${k}","${v}"`);
    });
    lines.push('""');
  }

  // Summary Metrics Block
  if (reportData.summaryMetrics && Object.keys(reportData.summaryMetrics).length > 0) {
    lines.push('"--- EXECUTIVE SUMMARY METRICS ---"');
    Object.entries(reportData.summaryMetrics).forEach(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      lines.push(`"${label}","${v}"`);
    });
    lines.push('""');
  }

  // Data Table
  lines.push('"--- REPORT DATA RECORDS ---"');
  if (reportData.tableColumns && reportData.tableColumns.length > 0) {
    const colHeader = reportData.tableColumns.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',');
    lines.push(colHeader);
  }

  if (reportData.tableRows && reportData.tableRows.length > 0) {
    reportData.tableRows.forEach(row => {
      const rowLine = row.map(cell => `"${String(cell !== undefined && cell !== null ? cell : '').replace(/"/g, '""')}"`).join(',');
      lines.push(rowLine);
    });
  }

  lines.push('""');
  lines.push('"Confidential Institutional Document - For Official ITUM Maintenance Auditing Only"');

  const csvContent = '\uFEFF' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ==============================================================================
// EXPORT TO PDF (Clean Professional Print-to-PDF Window)
// ==============================================================================
export function exportReportToPdf(reportData) {
  if (!reportData) return;

  const cleanTitle = reportData.reportType || reportData.name || 'Maintenance Report';
  const period = reportData.period || 'October 2026';

  // Automatically record downloaded report into history
  try {
    if (typeof window !== 'undefined') {
      const repId = reportData.id || `REP-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
      const downloadRecord = {
        id: repId,
        name: cleanTitle,
        type: reportData.reportType || reportData.type || 'Summary Report',
        period: period,
        generatedBy: reportData.generatedBy || 'System Administrator',
        generatedDate: reportData.generatedDate || new Date().toLocaleString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'Ready',
        recordsCount: (reportData.tableRows || []).length || 0,
        format: 'PDF',
        reportData: reportData
      };

      try {
        const saved = localStorage.getItem('serva_downloaded_reports');
        const list = saved ? JSON.parse(saved) : [];
        const filtered = list.filter(r => r.id !== repId && !['REP-2026-001', 'REP-2026-002', 'REP-2026-003', 'REP-2026-004', 'REP-2026-005'].includes(r.id));
        const updated = [downloadRecord, ...filtered].slice(0, 50);
        localStorage.setItem('serva_downloaded_reports', JSON.stringify(updated));
        localStorage.setItem('serva_recent_reports', JSON.stringify(updated));
      } catch (e) {}

      window.dispatchEvent(new CustomEvent('serva:report-downloaded', { detail: downloadRecord }));
      window.dispatchEvent(new CustomEvent('serva:report-generated', { detail: downloadRecord }));

      try {
        fetch('/api/reports/record', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(downloadRecord)
        }).catch(() => {});
      } catch (e) {}
    }
  } catch (err) {
    console.warn('Could not record downloaded report:', err);
  }

  let summaryHtml = '';
  if (reportData.summaryMetrics && Object.keys(reportData.summaryMetrics).length > 0) {
    summaryHtml = `
      <div class="metrics-grid">
        ${Object.entries(reportData.summaryMetrics).map(([k, v]) => {
          const label = k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          return `
            <div class="metric-card">
              <div class="metric-label">${label}</div>
              <div class="metric-value">${v}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  let tableHeaderHtml = '';
  if (reportData.tableColumns) {
    tableHeaderHtml = `
      <thead>
        <tr>
          ${reportData.tableColumns.map(c => `<th>${c}</th>`).join('')}
        </tr>
      </thead>
    `;
  }

  let tableBodyHtml = '';
  if (reportData.tableRows && reportData.tableRows.length > 0) {
    tableBodyHtml = `
      <tbody>
        ${reportData.tableRows.map((row, idx) => `
          <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
            ${row.map(cell => {
              const val = cell !== undefined && cell !== null ? String(cell) : '';
              let badgeClass = '';
              if (val === 'Completed') badgeClass = 'badge badge-completed';
              else if (val === 'Pending') badgeClass = 'badge badge-pending';
              else if (val === 'In Progress') badgeClass = 'badge badge-progress';
              else if (val === 'Rejected' || val === 'Critical') badgeClass = 'badge badge-rejected';
              else if (val === 'High') badgeClass = 'badge badge-high';

              return `<td>${badgeClass ? `<span class="${badgeClass}">${val}</span>` : val}</td>`;
            }).join('')}
          </tr>
        `).join('')}
      </tbody>
    `;
  } else {
    tableBodyHtml = `<tbody><tr><td colspan="${(reportData.tableColumns || []).length}" style="text-align: center; padding: 20px;">No records found for the selected period.</td></tr></tbody>`;
  }

  const printHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${cleanTitle} - ${period}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 15mm 15mm 15mm;
        }
        body {
          font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
          color: #1e293b;
          background: #ffffff;
          margin: 0;
          padding: 24px;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .header-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2.5px solid #58000f;
          padding-bottom: 14px;
          margin-bottom: 20px;
        }
        .header-left-with-logo {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .university-logo {
          width: 52px;
          height: 52px;
          object-fit: contain;
          border-radius: 50%;
          border: 1.5px solid #58000f;
          padding: 2px;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          flex-shrink: 0;
        }
        .header-title-block h1 {
          font-size: 19px;
          font-weight: 800;
          color: #58000f;
          margin: 0;
          letter-spacing: -0.3px;
        }
        .header-title-block h2 {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          margin: 3px 0 0 0;
        }
        .header-title-block p {
          font-size: 11px;
          color: #64748b;
          margin: 3px 0 0 0;
        }
        .header-badge {
          background: #fdf2f2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-align: right;
        }
        .report-meta-bar {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          margin-bottom: 20px;
        }
        .report-meta-bar span b {
          color: #0f172a;
        }
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 10px;
          margin-bottom: 24px;
        }
        .metric-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 12px;
          border-top: 3px solid #58000f;
        }
        .metric-label {
          font-size: 10px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }
        .metric-value {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-top: 4px;
        }
        .table-section-title {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
          margin-bottom: 20px;
        }
        th {
          background-color: #58000f;
          color: #ffffff;
          font-weight: 600;
          text-align: left;
          padding: 8px 10px;
          border: 1px solid #58000f;
        }
        td {
          padding: 7px 10px;
          border: 1px solid #e2e8f0;
          color: #334155;
        }
        tr.even {
          background-color: #f8fafc;
        }
        .badge {
          display: inline-block;
          padding: 2px 7px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
        }
        .badge-completed { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
        .badge-pending { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .badge-progress { background: #dbeafe; color: #1e40af; border: 1px solid #bfdbfe; }
        .badge-rejected { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        .badge-high { background: #ffedd5; color: #9a3412; border: 1px solid #fed7aa; }
        .footer {
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px dashed #cbd5e1;
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="header-left-with-logo">
          <img src="${UNIVERSITY_LOGO_BASE64}" alt="University of Moratuwa Logo" class="university-logo" />
          <div class="header-title-block">
            <h1>Institute of Technology, University of Moratuwa</h1>
            <h2>SERVA - Central Maintenance Management System</h2>
            <p>Official Institutional Audit & Maintenance Operations Report</p>
          </div>
        </div>
        <div class="header-badge">
          OFFICIAL ITUM REPORT<br>
          <span style="font-weight: normal; font-size: 10px;">ID: ITUM-REP-${Date.now().toString().slice(-6)}</span>
        </div>
      </div>

      <div class="report-meta-bar">
        <span><b>Report Type:</b> ${cleanTitle}</span>
        <span><b>Reporting Period:</b> ${period}</span>
        <span><b>Date Generated:</b> ${reportData.generatedDate || new Date().toLocaleDateString()}</span>
      </div>

      ${summaryHtml}

      <div class="table-section-title">Detailed Records (${(reportData.tableRows || []).length} Entries)</div>
      <table>
        ${tableHeaderHtml}
        ${tableBodyHtml}
      </table>

      <div class="footer">
        <span>ITUM Maintenance Division &bull; Diyagama, Homagama, Sri Lanka</span>
        <span>Generated automatically by SERVA System</span>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=950,height=750');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  } else {
    // If popups blocked, download as printable HTML file
    const blob = new Blob([printHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${cleanTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${period.replace(/[^a-zA-Z0-9]/g, '_')}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
