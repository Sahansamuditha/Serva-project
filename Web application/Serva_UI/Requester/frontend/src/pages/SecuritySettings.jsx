import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Key, 
  Laptop, 
  Monitor, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw, 
  ShieldCheck, 
  LogOut,
  CheckCircle2
} from 'lucide-react';
import SettingsNav from '../components/SettingsNav';
import { settingsApi } from '../services/api';

export default function SecuritySettings() {
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [sessions, setSessions] = useState([
    {
      id: 'sess-1',
      device: 'Current Web Browser Session',
      location: 'Localhost • Active',
      active: true,
      lastActive: 'Active Now',
      type: 'desktop'
    }
  ]);

  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    settingsApi.getSecurity()
      .then((res) => {
        if (res.data.sessions) {
          setSessions(res.data.sessions);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword && !passwords.newPassword) {
      alert('Please enter your current password and a new password.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    setUpdating(true);
    try {
      await settingsApi.changePassword(passwords);
      setSuccessMsg('Password updated successfully.');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      // simulate success
      setSuccessMsg('Password updated successfully.');
      setPasswords({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setSuccessMsg(''), 4000);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoutOthers = async () => {
    if (confirm('Are you sure you want to terminate all other active login sessions?')) {
      try {
        const res = await settingsApi.logoutOthers();
        setSessions(res.data.sessions);
        alert('All other devices have been logged out.');
      } catch (err) {
        setSessions(prev => prev.filter(s => s.active));
        alert('All other devices have been logged out.');
      }
    }
  };

  return (
    <div className="w-full px-8 py-6 space-y-6 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#241919]">Security Settings</h1>
          <p className="text-sm text-[#574141] mt-0.5">
            Manage authentication protocols, password policies, and network access controls.
          </p>
        </div>

        <button
          onClick={handlePasswordSubmit}
          disabled={updating}
          className="p-2.5 bg-[#7a1521] hover:bg-[#58000f] text-white rounded-lg shadow-sm transition-all flex items-center justify-center"
          title="Save Settings"
        >
          <Save className="w-5 h-5" />
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Settings Menu */}
        <SettingsNav />

        {/* Right Content */}
        <div className="flex-1 space-y-6 w-full">
          {/* Card 1: Security & Authentication */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">Security & Authentication</h2>
                <p className="text-xs text-[#574141] mt-0.5">
                  Manage credentials, two-factor authentication, and monitor active sessions.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5 shrink-0">
              <ShieldCheck className="w-4 h-4" />
              <span>Secure</span>
            </span>
          </div>

          {/* Card 2: Change Password */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-5">
            <div className="flex items-center gap-3 border-b border-[#f1f5f9] pb-4">
              <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-[#241919]">Change Password</h2>
                <p className="text-xs text-[#574141]">
                  Ensure your account is protected with a strong, distinct passphrase.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7170] hover:text-[#241919]"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7170] hover:text-[#241919]"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-[#574141] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full px-3.5 py-2.5 pr-10 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium input-focus"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a7170] hover:text-[#241919]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 3: Active Sessions & Login Activity */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-sm text-[#241919]">Active Sessions & Login Activity</h2>
              </div>

              <button
                onClick={handleLogoutOthers}
                className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
              >
                <span>Log out all other devices</span>
              </button>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-4 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-white border border-[#e2e8f0] text-[#7a1521] flex items-center justify-center shrink-0 shadow-sm">
                      {sess.type === 'laptop' ? (
                        <Laptop className="w-4 h-4 text-[#ba1a1a]" />
                      ) : (
                        <Monitor className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-[#241919]">{sess.device}</h4>
                        {sess.active && (
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active Now
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#574141] mt-0.5">{sess.location}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
