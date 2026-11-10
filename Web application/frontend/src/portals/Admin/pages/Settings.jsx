import React from 'react';
import UnifiedSettings from '../../../components/UnifiedSettings';

export default function Settings({
  initialSubTab = 'profile',
  onSubTabChange,
  profileAvatar,
  profileData,
  onSaveProfileData
}) {
  return <UnifiedSettings initialTab={initialSubTab} />;
}
