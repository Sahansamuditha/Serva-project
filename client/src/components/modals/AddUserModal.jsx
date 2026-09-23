import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function AddUserModal({ isOpen, onClose, onAddUser }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '+94 77 123 4567',
    role: 'Senior Lecturer / Requester',
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
    onAddUser(formData);
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
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Phone / Mobile Number *
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
              >
                <option value="Senior Lecturer / Requester">Senior Lecturer / Requester</option>
                <option value="Director / Chief Officer">Director / Chief Officer</option>
                <option value="Department Head">Department Head</option>
                <option value="Admin">Admin</option>
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
              >
                <option value="Information Technology">Information Technology</option>
                <option value="ITUM Central Administration">ITUM Central Administration</option>
                <option value="Civil Engineering Technology">Civil Engineering Technology</option>
                <option value="Central Maintenance Division">Central Maintenance Division</option>
                <option value="Library Services & Archives">Library Services & Archives</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
                <option value="Mechanical Engineering Workshop">Mechanical Engineering Workshop</option>
              </select>
            </div>
          </div>

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
