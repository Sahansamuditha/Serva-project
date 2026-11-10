import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Clock, Calendar, Wrench, AlertCircle, CheckCircle2, XCircle, Search, X, RotateCcw } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import RequestReview from '../../MaintainOfficer/pages/RequestReview';
import { api } from '../services/api';

export default function RequestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [data, setData] = useState(null);
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedRequestId, setSelectedRequestId] = useState(() => searchParams.get('id') || searchParams.get('requestId') || null);

  // Sync state if URL query param changes
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchTerm(q);
  }, [searchParams]);

  useEffect(() => {
    const targetId = searchParams.get('id') || searchParams.get('requestId');
    if (targetId) {
      setSelectedRequestId(targetId);
    }
  }, [searchParams]);

  const loadRequestsData = async () => {
    setLoading(true);
    try {
      const [dashRes, reqsRes] = await Promise.all([
        api.getDashboard(),
        api.getRequests()
      ]);
      if (dashRes && dashRes.success) {
        setData(dashRes);
      }
      if (reqsRes && reqsRes.success) {
        const raw = reqsRes.data || reqsRes.requests || [];
        const mapped = raw.map((r) => ({
          ...r,
          requester: r.requester_name || r.requester || 'Campus Staff',
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently',
          assignedTo: r.assigned_team_name || r.assignedTo || 'Unassigned'
        }));
        setRequestsList(mapped);
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequestsData();
  }, []);

  const handleOpenDetails = (request) => {
    setSelectedRequestId(request.id);
    setSearchParams({ id: request.id });
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await api.updateRequestStatus(requestId, 'update', newStatus);
      await loadRequestsData();
      if (selectedRequest && selectedRequest.id === requestId) {
        setSelectedRequest((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setCategoryFilter('All');
    setSearchParams({});
  };

  const filteredRequests = requestsList.filter((r) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      r.id.toLowerCase().includes(term) ||
      r.title.toLowerCase().includes(term) ||
      r.location.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      r.requester.toLowerCase().includes(term) ||
      r.priority.toLowerCase().includes(term) ||
      r.status.toLowerCase().includes(term) ||
      (r.assignedTo && r.assignedTo.toLowerCase().includes(term));

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Rejected'
        ? (r.status === 'Rejected' || r.status === 'Cancelled')
        : r.status.toLowerCase() === statusFilter.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || r.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (selectedRequestId) {
    return (
      <div className="page-container">
        <RequestReview
          requestId={selectedRequestId}
          readOnly={true}
          onBack={() => {
            setSelectedRequestId(null);
            setSearchParams({});
            loadRequestsData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Title */}
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">Maintenance Requests</h1>
          <p className="page-header-subtitle">
            Review incoming maintenance requests, search by keyword or user, and track approval statuses.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Requests" value={requestsList.length} icon={FileText} color="blue" />
        <StatCard label="Pending" value={requestsList.filter(r => r.status === 'Pending').length} icon={Clock} color="amber" />
        <StatCard label="Scheduled" value={requestsList.filter(r => r.status === 'Scheduled').length} icon={Calendar} color="purple" />
        <StatCard label="Rejected" value={requestsList.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length} icon={XCircle} color="red" />
      </div>

      {/* Table Card */}
      <div className="content-card">
        {/* Filters Header Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '20px' }}>
          {/* Results Info */}
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            Showing <strong style={{ color: '#0f172a' }}>{filteredRequests.length}</strong> of {requestsList.length} requests
            {searchTerm && <span> for "<strong>{searchTerm}</strong>"</span>}
          </div>

          {/* Filters */}

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              className="form-select"
              style={{ width: '140px', height: '38px' }}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="Plumbing">Plumbing</option>
              <option value="IT Infrastructure">IT Infrastructure</option>
              <option value="General">General</option>
            </select>

            <select
              className="form-select"
              style={{ width: '140px', height: '38px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
            </select>

            {(searchTerm || statusFilter !== 'All' || categoryFilter !== 'All') && (
              <button
                className="btn-outline"
                onClick={handleResetFilters}
                style={{ height: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Table / Empty State */}
        {filteredRequests.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <Search size={36} style={{ color: '#94a3b8', marginBottom: '10px' }} />
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>No requests match your search</h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Try searching with different keywords or clearing your active status and category filters.
            </p>
            <button className="btn-primary" onClick={handleResetFilters} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <RotateCcw size={14} /> Clear Search & Filters
            </button>
          </div>
        ) : (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Title</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Requester</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td 
                      style={{ fontWeight: '600', color: '#7a1521', cursor: 'pointer' }}
                      onClick={() => handleOpenDetails(req)}
                      title="Click to view details"
                    >
                      {req.id}
                    </td>
                    <td style={{ fontWeight: '600', color: '#0f172a' }}>{req.title}</td>
                    <td style={{ color: '#475569' }}>{req.location}</td>
                    <td style={{ color: '#475569' }}>{req.category}</td>
                    <td style={{ color: '#475569' }}>{req.requester}</td>
                    <td>
                      <StatusBadge status={req.priority} />
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="table-btn-manage"
                        onClick={() => handleOpenDetails(req)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

