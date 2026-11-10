import React, { useState, useEffect } from 'react';
import {
  Users2,
  UserCheck2,
  Building2,
  Clock,
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { api } from '../services/api';
import ConfirmDeleteModal from '../modals/ConfirmDeleteModal';
import { ALL_DEPARTMENTS } from '../components/modals/AddUserModal';

export default function Users({ onOpenAddUser, onOpenEditUser, onDeleteUser }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    headsAndOfficers: 0,
    pendingInactive: 0
  });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [deptFilter, setDeptFilter] = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortBy, setSortBy] = useState('Recently Active');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers({
        search,
        role: roleFilter,
        department: deptFilter,
        status: statusFilter
      });
      const list = data.users || data.data || [];
      const formatted = list.map(u => {
        const rawStatus = (u.status || '').toLowerCase();
        const isUserActive = rawStatus === 'active';
        return {
          ...u,
          name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email,
          initials: (u.first_name?.[0] || '') + (u.last_name?.[0] || '') || 'US',
          status: isUserActive ? 'Active' : 'Deactivate'
        };
      });
      const filtered = formatted.filter(u => {
        if (statusFilter === 'Active') return u.status === 'Active';
        if (statusFilter === 'Deactivate' || statusFilter === 'Inactive') return u.status === 'Deactivate';
        return true;
      });
      setUsers(filtered);
      if (data.stats) {
        setStats(data.stats);
      } else {
        const active = formatted.filter(u => u.status === 'Active').length;
        const heads = formatted.filter(u => ['admin', 'director', 'maintenance_officer'].includes(u.role)).length;
        setStats({
          totalUsers: formatted.length,
          activeUsers: active,
          headsAndOfficers: heads,
          pendingInactive: formatted.length - active
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
    const handleReload = () => loadUsers();
    window.addEventListener('serva:users-updated', handleReload);
    return () => window.removeEventListener('serva:users-updated', handleReload);
  }, [search, roleFilter, deptFilter, statusFilter]);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    isBulk: false,
    count: 0
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteSingle = (id, name) => {
    setDeleteModal({
      isOpen: true,
      id,
      name,
      isBulk: false,
      count: 1
    });
  };

  const handleBulkDelete = () => {
    if (selectedUsers.length === 0) return;
    setDeleteModal({
      isOpen: true,
      id: null,
      name: `${selectedUsers.length} selected user(s)`,
      isBulk: true,
      count: selectedUsers.length
    });
  };

  const handleConfirmDelete = async () => {
    let result = { success: true };
    try {
      if (deleteModal.isBulk) {
        for (const id of selectedUsers) {
          if (onDeleteUser) {
            const res = await onDeleteUser(id);
            if (res && res.success === false) {
              result = res;
            }
          }
        }
        if (result.success !== false) {
          setUsers(prev => prev.filter(u => !selectedUsers.includes(u.id)));
          setSelectedUsers([]);
        }
      } else if (deleteModal.id) {
        if (onDeleteUser) {
          const res = await onDeleteUser(deleteModal.id);
          if (res && res.success === false) {
            result = res;
          } else {
            setUsers(prev => prev.filter(u => u.id !== deleteModal.id));
          }
        }
      }
      await loadUsers();
    } catch (err) {
      console.error('Delete error', err);
      result = { success: false, message: err.message || 'An error occurred during deletion.' };
    }
    return result;
  };

  const toggleSelectUser = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== id));
    } else {
      setSelectedUsers([...selectedUsers, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((u) => u.id));
    }
  };

  const getRoleBadge = (role) => {
    const baseClass = "px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap inline-block";
    const r = (role || '').trim();
    const rLower = r.toLowerCase();

    if (rLower === 'admin') {
      return <span className={`${baseClass} border border-red-200 text-[#7a1521] bg-[#ffdad9]/50`}>Admin</span>;
    }
    if (rLower === 'director' || rLower.includes('director')) {
      return <span className={`${baseClass} border border-purple-200 text-purple-700 bg-purple-50`}>Director</span>;
    }
    if (rLower === 'maintenance officer' || rLower === 'maintenance_officer' || rLower.includes('maintenance')) {
      return <span className={`${baseClass} border border-emerald-200 text-emerald-700 bg-emerald-50`}>Maintenance Officer</span>;
    }
    if (rLower === 'supervisor' || rLower.includes('supervisor')) {
      return <span className={`${baseClass} border border-amber-200 text-amber-700 bg-amber-50`}>Supervisor</span>;
    }
    if (rLower === 'requester' || rLower.includes('requester') || rLower.includes('lecturer')) {
      return <span className={`${baseClass} border border-slate-200 text-slate-700 bg-slate-100`}>Requester</span>;
    }
    return <span className={`${baseClass} border border-slate-200 text-slate-700 bg-slate-50`}>{role}</span>;
  };

  const getAvatarBg = (initials, index) => {
    const colors = [
      'bg-[#7a1521] text-white',
      'bg-amber-600 text-white',
      'bg-emerald-600 text-white',
      'bg-indigo-600 text-white',
      'bg-blue-600 text-white',
      'bg-rose-600 text-white',
      'bg-slate-600 text-white'
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Users & Access Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage institutional users, system roles, department permissions, and account statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAddUser}
            className="flex items-center gap-1.5 px-5 py-2 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">TOTAL USERS</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalUsers}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users2 className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">ACTIVE USERS</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.activeUsers}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <UserCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">HEADS & OFFICERS</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.headsAndOfficers}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">DEACTIVATED USERS</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.pendingInactive}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="admin-card overflow-hidden">
        {/* Filters Row */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
            >
              <option value="All Roles">All Roles</option>
              <option value="Requester">Requester</option>
              <option value="Maintenance Officer">Maintenance Officer</option>
              <option value="Admin">Admin</option>
              <option value="Director">Director</option>
              <option value="Supervisor">Supervisor</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
            >
              <option value="All Departments">All Departments</option>
              {ALL_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Deactivate">Deactivate</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            {selectedUsers.length > 0 && (
              <button
                type="button"
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedUsers.length})</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
              >
                <option value="Recently Active">Recently Active</option>
                <option value="Name A-Z">Name A-Z</option>
                <option value="Role">Role</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] border-slate-300 accent-[#58000f]"
                  />
                </th>
                <th className="py-3.5 px-4 whitespace-nowrap">USER & CONTACT</th>
                <th className="py-3.5 px-4 whitespace-nowrap">INSTITUTIONAL ROLE</th>
                <th className="py-3.5 px-4 whitespace-nowrap">DEPARTMENT / DIVISION</th>
                <th className="py-3.5 px-4 whitespace-nowrap">PHONE NUMBER</th>
                <th className="py-3.5 px-4 whitespace-nowrap">STATUS</th>
                <th className="py-3.5 px-4 whitespace-nowrap">LAST ACTIVE</th>
                <th className="py-3.5 px-4 text-center whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-slate-400">
                    No registered institutional users found.
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => {
                const isSelected = selectedUsers.includes(user.id);
                const isActive = user.status === 'Active';

                return (
                  <tr
                    key={user.id}
                    className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-[#fff8f7]/50' : ''}`}
                  >
                    <td className="py-4 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] border-slate-300 accent-[#58000f]"
                      />
                    </td>

                    {/* User info */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarBg(user.initials, idx)}`}>
                          {user.initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div>
                        {getRoleBadge(user.role)}
                        {user.role === 'Requester' && user.designation && user.designation !== 'Requester' && user.designation !== 'Staff Member' && (
                          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                            <span>{user.designation}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 text-slate-600 font-medium whitespace-nowrap">
                      {user.department}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                      {user.phone}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span className={isActive ? 'text-emerald-700' : 'text-slate-500'}>{user.status}</span>
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="py-4 px-4 text-slate-500 whitespace-nowrap">
                      {user.lastActive || 'Today'}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenEditUser(user)}
                          className="font-medium text-[#7a1521] hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => handleDeleteSingle(user.id, user.name)}
                          className="font-medium text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center gap-1"
                          title="Delete user permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>
            Showing {users.length > 0 ? 1 : 0} to {users.length} of {stats.totalUsers || users.length} user{users.length === 1 ? '' : 's'}
          </span>

          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-slate-200 text-slate-400 font-medium cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded bg-[#58000f] text-white font-semibold">
              1
            </button>
            <button className="px-3 py-1.5 rounded border border-slate-200 text-slate-400 font-medium cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal Popup */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null, name: '', isBulk: false, count: 0 })}
        onConfirm={handleConfirmDelete}
        title={deleteModal.isBulk ? "Delete Selected Users" : "Delete User Confirmation"}
        itemName={deleteModal.name}
        message={
          deleteModal.isBulk
            ? `Are you sure you want to permanently DELETE and REMOVE ${deleteModal.count} selected user(s) from the system?`
            : null
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
