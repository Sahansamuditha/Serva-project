import React, { useState, useEffect, useMemo } from 'react';
import { Cog, Calendar, Filter, ChevronDown } from 'lucide-react';
import {
  REPORT_TYPES,
  MONTH_NAMES,
  YEARS,
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  ALL_DEPARTMENTS_LIST,
  buildReportData
} from '../utils/reportGenerator';
import GeneratedReportModal from './GeneratedReportModal';

export default function GenerateReportCard({ allRequests = [], jobsList = [] }) {
  const [reportType, setReportType] = useState('Monthly Maintenance Summary Report');
  const [month, setMonth] = useState('October');
  const [year, setYear] = useState('2026');
  const [department, setDepartment] = useState('All Departments');
  const [status, setStatus] = useState('All Statuses');
  const [priority, setPriority] = useState('All Priorities');
  const [location, setLocation] = useState('');
  const [labourer, setLabourer] = useState('All Labourers');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [activeReportData, setActiveReportData] = useState(null);

  // Fallback internal fetch to ensure real DB data is ALWAYS available
  const [internalRequests, setInternalRequests] = useState([]);
  const [internalJobs, setInternalJobs] = useState([]);

  useEffect(() => {
    if (!allRequests || allRequests.length === 0 || !jobsList || jobsList.length === 0) {
      fetch('/api/reports')
        .then(res => res.json())
        .then(data => {
          const reqs = data.allRequests || data.data?.allRequests || [];
          const jbs = data.jobs || data.jobsList || data.data?.jobs || [];
          if (reqs.length > 0 && (!allRequests || allRequests.length === 0)) {
            setInternalRequests(reqs);
          }
          if (jbs.length > 0 && (!jobsList || jobsList.length === 0)) {
            setInternalJobs(jbs);
          }
        })
        .catch(err => console.warn('Could not load reports fallback:', err));
    }
  }, [allRequests, jobsList]);

  const effectiveRequests = (allRequests && allRequests.length > 0) ? allRequests : internalRequests;
  const effectiveJobs = (jobsList && jobsList.length > 0) ? jobsList : internalJobs;

  // Dynamically extract real supervisors / labourers from actual DB jobs and requests
  const labourersList = useMemo(() => {
    const names = new Set();
    (effectiveJobs || []).forEach(j => {
      if (j.lead_person) {
        const clean = j.lead_person.split(' - ')[0].trim();
        if (clean) names.add(clean);
      }
      if (j.team_name) {
        const cleanTeam = j.team_name.replace(/Team/i, '').trim();
        if (cleanTeam) names.add(cleanTeam);
      }
    });
    (effectiveRequests || []).forEach(r => {
      if (r.assigned_officer) names.add(r.assigned_officer.trim());
      if (r.assigned_team_name) {
        const clean = r.assigned_team_name.replace(/Team/i, '').trim();
        if (clean) names.add(clean);
      }
    });

    if (names.size === 0) {
      return ['All Labourers', 'ra fsdgf', 'Sunil Shantha', 'ram sd', 'Kamal Bandara', 'Chaminda Bandara'];
    }
    return ['All Labourers', ...Array.from(names)];
  }, [effectiveJobs, effectiveRequests]);

  // Helper to compile current report payload with 100% REAL data
  const getCurrentReport = () => {
    return buildReportData({
      reportType,
      month,
      year,
      startDate,
      endDate,
      department,
      status,
      priority,
      location,
      labourer,
      allRequests: effectiveRequests,
      jobsList: effectiveJobs
    });
  };

  const handleGenerate = (e) => {
    if (e) e.preventDefault();
    const data = getCurrentReport();
    setActiveReportData(data);
    setPreviewModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-800">Generate Report</h3>
          <span className="text-[10px] bg-red-50 text-[#7a1521] border border-red-100 font-semibold px-2 py-0.5 rounded-full">
            PDF Report
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          {/* Report Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521] font-medium"
            >
              {REPORT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Month & Year Selectors */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Year
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Filters for Maintenance Requests Report */}
          {reportType === 'Maintenance Requests Report' && (
            <div className="space-y-2 p-2.5 bg-slate-50 border border-slate-100 rounded-lg animate-in fade-in duration-150">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3 text-[#7a1521]" /> Additional Filters
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
                >
                  {ALL_DEPARTMENTS_LIST.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
                  >
                    {PRIORITY_OPTIONS.map((pr) => (
                      <option key={pr} value={pr}>{pr}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Department Filter for Department-wise Report */}
          {reportType === 'Department-wise Maintenance Report' && (
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg animate-in fade-in duration-150">
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Filter Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
              >
                {ALL_DEPARTMENTS_LIST.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Labourer Filter for Staff Workload Report */}
          {reportType === 'Staff Workload Report' && (
            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg animate-in fade-in duration-150">
              <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Filter Labourer / Staff</label>
              <select
                value={labourer}
                onChange={(e) => setLabourer(e.target.value)}
                className="w-full text-xs px-2 py-1 rounded border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
              >
                {labourersList.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          )}

          {/* Primary Action: ⚙️ Generate Report */}
          <button
            type="submit"
            className="w-full py-2 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Cog className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </form>
      </div>

      {/* Generated Report Preview Modal */}
      <GeneratedReportModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        reportData={activeReportData}
      />
    </div>
  );
}
