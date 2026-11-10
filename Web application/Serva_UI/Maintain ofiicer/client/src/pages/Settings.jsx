import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Bell,
  Shield,
  FileCode,
  Save,
  Camera,
  Upload,
  Trash2,
  Check,
  Key,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  Monitor,
  RefreshCw,
  Search,
  Download,
  Clock,
  Settings as SettingsIcon,
  BellRing,
  SlidersHorizontal,
  X
} from 'lucide-react';
import {
  fetchSettings,
  updateProfile,
  updateNotificationSettings,
  revokeSession,
  revokeOtherSessions,
  fetchLogs,
  clearLogs
} from '../api';

export default function SettingsPage({ 
  activeTab: propActiveTab = 'profile', 
  setActiveTab: propSetActiveTab,
  userProfile = {},
  onUpdateProfile
}) {
  const [internalTab, setInternalTab] = useState(propActiveTab || 'profile');

  useEffect(() => {
    if (propActiveTab) {
      setInternalTab(propActiveTab);
    }
  }, [propActiveTab]);

  const currentTab = (propActiveTab || internalTab || 'profile').toLowerCase();

  const isProfileTab = currentTab === 'profile' || currentTab === 'general' || currentTab.includes('profile');
  const isNotificationsTab = currentTab === 'notifications' || currentTab === 'notification' || currentTab.includes('notif');
  const isSecurityTab = currentTab === 'security' || currentTab.includes('sec');
  const isLogsTab = currentTab === 'logs' || currentTab.includes('log');

  const handleSelectTab = (tabId) => {
    setInternalTab(tabId);
    if (propSetActiveTab) propSetActiveTab(tabId);
  };
  const [settings, setSettings] = useState(null);

  // Profile state
  const [firstName, setFirstName] = useState(userProfile?.firstName || 'Anura');
  const [lastName, setLastName] = useState(userProfile?.lastName || 'Perera');
  const [email, setEmail] = useState(userProfile?.email || 'anura.perera@itum.mrt.ac.lk');
  const [phone, setPhone] = useState(userProfile?.phone || '+94 77 123 4567');
  const [department, setDepartment] = useState(userProfile?.department || 'ITUM Central');
  const [designation, setDesignation] = useState(userProfile?.designation || 'Maintenance Officer');
  const [avatar, setAvatar] = useState(userProfile?.avatar || '');

  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showSuccessToast = (message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000); // exactly 4 seconds
  };

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      if (userProfile.firstName !== undefined) setFirstName(userProfile.firstName);
      if (userProfile.lastName !== undefined) setLastName(userProfile.lastName);
      if (userProfile.email !== undefined) setEmail(userProfile.email);
      if (userProfile.phone !== undefined) setPhone(userProfile.phone);
      if (userProfile.department !== undefined) setDepartment(userProfile.department);
      if (userProfile.designation !== undefined) setDesignation(userProfile.designation);
      if (userProfile.avatar !== undefined) setAvatar(userProfile.avatar);
    }
  }, [userProfile]);

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataResult = event.target.result;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const maxSize = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round((height * maxSize) / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round((width * maxSize) / height);
              height = maxSize;
            }
          }

          canvas.width = width || 128;
          canvas.height = height || 128;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(dataUrl);
        } catch (canvasErr) {
          setAvatar(dataResult);
        }
      };
      img.onerror = () => {
        setAvatar(dataResult);
      };
      img.src = dataResult;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    setAvatar('');
    const input = document.getElementById('avatar-file-input');
    if (input) input.value = '';
  };

  // Notification state
  const [inAppNotif, setInAppNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [desktopPush, setDesktopPush] = useState(false);
  const [alertNewRequests, setAlertNewRequests] = useState(true);
  const [alertStatusUpdates, setAlertStatusUpdates] = useState(true);
  const [alertUrgent, setAlertUrgent] = useState(true);
  const [digestFreq, setDigestFreq] = useState('Real-time (No Digest)');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Security sessions state
  const [sessions, setSessions] = useState([]);

  // System Logs state
  const [logs, setLogs] = useState([]);
  const [logSearch, setLogSearch] = useState('');
  const [logSeverity, setLogSeverity] = useState('All Severities');
  const [logDate, setLogDate] = useState('');

  useEffect(() => {
    loadSettings();
    loadLogs();
  }, []);

  async function loadSettings() {
    const data = await fetchSettings();
    if (data) {
      setSettings(data);
      if (data.profile) {
        setFirstName(data.profile.firstName);
        setLastName(data.profile.lastName);
        setEmail(data.profile.email);
        setPhone(data.profile.phone);
        setDepartment(data.profile.department);
        setDesignation(data.profile.designation);
      }
      if (data.notifications) {
        setInAppNotif(data.notifications.inApp);
        setEmailNotif(data.notifications.email);
        setDesktopPush(data.notifications.desktopPush);
        setAlertNewRequests(data.notifications.newMaintenanceRequests);
        setAlertStatusUpdates(data.notifications.statusUpdates);
        setAlertUrgent(data.notifications.urgentAlerts);
        setDigestFreq(data.notifications.digestFrequency);
      }
      if (data.security?.activeSessions) {
        setSessions(data.security.activeSessions);
      }
    }
  }

  async function loadLogs() {
    const data = await fetchLogs({ search: logSearch, severity: logSeverity });
    if (data) setLogs(data);
  }

  const handleSaveProfile = async () => {
    const updated = { firstName, lastName, email, phone, department, designation, avatar };
    if (onUpdateProfile) {
      await onUpdateProfile(updated);
    } else {
      await updateProfile(updated);
    }
    showSuccessToast('Profile information saved successfully!');
  };

  const handleSaveNotifications = async () => {
    await updateNotificationSettings({
      inApp: inAppNotif,
      email: emailNotif,
      desktopPush,
      newMaintenanceRequests: alertNewRequests,
      statusUpdates: alertStatusUpdates,
      urgentAlerts: alertUrgent,
      digestFrequency: digestFreq
    });
    showSuccessToast('Notification settings saved successfully!');
  };

  const handleUpdatePassword = () => {
    showSuccessToast('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRevokeSession = async (id) => {
    const res = await revokeSession(id);
    if (res?.data) setSessions(res.data);
  };

  const handleRevokeAllOtherSessions = async () => {
    const res = await revokeOtherSessions();
    if (res?.data) setSessions(res.data);
    alert('Logged out of all other sessions.');
  };

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear system logs?')) {
      await clearLogs();
      setLogs([]);
    }
  };

  return (
    <div>
      {/* Top Green Notification Toast (Auto-dismisses in 4 seconds) */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          backgroundColor: '#059669',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 12px 30px -4px rgba(5, 150, 105, 0.45), 0 4px 12px rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          fontWeight: 600,
          animation: 'toastSlideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          maxWidth: '92vw'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Check size={15} color="#ffffff" strokeWidth={3} />
          </div>
          <span style={{ letterSpacing: '0.01em' }}>{toast}</span>
          <button
            onClick={() => setToast(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              opacity: 0.85,
              marginLeft: '8px',
              borderRadius: '4px'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header */}
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
            {isProfileTab ? 'System Settings' :
              isNotificationsTab ? 'Notification Settings' :
                isSecurityTab ? 'Security Settings' : 'System Logs'}
          </h1>
          <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
            {isProfileTab ? 'Configure and manage system preferences and configurations.' :
              isNotificationsTab ? 'Manage how and when you receive system alerts and updates.' :
                isSecurityTab ? 'Manage authentication protocols, password policies, and network access controls.' :
                  'Monitor system activities, errors, and administrative actions.'}
          </p>
        </div>

        {isLogsTab ? (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => alert('Exporting system logs CSV...')}
              style={{ gap: '6px' }}
            >
              <Download size={15} /> Export Logs
            </button>
            <button
              onClick={handleClearLogs}
              className="btn btn-primary"
              style={{ gap: '6px', backgroundColor: '#7a1521' }}
            >
              <Trash2 size={15} /> Clear Logs
            </button>
          </div>
        ) : (
          <button
            onClick={isNotificationsTab ? handleSaveNotifications : isSecurityTab ? handleUpdatePassword : handleSaveProfile}
            className="btn btn-primary"
            style={{ padding: '9px 20px', gap: '8px' }}
          >
            <Save size={16} /> Save All Changes
          </button>
        )}
      </div>

      {/* Main 2-Column Settings Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Submenu Navigation Card */}
        <div className="card" style={{ padding: '12px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', padding: '10px 12px 6px' }}>
            Settings Menu
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { id: 'profile', label: 'General Settings', sub: 'System basic information', icon: SettingsIcon, active: isProfileTab },
              { id: 'notifications', label: 'Notification Settings', sub: 'System notifications', icon: Bell, active: isNotificationsTab },
              { id: 'security', label: 'Security Settings', sub: 'Password & security policies', icon: Shield, active: isSecurityTab },
              { id: 'logs', label: 'System Logs', sub: 'View and manage logs', icon: FileCode, active: isLogsTab }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.active;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    backgroundColor: isActive ? '#fff0ef' : 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      color: isActive ? '#7a1521' : '#64748b',
                      marginTop: '2px',
                      flexShrink: 0
                    }}
                  />
                  <div>
                    <div style={{
                      fontSize: '13.5px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#7a1521' : '#1e293b'
                    }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      {item.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* TAB 1: Profile Settings (Image 18.png) */}
          {isProfileTab && (
            <>
              {/* Profile Management Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#ffe4e6', color: '#be123c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>Profile Management</h2>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        Update your personal details, profile picture, and institutional assignment.
                      </div>
                    </div>
                  </div>

                  <button onClick={handleSaveProfile} className="btn btn-primary btn-sm" style={{ gap: '6px' }}>
                    <Check size={14} /> Save Profile
                  </button>
                </div>

                {/* Profile Photo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '16px 0 24px',
                  borderBottom: '1px solid var(--color-border)'
                }}>
                  <input
                    type="file"
                    id="avatar-file-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleAvatarFileChange}
                  />

                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#7a1521',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 700,
                      overflow: 'hidden'
                    }}>
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt="Profile Avatar" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      ) : (
                        (firstName ? firstName.charAt(0) : 'A').toUpperCase()
                      )}
                    </div>
                    <label 
                      htmlFor="avatar-file-input"
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#475569',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                      }}
                      title="Upload new avatar"
                    >
                      <Camera size={13} />
                    </label>
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Profile Photo</div>
                    <div style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 10px' }}>
                      Allowed formats: JPG, PNG, WEBP. Maximum file size: 5MB.
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <label
                        htmlFor="avatar-file-input"
                        className="btn btn-secondary btn-sm"
                        style={{ gap: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', margin: 0 }}
                      >
                        <Upload size={13} /> Change Avatar
                      </label>
                      {avatar && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12.5px', cursor: 'pointer' }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fields Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '18px 24px',
                  marginTop: '20px'
                }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Contact Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Assigned Division / Department</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                      />
                      <span style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        Verified
                      </span>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Official Designation</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        className="form-input"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                      />
                      <span style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: '#ffe4e6',
                        color: '#be123c',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        Staff Role
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </>
          )}

          {/* TAB 2: Notification Settings (Image 14.png) */}
          {isNotificationsTab && (
            <>
              {/* Notification Channels Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fdf2f2', color: '#7a1521', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BellRing size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Notification Channels</h2>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>Choose where you want to receive notifications.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>In-App Notifications</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Show notifications in the system header</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={inAppNotif} onChange={(e) => setInAppNotif(e.target.checked)} />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Email Notifications</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Send alerts to your registered email address</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Desktop Push Notifications</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Receive browser push notifications</div>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={desktopPush} onChange={(e) => setDesktopPush(e.target.checked)} />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Alert Preferences Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fdf2f2', color: '#7a1521', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Alert Preferences</h2>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>Select the events you want to be notified about.</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={alertNewRequests}
                      onChange={(e) => setAlertNewRequests(e.target.checked)}
                      style={{ marginTop: '3px', width: '17px', height: '17px', accentColor: '#7a1521', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>New Maintenance Requests</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Notify when a new request is submitted in your department.</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={alertStatusUpdates}
                      onChange={(e) => setAlertStatusUpdates(e.target.checked)}
                      style={{ marginTop: '3px', width: '17px', height: '17px', accentColor: '#7a1521', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Status Updates</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Notify when a job status changes (e.g., In Progress to Completed).</div>
                    </div>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={alertUrgent}
                      onChange={(e) => setAlertUrgent(e.target.checked)}
                      style={{ marginTop: '3px', width: '17px', height: '17px', accentColor: '#7a1521', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Urgent Alerts</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Immediate notification for critical system failures or high-priority jobs.</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Digest Settings Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#fdf2f2', color: '#7a1521', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Digest Settings</h2>
                    <div style={{ fontSize: '12.5px', color: '#64748b' }}>Configure summary reports for non-urgent notifications.</div>
                  </div>
                </div>

                <div className="form-group" style={{ maxWidth: '440px', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px', display: 'block' }}>Digest Frequency</label>
                  <select
                    className="form-select"
                    style={{ height: '40px', fontSize: '13.5px', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                    value={digestFreq}
                    onChange={(e) => setDigestFreq(e.target.value)}
                  >
                    <option value="Real-time (No Digest)">Real-time (No Digest)</option>
                    <option value="Daily Summary">Daily Summary (8:00 AM)</option>
                    <option value="Weekly Summary">Weekly Summary (Every Monday)</option>
                  </select>
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '6px' }}>
                  Daily summaries are sent at 8:00 AM every morning.
                </div>
              </div>
            </>
          )}

          {/* TAB 3: Security Settings */}
          {isSecurityTab && (
            <>
              {/* Change Password Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Key size={18} style={{ color: '#64748b' }} />
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>Change Password</h2>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Ensure your account is protected with a strong, distinct passphrase.</div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div className="form-group" style={{ margin: 0, position: 'relative' }}>
                    <label className="form-label">Current Password</label>
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      style={{ position: 'absolute', right: '10px', top: '32px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div className="form-group" style={{ margin: 0, position: 'relative' }}>
                    <label className="form-label">New Password</label>
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      style={{ position: 'absolute', right: '10px', top: '32px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  <div className="form-group" style={{ margin: 0, position: 'relative' }}>
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      style={{ position: 'absolute', right: '10px', top: '32px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={handleUpdatePassword} className="btn btn-primary" style={{ gap: '6px' }}>
                    <RefreshCw size={14} /> Update Password
                  </button>
                </div>
              </div>

              {/* Active Sessions & Login Activity Card */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Laptop size={18} style={{ color: '#64748b' }} />
                    <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>Active Sessions & Login Activity</h2>
                  </div>
                  <button
                    onClick={handleRevokeAllOtherSessions}
                    style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Log out all other sessions
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      style={{
                        padding: '14px 18px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {sess.device.includes('iPhone') ? (
                          <Smartphone size={22} style={{ color: '#64748b' }} />
                        ) : sess.device.includes('MacBook') ? (
                          <Laptop size={22} style={{ color: '#be123c' }} />
                        ) : (
                          <Monitor size={22} style={{ color: '#64748b' }} />
                        )}

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                              {sess.device} • {sess.browser}
                            </span>
                            {sess.isCurrent && (
                              <span className="badge badge-completed" style={{ fontSize: '10.5px', padding: '1px 6px' }}>
                                Active Now
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                            {sess.location} • {sess.isCurrent ? `IP: ${sess.ip}` : sess.lastActive}
                          </div>
                        </div>
                      </div>

                      {sess.isCurrent ? (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Current Device</span>
                      ) : (
                        <button
                          onClick={() => handleRevokeSession(sess.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 4: System Logs (Image 17.png) */}
          {isLogsTab && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Filter Toolbar */}
              <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search logs by user, action or module..."
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>

                <div style={{ minWidth: '140px' }}>
                  <select
                    className="form-select"
                    style={{ height: '38px', fontSize: '13px' }}
                    value={logSeverity}
                    onChange={(e) => setLogSeverity(e.target.value)}
                  >
                    <option value="All Severities">All Severities</option>
                    <option value="Info">Info</option>
                    <option value="Warning">Warning</option>
                    <option value="Error">Error</option>
                  </select>
                </div>

                <div style={{ minWidth: '140px' }}>
                  <input
                    type="date"
                    className="form-input"
                    style={{ height: '38px', fontSize: '13px' }}
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                  />
                </div>

                <button
                  onClick={() => { setLogSearch(''); setLogSeverity('All Severities'); setLogDate(''); }}
                  className="btn btn-secondary"
                  style={{ height: '38px', fontSize: '13px' }}
                >
                  Reset Filters
                </button>
              </div>

              {/* Logs Table */}
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>TIMESTAMP</th>
                      <th>SEVERITY</th>
                      <th>USER</th>
                      <th>ACTION</th>
                      <th>MODULE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '12.5px', color: '#64748b' }}>{log.timestamp}</td>
                        <td>
                          <span className={`badge ${log.severity === 'Error' ? 'badge-critical' :
                              log.severity === 'Warning' ? 'badge-pending' : 'badge-completed'
                            }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{log.user}</td>
                        <td style={{ color: '#1e293b' }}>{log.action}</td>
                        <td>
                          <span className="badge-tag">{log.module}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Logs Pagination Footer */}
              <div style={{
                padding: '14px 20px',
                borderTop: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#64748b'
              }}>
                <span>Showing 1 to 4 of 1,240 entries</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn btn-secondary btn-sm">Previous</button>
                  <button className="btn btn-secondary btn-sm">Next</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer copyright matching screenshot */}
      <div style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '48px', paddingBottom: '24px' }}>
        © 2026 Institute of Technology, University of Moratuwa. All rights reserved.
      </div>
    </div>
  );
}
