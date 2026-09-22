import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import TopHeader from './components/common/TopHeader';

import { UserProvider } from './context/UserContext';

// Pages
import DashboardPage from './pages/DashboardPage';
import RequestsPage from './pages/RequestsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <div className="app-layout">
        {/* Persistent Deep Maroon Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="main-wrapper">
          <TopHeader />
          <main>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<Navigate to="/" replace />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings/*" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
    </UserProvider>
  );
}
