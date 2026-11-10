import React from 'react';
import { NavLink } from 'react-router-dom';
import campusLogo from '../../../assets/logo.png';
import { useUser } from '../../context/UserContext';
import { triggerLogout } from '../../../utils/auth';
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
        <div className="brand-crest" style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#ffffff', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}>
          <img src={campusLogo} alt="ITUM Campus Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.target.src = '/logo.png'; }} />
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
            triggerLogout();
          }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
}
