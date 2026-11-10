import React, { useState } from 'react';
import { AlertNotice, AlertCategory } from '../types';
import { AlertCard } from '../components/alerts/AlertCard';
import { GpsNavigationModal } from '../components/alerts/GpsNavigationModal';
import { SafetyAdvisoryModal } from '../components/alerts/SafetyAdvisoryModal';
import { PartsPickupModal } from '../components/alerts/PartsPickupModal';
import { initiateCall } from '../services/callService';
import { playEmergencyChime } from '../services/soundEffects';

interface AlertsScreenProps {
  alerts: AlertNotice[];
  onDismissAlert: (id: string) => void;
  onMarkAllRead: () => void;
  onAcknowledgeAlert?: (id: string) => void;
  onToggleRead?: (id: string) => void;
  onNavigateToJob: (reqNumber?: string) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

type StatusFilter = 'all' | 'unread' | 'read';

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onDismissAlert,
  onMarkAllRead,
  onAcknowledgeAlert,
  onToggleRead,
  onNavigateToJob,
  searchQuery = '',
  onClearSearch,
}) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [activeNavAlert, setActiveNavAlert] = useState<AlertNotice | null>(null);
  const [activeAdvisoryAlert, setActiveAdvisoryAlert] = useState<AlertNotice | null>(null);
  const [activePickupAlert, setActivePickupAlert] = useState<AlertNotice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const q = (searchQuery || '').toLowerCase().trim();

  // Filter alerts matching live search query
  const searchMatchingAlerts = alerts.filter((alert) => {
    if (!q) return true;
    return (
      (alert.title && alert.title.toLowerCase().includes(q)) ||
      (alert.description && alert.description.toLowerCase().includes(q)) ||
      (alert.reqNumber && alert.reqNumber.toLowerCase().includes(q)) ||
      (alert.category && alert.category.toLowerCase().includes(q)) ||
      (alert.severity && alert.severity.toLowerCase().includes(q)) ||
      (alert.location && alert.location.toLowerCase().includes(q)) ||
      (alert.pickupToken && alert.pickupToken.toLowerCase().includes(q))
    );
  });

  const unreadCount = searchMatchingAlerts.filter((a) => !a.isRead).length;
  const readCount = searchMatchingAlerts.filter((a) => a.isRead).length;
  const totalCount = searchMatchingAlerts.length;

  const filteredAlerts = searchMatchingAlerts.filter((alert) => {
    if (statusFilter === 'unread') return !alert.isRead;
    if (statusFilter === 'read') return alert.isRead;
    return true;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleMarkAll = () => {
    onMarkAllRead();
    playEmergencyChime();
    showToast('✓ All alerts marked as read! Notification badges cleared.');
  };

  const handleAction = (alertNotice: AlertNotice) => {
    // 1. Immediately acknowledge the alert if acknowledging callback exists
    if (onAcknowledgeAlert) {
      onAcknowledgeAlert(alertNotice.id);
    }

    // 2. Open interactive modal / route based on actionType
    if (alertNotice.actionType === 'navigate') {
      setActiveNavAlert(alertNotice);
    } else if (alertNotice.actionType === 'view_advisory') {
      setActiveAdvisoryAlert(alertNotice);
    } else if (alertNotice.actionType === 'pickup_token') {
      setActivePickupAlert(alertNotice);
    } else if (alertNotice.actionType === 'open_ticket') {
      onNavigateToJob(alertNotice.reqNumber);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto relative">
      {/* Dynamic Feedback Toast Banner */}
      {toastMessage && (
        <div className="sticky top-2 z-30 p-3 bg-emerald-700 text-white rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 border border-emerald-500">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/80 hover:text-white text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col gap-1 pt-1">

        <div className="flex items-center justify-between gap-2.5">
          <h1 className="text-[19px] sm:text-[22px] font-bold text-[#1e293b] tracking-tight truncate min-w-0">
            Alerts & Urgent Notices
          </h1>
          <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-xs font-semibold text-[#7a1521] hover:underline cursor-pointer whitespace-nowrap"
              >
                Mark all read
              </button>
            )}
            <span className="text-xs px-2.5 py-1 rounded-full bg-[#7a1521] text-white font-bold shadow-sm whitespace-nowrap shrink-0">
              {unreadCount > 0 ? `${unreadCount} Unread` : '0 Unread'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Search Query Feedback Banner */}
      {searchQuery ? (
        <div className="bg-[#fff0ef] p-3 rounded-2xl border border-[#ffe9e8] flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-[#7a1521]">search</span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#1e293b] truncate">
                Results for "{searchQuery}"
              </span>
              <span className="text-[10px] text-[#475569]">
                {totalCount} matching {totalCount === 1 ? 'alert' : 'alerts'} found
              </span>
            </div>
          </div>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="px-2.5 py-1 rounded-xl bg-white text-[#7a1521] text-xs font-bold border border-[#ffe9e8] hover:bg-[#ffdad9] transition-colors shrink-0 cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : null}

      {/* Filter Buttons: All, Unread, Read */}
      <div className="grid grid-cols-3 gap-2 py-0.5">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-[#7a1521] text-white ring-2 ring-[#7a1521]/20'
              : 'bg-[#fff0ef] text-[#475569] hover:bg-[#ffe9e8] border border-[#ffe9e8]'
          }`}
        >
          <span>All</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            statusFilter === 'all' ? 'bg-white text-[#7a1521]' : 'bg-[#ffdad9] text-[#7a1521]'
          }`}>
            {totalCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('unread')}
          className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
            statusFilter === 'unread'
              ? 'bg-[#7a1521] text-white ring-2 ring-[#7a1521]/20'
              : 'bg-[#fff0ef] text-[#475569] hover:bg-[#ffe9e8] border border-[#ffe9e8]'
          }`}
        >
          <span>Unread</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            statusFilter === 'unread' ? 'bg-white text-[#7a1521]' : 'bg-[#fee2e2] text-[#b91c1c]'
          }`}>
            {unreadCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('read')}
          className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
            statusFilter === 'read'
              ? 'bg-[#7a1521] text-white ring-2 ring-[#7a1521]/20'
              : 'bg-[#fff0ef] text-[#475569] hover:bg-[#ffe9e8] border border-[#ffe9e8]'
          }`}
        >
          <span>Read</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
            statusFilter === 'read' ? 'bg-white text-[#7a1521]' : 'bg-emerald-100 text-emerald-800'
          }`}>
            {readCount}
          </span>
        </button>
      </div>


      {/* Alert Cards Feed */}
      {filteredAlerts.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filteredAlerts.map((alertItem) => (
            <AlertCard
              key={alertItem.id}
              alert={alertItem}
              onDismiss={onDismissAlert}
              onAction={handleAction}
              onToggleRead={onToggleRead}
            />
          ))}
        </div>
      ) : (
        /* Empty Feed State */
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#fff0ef] border border-[#ffe9e8] my-2">
          <div className="w-14 h-14 rounded-full bg-[#ffdad9] flex items-center justify-center text-[#7a1521] mb-2">
            <span className="material-symbols-outlined text-[32px]">
              {searchQuery ? 'search_off' : 'task_alt'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#1e293b]">
            {searchQuery ? 'No Matching Alerts' : 'Clear Deck!'}
          </h3>
          <p className="text-xs text-[#475569] mt-1 max-w-xs">
            {searchQuery
              ? `We couldn't find any notices matching "${searchQuery}".`
              : "You're completely up-to-date. All urgent hazards and notifications have been addressed."}
          </p>
          {searchQuery && onClearSearch ? (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-3 px-4 py-2 rounded-xl bg-[#7a1521] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Clear Search
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className="mt-3 px-4 py-2 rounded-xl bg-[#7a1521] text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Supervisor Quick-Contact Sticky Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fff0ef] border border-[#ffe9e8] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#1e293b]">Ops Desk Dispatcher</span>
            <span className="text-[11px] text-[#475569]">Eng. D. Jayasuriya • +94 77 149 0016</span>
          </div>
        </div>
        <a
          href="tel:+94771490016"
          onClick={(e) => {
            e.preventDefault();
            initiateCall('Ops Desk Dispatcher (Eng. D. Jayasuriya)', '+94 77 149 0016', 'Central Dispatch Desk');
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#7a1521] text-white text-xs font-bold hover:bg-[#58000f] transition-all active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
          <span>Direct Call</span>
        </a>
      </div>

      {/* 1. Interactive Turn-by-Turn GPS Navigation Modal */}
      <GpsNavigationModal
        isOpen={Boolean(activeNavAlert)}
        onClose={() => setActiveNavAlert(null)}
        alert={activeNavAlert}
        onArrivedAtJob={(reqNumber) => {
          setActiveNavAlert(null);
          onNavigateToJob(reqNumber);
        }}
      />

      {/* 2. Interactive Safety Advisory Protocol Modal */}
      <SafetyAdvisoryModal
        isOpen={Boolean(activeAdvisoryAlert)}
        onClose={() => setActiveAdvisoryAlert(null)}
        alert={activeAdvisoryAlert}
        onAcknowledge={(id) => {
          if (onAcknowledgeAlert) onAcknowledgeAlert(id);
          showToast('✓ Safety advisory acknowledged & safety checklist logged.');
        }}
      />

      {/* 3. Interactive Parts Pickup Voucher Gatepass Modal */}
      <PartsPickupModal
        isOpen={Boolean(activePickupAlert)}
        onClose={() => setActivePickupAlert(null)}
        alert={activePickupAlert}
        onAcknowledge={(id) => {
          if (onAcknowledgeAlert) onAcknowledgeAlert(id);
          showToast('✓ Store pickup gatepass verified and reserved.');
        }}
      />
    </div>
  );
};
