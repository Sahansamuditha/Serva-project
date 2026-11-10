import React from 'react';
import UnifiedSettings from '../../../components/UnifiedSettings';

export default function SettingsPage({
  activeTab = 'profile',
  setActiveTab,
  userProfile = {},
  onUpdateProfile
}) {
  return <UnifiedSettings initialTab={activeTab} />;
}
