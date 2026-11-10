import React, { useState, useEffect } from 'react';
import './index.css';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import Footer from './components/Footer';

// Modals
import CreateTeamModal from './components/modals/CreateTeamModal';
import AddUserModal from './components/modals/AddUserModal';
import EditUserModal from './components/modals/EditUserModal';
import ExportReportModal from './components/modals/ExportReportModal';
import SuccessModal from './components/modals/SuccessModal';
import AlertModal from './components/modals/AlertModal';

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
import { getAuthUser } from '../../utils/auth';

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
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    subMessage: '',
    inviteLink: '',
    previewUrl: ''
  });
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: 'Notice',
    message: '',
    type: 'error',
    actionText: 'OK'
  });

  const showSuccessPopup = (title, message, subMessage = '', inviteLink = '', previewUrl = '') => {
    setSuccessModal({
      isOpen: true,
      title,
      message,
      subMessage,
      inviteLink,
      previewUrl
    });
  };

  const showAlertPopup = (title, message = '', type = 'error', actionText = 'OK') => {
    setAlertModal({
      isOpen: true,
      title: title || 'Notice',
      message: message || '',
      type: type || 'error',
      actionText: actionText || 'OK'
    });
  };

  // Intercept standard window.alert calls to display our centered modal instead
  useEffect(() => {
    const origAlert = window.alert;
    window.alert = (msg) => {
      showAlertPopup('Notice', String(msg || ''), 'warning');
    };
    return () => {
      window.alert = origAlert;
    };
  }, []);

  // App-level state
  const [dashboardData, setDashboardData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileAvatar, setProfileAvatar] = useState(() => {
    try {
      const savedRole = localStorage.getItem('serva_user_admin');
      if (savedRole) {
        const u = JSON.parse(savedRole);
        return u.avatar || u.avatarUrl || null;
      }
    } catch (e) { }
    return localStorage.getItem('admin_avatar') || null;
  });
  const [profileData, setProfileData] = useState(() => {
    const auth = getAuthUser();
    if (auth) {
      return {
        id: auth.id,
        firstName: auth.firstName || '',
        lastName: auth.lastName || '',
        email: auth.email || '',
        phone: auth.phone || '',
        division: auth.department || auth.division || 'ITUM Central Administration',
        department: auth.department || auth.division || 'ITUM Central Administration',
        designation: auth.designation || auth.role || 'System Administrator'
      };
    }
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      division: 'ITUM Central Administration',
      department: 'ITUM Central Administration',
      designation: 'System Administrator'
    };
  });

  const handleSaveProfileData = async (newProfile, newAvatar) => {
    setProfileData(newProfile);
    setProfileAvatar(newAvatar);

    try {
      await api.updateProfileSettings({ ...newProfile, avatarUrl: newAvatar || '' });
    } catch (err) {
      console.error("Failed to sync profile with server", err);
    }
  };

  const profileName = `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'Administrator';
  const profileDesignation = profileData.designation || profileData.role || 'System Administrator';
  const getInitials = (fName, lName) => {
    const f = (fName || '').trim()[0] || '';
    const l = (lName || '').trim()[0] || '';
    const inits = (f + l).toUpperCase();
    return inits || (fName ? fName.trim()[0].toUpperCase() : 'A');
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
      if (notifs) {
        const unread = notifs.unreadCount !== undefined
          ? notifs.unreadCount
          : (Array.isArray(notifs.notifications || notifs.data)
              ? (notifs.notifications || notifs.data).filter(n => !n.is_read).length
              : 0);
        setNotificationCount(Number(unread) || 0);
      }
      if (prof && (prof.profile || prof.data || prof.user)) {
        const p = prof.profile || prof.data || prof.user;
        setProfileData(prev => {
          const updated = {
            ...prev,
            ...p,
            firstName: p.firstName !== undefined ? p.firstName : prev.firstName,
            lastName: p.lastName !== undefined ? p.lastName : prev.lastName,
            designation: p.designation || prev.designation || 'System Administrator'
          };
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

    const handleProfileSync = (e) => {
      const detail = e?.detail;
      if (detail && detail.targetRole && detail.targetRole !== 'admin') {
        return; // Ignore updates for other roles
      }
      const u = detail || getAuthUser();
      if (u && (u.role === 'admin' || !detail)) {
        setProfileData(prev => ({
          ...prev,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          division: u.division || u.department || prev.division,
          designation: u.designation || prev.designation
        }));
        if (u.avatar !== undefined || u.avatarUrl !== undefined) {
          setProfileAvatar(u.avatar || u.avatarUrl || null);
        }
      }
    };

    const handleNotifsSync = async (e) => {
      if (e?.detail?.unreadCount !== undefined) {
        setNotificationCount(Number(e.detail.unreadCount));
        return;
      }
      try {
        const notifs = await api.getNotifications();
        if (notifs) {
          const unread = notifs.unreadCount !== undefined
            ? notifs.unreadCount
            : (Array.isArray(notifs.notifications || notifs.data)
                ? (notifs.notifications || notifs.data).filter(n => !n.is_read).length
                : 0);
          setNotificationCount(Number(unread) || 0);
        }
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener('serva:notifs-updated', handleNotifsSync);
    window.addEventListener('serva:profile-updated', handleProfileSync);
    window.addEventListener('serva:auth-change', handleProfileSync);
    window.addEventListener('storage', handleProfileSync);

    const pollInterval = setInterval(() => {
      fetchInitialData();
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('serva:notifs-updated', handleNotifsSync);
      window.removeEventListener('serva:profile-updated', handleProfileSync);
      window.removeEventListener('serva:auth-change', handleProfileSync);
      window.removeEventListener('storage', handleProfileSync);
    };
  }, []);

  // Handlers
  const handleCreateTeam = async (teamData) => {
    try {
      await api.createTeam(teamData);
      showSuccessPopup(
        'Team Created Successfully!',
        `Team "${teamData.name}" created successfully!`,
        'New maintenance team is ready for task assignments.'
      );
      window.dispatchEvent(new Event('serva:teams-updated'));
      fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const res = await api.createUser(userData);
      if (res && res.success === false) {
        const errorTitle = res.message?.toLowerCase().includes('already exists')
          ? 'User Already Exists'
          : 'Action Failed';
        showAlertPopup(errorTitle, res.message || 'Failed to add user.', 'error');
        return { success: false, message: res.message };
      }
      showSuccessPopup(
        'User Added Successfully!',
        `User "${userData.firstName} ${userData.lastName}" added successfully!`,
        userData.sendInvite
          ? `An institutional invitation email with password setup link has been dispatched to ${userData.email}.`
          : 'Official credentials and system access permissions have been assigned.'
      );
      window.dispatchEvent(new Event('serva:users-updated'));
      fetchInitialData();
      return { success: true };
    } catch (err) {
      console.error(err);
      const errMsg = err.message || 'Failed to connect to backend server.';
      showAlertPopup('Connection Error', errMsg, 'error');
      return { success: false, message: errMsg };
    }
  };

  const handleResendInvite = async (id, user) => {
    try {
      const res = await api.resendInvite(id);
      if (res && res.success) {
        showSuccessPopup(
          'Setup Link Dispatched!',
          `Account setup invitation sent to ${user?.email || 'user'}.`,
          'The user will receive an email to configure their username and password.'
        );
      } else {
        showAlertPopup('Invite Dispatch Failed', res?.message || 'Failed to send setup link.', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlertPopup('Dispatch Error', 'Error sending setup link: ' + (err.message || err), 'error');
    }
  };

  const handleEditUser = (user) => {
    setSelectedUserForEdit(user);
    setIsEditUserOpen(true);
  };

  const handleSaveUser = async (id, updatedData) => {
    try {
      await api.updateUser(id, updatedData);
      showSuccessPopup(
        'User Details Updated!',
        'User details updated successfully!',
        'Institutional user records have been successfully updated.'
      );
      window.dispatchEvent(new Event('serva:users-updated'));
      fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeactivateUser = async (id) => {
    try {
      await api.deactivateUser(id);
      showSuccessPopup(
        'User Deactivated',
        'User account has been deactivated.',
        'System access permissions have been temporarily disabled.'
      );
      window.dispatchEvent(new Event('serva:users-updated'));
      fetchInitialData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await api.deleteUser(id);
      if (res && res.success !== false) {
        window.dispatchEvent(new Event('serva:users-updated'));
        fetchInitialData();
        return { success: true, message: "User account permanently deleted and removed from system." };
      } else {
        return { success: false, message: res?.message || "Failed to delete user." };
      }
    } catch (err) {
      console.error(err);
      return { success: false, message: "Error deleting user: " + (err.message || err) };
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
    <div className="h-screen w-full flex overflow-hidden bg-white text-[#241919]">
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
        profileDesignation={profileDesignation}
        profileInitials={profileInitials}
      />

      {/* Main Content Area (Independent scroll) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-white">
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
          profileDesignation={profileDesignation}
          profileEmail={profileData.email}
          profileInitials={profileInitials}
        />

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 w-full bg-white overflow-y-auto overflow-x-hidden">
          {activePage === 'dashboard' && (
            <Dashboard
              onNavigate={(page) => setActivePage(page)}
              onOpenAddUser={() => setIsAddUserOpen(true)}
              onOpenExportReport={() => setIsExportReportOpen(true)}
              dashboardData={dashboardData}
              profileData={profileData}
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
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activePage === 'reports' && (
            <Reports onOpenExportModal={() => setIsExportReportOpen(true)} />
          )}

          {activePage === 'notifications' && (
            <Notifications
              globalSearch={globalSearch}
              onNavigateToSettings={handleNavigateToSettings}
              setActivePage={setActivePage}
              setSelectedJobId={setSelectedJobId}
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

      {isAddUserOpen && (
        <AddUserModal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          onAddUser={handleAddUser}
        />
      )}

      {isEditUserOpen && selectedUserForEdit && (
        <EditUserModal
          isOpen={isEditUserOpen}
          onClose={() => {
            setIsEditUserOpen(false);
            setSelectedUserForEdit(null);
          }}
          user={selectedUserForEdit}
          onSave={handleSaveUser}
          onDeactivate={handleDeactivateUser}
          onDelete={handleDeleteUser}
          onResendInvite={handleResendInvite}
        />
      )}

      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
        onExport={handleExportReport}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
        subMessage={successModal.subMessage}
        inviteLink={successModal.inviteLink}
        previewUrl={successModal.previewUrl}
      />

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal((prev) => ({ ...prev, isOpen: false }))}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        actionText={alertModal.actionText}
      />
    </div>
  );
}
