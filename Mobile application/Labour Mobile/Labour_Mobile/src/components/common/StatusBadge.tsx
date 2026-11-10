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
          <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fee2e2] text-[#b91c1c] text-[11px] font-bold border border-[#fca5a5] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c] animate-pulse" />
            {priority} PRIORITY
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#b45309] text-[11px] font-semibold border border-[#fde68a] shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b45309]" />
            MEDIUM PRIORITY
          </span>
        );
      default:
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#475569] text-[11px] font-medium border border-[#e2e8f0] shrink-0">
            LOW PRIORITY
          </span>
        );
    }
  }

  if (status) {
    switch (status) {
      case 'In Progress':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#dbeafe] text-[#1d4ed8] text-[11px] font-bold border border-[#bfdbfe] shrink-0">
            <span className="material-symbols-outlined text-[13px] animate-spin">autorenew</span>
            In Progress
          </span>
        );
      case 'Pending Start':
      case 'Assigned':
      case 'Pending':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#b45309] text-[11px] font-semibold border border-[#fde68a] shrink-0">
            <span className="material-symbols-outlined text-[13px]">schedule</span>
            Awaiting Acceptance
          </span>
        );
      case 'Completed':
      case 'Signed Off':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#047857] text-[11px] font-bold border border-[#a7f3d0] shrink-0">
            <span className="material-symbols-outlined text-[13px] text-[#047857]">check_circle</span>
            {status}
          </span>
        );
      case 'On Hold':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#b45309] text-[11px] font-bold border border-[#fde68a] shrink-0">
            <span className="material-symbols-outlined text-[13px] text-[#b45309]">pause_circle</span>
            On Hold
          </span>
        );
      case 'Rejected':
      case 'Cancelled':
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fee2e2] text-[#b91c1c] text-[11px] font-bold border border-[#fca5a5] shrink-0">
            <span className="material-symbols-outlined text-[13px] text-[#b91c1c]">cancel</span>
            {status}
          </span>
        );
      default:
        return (
          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f1f5f9] text-[#475569] text-[11px] font-medium border border-[#e2e8f0] shrink-0">
            {status}
          </span>
        );
    }
  }

  return null;
};
