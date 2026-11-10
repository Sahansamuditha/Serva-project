import React from 'react';

export interface AvatarPickerModalProps {
  isOpen?: boolean;
  currentAvatarUrl?: string;
  userName?: string;
  onClose?: () => void;
  onSaveAvatar?: (newUrl: string) => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = () => {
  return null;
};
