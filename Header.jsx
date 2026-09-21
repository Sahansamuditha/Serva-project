import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  History,
  Shield,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { triggerLogout } from '../../utils/auth';

export default function Header({ title = "Dashboard", unreadCount = 0, onSearch }) {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fullName = profile?.fullName || `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || 'Requester';
  const initial = (profile?.firstName?.[0] || 'R').toUpperCase();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchValue);
    } else {
      navigate(`/requests?search=${encodeURIComponent(searchValue)}`);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNav = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm gap-6 shrink-0">
      {/* Title / Current view */}
      <div className="shrink-0 min-w-[120px]">
        <h2 className="text-xl font-bold text-[#241919]">{title}</h2>
      </div>

      {/* Full-width Search bar */}
      <form onSubmit={handleSearchSubmit} className="relative flex-1">
        <Search className="w-4 h-4 text-[#8a7170] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search requests, jobs, users..."
          className="w-full pl-10 pr-4 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] placeholder-[#8a7170] input-focus transition-all"
        />
      </form>

      {/* Right controls */}
      <div className="flex items-center gap-5 shrink-0">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-lg text-[#574141] hover:text-[#7a1521] hover:bg-[#fff0ef] transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Trigger & Dropdown Menu */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 pl-3 border-l border-[#e2e8f0] cursor-pointer group py-1.5 select-none"
          >
            <div className="w-9 h-9 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-sm shadow group-hover:scale-105 transition-transform overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                initial
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#241919] group-hover:text-[#7a1521] transition-colors leading-tight">
                {fullName}
              </p>
              <p className="text-[11px] text-[#8a7170] leading-tight mt-0.5">
                {profile?.designation || 'Requester'}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-[#8a7170] group-hover:text-[#241919] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* User Profile Dropdown Box */}
          {dropdownOpen && (
            <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-modal border border-[#e2e8f0] py-3 z-50 animate-fade-in">
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
                  onClick={() => handleNav('/settings/profile')}
                  className="w-full px-5 py-2.5 text-left text-sm font-medium text-[#574141] hover:bg-[#fff0ef] hover:text-[#7a1521] flex items-center gap-3.5 transition-colors"
                >
                  <User className="w-4 h-4 text-[#8a7170]" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={() => handleNav('/requests')}
                  className="w-full px-5 py-2.5 text-left text-sm font-medium text-[#574141] hover:bg-[#fff0ef] hover:text-[#7a1521] flex items-center gap-3.5 transition-colors"
                >
                  <History className="w-4 h-4 text-[#8a7170]" />
                  <span>Requests</span>
                </button>

                <button
                  onClick={() => handleNav('/notifications')}
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
                    setDropdownOpen(false);
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
        </div>
      </div>
    </header>
  );
}
