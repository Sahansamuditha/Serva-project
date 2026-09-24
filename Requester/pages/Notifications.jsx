import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedNotifications from '../../../components/UnifiedNotifications';

export default function Notifications({ onUpdateUnread }) {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 bg-[#F8FAFC] min-h-screen">
      <UnifiedNotifications
        onUpdateUnread={onUpdateUnread}
        onNavigateToSettings={() => navigate('/settings/notifications')}
        onNavigateToRequest={(link) => navigate(link)}
      />
    </div>
  );
}
