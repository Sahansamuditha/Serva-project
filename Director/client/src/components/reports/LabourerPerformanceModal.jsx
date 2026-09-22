import React, { useState } from 'react';
import Modal from '../common/Modal';
import { Search, Award, CheckCircle2, Clock, Users, Star, Wrench, ShieldCheck } from 'lucide-react';

export default function LabourerPerformanceModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [specializationFilter, setSpecializationFilter] = useState('All');

  const labourersList = [
    {
      id: 'LAB-101',
      name: 'Kasun Perera',
      specialization: 'Electrical Specialist',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      jobsCompleted: 28,
      avgTime: '1h 45m',
      rating: '98%',
      activeJobs: 2,
      status: 'High Performer'
    },
    {
      id: 'LAB-102',
      name: 'Nimal Fernando',
      specialization: 'HVAC Technician',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
      jobsCompleted: 24,
      avgTime: '2h 15m',
      rating: '95%',
      activeJobs: 1,
      status: 'On Duty'
    },
    {
      id: 'LAB-103',
      name: 'Saman Wijesiri',
      specialization: 'Plumbing Engineer',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&q=80',
      jobsCompleted: 22,
      avgTime: '2h 30m',
      rating: '94%',
      activeJobs: 3,
      status: 'On Duty'
    },
    {
      id: 'LAB-104',
      name: 'Tharindu Silva',
      specialization: 'Carpentry & Infra',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      jobsCompleted: 19,
      avgTime: '2h 40m',
      rating: '92%',
      activeJobs: 0,
      status: 'Available'
    },
    {
      id: 'LAB-105',
      name: 'Chaminda Jayasena',
      specialization: 'Electrical Specialist',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80',
      jobsCompleted: 18,
      avgTime: '2h 55m',
      rating: '91%',
      activeJobs: 1,
      status: 'On Duty'
    },
    {
      id: 'LAB-106',
      name: 'Sunil Rathnayake',
      specialization: 'Civil & Painting',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
      jobsCompleted: 16,
      avgTime: '3h 10m',
      rating: '89%',
      activeJobs: 0,
      status: 'Available'
    },
    {
      id: 'LAB-107',
      name: 'Bandara Gunasekara',
      specialization: 'Plumbing Engineer',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&q=80',
      jobsCompleted: 15,
      avgTime: '2h 20m',
      rating: '93%',
      activeJobs: 2,
      status: 'On Duty'
    },
    {
      id: 'LAB-108',
      name: 'Roshan Abeykoon',
      specialization: 'HVAC Technician',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80',
      jobsCompleted: 14,
      avgTime: '2h 50m',
      rating: '90%',
      activeJobs: 1,
      status: 'On Duty'
    }
  ];

  const filteredLabourers = labourersList.filter((lab) => {
    const matchesSearch =
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      specializationFilter === 'All' || lab.specialization.toLowerCase().includes(specializationFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Labourer & Team Performance Analytics" maxWidth="920px">
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
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Total Staff</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>24</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Completed</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>156 Jobs</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Avg Time</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>2h 22m</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#fff0ef', color: '#7a1521', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={18} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>Avg Rating</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#7a1521' }}>94.2%</div>
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
              placeholder="Search labourer name, ID, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="form-select"
            style={{ width: '160px', height: '38px' }}
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
          >
            <option value="All">All Specializations</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Civil">Civil</option>
          </select>
        </div>

        {/* Performance Data Table */}
        <div className="data-table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0' }}>
          <table className="data-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th>Labourer</th>
                <th>Specialization</th>
                <th style={{ textAlign: 'center' }}>Jobs Done</th>
                <th style={{ textAlign: 'center' }}>Avg Time</th>
                <th>Performance Rating</th>
                <th style={{ textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabourers.map((lab) => (
                <tr key={lab.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={lab.avatar}
                        alt={lab.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{lab.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{lab.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: '#475569', fontSize: '13px' }}>{lab.specialization}</td>
                  <td style={{ textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>
                    {lab.jobsCompleted}
                  </td>
                  <td style={{ textAlign: 'center', color: '#64748b' }}>{lab.avgTime}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: lab.rating,
                            height: '100%',
                            backgroundColor: parseInt(lab.rating) >= 95 ? '#10b981' : '#3b82f6',
                            borderRadius: '3px'
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>{lab.rating}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor:
                          lab.status === 'High Performer'
                            ? '#fff0ef'
                            : lab.status === 'Available'
                            ? '#d1fae5'
                            : '#dbeafe',
                        color:
                          lab.status === 'High Performer'
                            ? '#7a1521'
                            : lab.status === 'Available'
                            ? '#065f46'
                            : '#1d4ed8'
                      }}
                    >
                      {lab.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLabourers.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                    No labourers found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100px', justifyContent: 'center' }}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
