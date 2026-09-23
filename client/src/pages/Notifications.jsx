import React, { useState, useEffect } from 'react';
import {
  CheckCheck,
  Settings,
  ShieldAlert,
  ThermometerSnowflake,
  UserPlus2,
  Database,
  Wrench,
  Server,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export default function Notifications({ onNavigateToSettings, globalSearch = '' }) {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(3);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = notifications.filter((n) => {
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' && n.unread);
    const query = (globalSearch || '').trim().toLowerCase();
    const matchesSearch = !query ||
      (n.title && n.title.toLowerCase().includes(query)) ||
      (n.description && n.description.toLowerCase().includes(query)) ||
      (n.badge && n.badge.toLowerCase().includes(query));
    return matchesTab && matchesSearch;
  });

  const getIcon = (type, title) => {
    if (title.includes('Login') || title.includes('Suspicious')) {
      return <ShieldAlert className="w-5 h-5 text-red-500" />;
    }
    if (title.includes('Thermal') || title.includes('Server Room')) {
      return <ThermometerSnowflake className="w-5 h-5 text-amber-500" />;
    }
    if (title.includes('User') || title.includes('Approval')) {
      return <UserPlus2 className="w-5 h-5 text-blue-500" />;
    }
    if (title.includes('Backup') || title.includes('Database')) {
      return <Database className="w-5 h-5 text-emerald-500" />;
    }
    if (title.includes('Work Order') || title.includes('JOB-')) {
      return <Wrench className="w-5 h-5 text-blue-500" />;
    }
    return <Server className="w-5 h-5 text-purple-500" />;
  };

  const getBadgeStyle = (badgeType) => {
    switch (badgeType) {
      case 'danger':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'info':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and view all your system alerts and updates.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <CheckCheck className="w-4 h-4 text-slate-500" />
            <span>Mark all as read</span>
          </button>

          <button
            onClick={() => onNavigateToSettings('notifications')}
            className="flex items-center gap-2 px-5 py-2 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Notification Settings</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="admin-card overflow-hidden">
        {/* Tabs Bar */}
        <div className="px-6 border-b border-slate-200/80 flex items-center gap-6">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition-all ${activeTab === 'all'
              ? 'border-[#7a1521] text-[#7a1521]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            All Notifications <span className="ml-1 px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-600">{notifications.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('unread')}
            className={`py-3.5 text-xs font-semibold border-b-2 transition-all ${activeTab === 'unread'
              ? 'border-[#7a1521] text-[#7a1521]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
          >
            Unread <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">{unreadCount}</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="divide-y divide-slate-100">
          {filteredNotifs.map((notif) => {
            const hasRedBar = notif.unread && notif.badgeType === 'danger';

            return (
              <div
                key={notif.id}
                className={`p-6 flex items-start gap-4 transition-colors hover:bg-slate-50/70 relative ${hasRedBar ? 'border-l-4 border-l-red-500' : notif.unread ? 'bg-[#fff8f7]/30' : ''
                  }`}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(notif.badgeType, notif.title)}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${getBadgeStyle(notif.badgeType)}`}>
                        {notif.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium shrink-0">{notif.time}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                    {notif.description}
                  </p>

                  {/* Quick Action Links */}
                  <div className="flex items-center gap-4 text-xs pt-1">
                    {notif.actions?.map((act, idx) => {
                      if (act === 'Mark as read') {
                        return notif.unread ? (
                          <button
                            key={idx}
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Mark as read</span>
                          </button>
                        ) : null;
                      }

                      const isDanger = act.toLowerCase().includes('block') || act.toLowerCase().includes('reject');
                      const isPrimary = act.toLowerCase().includes('approve') || act.toLowerCase().includes('dispatch');

                      return (
                        <button
                          key={idx}
                          onClick={() => alert(`Action executed: ${act}`)}
                          className={`font-semibold hover:underline ${isDanger ? 'text-red-600' : isPrimary ? 'text-[#7a1521]' : 'text-[#7a1521]'
                            }`}
                        >
                          {act}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
