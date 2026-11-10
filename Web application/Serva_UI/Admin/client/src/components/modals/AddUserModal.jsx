import React, { useState } from 'react';
import { X } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'Requester',
    department: 'Information Technology',
    sendInvite: true
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      alert("Please fill all required fields");
      return;
    }
    const cleanPhone = (formData.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      alert("Phone / Mobile Number must contain exactly 10 digits (e.g. 0771234567).");
      return;
    }
    onAddUser({ ...formData, phone: cleanPhone });
    onClose();
  };

  const isDeptDisabled = formData.role === 'Requester' && !formData.requesterType;

  const availableDepartments = formData.role === 'Requester'
    ? (DEPARTMENT_MAPPINGS[formData.requesterType] || [])
    : (formData.role === 'Maintenance Officer' || formData.role === 'Supervisor'
        ? ['Central Maintenance Division', ...ALL_DEPARTMENTS.filter(d => d !== 'Central Maintenance Division')]
        : ALL_DEPARTMENTS);

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-7 pt-6 pb-4 flex items-start justify-between border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#58000f]"></span>
              <h3 className="text-lg font-bold text-slate-900">Add New Institutional User</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Create system credentials, assign academic department, and define access permissions.
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
                placeholder="Kamal"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Last Name *
              </label>
              <input
                type="text"
                placeholder="Gunaratne"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
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
              placeholder="k.gunaratne@itum.mrt.ac.lk"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
              required
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Must use official @itum.mrt.ac.lk institutional domain.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
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
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
              >
                <option value="Requester">Requester</option>
                <option value="Maintenance Officer">Maintenance Officer</option>
                <option value="Admin">Admin</option>
                <option value="Director">Director</option>
                <option value="Supervisor">Supervisor</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
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
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-all ${
                  isDeptDisabled
                    ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed select-none'
                    : 'bg-white text-slate-800 border-slate-200 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none'
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
            <div className="p-3 bg-red-50/40 border border-red-100 rounded-lg">
              <label className="block text-xs font-semibold text-[#58000f] mb-1.5">
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-red-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white font-medium"
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

          <div className="pt-2">
            <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.sendInvite}
                onChange={(e) => setFormData({ ...formData, sendInvite: e.target.checked })}
                className="w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] border-slate-300 accent-[#58000f]"
              />
              <span>Send institutional invitation email & password setup link</span>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-5 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#58000f] hover:bg-[#7a1521] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <span>+</span> Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
