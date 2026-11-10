import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
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
  }, [searchTerm, statusFilter, priorityFilter, categoryFilter]);

  async function loadData() {
    const s = await fetchStats();
    if (s) setStats(s);

    const r = await fetchRequests({
      search: searchTerm,
      status: statusFilter,
      priority: priorityFilter,
      category: categoryFilter
    });
    if (r) setRequests(r);
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(requests.map(r => r.id));
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
      case 'scheduled': return 'badge-scheduled';
      default: return 'badge-tag';
    }
  };

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

      {/* Top 5 Stat Cards */}
      <div className="stat-cards-5-grid">
        <StatCard title="Requests" value={stats?.totalRequests || 128} icon={FileText} color="blue" />
        <StatCard title="Pending" value={stats?.pendingRequests || 14} icon={Clock} color="amber" />
        <StatCard title="In Progress" value={stats?.inProgressRequests || 32} icon={Wrench} color="blue" />
        <StatCard title="Overdue" value={stats?.overdueRequests || 7} icon={AlertCircle} color="red" />
        <StatCard title="Completed" value={stats?.completedRequests || 75} icon={CheckCircle2} color="green" />
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">Status</option>
              <option value="Pending Review">Pending Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
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
              <option value="All">Category</option>
              <option value="HVAC">HVAC</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="AV Equip">AV Equip</option>
              <option value="Civil">Civil</option>
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
                    checked={requests.length > 0 && selectedIds.length === requests.length}
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
              {requests.map((req) => {
                const isSelected = selectedIds.includes(req.id);
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
                        {req.submittedDate}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{req.requester?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{req.requester?.department}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 500 }}>{req.title}</span>
                        <span className="badge-tag">{req.category}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569', fontSize: '13px' }}>
                      {req.location}
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
              })}
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
            <span>Showing 1-10 of 128</span>
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
