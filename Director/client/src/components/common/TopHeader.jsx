import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Bell, ChevronDown, User, Shield, LogOut, X } from 'lucide-react';
import { useUser } from '../../context/UserContext';

export default function TopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { avatarUrl, userName, unreadCount } = useUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = searchParams.get('search') || '';
    setSearchTerm(q);
  }, [searchParams]);

  const getPageTitle = (pathname) => {
    if (pathname === '/' || pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/requests')) return 'Requests';
    if (pathname.startsWith('/reports')) return 'Reports';
    if (pathname.startsWith('/notifications')) return 'Notifications';
    if (pathname.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  const getPlaceholder = (pathname) => {
    if (pathname.startsWith('/notifications')) return 'Search notifications, alerts, keywords...';
    if (pathname.startsWith('/requests')) return 'Search request ID, title, user, location...';
    return 'Search requests, users, notifications...';
  };

  const updateSearch = (term) => {
    setSearchTerm(term);
    const query = term.trim() ? `?search=${encodeURIComponent(term.trim())}` : '';
    if (location.pathname.startsWith('/notifications')) {
      navigate(`/notifications${query}`, { replace: true });
    } else if (location.pathname.startsWith('/requests')) {
      navigate(`/requests${query}`, { replace: true });
    } else {
      navigate(`/requests${query}`);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateSearch(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    if (location.pathname.startsWith('/notifications')) {
      navigate('/notifications', { replace: true });
    } else if (location.pathname.startsWith('/requests')) {
      navigate('/requests', { replace: true });
    }
  };

  return (
    <header className="top-header">
      <div className="header-page-title">{getPageTitle(location.pathname)}</div>

      {/* Global Top Search Bar */}
      <div className="header-search-container">
        <form onSubmit={handleSearchSubmit} className="header-search-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search className="header-search-icon" />
            <input
              type="text"
              className="header-search-input"
              style={{ paddingRight: searchTerm ? '32px' : '14px' }}
              placeholder={getPlaceholder(location.pathname)}
              value={searchTerm}
              onChange={(e) => updateSearch(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2px'
                }}
                title="Clear input"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="btn-primary"
            style={{
              height: '38px',
              padding: '0 16px',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px'
            }}
          >
            <Search size={14} />
            Search
          </button>
        </form>
      </div>

      <div className="header-right-actions">
        {/* Notification Bell */}
        <button
          className="notification-bell-btn"
          onClick={() => navigate('/notifications')}
          title="Notification Center"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {/* User Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <div
            className="header-profile-dropdown"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Director Avatar"
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div className="header-avatar">D</div>
            )}
            <div className="header-user-meta">
              <span className="header-user-name">{userName}</span>
              <span className="header-user-role">Director</span>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </div>

          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '200px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                padding: '6px',
                zIndex: 50
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/settings');
                }}
              >
                <User size={15} />
                Profile Settings
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/settings/security');
                }}
              >
                <Shield size={15} />
                Security
              </button>
              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
              <button
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: '#b91c1c',
                  fontSize: '13px',
                  cursor: 'pointer',
                  borderRadius: '6px'
                }}
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/');
                }}
              >
                <LogOut size={15} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
