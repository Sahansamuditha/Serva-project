import React from 'react';
import { useNavigate } from 'react-router-dom';
import UnifiedNotifications from '../../../components/UnifiedNotifications';

export default function NotificationsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <UnifiedNotifications
        onNavigateToSettings={() => navigate('/settings/notifications')}
        onNavigateToRequest={(link, item) => {
          const reqMatch = (link || item?.title || item?.message || '').match(/REQ-\d+/i);
          if (reqMatch) {
            navigate(`/requests?id=${reqMatch[0].toUpperCase()}`);
          } else {
            navigate('/requests');
          }
        }}
      />
    </div>
  );
}
