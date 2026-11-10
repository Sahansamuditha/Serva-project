import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Footer from './components/Footer';

// Modals
import CreateTeamModal from './components/modals/CreateTeamModal';
import AddUserModal from './components/modals/AddUserModal';
import EditUserModal from './components/modals/EditUserModal';
import ExportReportModal from './components/modals/ExportReportModal';

// Pages
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Labourers from './pages/Labourers';
import TeamAnalytics from './pages/TeamAnalytics';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';

import { api } from './services/api';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [settingsSubTab, setSettingsSubTab] = useState('profile');
  const [selectedJobId, setSelectedJobId] = useState('#JOB-1024');
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals state
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);

  // App-level state
  const [dashboardData, setDashboardData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(5);
  const [profileAvatar, setProfileAvatar] = useState(() => {
    return localStorage.getItem('admin_avatar') || null;
  });
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('admin_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { }
    }
    return {
      firstName: 'Anura',
      lastName: 'Perera',
      email: 'anura.perera@itum.mrt.ac.lk',
      phone: '+94 77 123 4567',
      division: 'ITUM Central',
      designation: 'Admin'
    };
  });

  const handleSaveProfileData = async (newProfile, newAvatar) => {
    setProfileData(newProfile);
    localStorage.setItem('admin_profile', JSON.stringify(newProfile));

    setProfileAvatar(newAvatar);
    if (newAvatar) {
      localStorage.setItem('admin_avatar', newAvatar);
    } else {
      localStorage.removeItem('admin_avatar');
    }

    try {
      await api.updateProfileSettings({ ...newProfile, avatarUrl: newAvatar || '' });
    } catch (err) {
      console.error("Failed to sync profile with server", err);
    }
  };

  const profileName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'Admin';
  const getInitials = (fName, lName) => {
    const f = (fName || '').trim()[0] || '';
    const l = (lName || '').trim()[0] || '';
    return (f + l).toUpperCase() || 'AD';
  };
  const profileInitials = getInitials(profileData.firstName, profileData.lastName);

  const fetchInitialData = async () => {
    try {
      const [dash, notifs, prof] = await Promise.all([
        api.getDashboard(),
        api.getNotifications(),
        api.getProfileSettings()
      ]);
      if (dash) setDashboardData(dash);
      if (notifs) setNotificationCount(notifs.unreadCount || 5);
      if (prof) {
        if (prof.avatarUrl) {
          setProfileAvatar(prof.avatarUrl);
          localStorage.setItem('admin_avatar', prof.avatarUrl);
        }
        setProfileData((prev) => {
          const updated = { ...prev, ...prof };
          localStorage.setItem('admin_profile', JSON.stringify(updated));
          return updated;
        });
      }
    } catch (err) {
      console.error("API error, using local state", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Handlers
  const handleCreateTeam = async (teamData) => {
    try {
      await api.createTeam(teamData);
      alert(`Team "${teamData.name}" created successfully!`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      await api.createUser(userData);
      alert(`User "${userData.firstName} ${userData.lastName}" added successfully!`);
      fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUserForEdit(user);
    setIsEditUserOpen(true);
  };

  const handleSaveUser = async (id, updatedData) => {
    try {
      await api.updateUser(id, updatedData);
      alert("User details updated successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivateUser = async (id) => {
    try {
      await api.deactivateUser(id);
      alert("User account has been deactivated.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleExportReport = async (exportData) => {
    try {
      await api.exportReport(exportData);
      alert(`Exporting ${exportData.reportType} as ${exportData.format}...`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobId(jobId);
    setActivePage('job-detail');
  };

  const handleNavigateToSettings = (subTab) => {
    setSettingsSubTab(subTab);
    setActivePage('settings');
  };

  const getPageTitle = () => {
    switch (activePage) {
      case 'dashboard':
        return 'Dashboard';
      case 'requests':
        return 'Dashboard';
      case 'jobs':
        return 'Jobs';
      case 'job-detail':
        return 'Jobs';
      case 'labourers':
        return 'Laborers';
      case 'labourers-analytics':
        return 'Labourers';
      case 'users':
        return 'Users';
      case 'reports':
        return 'Reports';
      case 'notifications':
        return 'Notifications';
      case 'settings':
        return 'Settings';
      default:
        return 'Dashboard';
    }
  };

  const getPageSubtitle = () => {
    if (activePage === 'users') return 'Access Control';
    return null;
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white text-[#241919]">
      {/* Persistent Left Sidebar (Fixed & Non-scrolling) */}
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => {
          if (page === 'settings') setSettingsSubTab('profile');
          setActivePage(page);
        }}
        notificationCount={notificationCount}
        profileAvatar={profileAvatar}
        profileName={profileName}
        profileInitials={profileInitials}
      />

      {/* Main Content Area (Independent scroll) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden bg-white">
        {/* Top Navbar */}
        <TopNavbar
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          globalSearch={globalSearch}
          onSearch={(val) => setGlobalSearch(val)}
          onSelectJob={handleSelectJob}
          onNavigate={(page) => setActivePage(page)}
          notificationCount={notificationCount}
          onNotificationClick={() => setActivePage('notifications')}
          onProfileClick={(tab) => handleNavigateToSettings(tab)}
          profileAvatar={profileAvatar}
          profileName={profileName}
          profileEmail={profileData.email}
          profileInitials={profileInitials}
        />

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 w-full bg-white">
          {activePage === 'dashboard' && (
            <Dashboard
              onNavigate={(page) => setActivePage(page)}
              onOpenAddUser={() => setIsAddUserOpen(true)}
              onOpenExportReport={() => setIsExportReportOpen(true)}
              dashboardData={dashboardData}
            />
          )}

          {activePage === 'jobs' && (
            <Jobs onSelectJob={handleSelectJob} globalSearch={globalSearch} />
          )}

          {activePage === 'job-detail' && (
            <JobDetail jobId={selectedJobId} onBack={() => setActivePage('jobs')} />
          )}

          {activePage === 'labourers' && (
            <Labourers
              onOpenCreateTeam={() => setIsCreateTeamOpen(true)}
              onViewAnalytics={() => setActivePage('labourers-analytics')}
            />
          )}

          {activePage === 'labourers-analytics' && (
            <TeamAnalytics onBack={() => setActivePage('labourers')} />
          )}

          {activePage === 'users' && (
            <Users
              onOpenAddUser={() => setIsAddUserOpen(true)}
              onOpenEditUser={handleEditUser}
            />
          )}

          {activePage === 'reports' && (
            <Reports onOpenExportModal={() => setIsExportReportOpen(true)} />
          )}

          {activePage === 'notifications' && (
            <Notifications
              globalSearch={globalSearch}
              onNavigateToSettings={handleNavigateToSettings}
            />
          )}

          {activePage === 'settings' && (
            <Settings
              initialSubTab={settingsSubTab}
              onSubTabChange={(tab) => setSettingsSubTab(tab)}
              profileAvatar={profileAvatar}
              profileData={profileData}
              onSaveProfileData={handleSaveProfileData}
            />
          )}

          {/* Footer */}
          <Footer />
        </main>
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        onCreateTeam={handleCreateTeam}
      />

      <AddUserModal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onAddUser={handleAddUser}
      />

      <EditUserModal
        isOpen={isEditUserOpen}
        onClose={() => setIsEditUserOpen(false)}
        user={selectedUserForEdit}
        onSave={handleSaveUser}
        onDeactivate={handleDeactivateUser}
      />

      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        onExport={handleExportReport}
      />
    </div>
  );
}
