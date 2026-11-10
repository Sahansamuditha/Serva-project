import React, { useState, useEffect } from 'react';
import { 
  Users2, 
  UserCheck, 
  Wrench, 
  CalendarCheck, 
  Plus, 
  MoreHorizontal, 
  Zap,
  BarChart2,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

export default function Labourers({ onOpenCreateTeam, onViewAnalytics }) {
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    totalPersonnel: 42,
    activeTeams: 8,
    techniciansOnDuty: 15,
    availableForDispatch: 6
  });

  const loadTeams = async () => {
    try {
      const data = await api.getTeams();
      if (data.teams) setTeams(data.teams);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Teams & Personnel</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage maintenance crews, track active workloads, and monitor technician availability.
          </p>
        </div>

        <button
          onClick={onOpenCreateTeam}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Team</span>
        </button>
      </div>

      {/* 4 Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Personnel</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.totalPersonnel}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <Users2 className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Active Teams</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.activeTeams}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Technicians On-Duty</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.techniciansOnDuty}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="admin-card p-5 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Available for Dispatch</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{stats.availableForDispatch}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Team Cards Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team, idx) => {
          const isIdle = team.status === 'Idle';
          const topBorderColor = idx === 0 ? 'border-t-emerald-500' : idx === 1 ? 'border-t-emerald-500' : 'border-t-amber-400';

          return (
            <div
              key={team.id}
              className={`admin-card p-6 flex flex-col justify-between border-t-4 ${topBorderColor} hover:shadow-md transition-shadow`}
            >
              <div>
                {/* Header with Title and Status Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-500 fill-red-500" />
                    <h3 className="font-bold text-base text-slate-900">{team.name}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                      isIdle
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isIdle ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
                    {team.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-1">{team.specialization}</p>

                {/* Lead and Workload */}
                <div className="grid grid-cols-2 gap-4 my-5 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      LEAD
                    </span>
                    <span className="font-semibold text-slate-800">{team.lead}</span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      WORKLOAD
                    </span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        team.workloadType === 'success' || team.workload === 'Available'
                          ? 'text-emerald-600'
                          : team.workloadType === 'warning'
                          ? 'text-red-600'
                          : 'text-amber-700'
                      }`}
                    >
                      {team.workloadType === 'success' || team.workload === 'Available' ? '✓ ' : '📄 '}
                      {team.workload}
                    </span>
                  </div>
                </div>

                {/* Member Avatars */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-600 font-medium">{team.memberCount || 4} Members</span>
                  <div className="flex items-center">
                    <div className="flex -space-x-2 overflow-hidden">
                      <img
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                        src="/images/david_chen_avatar.png"
                        alt="Member"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/david_chen_avatar.png';
                        }}
                      />
                      <div className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-slate-700 text-white text-[9px] font-bold">
                        NF
                      </div>
                      <div className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white bg-blue-700 text-white text-[9px] font-bold">
                        KP
                      </div>
                    </div>
                    <span className="text-[11px] text-red-500 font-bold ml-1.5">+1</span>
                    <button className="text-slate-400 hover:text-slate-600 ml-4">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* View Performance Action */}
              <div className="pt-6">
                <button
                  onClick={onViewAnalytics}
                  className="w-full py-2.5 px-4 bg-white border border-[#7a1521]/30 hover:border-[#7a1521] text-[#7a1521] hover:bg-[#fff8f7] rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>View Performance</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
