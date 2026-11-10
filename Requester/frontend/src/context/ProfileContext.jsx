import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi, uploadApi } from '../services/api';

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState({
    firstName: 'Anura',
    lastName: 'Perera',
    fullName: 'Anura Perera',
    email: 'anura.perera@itum.mrt.ac.lk',
    phone: '+94 77 123 4567',
    division: 'ITUM Central',
    department: 'ITUM Central',
    designation: 'Requester',
    avatar: '',
    verified: true
  });

  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await settingsApi.getProfile();
      if (res.data?.user) {
        const u = res.data.user;
        setProfile({
          firstName: u.firstName || 'Anura',
          lastName: u.lastName || 'Perera',
          fullName: u.fullName || `${u.firstName || 'Anura'} ${u.lastName || 'Perera'}`.trim(),
          email: u.email || 'anura.perera@itum.mrt.ac.lk',
          phone: u.phone || '+94 77 123 4567',
          division: u.division || u.department || 'ITUM Central',
          department: u.department || u.division || 'ITUM Central',
          designation: u.designation || 'Requester',
          avatar: u.avatar || '',
          verified: u.verified !== undefined ? u.verified : true
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updateProfile = async (updatedData) => {
    try {
      const res = await settingsApi.updateProfile(updatedData);
      const u = res.data?.user || updatedData;
      let finalUser;
      setProfile(prev => {
        finalUser = {
          ...prev,
          ...u,
          fullName: u.fullName || `${u.firstName || prev.firstName} ${u.lastName || prev.lastName}`.trim()
        };
        return finalUser;
      });
      return { success: true, user: finalUser || u };
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('files', file);
      const res = await uploadApi.uploadFiles(formData);
      if (res.data?.files?.[0]?.url) {
        const fileUrl = res.data.files[0].url;
        await updateProfile({ ...profile, avatar: fileUrl });
        return fileUrl;
      }
      throw new Error('Upload response did not contain file url');
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      // Fallback: local blob url
      const fallbackUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, avatar: fallbackUrl }));
      return fallbackUrl;
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
