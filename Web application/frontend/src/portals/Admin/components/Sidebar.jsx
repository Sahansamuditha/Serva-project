import React from 'react';
import campusLogo from '../../../assets/logo.png';
import { triggerLogout } from '../../../utils/auth';
import {
  Home,
  LayoutDashboard,
  Briefcase,
  Users,
  BarChart2,
  Bell,
  Settings,
  LogOut,
  FileText,
  UserCheck
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, notificationCount = 0, profileAvatar, profileName = 'Administrator', profileDesignation = 'System Administrator', profileInitials = 'A' }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: notificationCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-[250px] h-screen sticky top-0 bg-white text-slate-700 flex flex-col justify-between shrink-0 border-r border-slate-200 select-none z-30 overflow-hidden">
      <div>
        {/* Top Maroon Header with curved bottom-right corner */}
        <div className="bg-[#7a1521] text-white p-4 pt-5 pb-5 rounded-br-[28px] shadow-sm flex items-center gap-3">
          {/* ITUM Campus Logo */}
          <div className="w-11 h-11 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-white/30 overflow-hidden">
            <img src={campusLogo} alt="ITUM Campus Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = '/logo.png'; }} />
          </div>
          <div className="leading-tight">
            <h1 className="font-bold text-base tracking-wide text-white">ITUM</h1>
            <p className="text-[11px] text-white/85 font-normal leading-snug">
              Maintenance<br />Monitoring System
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3.5 space-y-1.5 mt-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activePage === item.id ||
              (item.id === 'jobs' && activePage === 'job-detail') ||
              (item.id === 'users' && (activePage === 'labourers' || activePage === 'labourers-analytics')) ||
              (item.id === 'dashboard' && activePage === 'requests');

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all duration-150 ${isActive
                    ? 'bg-[#7a1521] text-white font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 && item.id === 'notifications' && !isActive && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3">
          {/* AD Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-xs shrink-0 tracking-wider shadow-sm overflow-hidden">
            {profileAvatar ? (
              <img src={profileAvatar} alt="Admin Profile" className="w-full h-full object-cover" />
            ) : (
              profileInitials
            )}
          </div>
          <div className="text-left leading-tight truncate">
            <div className="font-bold text-sm text-slate-800 truncate" title={profileName}>{profileName}</div>
            <div className="text-[11px] text-slate-500 font-medium truncate" title={profileDesignation}>{profileDesignation}</div>
          </div>
        </div>

        {/* Log Out */}
        <button
          onClick={triggerLogout}
          className="w-full flex items-center gap-2.5 pt-3.5 pl-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
