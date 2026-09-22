import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SettingsNav from '../components/settings/SettingsNav';
import ProfileSettings from '../components/settings/ProfileSettings';
import NotificationSettings from '../components/settings/NotificationSettings';
import SecuritySettings from '../components/settings/SecuritySettings';
import SystemLogs from '../components/settings/SystemLogs';

export default function SettingsPage() {
  return (
    <div className="page-container">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '24px',
          alignItems: 'start'
        }}
      >
        {/* Left Submenu */}
        <SettingsNav />

        {/* Right Content */}
        <div>
          <Routes>
            <Route index element={<ProfileSettings />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="notifications" element={<NotificationSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="*" element={<Navigate to="/settings" replace />} />
          </Routes>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="page-footer-copyright">
        © 2026 Institute of Technology, University of Moratuwa. All rights reserved.
      </div>
    </div>
  );
}
