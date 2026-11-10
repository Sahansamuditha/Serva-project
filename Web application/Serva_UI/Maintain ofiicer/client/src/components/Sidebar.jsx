import React, { useState } from 'react';
import { 
  Home,
  FileText, 
  Briefcase, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  LogOut,
  User,
  Shield,
  History
} from 'lucide-react';

export default function Sidebar({ currentPage, setCurrentPage, onNavigateSettings, pendingCount = 14, unreadNotifCount = 5, userProfile = {} }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const displayName = userProfile?.firstName || 'Maintenance Officer';
  const roleName = userProfile?.designation || 'Maintenance Officer';
  const avatarUrl = userProfile?.avatar || '';
  const initialChar = (userProfile?.firstName ? userProfile.firstName.charAt(0) : 'A').toUpperCase();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'requests', label: 'Requests', icon: FileText, badge: pendingCount > 0 ? pendingCount : null },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'labourers', label: 'Labourers', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifCount > 0 ? unreadNotifCount : null },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      backgroundColor: '#ffffff',
      color: '#334155',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      borderRight: '1px solid #e2e8f0',
      userSelect: 'none',
      boxShadow: '1px 0 3px rgba(0, 0, 0, 0.02)'
    }}>
      {/* Top Brand Header: Deep Maroon Curved Banner (Matching exact screenshot) */}
      <div style={{
        backgroundColor: '#7a1521',
        color: '#ffffff',
        padding: '22px 18px 20px',
        borderBottomRightRadius: '36px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 4px 12px rgba(122, 21, 33, 0.22)',
        position: 'relative',
        zIndex: 2
      }}>
        {/* ITUM Crest Emblem in White Circle */}
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
          padding: '2px'
        }}>
          {/* Detailed Crest Emblem matching ITUM / Moratuwa Logo */}
          <svg viewBox="0 0 100 100" width="34" height="34">
            <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#b45309" strokeWidth="2.5" />
            <circle cx="50" cy="50" r="38" fill="#7a1521" />
            {/* Gear / Sun rays */}
            <path d="M50 16 L53 24 L61 22 L60 30 L68 32 L64 39 L71 44 L64 48 L69 55 L61 57 L63 65 L55 64 L54 72 L48 68 L44 74 L42 66 L34 68 L36 60 L28 59 L33 52 L26 48 L33 43 L29 36 L37 34 L36 26 L44 28 Z" fill="#f59e0b" opacity="0.9" />
            {/* Inner shield / book */}
            <circle cx="50" cy="50" r="22" fill="#ffffff" />
            <path d="M42 42 Q50 38 58 42 L58 58 Q50 54 42 58 Z" fill="#7a1521" />
            <path d="M50 40 L50 56" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="50" cy="32" r="3" fill="#f59e0b" />
          </svg>
        </div>

        <div>
          <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.04em', lineHeight: 1.15, color: '#ffffff' }}>
            ITUM
          </div>
          <div style={{ fontSize: '10px', opacity: 0.9, lineHeight: 1.2, color: '#ffffff', marginTop: '2px', fontWeight: 500 }}>
            Maintenance<br />Monitoring System
          </div>
        </div>
      </div>

      {/* Navigation Links Area */}
      <nav style={{ 
        flex: 1, 
        padding: '24px 14px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '6px',
        backgroundColor: '#ffffff'
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || 
            (item.id === 'requests' && currentPage === 'request-review') ||
            (item.id === 'jobs' && currentPage === 'job-details');

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '11px 16px',
                borderRadius: '8px',
                backgroundColor: isActive ? '#7a1521' : 'transparent',
                color: isActive ? '#ffffff' : '#334155',
                fontWeight: isActive ? 600 : 500,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 2px 6px rgba(122, 21, 33, 0.25)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#f8fafc';
                  e.currentTarget.style.color = '#1e293b';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#334155';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Icon 
                  size={19} 
                  style={{ 
                    color: isActive ? '#ffffff' : '#64748b',
                    strokeWidth: isActive ? 2.2 : 1.8 
                  }} 
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span style={{
                  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : '#ef4444',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile Footer (Matching exact screenshot) */}
      <div style={{
        padding: '18px 16px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: '#ffffff',
        position: 'relative'
      }}>
        {/* User Dropdown Menu if clicked */}
        {showUserMenu && (
          <div style={{
            position: 'absolute',
            bottom: '100%',
            left: '12px',
            right: '12px',
            marginBottom: '8px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: 'var(--shadow-dropdown)',
            padding: '12px',
            color: 'var(--color-text-main)',
            border: '1px solid #e2e8f0',
            zIndex: 200,
            animation: 'fadeIn 0.15s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#7a1521',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initialChar
                )}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#1e293b' }}>{displayName}</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{roleName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px' }}>
              <button
                onClick={() => { 
                  if (onNavigateSettings) onNavigateSettings('profile');
                  else setCurrentPage('settings'); 
                  setShowUserMenu(false); 
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                  borderRadius: '6px', background: 'none', border: 'none', color: '#475569',
                  fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={15} /> General Settings
              </button>
              <button
                onClick={() => { setCurrentPage('requests'); setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                  borderRadius: '6px', background: 'none', border: 'none', color: '#475569',
                  fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <History size={15} /> Requests
              </button>
              <button
                onClick={() => { 
                  if (onNavigateSettings) onNavigateSettings('notifications');
                  else setCurrentPage('settings'); 
                  setShowUserMenu(false); 
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                  borderRadius: '6px', background: 'none', border: 'none', color: '#475569',
                  fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Shield size={15} /> Notification Settings
              </button>
              <button
                onClick={() => { alert('Logged out successfully'); setShowUserMenu(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px',
                  borderRadius: '6px', background: 'none', border: 'none', color: '#ef4444',
                  fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left',
                  borderTop: '1px solid #f1f5f9', marginTop: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          </div>
        )}

        {/* User Card: MO Maroon circle + Maintenance Officer */}
        <div 
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '14px',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '8px',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            backgroundColor: '#7a1521',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '14px',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              initialChar
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {roleName}
            </div>
          </div>
        </div>

        {/* Log Out button with icon */}
        <button
          onClick={() => alert('Logged out successfully')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            padding: '6px 8px',
            borderRadius: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
            e.currentTarget.style.backgroundColor = '#fef2f2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#64748b';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <LogOut size={16} style={{ transform: 'scaleX(-1)' }} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
