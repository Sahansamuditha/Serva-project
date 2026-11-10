import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  Plus, 
  Zap, 
  CheckCircle, 
  MoreHorizontal, 
  BarChart2, 
  FileText 
} from 'lucide-react';
import StatCard from '../components/StatCard';
import TeamPerformanceModal from '../components/TeamPerformanceModal';
import { fetchTeams } from '../api';

export default function LabourersManagement() {
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedPerformanceTeam, setSelectedPerformanceTeam] = useState(null);

  useEffect(() => {
    loadTeams();

    const handleSync = () => loadTeams();
    window.addEventListener('serva:teams-updated', handleSync);
    window.addEventListener('serva:users-updated', handleSync);
    window.addEventListener('focus', handleSync);
    const timer = setInterval(loadTeams, 4000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('serva:teams-updated', handleSync);
      window.removeEventListener('serva:users-updated', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, []);

  async function loadTeams() {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const json = await res.json();
        const list = json.data || json.teams || json.supervisors || [];
        setTeams(list);
        if (json.stats) {
          setStats(json.stats);
        } else {
          const totalMembers = list.length;
          const active = list.filter(t => t.status === 'Active').length;
          const onDuty = list.filter(t => (t.activeJobs || 0) > 0).length;
          setStats({
            totalPersonnel: totalMembers,
            activeTeams: active,
            techniciansOnDuty: onDuty,
            availableForDispatch: active - onDuty > 0 ? active - onDuty : 0
          });
        }
      }
    } catch (e) {
      console.warn('Failed to load supervisors', e);
    }
  }

  const totalPersonnel = stats?.totalPersonnel ?? teams.length;
  const activeTeams = stats?.activeTeams ?? teams.filter(t => t.status === 'Active').length;
  const techOnDuty = stats?.techniciansOnDuty ?? teams.filter(t => (t.activeJobs || 0) > 0).length;
  const availDispatch = stats?.availableForDispatch ?? teams.filter(t => t.status === 'Active' && !(t.activeJobs > 0)).length;

  return (
    <div>
      {/* Page Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 className="headline-md" style={{ color: '#1e293b' }}>
            Maintenance Supervisors & Personnel
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Registered maintenance supervisors added by Administrator, active workloads, and availability.
          </p>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="stat-cards-4-grid">
        <StatCard title="Total Supervisors" value={totalPersonnel} icon={Users} color="blue" />
        <StatCard title="Active Supervisors" value={activeTeams} icon={UserCheck} color="blue" />
        <StatCard title="Supervisors On-Duty" value={techOnDuty} icon={Zap} color="purple" />
        <StatCard title="Available for Dispatch" value={availDispatch} icon={Calendar} color="teal" />
      </div>

      {/* Supervisors Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: teams.length > 0 ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
        gap: '20px'
      }}>
        {teams.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No supervisors registered yet. Supervisors added by Administrator will appear here.
          </div>
        ) : (
          teams.map((sup) => {
            const isActive = sup.status === 'Active';
            const initials = sup.name
              ? sup.name.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
              : 'SP';
            return (
              <div 
                key={sup.id}
                className="card"
                style={{
                  padding: '24px',
                  borderTop: `4px solid ${isActive ? '#10b981' : '#f59e0b'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                <div>
                  {/* Supervisor Card Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '34px', height: '34px', borderRadius: '8px',
                        backgroundColor: '#ffe4e6', color: '#be123c',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '13px'
                      }}>
                        {initials}
                      </div>
                      <div>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', display: 'block', lineHeight: 1.2 }}>
                          {sup.name}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: isActive ? '#059669' : '#64748b'
                    }}>
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        backgroundColor: isActive ? '#10b981' : '#94a3b8'
                      }} />
                      {sup.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                    {sup.department || sup.specialization || 'ITUM Works & Maintenance'}
                  </div>

                  {/* Role & Workload row */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--color-border)'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                        ROLE / DESIGNATION
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginTop: '4px' }}>
                        {sup.designation || sup.role || 'Supervisor'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                        WORKLOAD
                      </div>
                      <div style={{
                        fontSize: '13.5px',
                        fontWeight: 500,
                        color: sup.workload === 'Available' ? '#059669' : '#be123c',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {sup.workload === 'Available' ? (
                          <>
                            <CheckCircle size={14} /> Available
                          </>
                        ) : (
                          <>
                            <FileText size={14} /> {sup.workload}
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Info & Task Summary */}
                  <div style={{
                    padding: '14px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    fontSize: '12.5px',
                    color: '#64748b'
                  }}>
                    {sup.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 500, color: '#475569' }}>Email:</span>
                        <span style={{ color: '#1e293b' }}>{sup.email}</span>
                      </div>
                    )}
                    {sup.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 500, color: '#475569' }}>Phone:</span>
                        <span style={{ color: '#1e293b' }}>{sup.phone}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontWeight: 500, color: '#475569' }}>Tasks:</span>
                      <span style={{
                        backgroundColor: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        color: '#334155',
                        fontWeight: 600
                      }}>
                        {sup.activeJobs || 0} In Progress • {sup.completedJobs || 0} Completed
                      </span>
                    </div>
                  </div>
                </div>

                {/* View Performance Button */}
                <button 
                  onClick={() => setSelectedPerformanceTeam(sup)}
                  className="btn btn-outline-maroon"
                  style={{ width: '100%', marginTop: '8px', gap: '8px' }}
                >
                  <BarChart2 size={15} /> View Performance
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Team Performance Analytics Modal */}
      <TeamPerformanceModal 
        isOpen={!!selectedPerformanceTeam}
        team={selectedPerformanceTeam}
        teamName={selectedPerformanceTeam?.name || selectedPerformanceTeam}
        onClose={() => setSelectedPerformanceTeam(null)}
      />
    </div>
  );
}
