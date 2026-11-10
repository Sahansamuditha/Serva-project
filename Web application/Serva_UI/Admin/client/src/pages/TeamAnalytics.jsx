import React, { useState } from 'react';
import { 
  Users2, 
  UserCheck, 
  Wrench, 
  CalendarCheck, 
  Calendar, 
  MoreVertical,
  ArrowLeft 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function TeamAnalytics({ onBack }) {
  const [timeRange, setTimeRange] = useState('Last 30 Days');

  const getFilteredAnalyticsData = () => {
    switch (timeRange) {
      case 'Last 7 Days':
        return {
          stats: {
            totalPersonnel: 42,
            activeTeams: 8,
            techniciansOnDuty: 18,
            availableForDispatch: 4
          },
          trendData: [
            { day: 'Mon', score: 14 },
            { day: 'Tue', score: 42 },
            { day: 'Wed', score: 68 },
            { day: 'Thu', score: 55 },
            { day: 'Fri', score: 92 },
            { day: 'Sat', score: 38 },
            { day: 'Sun', score: 45 }
          ]
        };

      case 'Last 90 Days':
        return {
          stats: {
            totalPersonnel: 42,
            activeTeams: 8,
            techniciansOnDuty: 12,
            availableForDispatch: 8
          },
          trendData: [
            { day: 'Mon', score: 25 },
            { day: 'Tue', score: 38 },
            { day: 'Wed', score: 55 },
            { day: 'Thu', score: 70 },
            { day: 'Fri', score: 88 },
            { day: 'Sat', score: 62 },
            { day: 'Sun', score: 80 }
          ]
        };

      case 'Last 30 Days':
      default:
        return {
          stats: {
            totalPersonnel: 42,
            activeTeams: 8,
            techniciansOnDuty: 15,
            availableForDispatch: 6
          },
          trendData: [
            { day: 'Mon', score: 8 },
            { day: 'Tue', score: 26 },
            { day: 'Wed', score: 48 },
            { day: 'Thu', score: 32 },
            { day: 'Fri', score: 85 },
            { day: 'Sat', score: 54 },
            { day: 'Sun', score: 72 }
          ]
        };
    }
  };

  const filtered = getFilteredAnalyticsData();
  const stats = filtered.stats;
  const trendData = filtered.trendData;

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Teams</span>
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Team Performance Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Evaluating maintenance efficiency and resource allocation.</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm text-xs font-medium text-slate-700">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
          </select>
        </div>
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

      {/* Performance Trends Chart */}
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-base text-slate-800">Performance Trends</h3>
          <button className="text-slate-400 hover:text-slate-600">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7a1521" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7a1521" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Area 
                type="natural" 
                dataKey="score" 
                stroke="#7a1521" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#performanceGradient)" 
                dot={{ r: 4, fill: '#ffffff', strokeWidth: 2, stroke: '#7a1521' }}
                activeDot={{ r: 6, fill: '#58000f' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
