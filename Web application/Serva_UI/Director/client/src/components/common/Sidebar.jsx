import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  LayoutDashboard,
  FileText,
  BarChart2,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const { avatarUrl, userName, unreadCount } = useUser();
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Requests', path: '/requests', icon: FileText },
    { name: 'Reports', path: '/reports', icon: BarChart2 },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="sidebar-container">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-crest">
          <svg viewBox="0 0 36 36" width="32" height="32">
            <circle cx="18" cy="18" r="16" fill="#b91c1c" />
            <circle cx="18" cy="18" r="13" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
            <path d="M18 7 L21 14 L28 14 L23 19 L25 26 L18 22 L11 26 L13 19 L8 14 L15 14 Z" fill="#78350f" />
            <circle cx="18" cy="18" r="4" fill="#ffffff" />
          </svg>
        </div>
        <div className="brand-text">
          <h1>ITUM</h1>
          <p>Maintenance<br />Monitoring System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon className="nav-icon" />
              <span>{item.name}</span>
              {item.name === 'Notifications' && unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    borderRadius: '9999px',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '2px 7px',
                    lineHeight: '1'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-profile-row">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Director Profile"
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
            />
          ) : (
            <div className="avatar-circle">D</div>
          )}
          <div className="user-profile-info">
            <span className="user-profile-name">{userName}</span>
            <span className="user-profile-role">Director</span>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={() => {
            if (window.confirm('Are you sure you want to log out?')) {
              window.location.href = '/';
            }
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
