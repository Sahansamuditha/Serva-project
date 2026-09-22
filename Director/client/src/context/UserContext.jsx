import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [avatarUrl, setAvatarUrl] = useState(() => {
    return localStorage.getItem('serva_director_avatar') || null;
  });

  const [firstName, setFirstName] = useState(() => {
    return localStorage.getItem('serva_director_firstname') || 'Anura';
  });

  const [lastName, setLastName] = useState(() => {
    return localStorage.getItem('serva_director_lastname') || 'Perera';
  });

  const [userRole, setUserRole] = useState('Director');

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res && res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
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
