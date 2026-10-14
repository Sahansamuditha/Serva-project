import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertNotice } from '../../types';

interface HeaderProps {
  title: string;
  subtitle?: string;
  activeScreen: string;
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
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle = 'ITUM • SERVA',
  onNavigate,
  alerts,
  onMarkAllAlertsRead,
  avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEWRH06Wr_jVDeWhraMa89yVAS5PuqahaXycJqIG_rseR7pac7Ghv0dCrPxdB2aNQtlyCn1B0XqKwmp--g1zTs_oSXKbL77R9oKWXFUeT8WJHFfjezW-SFWAptCEwqlbveOQKJtXDNByX0TU0qsP_V5WmCVp4zwj8cHNE-zQOOuh7PyoQfJT7b8YoJpYMeppGIPAl8DUOYij_Rgo-WJgt8v-iiCmiJQ7P501yuJwwWeY662nY-4x5ObA',
  userName = 'Kasun Perera',
  employeeId = 'EMP-T8402 • Bay 3',
  isProfileMenuOpen,
  onToggleProfileMenu,
  searchQuery = '',
  onSearchChange,
  isSearchOpen = false,
  onToggleSearch,
  onOpenAvatarPicker,
  devicePreset = 'universal',
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
      // Automatically switch to jobs view so results are immediately visible
      onNavigate('jobs');
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

    if (isProfileOpen || internalNotifOpen) {
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
    <header className="sticky top-0 z-40 bg-[#fff8f7] shadow-[0_1px_8px_rgba(122,21,33,0.06)] border-b border-[#f3dedd]">
      {/* Native Mobile Status Bar simulation (adapts to phone OS) */}
      {devicePreset === 'android' ? (
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-xs font-semibold text-[#241919] select-none relative z-30">
          <span className="font-bold tracking-tight text-[12px] text-[#241919]">{currentTime}</span>
          <div className="flex items-center gap-1.5 text-[#241919] text-[11px]">
            <span className="font-bold text-[10px] tracking-tighter">5G</span>
            <span className="material-symbols-outlined text-[15px]">wifi</span>
            <span className="material-symbols-outlined text-[17px]">battery_std</span>
            <span className="text-[10px] font-bold">96%</span>
          </div>
        </div>
      ) : devicePreset === 'ios' ? (
        <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-[#241919] select-none relative z-30">
          <span className="font-bold tracking-tight text-[13px] text-[#241919]">{currentTime}</span>
          <div className="flex items-center gap-1.5 text-[#241919]">
            <span className="material-symbols-outlined text-[15px]">signal_cellular_alt</span>
            <span className="material-symbols-outlined text-[15px]">wifi</span>
            <span className="material-symbols-outlined text-[17px]">battery_full</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-xs font-semibold text-[#241919] select-none relative z-30">
          <div className="flex items-center gap-1.5">
            <span className="font-bold tracking-tight text-[12px] text-[#241919]">{currentTime}</span>
            <span className="text-[10px] text-[#8a7170] font-medium hidden sm:inline">• ITUM Net</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#241919]">
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
        <div className="h-14 px-3 flex items-center gap-2 relative bg-white border-b border-[#ffe9e8] animate-in fade-in duration-150">
          <div className="relative flex-1 flex items-center">
            <span className="material-symbols-outlined absolute left-3 text-[#7a1521] text-[20px] pointer-events-none">
              search
            </span>
            <input
              ref={searchInputRef}
              type="text"
              value={currentQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search tasks, zones, or work orders..."
              className="w-full pl-9 pr-9 py-2 text-xs font-semibold rounded-xl bg-[#fff8f7] border border-[#debfbf] text-[#241919] placeholder:text-[#8a7170] focus:outline-none focus:ring-1 focus:ring-[#7a1521] focus:border-[#7a1521] transition-all"
            />
            {currentQuery ? (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                aria-label="Clear search"
                title="Clear text"
                className="absolute right-2.5 w-5 h-5 rounded-full bg-[#e0e3e5] hover:bg-[#debfbf] flex items-center justify-center text-[#574141] transition-colors"
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
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#7a1521] hover:bg-[#fff0ef] transition-colors shrink-0"
          >
            Cancel
          </button>
        </div>
      ) : (
        /* Standard Header Title Bar */
        <div className="h-14 px-4 flex items-center justify-between relative">
          {/* Brand & Circular Crest Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white border border-[#debfbf]/60 flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-0.5 ring-1 ring-[#7a1521]/20">
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
              <h1 className="text-[18px] font-bold text-[#241919] tracking-tight leading-none mt-0.5">
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
              className="w-9 h-9 flex items-center justify-center rounded-full text-[#574141] hover:text-[#241919] hover:bg-[#f9e3e2] transition-colors"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>

            {/* 2. Notifications Dropdown Trigger (Showing badge '5') */}
            <div className="relative" ref={notifContainerRef}>
              <button
                type="button"
                aria-label="Notifications"
                aria-haspopup="menu"
                aria-expanded={internalNotifOpen}
                onClick={() => {
                  setInternalNotifOpen((prev) => !prev);
                  setProfileOpen(false);
                }}
                className="relative w-9 h-9 flex items-center justify-center rounded-full text-[#574141] hover:text-[#241919] hover:bg-[#f9e3e2] transition-colors"
              >
                <span className="material-symbols-outlined text-[22px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[17px] h-[17px] px-1 bg-[#58000f] text-white font-bold text-[10px] rounded-full flex items-center justify-center leading-none ring-2 ring-[#fff8f7]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Popover Dropdown */}
              {internalNotifOpen && (
                <>
                  {/* Visual Backdrop Overlay */}
                  <div
                    className="fixed inset-0 z-40 bg-black/5 cursor-pointer"
                    onClick={() => setInternalNotifOpen(false)}
                    aria-label="Dismiss notifications"
                  />

                  <div
                    role="menu"
                    onClick={(e) => e.stopPropagation()}
                    className="absolute top-11 right-0 w-[300px] max-w-[90vw] bg-white rounded-xl shadow-xl border border-[#debfbf]/60 overflow-hidden z-50 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="flex items-center justify-between px-3 py-2 bg-[#fff0ef] border-b border-[#ffe9e8]">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[18px] text-[#7a1521]">
                          notifications_active
                        </span>
                        <span className="text-xs font-bold text-[#241919]">Notifications</span>
                        <span className="px-1.5 py-0.5 rounded-full bg-[#ffdad9] text-[#58000f] text-[10px] font-bold">
                          {unreadCount > 0 ? `${unreadCount} New` : 'All Read'}
                        </span>
                      </div>
                      <button
                        type="button"
                        disabled={unreadCount === 0}
                        onClick={() => {
                          onMarkAllAlertsRead();
                          setInternalNotifOpen(false);
                        }}
                        className="text-[11px] text-[#7a1521] hover:underline font-semibold disabled:opacity-40 disabled:no-underline"
                      >
                        {unreadCount === 0 ? 'All Read' : 'Mark all read'}
                      </button>
                    </div>

                    <div className="flex flex-col divide-y divide-[#ffe9e8] max-h-[260px] overflow-y-auto">
                      {unreadAlerts.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#574141] flex flex-col items-center">
                          <span className="material-symbols-outlined text-emerald-600 text-2xl mb-1">task_alt</span>
                          <span className="font-bold text-[#241919]">All Caught Up!</span>
                          <span className="text-[11px] text-[#8a7170]">No unread notices or safety alerts.</span>
                        </div>
                      ) : (
                        alerts.slice(0, 3).map((alert) => (
                        <div
                          key={alert.id}
                          onClick={() => {
                            setInternalNotifOpen(false);
                            onNavigate('alerts');
                          }}
                          className="p-2.5 hover:bg-[#fff0ef] transition-colors flex items-start gap-2 text-left cursor-pointer"
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              alert.severity === 'CRITICAL' ? 'bg-[#ba1a1a]' : 'bg-[#7a1521]'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#241919] leading-tight truncate">
                              {alert.title}
                            </p>
                            <p className="text-[11px] text-[#574141] truncate mt-0.5">
                              {alert.description}
                            </p>
                            <span className="text-[10px] text-[#8a7170] mt-0.5 block">
                              {alert.timestamp}
                            </span>
                          </div>
                        </div>
                      )))}
                    </div>

                    <div className="p-2 bg-[#fff0ef] text-center border-t border-[#ffe9e8]">
                      <button
                        type="button"
                        onClick={() => {
                          setInternalNotifOpen(false);
                          onNavigate('alerts');
                        }}
                        className="w-full py-1 rounded-lg bg-white text-[#7a1521] text-xs font-semibold hover:bg-[#ffdad9] transition-colors flex items-center justify-center gap-1"
                      >
                        <span>View All Alerts & Hazards</span>
                        <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

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
                  className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-[#7a1521]/30 hover:ring-[#7a1521] shadow-sm active:scale-95 transition-all ml-0.5 shrink-0 bg-[#f9e3e2] flex items-center justify-center relative group"
                >
                  <img
                    src={avatarUrl}
                    alt={userName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEWRH06Wr_jVDeWhraMa89yVAS5PuqahaXycJqIG_rseR7pac7Ghv0dCrPxdB2aNQtlyCn1B0XqKwmp--g1zTs_oSXKbL77R9oKWXFUeT8WJHFfjezW-SFWAptCEwqlbveOQKJtXDNByX0TU0qsP_V5WmCVp4zwj8cHNE-zQOOuh7PyoQfJT7b8YoJpYMeppGIPAl8DUOYij_Rgo-WJgt8v-iiCmiJQ7P501yuJwwWeY662nY-4x5ObA';
                    }}
                  />
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
                    className="absolute top-11 right-0 w-[250px] bg-white rounded-xl shadow-2xl border border-[#debfbf]/60 overflow-hidden z-50 flex flex-col animate-in fade-in zoom-in-95 duration-150 origin-top-right"
                  >
                    {/* Card Header: Kasun Perera with Clickable Avatar + Camera Badge */}
                    <div className="p-3 bg-[#fff0ef] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          onClick={() => {
                            setProfileOpen(false);
                            onOpenAvatarPicker?.();
                          }}
                          title="Click to update photo"
                          className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#7a1521]/30 hover:ring-[#7a1521] shrink-0 bg-[#7a1521] cursor-pointer group shadow-xs"
                        >
                          <img
                            src={avatarUrl}
                            alt={userName}
                            className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white text-[14px]">photo_camera</span>
                          </div>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[#241919] truncate">{userName}</span>
                          <span className="text-[10px] text-[#574141] truncate">{employeeId}</span>
                        </div>
                      </div>

                      {/* Clickable camera badge button */}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onOpenAvatarPicker?.();
                        }}
                        className="w-7 h-7 rounded-full bg-white hover:bg-[#ffdad9] text-[#7a1521] flex items-center justify-center shadow-xs border border-[#debfbf]/60 transition-colors"
                        title="Update profile avatar"
                      >
                        <span className="material-symbols-outlined text-[15px]">photo_camera</span>
                      </button>
                    </div>

                    {/* Card Menu Items */}
                    <div className="p-1.5 flex flex-col gap-0.5 text-xs text-[#241919]">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onNavigate('edit_profile');
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#fff0ef] text-left transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#7a1521]">person</span>
                        <div className="flex flex-col">
                          <span>Officer Profile</span>
                          <span className="text-[10px] text-[#8a7170]">Edit name, ID & assigned bay</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onNavigate('region_settings');
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#fff0ef] text-left transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#7a1521]">pin_drop</span>
                        <span>Campus Zones & Regions</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          onNavigate('system_logs');
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#fff0ef] text-left transition-colors font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px] text-[#7a1521]">receipt_long</span>
                        <span>System Sync Logs</span>
                      </button>

                      <div className="h-[1px] bg-[#ffe9e8] my-1" />

                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          alert(`Shift ended safely for ${userName} (${employeeId}). Logs synced.`);
                        }}
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[#ffdad6] text-[#ba1a1a] text-left font-semibold transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span>Sign Out / End Shift</span>
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

