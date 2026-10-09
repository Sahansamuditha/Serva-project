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
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  alerts,
  onDismissAlert,
  onMarkAllRead,
  onAcknowledgeAlert,
  onToggleRead,
  onNavigateToJob,
}) => {
  const [filterCategory, setFilterCategory] = useState<AlertCategory | 'all'>('all');
  const [activeNavAlert, setActiveNavAlert] = useState<AlertNotice | null>(null);
  const [activeAdvisoryAlert, setActiveAdvisoryAlert] = useState<AlertNotice | null>(null);
  const [activePickupAlert, setActivePickupAlert] = useState<AlertNotice | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const unreadCount = alerts.filter((a) => !a.isRead).length;

  const filteredAlerts = alerts.filter((alert) => {
    if (filterCategory === 'all') return true;
    return alert.category === filterCategory;
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

      {/* Top Header & Mark All Read Action */}
      <div className="flex flex-col gap-1 pt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#8a7170] uppercase tracking-wider">
            Campus Broadcast Feed
          </span>
          <button
            type="button"
            onClick={handleMarkAll}
            disabled={unreadCount === 0}
            className={`flex items-center gap-1.5 text-xs font-bold py-1.5 px-3.5 rounded-full transition-all active:scale-95 shadow-sm ${
              unreadCount === 0
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 opacity-90 cursor-default'
                : 'bg-[#ffdad9] hover:bg-[#ffb3b2] text-[#7a1521]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {unreadCount === 0 ? 'check_circle' : 'done_all'}
            </span>
            <span>{unreadCount === 0 ? 'All Read' : `Mark all as read (${unreadCount})`}</span>
          </button>
        </div>

        <div className="flex items-baseline justify-between">
          <h1 className="text-[22px] font-bold text-[#241919] tracking-tight">
            Alerts & Urgent Notices
          </h1>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[#7a1521] text-white font-bold shadow-sm">
            {unreadCount > 0 ? `${unreadCount} Unread` : '0 Unread'}
          </span>
        </div>
      </div>

      {/* Filter Chips (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-3.5 h-8 rounded-full text-xs font-bold flex items-center gap-1 transition-all shadow-sm ${
            filterCategory === 'all'
              ? 'bg-[#7a1521] text-white'
              : 'bg-[#fff0ef] text-[#574141] hover:bg-[#ffe9e8]'
          }`}
        >
          <span>All</span>
          <span className="w-4 h-4 rounded-full bg-white text-[#7a1521] text-[10px] flex items-center justify-center font-bold">
            {alerts.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('hazard')}
          className={`px-3.5 h-8 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            filterCategory === 'hazard'
              ? 'bg-[#7a1521] text-white'
              : 'bg-[#fff0ef] text-[#574141] hover:bg-[#ffe9e8]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
          <span>Urgent Hazards</span>
          <span className="opacity-75 font-normal text-[11px]">
            ({alerts.filter((a) => a.category === 'hazard').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('dispatch')}
          className={`px-3.5 h-8 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            filterCategory === 'dispatch'
              ? 'bg-[#7a1521] text-white'
              : 'bg-[#fff0ef] text-[#574141] hover:bg-[#ffe9e8]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#a7373e]" />
          <span>Dispatches</span>
          <span className="opacity-75 font-normal text-[11px]">
            ({alerts.filter((a) => a.category === 'dispatch').length})
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilterCategory('system')}
          className={`px-3.5 h-8 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
            filterCategory === 'system'
              ? 'bg-[#7a1521] text-white'
              : 'bg-[#fff0ef] text-[#574141] hover:bg-[#ffe9e8]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#5c5f61]" />
          <span>System</span>
          <span className="opacity-75 font-normal text-[11px]">
            ({alerts.filter((a) => a.category === 'system').length})
          </span>
        </button>
      </div>

      {/* Priority Broadcast Banner (Pulse Indicator) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#ba1a1a] text-white p-3.5 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/20 shrink-0">
            <span className="material-symbols-outlined text-white text-[22px]">e911_emergency</span>
            <span className="animate-ping absolute inset-0 rounded-xl bg-white/40 opacity-75" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-wide uppercase">Emergency Escalation Active</span>
            <span className="text-[12px] opacity-90 leading-tight">
              Moratuwa Campus Sector 4 High-Alert in effect.
            </span>
          </div>
        </div>
        <span className="material-symbols-outlined text-white opacity-75 text-[20px]">
          chevron_right
        </span>
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
            <span className="material-symbols-outlined text-[32px]">task_alt</span>
          </div>
          <h3 className="text-lg font-bold text-[#241919]">Clear Deck!</h3>
          <p className="text-xs text-[#574141] mt-1 max-w-xs">
            You're completely up-to-date. All urgent hazards and notifications have been addressed.
          </p>
          <button
            type="button"
            onClick={() => setFilterCategory('all')}
            className="mt-3 px-4 py-2 rounded-xl bg-[#7a1521] text-white font-bold text-xs shadow-sm"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Supervisor Quick-Contact Sticky Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fff0ef] border border-[#ffe9e8] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold shrink-0">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#241919]">Ops Desk Dispatcher</span>
            <span className="text-[11px] text-[#574141]">Eng. D. Jayasuriya • +94 77 149 0016</span>
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
