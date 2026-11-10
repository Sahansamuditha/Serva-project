import React, { useState } from 'react';
import { X, Search, Plus, Trash2 } from 'lucide-react';

export default function CreateTeamModal({ isOpen, onClose, onCreateTeam }) {
  const [teamName, setTeamName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [lead, setLead] = useState('');
  const [members, setMembers] = useState(['']);

  if (!isOpen) return null;

  const handleAddMember = () => {
    setMembers([...members, '']);
  };

  const handleMemberChange = (index, value) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleRemoveMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName) {
      alert("Please enter a team name");
      return;
    }
    onCreateTeam({
      name: teamName,
      specialization: specialization || 'General Maintenance',
      lead: lead || 'Lead Personnel',
      members: members.filter(Boolean)
    });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Create New Maintenance Team</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
              TEAM NAME
            </label>
            <input
              type="text"
              placeholder="e.g., Team D - Electrical"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
              SPECIALIZATION
            </label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all bg-white"
            >
              <option value="">Select Specialization</option>
              <option value="High-voltage & internal wiring">High-voltage & internal wiring</option>
              <option value="HVAC & Climate Control">HVAC & Climate Control</option>
              <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
              <option value="Civil & Structural Maintenance">Civil & Structural Maintenance</option>
              <option value="Carpentry & Furniture">Carpentry & Furniture</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
              ASSIGN LEAD/SUPERVISOR
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search personnel..."
                value={lead}
                onChange={(e) => setLead(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold tracking-wider text-slate-500 uppercase mb-1.5">
              INITIAL MEMBERS
            </label>
            <div className="space-y-2">
              {members.map((member, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Member ${idx + 1} Name`}
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                  />
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="text-slate-400 hover:text-red-500 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddMember}
                className="w-full py-2 px-3 border border-dashed border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#7a1521] hover:border-[#7a1521] flex items-center justify-center gap-1.5 transition-colors bg-slate-50"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Member +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#58000f] hover:bg-[#7a1521] rounded-lg shadow-sm transition-all"
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
