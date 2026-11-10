import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Check,
  Settings,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Wrench,
  UserCheck,
  ShieldAlert,
  Info,
  Search,
  X,
  Trash2,
  ExternalLink,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react';
import { getAuthUser } from '../utils/auth';

export default function UnifiedNotifications({
  onNavigateToSettings,
  onNavigateToRequest,
  onUpdateUnread
}) {
  const [authUser, setAuthUser] = useState(() => getAuthUser());
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const user = authUser || getAuthUser();
      const role = user?.role || 'all';
      const token = localStorage.getItem('serva_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/notifications?role=${encodeURIComponent(role)}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const serverNotifs = data.notifications || data.data || [];
        setNotifications(Array.isArray(serverNotifs) ? serverNotifs : []);
      } else {
        setNotifications([]);
      }
    } catch (err) {
      console.warn('Notifications fetch error', err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Compute unread count and notify parent if prop provided
  const unreadCount = notifications.filter(n => !n.is_read).length;
  useEffect(() => {
    if (onUpdateUnread) {
      onUpdateUnread(unreadCount);
    }
    window.dispatchEvent(new CustomEvent('serva:notifs-updated', { detail: { unreadCount } }));
  }, [unreadCount, onUpdateUnread]);

  // Mark single notification as read
  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('serva_token');
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) { }

    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, is_read: true } : n);
      const remaining = updated.filter(n => !n.is_read).length;
      if (onUpdateUnread) onUpdateUnread(remaining);
      window.dispatchEvent(new CustomEvent('serva:notifs-updated', { detail: { unreadCount: remaining } }));
      return updated;
    });
    showToast('Notification marked as read.');
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      const user = authUser || getAuthUser();
      const role = user?.role || 'maintenance_officer';
      const token = localStorage.getItem('serva_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };
      await fetch(`/api/notifications/mark-all-read?role=${encodeURIComponent(role)}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ role })
      });
    } catch (e) { }

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    if (onUpdateUnread) {
      onUpdateUnread(0);
    }
    window.dispatchEvent(new CustomEvent('serva:notifs-updated', { detail: { unreadCount: 0 } }));
    showToast('All notifications marked as read.');
  };

  // Dismiss / Delete single notification
  const handleDismiss = async (id) => {
    try {
      const token = localStorage.getItem('serva_token');
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (e) { }

    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      const remaining = updated.filter(n => !n.is_read).length;
      if (onUpdateUnread) onUpdateUnread(remaining);
      window.dispatchEvent(new CustomEvent('serva:notifs-updated', { detail: { unreadCount: remaining } }));
      return updated;
    });
    showToast('Notification dismissed.');
  };

  // Filtered Notifications
  const filteredNotifications = notifications.filter(item => {
    // Tab filter
    if (activeTab === 'unread' && item.is_read) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchMsg = item.message?.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q);
      if (!matchTitle && !matchMsg && !matchBadge) return false;
    }

    // Category filter
    if (categoryFilter !== 'all') {
      const type = (item.type || '').toLowerCase();
      if (categoryFilter === 'urgent' && type !== 'urgent' && type !== 'warning' && type !== 'error') return false;
      if (categoryFilter === 'requests' && type !== 'request' && type !== 'job') return false;
      if (categoryFilter === 'completed' && type !== 'completed' && type !== 'success') return false;
      if (categoryFilter === 'system' && type !== 'system' && type !== 'security' && type !== 'info') return false;
    }

    return true;
  });

  // Relative Time Formatter
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch (e) {
      return 'Recently';
    }
  };

  // Icon Resolver
  const renderIcon = (type = '', title = '') => {
    const t = type.toLowerCase();
    const tit = title.toLowerCase();

    if (t === 'urgent' || t === 'error' || tit.includes('urgent') || tit.includes('critical') || tit.includes('fail')) {
      return (
        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle className="w-5 h-5" />
        </div>
      );
    }
    if (t === 'completed' || t === 'success' || tit.includes('completed') || tit.includes('resolved') || tit.includes('approved')) {
      return (
        <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      );
    }
    if (t === 'user' || tit.includes('user') || tit.includes('labourer') || tit.includes('dispatched')) {
      return (
        <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
          <UserCheck className="w-5 h-5" />
        </div>
      );
    }
    if (t === 'security' || tit.includes('security') || tit.includes('suspicious') || tit.includes('login')) {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-xs">
          <ShieldAlert className="w-5 h-5" />
        </div>
      );
    }
    if (tit.includes('job') || tit.includes('repair') || tit.includes('maintenance')) {
      return (
        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
          <Wrench className="w-5 h-5" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0 shadow-xs">
        <FileText className="w-5 h-5 text-[#7a1521]" />
      </div>
    );
  };

  // Badge Style Resolver
  const getBadgeClass = (type = '', badge = '') => {
    const b = (badge || type).toLowerCase();
    if (b.includes('critical') || b.includes('urgent') || b.includes('danger')) {
      return 'bg-rose-100 text-rose-800 border-rose-200';
    }
    if (b.includes('completed') || b.includes('approved') || b.includes('success')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (b.includes('progress') || b.includes('assigned') || b.includes('dispatched')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (b.includes('security') || b.includes('audit')) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-[#ffe9e8] text-[#7a1521] border-[#ffb3b2]/60';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans antialiased text-[#241919]">

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-[#7a1521] text-white rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#241919] tracking-tight flex items-center gap-2.5">
            <span>🔔</span> Notification Center
          </h1>
          <p className="text-xs sm:text-sm text-[#574141] mt-0.5">
            Manage and view all your institutional alerts, real-time updates, and work orders.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-[#e2e8f0] hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            <span>Mark all as read</span>
          </button>

          <button
            onClick={() => {
              if (onNavigateToSettings) {
                onNavigateToSettings('notifications');
              } else {
                window.location.hash = '#/settings';
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span>Notification Settings</span>
          </button>
        </div>
      </div>

      {/* Main Notification Card Container */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">

        {/* Tabs Bar matching screenshot */}
        <div className="px-6 border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-4 bg-white">
          <div className="flex items-center gap-8 select-none">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3.5 text-sm transition-all cursor-pointer border-b-2 ${activeTab === 'all'
                  ? 'border-[#7a1521] text-[#7a1521] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
                }`}
            >
              All Notifications
            </button>

            <button
              onClick={() => setActiveTab('unread')}
              className={`py-3.5 text-sm transition-all cursor-pointer border-b-2 ${activeTab === 'unread'
                  ? 'border-[#7a1521] text-[#7a1521] font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
                }`}
            >
              Unread
            </button>
          </div>

          {/* Search and Category Filter */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search alerts..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#7a1521]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Category Select */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="pl-3 pr-8 py-1.5 bg-white border border-[#e2e8f0] rounded-lg text-xs font-medium text-slate-700 outline-none focus:border-[#7a1521] cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="urgent">Urgent & Critical</option>
                <option value="requests">Requests & Jobs</option>
                <option value="completed">Completed & Approved</option>
                <option value="system">System & Security</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List Body */}
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#7a1521]" />
            <span>Loading notifications...</span>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="py-16 px-4 text-center flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
              <Bell className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {activeTab === 'unread'
                ? "You're all caught up! You have no unread notifications right now."
                : "No notifications match your current search or category filters."}
            </p>
            {(searchQuery || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="text-xs font-semibold text-[#7a1521] hover:underline pt-1 cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          /* Notification Items List */
          <div className="divide-y divide-[#f1f5f9]">
            {filteredNotifications.map((item) => {
              const isUnread = !item.is_read;
              const hasRedBar = isUnread && (item.type === 'urgent' || item.type === 'error' || (item.badge && item.badge.toLowerCase().includes('critical')));

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isUnread) handleMarkAsRead(item.id);
                  }}
                  className={`p-5 sm:p-6 flex items-start gap-4 transition-colors hover:bg-slate-50/70 relative cursor-pointer ${hasRedBar
                      ? 'border-l-4 border-l-rose-500 bg-rose-50/20'
                      : isUnread
                        ? 'border-l-4 border-l-[#7a1521] bg-[#fff8f7]/40'
                        : 'border-l-4 border-l-transparent'
                    }`}
                >
                  {/* Category Icon */}
                  {renderIcon(item.type, item.title)}

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">

                    {/* Header line: Title + Badge + Time */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className={`text-sm tracking-tight ${isUnread ? 'font-black text-slate-900' : 'font-semibold text-slate-800'}`}>
                          {item.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider uppercase ${getBadgeClass(item.type, item.badge)}`}>
                          {item.badge || item.type || 'NOTICE'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium shrink-0">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeAgo(item.created_at || item.time)}</span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                      {item.message || item.description}
                    </p>

                    {/* Footer Actions */}
                    <div className="flex items-center gap-4 pt-1 text-xs">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mark as read</span>
                        </button>
                      )}

                      {(() => {
                        const reqMatch = (item.link || item.title || item.message || '').match(/REQ-\d+/i);
                        const hasLink = Boolean(item.link || reqMatch);
                        if (!hasLink) return null;

                        const reqId = reqMatch ? reqMatch[0].toUpperCase() : null;
                        const targetLink = item.link || (reqId ? `/requests/${reqId}` : null);

                        return (
                          <button
                            onClick={() => {
                              if (item.is_read === false) handleMarkAsRead(item.id);
                              if (onNavigateToRequest) {
                                onNavigateToRequest(targetLink, { ...item, requestId: reqId });
                              } else if (reqId) {
                                window.dispatchEvent(new CustomEvent('serva:navigate-request', {
                                  detail: { requestId: reqId, link: targetLink, item }
                                }));
                              } else if (targetLink) {
                                window.location.hash = `#${targetLink}`;
                              }
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#7a1521] hover:underline cursor-pointer"
                          >
                            <span>View Details</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        );
                      })()}

                      <button
                        onClick={() => handleDismiss(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-rose-600 transition cursor-pointer ml-auto"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Dismiss</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
