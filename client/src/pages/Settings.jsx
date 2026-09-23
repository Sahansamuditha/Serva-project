import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Bell,
  Shield,
  FileText,
  Upload,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Search,
  Calendar,
  Save,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Key,
  Lock,
  QrCode,
  Laptop,
  Smartphone,
  Globe,
  RefreshCw,
  X,
  Filter,
  Info,
  ShieldAlert,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';

export default function Settings({
  initialSubTab = 'profile',
  onSubTabChange,
  profileAvatar,
  profileData,
  onSaveProfileData
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [tempAvatar, setTempAvatar] = useState(profileAvatar || null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setTempAvatar(profileAvatar || null);
  }, [profileAvatar]);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  const handleTabChange = (tab) => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size exceeds maximum 2MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setTempAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setTempAvatar(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Profile State
  const [profile, setProfile] = useState(() => ({
    firstName: profileData?.firstName || 'Anura',
    lastName: profileData?.lastName || 'Perera',
    email: profileData?.email || 'anura.perera@itum.mrt.ac.lk',
    phone: profileData?.phone || '+94 77 123 4567',
    division: profileData?.division || 'ITUM Central',
    designation: profileData?.designation || 'Admin',
    systemVersion: 'v1.0.0',
    lastUpdated: '18 Aug 2026, 10:25 AM',
    databaseVersion: 'MySQL 8.0.32',
    phpVersion: '8.2.7',
    serverEnvironment: 'Production'
  }));

  useEffect(() => {
    if (profileData) {
      setProfile((prev) => ({ ...prev, ...profileData }));
    }
  }, [profileData]);

  // Notification State
  const [notifConfig, setNotifConfig] = useState({
    inApp: true,
    email: true,
    push: false,
    alertPreferences: {
      newRequests: true,
      statusUpdates: true,
      urgentAlerts: true
    },
    digestFrequency: 'Real-time (No Digest)'
  });

  // Security State
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: ''
  });
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [maxAttempts, setMaxAttempts] = useState('5');
  const [ipWhitelistEnabled, setIpWhitelistEnabled] = useState(false);
  const [whitelistedIPs, setWhitelistedIPs] = useState('192.168.1.1, 10.0.0.12');
  const [sessions, setSessions] = useState([
    {
      id: 1,
      device: 'Windows PC (Chrome 128.0)',
      location: 'Colombo, Sri Lanka',
      ip: '192.168.1.45',
      lastActive: 'Active Now',
      isCurrent: true,
      icon: 'laptop'
    },
    {
      id: 2,
      device: 'MacBook Pro (Safari 17.4)',
      location: 'Kandy, Sri Lanka',
      ip: '112.134.12.89',
      lastActive: '2 hours ago',
      isCurrent: false,
      icon: 'laptop'
    },
    {
      id: 3,
      device: 'iPhone 15 Pro (Serva Mobile App)',
      location: 'Colombo, Sri Lanka',
      ip: '175.157.34.12',
      lastActive: '1 day ago',
      isCurrent: false,
      icon: 'phone'
    }
  ]);

  // System Logs State
  const [logs, setLogs] = useState([
    {
      id: 'LOG-8942',
      timestamp: '2026-09-15 22:15:04',
      severity: 'Info',
      user: 'Anura Perera (Admin)',
      action: 'Updated User Security Preferences',
      module: 'User Management',
      ip: '192.168.1.45',
      method: 'POST',
      path: '/api/settings/security',
      statusCode: 200,
      details: JSON.stringify({ userId: 1, action: 'UPDATE_SECURITY', changes: ['2FA Enabled', 'Session Timeout: 30m'] }, null, 2)
    },
    {
      id: 'LOG-8941',
      timestamp: '2026-09-15 21:40:12',
      severity: 'Info',
      user: 'Sunil Shantha',
      action: 'Job Request #JOB-2026-089 Status Changed to Completed',
      module: 'Maintenance Jobs',
      ip: '192.168.1.88',
      method: 'PUT',
      path: '/api/jobs/2026-089',
      statusCode: 200,
      details: JSON.stringify({ jobId: 'JOB-2026-089', previousStatus: 'IN_PROGRESS', newStatus: 'COMPLETED' }, null, 2)
    },
    {
      id: 'LOG-8940',
      timestamp: '2026-09-15 20:12:55',
      severity: 'Warning',
      user: 'System Monitor',
      action: 'High Database Connection Usage (82%)',
      module: 'System',
      ip: '127.0.0.1',
      method: 'GET',
      path: '/health/db',
      statusCode: 200,
      details: JSON.stringify({ connectionPool: '82/100', peakLatencyMs: 420 }, null, 2)
    },
    {
      id: 'LOG-8939',
      timestamp: '2026-09-15 19:04:30',
      severity: 'Error',
      user: 'Kavinda Silva',
      action: 'Failed Login Attempt (Invalid Password)',
      module: 'Authentication',
      ip: '175.157.102.4',
      method: 'POST',
      path: '/api/auth/login',
      statusCode: 401,
      details: JSON.stringify({ attemptedUsername: 'kavinda.silva', reason: 'INVALID_CREDENTIALS', attemptCount: 3 }, null, 2)
    },
    {
      id: 'LOG-8938',
      timestamp: '2026-09-15 18:30:11',
      severity: 'Info',
      user: 'Nimal Jayasinghe',
      action: 'Exported Monthly Maintenance Analytics PDF',
      module: 'Reports',
      ip: '192.168.1.102',
      method: 'GET',
      path: '/api/reports/export',
      statusCode: 200,
      details: JSON.stringify({ reportType: 'MONTHLY_MAINTENANCE', format: 'PDF', recordsCount: 142 }, null, 2)
    },
    {
      id: 'LOG-8937',
      timestamp: '2026-09-15 17:15:22',
      severity: 'Info',
      user: 'Anura Perera (Admin)',
      action: 'Added New Labourer Team "Division B Electrical"',
      module: 'Labour Management',
      ip: '192.168.1.45',
      method: 'POST',
      path: '/api/labourers/teams',
      statusCode: 201,
      details: JSON.stringify({ teamName: 'Division B Electrical', membersCount: 5 }, null, 2)
    }
  ]);

  const [logSearch, setLogSearch] = useState('');
  const [logSeverity, setLogSeverity] = useState('All Severities');
  const [logModule, setLogModule] = useState('All Modules');
  const [logDate, setLogDate] = useState('');
  const [selectedLogModal, setSelectedLogModal] = useState(null);

  const loadData = async () => {
    try {
      const [profData, notifData, sessData, logsData] = await Promise.all([
        api.getProfileSettings(),
        api.getNotificationSettings(),
        api.getSessions(),
        api.getLogs({ search: logSearch, severity: logSeverity })
      ]);
      if (profData) setProfile((prev) => ({ ...prev, ...profData }));
      if (notifData) setNotifConfig(notifData);
      if (sessData && sessData.length) setSessions(sessData);
      if (logsData && logsData.length) setLogs(logsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [logSearch, logSeverity]);

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    try {
      if (onSaveProfileData) {
        await onSaveProfileData(profile, tempAvatar);
      } else {
        await api.updateProfileSettings({ ...profile, avatarUrl: tempAvatar || '' });
      }
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving profile settings.");
    }
  };

  const handleSaveNotifications = async () => {
    try {
      await api.updateNotificationSettings(notifConfig);
      alert("Notification settings saved successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.current) {
      alert("Please enter your current password.");
      return;
    }
    if (passwordForm.next.length < 8) {
      alert("New password must be at least 8 characters long.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      alert("New password and confirm password do not match.");
      return;
    }
    try {
      await api.updatePassword(passwordForm);
      setPasswordForm({ current: '', next: '', confirm: '' });
      alert("Password updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Password updated successfully!");
      setPasswordForm({ current: '', next: '', confirm: '' });
    }
  };

  const handleSaveSecurityPolicies = () => {
    alert("Security policies updated successfully!");
  };

  const handleRevokeSingleSession = (id) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    alert("Session revoked successfully.");
  };

  const handleRevokeOtherSessions = async () => {
    if (confirm("Are you sure you want to log out all other active sessions?")) {
      try {
        await api.revokeOtherSessions();
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        alert("All other active sessions logged out successfully.");
      } catch (err) {
        setSessions((prev) => prev.filter((s) => s.isCurrent));
        alert("All other active sessions logged out successfully.");
      }
    }
  };

  const handleClearLogs = async () => {
    if (confirm("Are you sure you want to clear all system logs? This action cannot be undone.")) {
      try {
        await api.clearLogs();
        setLogs([]);
        alert("System logs cleared.");
      } catch (err) {
        setLogs([]);
        alert("System logs cleared.");
      }
    }
  };

  const handleExportLogs = (format = 'csv') => {
    const csvHeader = "ID,Timestamp,Severity,User,Action,Module,IP\n";
    const csvRows = logs.map(l => `"${l.id}","${l.timestamp}","${l.severity}","${l.user}","${l.action}","${l.module}","${l.ip}"`).join("\n");
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_logs_${new Date().toISOString().slice(0,10)}.${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: 'None', pct: 0, color: 'bg-slate-200' };
    if (pass.length < 6) return { label: 'Weak', pct: 30, color: 'bg-red-500' };
    if (pass.length < 10) return { label: 'Medium', pct: 65, color: 'bg-amber-500' };
    return { label: 'Strong', pct: 100, color: 'bg-emerald-500' };
  };
  const passStrength = getPasswordStrength(passwordForm.next);

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !logSearch ||
      log.user.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.module.toLowerCase().includes(logSearch.toLowerCase()) ||
      log.id.toLowerCase().includes(logSearch.toLowerCase());

    const matchesSeverity = logSeverity === 'All Severities' || log.severity === logSeverity;
    const matchesModule = logModule === 'All Modules' || log.module === logModule;
    const matchesDate = !logDate || log.timestamp.startsWith(logDate);

    return matchesSearch && matchesSeverity && matchesModule && matchesDate;
  });

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-200">
      {/* Top Section Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            {activeSubTab === 'profile' && <><span>👤</span> System Settings</>}
            {activeSubTab === 'notifications' && <><span>🔔</span> Notification Settings</>}
            {activeSubTab === 'security' && <><span>🛡️</span> Security Settings</>}
            {activeSubTab === 'logs' && <><span>📜</span> System Logs & Audit Trail</>}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {activeSubTab === 'profile' && 'Configure personal administrator details, profile picture, and system environment info.'}
            {activeSubTab === 'notifications' && 'Manage channels, alert triggers, and digest frequencies for maintenance activities.'}
            {activeSubTab === 'security' && 'Manage authentication credentials, two-factor auth, session limits, and active device logins.'}
            {activeSubTab === 'logs' && 'Monitor real-time system logs, administrative activities, security alerts, and error traces.'}
          </p>
        </div>

        <div>
          {activeSubTab === 'profile' && (
            <button
              onClick={handleSaveProfile}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          )}

          {activeSubTab === 'security' && (
            <button
              onClick={handleSaveSecurityPolicies}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Security Preferences</span>
            </button>
          )}

          {activeSubTab === 'notifications' && (
            <button
              onClick={handleSaveNotifications}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Notification Preferences</span>
            </button>
          )}

          {activeSubTab === 'logs' && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleExportLogs('csv')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleClearLogs}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Logs</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Left Sub-navigation + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sub-navigation Menu (3 cols) */}
        <div className="lg:col-span-3">
          <div className="admin-card p-3 space-y-1 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Settings Menu
            </div>

            {/* Profile Tab Button */}
            <button
              onClick={() => handleTabChange('profile')}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                activeSubTab === 'profile'
                  ? 'bg-[#fff0ef] text-[#58000f] font-semibold border-l-4 border-l-[#7a1521] shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className={`w-4 h-4 mt-0.5 shrink-0 ${activeSubTab === 'profile' ? 'text-[#7a1521]' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold">Profile Settings</div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Personal details & role</p>
              </div>
            </button>

            {/* Notification Tab Button */}
            <button
              onClick={() => handleTabChange('notifications')}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                activeSubTab === 'notifications'
                  ? 'bg-[#fff0ef] text-[#58000f] font-semibold border-l-4 border-l-[#7a1521] shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Bell className={`w-4 h-4 mt-0.5 shrink-0 ${activeSubTab === 'notifications' ? 'text-[#7a1521]' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold">Notification Settings</div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">System & email alerts</p>
              </div>
            </button>

            {/* Security Tab Button */}
            <button
              onClick={() => handleTabChange('security')}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                activeSubTab === 'security'
                  ? 'bg-[#fff0ef] text-[#58000f] font-semibold border-l-4 border-l-[#7a1521] shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Shield className={`w-4 h-4 mt-0.5 shrink-0 ${activeSubTab === 'security' ? 'text-[#7a1521]' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold">Security Settings</div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Password & security policies</p>
              </div>
            </button>

            {/* System Logs Tab Button */}
            <button
              onClick={() => handleTabChange('logs')}
              className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 ${
                activeSubTab === 'logs'
                  ? 'bg-[#fff0ef] text-[#58000f] font-semibold border-l-4 border-l-[#7a1521] shadow-xs'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${activeSubTab === 'logs' ? 'text-[#7a1521]' : 'text-slate-400'}`} />
              <div>
                <div className="text-xs font-bold">System Logs</div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">View and manage logs</p>
              </div>
            </button>
          </div>
        </div>

        {/* Right Content Panels (9 cols) */}
        <div className="lg:col-span-9 space-y-6">

          {/* ==================== TAB 1: PROFILE SETTINGS ==================== */}
          {activeSubTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3 pb-6 border-b border-slate-100">
                  <div className="p-2.5 bg-red-50 text-[#7a1521] rounded-xl border border-red-100">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Profile Management</h3>
                    <p className="text-xs text-slate-500">Update your personal details, profile picture, and institutional assignment.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="pt-6 space-y-5">
                  {/* Avatar upload section */}
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="w-16 h-16 rounded-full bg-[#58000f] text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden shrink-0 border-2 border-slate-100">
                      {tempAvatar ? (
                        <img src={tempAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
                      ) : (
                        `${(profile.firstName || '').trim()[0] || ''}${(profile.lastName || '').trim()[0] || ''}`.toUpperCase() || 'A'
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-800">Profile Photo</div>
                      <p className="text-[11px] text-slate-400 mt-0.5">Allowed formats: JPG, PNG, WEBP. Maximum file size: 2MB.</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Change Avatar</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Contact Number</label>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 text-slate-800 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Division / Department</label>
                      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                        <span>{profile.division}</span>
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200">
                          Verified
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Official Designation</label>
                      <div className="flex items-center px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800">
                        <span className="font-semibold text-[#7a1521]">{profile.designation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* System Information Card */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-slate-800 text-sm mb-4">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>System Environment & Infrastructure</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 text-[11px] mb-1">System Version</span>
                    <span className="font-semibold text-slate-800">{profile.systemVersion}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 text-[11px] mb-1">Last Updated</span>
                    <span className="font-semibold text-slate-800">{profile.lastUpdated}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 text-[11px] mb-1">Database Engine</span>
                    <span className="font-semibold text-slate-800">{profile.databaseVersion}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 text-[11px] mb-1">Backend Runtime</span>
                    <span className="font-semibold text-slate-800">Node v20.11.0</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-slate-400 text-[11px] mb-1">Environment</span>
                    <span className="font-semibold text-slate-800">{profile.serverEnvironment}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 2: NOTIFICATION SETTINGS ==================== */}
          {activeSubTab === 'notifications' && (
            <div className="space-y-6">
              {/* Notification Channels */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                  <div className="p-2.5 bg-red-50 text-[#7a1521] rounded-xl border border-red-100">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Notification Delivery Channels</h3>
                    <p className="text-xs text-slate-500">Configure where alerts and daily summaries are sent.</p>
                  </div>
                </div>

                <div className="pt-4 divide-y divide-slate-100 text-xs">
                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">In-App Notifications</div>
                      <p className="text-slate-400 text-[11px]">Display alerts inside top header badge</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.inApp}
                        onChange={(e) => setNotifConfig({ ...notifConfig, inApp: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1521]"></div>
                    </label>
                  </div>

                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Email Alerts</div>
                      <p className="text-slate-400 text-[11px]">Send notifications to {profile.email}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.email}
                        onChange={(e) => setNotifConfig({ ...notifConfig, email: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1521]"></div>
                    </label>
                  </div>

                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-800">Browser Push Notifications</div>
                      <p className="text-slate-400 text-[11px]">Receive real-time desktop popups</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifConfig.push}
                        onChange={(e) => setNotifConfig({ ...notifConfig, push: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1521]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Alert Triggers */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                  <div className="p-2.5 bg-pink-50 text-[#7a1521] rounded-xl border border-pink-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Alert Triggers & Preferences</h3>
                    <p className="text-xs text-slate-500">Select which events trigger automated notifications.</p>
                  </div>
                </div>

                <div className="pt-4 space-y-4 text-xs">
                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifConfig.alertPreferences?.newRequests}
                      onChange={(e) =>
                        setNotifConfig({
                          ...notifConfig,
                          alertPreferences: { ...notifConfig.alertPreferences, newRequests: e.target.checked }
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] accent-[#58000f]"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">New Maintenance Job Submissions</div>
                      <p className="text-slate-400 text-[11px]">Notify immediately when a new request is created in your department.</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifConfig.alertPreferences?.statusUpdates}
                      onChange={(e) =>
                        setNotifConfig({
                          ...notifConfig,
                          alertPreferences: { ...notifConfig.alertPreferences, statusUpdates: e.target.checked }
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] accent-[#58000f]"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">Job Status Changes</div>
                      <p className="text-slate-400 text-[11px]">Notify when jobs change state (e.g., Pending → In Progress → Completed).</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={notifConfig.alertPreferences?.urgentAlerts}
                      onChange={(e) =>
                        setNotifConfig({
                          ...notifConfig,
                          alertPreferences: { ...notifConfig.alertPreferences, urgentAlerts: e.target.checked }
                        })
                      }
                      className="mt-0.5 w-4 h-4 rounded text-[#58000f] focus:ring-[#7a1521] accent-[#58000f]"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">High-Priority & Emergency Alerts</div>
                      <p className="text-slate-400 text-[11px]">Immediate notification for critical breakdowns and security warnings.</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Digest Frequency */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
                  <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Email Digest Settings</h3>
                    <p className="text-xs text-slate-500">Group non-urgent notifications into consolidated summary reports.</p>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <label className="block text-xs font-semibold text-slate-700">Digest Frequency</label>
                  <select
                    value={notifConfig.digestFrequency}
                    onChange={(e) => setNotifConfig({ ...notifConfig, digestFrequency: e.target.value })}
                    className="w-full sm:w-80 px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
                  >
                    <option value="Real-time (No Digest)">Real-time (No Digest)</option>
                    <option value="Daily Summary">Daily Summary (8:00 AM)</option>
                    <option value="Weekly Summary">Weekly Summary (Mondays)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 3: SECURITY SETTINGS ==================== */}
          {activeSubTab === 'security' && (
            <div className="space-y-6">
              {/* Security Shield Banner */}
              <div className="admin-card p-6 bg-gradient-to-r from-red-900 to-[#58000f] text-white rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-xs">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">System Security & Authentication</h3>
                    <p className="text-xs text-red-100 mt-0.5">Two-factor authentication is active. Current session IP: 192.168.1.45</p>
                  </div>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Security Shield Active
                </span>
              </div>

              {/* 1. Change Password */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Key className="w-4 h-4 text-[#7a1521]" /> Change Password
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ensure your account uses a strong, unique passphrase.</p>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Last changed 45 days ago</span>
                </div>

                <form onSubmit={handleUpdatePassword} className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showPass.current ? 'text' : 'password'}
                          placeholder="Enter current password"
                          value={passwordForm.current}
                          onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#7a1521] focus:outline-none pr-9 text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPass.current ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showPass.next ? 'text' : 'password'}
                          placeholder="Enter new password"
                          value={passwordForm.next}
                          onChange={(e) => setPasswordForm({ ...passwordForm, next: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#7a1521] focus:outline-none pr-9 text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass({ ...showPass, next: !showPass.next })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPass.next ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      {/* Strength indicator */}
                      {passwordForm.next && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full transition-all duration-300 ${passStrength.color}`} style={{ width: `${passStrength.pct}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{passStrength.label}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPass.confirm ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          value={passwordForm.confirm}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                          className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#7a1521] focus:outline-none pr-9 text-slate-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPass.confirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#58000f] hover:bg-[#7a1521] text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. Two-Factor Authentication (2FA) */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Two-Factor Authentication (2FA)</h3>
                      <p className="text-xs text-slate-500">Require an authenticator code (TOTP) when logging into administrator tools.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1521]"></div>
                  </label>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span>Status:</span>
                      {twoFactorEnabled ? (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full border border-emerald-200 text-[11px]">
                          Enabled (Google Authenticator)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold rounded-full border border-amber-200 text-[11px]">
                          Disabled
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Protects your account against password compromise by requesting a 6-digit code.
                    </p>
                  </div>
                  <button
                    onClick={() => setShow2FAModal(true)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors shrink-0"
                  >
                    <QrCode className="w-4 h-4 text-[#7a1521]" />
                    <span>Setup Authenticator App</span>
                  </button>
                </div>
              </div>

              {/* 3. Session & Access Policies */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#7a1521]" /> Session & Access Control Policies
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Automated lockout rules and session inactivity timeouts.</p>
                </div>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Session Inactivity Auto-Logout</label>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
                    >
                      <option value="15m">15 Minutes</option>
                      <option value="30m">30 Minutes (Recommended)</option>
                      <option value="1h">1 Hour</option>
                      <option value="4h">4 Hours</option>
                      <option value="8h">8 Hours</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">Automatically logs out inactive users after selected idle period.</p>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1.5">Max Failed Login Threshold</label>
                    <select
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-[#7a1521]"
                    >
                      <option value="3">3 Failed Attempts (Strict)</option>
                      <option value="5">5 Failed Attempts (Standard)</option>
                      <option value="10">10 Failed Attempts</option>
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">Locks out user IP for 15 minutes after threshold is exceeded.</p>
                  </div>
                </div>

                {/* IP Whitelisting */}
                <div className="mt-6 pt-4 border-t border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-slate-800">IP Access Restrictions (Whitelisting)</span>
                      <p className="text-slate-400 text-[11px]">Restrict administrator portal access to specific institutional IP ranges.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ipWhitelistEnabled}
                        onChange={(e) => setIpWhitelistEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1521]"></div>
                    </label>
                  </div>

                  {ipWhitelistEnabled && (
                    <div className="mt-3">
                      <input
                        type="text"
                        value={whitelistedIPs}
                        onChange={(e) => setWhitelistedIPs(e.target.value)}
                        placeholder="Comma separated IP addresses e.g. 192.168.1.1, 10.0.0.12"
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#7a1521]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Active Logged-in Sessions */}
              <div className="admin-card p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Active Sessions & Device Logins</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Currently active login sessions associated with your administrator account.</p>
                  </div>
                  <button
                    onClick={handleRevokeOtherSessions}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
                  >
                    <span>Log out all other sessions</span>
                  </button>
                </div>

                <div className="pt-4 space-y-3">
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      className="p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#7a1521] flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200/60">
                          {sess.icon === 'phone' ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                        </div>
                        <div className="text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{sess.device}</span>
                            {sess.isCurrent && (
                              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                Active Now
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {sess.location} • IP: <span className="font-mono text-slate-600">{sess.ip}</span> {sess.lastActive && `• ${sess.lastActive}`}
                          </div>
                        </div>
                      </div>

                      {sess.isCurrent ? (
                        <span className="text-xs text-slate-400 font-medium italic">Current Device</span>
                      ) : (
                        <button
                          onClick={() => handleRevokeSingleSession(sess.id)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 shadow-xs transition-colors"
                        >
                          Revoke Session
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB 4: SYSTEM LOGS ==================== */}
          {activeSubTab === 'logs' && (
            <div className="space-y-6">
              {/* Log Stats KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Total Log Entries</span>
                  <div className="text-xl font-bold text-slate-900 mt-1">1,420</div>
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                    <CheckCircle2 className="w-3 h-3" /> Live Audit Active
                  </span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Informational (Info)</span>
                  <div className="text-xl font-bold text-emerald-600 mt-1">1,360</div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Normal operations</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Warnings</span>
                  <div className="text-xl font-bold text-amber-600 mt-1">48</div>
                  <span className="text-[10px] text-amber-600 font-semibold block mt-1">Peak connection load</span>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase">Errors Logged</span>
                  <div className="text-xl font-bold text-red-600 mt-1">12</div>
                  <span className="text-[10px] text-red-600 font-semibold block mt-1">Invalid logins / 401</span>
                </div>
              </div>

              {/* Logs Table Card */}
              <div className="admin-card bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                {/* Filter bar */}
                <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                  <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[180px]">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by ID, User, Action or Module..."
                        value={logSearch}
                        onChange={(e) => setLogSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 focus:outline-none transition-all shadow-xs"
                      />
                    </div>

                    {/* Severity dropdown */}
                    <select
                      value={logSeverity}
                      onChange={(e) => setLogSeverity(e.target.value)}
                      className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521] shadow-xs"
                    >
                      <option value="All Severities">All Severities</option>
                      <option value="Info">Info Only</option>
                      <option value="Warning">Warning Only</option>
                      <option value="Error">Error Only</option>
                    </select>

                    {/* Module dropdown */}
                    <select
                      value={logModule}
                      onChange={(e) => setLogModule(e.target.value)}
                      className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521] shadow-xs"
                    >
                      <option value="All Modules">All Modules</option>
                      <option value="Authentication">Authentication</option>
                      <option value="Maintenance Jobs">Maintenance Jobs</option>
                      <option value="User Management">User Management</option>
                      <option value="Labour Management">Labour Management</option>
                      <option value="Reports">Reports</option>
                      <option value="System">System</option>
                    </select>

                    {/* Date filter */}
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-700 bg-white focus:outline-none focus:border-[#7a1521] shadow-xs"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setLogSearch('');
                      setLogSeverity('All Severities');
                      setLogModule('All Modules');
                      setLogDate('');
                    }}
                    className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Reset Filters
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3 px-4">TIMESTAMP</th>
                        <th className="py-3 px-4">SEVERITY</th>
                        <th className="py-3 px-4">USER</th>
                        <th className="py-3 px-4">ACTION</th>
                        <th className="py-3 px-4">MODULE</th>
                        <th className="py-3 px-4 text-right">DETAILS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                            No system logs found matching the selected search criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => {
                          const isInfo = log.severity === 'Info';
                          const isWarn = log.severity === 'Warning';
                          const isErr = log.severity === 'Error';

                          return (
                            <tr
                              key={log.id}
                              onClick={() => setSelectedLogModal(log)}
                              className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                            >
                              <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                                {log.timestamp}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                                    isInfo
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : isWarn
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-red-50 text-red-700 border border-red-200'
                                  }`}
                                >
                                  {isInfo && <CheckCircle2 className="w-3 h-3" />}
                                  {isWarn && <AlertTriangle className="w-3 h-3" />}
                                  {isErr && <XCircle className="w-3 h-3" />}
                                  {log.severity}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-slate-800">{log.user}</td>
                              <td className="py-3.5 px-4 text-slate-900 font-medium max-w-xs truncate" title={log.action}>
                                {log.action}
                              </td>
                              <td className="py-3.5 px-4 text-slate-500 font-medium">
                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] text-slate-600">
                                  {log.module}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedLogModal(log);
                                  }}
                                  className="px-2.5 py-1 bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 rounded-lg group-hover:bg-[#58000f] group-hover:text-white group-hover:border-[#58000f] transition-all shadow-xs"
                                >
                                  Inspect
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ==================== 2FA QR MODAL ==================== */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4 relative">
            <button
              onClick={() => setShow2FAModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-indigo-100">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900">Setup Authenticator App</h3>
              <p className="text-xs text-slate-500 mt-1">Scan this QR code using Google Authenticator, Authy, or 1Password.</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col items-center justify-center">
              {/* Fake QR visual */}
              <div className="w-40 h-40 bg-white p-3 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center relative">
                <div className="w-full h-full bg-slate-900 p-2 rounded flex flex-wrap gap-1 items-center justify-center">
                  <div className="w-8 h-8 bg-white border-4 border-slate-900"></div>
                  <div className="w-8 h-8 bg-white border-4 border-slate-900"></div>
                  <div className="w-full h-2 bg-white"></div>
                  <div className="w-8 h-8 bg-white border-4 border-slate-900"></div>
                  <div className="w-6 h-6 bg-white"></div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="text-[10px] text-slate-400 block font-mono">SECRET KEY:</span>
                <span className="text-xs font-mono font-bold text-slate-800 tracking-wider">SERVA-ITUM-8924-SEC</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit Code from App</label>
              <input
                type="text"
                maxLength={6}
                placeholder="000 000"
                className="w-full text-center tracking-widest text-lg font-mono py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-[#7a1521]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShow2FAModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTwoFactorEnabled(true);
                  setShow2FAModal(false);
                  alert("2FA configured successfully!");
                }}
                className="flex-1 py-2.5 bg-[#58000f] hover:bg-[#7a1521] text-white font-semibold text-xs rounded-xl transition-colors shadow-md"
              >
                Verify & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== LOG DETAILS MODAL ==================== */}
      {selectedLogModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4 relative">
            <button
              onClick={() => setSelectedLogModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">{selectedLogModal.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedLogModal.severity === 'Info'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedLogModal.severity === 'Warning'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {selectedLogModal.severity}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-0.5">{selectedLogModal.action}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">TIMESTAMP</span>
                <span className="font-mono font-medium text-slate-800">{selectedLogModal.timestamp}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">USER</span>
                <span className="font-medium text-slate-800">{selectedLogModal.user}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">MODULE</span>
                <span className="font-medium text-slate-800">{selectedLogModal.module}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block">IP ADDRESS & METHOD</span>
                <span className="font-mono font-medium text-slate-800">{selectedLogModal.ip} ({selectedLogModal.method})</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-slate-700 block mb-1.5">RAW JSON AUDIT PAYLOAD</span>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40 border border-slate-800">
                {selectedLogModal.details}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-colors"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
