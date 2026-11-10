import React from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedSettings from '../../../components/UnifiedSettings';

export default function SettingsPage() {
  const location = useLocation();
  const path = location.pathname;
  let initialTab = 'profile';
  if (path.includes('notification')) initialTab = 'notifications';
  else if (path.includes('security')) initialTab = 'security';
  else if (path.includes('log')) initialTab = 'logs';

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <UnifiedSettings initialTab={initialTab} />
    </div>
  );
}
