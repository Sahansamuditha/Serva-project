import React, { useState, useEffect } from 'react';
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
import { fetchNotifications, fetchSettings, updateProfile } from './api';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [settingsTab, setSettingsTab] = useState('profile');
  const [selectedRequestId, setSelectedRequestId] = useState('REQ-8291');
  const [selectedJobId, setSelectedJobId] = useState('JOB-1024');
  const [unreadCount, setUnreadCount] = useState(5);

  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('serva_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      firstName: 'Anura',
      lastName: 'Perera',
      email: 'anura.perera@itum.mrt.ac.lk',
      phone: '+94 77 123 4567',
      department: 'ITUM Central',
      designation: 'Maintenance Officer',
      avatar: ''
    };
  });

  useEffect(() => {
    async function loadUserProfile() {
      const data = await fetchSettings();
      if (data?.profile) {
        setUserProfile(prev => {
          const saved = localStorage.getItem('serva_user_profile');
          let localData = {};
          if (saved) {
            try { localData = JSON.parse(saved); } catch (e) {}
          }
          return {
            ...prev,
            ...data.profile,
            ...localData
          };
        });
      }
    }
    loadUserProfile();
  }, []);

  const handleUpdateProfile = async (updatedData) => {
    setUserProfile(prev => {
      const merged = { ...prev, ...updatedData };
      try {
        localStorage.setItem('serva_user_profile', JSON.stringify(merged));
      } catch (e) {
        console.warn('LocalStorage save error', e);
      }
      return merged;
    });

    try {
      await updateProfile(updatedData);
    } catch (err) {
      console.warn('API updateProfile error', err);
    }
  };

  useEffect(() => {
    async function getNotifs() {
      const notifs = await fetchNotifications();
      if (notifs) {
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread || 5);
      }
    }
    getNotifs();
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
      case 'labourers': return 'Labourers';
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
        pendingCount={14} 
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
