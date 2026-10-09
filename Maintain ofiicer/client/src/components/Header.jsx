import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  History,
  Shield,
  LogOut
} from 'lucide-react';

export default function Header({
  title,
  breadcrumbs,
  onSearch,
  setCurrentPage,
  onNavigateSettings,
  unreadCount = 5,
  userProfile = {}
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  const displayName = userProfile?.firstName || 'Maintenance Officer';
  const roleName = userProfile?.designation || 'Maintenance Officer';
  const avatarUrl = userProfile?.avatar || '';
  const initialChar = (userProfile?.firstName ? userProfile.firstName.charAt(0) : 'A').toUpperCase();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header style={{
      height: 'var(--header-height)',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Title / Breadcrumb */}
      <div>
        {breadcrumbs ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span style={{ color: '#cbd5e1' }}>&gt;</span>}
                {crumb.action ? (
                  <button
                    onClick={crumb.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: crumb.active ? '#1e293b' : '#64748b',
                      fontWeight: crumb.active ? 600 : 400,
                      cursor: 'pointer',
                      padding: 0,
                      fontSize: '13px'
                    }}
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span style={{ color: crumb.active ? '#1e293b' : '#64748b', fontWeight: crumb.active ? 600 : 400 }}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>
            {title}
          </h1>
        )}
      </div>

      {/* Global Search Bar (100% Full Width) */}
      <div style={{
        flex: 1,
        margin: '0 24px',
        position: 'relative'
      }}>
        <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search requests, jobs, users..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            height: '42px',
            padding: '8px 16px 8px 42px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            backgroundColor: '#ffffff',
            fontSize: '13.5px',
            outline: 'none',
            fontFamily: 'var(--font-family)',
            color: 'var(--color-text-main)',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
        />
      </div>

      {/* Right Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
        {/* Notification Bell */}
        <button
          onClick={() => setCurrentPage('notifications')}
          style={{
            position: 'relative',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Dropdown Menu (Image 4.png) */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{
              width: '34px',
              height: '34px',
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
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>
                {displayName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.2 }}>
                {roleName}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: '#94a3b8' }} />
          </div>

          {/* Dropdown Menu Container */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '230px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-dropdown)',
              border: '1px solid var(--color-border)',
              padding: '12px',
              zIndex: 300,
              animation: 'fadeIn 0.15s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
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
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                    borderRadius: '6px', background: 'none', border: 'none', color: '#475569',
                    fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User size={16} /> Profile Settings
                </button>
                <button
                  onClick={() => { setCurrentPage('requests'); setDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                    borderRadius: '6px', background: 'none', border: 'none', color: '#475569',
                    fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <History size={16} /> Requests
                </button>
                <button
                  onClick={() => {
                    if (onNavigateSettings) onNavigateSettings('notifications');
                    else setCurrentPage('settings');
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                    borderRadius: '6px', background: 'none', border: 'none', color: '#475569',
                    fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Shield size={16} /> Notification Settings
                </button>
                <button
                  onClick={() => { alert('Logged out successfully'); setDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                    borderRadius: '6px', background: 'none', border: 'none', color: '#ef4444',
                    fontSize: '13px', cursor: 'pointer', width: '100%', textAlign: 'left',
                    borderTop: '1px solid #f1f5f9', marginTop: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
