import React from 'react';
import { WorkOrder } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface TaskCardProps {
  order: WorkOrder;
  onSelect: (order: WorkOrder) => void;
  onStartJob?: (order: WorkOrder) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  order,
  onSelect,
  onStartJob,
}) => {
  const isCompleted = order.status === 'Completed' || order.status === 'Signed Off';
  const isPendingAcceptance = order.status === 'Pending Start' || order.status === 'Assigned' || order.status === 'Pending';
  const isInProgress = order.status === 'In Progress';
  const isOnHold = order.status === 'On Hold';

  return (
    <article className="bg-white rounded-xl p-4 shadow-sm border border-[#e2e8f0] relative overflow-hidden flex flex-col hover:shadow-md transition-all">
      {/* Active Left Strip indicator */}
      {isInProgress && <div className="w-1.5 h-full absolute left-0 top-0 bg-[#7a1521]" />}
      {isPendingAcceptance && <div className="w-1.5 h-full absolute left-0 top-0 bg-[#f59e0b]" />}
      {isOnHold && <div className="w-1.5 h-full absolute left-0 top-0 bg-[#e11d48]" />}

      {/* Card Header Badges */}
      <div className="flex items-center justify-between gap-1.5 pl-1 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <StatusBadge priority={order.priority} />
          <span className="whitespace-nowrap text-[11px] font-bold text-[#7a1521] px-2 py-0.5 rounded-full bg-[#fff0ef] border border-[#ffe9e8] shrink-0">
            #{order.id}
          </span>
        </div>
        <div className="shrink-0">
          <StatusBadge status={order.status} />
        </div>
      </div>

      {/* Task Title & Narrative */}
      <div className="mt-2.5 pl-1">
        <h3 className="text-[17px] font-bold text-[#1e293b] leading-snug">
          {order.title}
        </h3>
        <p className="text-xs text-[#475569] mt-1 line-clamp-2 leading-relaxed">
          {order.description}
        </p>
      </div>

      {/* Location & Due Time Container */}
      <div className="mt-3 pl-1 space-y-1.5 bg-[#fff0ef] p-3 rounded-lg border border-[#ffe9e8]">
        <div className="flex items-center gap-2 text-[#1e293b]">
          <span className="material-symbols-outlined text-[18px] text-[#7a1521] shrink-0">
            location_on
          </span>
          <span className="text-xs font-semibold truncate">{order.location}</span>
        </div>
        <div className="flex items-center gap-2 text-[#475569]">
          <span className="material-symbols-outlined text-[18px] text-[#64748b] shrink-0">
            schedule
          </span>
          <span className="text-[11px] font-medium">
            {order.assignedTime} • Due {order.dueTime}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 pl-1 flex items-center gap-2">
        {isPendingAcceptance && (
          <button
            type="button"
            onClick={() => onSelect(order)}
            className="flex-1 h-11 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span>View Details</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}

        {isInProgress && (
          <button
            type="button"
            onClick={() => onSelect(order)}
            className="flex-1 h-11 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>View Details & Update</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}

        {isOnHold && (
          <button
            type="button"
            onClick={() => onSelect(order)}
            className="flex-1 h-11 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <span>Resume / View Details</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}

        {isCompleted && (
          <button
            type="button"
            onClick={() => onSelect(order)}
            className="flex-1 h-11 rounded-xl bg-[#fff0ef] hover:bg-[#ffe9e8] text-[#1e293b] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px] text-[#7a1521]">assignment</span>
            <span>View Work Details & Slip</span>
          </button>
        )}
      </div>
    </article>
  );
};
