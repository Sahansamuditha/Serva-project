import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Check,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Info,
  Search,
  X,
  RotateCcw
} from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [tab, setTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState('All');

  const {
    notifications,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    dismissNotification
  } = useUser();

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Sync state if URL query param changes
  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchTerm(q);
  }, [searchParams]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setTypeFilter('All');
    setTab('all');
    setSearchParams({});
  };

  const handleActionClick = (notif, targetPath, message) => {
    if (notif.unread) {
      markNotificationRead(notif.id);
    }
    if (targetPath) {
      navigate(targetPath);
    } else if (message) {
      alert(message);
    }
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
  };

  const handleDismiss = async (id) => {
    await dismissNotification(id);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'request':
        return (
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} />
          </div>
        );
      case 'urgent':
        return (
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} />
          </div>
        );
      case 'completed':
        return (
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} />
          </div>
        );
      case 'system':
      default:
        return (
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Info size={18} />
          </div>
        );
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    const term = searchTerm.toLowerCase().trim();
    const matchesTab = tab === 'all' || (tab === 'unread' && notif.unread);
    const matchesType = typeFilter === 'All' || notif.type === typeFilter;

    if (!term) return matchesTab && matchesType;

    const matchesSearch =
      notif.title?.toLowerCase().includes(term) ||
      notif.message?.toLowerCase().includes(term) ||
      notif.type?.toLowerCase().includes(term) ||
      notif.time?.toLowerCase().includes(term) ||
      (notif.requestId && notif.requestId.toLowerCase().includes(term));

    return matchesTab && matchesType && matchesSearch;
  });

  return (
    <div className="page-container">
      {/* Title & Action Buttons */}
      <div className="page-header-row">
        <div>
          <h1 className="page-header-title">Notification Center</h1>
          <p className="page-header-subtitle">
            Manage, search, and view all your system alerts and updates.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn-outline" onClick={handleMarkAllRead}>
            <Check size={15} />
            <span>Mark all as read</span>
          </button>
          <button
            className="btn-primary"
            onClick={() => navigate('/settings/notifications')}
          >
            <Settings size={15} />
            <span>Notification Settings</span>
          </button>
        </div>
      </div>

      {/* Main Notifications Card */}
      <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filter Bar */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: tab === 'all' ? '600' : '500',
                color: tab === 'all' ? '#7a1521' : '#64748b',
                borderBottom: tab === 'all' ? '2px solid #7a1521' : '2px solid transparent',
                cursor: 'pointer'
              }}
              onClick={() => setTab('all')}
            >
              All Notifications ({notifications.length})
            </button>
            <button
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                fontWeight: tab === 'unread' ? '600' : '500',
                color: tab === 'unread' ? '#7a1521' : '#64748b',
                borderBottom: tab === 'unread' ? '2px solid #7a1521' : '2px solid transparent',
                cursor: 'pointer'
              }}
              onClick={() => setTab('unread')}
            >
              Unread ({notifications.filter((n) => n.unread).length})
            </button>
          </div>

          {/* Right side: Type Filter & Results info & Reset */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing <strong style={{ color: '#0f172a' }}>{filteredNotifications.length}</strong> of {notifications.length}
              {searchTerm && <span> for "<strong>{searchTerm}</strong>"</span>}
            </span>

            <select
              className="form-select"
              style={{ width: '150px', height: '36px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Alert Types</option>
              <option value="request">Requests</option>
              <option value="urgent">Urgent Alerts</option>
              <option value="completed">Completed</option>
              <option value="system">System Alerts</option>
            </select>

            {(searchTerm || typeFilter !== 'All' || tab !== 'all') && (
              <button
                className="btn-outline"
                onClick={handleResetFilters}
                style={{ height: '36px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
                title="Reset filters"
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredNotifications.map((notif, index) => (
            <div
              key={notif.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '20px 24px',
                borderBottom: index === filteredNotifications.length - 1 ? 'none' : '1px solid #f1f5f9',
                backgroundColor: notif.unread ? '#ffffff' : '#fafafa'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {getIcon(notif.type)}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>
                      {notif.title}
                    </h3>
                  </div>

                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.4', maxWidth: '780px' }}>
                    {notif.message}
                  </p>

                  {/* Actions Link Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '12px' }}>
                    {notif.type === 'request' && (
                      <span
                        style={{ color: '#7a1521', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => handleActionClick(notif, '/requests')}
                      >
                        View Request
                      </span>
                    )}
                    {notif.type === 'urgent' && (
                      <span
                        style={{ color: '#7a1521', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => handleActionClick(notif, '/requests')}
                      >
                        Assign Request
                      </span>
                    )}
                    {notif.type === 'completed' && (
                      <span
                        style={{ color: '#7a1521', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => handleActionClick(notif, '/requests')}
                      >
                        Review Details
                      </span>
                    )}
                    {notif.type === 'system' && (
                      <span
                        style={{ color: '#7a1521', fontWeight: '600', cursor: 'pointer' }}
                        onClick={() => handleActionClick(notif, null, 'Scheduled maintenance window: Aug 24, 2:00 AM - 4:00 AM')}
                      >
                        View Details
                      </span>
                    )}

                    <span
                      style={{ color: '#64748b', cursor: 'pointer' }}
                      onClick={() => handleDismiss(notif.id)}
                    >
                      Dismiss
                    </span>

                    {notif.unread && (
                      <span
                        style={{ color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        onClick={() => handleMarkRead(notif.id)}
                      >
                        <Check size={12} /> Mark as read
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {notif.time}
              </span>
            </div>
          ))}

          {filteredNotifications.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', backgroundColor: '#f8fafc' }}>
              <Search size={36} style={{ color: '#94a3b8', marginBottom: '10px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                No notifications found
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                {searchTerm
                  ? `No alerts matched your search query "${searchTerm}".`
                  : 'You have no notifications matching the selected tab or alert filter.'}
              </p>
              <button className="btn-primary" onClick={handleResetFilters} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <RotateCcw size={14} /> Clear Search & Filters
              </button>
            </div>
          )}
        </div>

        {/* Load older notifications footer */}
        <button
          style={{
            width: '100%',
            padding: '14px',
            border: 'none',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            color: '#475569',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          onClick={() => alert('All older notifications loaded')}
        >
          Load older notifications
        </button>
      </div>
    </div>
  );
}


