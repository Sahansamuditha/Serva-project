import React, { useEffect, useState } from 'react';
import { Bell, Sliders, Clock, Save, CheckCircle2 } from 'lucide-react';
import SettingsNav from '../components/SettingsNav';
import { settingsApi } from '../services/api';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    channels: {
      inApp: true,
      email: true,
      desktopPush: false
    },
    alertPreferences: {
      newRequests: true,
      statusUpdates: true,
      urgentAlerts: true
    },
    digest: {
      frequency: 'realtime',
      summaryTime: '08:00 AM'
    }
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    settingsApi.getNotifications()
      .then((res) => setSettings(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await settingsApi.updateNotifications(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update notification settings.');
    } finally {
      setSaving(false);
    }
  };

  const toggleChannel = (channel) => {
    setSettings(prev => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: !prev.channels[channel]
      }
    }));
  };

  const toggleAlertPref = (pref) => {
    setSettings(prev => ({
      ...prev,
      alertPreferences: {
        ...prev.alertPreferences,
        [pref]: !prev.alertPreferences[pref]
      }
    }));
  };

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#241919]">Notification Settings</h1>
          <p className="text-sm text-[#574141] mt-0.5">
            Manage how and when you receive system alerts and updates.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="p-2.5 bg-[#7a1521] hover:bg-[#58000f] text-white rounded-lg shadow-sm transition-all flex items-center justify-center"
          title="Save Settings"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
          ✓ Notification preferences saved successfully.
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Settings Menu */}
        <SettingsNav />

        {/* Right Content */}
        <div className="flex-1 space-y-6 w-full">
          {/* Card 1: Notification Channels */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-5">
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] pb-4">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">Notification Channels</h2>
                <p className="text-xs text-[#574141]">
                  Choose where you want to receive notifications.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* In-App Notifications */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-[#241919]">In-App Notifications</h4>
                  <p className="text-xs text-[#574141]">Show notifications in the system header</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleChannel('inApp')}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    settings.channels.inApp ? 'bg-[#7a1521]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      settings.channels.inApp ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <h4 className="text-sm font-bold text-[#241919]">Email Notifications</h4>
                  <p className="text-xs text-[#574141]">Send alerts to your registered email address</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleChannel('email')}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    settings.channels.email ? 'bg-[#7a1521]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      settings.channels.email ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>

              {/* Desktop Push Notifications */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <h4 className="text-sm font-bold text-[#241919]">Desktop Push Notifications</h4>
                  <p className="text-xs text-[#574141]">Receive browser push notifications</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleChannel('desktopPush')}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                    settings.channels.desktopPush ? 'bg-[#7a1521]' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      settings.channels.desktopPush ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Alert Preferences */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-5">
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] pb-4">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">Alert Preferences</h2>
                <p className="text-xs text-[#574141]">
                  Select the events you want to be notified about.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Checkbox 1 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.alertPreferences.newRequests}
                  onChange={() => toggleAlertPref('newRequests')}
                  className="mt-1 w-4 h-4 rounded border-[#e2e8f0] text-[#7a1521] focus:ring-[#7a1521] cursor-pointer"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#241919] group-hover:text-[#7a1521]">
                    New Maintenance Requests
                  </h4>
                  <p className="text-xs text-[#574141]">
                    Notify when a new request is submitted in your department.
                  </p>
                </div>
              </label>

              {/* Checkbox 2 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.alertPreferences.statusUpdates}
                  onChange={() => toggleAlertPref('statusUpdates')}
                  className="mt-1 w-4 h-4 rounded border-[#e2e8f0] text-[#7a1521] focus:ring-[#7a1521] cursor-pointer"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#241919] group-hover:text-[#7a1521]">
                    Status Updates
                  </h4>
                  <p className="text-xs text-[#574141]">
                    Notify when a job status changes (e.g., In Progress to Completed).
                  </p>
                </div>
              </label>

              {/* Checkbox 3 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={settings.alertPreferences.urgentAlerts}
                  onChange={() => toggleAlertPref('urgentAlerts')}
                  className="mt-1 w-4 h-4 rounded border-[#e2e8f0] text-[#7a1521] focus:ring-[#7a1521] cursor-pointer"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#241919] group-hover:text-[#7a1521]">
                    Urgent Alerts
                  </h4>
                  <p className="text-xs text-[#574141]">
                    Immediate notification for critical system failures or high-priority jobs.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Card 3: Digest Settings */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] pb-4">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">Digest Settings</h2>
                <p className="text-xs text-[#574141]">
                  Configure summary reports for non-urgent notifications.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#574141] mb-1.5">
                  Digest Frequency
                </label>
                <select
                  value={settings.digest.frequency}
                  onChange={(e) => setSettings({
                    ...settings,
                    digest: { ...settings.digest, frequency: e.target.value }
                  })}
                  className="w-full max-w-sm px-3.5 py-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                >
                  <option value="realtime">Real-time (No Digest)</option>
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Digest</option>
                </select>
              </div>
              <p className="text-xs text-[#8a7170]">
                Daily summaries are sent at 8:00 AM every morning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
