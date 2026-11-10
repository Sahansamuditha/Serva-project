import React, { useEffect, useState } from 'react';
import { Bell, Sliders, Clock, Save } from 'lucide-react';
import { api } from '../../services/api';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    channels: {
      inApp: true,
      email: true,
      desktopPush: true
    },
    alertPreferences: {
      newRequests: true,
      statusUpdates: true,
      urgentAlerts: true
    },
    digestFrequency: 'Real-time (No Digest)'
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getNotificationSettings().then((res) => {
      if (res && res.success) {
        setSettings(res.notificationSettings);
      }
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateNotificationSettings(settings);
      if (res && res.success) {
        alert('Notification settings updated successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div>
          <h1 className="page-header-title" style={{ fontSize: '22px' }}>Notification Settings</h1>
          <p className="page-header-subtitle">
            Manage how and when you receive system alerts and updates.
          </p>
        </div>

        <button className="btn-icon-red" onClick={handleSave} title="Save Changes" disabled={saving}>
          <Save size={16} />
        </button>
      </div>

      {/* Card 1: Notification Channels */}
      <div className="content-card" style={{ marginBottom: 0 }}>
        <div className="card-header-row" style={{ marginBottom: '16px' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '15px' }}>
              <Bell size={16} color="#7a1521" />
              Notification Channels
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Choose where you want to receive notifications.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* In-App */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>In-App Notifications</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Show notifications in the system header</div>
            </div>
            <input
              type="checkbox"
              checked={settings.channels?.inApp}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  channels: { ...settings.channels, inApp: e.target.checked }
                })
              }
              style={{ width: '18px', height: '18px', accentColor: '#7a1521', cursor: 'pointer' }}
            />
          </div>

          {/* Email */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Email Notifications</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Send alerts to your registered email address</div>
            </div>
            <input
              type="checkbox"
              checked={settings.channels?.email}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  channels: { ...settings.channels, email: e.target.checked }
                })
              }
              style={{ width: '18px', height: '18px', accentColor: '#7a1521', cursor: 'pointer' }}
            />
          </div>

          {/* Desktop Push */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Desktop Push Notifications</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Receive browser push notifications</div>
            </div>
            <input
              type="checkbox"
              checked={settings.channels?.desktopPush}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  channels: { ...settings.channels, desktopPush: e.target.checked }
                })
              }
              style={{ width: '18px', height: '18px', accentColor: '#7a1521', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* Card 2: Alert Preferences */}
      <div className="content-card" style={{ marginBottom: 0 }}>
        <div className="card-header-row" style={{ marginBottom: '16px' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '15px' }}>
              <Sliders size={16} color="#7a1521" />
              Alert Preferences
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Select the events you want to be notified about.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.alertPreferences?.newRequests}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  alertPreferences: { ...settings.alertPreferences, newRequests: e.target.checked }
                })
              }
              style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#7a1521' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>New Maintenance Requests</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Notify when a new request is submitted in your department.</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.alertPreferences?.statusUpdates}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  alertPreferences: { ...settings.alertPreferences, statusUpdates: e.target.checked }
                })
              }
              style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#7a1521' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Status Updates</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Notify when a job status changes (e.g., In Progress to Completed).</div>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={settings.alertPreferences?.urgentAlerts}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  alertPreferences: { ...settings.alertPreferences, urgentAlerts: e.target.checked }
                })
              }
              style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: '#7a1521' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>Urgent Alerts</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Immediate notification for critical system failures or high-priority jobs.</div>
            </div>
          </label>
        </div>
      </div>

      {/* Card 3: Digest Settings */}
      <div className="content-card" style={{ marginBottom: 0 }}>
        <div className="card-header-row" style={{ marginBottom: '16px' }}>
          <div>
            <h2 className="card-title" style={{ fontSize: '15px' }}>
              <Clock size={16} color="#7a1521" />
              Digest Settings
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Configure summary reports for non-urgent notifications.
            </p>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#475569', marginBottom: '6px' }}>
            Digest Frequency
          </label>
          <select
            className="form-select"
            style={{ width: '280px', height: '36px' }}
            value={settings.digestFrequency}
            onChange={(e) => setSettings({ ...settings, digestFrequency: e.target.value })}
          >
            <option value="Real-time (No Digest)">Real-time (No Digest)</option>
            <option value="Daily Digest">Daily Digest (8:00 AM)</option>
            <option value="Weekly Summary">Weekly Summary</option>
          </select>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>
            Daily summaries are sent at 8:00 AM every morning.
          </p>
        </div>
      </div>
    </div>
  );
}
