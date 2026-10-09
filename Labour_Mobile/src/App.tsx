import { useState, useEffect } from 'react';
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
import { AvatarPickerModal } from './components/common/AvatarPickerModal';
import { CallDialogModal } from './components/common/CallDialogModal';
import { CallDetails, subscribeToCallEvents } from './services/callService';
import { getTranslation } from './services/i18n';

export type DevicePreset = 'universal' | 'android' | 'ios';
type FinishType = 'desert' | 'natural' | 'space' | 'white';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('profile');
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
  };

  // Start Job Quick Trigger
  const handleStartJob = (order: WorkOrder) => {
    handleUpdateWorkOrderStatus(order.id, 'In Progress');
    setSelectedWorkOrder(order);
  };

  // Select Order for Details View
  const handleSelectOrder = (order: WorkOrder) => {
    setSelectedWorkOrder(order);
  };

  // Alert Handlers
  const handleDismissAlert = (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  };

  const handleMarkAllAlertsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
  };

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
    );
  };

  const handleToggleReadAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isRead: !a.isRead } : a))
    );
  };

  const handleNavigateToJob = (reqNumber?: string) => {
    if (reqNumber) {
      const target = workOrders.find((w) => w.id === reqNumber || `#${w.id}` === reqNumber);
      if (target) {
        setSelectedWorkOrder(target);
        return;
      }
    }
    // Fallback to primary active job REQ-8291
    const activeJob = workOrders.find((w) => w.id === 'REQ-8291') || workOrders[0];
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
    if (['edit_profile', 'region_settings', 'system_logs', 'system_hub'].includes(screen)) {
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
  const renderAppContent = (preset: DevicePreset) => (
    <>
      {/* App Screen Header Bar */}
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
      />

      {/* Main Body View Router */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pt-1 pb-24 relative">
        {/* 1. Subscreen Router */}
        {selectedWorkOrder ? (
          <JobDetailsScreen
            order={selectedWorkOrder}
            onBack={() => setSelectedWorkOrder(null)}
            onUpdateStatus={handleUpdateWorkOrderStatus}
          />
        ) : activeSubscreen === 'edit_profile' ? (
          <EditProfileScreen
            profile={laborerProfile}
            onSaveProfile={(updated) => {
              setLaborerProfile((prev) => ({ ...prev, ...updated }));
              setActiveSubscreen(null);
            }}
            onBack={() => setActiveSubscreen(null)}
            onOpenAvatarPicker={() => setIsAvatarPickerOpen(true)}
          />
        ) : activeSubscreen === 'region_settings' ? (
          <RegionSettingsScreen
            campusZones={campusZones}
            currentLanguage={laborerProfile.language}
            onUpdateLanguage={(lang) =>
              setLaborerProfile((prev) => ({ ...prev, language: lang }))
            }
            onBack={() => setActiveSubscreen(null)}
            onToggleZoneCache={(zoneId) =>
              console.log(`Toggled offline cache for ${zoneId}`)
            }
          />
        ) : activeSubscreen === 'system_logs' ? (
          <SystemLogsScreen
            logs={systemLogs}
            onBack={() => setActiveSubscreen(null)}
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
              />
            )}

            {currentTab === 'history' && (
              <HistoryScreen
                historyLogs={workHistory}
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

  return (
    <div className="min-h-screen bg-[#09090d] text-[#e4e4e7] flex flex-col items-center justify-start py-1 sm:py-4 px-1 sm:px-6 relative font-sans select-none overflow-x-hidden selection:bg-[#7a1521] selection:text-white">
      {/* Ambient Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(122,21,33,0.22),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      {/* Simulator Control Header (Desktop Workbench Bar) */}
      <header className="w-full max-w-xl flex flex-wrap items-center justify-between gap-2 py-2 px-3 sm:px-4 mb-2 sm:mb-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl z-20">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shadow-md transition-colors ${
              devicePreset === 'android'
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
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                devicePreset === 'universal'
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
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                devicePreset === 'android'
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
              className={`px-2 py-0.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                devicePreset === 'ios'
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
                  className={`w-3.5 h-3.5 rounded-full transition-all ${
                    f === 'desert'
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
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
              showFrame
                ? 'bg-white/10 text-neutral-300 border-white/10 hover:bg-white/20'
                : 'bg-[#7a1521] text-white border-[#ba1a1a] shadow-sm'
            }`}
            title="Toggle between phone frame container and clean full mobile screen"
          >
            {showFrame ? 'Frame ON' : 'Fullscreen'}
          </button>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <div className="relative flex items-center justify-center z-10 w-full">
        {!showFrame || isMobileScreen ? (
          /* Plain Universal Mobile Viewport without Shell (Works on 100% of physical phones) */
          <div className="w-full max-w-md bg-[#fff8f7] text-[#241919] min-h-screen sm:min-h-[820px] flex flex-col shadow-2xl relative sm:rounded-3xl overflow-hidden border border-[#debfbf]/60 mx-auto">
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
              <div className="w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#fff8f7] text-[#241919] flex flex-col relative shadow-inner border border-black/80">
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
              <div className="w-full h-full rounded-[28px] sm:rounded-[32px] overflow-hidden bg-[#fff8f7] text-[#241919] flex flex-col relative shadow-inner border border-black/80">
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
              <div className="w-full h-full rounded-[42px] sm:rounded-[46px] overflow-hidden bg-[#fff8f7] text-[#241919] flex flex-col relative shadow-inner border border-black/80">
                {/* Dynamic Island Cutout */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                  <div className="w-[122px] h-[31px] bg-black rounded-full flex items-center justify-between px-3 shadow-md border border-white/10 group hover:w-[220px] transition-all duration-300 overflow-hidden cursor-pointer">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#111116] ring-1 ring-white/15 flex items-center justify-center shrink-0">
                      <div className="w-1 h-1 rounded-full bg-[#201d36]" />
                    </div>

                    <div className="hidden group-hover:flex items-center gap-1.5 text-[10px] text-white font-medium truncate px-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-ping" />
                      <span className="truncate">REQ-8291 • Active Job</span>
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

      {/* Interactive Avatar Picker Modal (Shared across screens) */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        currentAvatarUrl={laborerProfile.avatarUrl}
        userName={laborerProfile.name}
        onClose={() => setIsAvatarPickerOpen(false)}
        onSaveAvatar={(newUrl) => {
          setLaborerProfile((prev) => ({ ...prev, avatarUrl: newUrl }));
        }}
      />

      {/* Global In-App Outgoing Call Dialer Screen */}
      <CallDialogModal
        isOpen={isCallModalOpen}
        callDetails={activeCallDetails}
        onClose={() => setIsCallModalOpen(false)}
      />
    </div>
  );
}
