import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function EditUserModal({ isOpen, onClose, user, onSave, onDeactivate }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'Active',
    permissions: []
  });

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      const lastName = parts.length > 1 ? parts.pop() : '';
      const firstName = parts.join(' ');

      setFormData({
        firstName: firstName || user.name || '',
        lastName: lastName || '',
        email: user.email || '',
        phone: user.phone || '+94 70 234 5678',
        role: user.role || 'Admin',
        department: user.department || 'Central Maintenance Division',
        status: user.status || 'Active',
        permissions: user.permissions || [
          'Allow Work Order Creation & Dispatch',
          'Manage Department Maintenance Teams & Roster',
          'Export System Audit & Performance Reports'
        ]
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handlePermissionToggle = (perm) => {
    if (formData.permissions.includes(perm)) {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((p) => p !== perm)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, perm]
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-7 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#58000f]"></span>
              <h3 className="text-lg font-bold text-slate-900">Edit User Details & Role</h3>
              <span className="px-2 py-0.5 rounded border border-emerald-300 text-emerald-700 bg-emerald-50 text-[11px] font-semibold">
                {formData.status} User
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Update institutional credentials, departmental assignment, and system privileges for {user.name}.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Official ITUM Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
              required
            />
            <p className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
              <Check className="w-3.5 h-3.5" /> Institutional account verified
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone / Contact Number *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Institutional Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
              >
                <option value="Admin">Admin</option>
                <option value="Director / Chief Officer">Director / Chief Officer</option>
                <option value="Department Head">Department Head</option>
                <option value="Senior Lecturer / Requester">Senior Lecturer / Requester</option>
                <option value="Lab In-Charge">Lab In-Charge</option>
                <option value="Technical Officer">Technical Officer</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department / Division *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
              >
                <option value="Central Maintenance Division">Central Maintenance Division</option>
                <option value="ITUM Central Administration">ITUM Central Administration</option>
                <option value="Civil Engineering Technology">Civil Engineering Technology</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Library Services & Archives">Library Services & Archives</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering Workshop">Mechanical Engineering Workshop</option>
              </select>
            </div>
          </div>

          {/* Account Status Radio Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Account Status
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Active', 'Suspended', 'Inactive'].map((st) => (
                <label
                  key={st}
                  onClick={() => setFormData({ ...formData, status: st })}
                  className={`border rounded-lg p-2 flex items-center justify-center gap-2 text-xs font-medium cursor-pointer transition-all ${
                    formData.status === st
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 shadow-sm'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${formData.status === st ? 'bg-emerald-600' : 'bg-slate-300'}`}></span>
                  {st}
                </label>
              ))}
            </div>
          </div>

          {/* Permissions & Privileges */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Permissions & Privileges
            </label>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
              {[
                'Allow Work Order Creation & Dispatch',
                'Manage Department Maintenance Teams & Roster',
                'Export System Audit & Performance Reports'
              ].map((perm) => (
                <label key={perm} className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(perm)}
                    onChange={() => handlePermissionToggle(perm)}
                    className="w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] border-slate-300 accent-[#58000f]"
                  />
                  <span>{perm}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                if (confirm(`Are you sure you want to deactivate ${user.name}?`)) {
                  onDeactivate(user.id);
                  onClose();
                }
              }}
              className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
            >
              Deactivate Account
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-semibold text-white bg-[#58000f] hover:bg-[#7a1521] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
