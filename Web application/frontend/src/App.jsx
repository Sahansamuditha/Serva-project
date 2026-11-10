import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import SetupAccount from './pages/SetupAccount';
import AdminApp from './portals/Admin/App';
import DirectorApp from './portals/Director/App';
import MaintainOfficerApp from './portals/MaintainOfficer/App';
import RequesterApp from './portals/Requester/App';
import { getAuthUser, triggerLogout, setAuthSession, getAuthToken } from './utils/auth';
import FirstLoginPasswordModal from './components/FirstLoginPasswordModal';

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getAuthUser());

  const getSetupToken = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token') || searchParams.get('setup_token') || searchParams.get('invite');
      if (token) return token;
      if (window.location.hash) {
        const hashStr = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
        const hashParams = new URLSearchParams(hashStr);
        return hashParams.get('token') || hashParams.get('setup_token') || null;
      }
    } catch (e) {}
    return null;
  };

  const setupToken = getSetupToken();

  useEffect(() => {
    const handleLogout = () => {
      setCurrentUser(null);
    };

    const handleAuthChange = () => {
      setCurrentUser(getAuthUser());
    };

    window.addEventListener('serva:logout', handleLogout);
    window.addEventListener('serva:auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('serva:logout', handleLogout);
      window.removeEventListener('serva:auth-change', handleAuthChange);
    };
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
  };

  const handlePasswordChangeSuccess = (updatedUser) => {
    const freshUser = { ...currentUser, ...updatedUser, mustChangePassword: false };
    setCurrentUser(freshUser);
    setAuthSession(freshUser, getAuthToken());
  };

  // If visiting via setup invitation link, render SetupAccount
  if (setupToken) {
    return <SetupAccount token={setupToken} onLoginSuccess={handleLoginSuccess} />;
  }

  // If not authenticated, show the Login Page matching screen.png
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const getNormalizedRole = (role) => {
    if (!role) return 'requester';
    const r = role.toLowerCase();
    if (r === 'admin' || r.includes('admin')) return 'admin';
    if (r === 'director' || r.includes('director')) return 'director';
    if (r === 'maintenance_officer' || r.includes('maintenance') || r.includes('officer') || r.includes('supervisor')) return 'maintenance_officer';
    return 'requester';
  };

  const portalRole = getNormalizedRole(currentUser.role);

  // If authenticated, render the corresponding portal
  return (
    <div className="relative min-h-screen w-full">
      {/* First-Time Login Password Change Popup Modal */}
      {currentUser?.mustChangePassword && (
        <FirstLoginPasswordModal
          user={currentUser}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}

      {/* Role-based Active Portal wrapped in ErrorBoundary */}
      <div className="w-full min-h-screen">
        <ErrorBoundary>
          {portalRole === 'admin' && (
            <AdminApp key="admin-portal" />
          )}

          {portalRole === 'director' && (
            <DirectorApp key="director-portal" />
          )}

          {portalRole === 'maintenance_officer' && (
            <MaintainOfficerApp key="maintain-officer-portal" />
          )}

          {portalRole === 'requester' && (
            <RequesterApp key="requester-portal" />
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
