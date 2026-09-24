import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi, uploadApi } from '../services/api';
import { getAuthUser } from '../../../utils/auth';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const u = getAuthUser();
    if (u) {
      const fName = u.firstName || '';
      const lName = u.lastName || '';
      return {
        id: u.id,
        firstName: fName,
        lastName: lName,
        fullName: u.fullName || u.name || `${fName} ${lName}`.trim() || 'Requester',
        email: u.email || '',
        phone: u.phone || '',
        division: u.department || u.division || 'ITUM Central Administration',
        department: u.department || u.division || 'ITUM Central Administration',
        designation: u.designation || u.role || 'Requester',
        avatar: u.avatar || u.avatarUrl || '',
        verified: true
      };
    }
    return {
      firstName: '',
      lastName: '',
      fullName: 'Requester',
      email: '',
      phone: '',
      division: 'ITUM Central Administration',
      department: 'ITUM Central Administration',
      designation: 'Requester',
      avatar: '',
      verified: true
    };
  });

  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await settingsApi.getProfile();
      const u = res.data?.user || res.data?.profile || res.data;
      if (u) {
        setProfile(prev => ({
          ...prev,
          id: u.id || prev.id,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          fullName: u.fullName || u.name || `${u.firstName || prev.firstName} ${u.lastName || prev.lastName}`.trim(),
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          division: u.division || u.department || prev.division,
          department: u.department || u.division || prev.department,
          designation: u.designation || prev.designation,
          avatar: u.avatar !== undefined ? u.avatar : (u.avatarUrl !== undefined ? u.avatarUrl : prev.avatar),
          verified: u.verified !== undefined ? u.verified : true
        }));
      }
    } catch (err) {
      console.error('Failed to load requester profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    const handleProfileUpdate = (e) => {
      const detail = e?.detail;
      if (detail && detail.targetRole && !detail.targetRole.toLowerCase().includes('requester')) {
        return; // Ignore updates intended for other roles
      }
      const u = detail || getAuthUser();
      if (u) {
        setProfile(prev => ({
          ...prev,
          id: u.id || prev.id,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          fullName: u.fullName || u.name || `${u.firstName || prev.firstName} ${u.lastName || prev.lastName}`.trim(),
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          division: u.division || u.department || prev.division,
          department: u.department || u.division || prev.department,
          designation: u.designation || prev.designation,
          avatar: u.avatar !== undefined ? u.avatar : (u.avatarUrl !== undefined ? u.avatarUrl : prev.avatar)
        }));
      }
    };

    window.addEventListener('serva:profile-updated', handleProfileUpdate);
    window.addEventListener('serva:auth-change', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('serva:profile-updated', handleProfileUpdate);
      window.removeEventListener('serva:auth-change', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, []);

  const updateProfile = async (updatedData) => {
    try {
      const res = await settingsApi.updateProfile(updatedData);
      const u = res.data?.user || res.data?.profile || updatedData;
      let finalUser;
      setProfile(prev => {
        finalUser = {
          ...prev,
          ...u,
          fullName: u.fullName || u.name || `${u.firstName || prev.firstName} ${u.lastName || prev.lastName}`.trim(),
          avatar: u.avatar !== undefined ? u.avatar : (u.avatarUrl !== undefined ? u.avatarUrl : prev.avatar)
        };
        return finalUser;
      });

      try {
        const currentAuth = getAuthUser() || {};
        const mergedAuth = { ...currentAuth, ...finalUser };
        localStorage.setItem('serva_user', JSON.stringify(mergedAuth));
      } catch (e) {}

      window.dispatchEvent(new CustomEvent('serva:profile-updated', { detail: finalUser }));
      window.dispatchEvent(new Event('serva:auth-change'));

      return { success: true, user: finalUser || u };
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Url = reader.result;
        await updateProfile({ ...profile, avatar: base64Url, avatarUrl: base64Url });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
    }
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      setProfile,
      loading,
      updateProfile,
      uploadAvatar,
      reloadProfile: fetchProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export default ProfileContext;
