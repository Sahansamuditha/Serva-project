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
import CreateTeamModal from '../components/CreateTeamModal';
import TeamPerformanceModal from '../components/TeamPerformanceModal';
import { fetchTeams, createTeam } from '../api';

export default function LabourersManagement() {
  const [teams, setTeams] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPerformanceTeam, setSelectedPerformanceTeam] = useState(null);

  useEffect(() => {
    loadTeams();
  }, []);

  async function loadTeams() {
    const data = await fetchTeams();
    if (data) setTeams(data);
  }

  const handleCreateTeam = async (teamData) => {
    await createTeam(teamData);
    loadTeams();
  };

  return (
    <div>
      {/* Page Title & Add New Team button */}
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
            Maintenance Teams & Personnel
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Manage maintenance crews, track active workloads, and monitor technician availability.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary"
          style={{ padding: '9px 18px', gap: '8px' }}
        >
          <Plus size={16} /> Add New Team
        </button>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="stat-cards-4-grid">
        <StatCard title="Total Personnel" value="42" icon={Users} color="blue" />
        <StatCard title="Active Teams" value="8" icon={Users} color="blue" />
        <StatCard title="Technicians On-Duty" value="15" icon={UserCheck} color="purple" />
        <StatCard title="Available for Dispatch" value="6" icon={Calendar} color="teal" />
      </div>

      {/* Teams Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {teams.map((team) => {
          const isActive = team.status === 'Active';
          return (
            <div 
              key={team.id}
              className="card"
              style={{
                padding: '24px',
                borderTop: `4px solid ${isActive ? '#10b981' : '#f59e0b'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Team Card Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '6px',
                      backgroundColor: '#ffe4e6', color: '#be123c',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Zap size={16} />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>
                      {team.name}
                    </span>
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
                    {team.status}
                  </span>
                </div>

                <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
                  {team.specialization}
                </div>

                {/* Lead & Workload row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  paddingBottom: '18px',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                      LEAD
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginTop: '4px' }}>
                      {team.lead}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
                      WORKLOAD
                    </div>
                    <div style={{
                      fontSize: '13.5px',
                      fontWeight: 500,
                      color: team.workload === 'Available' ? '#059669' : '#be123c',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {team.workload === 'Available' ? (
                        <>
                          <CheckCircle size={14} /> Available
                        </>
                      ) : (
                        <>
                          <FileText size={14} /> {team.workload}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Members Avatars */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 0'
                }}>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {team.membersCount || 4} Members
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ display: 'flex', marginLeft: '6px' }}>
                      {['#7a1521', '#2563eb', '#059669'].map((c, i) => (
                        <div key={i} style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          backgroundColor: c,
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: i > 0 ? '-8px' : 0,
                          border: '2px solid #ffffff'
                        }}>
                          {i === 0 ? 'DC' : i === 1 ? 'KP' : 'SS'}
                        </div>
                      ))}
                      <div style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: '#ffe4e6',
                        color: '#be123c',
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '-8px',
                        border: '2px solid #ffffff'
                      }}>
                        +1
                      </div>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: '12px' }}>
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {/* View Performance Button */}
              <button 
                onClick={() => setSelectedPerformanceTeam(team)}
                className="btn btn-outline-maroon"
                style={{ width: '100%', marginTop: '8px', gap: '8px' }}
              >
                <BarChart2 size={15} /> View Performance
              </button>
            </div>
          );
        })}
      </div>

      {/* Create Team Modal (Image 2.png) */}
      <CreateTeamModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={handleCreateTeam}
      />

      {/* Team Performance Analytics Modal (Image 19.png) */}
      <TeamPerformanceModal 
        isOpen={!!selectedPerformanceTeam}
        team={selectedPerformanceTeam}
        teamName={selectedPerformanceTeam?.name || selectedPerformanceTeam}
        onClose={() => setSelectedPerformanceTeam(null)}
      />
    </div>
  );
}
