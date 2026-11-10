import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { getAuthUser } from '../../../utils/auth';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [avatarUrl, setAvatarUrl] = useState(() => {
    try {
      const saved = localStorage.getItem('serva_user_director');
      if (saved) {
        const u = JSON.parse(saved);
        return u.avatar || u.avatarUrl || null;
      }
    } catch (e) {}
    const auth = getAuthUser();
    if (auth?.role === 'director') return auth.avatar || auth.avatarUrl || null;
    return localStorage.getItem('serva_director_avatar') || null;
  });

  const [firstName, setFirstName] = useState(() => {
    const auth = getAuthUser();
    if (auth?.firstName) return auth.firstName;
    return 'Director';
  });

  const [lastName, setLastName] = useState(() => {
    const auth = getAuthUser();
    if (auth?.lastName) return auth.lastName;
    return '';
  });

  const [userRole, setUserRole] = useState(() => {
    const auth = getAuthUser();
    return auth?.designation || auth?.role || 'Director / Chief Officer';
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || res.data || []);
        const unread = res.unreadCount !== undefined
          ? res.unreadCount
          : (Array.isArray(res.notifications) ? res.notifications.filter(n => !n.is_read).length : 0);
        setUnreadCount(Number(unread) || 0);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const fetchDirectorProfile = async () => {
    try {
      const res = await fetch('/api/settings/profile?role=director');
      if (res.ok) {
        const data = await res.json();
        const u = data.user || data.profile;
        if (u) {
          if (u.firstName) setFirstName(u.firstName);
          if (u.lastName) setLastName(u.lastName);
          if (u.avatar !== undefined || u.avatarUrl !== undefined) {
            setAvatarUrl(u.avatar || u.avatarUrl || null);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load director profile:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchDirectorProfile();

    const handleProfileSync = (e) => {
      const detail = e?.detail;
      if (detail && detail.targetRole && detail.targetRole !== 'director') {
        return; // Ignore updates for other roles
      }
      const u = detail || getAuthUser();
      if (u && (u.role === 'director' || !detail)) {
        if (u.firstName) setFirstName(u.firstName);
        if (u.lastName) setLastName(u.lastName);
        if (u.avatar !== undefined || u.avatarUrl !== undefined) {
          setAvatarUrl(u.avatar || u.avatarUrl || null);
        }
      }
    };

    window.addEventListener('serva:notifs-updated', fetchNotifications);
    window.addEventListener('serva:profile-updated', handleProfileSync);
    window.addEventListener('serva:auth-change', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);

    return () => {
      window.removeEventListener('serva:notifs-updated', fetchNotifications);
      window.removeEventListener('serva:profile-updated', handleProfileSync);
      window.removeEventListener('serva:auth-change', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const dismissNotification = async (id) => {
    try {
      await api.dismissNotification(id);
      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const updateAvatar = (newAvatar) => {
    setAvatarUrl(newAvatar);
    if (newAvatar) {
      localStorage.setItem('serva_director_avatar', newAvatar);
    } else {
      localStorage.removeItem('serva_director_avatar');
    }
  };

  const updateProfileName = (newFirstName, newLastName) => {
    if (newFirstName !== undefined) {
      setFirstName(newFirstName);
      localStorage.setItem('serva_director_firstname', newFirstName);
    }
    if (newLastName !== undefined) {
      setLastName(newLastName);
      localStorage.setItem('serva_director_lastname', newLastName);
    }
  };

  const userName = firstName || 'Director';

  return (
    <UserContext.Provider
      value={{
        avatarUrl,
        updateAvatar,
        firstName,
        lastName,
        userName,
        userRole,
        updateProfileName,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
