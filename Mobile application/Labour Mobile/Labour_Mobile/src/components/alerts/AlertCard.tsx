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

  let borderStripClass = 'bg-[#64748b]';
  if (alert.severity === 'CRITICAL') borderStripClass = 'bg-[#dc2626]';
  else if (alert.severity === 'HIGH') borderStripClass = 'bg-[#b91c1c]';

  return (
    <article
      className={`flex flex-col rounded-2xl p-4 transition-all relative overflow-hidden border shadow-sm ${
        alert.isRead
          ? 'bg-[#f8fafc] border-[#e2e8f0] opacity-90'
          : 'bg-white border-[#fca5a5] ring-1 ring-[#fee2e2] shadow-md'
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
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#b91c1c] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[13px]">warning</span>
              {alert.severity === 'CRITICAL' ? 'Critical Hazard' : 'Hazard Advisory'}
            </span>
          )}

          {isDispatch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#1e293b] text-[11px] font-semibold border border-[#e2e8f0]">
              <span className="material-symbols-outlined text-[13px]">assignment_turned_in</span>
              Dispatch Alert
            </span>
          )}

          {!isHazard && !isDispatch && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-[11px] font-semibold border border-[#e2e8f0]">
              <span className="material-symbols-outlined text-[13px]">cloud_sync</span>
              System Notice
            </span>
          )}

          <span className="text-[11px] text-[#64748b] ml-0.5">{alert.timestamp}</span>
        </div>

        {alert.reqNumber && (
          <span className="text-[11px] font-bold text-[#7a1521] px-2 py-0.5 rounded bg-[#ffe9e8] shrink-0 border border-[#ffdad9]">
            {alert.reqNumber}
          </span>
        )}
      </div>

      {/* Title & Body */}
      <div className="pl-1.5 flex flex-col gap-1 mt-1">
        <h2 className="text-[15px] sm:text-[16px] text-[#1e293b] font-bold leading-snug">
          {alert.title}
        </h2>
        <p className="text-xs text-[#475569] leading-relaxed">
          {alert.description}
        </p>

        {alert.location && (
          <div className="flex items-center gap-1.5 mt-1.5 py-1.5 px-2.5 rounded-xl bg-[#fff0ef] text-[#475569] text-[12px] font-medium border border-[#ffe9e8]">
            <span className="material-symbols-outlined text-[16px] text-[#7a1521]">pin_drop</span>
            <span className="truncate">{alert.location}</span>
          </div>
        )}

        {alert.pickupToken && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#ffe9e8]">
            <span className="text-xs text-[#475569] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-[#7a1521]">qr_code_2</span>
              Pickup Voucher: <strong className="text-[#7a1521] font-mono">{alert.pickupToken}</strong>
            </span>
          </div>
        )}
        {/* Single Action Button: Mark Read */}
        <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => onToggleRead ? onToggleRead(alert.id) : onDismiss(alert.id)}
            className={`flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm cursor-pointer ${
              alert.isRead
                ? 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0] border border-[#e2e8f0]'
                : 'bg-[#7a1521] hover:bg-[#58000f] text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {alert.isRead ? 'done_all' : 'check'}
            </span>
            <span>{alert.isRead ? 'Mark as Unread' : 'Mark Read'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
