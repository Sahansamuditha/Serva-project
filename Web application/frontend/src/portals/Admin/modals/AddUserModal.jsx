import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, Eye, EyeOff } from 'lucide-react';

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: 'password123',
  phone: '',
  role: '',
  requesterType: '',
  department: '',
  sendInvite: false
};

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

export default function AddUserModal({ isOpen, onClose, onAddUser }) {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(INITIAL_FORM_STATE);
      setValidationError('');
      setShowPassword(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (submitting) return;
    setFormData(INITIAL_FORM_STATE);
    setValidationError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      setValidationError("Please fill in all required fields marked with *");
      return;
    }
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setValidationError("Phone / Mobile Number must contain exactly 10 digits (e.g. 0771234567).");
      return;
    }
    if (!formData.role) {
      setValidationError("Please select an institutional role");
      return;
    }
    if (formData.role === 'Requester' && !formData.requesterType) {
      setValidationError("Please select a requester role (Head of Division, Warden, Admin, Director, Assistant)");
      return;
    }
    if (!formData.department) {
      setValidationError("Please select a department / division");
      return;
    }
    setValidationError('');
    const cleanEmail = formData.email.trim();
    const cleanUsername = (formData.username || cleanEmail.split('@')[0] || '').trim().toLowerCase();
    
    const finalDesignation = formData.role === 'Requester' && formData.requesterType
      ? formData.requesterType
      : (formData.designation || formData.role || 'Staff Member');

    setSubmitting(true);
    try {
      const result = await onAddUser({
        ...formData,
        designation: finalDesignation,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password: formData.password ? formData.password.trim() : 'password123',
        phone: cleanPhone
      });
      if (result && result.success === false) {
        setValidationError(result.message || 'Failed to add user.');
        setSubmitting(false);
        return;
      }
      setFormData(INITIAL_FORM_STATE);
      onClose();
    } catch (err) {
      setValidationError(err.message || 'Failed to add user.');
    } finally {
      setSubmitting(false);
    }
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
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[82vh] my-auto">
        {/* Header - Always visible */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#58000f] shrink-0"></span>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">Add New Institutional User</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                Create system credentials and assign departmental permissions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 shrink-0"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - Compact & Scrollable */}
        <form id="add-user-form" onSubmit={handleSubmit} autoComplete="off" className="overflow-y-auto px-5 py-3.5 space-y-3 text-xs">
          {validationError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                autoComplete="off"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                autoComplete="off"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official ITUM Email *
              </label>
              <input
                type="email"
                placeholder="e.g. user@itum.mrt.ac.lk"
                value={formData.email}
                onChange={(e) => {
                  const emailVal = e.target.value;
                  const currentPrefix = formData.email.split('@')[0];
                  const newPrefix = emailVal.split('@')[0];
                  const shouldUpdateUsername = !formData.username || formData.username === currentPrefix;
                  setFormData({
                    ...formData,
                    email: emailVal,
                    username: shouldUpdateUsername ? newPrefix.toLowerCase() : formData.username
                  });
                }}
                autoComplete="off"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                placeholder="e.g. sahan"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                autoComplete="off"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Phone / Mobile Number *
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
                autoComplete="off"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="password123"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  autoComplete="new-password"
                  className="w-full px-3 py-1.5 pr-8 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

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
                required
              >
                <option value="">Select Institutional Role</option>
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

          <div className="pt-1">
            <label className="flex items-center gap-2 text-[11px] text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendInvite}
                onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-[#58000f] focus:ring-[#7a1521] border-slate-300 accent-[#58000f]"
              />
              <span>Send institutional invitation email & password setup link</span>
            </label>
          </div>
        </form>

        {/* Actions Footer */}
        <div className="px-5 py-3 bg-slate-50/90 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-user-form"
            disabled={submitting}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#58000f] hover:bg-[#7a1521] rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{submitting ? 'Creating...' : 'Create User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
