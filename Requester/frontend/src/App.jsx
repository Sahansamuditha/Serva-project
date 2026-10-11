import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import RequestsList from './pages/RequestsList';
import CreateRequest from './pages/CreateRequest';
import RequestDetails from './pages/RequestDetails';
import Notifications from './pages/Notifications';
import ProfileSettings from './pages/ProfileSettings';
import NotificationSettings from './pages/NotificationSettings';
import SecuritySettings from './pages/SecuritySettings';
import SystemLogs from './pages/SystemLogs';
import { notificationsApi } from './services/api';
import { ProfileProvider } from './context/ProfileContext';

function AppLayout() {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    notificationsApi.getAll()
      .then((res) => {
        if (res.data?.unreadCount !== undefined) {
          setUnreadCount(res.data.unreadCount);
        }
      })
      .catch((err) => console.error(err));
  }, [location.pathname]);

  // Determine top header title from current route
  const getHeaderTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/requests/new')) return 'Requests';
    if (path.startsWith('/requests/')) return 'Requests';
    if (path.startsWith('/requests')) return 'Requests';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* Persistent Left Sidebar */}
      <Sidebar unreadCount={unreadCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header 
          title={getHeaderTitle()} 
          unreadCount={unreadCount} 
        />
        
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/requests" element={<RequestsList />} />
            <Route path="/requests/new" element={<CreateRequest />} />
            <Route path="/requests/:id" element={<RequestDetails />} />
            <Route 
              path="/notifications" 
              element={<Notifications onUpdateUnread={setUnreadCount} />} 
            />
            <Route path="/settings" element={<Navigate to="/settings/profile" replace />} />
            <Route path="/settings/profile" element={<ProfileSettings />} />
            <Route path="/settings/notifications" element={<NotificationSettings />} />
            <Route path="/settings/security" element={<SecuritySettings />} />
            <Route path="/settings/logs" element={<SystemLogs />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <AppLayout />
      </ProfileProvider>
    </BrowserRouter>
  );
}
