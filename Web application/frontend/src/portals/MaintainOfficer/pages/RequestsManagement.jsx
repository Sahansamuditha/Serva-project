import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Calendar,
  AlertCircle, 
  XCircle,
  Search, 
  ChevronDown, 
  ArrowUpDown, 
  Download, 
  UserPlus, 
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { fetchRequests, fetchStats } from '../api';
import { getZoneFromLocation } from '../../../utils/campusLocations';

export default function RequestsManagement({ setCurrentPage, setSelectedRequestId }) {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPageNum, setCurrentPageNum] = useState(1);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    const onFocus = () => loadData();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  async function loadData() {
    const s = await fetchStats();
    if (s) setStats(s);

    const r = await fetchRequests();
    if (r && Array.isArray(r)) {
      const valid = r.filter(req => {
        const st = (req.status || '').toLowerCase();
        // A request whose job has been assigned to a labourer (in-progress, completed, or rejected by labourer)
        // must NEVER appear in the Requests tab - it belongs strictly in the Jobs tab.
        const isJobManaged = Boolean(
          (req.linked_job_id && (
            req.linked_job_status === 'Rejected' || 
            req.linked_job_notes?.includes('[REJECTED]') ||
            Number(req.linked_job_labourers || 0) > 0
          )) ||
          req.notes?.includes('[REJECTED]') ||
          st === 'assigned' ||
          st === 'in progress' ||
          st === 'completed'
        );
        if (isJobManaged) return false;

        return true;
      });
      setRequests(valid);
    }
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredRequests.map(r => r.id));
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

  const getPriorityBadgeClass = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical': return 'badge-critical';
      case 'high': return 'badge-overdue';
      case 'medium': return 'badge-pending';
      case 'low': return 'badge-completed';
      default: return 'badge-tag';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress': return 'badge-in-progress';
      case 'completed': return 'badge-completed';
      case 'pending review':
      case 'pending': return 'badge-pending';
      case 'accepted': return 'badge-completed';
      case 'scheduled': return 'badge-scheduled';
      case 'rejected':
      case 'cancelled': return 'badge-rejected';
      default: return 'badge-tag';
    }
  };

  const pendingCount = requests.filter(r => ['pending', 'pending review', 'accepted'].includes((r.status || '').toLowerCase())).length;
  const scheduledCount = requests.filter(r => ['scheduled', 'on hold', 'hold'].includes((r.status || '').toLowerCase())).length;
  const rejectedCount = requests.filter(r => ['rejected', 'cancelled'].includes((r.status || '').toLowerCase())).length;
  const totalRequestsCount = requests.length;

  const filteredRequests = requests.filter(req => {
    // 1. Search matching
    const matchesSearch = !searchTerm || 
      req.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (req.requester?.name || req.requester_name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.requester?.department || req.requester_dept || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Status matching
    const sf = statusFilter.toLowerCase();
    const s = (req.status || '').toLowerCase();
    const matchesStatus = sf === 'all' ||
      (sf === 'pending review' || sf === 'pending'
        ? ['pending', 'pending review', 'accepted'].includes(s)
        : sf === 'accepted'
        ? s === 'accepted'
        : sf === 'scheduled'
        ? ['scheduled', 'on hold', 'hold'].includes(s)
        : (sf === 'rejected' || sf === 'cancelled')
        ? ['rejected', 'cancelled'].includes(s)
        : s === sf);

    // 3. Priority matching
    const pf = priorityFilter.toLowerCase();
    const p = (req.priority || '').toLowerCase();
    const matchesPriority = pf === 'all' || p === pf;

    // 4. Category matching
    const cf = categoryFilter.toLowerCase();
    const c = (req.category || '').toLowerCase();
    const matchesCategory = cf === 'all' || 
      c === cf ||
      (cf === 'electricity' && (c === 'electricity' || c === 'electrical')) ||
      (cf === 'civil & structural' && (c.includes('civil') || c.includes('structural')));

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  return (
    <div>
      {/* Page Header Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 className="headline-md" style={{ color: '#1e293b' }}>
          Maintenance Requests Management
        </h1>
        <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
          Review, filter, accept/reject, and process incoming facility maintenance requests.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="stat-cards-4-grid">
        <StatCard 
          title="Requests" 
          value={totalRequestsCount} 
          icon={FileText} 
          color="blue" 
          onClick={() => setStatusFilter('All')} 
        />
        <StatCard 
          title="Pending" 
          value={pendingCount} 
          icon={Clock} 
          color="amber" 
          onClick={() => setStatusFilter('Pending')} 
        />
        <StatCard 
          title="Scheduled" 
          value={scheduledCount} 
          icon={Calendar} 
          color="purple" 
          onClick={() => setStatusFilter('Scheduled')} 
        />
        <StatCard 
          title="Rejected" 
          value={rejectedCount} 
          icon={XCircle} 
          color="red" 
          onClick={() => setStatusFilter('Rejected')} 
        />
      </div>

      {/* Main Table Card */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Search & Filter Toolbar */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Search Input */}
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

          {/* Status Dropdown */}
          <div style={{ minWidth: '130px' }}>
            <select 
              className="form-select" 
              style={{ height: '38px', fontSize: '13px' }}
              value={statusFilter === 'Pending' ? 'Pending Review' : statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Accepted">Accepted</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Priority Dropdown */}
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

          {/* Category Dropdown */}
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

          {/* Sort Button */}
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
                    checked={filteredRequests.length > 0 && selectedIds.length === filteredRequests.length}
                    style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                  />
                </th>
                <th>REQUEST ID</th>
                <th>REQUESTER INFO</th>
                <th>ISSUE SUMMARY</th>
                <th>LOCATION</th>
                <th>PRIORITY</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right', paddingRight: '20px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: '#64748b' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <FileText size={32} style={{ color: '#cbd5e1' }} />
                      <span style={{ fontWeight: 600, fontSize: '14px', color: '#475569' }}>No Maintenance Requests Found</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Try clearing your search or status filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedIds.includes(req.id);
                  const displayDate = req.submittedDate || (req.created_at ? new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today');
                  const requesterName = req.requester?.name || req.requester_name || 'Requester';
                  const requesterDept = req.requester?.department || req.requester_dept || 'General';

                  return (
                    <tr key={req.id}>
                      <td>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => handleToggleSelect(req.id)}
                          style={{ accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                        />
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#7a1521', cursor: 'pointer', whiteSpace: 'nowrap' }} onClick={() => {
                          setSelectedRequestId(req.id);
                          setCurrentPage('request-review');
                        }}>
                          #{req.id}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                          {displayDate}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{requesterName}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{requesterDept}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 500 }}>{req.title}</span>
                          <span className="badge-tag">{req.category}</span>
                        </div>
                      </td>
                      <td style={{ color: '#475569', fontSize: '13px' }}>
                        <div style={{ fontWeight: 500, color: '#1e293b', marginBottom: '3px' }}>
                          {req.location}
                        </div>
                        {(() => {
                          const z = req.zone || getZoneFromLocation(req.location);
                          if (!z) return null;
                          const isA = z.includes('A');
                          const isB = z.includes('B');
                          return (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '1px 7px',
                              borderRadius: '10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor: isA ? '#fef3c7' : isB ? '#e0f2fe' : '#dcfce7',
                              color: isA ? '#92400e' : isB ? '#075985' : '#166534',
                              border: `1px solid ${isA ? '#fde68a' : isB ? '#bae6fd' : '#bbf7d0'}`
                            }}>
                              📍 {z}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(req.priority)}`}>
                          {req.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(req.status)}`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '16px' }}>
                        <button 
                          onClick={() => {
                            setSelectedRequestId(req.id);
                            setCurrentPage('request-review');
                          }}
                          className="btn btn-primary btn-sm"
                          style={{ 
                            backgroundColor: '#7a1521', 
                            color: '#ffffff',
                            fontSize: '12px', 
                            padding: '6px 16px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            border: 'none',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
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

        {/* Table Footer Actions & Pagination */}
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
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ gap: '6px' }}
              onClick={() => alert(`Batch assigning ${selectedIds.length} requests`)}
            >
              <UserPlus size={14} /> Batch Assign
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ gap: '6px' }}
              onClick={() => alert(`Exporting ${selectedIds.length} requests data`)}
            >
              <Download size={14} /> Export
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Showing {filteredRequests.length > 0 ? `1-${filteredRequests.length}` : '0'} of {requests.length}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ padding: '4px 8px' }}
                disabled={currentPageNum === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ padding: '4px 8px' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
