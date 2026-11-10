import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';

export default function CreateTeamModal({ isOpen, onClose, onCreated }) {
  const [teamName, setTeamName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [lead, setLead] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [showLeadDropdown, setShowLeadDropdown] = useState(false);
  const [members, setMembers] = useState([]);
  const [newMemberInput, setNewMemberInput] = useState('');
  const [showMemberInput, setShowMemberInput] = useState(false);

  const availablePersonnel = [
    'David Chen - Lead Technician',
    'Sarah Jenkins - HVAC Specialist',
    'Marcus Johnson - Senior Plumber',
    'Kasun Perera - Senior Electrician',
    'Nimal Fernando - Plumbing Specialist',
    'Saman Wijesiri - Civil Foreman',
    'Tharindu Silva - HVAC Tech',
    'Chaminda Jayasena - Master Carpenter'
  ];

  if (!isOpen) return null;

  const handleAddMember = () => {
    if (newMemberInput.trim() && !members.includes(newMemberInput.trim())) {
      setMembers([...members, newMemberInput.trim()]);
      setNewMemberInput('');
      setShowMemberInput(false);
    }
  };

  const handleRemoveMember = (name) => {
    setMembers(members.filter(m => m !== name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!teamName) {
      alert('Please enter a team name');
      return;
    }
    if (onCreated) {
      onCreated({
        name: teamName,
        specialization: specialization || 'Electrical',
        lead: lead || 'David Chen',
        members: members.length ? members : ['Kasun Perera', 'Sunil Shantha']
      });
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '28px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
            Create New Maintenance Team
          </h2>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          {/* Team Name */}
          <div className="form-group">
            <label className="form-label">TEAM NAME</label>
            <input 
              type="text" 
              className="form-input"
              placeholder="e.g., Team D - Electrical"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              required
            />
          </div>

          {/* Specialization */}
          <div className="form-group">
            <label className="form-label">SPECIALIZATION</label>
            <select 
              className="form-select"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
            >
              <option value="">Select Specialization</option>
              <option value="Electrical">Electrical & Power Systems</option>
              <option value="HVAC & Climate Control">HVAC & Climate Control</option>
              <option value="Plumbing & Sanitation">Plumbing & Sanitation</option>
              <option value="Civil & Structural">Civil & Structural</option>
              <option value="Carpentry & Furniture">Carpentry & Furniture</option>
            </select>
          </div>

          {/* Assign Lead/Supervisor */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">ASSIGN LEAD/SUPERVISOR</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search personnel..."
                value={leadSearch || lead}
                onChange={(e) => {
                  setLeadSearch(e.target.value);
                  setLead(e.target.value);
                  setShowLeadDropdown(true);
                }}
                onFocus={() => setShowLeadDropdown(true)}
              />
            </div>
            {showLeadDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-dropdown)',
                maxHeight: '160px',
                overflowY: 'auto',
                zIndex: 10,
                marginTop: '4px'
              }}>
                {availablePersonnel
                  .filter(p => p.toLowerCase().includes((leadSearch || '').toLowerCase()))
                  .map((person, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setLead(person.split(' - ')[0]);
                        setLeadSearch(person);
                        setShowLeadDropdown(false);
                      }}
                      style={{ padding: '8px 12px', fontSize: '13px', cursor: 'pointer', borderBottom: '1px solid #f8fafc' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {person}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Initial Members */}
          <div className="form-group">
            <label className="form-label">INITIAL MEMBERS</label>
            <div style={{
              minHeight: '44px',
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              alignItems: 'center'
            }}>
              {members.map((m, idx) => (
                <span key={idx} style={{
                  backgroundColor: '#f1f5f9',
                  color: '#334155',
                  fontSize: '12px',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {m}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveMember(m)} />
                </span>
              ))}

              {showMemberInput ? (
                <div style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Member name..."
                    value={newMemberInput}
                    onChange={(e) => setNewMemberInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddMember(); } }}
                    style={{ fontSize: '12px', padding: '3px 6px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
                    autoFocus
                  />
                  <button type="button" onClick={handleAddMember} className="btn btn-sm btn-primary" style={{ padding: '2px 8px' }}>Add</button>
                </div>
              ) : (
                <button 
                  type="button"
                  onClick={() => setShowMemberInput(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 6px'
                  }}
                >
                  Add Member +
                </button>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '28px' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px 16px'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ padding: '9px 22px' }}
            >
              Create Team
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
