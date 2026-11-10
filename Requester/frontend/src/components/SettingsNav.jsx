import React from 'react';
import { NavLink } from 'react-router-dom';
import { User, Bell, Shield, ScrollText, Settings } from 'lucide-react';

export default function SettingsNav() {
  const items = [
    {
      to: '/settings/profile',
      title: 'Profile Settings',
      subtitle: 'Manage personal details & role',
      icon: User
    },
    {
      to: '/settings/notifications',
      title: 'Notification Settings',
      subtitle: 'System notifications',
      icon: Bell
    },
    {
      to: '/settings/security',
      title: 'Security Settings',
      subtitle: 'Password & security policies',
      icon: Shield
    },
    {
      to: '/settings/logs',
      title: 'System Logs',
      subtitle: 'View and manage logs',
      icon: ScrollText
    }
  ];

  return (
    <div className="w-80 bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-card shrink-0 h-fit">
      <h3 className="text-sm font-bold text-[#241919] mb-4">Settings Menu</h3>
      <div className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-start gap-3.5 p-3 rounded-xl transition-all duration-150 ${
                  isActive
                    ? 'bg-[#ffe9e8] text-[#7a1521] border border-[#ffb3b2]/60 font-semibold'
                    : 'text-[#574141] hover:bg-[#fff0ef] hover:text-[#7a1521]'
                }`
              }
            >
              <Icon className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold leading-tight">{item.title}</p>
                <p className="text-xs opacity-75 mt-0.5">{item.subtitle}</p>
              </div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
