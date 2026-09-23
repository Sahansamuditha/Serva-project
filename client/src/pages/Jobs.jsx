import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Clock,
  Calendar,
  CheckCircle2,
  Search,
  SlidersHorizontal,
  Download,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function Jobs({ onSelectJob, globalSearch = '' }) {
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({ total: 84, inProgress: 18, scheduled: 12, completed: 54 });
  const [search, setSearch] = useState(globalSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedJobs, setSelectedJobs] = useState(['#JOB-1024', '#JOB-1025']);

  useEffect(() => {
    setSearch(globalSearch);
  }, [globalSearch]);

  // Sorting state
  const [sortField, setSortField] = useState('none'); // 'none' | 'jobId' | 'priority' | 'title' | 'status' | 'assignedTeam'
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const loadJobs = async () => {
    try {
      const data = await api.getJobs({
        search,
        status: statusFilter,
        priority: priorityFilter,
        category: categoryFilter
      });
      setJobs(data.jobs || []);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [search, statusFilter, priorityFilter, categoryFilter]);

  const toggleSelectJob = (id) => {
    if (selectedJobs.includes(id)) {
      setSelectedJobs(selectedJobs.filter((j) => j !== id));
    } else {
      setSelectedJobs([...selectedJobs, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedJobs.length === sortedJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(sortedJobs.map((j) => j.jobId || j.id));
    }
  };

  const handleSortSelect = (field) => {
    if (sortField === field) {
      // Toggle order if clicking the same field
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      // Default priority to desc (Critical first), others to asc
      setSortOrder(field === 'priority' ? 'desc' : 'asc');
    }
  };

  // Helper to sort jobs list
  const getSortedJobs = (jobList) => {
    if (!sortField || sortField === 'none') return jobList;

    return [...jobList].sort((a, b) => {
      let aVal = '';
      let bVal = '';

      if (sortField === 'jobId') {
        aVal = a.jobId || a.id || '';
        bVal = b.jobId || b.id || '';
      } else if (sortField === 'title') {
        aVal = (a.fullTitle || a.title || '').toLowerCase();
        bVal = (b.fullTitle || b.title || '').toLowerCase();
      } else if (sortField === 'priority') {
        const priorityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
        const aW = priorityWeights[(a.priority || '').toLowerCase()] || 0;
        const bW = priorityWeights[(b.priority || '').toLowerCase()] || 0;
        return sortOrder === 'asc' ? aW - bW : bW - aW;
      } else if (sortField === 'status') {
        const statusWeights = { 'in progress': 3, scheduled: 2, completed: 1 };
        const aStatus = (a.jobStatus || a.status || '').toLowerCase();
        const bStatus = (b.jobStatus || b.status || '').toLowerCase();
        const aW = statusWeights[aStatus] || 0;
        const bW = statusWeights[bStatus] || 0;
        return sortOrder === 'asc' ? aW - bW : bW - aW;
      } else if (sortField === 'assignedTeam') {
        aVal = (a.assignedTeam || '').toLowerCase();
        bVal = (b.assignedTeam || '').toLowerCase();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedJobs = getSortedJobs(jobs);

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity ml-1" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#58000f] ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#58000f] ml-1" />
    );
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return <span className="bg-red-50 text-red-600 border border-red-200/80 px-2.5 py-0.5 rounded text-[11px] font-semibold">Critical</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200/80 px-2.5 py-0.5 rounded text-[11px] font-semibold">High</span>;
      case 'medium':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200/80 px-2.5 py-0.5 rounded text-[11px] font-semibold">Medium</span>;
      case 'low':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/80 px-2.5 py-0.5 rounded text-[11px] font-semibold">Low</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-[11px]">{priority}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return <span className="bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-full text-xs">In Progress</span>;
      case 'scheduled':
        return <span className="bg-amber-100 text-amber-800 font-medium px-3 py-1 rounded-full text-xs">Scheduled</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 font-medium px-3 py-1 rounded-full text-xs">Completed</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-medium px-3 py-1 rounded-full text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Jobs Management</h1>
        <p className="text-xs text-slate-500 mt-1">Track, schedule, and manage active and historical maintenance tasks.</p>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Jobs</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">In Progress</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.inProgress}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Scheduled</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.scheduled}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Completed</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.completed}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="admin-card overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
            >
              <option value="All">Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
            >
              <option value="All">Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
            >
              <option value="All">Category</option>
              <option value="HVAC">HVAC</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Civil">Civil</option>
            </select>
          </div>

          {/* Sort Button & Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition-all ${sortField !== 'none'
                  ? 'bg-[#58000f] text-white border-[#58000f] shadow-sm'
                  : 'text-slate-700 border-slate-200 bg-white hover:bg-slate-50'
                }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort</span>
              {sortField !== 'none' && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-white/20 text-white rounded font-bold uppercase tracking-wider">
                  {sortField === 'jobId' ? 'ID' : sortField} {sortOrder === 'asc' ? '↑' : '↓'}
                </span>
              )}
            </button>

            {isSortMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsSortMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-3 px-3 z-20 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#58000f]" />
                      Sort Jobs By
                    </span>
                    {sortField !== 'none' && (
                      <button
                        onClick={() => {
                          setSortField('none');
                          setSortOrder('asc');
                        }}
                        className="text-[11px] text-slate-400 hover:text-[#58000f] flex items-center gap-1 font-medium transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="space-y-1">
                    {[
                      { id: 'jobId', label: 'Job ID' },
                      { id: 'priority', label: 'Priority Level' },
                      { id: 'title', label: 'Job Title' },
                      { id: 'status', label: 'Job Status' },
                      { id: 'assignedTeam', label: 'Assigned Team' },
                    ].map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSortSelect(option.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${sortField === option.id
                            ? 'bg-[#fff5f6] text-[#58000f] font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <span>{option.label}</span>
                        {sortField === option.id && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-[#58000f]">
                            {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Direction:</span>
                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                      <button
                        onClick={() => setSortOrder('asc')}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${sortOrder === 'asc'
                            ? 'bg-white text-slate-900 shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        Ascending ↑
                      </button>
                      <button
                        onClick={() => setSortOrder('desc')}
                        className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${sortOrder === 'desc'
                            ? 'bg-white text-slate-900 shadow-xs font-bold'
                            : 'text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        Descending ↓
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedJobs.length === sortedJobs.length && sortedJobs.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] border-slate-300 accent-[#58000f]"
                  />
                </th>
                <th
                  onClick={() => handleSortSelect('jobId')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center">
                    JOB ID
                    {renderSortIcon('jobId')}
                  </div>
                </th>
                <th className="py-3.5 px-4">REQUEST REF</th>
                <th
                  onClick={() => handleSortSelect('title')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center">
                    JOB TITLE
                    {renderSortIcon('title')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortSelect('assignedTeam')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center">
                    ASSIGNED TEAM
                    {renderSortIcon('assignedTeam')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortSelect('priority')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center">
                    PRIORITY
                    {renderSortIcon('priority')}
                  </div>
                </th>
                <th
                  onClick={() => handleSortSelect('status')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-800 select-none group transition-colors"
                >
                  <div className="flex items-center">
                    STATUS
                    {renderSortIcon('status')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {sortedJobs.map((job) => {
                const jId = job.jobId || job.id;
                const isSelected = selectedJobs.includes(jId);

                return (
                  <tr
                    key={jId}
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-[#fff8f7]/50' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectJob(jId)}
                        className="w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] border-slate-300 accent-[#58000f]"
                      />
                    </td>
                    <td className="py-4 px-4 font-bold text-[#58000f]">{jId}</td>
                    <td className="py-4 px-4 font-medium text-slate-500">{job.id}</td>
                    <td className="py-4 px-4 font-medium text-slate-900">{job.fullTitle || job.title}</td>
                    <td className="py-4 px-4 text-slate-700">{job.assignedTeam || 'Team Alpha'}</td>
                    <td className="py-4 px-4">{getPriorityBadge(job.priority)}</td>
                    <td className="py-4 px-4">{getStatusBadge(job.jobStatus || job.status)}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => onSelectJob(jId)}
                        className="px-4 py-1.5 text-xs font-semibold text-white bg-[#58000f] hover:bg-[#7a1521] rounded-lg shadow-sm transition-all"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>{selectedJobs.length} selected</span>
            <button
              onClick={() => alert(`Exporting ${selectedJobs.length} jobs`)}
              className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-slate-900"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span>Showing 1-{sortedJobs.length} of {stats.total}</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

