import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import campusLogo from '../../assets/logo.png';
import { triggerLogout } from '../../utils/auth';
import {
  Home,
  FileText,
  Bell,
  Settings,
  LogOut,
  User,
  History,
  Shield
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

export default function Sidebar({ unreadCount = 0, pendingCount = 0 }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const fullName = profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Requester';
  const initial = (profile?.firstName?.[0] || 'R').toUpperCase();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/requests', label: 'Requests', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/settings/profile', label: 'Settings', icon: Settings, matchPrefix: '/settings' },
  ];

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="w-[240px] lg:w-[250px] bg-white h-screen text-[#574141] flex flex-col justify-between shrink-0 border-r border-[#e2e8f0] select-none relative sticky top-0 z-30">
      <div>
        {/* Top Maroon Brand Block with curved bottom-right corner */}
        <div className="bg-[#7a1521] px-5 py-5 rounded-br-[28px] text-white shadow-sm">
          <div className="flex items-center gap-3">
            {/* ITUM Campus Logo */}
            <div className="w-11 h-11 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-white/30 overflow-hidden">
              <img src={campusLogo} alt="ITUM Campus Logo" className="w-full h-full object-contain" onError={(e) => { e.target.src = '/logo.png'; }} />
            </div>

            <div className="leading-tight">
              <h1 className="font-bold text-base tracking-wide text-white">
                ITUM
              </h1>
              <p className="text-[10px] text-white/85 font-medium leading-tight mt-0.5">
                Maintenance<br />Monitoring System
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => {
                  const isCurrentActive = isActive || (item.matchPrefix && window.location.pathname.startsWith(item.matchPrefix));
                  return `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${isCurrentActive
                    ? 'bg-[#7a1521] text-white font-semibold shadow-sm'
                    : 'text-[#574141] hover:text-[#7a1521] hover:bg-[#fff0ef]'
                    }`;
                }}
              >
                {({ isActive }) => {
                  const isCurrentActive = isActive || (item.matchPrefix && window.location.pathname.startsWith(item.matchPrefix));
                  return (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="text-[13px]">{item.label}</span>
                      </div>
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-xs transition-colors ${
                          isCurrentActive ? 'bg-white text-[#7a1521]' : 'bg-[#ba1a1a] text-white'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  );
                }}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-5 border-t border-[#f1f5f9] space-y-3.5 relative" ref={profileMenuRef}>
        {/* Profile Button */}
        <div
          onClick={() => setProfileMenuOpen(!profileMenuOpen)}
          className="flex items-center gap-3 cursor-pointer group select-none p-1.5 rounded-xl hover:bg-[#fff0ef] transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="text-left overflow-hidden min-w-0">
            <p className="text-xs font-bold text-[#241919] group-hover:text-[#7a1521] transition-colors leading-tight truncate">
              {fullName}
            </p>
            <p className="text-[11px] text-[#8a7170] leading-tight mt-0.5 truncate">
              {profile?.designation || 'Requester'}
            </p>
          </div>
        </div>

        {/* User Profile Popup Box (Opening Upwards above the Requester button) */}
        {profileMenuOpen && (
          <div className="absolute left-4 bottom-24 w-64 bg-white rounded-2xl shadow-modal border border-[#e2e8f0] py-3 z-50 animate-fade-in">
            {/* Top Profile Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-[#f1f5f9]">
              <div className="w-12 h-12 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0 overflow-hidden">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div className="overflow-hidden min-w-0">
                <h4 className="font-bold text-sm text-[#241919] leading-tight truncate">
                  {fullName}
                </h4>
                <p className="text-xs text-[#8a7170] leading-tight mt-0.5 truncate">
                  {profile?.designation || 'Requester'}
                </p>
                <p className="text-[11px] text-[#8a7170]/80 leading-tight mt-0.5 truncate">
                  {profile?.email || 'requester@itum.mrt.ac.lk'}
                </p>
              </div>
            </div>

            {/* Menu Links */}
            <div className="py-2 space-y-0.5">
              <button
                onClick={() => {
                  navigate('/settings/profile');
                  setProfileMenuOpen(false);
                }}
                className="w-full px-5 py-2.5 text-left text-sm font-medium text-[#574141] hover:bg-[#fff0ef] hover:text-[#7a1521] flex items-center gap-3.5 transition-colors"
              >
                <User className="w-4 h-4 text-[#8a7170]" />
                <span>Profile Settings</span>
              </button>

              <button
                onClick={() => {
                  navigate('/requests');
                  setProfileMenuOpen(false);
                }}
                className="w-full px-5 py-2.5 text-left text-sm font-medium text-[#574141] hover:bg-[#fff0ef] hover:text-[#7a1521] flex items-center gap-3.5 transition-colors"
              >
                <History className="w-4 h-4 text-[#8a7170]" />
                <span>Requests</span>
              </button>

              <button
                onClick={() => {
                  navigate('/notifications');
                  setProfileMenuOpen(false);
                }}
                className="w-full px-5 py-2.5 text-left text-sm font-medium text-[#574141] hover:bg-[#fff0ef] hover:text-[#7a1521] flex items-center gap-3.5 transition-colors"
              >
                <Shield className="w-4 h-4 text-[#8a7170]" />
                <span>Notification</span>
              </button>
            </div>

            {/* Divider & Logout */}
            <div className="pt-2 border-t border-[#f1f5f9]">
              <button
                onClick={() => {
                  setProfileMenuOpen(false);
                  triggerLogout();
                }}
                className="w-full px-5 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-3.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-600" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            triggerLogout();
          }}
          className="flex items-center gap-2.5 text-xs font-semibold text-[#8a7170] hover:text-[#7a1521] transition-colors pl-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}

