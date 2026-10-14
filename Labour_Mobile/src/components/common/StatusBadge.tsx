import React from 'react';
import { WorkOrderStatus, PriorityLevel } from '../../types';

interface StatusBadgeProps {
  status?: WorkOrderStatus;
  priority?: PriorityLevel;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  priority,
  size = 'md',
}) => {
  if (priority) {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffdad6] text-[#93000a] text-[11px] font-bold border border-[#ba1a1a]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse" />
            HIGH PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffe9e8] text-[#574141] text-[11px] font-semibold border border-[#debfbf]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#8a7170]" />
            MEDIUM PRIORITY
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e0e3e5] text-[#626567] text-[11px] font-medium">
            LOW PRIORITY
          </span>
        );
    }
  }

  if (status) {
    switch (status) {
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ffdad9] text-[#410009] text-[11px] font-bold border border-[#7a1521]/30">
            <span className="material-symbols-outlined text-[13px] animate-spin">autorenew</span>
            In Progress
          </span>
        );
      case 'Pending Start':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e0e3e5] text-[#626567] text-[11px] font-semibold">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            Pending Start
          </span>
        );
      case 'Completed':
      case 'Signed Off':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-300/60">
            <span className="material-symbols-outlined text-[13px] text-emerald-700">check_circle</span>
            {status}
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-300">
            <span className="material-symbols-outlined text-[13px] text-amber-700">pause_circle</span>
            On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
            {status}
          </span>
        );
    }
  }

  return null;
};
