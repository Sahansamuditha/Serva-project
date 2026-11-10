import React from 'react';
import UnifiedNotifications from '../../../components/UnifiedNotifications';

export default function NotificationCenter({ setCurrentPage, setSettingsTab, setSelectedRequestId, onUpdateUnread }) {
  const handleNavigateToRequest = (link, item) => {
    let reqId = item?.requestId;
    if (!reqId && typeof link === 'string') {
      const match = link.match(/REQ-\d+/i);
      if (match) reqId = match[0].toUpperCase();
    }
    if (!reqId && item?.title) {
      const match = item.title.match(/REQ-\d+/i);
      if (match) reqId = match[0].toUpperCase();
    }
    if (!reqId && item?.message) {
      const match = item.message.match(/REQ-\d+/i);
      if (match) reqId = match[0].toUpperCase();
    }

    if (reqId && setSelectedRequestId) {
      setSelectedRequestId(reqId);
      if (setCurrentPage) setCurrentPage('request-review');
    } else if (setCurrentPage) {
      setCurrentPage('requests');
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white min-h-screen">
      <UnifiedNotifications
        onNavigateToSettings={() => {
          if (setSettingsTab) setSettingsTab('notifications');
          if (setCurrentPage) setCurrentPage('settings');
        }}
        onNavigateToRequest={handleNavigateToRequest}
        onUpdateUnread={onUpdateUnread}
      />
    </div>
  );
}
