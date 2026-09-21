import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronDown,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Trash2,
  Star,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';
import { requestsApi } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryTag from '../components/CategoryTag';
import RatingModal from '../components/RatingModal';

export default function RequestsList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  const [selectedIds, setSelectedIds] = useState([]);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [ratingModalTicket, setRatingModalTicket] = useState(null);
  const [ticketToDelete, setTicketToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const fetchRequests = () => {
    setLoading(true);
    requestsApi.getAll({
      search: searchQuery || undefined,
      status: statusFilter !== 'All' ? statusFilter : undefined,
      priority: priorityFilter !== 'All' ? priorityFilter : undefined,
      category: categoryFilter !== 'All' ? categoryFilter : undefined,
      sort: sortOrder,
      page: pagination.page,
      limit: pagination.limit
    })
      .then((res) => {
        const list = res.data?.data || res.data?.requests || res.data || [];
        setRequests(Array.isArray(list) ? list : []);
        if (res.data?.pagination) {
          setPagination(res.data.pagination);
        }
      })
      .catch((err) => console.error('Failed to fetch requests:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, priorityFilter, categoryFilter, sortOrder, pagination.page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === requests.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(requests.map(r => r.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExport = () => {
    const selectedData = requests.filter(r => selectedIds.includes(r.id));
    const dataToExport = selectedData.length > 0 ? selectedData : requests;
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ITUM-Maintenance-Requests-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleDeleteClick = (id) => {
    setTicketToDelete(id);
    setActiveMenuId(null);
  };

  const confirmDelete = async () => {
    if (!ticketToDelete) return;
    setDeleting(true);
    try {
      await requestsApi.delete(ticketToDelete);
      const deletedId = ticketToDelete;
      setTicketToDelete(null);
      fetchRequests();
      setToast({
        title: 'Ticket Deleted',
        message: `Maintenance ticket #${deletedId} has been successfully deleted.`
      });
      setTimeout(() => setToast(null), 4500);
    } catch (err) {
      console.error('Failed to delete ticket:', err);
      setToast({
        title: 'Error',
        message: 'Failed to delete ticket. Please try again.'
      });
      setTimeout(() => setToast(null), 4500);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in">
      {/* Top Full-Width Notification Banner */}
      {toast && (
        <div className="sticky top-2 z-40 w-full p-4 bg-emerald-50/95 backdrop-blur-xs border border-emerald-200 text-emerald-900 rounded-xl shadow-md flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#241919]">{toast.title}</p>
              <p className="text-xs text-[#574141] mt-0.5">{toast.message}</p>
            </div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1.5 text-slate-400 hover:text-[#241919] hover:bg-emerald-100 rounded-lg transition-colors shrink-0"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#241919]">Maintenance Requests Management</h1>
          <p className="text-sm text-[#574141] mt-0.5">
            Review, filter, accept/reject, and process incoming facility maintenance requests.
          </p>
        </div>
        <button
          onClick={() => navigate('/requests/new')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7a1521] hover:bg-[#58000f] text-white font-semibold text-sm rounded-lg shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Request</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID or Name..."
            className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm input-focus"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[#574141] cursor-pointer input-focus"
            >
              <option value="All">Status: All</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8a7170] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Priority */}
          <div className="relative">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[#574141] cursor-pointer input-focus"
            >
              <option value="All">Priority: All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8a7170] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-[#f8fafc] border border-[#e2e8f0] rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-[#574141] cursor-pointer input-focus"
            >
              <option value="All">Category: All</option>
              <option value="HVAC">HVAC</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="AV Equip">AV Equip</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8a7170] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs font-semibold text-[#574141] hover:bg-slate-100 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort ({sortOrder === 'newest' ? 'Newest' : 'Oldest'})</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f8fafc] text-[11px] uppercase tracking-wider font-bold text-[#574141] border-b border-[#e2e8f0]">
              <tr>
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={requests.length > 0 && selectedIds.length === requests.length}
                    onChange={toggleSelectAll}
                    className="rounded border-[#e2e8f0] text-[#7a1521] focus:ring-[#7a1521] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Requester Info</th>
                <th className="py-3.5 px-4">Issue Summary</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Priority</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#8a7170]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <p className="font-bold text-sm text-[#241919]">No maintenance requests found</p>
                      <p className="text-xs text-[#574141]">You haven't submitted any maintenance requests yet.</p>
                      <button
                        onClick={() => navigate('/requests/new')}
                        className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create New Request</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                requests.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-[#fff8f7] transition-colors ${isSelected ? 'bg-[#fff0ef]/60' : ''
                      }`}
                  >
                    <td className="py-4 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="rounded border-[#e2e8f0] text-[#7a1521] focus:ring-[#7a1521] cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <p
                        onClick={() => navigate(`/requests/${item.id}`)}
                        className="font-bold text-[#241919] hover:text-[#7a1521] cursor-pointer"
                      >
                        #{item.id}
                      </p>
                      <p className="text-xs text-[#8a7170] mt-0.5">{item.formattedDate || 'May 02, 2026'}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-[#241919] text-xs">
                        {item.requester?.name || 'Mrs. Oshini Hewage'}
                      </p>
                      <p className="text-[11px] text-[#574141]">
                        {item.requester?.department || 'Civil Engineering'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-medium text-[#241919] text-sm">{item.title}</p>
                      <div className="mt-1">
                        <CategoryTag category={item.category} />
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-[#574141] font-medium">
                      {item.location}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2 relative">
                        <button
                          onClick={() => navigate(`/requests/${item.id}`)}
                          className="px-3.5 py-1.5 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-md shadow-sm transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                          className="p-1.5 text-[#8a7170] hover:text-[#241919] hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === item.id && (
                          <div className="absolute right-0 top-10 w-44 bg-white border border-[#e2e8f0] rounded-xl shadow-modal py-1.5 z-30 text-left">
                            <button
                              onClick={() => {
                                navigate(`/requests/${item.id}`);
                                setActiveMenuId(null);
                              }}
                              className="w-full px-3.5 py-2 text-xs text-[#241919] hover:bg-[#ffe9e8] flex items-center gap-2 font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#7a1521]" />
                              <span>Full Details</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              className="w-full px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium border-t border-slate-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Ticket</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#574141]">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#241919]">{selectedIds.length} selected</span>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 font-semibold text-[#7a1521] hover:underline"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span>Showing {requests.length > 0 ? `${(pagination.page - 1) * pagination.limit + 1}-${Math.min(pagination.page * pagination.limit, pagination.total)}` : '0'} of {pagination.total || 0}</span>
            <div className="flex items-center gap-1">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="p-1.5 rounded border border-[#e2e8f0] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="p-1.5 rounded border border-[#e2e8f0] bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={Boolean(ratingModalTicket)}
        ticket={ratingModalTicket}
        onClose={() => setRatingModalTicket(null)}
        onSubmit={async (ticketId, rating, feedback) => {
          await requestsApi.rate(ticketId, { rating, feedback });
          fetchRequests();
        }}
      />

      {/* Delete Confirmation Modal */}
      {ticketToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] space-y-5 animate-scale-in">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#241919]">Delete Maintenance Ticket</h3>
                <p className="text-xs text-[#574141] leading-relaxed">
                  Are you sure you want to delete ticket <span className="font-bold text-[#241919]">#{ticketToDelete}</span>? This action cannot be undone and will permanently remove the record from the ledger.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setTicketToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#574141] hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
