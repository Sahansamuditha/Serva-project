import React, { useState, useEffect } from 'react';
import { X, Check, Trash2 } from 'lucide-react';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export const DEPARTMENT_MAPPINGS = {
  'Head of Division': [
    'Civil Engineering Technology',
    'Electrical, Electronic & Telecommunication Engineering Technology',
    'Mechanical Engineering Technology',
    'Maritime Studies',
    'Polymer & Chemical Engineering Technology',
    'Textile & Clothing Technology',
    'Information Technology',
    'Interdisciplinary Studies'
  ],
  'Assistant': [
    'Industrial Training',
    'Library',
    'General Administration (Quarters)',
    'Finance',
    'Systems Management Unit',
    'Center for Innovation & Entrepreneurship',
    'Exam department',
    'Human resource unit(U7)',
    'Student affairs'
  ],
  'Warden': [
    'Hostels'
  ],
  'Admin': [
    'Executive Directorate'
  ],
  'Director': [
    'Executive Directorate'
  ]
};

export const ALL_DEPARTMENTS = [
  'Central Maintenance Division',
  'ITUM Central Administration',
  'Civil Engineering Technology',
  'Electrical, Electronic & Telecommunication Engineering Technology',
  'Mechanical Engineering Technology',
  'Maritime Studies',
  'Polymer & Chemical Engineering Technology',
  'Textile & Clothing Technology',
  'Information Technology',
  'Interdisciplinary Studies',
  'Industrial Training',
  'Library',
  'General Administration (Quarters)',
  'Finance',
  'Systems Management Unit',
  'Center for Innovation & Entrepreneurship',
  'Hostels',
  'Exam department',
  'Human resource unit(U7)',
  'Student affairs',
  'Executive Directorate'
];

export default function EditUserModal({ isOpen, onClose, user, onSave, onDeactivate, onDelete, onResendInvite }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: 'Active',
    permissions: []
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      const parts = (user.name || '').split(' ');
      const lastName = parts.length > 1 ? parts.pop() : '';
      const firstName = parts.join(' ');

      let userRole = user.role || 'Admin';
      if (userRole === 'Senior Lecturer / Requester') userRole = 'Requester';
      else if (userRole === 'Director / Chief Officer') userRole = 'Director';

      let reqType = user.requesterType || user.designation || '';
      if (!['Head of Division', 'Warden', 'Admin', 'Director', 'Assistant'].includes(reqType)) {
        reqType = '';
      }

      setFormData({
        firstName: firstName || user.name || '',
        lastName: lastName || '',
        username: user.username || user.email?.split('@')[0] || '',
        email: user.email || '',
        phone: user.phone || '',
        role: userRole,
        requesterType: reqType,
        designation: reqType || user.designation || userRole,
        department: user.department || 'Central Maintenance Division',
        status: (user.status || '').toLowerCase() === 'active' ? 'Active' : 'Deactivate',
        permissions: user.permissions || [
          'Allow Work Order Creation & Dispatch',
          'Manage Department Maintenance Teams & Roster',
          'Export System Audit & Performance Reports'
        ]
      });
    }
  }, [user]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert("Phone / Contact Number must contain exactly 10 digits (e.g. 0771234567).");
      return;
    }
    const finalDesignation = formData.role === 'Requester' && formData.requesterType
      ? formData.requesterType
      : (formData.designation || formData.role || 'Staff Member');

    onSave(user.id, {
      ...formData,
      phone: cleanPhone,
      designation: finalDesignation
    });
    onClose();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const res = await onDelete(user.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const isDeptDisabled = formData.role === 'Requester' && !formData.requesterType;

  const availableDepartments = formData.role === 'Requester'
    ? (DEPARTMENT_MAPPINGS[formData.requesterType] || [])
    : (formData.role === 'Maintenance Officer' || formData.role === 'Supervisor'
        ? ['Central Maintenance Division', ...ALL_DEPARTMENTS.filter(d => d !== 'Central Maintenance Division')]
        : ALL_DEPARTMENTS);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] my-auto">
        {/* Header - Always visible */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a] shrink-0"></span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Edit Institutional User</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                Update account details, departmental assignment, and system access.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 shrink-0"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Compact & Scrollable */}
        <form
          id="edit-user-form"
          onSubmit={handleSubmit}
          autoComplete="off"
          className="overflow-y-auto px-5 py-3.5 space-y-3 text-xs"
        >
          {/* First & Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          {/* Email & Username */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official ITUM Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
              <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-0.5 font-medium">
                <Check className="w-3 h-3" /> Institutional account
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all font-mono"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Phone / Contact Number *
              </label>
              <span className={`text-[10px] font-mono ${formData.phone?.length === 10 ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                {formData.phone ? formData.phone.length : 0}/10 digits
              </span>
            </div>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              minLength={10}
              placeholder="e.g. 0771234567"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData({ ...formData, phone: val });
              }}
              onKeyDown={(e) => {
                if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter'].includes(e.key) || e.ctrlKey || e.metaKey) {
                  return;
                }
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
              required
            />
          </div>

          {/* Role & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Institutional Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => {
                  const val = e.target.value;
                  const allowedDepts = val === 'Requester' ? (DEPARTMENT_MAPPINGS[formData.requesterType] || []) : ALL_DEPARTMENTS;
                  setFormData({
                    ...formData,
                    role: val,
                    requesterType: val === 'Requester' ? formData.requesterType : '',
                    department: allowedDepts.includes(formData.department) ? formData.department : ''
                  });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
              >
                <option value="Requester">Requester</option>
                <option value="Maintenance Officer">Maintenance Officer</option>
                <option value="Admin">Admin</option>
                <option value="Director">Director</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Department / Division *
                </label>
                {isDeptDisabled && (
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 font-medium">
                    Select Requester Role first
                  </span>
                )}
              </div>
              <select
                disabled={isDeptDisabled}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                  isDeptDisabled
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed select-none'
                    : 'bg-white text-slate-800 border-slate-200 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none'
                }`}
                required
              >
                <option value="">
                  {isDeptDisabled ? 'Select Requester Role first' : 'Select Department / Division'}
                </option>
                {availableDepartments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Requester Type Dropdown */}
          {formData.role === 'Requester' && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-150 p-3 bg-red-50/40 border border-red-100 rounded-lg">
              <label className="block text-xs font-semibold text-[#58000f] mb-1">
                Requester Role / Designation *
              </label>
              <select
                value={formData.requesterType}
                onChange={(e) => {
                  const rType = e.target.value;
                  const allowedDepts = DEPARTMENT_MAPPINGS[rType] || [];
                  setFormData({
                    ...formData,
                    requesterType: rType,
                    department: allowedDepts.length === 1 ? allowedDepts[0] : (allowedDepts.includes(formData.department) ? formData.department : '')
                  });
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-red-200 text-xs text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white font-medium"
                required
              >
                <option value="">Select Requester Role</option>
                <option value="Head of Division">Head of Division</option>
                <option value="Warden">Warden</option>
                <option value="Admin">Admin</option>
                <option value="Director">Director</option>
                <option value="Assistant">Assistant</option>
              </select>
              <p className="text-[10px] text-amber-800/80 mt-1.5 flex items-center gap-1 font-medium">
                <span>ℹ️ Select a Requester Role to unlock Department / Division selection above.</span>
              </p>
            </div>
          )}

          {/* Account Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Account Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Active', 'Deactivate'].map((st) => (
                <label
                  key={st}
                  onClick={() => setFormData({ ...formData, status: st })}
                  className={`border rounded-lg py-1.5 px-2 flex items-center justify-center gap-1.5 text-xs font-medium cursor-pointer transition-all ${
                    formData.status === st
                      ? 'border-[#58000f] bg-rose-50/50 text-[#58000f] font-semibold ring-1 ring-[#58000f]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    checked={formData.status === st}
                    onChange={() => setFormData({ ...formData, status: st })}
                    className="sr-only"
                  />
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      st === 'Active'
                        ? 'bg-emerald-500'
                        : 'bg-slate-400'
                    }`}
                  ></span>
                  {st}
                </label>
              ))}
            </div>
          </div>


        </form>

        {/* Actions Footer - Fixed & Prominent */}
        <div className="px-5 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 text-xs font-semibold transition-colors shadow-2xs"
              title="Permanently remove user"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete User</span>
            </button>
            <button
              type="button"
              onClick={() => {
                const isActive = (formData.status || '').toLowerCase() === 'active';
                const actionText = isActive ? 'deactivate' : 'activate';
                if (confirm(`Are you sure you want to ${actionText} ${user.name}?`)) {
                  if (isActive) {
                    onDeactivate(user.id);
                  } else {
                    onSave(user.id, { ...formData, status: 'Active' });
                  }
                  onClose();
                }
              }}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:underline px-1 cursor-pointer"
            >
              {(formData.status || '').toLowerCase() === 'active' ? 'Deactivate' : 'Activate User'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-user-form"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#58000f] hover:bg-[#7a1521] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Popup */}
      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User Confirmation"
        itemName={user?.name || 'this user'}
      />
    </div>
  );
}
