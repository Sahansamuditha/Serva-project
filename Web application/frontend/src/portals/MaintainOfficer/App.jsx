import React, { useState, useEffect } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import RequestsManagement from './pages/RequestsManagement';
import RequestReview from './pages/RequestReview';
import JobsManagement from './pages/JobsManagement';
import JobDetails from './pages/JobDetails';
import LabourersManagement from './pages/LabourersManagement';
import ReportsAnalytics from './pages/ReportsAnalytics';
import NotificationCenter from './pages/NotificationCenter';
import SettingsPage from './pages/Settings';
import { fetchNotifications, fetchSettings, updateProfile, fetchStats } from './api';
import { getAuthUser } from '../../utils/auth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [selectedRequestId, setSelectedRequestId] = useState('REQ-3954');
  const [selectedJobId, setSelectedJobId] = useState('JOB-3954');
  const [unreadCount, setUnreadCount] = useState(0);

  const [userProfile, setUserProfile] = useState(() => {
    try {
      const savedRole = localStorage.getItem('serva_user_maintenance_officer');
      if (savedRole) {
        const u = JSON.parse(savedRole);
        return {
          firstName: u.firstName || 'Chaminda',
          lastName: u.lastName || 'Bandara',
          name: u.fullName || u.name || `${u.firstName || 'Chaminda'} ${u.lastName || 'Bandara'}`.trim(),
          email: u.email || 'officer@itum.mrt.ac.lk',
          phone: u.phone || '+94 77 123 4567',
          department: u.department || u.division || 'Works & Maintenance Division',
          designation: u.designation || 'Maintenance Officer',
          avatar: u.avatar || u.avatarUrl || ''
        };
      }
    } catch (e) { }
    const saved = localStorage.getItem('serva_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    const auth = getAuthUser();
    if (auth) {
      return {
        id: auth.id,
        firstName: auth.firstName || 'Maintenance',
        lastName: auth.lastName || 'Officer',
        name: auth.fullName || auth.name || `${auth.firstName || ''} ${auth.lastName || ''}`.trim() || 'Maintenance Officer',
        email: auth.email || '',
        phone: auth.phone || '',
        department: auth.department || 'Works & Maintenance Division',
        designation: auth.designation || auth.role || 'Maintenance Officer',
        avatar: auth.avatar || auth.avatarUrl || ''
      };
    }
    return {
      firstName: 'Chaminda',
      lastName: 'Bandara',
      name: 'Chaminda Bandara',
      email: 'officer@itum.mrt.ac.lk',
      phone: '+94 77 123 4567',
      department: 'Works & Maintenance Division',
      designation: 'Maintenance Officer',
      avatar: ''
    };
  });

  useEffect(() => {
    async function loadUserProfile() {
      try {
        const data = await fetchSettings();
        if (data?.profile) {
          const p = data.profile;
          setUserProfile(prev => {
            const updated = {
              ...prev,
              ...p,
              name: p.name || `${p.firstName || ''} ${p.lastName || ''}`.trim() || prev.name
            };
            try {
              localStorage.setItem('serva_user_profile', JSON.stringify(updated));
              localStorage.setItem('serva_user_maintenance_officer', JSON.stringify(updated));
            } catch (e) {}
            return updated;
          });
        }
      } catch (err) {}
    }
    loadUserProfile();

    // 3s interval to automatically reflect profile changes made from Mobile
    const syncTimer = setInterval(loadUserProfile, 3000);
    window.addEventListener('focus', loadUserProfile);

    const handleProfileSync = (e) => {
      const detail = e?.detail;
      if (detail && detail.targetRole && detail.targetRole !== 'maintenance_officer' && detail.targetRole !== 'Maintenance Officer') {
        return; // Ignore updates for other roles
      }
      const u = detail || getAuthUser();
      if (u && (u.role === 'maintenance_officer' || u.role === 'Maintenance Officer' || (u.role && u.role.toLowerCase().includes('maintenance')) || !detail)) {
        setUserProfile(prev => ({
          ...prev,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          name: `${u.firstName || prev.firstName} ${u.lastName || prev.lastName}`.trim(),
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          department: u.department || u.division || prev.department,
          designation: u.designation || prev.designation,
          avatar: u.avatar !== undefined ? u.avatar : (u.avatarUrl !== undefined ? u.avatarUrl : prev.avatar)
        }));
      }
    };

    window.addEventListener('serva:profile-updated', handleProfileSync);
    window.addEventListener('serva:auth-change', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);

    const handleNavRequest = (e) => {
      const reqId = e.detail?.requestId;
      if (reqId) {
        setSelectedRequestId(reqId);
        setCurrentPage('request-review');
      }
    };
    window.addEventListener('serva:navigate-request', handleNavRequest);

    return () => {
      clearInterval(syncTimer);
      window.removeEventListener('focus', loadUserProfile);
      window.removeEventListener('serva:profile-updated', handleProfileSync);
      window.removeEventListener('serva:auth-change', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
      window.removeEventListener('serva:navigate-request', handleNavRequest);
    };
  }, []);

  const handleUpdateProfile = async (updatedData) => {
    setUserProfile(prev => {
      const merged = { ...prev, ...updatedData };
      try {
        localStorage.setItem('serva_user_profile', JSON.stringify(merged));
        localStorage.setItem('serva_user_maintenance_officer', JSON.stringify(merged));
      } catch (e) {
        console.warn('LocalStorage save error', e);
      }
      return merged;
    });

    try {
      await updateProfile(updatedData);
      window.dispatchEvent(new CustomEvent('serva:profile-updated', { detail: updatedData }));
    } catch (err) {
      console.warn('API updateProfile error', err);
    }
  };

  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchStats();
        if (data) {
          const pCount = ((data.pendingRequests || 0) + (data.acceptedRequests || 0));
          setPendingRequestsCount(Number(pCount));
        }
      } catch (e) {
        console.error('Failed to load pending requests count:', e);
      }
    }
    loadStats();
  }, [currentPage]);

  useEffect(() => {
    async function getNotifs(e) {
      if (e?.detail?.unreadCount !== undefined) {
        setUnreadCount(Number(e.detail.unreadCount));
        return;
      }
      try {
        const res = await fetchNotifications();
        const list = res.notifications || res.data || (Array.isArray(res) ? res : []);
        const unread = res.unreadCount !== undefined
          ? res.unreadCount
          : list.filter(n => !n.is_read && !n.read).length;
        setUnreadCount(Number(unread) || 0);
      } catch (err) {
        console.error('Failed to load notifications count:', err);
      }
    }
    getNotifs();

    window.addEventListener('serva:notifs-updated', getNotifs);
    return () => window.removeEventListener('serva:notifs-updated', getNotifs);
  }, [currentPage]);

  // Generate Breadcrumbs
  const getBreadcrumbs = () => {
    switch (currentPage) {
      case 'request-review':
        return [
          { label: 'Dashboard', action: () => setCurrentPage('dashboard') },
          { label: 'Requests', action: () => setCurrentPage('requests') },
          { label: `Review & Assign Task (#${selectedRequestId})`, active: true }
        ];
      case 'job-details':
        return [
          { label: 'Dashboard', action: () => setCurrentPage('dashboard') },
          { label: 'Jobs', action: () => setCurrentPage('jobs') },
          { label: `Job Details (#${selectedJobId})`, active: true }
        ];
      default:
        return null;
    }
  };

  const getPageTitle = () => {
    switch (currentPage) {
      case 'dashboard': return 'Dashboard';
      case 'requests': return 'Requests';
      case 'request-review': return 'Requests';
      case 'jobs': return 'Jobs';
      case 'job-details': return 'Jobs';
      case 'labourers': return 'Supervisors';
      case 'reports': return 'Reports';
      case 'notifications': return 'Notifications';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const handleNavigateToSettings = (tab = 'profile') => {
    setSettingsTab(tab);
    setCurrentPage('settings');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onNavigateSettings={handleNavigateToSettings}
        pendingCount={pendingRequestsCount}
        unreadNotifCount={unreadCount}
        userProfile={userProfile}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Header
          title={getPageTitle()}
          breadcrumbs={getBreadcrumbs()}
          setCurrentPage={setCurrentPage}
          onNavigateSettings={handleNavigateToSettings}
          unreadCount={unreadCount}
          userProfile={userProfile}
        />

        <main className="content-area">
          {currentPage === 'dashboard' && (
            <Dashboard
              setCurrentPage={setCurrentPage}
              setSelectedRequestId={setSelectedRequestId}
              userProfile={userProfile}
            />
          )}

          {currentPage === 'requests' && (
            <RequestsManagement
              setCurrentPage={setCurrentPage}
              setSelectedRequestId={setSelectedRequestId}
            />
          )}

          {currentPage === 'request-review' && (
            <RequestReview
              requestId={selectedRequestId}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === 'jobs' && (
            <JobsManagement
              setCurrentPage={setCurrentPage}
              setSelectedJobId={setSelectedJobId}
            />
          )}

          {currentPage === 'job-details' && (
            <JobDetails
              jobId={selectedJobId}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === 'labourers' && (
            <LabourersManagement />
          )}

          {currentPage === 'reports' && (
            <ReportsAnalytics setCurrentPage={setCurrentPage} />
          )}

          {currentPage === 'notifications' && (
            <NotificationCenter
              setCurrentPage={setCurrentPage}
              setSettingsTab={setSettingsTab}
              setSelectedRequestId={setSelectedRequestId}
              onUpdateUnread={setUnreadCount}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              activeTab={settingsTab}
              setActiveTab={setSettingsTab}
              userProfile={userProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}
        </main>
      </div>
    </div>
  );
}
