import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Bell, Shield, FileText } from 'lucide-react';

export default function SettingsNav() {
  const menuItems = [
    {
      name: 'Profile Settings',
      path: '/settings',
      subtext: 'Manage personal details & role',
      icon: Settings,
      end: true
    },
    {
      name: 'Notification Settings',
      path: '/settings/notifications',
      subtext: 'System notifications',
      icon: Bell
    },
    {
      name: 'Security Settings',
      path: '/settings/security',
      subtext: 'Password & security policies',
      icon: Shield
    },
    {
      name: 'System Logs',
      path: '/settings/logs',
      subtext: 'View and manage logs',
      icon: FileText
    }
  ];

  return (
    <div className="content-card" style={{ padding: '16px 12px' }}>
      <h3
        style={{
          fontSize: '12px',
          fontWeight: '700',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '4px 12px 12px'
        }}
      >
        Settings Menu
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '8px',
                textDecoration: 'none',
                backgroundColor: isActive ? '#fff0ef' : 'transparent',
                color: isActive ? '#7a1521' : '#334155',
                transition: 'background-color 0.15s ease'
              })}
            >
              <Icon size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', lineHeight: 1.2 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  {item.subtext}
                </div>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
