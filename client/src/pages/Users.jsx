import React, { useState, useEffect } from 'react';
import {
  Users2,
  UserCheck2,
  Building2,
  Clock,
  Search,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Users({ onOpenAddUser, onOpenEditUser }) {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 86,
    activeUsers: 79,
    headsAndOfficers: 14,
    pendingInactive: 7
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
      if (data.users) setUsers(data.users);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, roleFilter, deptFilter, statusFilter]);

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
    switch (role) {
      case 'Director / Chief Officer':
        return <span className="px-2.5 py-1 rounded border border-purple-200 text-purple-700 bg-purple-50 text-xs font-medium">Director / Chief Officer</span>;
      case 'Department Head':
        return <span className="px-2.5 py-1 rounded border border-blue-200 text-blue-700 bg-blue-50 text-xs font-medium">Department Head</span>;
      case 'Senior Lecturer / Requester':
        return <span className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 bg-slate-100 text-xs font-medium">Senior Lecturer / Requester</span>;
      case 'Admin':
        return <span className="px-2.5 py-1 rounded border border-red-200 text-[#7a1521] bg-[#ffdad9]/50 text-xs font-medium">Admin</span>;
      case 'Lab In-Charge':
        return <span className="px-2.5 py-1 rounded border border-cyan-200 text-cyan-700 bg-cyan-50 text-xs font-medium">Lab In-Charge</span>;
      case 'Technical Officer':
        return <span className="px-2.5 py-1 rounded border border-indigo-200 text-indigo-700 bg-indigo-50 text-xs font-medium">Technical Officer</span>;
      case 'Supervisor':
        return <span className="px-2.5 py-1 rounded border border-amber-200 text-amber-700 bg-amber-50 text-xs font-medium">Supervisor</span>;
      default:
        return <span className="px-2.5 py-1 rounded border border-slate-200 text-slate-700 bg-slate-50 text-xs font-medium">{role}</span>;
    }
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
            onClick={() => alert("Exporting users list...")}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Users</span>
          </button>

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
            <div className="text-xs font-medium text-slate-500">PENDING / INACTIVE</div>
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
              <option value="Director / Chief Officer">Director / Chief Officer</option>
              <option value="Department Head">Department Head</option>
              <option value="Senior Lecturer / Requester">Senior Lecturer / Requester</option>
              <option value="Admin">Admin</option>
              <option value="Lab In-Charge">Lab In-Charge</option>
              <option value="Technical Officer">Technical Officer</option>
              <option value="Supervisor">Supervisor</option>
            </select>

            {/* Department Filter */}
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
            >
              <option value="All Departments">All Departments</option>
              <option value="ITUM Central Administration">ITUM Central Administration</option>
              <option value="Civil Engineering Technology">Civil Engineering Technology</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Central Maintenance Division">Central Maintenance Division</option>
              <option value="Library Services & Archives">Library Services & Archives</option>
              <option value="Electrical & Electronics">Electrical & Electronics</option>
              <option value="Mechanical Engineering Workshop">Mechanical Engineering Workshop</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521]"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
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
                <th className="py-3.5 px-4">USER & CONTACT</th>
                <th className="py-3.5 px-4">INSTITUTIONAL ROLE</th>
                <th className="py-3.5 px-4">DEPARTMENT / DIVISION</th>
                <th className="py-3.5 px-4">PHONE NUMBER</th>
                <th className="py-3.5 px-4">STATUS</th>
                <th className="py-3.5 px-4">LAST ACTIVE</th>
                <th className="py-3.5 px-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {users.map((user, idx) => {
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
                    <td className="py-4 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Department */}
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {user.department}
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 text-slate-600">
                      {user.phone}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-1.5 font-medium text-xs">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span className={isActive ? 'text-emerald-700' : 'text-slate-500'}>{user.status}</span>
                      </span>
                    </td>

                    {/* Last Active */}
                    <td className="py-4 px-4 text-slate-500">
                      {user.lastActive}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onOpenEditUser(user)}
                          className="font-medium text-[#7a1521] hover:underline"
                        >
                          Edit
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => onOpenEditUser(user)}
                          className="font-medium text-slate-500 hover:text-slate-800 hover:underline"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing 1 to {users.length} of 86 users</span>

          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded bg-[#58000f] text-white font-semibold">
              1
            </button>
            <button className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
              2
            </button>
            <button className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50">
              13
            </button>
            <button className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
