import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertNotice } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  activeScreen?: string;
  onNavigate: (screen: string) => void;
  alerts: AlertNotice[];
  onMarkAllAlertsRead: () => void;
  avatarUrl?: string;
  userName?: string;
  employeeId?: string;
  isProfileMenuOpen?: boolean;
  onToggleProfileMenu?: (open: boolean) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  isSearchOpen?: boolean;
  onToggleSearch?: (open: boolean) => void;
  onOpenAvatarPicker?: () => void;
  devicePreset?: 'universal' | 'android' | 'ios';
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'ITUM • SERVA',
  activeScreen = 'jobs',
  onNavigate,
  alerts,
  onMarkAllAlertsRead,
  avatarUrl = '',
  userName = 'Supervisor',
  employeeId = 'Supervisor',
  isProfileMenuOpen,
  onToggleProfileMenu,
  searchQuery = '',
  onSearchChange,
  isSearchOpen = false,
  onToggleSearch,
  onOpenAvatarPicker,
  devicePreset = 'universal',
  onSignOut,
}) => {
  const [internalNotifOpen, setInternalNotifOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);
  const [internalProfileOpen, setInternalProfileOpen] = useState(false);
  const [internalSearchOpen, setInternalSearchOpen] = useState(false);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');

  // Controlled or uncontrolled profile menu state
  const isProfileOpen = isProfileMenuOpen !== undefined ? isProfileMenuOpen : internalProfileOpen;

  const setProfileOpen = useCallback(
    (open: boolean) => {
      if (onToggleProfileMenu) {
        onToggleProfileMenu(open);
      } else {
        setInternalProfileOpen(open);
      }
    },
    [onToggleProfileMenu]
  );

  // Controlled or uncontrolled search state
  const searchActive = isSearchOpen !== undefined ? isSearchOpen : internalSearchOpen;
  const currentQuery = onSearchChange !== undefined ? searchQuery : internalSearchQuery;

  const handleSetSearchActive = (active: boolean) => {
    if (onToggleSearch) {
      onToggleSearch(active);
    } else {
      setInternalSearchOpen(active);
    }
    if (active) {
      setProfileOpen(false);
      setInternalNotifOpen(false);
      // Automatically switch to jobs view only if not already on a searchable view (jobs or alerts)
      if (activeScreen !== 'jobs' && activeScreen !== 'alerts') {
        onNavigate('jobs');
      }
    }
  };

  const handleQueryChange = (val: string) => {
    if (onSearchChange) {
      onSearchChange(val);
    } else {
      setInternalSearchQuery(val);
    }
  };

  const menuContainerRef = useRef<HTMLDivElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBarContainerRef = useRef<HTMLDivElement>(null);

  // Focus search input when expanded
  useEffect(() => {
    if (searchActive) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [searchActive]);

  // Robust dismiss on touch/click outside
  useEffect(() => {
    const handleOutsideInteraction = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      // Dismiss search bar if clicking outside search bar container
      if (searchActive && searchBarContainerRef.current && !searchBarContainerRef.current.contains(target)) {
        handleSetSearchActive(false);
        handleQueryChange('');
      }

      // Dismiss profile menu if clicking outside its container
      if (isProfileOpen && menuContainerRef.current && !menuContainerRef.current.contains(target)) {
        setProfileOpen(false);
      }

      // Dismiss notifications if clicking outside its container
      if (internalNotifOpen && notifContainerRef.current && !notifContainerRef.current.contains(target)) {
        setInternalNotifOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchActive) {
          handleSetSearchActive(false);
          handleQueryChange('');
        }
        setProfileOpen(false);
        setInternalNotifOpen(false);
      }
    };

    if (isProfileOpen || internalNotifOpen || searchActive) {
      document.addEventListener('mousedown', handleOutsideInteraction, true);
      document.addEventListener('touchstart', handleOutsideInteraction, true);
    }
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction, true);
      document.removeEventListener('touchstart', handleOutsideInteraction, true);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileOpen, internalNotifOpen, setProfileOpen, searchActive]);

  const unreadAlerts = alerts.filter((a) => !a.isRead);
  const unreadCount = unreadAlerts.length;

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-[#e2e8f0]">
      {/* Native Mobile Status Bar simulation (adapts to phone OS) */}
      {devicePreset === 'android' ? (
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-xs font-semibold text-[#1e293b] select-none relative z-30">
          <span className="font-bold tracking-tight text-[12px] text-[#1e293b]">{currentTime}</span>
          <div className="flex items-center gap-1.5 text-[#1e293b] text-[11px]">
            <span className="font-bold text-[10px] tracking-tighter">5G</span>
            <span className="material-symbols-outlined text-[15px]">wifi</span>
            <span className="material-symbols-outlined text-[17px]">battery_std</span>
            <span className="text-[10px] font-bold">96%</span>
          </div>
        </div>
      ) : devicePreset === 'ios' ? (
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-[#1e293b] select-none relative z-30">
          <span className="font-bold tracking-tight text-[13px] text-[#1e293b]">{currentTime}</span>
          <div className="flex items-center gap-1.5 text-[#1e293b]">
            <span className="material-symbols-outlined text-[15px]">signal_cellular_alt</span>
            <span className="material-symbols-outlined text-[15px]">wifi</span>
            <span className="material-symbols-outlined text-[17px]">battery_full</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-xs font-semibold text-[#1e293b] select-none relative z-30">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-[12px] text-[#1e293b]">{currentTime}</span>
            <span className="text-[10px] text-[#64748b] font-medium hidden sm:inline">• ITUM Net</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#1e293b]">
            <span className="material-symbols-outlined text-[15px]">signal_cellular_alt</span>
            <span className="material-symbols-outlined text-[15px]">wifi</span>
            <span className="material-symbols-outlined text-[17px]">battery_charging_full</span>
            <span className="text-[10px] font-bold">100%</span>
          </div>
        </div>
      )}

      {/* Primary Navigation & Header Title Bar OR Expandable Search Bar */}
      {searchActive ? (
        /* Expandable Interactive Search Input Bar */
        <div
          ref={searchBarContainerRef}
          className="h-14 px-3 flex items-center gap-2 relative bg-white border-b border-[#e2e8f0] animate-in fade-in duration-150"
        >
          <div className="relative flex-1 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#7a1521] text-[20px] pointer-events-none">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={currentQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder={activeScreen === 'alerts' ? "Search alerts, tickets, hazards..." : "Search tasks, zones, or work orders..."}
              className="w-full pl-9 pr-9 py-2 text-xs font-semibold rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#7a1521] focus:border-[#7a1521] transition-all"
            />
            {currentQuery ? (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                aria-label="Clear search"
                title="Clear text"
                className="absolute right-2.5 w-5 h-5 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] flex items-center justify-center text-[#475569] transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            ) : null}
          </div>

          {/* Close/Cancel Button */}
          <button
            type="button"
            onClick={() => {
              handleSetSearchActive(false);
              handleQueryChange('');
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#7a1521] hover:bg-[#ffe9e8] transition-colors shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* Standard Header Title Bar */
        <div className="h-14 px-4 flex items-center justify-between relative">
          {/* Brand & Circular Crest Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white border border-[#e2e8f0] flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-0.5 ring-1 ring-[#7a1521]/20">
              <img
                src="/LOGO.jpeg"
                alt="University of Moratuwa Logo"
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src =
                    'https://lh3.googleusercontent.com/aida-public/AB6AXuCI26ofuOIGyk1MyB8jc4lPtQ59kNJ-LPlIbLnl-m523fFCZaN-q_bvpxXzVV8AWHIft6TDr4bfnAkf9eN7wL48kN4iqgmkXQap7gxpQw_EmlgzrZw_I8S43xlD-xhw4vuqFanls0BkHJEYaG2f7kA_pO0yA4Hcd1NrLZlyUi87HTaViT91UpyoQiTrNgPwuqynsgbLio80YtBm6H2sA51Cf74lqaS4wD4zTxWd3DPlJhJMeXHa-cEvnpiEJMIiMtJqB_s';
                }}
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a1521]">
                {subtitle}
              </span>
              <h1 className="text-[18px] font-bold text-[#1e293b] tracking-tight leading-none mt-0.5">
                {title}
              </h1>
            </div>
          </div>

          {/* Top-Right Action Icons (No Overlaps) */}
          <div className="flex items-center gap-1.5 relative">
            {/* 1. Quick Search Trigger */}
            <button
              type="button"
              aria-label="Search tasks, zones, or work orders"
              title="Search"
              onClick={() => handleSetSearchActive(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            {/* 2. Notifications Trigger (Moves directly to Alerts tab) */}
            <button
              type="button"
              aria-label="Alerts & Notifications"
              title="Alerts"
              onClick={() => {
                setProfileOpen(false);
                onNavigate('alerts');
              }}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#475569] hover:text-[#1e293b] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[#7a1521] text-white font-bold text-[10px] rounded-full flex items-center justify-center leading-none ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* 3. Circular Photo / Profile Menu Trigger with Edit/Camera Badge */}
            <div className="relative" ref={menuContainerRef}>
              <div className="relative inline-flex items-center">
                <button
                  id="headerProfileBtn"
                  type="button"
                  aria-label="User Profile"
                  aria-haspopup="menu"
                  aria-expanded={isProfileOpen}
                  onClick={() => {
                    setProfileOpen(!isProfileOpen);
                    setInternalNotifOpen(false);
                  }}
                  className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#7a1521]/30 hover:ring-[#7a1521] shadow-sm active:scale-95 transition-all ml-0.5 shrink-0 bg-[#f1f5f9] flex items-center justify-center relative group"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={userName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-[#7a1521]">
                      person
                    </span>
                  )}
                </button>
              </div>

              {/* Profile Menu Dropdown Overlay */}
              {isProfileOpen && (
                <>
                  {/* Full-screen backdrop overlay to dismiss menu */}
                  <div
                    className="fixed inset-0 z-40 bg-black/10 cursor-pointer animate-in fade-in duration-150"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProfileOpen(false);
                    }}
                    aria-label="Tap outside to dismiss menu"
                  />

                  {/* Dropdown Menu Card */}
                  <div
                    role="menu"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-11 right-0 w-[250px] bg-white rounded-xl shadow-2xl border border-[#e2e8f0] overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150 origin-top-right"
                  >
                    {/* Card Header: User Info */}
                    <div className="p-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#7a1521]/30 shrink-0 bg-[#ffe9e8] shadow-xs flex items-center justify-center text-[#7a1521]"
                        >
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="material-symbols-outlined text-[24px]">person</span>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#1e293b] truncate">{userName}</span>
                          <span className="text-[10px] text-[#475569] truncate">{employeeId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Menu Items - Only Sign Out */}
                    <div className="p-1.5 flex flex-col gap-0.5 text-xs text-[#1e293b]">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          if (onSignOut) {
                            onSignOut();
                          } else {
                            alert(`Shift ended safely for ${userName} (${employeeId}). Logs synced.`);
                          }
                        }}
                        className="flex items-center gap-2 px-2.5 py-2 rounded-xl hover:bg-[#fee2e2] text-[#dc2626] text-left font-bold transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

