import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText, Clock, Wrench, AlertCircle, CheckCircle2, Search, X, RotateCcw } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import RequestDetailsModal from '../components/requests/RequestDetailsModal';
import { api } from '../services/api';

export default function RequestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [data, setData] = useState(null);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync state if URL query param changes
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchTerm(q);
  }, [searchParams]);

  const [requestsList, setRequestsList] = useState([
    {
      id: 'REQ-8292',
      title: 'Electrical issue in Lab 3',
      location: 'Computer Center (Lab 3)',
      category: 'Electrical',
      priority: 'High',
      status: 'Pending',
      requester: 'Dr. Kamal Silva',
      date: '22 Aug 2026',
      assignedTo: 'Electrical Response Team A'
    },
    {
      id: 'REQ-8291',
      title: 'AC Failure & Overheating',
      location: 'Server Room (U2017)',
      category: 'HVAC',
      priority: 'Critical',
      status: 'In Progress',
      requester: 'Dr. Sarah Jenkins',
      date: '22 Aug 2026',
      assignedTo: 'HVAC Specialist Unit'
    },
    {
      id: 'REQ-8290',
      title: 'Main Water Line Burst',
      location: 'Chemistry Lab (U2018)',
      category: 'Plumbing',
      priority: 'High',
      status: 'In Progress',
      requester: 'Dr. N. Fernando',
      date: '22 Aug 2026',
      assignedTo: 'Plumbing Emergency Team'
    },
    {
      id: 'REQ-8289',
      title: 'Faulty Breaker in Library',
      location: 'Reading Hall 2F',
      category: 'Electrical',
      priority: 'Medium',
      status: 'Completed',
      requester: 'Mrs. M. Senanayake',
      date: '21 Aug 2026',
      assignedTo: 'Electrical Team B'
    },
    {
      id: 'REQ-8288',
      title: 'Lighting Issue',
      location: 'Engineering Building',
      category: 'Electrical',
      priority: 'Low',
      status: 'Pending',
      requester: 'Prof. K. Wickramasinghe',
      date: '21 Aug 2026',
      assignedTo: 'General Maintenance Crew'
    },
    {
      id: 'REQ-8287',
      title: 'Network Socket Repair',
      location: 'Staff Room 102',
      category: 'IT Infrastructure',
      priority: 'Medium',
      status: 'Completed',
      requester: 'Mr. A. Perera',
      date: '20 Aug 2026',
      assignedTo: 'IT Support Team'
    },
    {
      id: 'REQ-8286',
      title: 'Elevator Maintenance Door Malfunction',
      location: 'Main Administrative Block',
      category: 'General',
      priority: 'High',
      status: 'In Progress',
      requester: 'Ms. T. Gunaratne',
      date: '19 Aug 2026',
      assignedTo: 'Elevator Maintenance Techs'
    }
  ]);

  useEffect(() => {
    api.getDashboard().then((res) => {
      if (res && res.success) {
        setData(res);
      }
    }).catch(console.error);
  }, []);

  const handleOpenDetails = (request) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleStatusChange = (requestId, newStatus) => {
    setRequestsList((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest((prev) => ({ ...prev, status: newStatus }));
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

    const matchesStatus = statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesCategory = categoryFilter === 'All' || r.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

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

      {/* 5 Stat Cards */}
      <div className="stats-grid-5">
        <StatCard label="Total Requests" value={requestsList.length} icon={FileText} color="blue" />
        <StatCard label="Pending" value={requestsList.filter(r => r.status === 'Pending').length} icon={Clock} color="amber" />
        <StatCard label="In Progress" value={requestsList.filter(r => r.status === 'In Progress').length} icon={Wrench} color="azure" />
        <StatCard label="Overdue" value="7" icon={AlertCircle} color="red" />
        <StatCard label="Completed" value={requestsList.filter(r => r.status === 'Completed').length} icon={CheckCircle2} color="green" />
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
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
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
                    <td style={{ fontWeight: '600', color: '#7a1521' }}>{req.id}</td>
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

      {/* Details Modal */}
      <RequestDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

