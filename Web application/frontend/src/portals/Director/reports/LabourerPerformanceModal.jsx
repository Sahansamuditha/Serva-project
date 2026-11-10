import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Search, Award, CheckCircle2, Users, ShieldCheck } from 'lucide-react';

export default function LabourerPerformanceModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const supervisorsList = [
    {
      id: 'SUP-014',
      name: 'Kamal Bandara',
      username: 'kamal_b',
      department: 'Civil & Plumbing Division',
      role: 'Supervisor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      totalRequests: 14,
      completed: 7,
      rating: '50%',
      status: 'Active'
    },
    {
      id: 'SUP-013',
      name: 'Sunil Shantha',
      username: 'sunil_s',
      department: 'Electrical Maintenance Division',
      role: 'Supervisor',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      totalRequests: 9,
      completed: 5,
      rating: '55.6%',
      status: 'Active'
    },
    {
      id: 'SUP-011',
      name: 'ra fsdgf',
      username: 'ramindu',
      department: 'ITUM Central Administration',
      role: 'Supervisor',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      totalRequests: 8,
      completed: 4,
      rating: '50%',
      status: 'Active'
    }
  ];

  const filteredSupervisors = supervisorsList.filter((sup) => {
    const matchesSearch =
      sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sup.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept =
      deptFilter === 'All' || sup.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Supervisor Performance Analytics" maxWidth="920px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Top Analytics Stat Banner */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Supervisors</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>3</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Total Requests</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>31</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Completed</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>16</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fff0ef', color: '#7a1521', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Completion Rate</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#7a1521' }}>51.6%</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', height: '38px' }}
              placeholder="Search supervisor name, ID, or division..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '220px', height: '38px' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Divisions</option>
            <option value="Civil">Civil & Plumbing</option>
            <option value="Electrical">Electrical Maintenance</option>
            <option value="Central">Central Administration</option>
          </select>
        </div>

        {/* Performance Data Table */}
        <div className="data-table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0' }}>
          <table className="data-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th>Supervisor</th>
                <th>Department / Division</th>
                <th style={{ textAlign: 'center' }}>Total Requests</th>
                <th style={{ textAlign: 'center' }}>Completed</th>
                <th>Completion Rate</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSupervisors.map((sup) => (
                <tr key={sup.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={sup.avatar}
                        alt={sup.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{sup.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{sup.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '13px' }}>{sup.department}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                    {sup.totalRequests}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#10b981' }}>
                    {sup.completed}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: sup.rating,
                            height: '100%',
                            backgroundColor: '#10b981',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>{sup.rating}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: '#d1fae5',
                        color: '#059669'
                      }}
                    >
                      {sup.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}
