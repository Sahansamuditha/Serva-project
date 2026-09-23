import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, ChevronDown, User, Shield, LogOut, X, Briefcase, Users as UsersIcon, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export default function TopNavbar({
  title,
  subtitle,
  onSearch,
  globalSearch = '',
  onSelectJob,
  onNavigate,
  notificationCount = 5,
  onNotificationClick,
  onProfileClick,
  profileAvatar,
  profileName = 'Admin',
  profileEmail = 'anura.perera@itum.mrt.ac.lk',
  profileInitials = 'AD'
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchValue, setSearchValue] = useState(globalSearch);
  const [showSearchPopover, setShowSearchPopover] = useState(false);
  const [searchResults, setSearchResults] = useState({ jobs: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchValue(globalSearch);
  }, [globalSearch]);

  // Perform search query to server/mock state
  const performSearch = async (query) => {
    setIsLoading(true);
    try {
      const [jobsRes, usersRes] = await Promise.all([
        api.getJobs({ search: query }),
        api.getUsers({ search: query })
      ]);
      setSearchResults({
        jobs: (jobsRes.jobs || []).slice(0, 5),
        users: (usersRes.users || []).slice(0, 4)
      });
    } catch (err) {
      console.error("Search fetch failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) onSearch(val);
    setShowSearchPopover(true);
    performSearch(val);
  };

  const handleFocus = () => {
    setShowSearchPopover(true);
    performSearch(searchValue);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    if (onSearch) onSearch('');
    performSearch('');
  };

  const handleSearchClick = async () => {
    setShowSearchPopover(false);
    const query = searchValue.trim();

    if (onSearch) onSearch(query);

    // 1. If currently on Users page (or title === 'Users'), stay on Users page
    if (title === 'Users' || activePage === 'users') {
      if (onNavigate) onNavigate('users');
      return;
    }

    // 2. If currently on Jobs page, stay on Jobs page
    if (title === 'Jobs' || activePage === 'jobs') {
      if (onNavigate) onNavigate('jobs');
      return;
    }

    // 3. If currently on Notifications page, stay on Notifications page
    if (title === 'Notifications' || activePage === 'notifications') {
      if (onNavigate) onNavigate('notifications');
      return;
    }

    if (!query) {
      if (onNavigate) onNavigate('users');
      return;
    }

    setIsLoading(true);
    try {
      const [jobsRes, usersRes] = await Promise.all([
        api.getJobs({ search: query }),
        api.getUsers({ search: query })
      ]);
      const matchingJobs = jobsRes.jobs || [];
      const matchingUsers = usersRes.users || [];

      // If user ID / JOB- ID typed explicitly
      if (query.toUpperCase().startsWith('#JOB-') || query.toUpperCase().startsWith('JOB-')) {
        if (matchingJobs.length > 0 && onSelectJob) {
          onSelectJob(matchingJobs[0].jobId || matchingJobs[0].id);
        } else if (onNavigate) {
          onNavigate('jobs');
        }
      } else if (matchingUsers.length > 0) {
        // If matching users found, navigate to Users dashboard with search filter
        if (onNavigate) onNavigate('users');
      } else if (matchingJobs.length > 0) {
        if (onNavigate) onNavigate('jobs');
      } else {
        // Fallback to Users page search
        if (onNavigate) onNavigate('users');
      }
    } catch (err) {
      console.error("Search click navigation failed", err);
      if (onNavigate) onNavigate('users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchClick();
    }
  };

  const handleSelectJobResult = (jobId) => {
    setShowSearchPopover(false);
    if (onSelectJob) {
      onSelectJob(jobId);
    }
  };

  const handleSelectUserResult = (usr) => {
    setShowSearchPopover(false);
    if (usr && usr.name && onSearch) {
      onSearch(usr.name);
    }
    if (onNavigate) {
      onNavigate('users');
    }
  };

  const handleViewAllJobs = () => {
    setShowSearchPopover(false);
    if (onNavigate) {
      onNavigate('jobs');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-semibold">Critical</span>;
      case 'high':
        return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">High</span>;
      case 'medium':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold">Medium</span>;
      case 'low':
        return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">Low</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{priority}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'in progress':
        return <span className="bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full text-[10px]">In Progress</span>;
      case 'scheduled':
        return <span className="bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded-full text-[10px]">Scheduled</span>;
      case 'completed':
        return <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded-full text-[10px]">Completed</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full text-[10px]">{status}</span>;
    }
  };

  const hasResults = searchResults.jobs.length > 0 || searchResults.users.length > 0;
  const isQueryEmpty = !searchValue || searchValue.trim().length === 0;

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-30 shadow-[0px_1px_2px_rgba(0,0,0,0.02)]">
      {/* Title / Breadcrumbs */}
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
        {subtitle && (
          <span className="text-xs bg-[#f3dedd] text-[#58000f] font-medium px-2 py-0.5 rounded ml-2">
            {subtitle}
          </span>
        )}
      </div>

      {/* Center Search Bar: Full Width Expanded with Suggestions Popover & Dedicated Search Button */}
      <div className="flex-1 max-w-4xl mx-6 relative">
        <div className="relative w-full flex items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchValue}
              placeholder="Search requests, jobs, users..."
              onChange={handleInputChange}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50/80 border border-slate-200/90 rounded-l-lg border-r-0 text-slate-700 placeholder-slate-400 focus:bg-white focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all shadow-[0px_1px_2px_rgba(0,0,0,0.02)]"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearchClick}
            className="px-4 py-2 bg-[#58000f] hover:bg-[#7a1521] active:scale-95 text-white text-xs font-semibold rounded-r-lg border border-[#58000f] transition-all flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer"
            title="Click to search"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>

        {/* Live Search Suggestions Popover Dropdown */}
        {showSearchPopover && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowSearchPopover(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-50 max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5">
                  {isQueryEmpty ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#58000f]" />
                      Suggested Maintenance Jobs & Personnel
                    </>
                  ) : (
                    <>
                      <Search className="w-3.5 h-3.5 text-[#58000f]" />
                      Search Suggestions for "<span className="text-[#58000f] font-bold">{searchValue}</span>"
                    </>
                  )}
                </span>
                {isLoading && <span className="text-[11px] text-slate-400 animate-pulse">Searching...</span>}
              </div>

              <div className="overflow-y-auto divide-y divide-slate-100">
                {/* Jobs Section */}
                {searchResults.jobs.length > 0 && (
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3 text-[#58000f]" />
                      {isQueryEmpty ? 'Active & Recent Jobs' : 'Matching Jobs'} ({searchResults.jobs.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.jobs.map((job) => {
                        const jId = job.jobId || job.id;
                        return (
                          <div
                            key={jId}
                            onClick={() => handleSelectJobResult(jId)}
                            className="p-3 rounded-lg hover:bg-[#fff8f7] border border-transparent hover:border-[#f3dedd] cursor-pointer transition-all flex items-center justify-between group"
                          >
                            <div className="space-y-1 max-w-[75%]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#58000f] text-xs group-hover:underline">{jId}</span>
                                <span className="text-[11px] text-slate-400">({job.id})</span>
                                {getPriorityBadge(job.priority)}
                              </div>
                              <div className="text-xs font-semibold text-slate-800 truncate">
                                {job.fullTitle || job.title}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-3">
                                <span>📍 {job.locationFull || job.location}</span>
                                <span>👥 {job.assignedTeam || 'Unassigned'}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              {getStatusBadge(job.jobStatus || job.status)}
                              <span className="text-[11px] font-semibold text-[#58000f] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                View Details <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Users Section */}
                {searchResults.users.length > 0 && (
                  <div className="p-2">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <UsersIcon className="w-3 h-3 text-blue-600" />
                      Personnel & Users ({searchResults.users.length})
                    </div>
                    <div className="space-y-1 mt-1">
                      {searchResults.users.map((usr) => (
                        <div
                          key={usr.id}
                          onClick={() => handleSelectUserResult(usr)}
                          className="p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {usr.initials || usr.name?.[0] || 'U'}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-slate-800 group-hover:text-[#58000f]">{usr.name}</div>
                              <div className="text-[11px] text-slate-500">{usr.role} • {usr.department}</div>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {usr.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!isLoading && !hasResults && (
                  <div className="p-6 text-center text-slate-500">
                    <p className="text-xs font-medium">No matching jobs, requests, or users found for "{searchValue}"</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try searching by Job ID (e.g. #JOB-1024), user name, role, or department.</p>
                  </div>
                )}
              </div>

              {/* Popover Footer */}
              {hasResults && (
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={handleViewAllJobs}
                    className="font-semibold text-[#58000f] hover:underline flex items-center gap-1 text-xs"
                  >
                    View in Jobs <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setShowSearchPopover(false);
                      if (onNavigate) onNavigate('users');
                    }}
                    className="font-semibold text-blue-700 hover:underline flex items-center gap-1 text-xs"
                  >
                    View in Users <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right controls: Notification Bell, User profile */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Notification Bell */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-xs overflow-hidden">
              {profileAvatar ? (
                <img src={profileAvatar} alt="Admin Profile" className="w-full h-full object-cover" />
              ) : (
                profileInitials
              )}
            </div>
            <div className="text-left hidden md:block max-w-[120px] truncate">
              <div className="text-xs font-bold text-slate-800 leading-none truncate" title={profileName}>{profileName}</div>
              <div className="text-[10px] text-slate-500 leading-tight">Administrator</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800 truncate" title={profileName}>{profileName}</p>
                <p className="text-[11px] text-slate-500 truncate" title={profileEmail}>{profileEmail}</p>
              </div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onProfileClick && onProfileClick('profile');
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                Profile Settings
              </button>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onProfileClick && onProfileClick('security');
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                Security Settings
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  alert("Logged out");
                }}
                className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

