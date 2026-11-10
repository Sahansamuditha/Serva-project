import React, { useState } from 'react';
import { WorkOrder, LaborerProfile } from '../types';
import { TaskCard } from '../components/workOrders/TaskCard';

interface JobsScreenProps {
  workOrders: WorkOrder[];
  onSelectOrder: (order: WorkOrder) => void;
  onStartJob: (order: WorkOrder) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
  workerProfile?: LaborerProfile;
  onNavigateProfile?: () => void;
}

export const JobsScreen: React.FC<JobsScreenProps> = ({
  workOrders,
  onSelectOrder,
  onStartJob,
  searchQuery = '',
  onClearSearch,
  workerProfile,
  onNavigateProfile,
}) => {
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'in_progress'>('all');
  const [dismissedCards, setDismissedCards] = useState<string[]>([]);

  const activeOrdersCount = workOrders.filter((w) => w.status === 'In Progress').length;
  const finishedOrdersCount = workOrders.filter(
    (w) => w.status === 'Completed' || w.status === 'Signed Off'
  ).length;

  const handleDismissPending = (cardId: string) => {
    setDismissedCards((prev) => [...prev, cardId]);
  };

  // Pending tasks list derived from real work orders
  const pendingJobs = workOrders
    .filter((w) => (w.status === 'Assigned' || w.status === 'Pending Start' || w.status === 'Pending') && w.status !== 'Rejected' && w.status !== 'Cancelled' && !w.technicianRemarks?.includes('[REJECTED]'))
    .map((w) => ({
      id: `pending-${w.id}`,
      title: w.title,
      priority: `${w.priority} Priority`,
      time: w.assignedTime || 'Today',
      location: w.location,
      icon: w.category?.toLowerCase().includes('elec')
        ? 'bolt'
        : w.category?.toLowerCase().includes('water') || w.category?.toLowerCase().includes('plumb')
          ? 'water_drop'
          : 'build',
      iconBg: w.priority === 'HIGH' || w.priority === 'CRITICAL' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#fff0ef] text-[#7a1521]',
      badgeBg: w.priority === 'HIGH' || w.priority === 'CRITICAL' ? 'bg-[#fee2e2] text-[#b91c1c] border-[#fca5a5]' : 'bg-[#fff0ef] text-[#7a1521] border-[#ffe9e8]',
      targetReq: w.id,
    }));

  const q = searchQuery.toLowerCase().trim();

  // Filter pending jobs based on search query
  const matchingPendingJobs = pendingJobs.filter((job) => {
    if (dismissedCards.includes(job.id)) return false;
    if (!q) return true;
    return (
      job.title.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.priority.toLowerCase().includes(q)
    );
  });

  // Filter active work orders based on status filter and search query (Exclude completed and rejected jobs from active tasks)
  const matchingWorkOrders = workOrders.filter((order) => {
    // Exclude Completed and Signed Off jobs from Jobs tab (They belong only in History)
    if (order.status === 'Completed' || order.status === 'Signed Off') return false;

    // Do NOT show unaccepted jobs in Active & Assigned tasks; they belong in PENDING JOBS until accepted by supervisor
    if (order.status === 'Assigned' || order.status === 'Pending Start' || order.status === 'Pending') return false;

    // Exclude Rejected, Cancelled, or declined jobs from Jobs tab (They belong only in History)
    if (order.status === 'Rejected' || order.status === 'Cancelled' || order.technicianRemarks?.includes('[REJECTED]')) return false;

    if (filter === 'high' && !(order.priority === 'HIGH' || order.priority === 'CRITICAL')) return false;
    if (filter === 'medium' && order.priority !== 'MEDIUM') return false;
    if (filter === 'in_progress' && order.status !== 'In Progress') return false;

    if (!q) return true;
    return (
      order.title.toLowerCase().includes(q) ||
      order.id.toLowerCase().includes(q) ||
      order.category.toLowerCase().includes(q) ||
      order.location.toLowerCase().includes(q) ||
      (order.subLocation && order.subLocation.toLowerCase().includes(q)) ||
      order.department.toLowerCase().includes(q) ||
      order.description.toLowerCase().includes(q) ||
      order.requesterName.toLowerCase().includes(q)
    );
  });

  const totalMatches = matchingPendingJobs.length + matchingWorkOrders.length;

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto">
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
                {totalMatches} matching {totalMatches === 1 ? 'task' : 'tasks'} found
              </span>
            </div>
          </div>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="px-2.5 py-1 rounded-xl bg-white text-[#7a1521] text-xs font-bold border border-[#ffe9e8] hover:bg-[#ffdad9] transition-colors shrink-0"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : null}

      {/* 1. Welcome Greeting Card (Matching Maintenance Officer Design) */}
      {!searchQuery && (
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0] relative overflow-hidden">
          {/* Soft decorative background shape on the right */}
          <div
            className="absolute -right-4 -top-4 w-32 h-32 rounded-full bg-[#fff1f2] opacity-70 pointer-events-none"
          />

          <div className="flex items-center justify-between relative z-10">
            {/* Left Text Column */}
            <div className="flex-1 min-w-0 mr-3">
              {/* Top Date Pill */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#fff1f2] border border-[#ffe4e6] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]" />
                <span className="text-[11.5px] font-bold text-[#7a1521]">
                  {formattedDate}
                </span>
              </div>

              {/* Greeting Headline */}
              <h1 className="text-[19px] sm:text-[20px] font-black text-[#111827] leading-snug tracking-tight mb-1 truncate">
                Good morning, {workerProfile?.name || 'Supervisor'}
              </h1>

              {/* Subtitle */}
              <p className="text-xs text-[#64748b] font-medium truncate">
                {workerProfile?.division || 'ITUM Central Maintenance Division'}
              </p>
            </div>

            {/* Right Avatar */}
            <div
              onClick={onNavigateProfile}
              className="shrink-0 cursor-pointer shadow-md shadow-black/5 ring-2 ring-white rounded-2xl overflow-hidden w-14 h-14 bg-[#f1f5f9] hover:scale-105 active:scale-95 transition-transform flex items-center justify-center text-[#7a1521]"
              title="View Profile"
            >
              {workerProfile?.avatarUrl ? (
                <img
                  src={workerProfile.avatarUrl}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[32px]">person</span>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Red Alert Card: Unaccepted Jobs Banner (Only shown when there are pending unaccepted jobs) */}
      {!searchQuery && matchingPendingJobs.length > 0 && (
        <div
          onClick={() => {
            const el = document.getElementById('pending-jobs-section');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }}
          className="relative overflow-hidden rounded-2xl bg-[#ba1a1a] text-white p-3.5 shadow-md flex items-center justify-between cursor-pointer hover:bg-[#a51515] active:scale-[0.99] transition-all"
        >
          <div className="flex items-center gap-3 min-w-0 pr-2">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 shrink-0">
              <span className="material-symbols-outlined text-white text-[22px]">e911_emergency</span>
              <span className="animate-ping absolute inset-0 rounded-xl bg-white/30 opacity-75" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-extrabold uppercase tracking-wide leading-tight">
                UNACCEPTED JOBS PENDING
              </span>
              <p className="text-[11.5px] text-white/90 leading-tight mt-0.5 truncate">
                {`Moratuwa Campus • ${matchingPendingJobs.length} unaccepted job${matchingPendingJobs.length === 1 ? '' : 's'} awaiting response.`}
              </p>
            </div>
          </div>
          <span className="material-symbols-outlined text-white/80 text-[20px] shrink-0">
            chevron_right
          </span>
        </div>
      )}

      {/* 2. Shift Progress Summary Banner (Shown when not actively searching) */}
      {!searchQuery && (
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]/40">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">
                Shift Operations • Today
              </span>
              <h2 className="text-[19px] font-bold text-[#1e293b] mt-0.5">
                Work Orders & Dispatch
              </h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fff0ef] text-[#7a1521] border border-[#ffe9e8]">
              <span className="w-2 h-2 rounded-full bg-[#7a1521] animate-pulse" />
              <span className="text-[11px] font-bold">{activeOrdersCount} Active</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between items-center text-[11px] text-[#475569] mb-1 font-semibold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#7a1521]">trending_up</span>
                Shift Completion Target
              </span>
              <span>{finishedOrdersCount} of {workOrders.length} finished</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#ffe9e8] overflow-hidden flex">
              <div
                className="h-full bg-[#7a1521] rounded-full transition-all duration-500"
                style={{ width: `${workOrders.length > 0 ? Math.round((finishedOrdersCount / workOrders.length) * 100) : 0}%` }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Zero results state */}
      {searchQuery && totalMatches === 0 && (
        <div className="bg-white rounded-2xl p-6 text-center border border-[#e2e8f0]/40 flex flex-col items-center gap-2.5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#fff0ef] text-[#7a1521] flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h4 className="text-sm font-bold text-[#1e293b]">No Matching Tasks Found</h4>
          <p className="text-xs text-[#475569] max-w-xs">
            No work orders, pending jobs, or completed tasks matched "{searchQuery}". Try searching by equipment name, location, or request ID.
          </p>
          {onClearSearch && (
            <button
              type="button"
              onClick={onClearSearch}
              className="mt-2 px-4 py-2 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              Reset Search Filter
            </button>
          )}
        </div>
      )}

      {/* SECTION 1: PENDING JOBS */}
      {matchingPendingJobs.length > 0 && (
        <section id="pending-jobs-section" className="flex flex-col gap-2.5 scroll-mt-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#7a1521]">pending_actions</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a1521]">
                PENDING JOBS
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad9] text-[#58000f] text-[10px] font-bold">
              {matchingPendingJobs.length} {matchingPendingJobs.length === 1 ? 'Dispatch' : 'Dispatches'}
            </span>
          </div>

          {matchingPendingJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]/50 flex flex-col gap-3 relative overflow-hidden transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${job.badgeBg}`}>
                      {job.priority}
                    </span>
                    <span className="text-[10px] font-semibold text-[#64748b]">{job.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#1e293b] leading-snug">
                    {job.title}
                  </h4>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${job.iconBg}`}>
                  <span className="material-symbols-outlined text-[18px]">{job.icon}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#475569] font-medium bg-[#fff0ef]/60 p-2.5 rounded-xl border border-[#ffe9e8]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#7a1521]">location_on</span>
                  <span>Location: <strong>{job.location}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#7a1521]">calendar_today</span>
                  <span>Date: <strong>Today</strong></span>
                </div>
              </div>

              {/* Action Button: View Details */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const target = workOrders.find((w) => w.id === job.targetReq) || {
                      ...workOrders[0],
                      id: job.targetReq,
                      title: job.title,
                      location: job.location,
                      status: 'Pending Start' as const,
                    };
                    onSelectOrder({ ...target, status: 'Pending Start' });
                  }}
                  className="w-full h-11 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>View Details</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* SECTION 2: ASSIGNED DISPATCH TASKS */}
      {matchingWorkOrders.length > 0 && (
        <section className="flex flex-col gap-2.5 mt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#7a1521]">assignment</span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a1521]">
                ACTIVE & ASSIGNED TASKS
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-[#475569]">
              {matchingWorkOrders.length} Tasks
            </span>
          </div>

          {/* Task Cards */}
          <div className="flex flex-col gap-3">
            {matchingWorkOrders.map((order) => (
              <TaskCard
                key={order.id}
                order={order}
                onSelect={onSelectOrder}
                onStartJob={onStartJob}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State when no tasks are assigned */}
      {!searchQuery && matchingWorkOrders.length === 0 && matchingPendingJobs.length === 0 && (
        <section className="bg-white rounded-2xl p-7 text-center border border-[#e2e8f0]/60 flex flex-col items-center gap-3 shadow-xs my-2">
          <div className="w-14 h-14 rounded-full bg-[#fff0ef] text-[#7a1521] flex items-center justify-center">
            <span className="material-symbols-outlined text-[30px]">assignment_turned_in</span>
          </div>
          <div className="flex flex-col">
            <h4 className="text-sm font-bold text-[#1e293b]">No Active Tasks Assigned</h4>
            <p className="text-xs text-[#64748b] max-w-xs mt-1 leading-relaxed">
              You currently have no pending tasks. When the Maintenance Officer dispatches a maintenance request, it will appear here.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};
