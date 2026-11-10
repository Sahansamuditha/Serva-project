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
  const isInProgress = order.status === 'In Progress';

  return (
    <article className="bg-white rounded-xl p-4 shadow-sm border border-[#debfbf]/40 relative overflow-hidden flex flex-col hover:shadow-md transition-all">
      {/* Active Left Strip indicator for In Progress */}
      {isInProgress && <div className="w-1.5 h-full absolute left-0 top-0 bg-[#7a1521]" />}

      {/* Card Header Badges */}
      <div className="flex items-center justify-between gap-2 pl-1">
        <div className="flex items-center gap-1.5">
          <StatusBadge priority={order.priority} />
          <span className="text-[11px] font-bold text-[#7a1521] px-2 py-0.5 rounded-full bg-[#fff0ef] border border-[#ffe9e8]">
            #{order.id}
          </span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Task Title & Narrative */}
      <div className="mt-2.5 pl-1">
        <h3 className="text-[17px] font-bold text-[#241919] leading-snug">
          {order.title}
        </h3>
        <p className="text-xs text-[#574141] mt-1 line-clamp-2 leading-relaxed">
          {order.description}
        </p>
      </div>

      {/* Location & Due Time Container */}
      <div className="mt-3 pl-1 space-y-1.5 bg-[#fff0ef] p-3 rounded-lg border border-[#ffe9e8]">
        <div className="flex items-center gap-2 text-[#241919]">
          <span className="material-symbols-outlined text-[18px] text-[#7a1521] shrink-0">
            location_on
          </span>
          <span className="text-xs font-semibold truncate">{order.location}</span>
        </div>
        <div className="flex items-center gap-2 text-[#574141]">
          <span className="material-symbols-outlined text-[18px] text-[#8a7170] shrink-0">
            schedule
          </span>
          <span className="text-[11px] font-medium">
            {order.assignedTime} • Due {order.dueTime}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3.5 pl-1 flex items-center gap-2">
        {isInProgress && (
          <button
            onClick={() => onSelect(order)}
            className="flex-1 h-11 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span>View Details & Update</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </button>
        )}

        {order.status === 'Pending Start' && (
          <>
            <button
              onClick={() => onStartJob ? onStartJob(order) : onSelect(order)}
              className="flex-1 h-11 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              <span>Start Job</span>
            </button>
            <button
              onClick={() => onSelect(order)}
              className="h-11 px-3.5 rounded-xl bg-[#fff0ef] text-[#574141] text-xs font-semibold hover:bg-[#ffe9e8]"
            >
              Details
            </button>
          </>
        )}

        {isCompleted && (
          <button
            onClick={() => onSelect(order)}
            className="flex-1 h-11 rounded-xl bg-[#fff0ef] hover:bg-[#ffe9e8] text-[#241919] text-xs font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#7a1521]">assignment</span>
            <span>View Work Details & Slip</span>
          </button>
        )}

        <button
          aria-label="Directions"
          onClick={() => alert(`Opening navigation for ${order.location}`)}
          className="w-11 h-11 rounded-xl bg-[#fff0ef] text-[#574141] flex items-center justify-center hover:bg-[#ffe9e8] transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">navigation</span>
        </button>
      </div>
    </article>
  );
};
