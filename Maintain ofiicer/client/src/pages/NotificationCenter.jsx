import React, { useState, useEffect } from 'react';
import { 
  CheckCheck, 
  Settings, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Check 
} from 'lucide-react';
import { fetchNotifications, updateNotification, markAllNotificationsRead } from '../api';

export default function NotificationCenter({ setCurrentPage, setSettingsTab, setSelectedRequestId }) {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread'

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    const data = await fetchNotifications();
    if (data) setNotifications(data);
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  const handleMarkRead = async (id) => {
    await updateNotification(id, { read: true });
    loadNotifications();
  };

  const handleDismiss = async (id) => {
    await updateNotification(id, { dismiss: true });
    loadNotifications();
  };

  const handleOpenNotificationSettings = () => {
    if (setSettingsTab) setSettingsTab('notifications');
    setCurrentPage('settings');
  };

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'urgent':
        return (
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#fffbeb', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} />
          </div>
        );
      case 'completed':
        return (
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle size={18} />
          </div>
        );
      case 'system':
        return (
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Info size={18} />
          </div>
        );
      default:
        return (
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} />
          </div>
        );
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 className="headline-md" style={{ color: '#1e293b' }}>
            Notification Center
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            Manage and view all your system alerts and updates.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleMarkAllRead}
            className="btn btn-secondary"
            style={{ padding: '8px 16px', gap: '6px' }}
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
          <button 
            onClick={handleOpenNotificationSettings}
            className="btn btn-primary"
            style={{ padding: '8px 16px', gap: '6px' }}
          >
            <Settings size={16} /> Notification Settings
          </button>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Tabs Bar */}
        <div style={{
          display: 'flex',
          gap: '24px',
          padding: '0 24px',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              padding: '14px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'all' ? '2px solid #7a1521' : '2px solid transparent',
              color: activeTab === 'all' ? '#7a1521' : '#64748b',
              fontWeight: activeTab === 'all' ? 600 : 500,
              fontSize: '13.5px',
              cursor: 'pointer'
            }}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            style={{
              padding: '14px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'unread' ? '2px solid #7a1521' : '2px solid transparent',
              color: activeTab === 'unread' ? '#7a1521' : '#64748b',
              fontWeight: activeTab === 'unread' ? 600 : 500,
              fontSize: '13.5px',
              cursor: 'pointer'
            }}
          >
            Unread
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filteredNotifs.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No notifications found in this view.
            </div>
          ) : (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                  backgroundColor: notif.read ? '#ffffff' : '#fdfbfa'
                }}
              >
                {getIcon(notif.type)}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#1e293b' }}>
                      {notif.title}
                    </div>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {notif.time}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                    {notif.message}
                  </p>

                  {/* Actions Links */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '12.5px' }}>
                    {notif.requestId && (
                      <button
                        onClick={() => {
                          setSelectedRequestId(notif.requestId);
                          setCurrentPage('request-review');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#7a1521',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        {notif.type === 'urgent' ? 'Assign Job' : notif.type === 'completed' ? 'Review Details' : 'View Request'}
                      </button>
                    )}

                    <button
                      onClick={() => handleDismiss(notif.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Dismiss
                    </button>

                    {!notif.read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0
                        }}
                      >
                        <Check size={13} /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load older notifications footer */}
        <div style={{
          padding: '16px',
          textAlign: 'center',
          backgroundColor: '#fafbfd',
          borderTop: '1px solid #f1f5f9'
        }}>
          <button
            onClick={() => alert('All older notifications loaded.')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Load older notifications
          </button>
        </div>
      </div>
    </div>
  );
}
