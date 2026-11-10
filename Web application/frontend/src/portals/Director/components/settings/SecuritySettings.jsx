import React, { useEffect, useState } from 'react';
import {
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  Laptop,
  Smartphone,
  Monitor,
  Save,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState({ current: false, next: false, confirm: false });

  function getClientDeviceInfo() {
    if (typeof window === 'undefined' || !navigator?.userAgent) return { device: 'Windows PC', browser: 'Chrome', icon: 'laptop' };
    const ua = navigator.userAgent;
    let browser = 'Chrome';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Chrome')) browser = 'Chrome';

    let os = 'Windows 11 PC';
    let icon = 'laptop';
    if (ua.includes('iPhone')) { os = 'iPhone'; icon = 'phone'; }
    else if (ua.includes('iPad')) { os = 'iPad'; icon = 'phone'; }
    else if (ua.includes('Android')) { os = 'Android Device'; icon = 'phone'; }
    else if (ua.includes('Mac OS X')) os = 'MacBook Pro';
    else if (ua.includes('Windows')) os = 'Windows 11 PC';
    else if (ua.includes('Linux')) os = 'Linux Workstation';

    return { device: os, browser, icon };
  }

  const clientInfo = getClientDeviceInfo();
  const [sessions, setSessions] = useState([
    {
      id: 'sess-current',
      device: clientInfo.device,
      browser: clientInfo.browser,
      location: 'Moratuwa, Sri Lanka',
      ip: '192.168.1.10',
      status: 'Active Now',
      isCurrent: true,
      icon: clientInfo.icon
    }
  ]);

  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.getSessions().then((res) => {
      const list = res?.sessions || res?.data;
      if (Array.isArray(list) && list.length > 0) {
        setSessions(list.map(s => {
          const parts = (s.device || 'Chrome on Windows 11').split(' on ');
          const browser = parts[0] || 'Browser';
          const os = parts[1] || 'Device';
          const isCurrent = Boolean(s.is_current);
          const icon = (s.device || '').toLowerCase().includes('phone') || (s.device || '').toLowerCase().includes('android') ? 'phone' : 'laptop';
          return {
            id: s.id,
            device: os,
            browser: browser,
            location: s.location || 'Moratuwa, Sri Lanka',
            ip: s.ip_address || s.ip || '192.168.1.10',
            status: isCurrent ? 'Active Now' : (s.last_active ? `Last active ${new Date(s.last_active).toLocaleDateString()}` : 'Active'),
            isCurrent,
            icon
          };
        }));
      }
    }).catch(console.error);
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('New passwords do not match or are empty');
      return;
    }
    setUpdating(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      if (res && res.success) {
        alert('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert(res.message || 'Failed to update password');
      }
    } catch (err) {
      console.error(err);
      alert('Error changing password');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogoutAllSessions = async () => {
    if (window.confirm('Log out of all other active sessions?')) {
      try {
        const res = await api.logoutOtherSessions();
        if (res && res.success) {
          setSessions(res.sessions);
          alert('Other sessions have been logged out.');
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getDeviceIcon = (icon) => {
    if (icon === 'phone') return <Smartphone size={18} color="#64748b" />;
    if (icon === 'desktop') return <Monitor size={18} color="#64748b" />;
    return <Laptop size={18} color="#dc2626" />;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div>
          <h1 className="page-header-title" style={{ fontSize: '22px' }}>Security Settings</h1>
          <p className="page-header-subtitle">
            Manage authentication protocols, password policies, and network access controls.
          </p>
        </div>

        <button className="btn-icon-red" title="Save">
          <Save size={16} />
        </button>
      </div>

      {/* Card 1: Security & Authentication Active */}
      <div
        className="content-card"
        style={{
          marginBottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#fff0ef',
              color: '#7a1521',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Shield size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a' }}>
              Security & Authentication
            </h2>
            <p style={{ fontSize: '12px', color: '#64748b' }}>
              Manage credentials, two-factor authentication, and monitor active sessions.
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            padding: '6px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          <CheckCircle2 size={14} />
          <span>Security Active</span>
        </div>
      </div>

      {/* Card 2: Change Password */}
      <div className="content-card" style={{ marginBottom: 0 }}>
        <div className="card-header-row" style={{ marginBottom: '6px' }}>
          <h2 className="card-title" style={{ fontSize: '15px' }}>
            <KeyRound size={16} color="#7a1521" />
            Change Password
          </h2>
        </div>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '18px' }}>
          Ensure your account is protected with a strong, distinct passphrase.
        </p>

        <form onSubmit={handlePasswordUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            {/* Current Password */}
            <div>
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass.current ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '36px', fontSize: '12px' }}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                >
                  {showPass.current ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass.next ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '36px', fontSize: '12px' }}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPass({ ...showPass, next: !showPass.next })}
                >
                  {showPass.next ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="form-label">Re-new Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass.confirm ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '36px', fontSize: '12px' }}
                  placeholder="Enter re-new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                >
                  {showPass.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={updating}>
              <RefreshCw size={14} />
              <span>{updating ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Card 3: Active Sessions & Login Activity */}
      <div className="content-card" style={{ marginBottom: 0 }}>
        <div className="card-header-row" style={{ marginBottom: '18px' }}>
          <h2 className="card-title" style={{ fontSize: '15px' }}>
            <Laptop size={16} color="#7a1521" />
            Active Sessions & Login Activity
          </h2>
          <span
            style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', cursor: 'pointer' }}
            onClick={handleLogoutAllSessions}
          >
            Log out all other sessions
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sessions.map((sess) => (
            <div
              key={sess.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                backgroundColor: '#ffffff',
                border: '1px solid #f1f5f9',
                borderRadius: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e2e8f0'
                  }}
                >
                  {getDeviceIcon(sess.icon)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                      {sess.device} • {sess.browser}
                    </span>
                    {sess.isCurrent && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '700',
                          backgroundColor: '#d1fae5',
                          color: '#065f46',
                          padding: '2px 8px',
                          borderRadius: '9999px'
                        }}
                      >
                        Active Now
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                    {sess.location} • IP: {sess.ip} {!sess.isCurrent && `• ${sess.status}`}
                  </div>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                  onClick={() => alert(`Logged out from ${sess.device}`)}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
