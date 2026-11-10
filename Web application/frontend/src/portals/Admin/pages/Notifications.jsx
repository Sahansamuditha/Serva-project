import React from 'react';
import UnifiedNotifications from '../../../components/UnifiedNotifications';

export default function Notifications({ onNavigateToSettings, globalSearch = '', setActivePage, setSelectedJobId }) {
  const handleNavigateToRequest = (link, item) => {
    const jobMatch = (link || item?.title || item?.message || '').match(/JOB-\d+/i);
    if (jobMatch && setSelectedJobId) {
      setSelectedJobId(jobMatch[0].toUpperCase());
      if (setActivePage) setActivePage('job-detail');
      return;
    }
    if (setActivePage) setActivePage('jobs');
  };

  return (
    <UnifiedNotifications
      onNavigateToSettings={onNavigateToSettings}
      onNavigateToRequest={handleNavigateToRequest}
    />
  );
}
