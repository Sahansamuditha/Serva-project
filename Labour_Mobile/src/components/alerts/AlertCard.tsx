import React from 'react';
import { AlertNotice } from '../../types';
import { initiateCall } from '../../services/callService';

interface AlertCardProps {
  alert: AlertNotice;
  onDismiss: (id: string) => void;
  onAction: (alert: AlertNotice) => void;
  onToggleRead?: (id: string) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onDismiss,
  onAction,
  onToggleRead,
}) => {
  const isHazard = alert.category === 'hazard';
  const isDispatch = alert.category === 'dispatch';

  let borderStripClass = 'bg-[#5c5f61]';
  if (alert.severity === 'CRITICAL') borderStripClass = 'bg-[#ba1a1a]';
  else if (alert.severity === 'HIGH') borderStripClass = 'bg-[#a7373e]';

  return (
    <article
      className={`flex flex-col rounded-2xl p-4 transition-all relative overflow-hidden border shadow-sm ${
        alert.isRead
          ? 'bg-[#fcf8f8] border-[#debfbf]/50 opacity-90'
          : 'bg-white border-[#ba1a1a]/40 ring-1 ring-[#ba1a1a]/15 shadow-md'
      }`}
    >
      {/* Left status indicator strip */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${borderStripClass}`} />

      {/* Header Badges */}
      <div className="flex items-start justify-between gap-2 mb-1.5 pl-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Read / Unread Status Badge */}
          {alert.isRead ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold shadow-2xs">
              <span className="material-symbols-outlined text-[13px] text-emerald-600">check_circle</span>
              <span>ACKNOWLEDGED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              <span>UNREAD</span>
            </span>
          )}

          {isHazard && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]">warning</span>
              {alert.severity === 'CRITICAL' ? 'Critical Hazard' : 'Hazard Advisory'}
            </span>
          )}

          {isDispatch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e0e3e5] text-[#191c1e] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[13px]">assignment_turned_in</span>
              Dispatch Alert
            </span>
          )}

          {!isHazard && !isDispatch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f3dedd] text-[#574141] text-[11px] font-semibold">
              <span className="material-symbols-outlined text-[13px]">cloud_sync</span>
              System Notice
            </span>
          )}

          <span className="text-[11px] text-[#8a7170] ml-0.5">{alert.timestamp}</span>
        </div>

        {alert.reqNumber && (
          <span className="text-[11px] font-bold text-[#7a1521] px-2 py-0.5 rounded bg-[#f9e3e2] shrink-0">
            {alert.reqNumber}
          </span>
        )}
      </div>

      {/* Title & Body */}
      <div className="pl-1.5 flex flex-col gap-1 mt-1">
        <h2 className="text-[15px] sm:text-[16px] text-[#241919] font-bold leading-snug">
          {alert.title}
        </h2>
        <p className="text-xs text-[#574141] leading-relaxed">
          {alert.description}
        </p>

        {alert.location && (
          <div className="flex items-center gap-1.5 mt-1.5 py-1.5 px-2.5 rounded-xl bg-[#fff0ef] text-[#574141] text-[12px] font-medium border border-[#ffe9e8]">
            <span className="material-symbols-outlined text-[16px] text-[#7a1521]">pin_drop</span>
            <span className="truncate">{alert.location}</span>
          </div>
        )}

        {alert.pickupToken && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#ffe9e8]">
            <span className="text-xs text-[#574141] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#7a1521]">qr_code_2</span>
              Pickup Voucher: <strong className="text-[#7a1521] font-mono">{alert.pickupToken}</strong>
            </span>
            <button
              type="button"
              onClick={() => onAction(alert)}
              className="text-[#7a1521] text-xs font-bold hover:underline flex items-center gap-0.5"
            >
              <span>View Gatepass</span>
              <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-[#f9e3e2]/60">
          {/* Primary Action Button (Acknowledge & Navigate / View Advisory / Open Ticket) */}
          <button
            type="button"
            onClick={() => onAction(alert)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#7a1521] text-white text-xs font-bold hover:bg-[#58000f] transition-all active:scale-[0.98] shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {alert.actionType === 'navigate'
                ? 'near_me'
                : alert.actionType === 'view_advisory'
                ? 'verified_user'
                : alert.actionType === 'pickup_token'
                ? 'qr_code'
                : 'launch'}
            </span>
            <span>
              {alert.actionType === 'navigate'
                ? 'Acknowledge & Navigate'
                : alert.actionType === 'view_advisory'
                ? 'View Safety Advisory'
                : alert.actionType === 'pickup_token'
                ? 'View Pickup Ticket'
                : 'Open Work Ticket'}
            </span>
          </button>

          {/* Quick Call Button (+94 77 149 0016) */}
          <button
            type="button"
            aria-label="Direct Call Dispatch (+94 77 149 0016)"
            onClick={() => initiateCall(`Radio Dispatch Hotline (${alert.title})`, '+94 77 149 0016', 'Emergency Dispatch')}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#fff0ef] text-[#7a1521] hover:bg-[#ffe9e8] transition-colors shrink-0 border border-[#debfbf]/40 shadow-2xs active:scale-95"
            title="Radio Dispatch Hotline (+94 77 149 0016)"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </button>

          {/* Individual Read / Unread Toggle */}
          {onToggleRead && (
            <button
              type="button"
              onClick={() => onToggleRead(alert.id)}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#fff0ef] text-[#574141] hover:text-[#7a1521] hover:bg-[#ffe9e8] transition-colors shrink-0 border border-[#debfbf]/40 shadow-2xs active:scale-95"
              title={alert.isRead ? 'Mark as Unread' : 'Mark as Read'}
            >
              <span className="material-symbols-outlined text-[18px]">
                {alert.isRead ? 'mark_email_unread' : 'done'}
              </span>
            </button>
          )}

          {/* Dismiss Button */}
          <button
            type="button"
            onClick={() => onDismiss(alert.id)}
            className="py-1.5 px-2.5 rounded-xl text-[#8a7170] hover:text-[#241919] hover:bg-[#fff0ef] text-xs font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </article>
  );
};
