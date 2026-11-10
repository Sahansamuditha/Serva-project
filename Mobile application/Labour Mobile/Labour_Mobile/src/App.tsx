import { useState, useEffect, useCallback } from 'react';
import {
  initialLaborerProfile,
  initialWorkOrders,
  initialAlertNotices,
  initialWorkHistory,
  initialCampusZones,
  initialSystemLogs,
} from './services/mockData';
import { WorkOrder, WorkOrderStatus, AlertNotice, LaborerProfile } from './types';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { JobsScreen } from './screens/JobsScreen';
import { JobDetailsScreen } from './screens/JobDetailsScreen';
import { AlertsScreen } from './screens/AlertsScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { RegionSettingsScreen } from './screens/RegionSettingsScreen';
import { SystemLogsScreen } from './screens/SystemLogsScreen';
import { EditProfileScreen } from './screens/EditProfileScreen';
import { SecuritySettingsScreen } from './screens/SecuritySettingsScreen';
import { LabourerSettingsScreen } from './screens/LabourerSettingsScreen';
import { LoginScreen, UserRole } from './screens/LoginScreen';
import { OfficerAppView } from './components/common/OfficerAppView';
import { AvatarPickerModal } from './components/common/AvatarPickerModal';
import { CallDialogModal } from './components/common/CallDialogModal';
import { FirstLoginPasswordModal } from './components/common/FirstLoginPasswordModal';
import { CallDetails, subscribeToCallEvents } from './services/callService';
import { getTranslation } from './services/i18n';

export type DevicePreset = 'universal' | 'android' | 'ios';
type FinishType = 'desert' | 'natural' | 'space' | 'white';

export function App() {
  // Always start unauthenticated so the Login Page displays immediately whenever the project runs
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const [currentTab, setCurrentTab] = useState<string>('jobs');
  const [activeSubscreen, setActiveSubscreen] = useState<string | null>(null);

  const [laborerProfile, setLaborerProfile] = useState<LaborerProfile>(initialLaborerProfile);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [alerts, setAlerts] = useState<AlertNotice[]>(initialAlertNotices);
  const [workHistory] = useState(initialWorkHistory);
  const [campusZones] = useState(initialCampusZones);
  const [systemLogs] = useState(initialSystemLogs);

  // Global Call Manager State
  const [activeCallDetails, setActiveCallDetails] = useState<CallDetails | null>(null);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);

  useEffect(() => {
    // When the project runs, purge any stale session so login page always displays first
    try {
      localStorage.removeItem('serva_mobile_user');
      localStorage.removeItem('serva_mobile_token');
    } catch (e) { }

    const unsubscribe = subscribeToCallEvents((details) => {
      setActiveCallDetails(details);
      setIsCallModalOpen(true);
    });
    return unsubscribe;
  }, []);

  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [devicePreset, setDevicePreset] = useState<DevicePreset>('universal');
  const [deviceFinish, setDeviceFinish] = useState<FinishType>('desert');
  const [showFrame, setShowFrame] = useState<boolean>(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState<boolean>(false);

  // Detect mobile viewport (on actual phones, auto-render edge-to-edge)
  const [isMobileScreen, setIsMobileScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 640);
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync Supervisor Profile with Database & Local Session
  useEffect(() => {
    // 1. Check local storage first
    try {
      const stored = localStorage.getItem('serva_mobile_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.first_name || u.firstName || u.name)) {
          const fullName = u.name || `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim();
          setCurrentUser(u);
          setLaborerProfile(prev => ({
            ...prev,
            name: fullName || 'Supervisor',
            email: u.email || '',
            phone: u.phone || '',
            employeeId: u.id ? `EMP-S${u.id}` : 'EMP-S826',
            title: u.designation || u.role || 'Supervisor',
            division: u.department || 'ITUM Central Administration',
            totalJobs: 0,
            satisfactionRating: 5.0,
          }));
        }
      }
    } catch (e) { }

    // 2. Fetch latest Supervisor created by Admin from database
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        const users = data.users || data.data || (Array.isArray(data) ? data : []);
        const stored = localStorage.getItem('serva_mobile_user');
        const currentSaved = stored ? JSON.parse(stored) : null;

        let matchingUser = null;
        if (currentSaved?.id) {
          matchingUser = users.find((u: any) => u.id === currentSaved.id);
        } else if (currentSaved?.email) {
          matchingUser = users.find((u: any) => (u.email || '').toLowerCase() === currentSaved.email.toLowerCase());
        }

        const supervisor = matchingUser || [...users].reverse().find(
          (u: any) => (u.role && u.role.toLowerCase() === 'supervisor') ||
            (u.designation && u.designation.toLowerCase() === 'supervisor')
        );
        if (supervisor) {
          const fullName = `${supervisor.first_name || ''} ${supervisor.last_name || ''}`.trim() || supervisor.name || 'Supervisor';
          const mustChange = Boolean(supervisor.must_change_password);

          setCurrentUser((prev: any) => {
            const updated = {
              ...(prev || {}),
              ...supervisor,
              mustChangePassword: mustChange,
              must_change_password: supervisor.must_change_password
            };
            try {
              localStorage.setItem('serva_mobile_user', JSON.stringify(updated));
            } catch (err) { }
            return updated;
          });

          setLaborerProfile(prev => ({
            ...prev,
            name: fullName,
            email: supervisor.email || '',
            phone: supervisor.phone || '',
            employeeId: supervisor.id ? `EMP-S${supervisor.id}` : 'EMP-S826',
            title: supervisor.designation || supervisor.role || 'Supervisor',
            division: supervisor.department || 'ITUM Central Administration',
            totalJobs: 0,
            satisfactionRating: 5.0,
          }));
        }
      })
      .catch(err => console.warn('Could not sync supervisor from backend:', err));
  }, []);

  // Fetch real jobs from backend database
  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        const jobsList = data.data || data.jobs || (Array.isArray(data) ? data : []);
        if (Array.isArray(jobsList) && jobsList.length > 0) {
          const mapped: WorkOrder[] = jobsList.map((j: any) => {
            // Parse request_images if present (can be Array or JSON string)
            let parsedImages: Array<{ url: string; name?: string; size?: string }> = [];
            if (Array.isArray(j.request_images)) {
              parsedImages = j.request_images;
            } else if (typeof j.request_images === 'string' && j.request_images.trim().startsWith('[')) {
              try {
                parsedImages = JSON.parse(j.request_images);
              } catch (e) {}
            } else if (j.request_images && typeof j.request_images === 'object') {
              parsedImages = [j.request_images];
            }

            // Fallback to single photo fields if available
            const firstPhotoUrl = parsedImages[0]?.url || j.reported_photo || j.evidence_photo || j.photo_url || '';

            return {
              id: j.request_id || j.id,
              jobCode: j.id,
              title: j.title || 'Maintenance Task',
              category: j.category || 'General',
              description: (j.description || j.request_description || (j.notes && !j.notes.includes('Assigned by Maintenance Officer') ? j.notes : '') || '').trim(),
              department: j.department || 'Central Maintenance',
              location: j.location || 'Main Campus',
              subLocation: j.location,
              priority: (j.priority || 'Medium').toUpperCase() as any,
              status: j.status as any,
              assignedTime: j.start_date ? new Date(j.start_date).toLocaleDateString() : 'Today',
              dueTime: j.due_date ? new Date(j.due_date).toLocaleDateString() : 'Today',
              requesterName: j.requester || 'Requester',
              requesterDept: j.requester_dept || 'Administration',
              requesterExt: '',
              technicianRemarks: (j.notes && !j.notes.includes('Assigned by Maintenance Officer') ? j.notes : ''),
              proofPhotoUrl: j.proof_photo || '',
              reportedPhotoUrl: firstPhotoUrl,
              reportedPhotos: parsedImages.length > 0 ? parsedImages : (firstPhotoUrl ? [{ url: firstPhotoUrl, name: 'Reported Evidence' }] : []),
              reportedPhotoTimestamp: j.created_at ? new Date(j.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : undefined,
            };
          });
          setWorkOrders(mapped);
          setLaborerProfile(prev => ({
            ...prev,
            totalJobs: mapped.filter(m => m.status === 'Completed' || m.status === 'Signed Off').length
          }));
        } else {
          setWorkOrders([]);
          setLaborerProfile(prev => ({ ...prev, totalJobs: 0 }));
        }
      })
      .catch(err => {
        console.warn('Could not fetch jobs:', err);
        setWorkOrders([]);
      });
  }, [isAuthenticated, userRole]);

  // Fetch real notifications / alerts for supervisor from backend database
  const fetchAlerts = useCallback(() => {
    const processData = (data: any) => {
      const notifs = data.data || data.notifications || (Array.isArray(data) ? data : []);
      if (Array.isArray(notifs) && notifs.length > 0) {
        const mapped: AlertNotice[] = notifs.map((n: any) => {
          const titleLower = (n.title || '').toLowerCase();
          const isHazard = n.type === 'hazard' || n.type === 'critical' || n.type === 'warning' || titleLower.includes('hold') || titleLower.includes('hazard') || titleLower.includes('reject');
          const isComplete = n.type === 'success' || titleLower.includes('completed');
          const isDispatch = !isHazard && !isComplete;

          // Extract request/job ID like #REQ-1234 or #JOB-1234
          const textToSearch = `${n.title || ''} ${n.message || ''} ${n.link || ''}`;
          const reqMatch = textToSearch.match(/(REQ-\d+|JOB-\d+)/i);
          const reqNumber = reqMatch ? `#${reqMatch[1].toUpperCase()}` : undefined;

          // Format timestamp
          let timeAgo = 'Just now';
          if (n.created_at) {
            const diffMs = Date.now() - new Date(n.created_at).getTime();
            const diffMin = Math.floor(diffMs / 60000);
            if (diffMin < 1) timeAgo = 'Just now';
            else if (diffMin < 60) timeAgo = `${diffMin}m ago`;
            else {
              const diffHours = Math.floor(diffMin / 60);
              if (diffHours < 24) timeAgo = `${diffHours}h ago`;
              else timeAgo = `${Math.floor(diffHours / 24)}d ago`;
            }
          }

          return {
            id: String(n.id),
            title: n.title || 'Notification',
            description: n.message || '',
            category: isHazard ? 'hazard' : isDispatch ? 'dispatch' : 'system',
            severity: n.type === 'critical' ? 'CRITICAL' : isHazard ? 'HIGH' : 'INFO',
            timestamp: timeAgo,
            reqNumber,
            isRead: Boolean(n.is_read),
            actionType: 'open_ticket',
          };
        });
        setAlerts(mapped);
      }
    };

    fetch('/api/notifications?role=supervisor')
      .then(res => {
        if (!res.ok) throw new Error('Status ' + res.status);
        return res.json();
      })
      .then(data => processData(data))
      .catch(() => {
        fetch('http://localhost:5000/api/notifications?role=supervisor')
          .then(res => res.json())
          .then(data => processData(data))
          .catch(err => console.warn('Could not fetch alerts:', err));
      });
  }, []);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  // Unread alerts count for bottom nav badge
  const unreadAlertsCount = alerts.filter((a) => !a.isRead).length;

  // Header Title Resolver
  const getScreenTitle = () => {
    const t = getTranslation(laborerProfile.language);
    if (selectedWorkOrder) return `Job ${selectedWorkOrder.id}`;
    if (activeSubscreen === 'edit_profile') return t.profileTitle;
    if (activeSubscreen === 'region_settings') return t.regionTitle;
    if (activeSubscreen === 'system_logs') return t.systemLogs;
    if (activeSubscreen === 'system_hub') return t.profileTitle;

    switch (currentTab) {
      case 'jobs':
        return t.navJobs;
      case 'alerts':
        return t.navAlerts;
      case 'history':
        return t.navHistory;
      case 'profile':
        return t.navProfile;
      default:
        return t.navProfile;
    }
  };

  // Work Order Status Updater Handler
  const handleUpdateWorkOrderStatus = (
    id: string,
    newStatus: WorkOrderStatus,
    remarks?: string,
    proofPhotoUrl?: string
  ) => {
    setWorkOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id === id) {
          return {
            ...order,
            status: newStatus,
            technicianRemarks: remarks || order.technicianRemarks,
            proofPhotoUrl: proofPhotoUrl || order.proofPhotoUrl,
          };
        }
        return order;
      })
    );

    if (selectedWorkOrder && selectedWorkOrder.id === id) {
      setSelectedWorkOrder((prev) =>
        prev
          ? {
            ...prev,
            status: newStatus,
            technicianRemarks: remarks || prev.technicianRemarks,
            proofPhotoUrl: proofPhotoUrl || prev.proofPhotoUrl,
          }
          : null
      );
    }

    // Persist real status update to backend database
    const order = workOrders.find((w) => w.id === id);
    const targetJobId = order?.jobCode || id;
    fetch(`/api/jobs/${targetJobId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        progress: newStatus === 'Completed' || newStatus === 'Signed Off' ? 100 : newStatus === 'In Progress' ? 50 : 0,
        notes: remarks || '',
        proof_photo: proofPhotoUrl || null
      })
    }).catch(e => console.warn('Job PATCH error:', e));

    fetch(`/api/requests/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: newStatus,
        action: newStatus === 'Completed' ? 'complete' : newStatus === 'In Progress' ? 'progress' : newStatus === 'On Hold' ? 'hold' : newStatus === 'Rejected' ? 'labourer_reject' : 'accept',
        notes: remarks || '',
        proof_photo: proofPhotoUrl || null
      })
    }).catch(e => console.warn('Request action error:', e));

    setTimeout(() => {
      fetchAlerts();
    }, 450);
  };

  // Start Job Quick Trigger
  const handleStartJob = (order: WorkOrder) => {
    handleUpdateWorkOrderStatus(order.id, 'In Progress');
    setSelectedWorkOrder({ ...order, status: 'In Progress' });
  };

  // Select Order for Details View
  const handleSelectOrder = (order: WorkOrder) => {
    setSelectedWorkOrder(order);
  };

  // Alert Handlers
  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    fetch(`/api/notifications/${alertId}`, { method: 'DELETE' })
      .catch(() => {
        fetch(`http://localhost:5000/api/notifications/${alertId}`, { method: 'DELETE' }).catch(e => console.warn(e));
      });
  };

  const handleMarkAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    fetch('/api/notifications/mark-all-read?role=supervisor', { method: 'POST' })
      .catch(() => {
        fetch('http://localhost:5000/api/notifications/mark-all-read?role=supervisor', { method: 'POST' }).catch(e => console.warn(e));
      });
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
    fetch(`/api/notifications/${alertId}/read`, { method: 'POST' })
      .catch(() => {
        fetch(`http://localhost:5000/api/notifications/${alertId}/read`, { method: 'POST' }).catch(e => console.warn(e));
      });
  };

  const handleToggleReadAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: !a.isRead } : a))
    );
    fetch(`/api/notifications/${alertId}/read`, { method: 'POST' })
      .catch(() => {
        fetch(`http://localhost:5000/api/notifications/${alertId}/read`, { method: 'POST' }).catch(e => console.warn(e));
      });
  };

  const handleNavigateToJob = (reqNumber?: string) => {
    if (reqNumber) {
      const target = workOrders.find((w) => w.id === reqNumber || `#${w.id}` === reqNumber);
      if (target) {
        setSelectedWorkOrder(target);
        return;
      }
    }
    // Fallback to first available active job if any
    const activeJob = workOrders.length > 0 ? workOrders[0] : null;
    setSelectedWorkOrder(activeJob);
  };

  // Tab Selection Handler resets subscreen states
  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setSelectedWorkOrder(null);
    setActiveSubscreen(null);
  };

  // Unified Navigation Handler for Tabs & Subscreens
  const handleNavigate = (screen: string) => {
    if (['edit_profile', 'region_settings', 'system_logs', 'system_hub', 'security_settings'].includes(screen) || screen.startsWith('settings')) {
      setActiveSubscreen(screen);
      setSelectedWorkOrder(null);
    } else {
      setCurrentTab(screen);
      setSelectedWorkOrder(null);
      setActiveSubscreen(null);
    }
  };

  // Finish Gradient mapping for iOS simulator
  const finishStyles: Record<FinishType, { border: string; bg: string; button: string }> = {
    desert: {
      border: 'border-[#6e5d4d]/60',
      bg: 'bg-gradient-to-b from-[#594b3e] via-[#241e18] to-[#42372c]',
      button: 'bg-[#6b5a4b]',
    },
    natural: {
      border: 'border-[#5a5763]/60',
      bg: 'bg-gradient-to-b from-[#403e47] via-[#1d1c21] to-[#33313b]',
      button: 'bg-[#55535e]',
    },
    space: {
      border: 'border-[#38363f]/60',
      bg: 'bg-gradient-to-b from-[#28272e] via-[#100f13] to-[#1e1d24]',
      button: 'bg-[#3b3a42]',
    },
    white: {
      border: 'border-[#8e8c96]/60',
      bg: 'bg-gradient-to-b from-[#75737c] via-[#2f2e35] to-[#585660]',
      button: 'bg-[#84828c]',
    },
  };

  const currentFinish = finishStyles[deviceFinish];

  // Core App Views Router (renders identically across all phone formats)
  const renderAppContent = (preset: DevicePreset) => {
    // 1. Unauthenticated -> Show Login Screen (from log in page.png)
    if (!isAuthenticated || !userRole) {
      return (
        <LoginScreen
          onLogin={(role, email, userObj) => {
            setIsAuthenticated(true);
            setUserRole(role);
            setUserEmail(email);
            if (userObj) {
              setCurrentUser(userObj);
              const fullName = userObj.name || `${userObj.firstName || userObj.first_name || ''} ${userObj.lastName || userObj.last_name || ''}`.trim();
              setLaborerProfile(prev => ({
                ...prev,
                name: fullName || prev.name,
                title: userObj.designation || userObj.role || 'Supervisor',
                division: userObj.department || prev.division,
                email: userObj.email || prev.email,
                phone: userObj.phone || prev.phone
              }));
            }
            setCurrentTab('jobs');
            setActiveSubscreen(null);
            setSelectedWorkOrder(null);
          }}
          devicePreset={preset}
        />
      );
    }

    // 2. First-Time Mandatory Password Change (Fills the Phone Screen!)
    if (currentUser && (currentUser.mustChangePassword === true || currentUser.must_change_password === 1)) {
      return (
        <FirstLoginPasswordModal
          isOpen={true}
          user={currentUser}
          devicePreset={preset}
          onSuccess={(updatedUser) => {
            setCurrentUser((prev: any) => ({
              ...prev,
              ...updatedUser,
              mustChangePassword: false,
              must_change_password: 0
            }));
            try {
              const existing = localStorage.getItem('serva_mobile_user');
              const parsed = existing ? JSON.parse(existing) : {};
              localStorage.setItem(
                'serva_mobile_user',
                JSON.stringify({ ...parsed, ...updatedUser, mustChangePassword: false, must_change_password: 0 })
              );
            } catch (e) { }
          }}
          onSignOut={() => {
            setIsAuthenticated(false);
            setUserRole(null);
            setCurrentUser(null);
            try {
              localStorage.removeItem('serva_mobile_user');
              localStorage.removeItem('serva_mobile_token');
            } catch (e) { }
            setCurrentTab('jobs');
            setActiveSubscreen(null);
            setSelectedWorkOrder(null);
          }}
        />
      );
    }

    // 3. Authenticated as Maintenance Officer -> Show Maintenance Officer Mobile App
    if (userRole === 'officer') {
      return (
        <OfficerAppView
          onLogout={() => {
            setIsAuthenticated(false);
            setUserRole(null);
            setCurrentTab('jobs');
            setActiveSubscreen(null);
            setSelectedWorkOrder(null);
          }}
          onSwitchRole={() => {
            setUserRole('labourer');
            setCurrentTab('jobs');
            setActiveSubscreen(null);
            setSelectedWorkOrder(null);
          }}
        />
      );
    }

    const isSettingsSubscreen = Boolean(
      activeSubscreen?.startsWith('settings') ||
      activeSubscreen === 'edit_profile' ||
      activeSubscreen === 'region_settings' ||
      activeSubscreen === 'system_logs' ||
      activeSubscreen === 'security_settings'
    );

    // 3. Authenticated as Labourer -> Show Labourer Mobile App
    return (
      <>
        {/* App Screen Header Bar (Hidden on settings subscreen to avoid duplicate header, matching Screenshot 1) */}
        {!isSettingsSubscreen && (
          <Header
            title={getScreenTitle()}
            activeScreen={currentTab}
            onNavigate={handleNavigate}
            alerts={alerts}
            onMarkAllAlertsRead={handleMarkAllAlertsRead}
            avatarUrl={laborerProfile.avatarUrl}
            userName={laborerProfile.name}
            employeeId={`${laborerProfile.employeeId} • ${laborerProfile.workshopBase}`}
            isProfileMenuOpen={isProfileMenuOpen}
            onToggleProfileMenu={setIsProfileMenuOpen}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearchOpen={isSearchOpen}
            onToggleSearch={setIsSearchOpen}
            onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
            devicePreset={preset}
            onSignOut={() => {
              setIsAuthenticated(false);
              setUserRole(null);
              setCurrentUser(null);
              try {
                localStorage.removeItem('serva_mobile_user');
                localStorage.removeItem('serva_mobile_token');
              } catch (e) { }
              setCurrentTab('jobs');
              setActiveSubscreen(null);
              setSelectedWorkOrder(null);
            }}
          />
        )}

        {/* Main Body View Router */}
        <main className={`flex-1 overflow-y-auto no-scrollbar pb-24 relative ${isSettingsSubscreen ? 'px-0 pt-0' : 'px-4 pt-1'}`}>
          {/* 1. Subscreen Router */}
          {selectedWorkOrder ? (
            <JobDetailsScreen
              order={selectedWorkOrder}
              onBack={() => setSelectedWorkOrder(null)}
              onUpdateStatus={handleUpdateWorkOrderStatus}
            />
          ) : (activeSubscreen?.startsWith('settings') || activeSubscreen === 'edit_profile' || activeSubscreen === 'system_logs' || activeSubscreen === 'security_settings') ? (
            <LabourerSettingsScreen
              initialTab={
                activeSubscreen === 'settings_notifications'
                  ? 'notifications'
                  : (activeSubscreen === 'settings_security' || activeSubscreen === 'security_settings')
                    ? 'security'
                    : (activeSubscreen === 'settings_logs' || activeSubscreen === 'system_logs')
                      ? 'logs'
                      : 'profile'
              }
              profile={laborerProfile}
              onSaveProfile={(updated) => {
                setLaborerProfile((prev) => ({ ...prev, ...updated }));
              }}
              onBack={() => setActiveSubscreen(null)}
              onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
              campusZones={campusZones}
              systemLogs={systemLogs}
              onUpdateLanguage={(lang) =>
                setLaborerProfile((prev) => ({ ...prev, language: lang }))
              }
            />
          ) : activeSubscreen === 'system_hub' ? (
            <ProfileScreen
              profile={laborerProfile}
              onUpdateProfile={(up) =>
                setLaborerProfile((prev) => ({ ...prev, ...up }))
              }
              onNavigateSubscreen={(sub) => setActiveSubscreen(sub)}
              onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
            />
          ) : (
            /* 2. Main Tab Router */
            <>
              {currentTab === 'jobs' && (
                <JobsScreen
                  workOrders={workOrders}
                  onSelectOrder={handleSelectOrder}
                  onStartJob={handleStartJob}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                  workerProfile={laborerProfile}
                  onNavigateProfile={() => handleNavigate('profile')}
                />
              )}

              {currentTab === 'alerts' && (
                <AlertsScreen
                  alerts={alerts}
                  onDismissAlert={handleDismissAlert}
                  onMarkAllRead={handleMarkAllAlertsRead}
                  onAcknowledgeAlert={handleAcknowledgeAlert}
                  onToggleRead={handleToggleReadAlert}
                  onNavigateToJob={handleNavigateToJob}
                  searchQuery={searchQuery}
                  onClearSearch={() => setSearchQuery('')}
                />
              )}

              {currentTab === 'history' && (
                <HistoryScreen
                  historyLogs={workHistory}
                  workOrders={workOrders}
                  onSelectOrder={handleSelectOrder}
                  profile={laborerProfile}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileScreen
                  profile={laborerProfile}
                  onUpdateProfile={(up) =>
                    setLaborerProfile((prev) => ({ ...prev, ...up }))
                  }
                  onNavigateSubscreen={(sub) => setActiveSubscreen(sub)}
                  onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
                  onSignOut={() => {
                    setIsAuthenticated(false);
                    setUserRole(null);
                    setCurrentUser(null);
                    try {
                      localStorage.removeItem('serva_mobile_user');
                      localStorage.removeItem('serva_mobile_token');
                    } catch (e) { }
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Tab Bar Navigation */}
        {!selectedWorkOrder && (
          <BottomNav
            currentTab={currentTab}
            onSelectTab={handleSelectTab}
            unreadAlertsCount={unreadAlertsCount}
            language={laborerProfile.language}
          />
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090d] text-[#e4e4e7] flex flex-col items-center justify-start py-1 sm:py-4 px-1 sm:px-6 relative font-sans select-none overflow-x-hidden selection:bg-[#7a1521] selection:text-white">
      {/* Ambient Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(122,21,33,0.22),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Simulator Control Header (Desktop Workbench Bar) */}
      <header className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 py-2 px-3 sm:px-4 mb-2 sm:mb-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl z-20">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-md transition-colors ${devicePreset === 'android'
              ? 'bg-emerald-700'
              : devicePreset === 'ios'
                ? 'bg-[#7a1521]'
                : 'bg-blue-600'
              }`}
          >
            {devicePreset === 'android' ? 'AND' : devicePreset === 'ios' ? 'iOS' : 'ALL'}
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-white tracking-wide leading-tight">
              ITUM • SERVA Mobile Portal
            </span>
            <span className="text-[10px] text-neutral-400">
              {devicePreset === 'universal'
                ? 'Universal Mobile • All Phones (Samsung, Pixel, iPhone)'
                : devicePreset === 'android'
                  ? 'Android 15 Viewport • Samsung Galaxy & Google Pixel'
                  : 'Apple iOS 18 • iPhone 16 Pro'}
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Phone OS / Device Preset Selector */}
          <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 gap-0.5">
            <button
              onClick={() => setDevicePreset('universal')}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${devicePreset === 'universal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
                }`}
              title="Universal responsive mode that works on all phones"
            >
              <span className="material-symbols-outlined text-[14px]">devices</span>
              <span>All Phones</span>
            </button>

            <button
              onClick={() => setDevicePreset('android')}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${devicePreset === 'android'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
                }`}
              title="Android phone viewport (Samsung Galaxy, Google Pixel, Xiaomi)"
            >
              <span className="material-symbols-outlined text-[14px]">smartphone</span>
              <span>Android</span>
            </button>

            <button
              onClick={() => setDevicePreset('ios')}
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${devicePreset === 'ios'
                ? 'bg-[#7a1521] text-white shadow-xs'
                : 'text-neutral-400 hover:text-white'
                }`}
              title="Apple iPhone 16 Pro viewport"
            >
              <span className="material-symbols-outlined text-[14px]">phone_iphone</span>
              <span>iPhone</span>
            </button>
          </div>

          {/* Finish Switcher (Only visible for iPhone) */}
          {devicePreset === 'ios' && (
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 gap-1">
              {(['desert', 'natural', 'space', 'white'] as FinishType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setDeviceFinish(f)}
                  title={`${f.charAt(0).toUpperCase() + f.slice(1)} Titanium`}
                  className={`w-3.5 h-3.5 rounded-full transition-all ${f === 'desert'
                    ? 'bg-[#c2a792]'
                    : f === 'natural'
                      ? 'bg-[#9a9893]'
                      : f === 'space'
                        ? 'bg-[#2c2b30]'
                        : 'bg-[#e2e1e0]'
                    } ${deviceFinish === f ? 'ring-2 ring-[#ba1a1a] scale-110' : 'opacity-60 hover:opacity-100'}`}
                />
              ))}
            </div>
          )}

          {/* Toggle Device Frame */}
          <button
            onClick={() => setShowFrame(!showFrame)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${showFrame
              ? 'bg-white/10 text-neutral-300 border-white/10 hover:bg-white/20'
              : 'bg-[#7a1521] text-white border-[#ba1a1a] shadow-sm'
              }`}
            title="Toggle between phone frame container and clean full mobile screen"
          >
            {showFrame ? 'Frame ON' : 'Fullscreen'}
          </button>

          {/* Active Role or Login Status Badge */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold">
                {userRole === 'officer' ? '👷‍♂️ Officer' : '🛠️ Labourer'}
              </span>
              <button
                type="button"
                onClick={() => setUserRole(userRole === 'officer' ? 'labourer' : 'officer')}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 ml-1 underline cursor-pointer"
                title="Switch between Officer and Labourer interfaces"
              >
                Switch
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(false);
                  setUserRole(null);
                }}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 ml-1 underline cursor-pointer"
                title="Sign Out to Login Screen"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 text-xs text-amber-300 font-semibold">
              <span className="material-symbols-outlined text-[15px]">lock</span>
              <span>Portal Login</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Wrapper */}
      <div className="relative flex items-center justify-center z-10 w-full">
        {!showFrame || isMobileScreen ? (
          /* Plain Universal Mobile Viewport without Shell (Works on 100% of physical phones) */
          <div className="w-full max-w-md bg-[#f8fafc] text-[#1e293b] min-h-screen sm:min-h-[820px] flex flex-col shadow-2xl relative sm:rounded-3xl overflow-hidden border border-[#e2e8f0]/60 mx-auto [transform:translateZ(0)]">
            {renderAppContent(devicePreset)}
          </div>
        ) : devicePreset === 'android' ? (
          /* Authentic Android Smartphone Chassis (Samsung Galaxy / Google Pixel) */
          <div className="relative flex items-center justify-center w-full max-w-md mx-auto">
            {/* Android Right Side Hardware Buttons (Power + Volume) */}
            <div className="w-[4px] h-[58px] bg-neutral-600 rounded-r-md absolute -right-[6px] top-[140px] shadow-sm" />
            <div className="w-[4px] h-[36px] bg-neutral-600 rounded-r-md absolute -right-[6px] top-[215px] shadow-sm" />

            {/* Android Device Shell Housing */}
            <div className="w-[395px] sm:w-[412px] h-[835px] sm:h-[860px] p-[8px] rounded-[36px] sm:rounded-[40px] transition-all duration-300 relative shadow-[0_35px_95px_-15px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.12),0_0_40px_rgba(16,185,129,0.15)] border border-neutral-700 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 flex flex-col">
              {/* Android Center Camera Hole Punch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-neutral-900/80 flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#1e293b] rounded-full" />
                </div>
              </div>

              {/* Android Display Viewport */}
              <div className="w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#f8fafc] text-[#1e293b] flex flex-col relative shadow-inner border border-black/80 [transform:translateZ(0)]">
                {renderAppContent('android')}
                {/* Android Bottom Gesture Bar */}
                <div className="bg-white/90 py-1 flex items-center justify-center shrink-0">
                  <div className="w-28 h-1 bg-black/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : devicePreset === 'universal' ? (
          /* Universal Mobile Smartphone View (Fits all phones) */
          <div className="relative flex items-center justify-center w-full max-w-md mx-auto">
            {/* Universal Mobile Shell Housing */}
            <div className="w-[395px] sm:w-[412px] h-[835px] sm:h-[860px] p-[8px] rounded-[36px] sm:rounded-[40px] transition-all duration-300 relative shadow-[0_35px_95px_-15px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.12),0_0_40px_rgba(37,99,235,0.15)] border border-neutral-700 bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 flex flex-col">
              {/* Universal Top Camera Sensor */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                <div className="w-3.5 h-3.5 bg-black rounded-full ring-2 ring-neutral-900/80 flex items-center justify-center">
                  <div className="w-1 h-1 bg-[#2563eb]/40 rounded-full" />
                </div>
              </div>

              {/* Universal Display Viewport */}
              <div className="w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#f8fafc] text-[#1e293b] flex flex-col relative shadow-inner border border-black/80 [transform:translateZ(0)]">
                {renderAppContent('universal')}
                {/* Universal Bottom Gesture Bar */}
                <div className="bg-white/90 py-1 flex items-center justify-center shrink-0">
                  <div className="w-28 h-1 bg-black/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Apple iPhone Device Shell */
          <div className="relative flex items-center justify-center">
            {/* Hardware Side Buttons */}
            {/* Left: Action Button */}
            <div
              className={`w-[4px] h-[26px] ${currentFinish.button} rounded-l-md absolute -left-[7px] top-[125px] shadow-sm`}
            />
            {/* Left: Volume Up */}
            <div
              className={`w-[4px] h-[52px] ${currentFinish.button} rounded-l-md absolute -left-[7px] top-[168px] shadow-sm`}
            />
            {/* Left: Volume Down */}
            <div
              className={`w-[4px] h-[52px] ${currentFinish.button} rounded-l-md absolute -left-[7px] top-[232px] shadow-sm`}
            />
            {/* Right: Power / Side Key */}
            <div
              className={`w-[4px] h-[76px] ${currentFinish.button} rounded-r-md absolute -right-[7px] top-[180px] shadow-sm`}
            />

            {/* Titanium Physical Frame Housing */}
            <div
              className={`w-[395px] sm:w-[414px] h-[835px] sm:h-[864px] p-[10px] rounded-[52px] sm:rounded-[56px] transition-all duration-300 relative shadow-[0_35px_95px_-15px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.12),0_0_40px_rgba(122,21,33,0.25)] border ${currentFinish.border} ${currentFinish.bg}`}
            >
              {/* iPhone Inner Display Viewport */}
              <div className="w-full h-full rounded-[42px] sm:rounded-[46px] overflow-hidden bg-[#f8fafc] text-[#1e293b] flex flex-col relative shadow-inner border border-black/80 [transform:translateZ(0)]">
                {/* Dynamic Island Cutout */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                  <div className="w-[122px] h-[31px] bg-black rounded-full flex items-center justify-between px-3 shadow-md border border-white/10 group hover:w-[220px] transition-all duration-300 overflow-hidden cursor-pointer">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111116] ring-1 ring-white/15 flex items-center justify-center shrink-0">
                      <div className="w-1 h-1 rounded-full bg-[#201d36]" />
                    </div>

                    <div className="hidden group-hover:flex items-center gap-1.5 text-[10px] text-white font-medium truncate px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping" />
                      <span className="truncate">{workOrders[0] ? `${workOrders[0].id} • Active Task` : 'ITUM Serva Mobile'}</span>
                    </div>

                    <div className="w-3.5 h-3.5 rounded-full bg-[#0d0c12] ring-1 ring-white/15 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#09080e]" />
                    </div>
                  </div>
                </div>

                {renderAppContent('ios')}
                {/* iOS Home Indicator Bar */}
                <div className="bg-white/90 py-1 flex items-center justify-center shrink-0">
                  <div className="w-32 h-1 bg-black/50 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* Global In-App Outgoing Call Dialer Screen */}
      <CallDialogModal
        isOpen={isCallModalOpen}
        callDetails={activeCallDetails}
        onClose={() => setIsCallModalOpen(false)}
      />
    </div>
  );
}
