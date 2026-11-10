import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Search, 
  ArrowUpDown, 
  Download, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchJobs } from '../api';

export default function JobsManagement({ setCurrentPage, setSelectedJobId }) {
  const [jobs, setJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 3000);
    const onFocus = () => loadJobs();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  async function loadJobs() {
    const data = await fetchJobs();
    if (data && Array.isArray(data)) setJobs(data);
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(jobs.map(j => j.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredJobs = jobs.filter(job => {
    // In Jobs tab, scheduled is ONLY when labourers are scheduled or rejected.
    const hasScheduledLabourers = Number(job.labourers_assigned || job.labourersAssigned || 0) > 0;
    const isJobRejected = job.status?.toLowerCase() === 'rejected' || Boolean(job.notes?.includes('[REJECTED]'));
    const isUnassignedScheduled = ['scheduled', 'on hold', 'hold'].includes(job.status?.toLowerCase()) && !hasScheduledLabourers && !isJobRejected;
    if (isUnassignedScheduled) return false;

    const matchesSearch = !searchTerm || 
      job.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (job.requestRef || job.request_id || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.assignedTeam || job.team_name || job.lead_person || '')?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || 
      (statusFilter.toLowerCase() === 'in progress'
        ? ['in progress', 'pending start', 'assigned', 'pending'].includes(job.status?.toLowerCase())
        : statusFilter.toLowerCase() === 'scheduled'
        ? (isJobRejected || (['scheduled', 'on hold', 'hold'].includes(job.status?.toLowerCase()) && hasScheduledLabourers))
        : isJobRejected && statusFilter.toLowerCase() === 'rejected'
        ? true
        : job.status?.toLowerCase() === statusFilter.toLowerCase());
    const matchesPriority = priorityFilter === 'All' || job.priority?.toLowerCase() === priorityFilter.toLowerCase();
    const cf = categoryFilter.toLowerCase();
    const jc = (job.category || '').toLowerCase();
    const matchesCategory = cf === 'all' || 
      jc === cf ||
      (cf === 'electricity' && (jc === 'electricity' || jc === 'electrical')) ||
      (cf === 'civil & structural' && (jc.includes('civil') || jc.includes('structural')));
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-overdue';
      case 'medium': return 'badge-scheduled';
      case 'low': return 'badge-completed';
      default: return 'badge-tag';
    }
  };

  const getStatusBadgeClass = (status, notes) => {
    if (Boolean(notes?.includes('[REJECTED]')) || status?.toLowerCase() === 'rejected') {
      return 'badge-rejected';
    }
    switch (status?.toLowerCase()) {
      case 'in progress': return 'badge-in-progress';
      case 'completed': return 'badge-completed';
      case 'scheduled':
      case 'on hold':
      case 'hold': return 'badge-scheduled';
      case 'pending start':
      case 'assigned':
      case 'pending': return 'badge-pending';
      case 'rejected': return 'badge-rejected';
      default: return 'badge-tag';
    }
  };

  const validJobs = jobs.filter(j => {
    const s = (j.status || '').toLowerCase();
    const hasLabourers = Number(j.labourers_assigned || j.labourersAssigned || 0) > 0;
    const isJobRejected = s === 'rejected' || Boolean(j.notes?.includes('[REJECTED]'));
    if (isJobRejected) return true;
    return !(['scheduled', 'on hold', 'hold'].includes(s) && !hasLabourers);
  });
  const inProgressJobs = validJobs.filter(j => {
    const s = (j.status || '').toLowerCase();
    return ['in progress', 'pending start', 'assigned', 'pending'].includes(s);
  }).length;
  const scheduledJobs = validJobs.filter(j => {
    const s = (j.status || '').toLowerCase();
    const hasLabourers = Number(j.labourers_assigned || j.labourersAssigned || 0) > 0;
    const isJobRejected = s === 'rejected' || Boolean(j.notes?.includes('[REJECTED]'));
    return isJobRejected || ((s === 'scheduled' || s === 'on hold' || s === 'hold') && hasLabourers);
  }).length;
  const completedJobs = validJobs.filter(j => (j.status || '').toLowerCase() === 'completed').length;
  const totalJobs = inProgressJobs + scheduledJobs + completedJobs;

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="headline-md" style={{ color: '#1e293b' }}>
          Maintenance Jobs Management
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
          Track, schedule, and manage active and historical maintenance tasks.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="stat-cards-4-grid">
        <StatCard title="Total Jobs" value={totalJobs} icon={Briefcase} color="blue" onClick={() => setStatusFilter('All')} />
        <StatCard title="In Progress" value={inProgressJobs} icon={Clock} color="blue" onClick={() => setStatusFilter('In Progress')} />
        <StatCard title="Scheduled" value={scheduledJobs} icon={Calendar} color="orange" onClick={() => setStatusFilter('Scheduled')} />
        <StatCard title="Completed" value={completedJobs} icon={CheckCircle2} color="green" onClick={() => setStatusFilter('Completed')} />
      </div>

      {/* Jobs Table Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search ID or Name..." 
              style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status */}
          <div style={{ minWidth: '130px' }}>
            <select 
              className="form-select" 
              style={{ height: '38px', fontSize: '13px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div style={{ minWidth: '130px' }}>
            <select 
              className="form-select" 
              style={{ height: '38px', fontSize: '13px' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="All">Priority</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Category */}
          <div style={{ minWidth: '130px' }}>
            <select 
              className="form-select" 
              style={{ height: '38px', fontSize: '13px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Electricity">Electricity</option>
              <option value="Water">Water</option>
              <option value="Civil & Structural">Civil & Structural</option>
              <option value="HVAC">HVAC</option>
              <option value="Academic">Academic</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Gardening">Gardening</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {/* Sort */}
          <button className="btn btn-secondary" style={{ height: '38px', fontSize: '13px', gap: '6px' }}>
            <ArrowUpDown size={14} /> Sort
          </button>
        </div>

        {/* Table Content */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={jobs.length > 0 && selectedIds.length === jobs.length}
                    style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                </th>
                <th>JOB ID</th>
                <th>REQUEST REF</th>
                <th>JOB TITLE</th>
                <th>ASSIGNED TEAM</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Briefcase size={32} style={{ color: '#cbd5e1' }} />
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#475569' }}>No Maintenance Jobs Found</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Jobs will appear here once assigned to a supervisor.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => {
                  const isSelected = selectedIds.includes(job.id);
                  return (
                    <tr key={job.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleSelect(job.id)}
                          style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <div 
                          style={{ fontWeight: 600, color: '#7a1521', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setCurrentPage('job-details');
                          }}
                        >
                          #{job.id}
                        </div>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        #{String(job.requestRef || job.request_id || '').replace(/^#/, '')}
                      </td>
                      <td style={{ fontWeight: 500, color: '#1e293b' }}>
                        {job.title}
                      </td>
                      <td style={{ color: '#475569', fontSize: '13.5px' }}>
                        <div style={{ fontWeight: 500 }}>{job.assignedTeam || job.team_name || 'Assigned Team'}</div>
                        {job.lead_person && (
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            Lead: {job.lead_person.split(' - ')[0]}
                          </div>
                        )}
                        {(job.status?.toLowerCase() === 'rejected' || Boolean(job.notes?.includes('[REJECTED]'))) && (
                          <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 600, marginTop: '2px' }}>
                            Declined by technician
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(job.priority)}`}>
                          {job.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(job.status, job.notes)}`}>
                          {job.status?.toLowerCase() === 'rejected' || Boolean(job.notes?.includes('[REJECTED]')) ? 'Rejected' : job.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => {
                            setSelectedJobId(job.id);
                            setCurrentPage('job-details');
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ backgroundColor: '#7a1521', fontSize: '12px', padding: '6px 16px', borderRadius: '6px' }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '13px',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>{selectedIds.length} selected</span>
            <button className="btn btn-secondary btn-sm" style={{ gap: '6px' }} onClick={() => alert('Exporting selected jobs...')}>
              <Download size={14} /> Export
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Showing {filteredJobs.length > 0 ? `1-${filteredJobs.length}` : '0'} of {totalJobs}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                <ChevronLeft size={16} />
              </button>
              <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
