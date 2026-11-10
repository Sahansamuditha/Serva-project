import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Bell,
  Shield,
  ScrollText,
  Upload,
  Check,
  CheckCircle2,
  AlertCircle,
  Camera,
  Building2,
  Briefcase,
  Save,
  Loader2,
  Lock,
  Key,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  Globe,
  Search,
  Info,
  X
} from 'lucide-react';
import { getAuthUser, setAuthSession } from '../utils/auth';

export default function UnifiedSettings({ initialTab = 'profile' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [authUser, setAuthUser] = useState(() => getAuthUser());
  const [toastMessage, setToastMessage] = useState(null);
  const [toastType, setToastType] = useState('success');
  const fileInputRef = useRef(null);

  // Sync prop changes
  useEffect(() => {
    if (initialTab) {
      const normalized = initialTab.toLowerCase();
      if (normalized.includes('notif')) setActiveTab('notifications');
      else if (normalized.includes('sec')) setActiveTab('security');
      else if (normalized.includes('log')) setActiveTab('logs');
      else setActiveTab('profile');
    }
  }, [initialTab]);

  const showToast = (msg, type = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Profile State
  const [profile, setProfile] = useState(() => {
    const current = getAuthUser();
    return {
      id: current?.id,
      role: current?.role,
      firstName: current?.firstName || '',
      lastName: current?.lastName || '',
      email: current?.email || '',
      phone: current?.phone || '',
      division: current?.department || current?.division || 'ITUM Central',
      designation: current?.designation || (
        current?.role === 'admin' ? 'System Administrator' :
          current?.role === 'director' ? 'Director ITUM' :
            current?.role === 'maintenance_officer' ? 'Maintenance Officer' : 'Requester'
      ),
      avatar: current?.avatar || current?.avatarUrl || null
    };
  });
  const [avatarPreview, setAvatarPreview] = useState(() => {
    const current = getAuthUser();
    return current?.avatar || current?.avatarUrl || null;
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // 2. Notifications State
  const [notifSettings, setNotifSettings] = useState({
    email_alerts: true,
    sms_alerts: false,
    push_notifications: true,
    weekly_digest: true
  });
  const [isSavingNotifs, setIsSavingNotifs] = useState(false);

  // 3. Security State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  function getClientDeviceInfo() {
    if (typeof window === 'undefined' || !navigator?.userAgent) return 'Chrome on Windows 11';
    const ua = navigator.userAgent;
    let browser = 'Chrome';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Chrome')) browser = 'Chrome';

    let os = 'Windows 11';
    if (ua.includes('iPhone')) os = 'iPhone';
    else if (ua.includes('iPad')) os = 'iPad';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('Mac OS X')) os = 'macOS';
    else if (ua.includes('Windows')) os = 'Windows 11';
    else if (ua.includes('Linux')) os = 'Linux';

    return `${browser} on ${os}`;
  }

  const [sessions, setSessions] = useState([
    {
      id: 'current-session',
      device: getClientDeviceInfo(),
      location: 'Moratuwa, Sri Lanka',
      ip_address: '192.168.1.10',
      is_current: true,
      last_active: 'Just now'
    }
  ]);

  // 4. Logs State
  const [logs, setLogs] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Fetch initial data from API for this specific user
  useEffect(() => {
    async function loadData() {
      const current = getAuthUser();
      if (!current) return;
      setAuthUser(current);

      const token = localStorage.getItem('serva_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const roleToId = { admin: 1, director: 2, maintenance_officer: 3, requester: 4 };
      const resolvedId = current.id || (current.role ? roleToId[current.role] : null);

      // Profile for this specific user
      try {
        const queryParams = new URLSearchParams();
        if (resolvedId) queryParams.append('id', resolvedId);
        if (current.email) queryParams.append('email', current.email);
        if (current.role) queryParams.append('role', current.role);

        const res = await fetch(`/api/settings/profile?${queryParams.toString()}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const p = data.profile || data.user || data.data;
          if (p) {
            setProfile({
              id: p.id || current.id,
              role: p.role || current.role,
              firstName: p.firstName || current.firstName,
              lastName: p.lastName || current.lastName,
              email: p.email || current.email,
              phone: p.phone || current.phone || '+94 77 123 4567',
              division: p.department || p.division || current.department || 'ITUM Central',
              designation: p.designation || current.designation || 'Staff Member',
              avatar: p.avatarUrl || p.avatar || current.avatar || null
            });
            if (p.avatarUrl || p.avatar) {
              setAvatarPreview(p.avatarUrl || p.avatar);
            } else {
              setAvatarPreview(null);
            }
          }
        }
      } catch (e) { }

      // Notifications
      try {
        const res = await fetch('/api/settings/notifications', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setNotifSettings(data.data);
          }
        }
      } catch (e) { }

      // Sessions - fetch real sessions for this specific user
      try {
        const queryParams = new URLSearchParams();
        if (resolvedId) queryParams.append('id', resolvedId);
        if (current.email) queryParams.append('email', current.email);
        if (current.role) queryParams.append('role', current.role);
        const res = await fetch(`/api/settings/sessions?${queryParams.toString()}`, { headers });
        if (res.ok) {
          const data = await res.json();
          const sessionList = data.data || data.sessions;
          if (Array.isArray(sessionList) && sessionList.length > 0) {
            setSessions(sessionList.map(s => ({
              ...s,
              is_current: Boolean(s.is_current),
              last_active: s.is_current ? 'Just now' : (s.last_active ? new Date(s.last_active).toLocaleString() : 'Active')
            })));
          }
        }
      } catch (e) { }

      // Logs
      loadLogs();
    }
    loadData();
  }, []);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const current = getAuthUser();
      const token = localStorage.getItem('serva_token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const roleToId = { admin: 1, director: 2, maintenance_officer: 3, requester: 4 };
      const resolvedId = current?.id || (current?.role ? roleToId[current.role] : null);

      const queryParams = new URLSearchParams();
      if (logSearch) queryParams.append('search', logSearch);
      if (resolvedId) queryParams.append('id', resolvedId);
      if (current?.email) queryParams.append('email', current.email);
      if (current?.role) queryParams.append('role', current.role);

      const res = await fetch(`/api/logs?${queryParams.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || data.logs || []);
      }
    } catch (e) {
      console.warn('Logs load fallback', e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab, logSearch]);

  // Avatar Handlers
  const handleAvatarFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('File size exceeds maximum 2MB limit.', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setProfile(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setProfile(prev => ({ ...prev, avatar: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    const current = getAuthUser();
    const roleToId = { admin: 1, director: 2, maintenance_officer: 3, requester: 4 };
    const targetRole = profile.role || current?.role || 'requester';
    const targetId = profile.id || current?.id || roleToId[targetRole];
    const targetEmail = profile.email || current?.email;

    setIsSavingProfile(true);
    try {
      const token = localStorage.getItem('serva_token');
      const res = await fetch('/api/settings/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          id: targetId,
          email: targetEmail,
          role: targetRole,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          department: profile.division,
          division: profile.division,
          designation: profile.designation,
          avatarUrl: avatarPreview || '',
          avatar: avatarPreview || ''
        })
      });

      if (res.ok) {
        const data = await res.json();
        const serverUser = data.user || data.profile || {};
        const updated = {
          ...current,
          ...serverUser,
          id: targetId,
          role: targetRole,
          firstName: profile.firstName,
          lastName: profile.lastName,
          name: `${profile.firstName} ${profile.lastName}`.trim(),
          fullName: `${profile.firstName} ${profile.lastName}`.trim(),
          email: targetEmail,
          phone: profile.phone,
          department: profile.division,
          division: profile.division,
          designation: profile.designation,
          avatar: avatarPreview || '',
          avatarUrl: avatarPreview || ''
        };

        // 1. Save strictly to THIS ROLE's dedicated storage
        if (targetRole) {
          localStorage.setItem(`serva_user_${targetRole}`, JSON.stringify(updated));
        }

        // 2. ONLY update the currently active session if it matches this role
        if (current?.role === targetRole || current?.id === targetId) {
          setAuthSession(updated, token);
          setAuthUser(updated);
        }

        // 3. Update ONLY this role's specific cache key, never touch others!
        try {
          if (targetRole === 'admin') {
            localStorage.setItem('admin_profile', JSON.stringify({
              firstName: profile.firstName,
              lastName: profile.lastName,
              email: targetEmail,
              phone: profile.phone,
              division: profile.division,
              designation: profile.designation
            }));
            if (avatarPreview) localStorage.setItem('admin_avatar', avatarPreview);
            else localStorage.removeItem('admin_avatar');
          } else if (targetRole === 'maintenance_officer' || targetRole === 'Maintenance Officer' || (targetRole && targetRole.toLowerCase().includes('maintenance'))) {
            const officerProfileData = {
              firstName: profile.firstName,
              lastName: profile.lastName,
              name: `${profile.firstName} ${profile.lastName}`.trim(),
              email: targetEmail,
              phone: profile.phone,
              department: profile.division,
              designation: profile.designation,
              avatar: avatarPreview || ''
            };
            localStorage.setItem('serva_user_profile', JSON.stringify(officerProfileData));
            localStorage.setItem('serva_user_maintenance_officer', JSON.stringify(officerProfileData));
          } else if (targetRole === 'director') {
            localStorage.setItem('serva_director_firstname', profile.firstName);
            localStorage.setItem('serva_director_lastname', profile.lastName);
            if (avatarPreview) localStorage.setItem('serva_director_avatar', avatarPreview);
            else localStorage.removeItem('serva_director_avatar');
          }
        } catch (storageErr) {
          console.warn('Error updating role-specific local storage cache:', storageErr);
        }

        // 4. Dispatch global events with targetRole and targetId attached so other roles ignore it
        window.dispatchEvent(new CustomEvent('serva:profile-updated', {
          detail: { ...updated, targetRole, targetId }
        }));
        window.dispatchEvent(new Event('serva:auth-change'));

        showToast('Profile details successfully saved!');
      } else {
        showToast('Failed to save profile changes.', 'error');
      }
    } catch (err) {
      showToast('Network error saving profile: ' + err.message, 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save Notifications
  const handleSaveNotifications = async () => {
    setIsSavingNotifs(true);
    try {
      const token = localStorage.getItem('serva_token');
      const res = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(notifSettings)
      });
      if (res.ok) {
        showToast('Notification preferences updated!');
      } else {
        showToast('Failed to update notifications.', 'error');
      }
    } catch (err) {
      showToast('Error saving preferences', 'error');
    } finally {
      setIsSavingNotifs(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.newPassword) {
      showToast('Please enter a new password.', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const token = localStorage.getItem('serva_token');
      const res = await fetch('/api/settings/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Password changed successfully!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.message || 'Incorrect current password.', 'error');
      }
    } catch (err) {
      showToast('Failed to change password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Revoke other sessions
  const handleRevokeOtherSessions = async () => {
    if (confirm('Are you sure you want to terminate all other active login sessions?')) {
      try {
        const token = localStorage.getItem('serva_token');
        const current = getAuthUser();
        const res = await fetch('/api/settings/sessions/revoke-others', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ id: current?.id, email: current?.email })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.sessions && data.sessions.length > 0) {
            setSessions(data.sessions.map(s => ({
              ...s,
              is_current: Boolean(s.is_current),
              last_active: s.is_current ? 'Just now' : (s.last_active ? new Date(s.last_active).toLocaleString() : 'Active')
            })));
          } else {
            setSessions(prev => prev.filter(s => s.is_current));
          }
        } else {
          setSessions(prev => prev.filter(s => s.is_current));
        }
        showToast('All other sessions terminated.');
      } catch (err) {
        setSessions(prev => prev.filter(s => s.is_current));
        showToast('All other sessions terminated.');
      }
    }
  };

  // Password strength meter
  const getStrength = (pass) => {
    if (!pass) return { score: 0, text: 'None', color: 'bg-slate-200' };
    if (pass.length < 6) return { score: 30, text: 'Weak', color: 'bg-rose-500' };
    if (pass.length < 10) return { score: 65, text: 'Medium', color: 'bg-amber-500' };
    return { score: 100, text: 'Strong', color: 'bg-emerald-500' };
  };
  const strength = getStrength(passwordForm.newPassword);

  const initialLetter = (profile.firstName?.[0] || 'A').toUpperCase();

  // Navigation Items for Left Menu
  const isElevatedRole = authUser?.role?.toLowerCase().includes('admin') || authUser?.role?.toLowerCase().includes('director');

  const menuItems = [
    {
      id: 'profile',
      title: 'Profile Settings',
      subtitle: 'Manage personal details & role',
      icon: User
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      subtitle: 'System notifications',
      icon: Bell
    },
    {
      id: 'security',
      title: 'Security Settings',
      subtitle: 'Password & security policies',
      icon: Shield
    },
    {
      id: 'logs',
      title: isElevatedRole ? 'System Logs' : 'Activity Logs',
      subtitle: isElevatedRole ? 'View and manage logs' : 'Account activity history',
      icon: ScrollText
    }
  ];

  return (
    <div className="w-full px-4 sm:px-8 py-6 space-y-6 font-sans antialiased text-[#241919] pb-16 bg-[#fafafa]/50 min-h-screen">

      {/* Toast Alert */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold text-white transition-all ${toastType === 'success' ? 'bg-[#7a1521]' : 'bg-red-600'
          }`}>
          {toastType === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 opacity-80 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header - System Settings */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#241919]">System Settings</h1>
          <p className="text-sm text-[#574141] mt-0.5">
            Configure and manage system preferences and configurations.
          </p>
        </div>

        {/* Top Right Header Action Button */}
        <div>
          {activeTab === 'profile' && (
            <button
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          )}

          {activeTab === 'notifications' && (
            <button
              onClick={handleSaveNotifications}
              disabled={isSavingNotifs}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSavingNotifs ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          )}

          {activeTab === 'security' && (
            <button
              onClick={handleChangePassword}
              disabled={isUpdatingPassword}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </>
              )}
            </button>
          )}

        </div>
      </div>

      {/* Main Layout Grid: Left Settings Menu + Right Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* =======================================================
            LEFT COLUMN: SETTINGS MENU
        ======================================================= */}
        <div className="w-full lg:w-72 bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm shrink-0 h-fit">
          <h3 className="text-sm font-bold text-[#241919] mb-4">Settings Menu</h3>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-start gap-3.5 p-3 rounded-xl transition-all duration-150 text-left cursor-pointer ${isActive
                      ? 'bg-[#ffe9e8] text-[#7a1521] border border-[#ffb3b2]/60 font-semibold shadow-xs'
                      : 'text-[#574141] hover:bg-[#fff0ef] hover:text-[#7a1521] border border-transparent'
                    }`}
                >
                  <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-[#7a1521]' : 'text-[#8a7170]'}`} />
                  <div>
                    <p className={`text-sm leading-tight ${isActive ? 'font-bold text-[#7a1521]' : 'font-medium text-[#241919]'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs opacity-75 mt-0.5 text-[#574141]">
                      {item.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* =======================================================
            RIGHT COLUMN: MAIN CONTENT AREA
        ======================================================= */}
        <div className="flex-1 space-y-6 w-full">

          {/* ----------------------------------------------------
              TAB 1: PROFILE SETTINGS
          ---------------------------------------------------- */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Management Card */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-6">

                {/* Card Header with Save Profile button */}
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-[#241919]">Profile Management</h2>
                      <p className="text-xs text-[#574141]">
                        Update your personal details, profile picture, and institutional assignment.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveProfile}
                    disabled={isSavingProfile}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Profile</span>
                  </button>
                </div>

                {/* Profile Photo Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden shrink-0">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initialLetter
                      )}
                    </div>
                    <label
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-[#e2e8f0] text-[#7a1521] flex items-center justify-center shadow-sm cursor-pointer hover:bg-[#ffe9e8] transition-colors"
                      title="Upload Photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </label>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#241919]">Profile Photo</h4>
                    <p className="text-xs text-[#574141] mt-0.5">
                      Allowed formats: JPG, PNG, WEBP. Maximum file size: 2MB.
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleAvatarFile}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] bg-white hover:bg-slate-50 text-xs font-semibold text-[#241919] rounded-lg shadow-sm cursor-pointer transition-all"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#7a1521]" />
                        <span>Change Avatar</span>
                      </button>

                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Fields: 2 Columns */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">First Name</label>
                      <input
                        type="text"
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium outline-none focus:border-[#7a1521] focus:ring-1 focus:ring-[#7a1521]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">Last Name</label>
                      <input
                        type="text"
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium outline-none focus:border-[#7a1521] focus:ring-1 focus:ring-[#7a1521]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium outline-none focus:border-[#7a1521] focus:ring-1 focus:ring-[#7a1521]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">Contact Number</label>
                      <input
                        type="text"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-sm text-[#241919] font-medium outline-none focus:border-[#7a1521] focus:ring-1 focus:ring-[#7a1521]"
                      />
                    </div>

                    {/* Assigned Division / Department (Locked) */}
                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">
                        Assigned Division / Department
                      </label>
                      <div className="relative flex items-center">
                        <Building2 className="w-4 h-4 text-[#8a7170] absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={profile.division}
                          title="Department / Division is institutional and locked"
                          className="w-full pl-10 pr-20 py-2.5 bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg text-sm text-[#64748b] font-medium cursor-not-allowed select-none"
                        />
                        <span className="absolute right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 pointer-events-none">
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Official Designation (Locked) */}
                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">
                        Official Designation
                      </label>
                      <div className="relative flex items-center">
                        <Briefcase className="w-4 h-4 text-[#8a7170] absolute left-3.5 pointer-events-none" />
                        <input
                          type="text"
                          readOnly
                          disabled
                          value={profile.designation}
                          title="Official Designation is institutional and locked"
                          className="w-full pl-10 pr-24 py-2.5 bg-[#f1f5f9] border border-[#e2e8f0] rounded-lg text-sm text-[#64748b] font-medium cursor-not-allowed select-none"
                        />
                        <span className="absolute right-3 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#ffe9e8] text-[#7a1521] border border-[#ffb3b2]/60 pointer-events-none whitespace-nowrap">
                          Staff Role
                        </span>
                      </div>
                    </div>

                    {/* Bottom Save Button */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isSavingProfile ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 2: NOTIFICATION SETTINGS
          ---------------------------------------------------- */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-6">
                {/* Header with Save button */}
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-[#241919]">Notification Preferences</h2>
                      <p className="text-xs text-[#574141]">
                        Manage how and when you receive system alerts and updates.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSavingNotifs}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isSavingNotifs ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Preferences</span>
                  </button>
                </div>

                {/* Toggles */}
                <div className="divide-y divide-slate-100">
                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Email Notifications</h4>
                      <p className="text-xs text-slate-500">Receive immediate dispatch notifications and request updates via email.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!notifSettings.email_alerts}
                        onChange={e => setNotifSettings({ ...notifSettings, email_alerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1521]"></div>
                    </label>
                  </div>

                  <div className="py-3.5 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">SMS Alerts</h4>
                      <p className="text-xs text-slate-500">Send urgent crisis alerts and critical work order dispatches to your phone.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!notifSettings.sms_alerts}
                        onChange={e => setNotifSettings({ ...notifSettings, sms_alerts: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7a1521]"></div>
                    </label>
                  </div>


                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 3: SECURITY SETTINGS
          ---------------------------------------------------- */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Password Management */}
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center shrink-0">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-[#241919]">Security & Credentials</h2>
                      <p className="text-xs text-[#574141]">
                        Update your password, authentication, and view active sessions.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleChangePassword}
                    disabled={isUpdatingPassword}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {isUpdatingPassword ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Update Password</span>
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? 'text' : 'password'}
                          value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          className="w-full pl-3.5 pr-10 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs placeholder:text-xs text-[#241919] font-medium outline-none focus:border-[#7a1521]"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                          className="w-full pl-3.5 pr-10 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs placeholder:text-xs text-[#241919] font-medium outline-none focus:border-[#7a1521]"
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#574141] mb-1.5">Re-new Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPass ? 'text' : 'password'}
                          value={passwordForm.confirmPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                          className="w-full pl-3.5 pr-10 py-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs placeholder:text-xs text-[#241919] font-medium outline-none focus:border-[#7a1521]"
                          placeholder="Enter re-new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPass(!showConfirmPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {passwordForm.newPassword && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span>Password Strength: <strong className="text-slate-800">{strength.text}</strong></span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }}></div>
                      </div>
                    </div>
                  )}
                </form>

                {/* Active Sessions */}
                <div className="pt-4 border-t border-[#f1f5f9] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Device Sessions</h3>
                    <button
                      onClick={handleRevokeOtherSessions}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Terminate Other Sessions
                    </button>
                  </div>

                  <div className="space-y-2">
                    {sessions.map(s => (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          {s.device?.toLowerCase().includes('phone') || s.device?.toLowerCase().includes('android') || s.device?.toLowerCase().includes('ios') ? (
                            <Smartphone className="w-4 h-4 text-[#7a1521]" />
                          ) : (
                            <Laptop className="w-4 h-4 text-[#7a1521]" />
                          )}
                          <div>
                            <p className="font-semibold text-slate-800">{s.device || 'Web Session'}</p>
                            <p className="text-[10px] text-slate-400">{s.location || 'Moratuwa, Sri Lanka'} • {s.ip_address || '192.168.1.10'}</p>
                          </div>
                        </div>
                        {s.is_current ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Current Device
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">{s.last_active || 'Active'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ----------------------------------------------------
              TAB 4: SYSTEM LOGS
          ---------------------------------------------------- */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#f1f5f9] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ffe9e8] text-[#7a1521] flex items-center justify-center shrink-0">
                      <ScrollText className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-[#241919]">
                        {isElevatedRole ? 'System Audit Logs' : 'My Activity Logs'}
                      </h2>
                      <p className="text-xs text-[#574141]">
                        {isElevatedRole
                          ? 'Monitor system activities, errors, and administrative actions.'
                          : 'Review your personal account activity and login history.'}
                      </p>
                    </div>
                  </div>

                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={e => setLogSearch(e.target.value)}
                    placeholder="Search logs by action, username, or keyword..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#7a1521]"
                  />
                </div>

                {/* Logs Table */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100/75 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="px-3.5 py-2.5">Time</th>
                        <th className="px-3.5 py-2.5">User</th>
                        <th className="px-3.5 py-2.5">Action</th>
                        <th className="px-3.5 py-2.5">Details</th>
                        <th className="px-3.5 py-2.5">IP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {logs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                            No logs found matching your criteria.
                          </td>
                        </tr>
                      ) : (
                        logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition">
                            <td className="px-3.5 py-2.5 text-slate-500 whitespace-nowrap text-[11px]">
                              {new Date(log.created_at).toLocaleString()}
                            </td>
                            <td className="px-3.5 py-2.5 font-semibold text-slate-800">
                              {log.user_name || 'System'}
                            </td>
                            <td className="px-3.5 py-2.5 whitespace-nowrap">
                              <span className="inline-block whitespace-nowrap px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#ffe9e8] text-[#7a1521] border border-[#ffb3b2]/60">
                                {log.action}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-slate-600">{log.details || '-'}</td>
                            <td className="px-3.5 py-2.5 text-slate-400 font-mono text-[10px]">{log.ip_address || '127.0.0.1'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
