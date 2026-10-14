import React, { useState } from 'react';
import { WorkOrder } from '../types';
import { TaskCard } from '../components/workOrders/TaskCard';
import { initiateCall } from '../services/callService';

interface JobsScreenProps {
  workOrders: WorkOrder[];
  onSelectOrder: (order: WorkOrder) => void;
  onStartJob: (order: WorkOrder) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
}

export const JobsScreen: React.FC<JobsScreenProps> = ({
  workOrders,
  onSelectOrder,
  onStartJob,
  searchQuery = '',
  onClearSearch,
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

  // Pending tasks list
  const pendingJobs = [
    {
      id: 'pending-1',
      title: 'Repair AC Unit - Lab 403',
      priority: 'Medium Priority',
      time: 'Today • 09:30 AM',
      location: 'Block C (Floor 4)',
      icon: 'ac_unit',
      iconBg: 'bg-[#fff0ef] text-[#7a1521]',
      badgeBg: 'bg-[#fff0ef] text-[#7a1521] border-[#ffe9e8]',
      targetReq: 'REQ-8291',
    },
    {
      id: 'pending-2',
      title: 'Replace Substation Fuse - Block B',
      priority: 'High Priority',
      time: 'Today • 10:15 AM',
      location: 'Substation B (Sector 4)',
      icon: 'bolt',
      iconBg: 'bg-[#ffdad6] text-[#ba1a1a]',
      badgeBg: 'bg-[#ffdad9] text-[#ba1a1a] border-[#ffb4ab]/40',
      targetReq: 'REQ-8254',
    },
  ];

  // Recently completed list
  const recentCompleted = [
    {
      id: 'recent-1',
      title: 'Elevator Inspection - Main Hall',
      subtitle: 'Main Hall • Shaft 2 • Safety Test Cleared',
      status: 'Completed',
      time: '2 hours ago',
    },
    {
      id: 'recent-2',
      title: 'Water Valve Drip Rectification',
      subtitle: 'Chemistry Lab • Sink Line 4',
      status: 'Signed Off',
      time: '3 hours ago',
    },
  ];

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

  // Filter active work orders based on status filter and search query
  const matchingWorkOrders = workOrders.filter((order) => {
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

  // Filter completed jobs based on search query
  const matchingCompleted = recentCompleted.filter((task) => {
    if (!q) return true;
    return (
      task.title.toLowerCase().includes(q) ||
      task.subtitle.toLowerCase().includes(q)
    );
  });

  const totalMatches = matchingPendingJobs.length + matchingWorkOrders.length + matchingCompleted.length;

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto">
      {/* Live Search Query Feedback Banner */}
      {searchQuery ? (
        <div className="bg-[#fff0ef] p-3 rounded-2xl border border-[#ffe9e8] flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-[18px] text-[#7a1521]">search</span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#241919] truncate">
                Results for "{searchQuery}"
              </span>
              <span className="text-[10px] text-[#574141]">
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

      {/* Shift Progress Summary Banner (Shown when not actively searching) */}
      {!searchQuery && (
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#debfbf]/40">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-[#574141] uppercase tracking-wider">
                Shift Operations • Today
              </span>
              <h2 className="text-[19px] font-bold text-[#241919] mt-0.5">
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
            <div className="flex justify-between items-center text-[11px] text-[#574141] mb-1 font-semibold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#7a1521]">trending_up</span>
                Shift Completion Target
              </span>
              <span>{finishedOrdersCount + 1} of {workOrders.length + 2} finished</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#ffe9e8] overflow-hidden flex">
              <div
                className="h-full bg-[#7a1521] rounded-full transition-all duration-500"
                style={{ width: '65%' }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Zero results state */}
      {searchQuery && totalMatches === 0 && (
        <div className="bg-white rounded-2xl p-6 text-center border border-[#debfbf]/40 flex flex-col items-center gap-2.5 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#fff0ef] text-[#7a1521] flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
          </div>
          <h4 className="text-sm font-bold text-[#241919]">No Matching Tasks Found</h4>
          <p className="text-xs text-[#574141] max-w-xs">
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
        <section className="flex flex-col gap-2.5">
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
              className="bg-white rounded-2xl p-4 shadow-sm border border-[#debfbf]/50 flex flex-col gap-3 relative overflow-hidden transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${job.badgeBg}`}>
                      {job.priority}
                    </span>
                    <span className="text-[10px] font-semibold text-[#8a7170]">{job.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#241919] leading-snug">
                    {job.title}
                  </h4>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${job.iconBg}`}>
                  <span className="material-symbols-outlined text-[18px]">{job.icon}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-[#574141] font-medium bg-[#fff0ef]/60 p-2.5 rounded-xl border border-[#ffe9e8]">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#7a1521]">location_on</span>
                  <span>Location: <strong>{job.location}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#7a1521]">calendar_today</span>
                  <span>Date: <strong>Today</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    const target = workOrders.find((w) => w.id === job.targetReq) || workOrders[0];
                    onStartJob(target);
                  }}
                  className="flex-1 h-10 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">near_me</span>
                  <span>Accept & Navigate</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDismissPending(job.id)}
                  className="px-4 h-10 rounded-xl bg-[#ffe9e8] hover:bg-[#ffdad9] text-[#7a1521] text-xs font-bold transition-all active:scale-95"
                >
                  Dismiss
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
            <span className="text-[11px] font-semibold text-[#574141]">
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

      {/* SECTION 3: RECENTLY COMPLETED */}
      {matchingCompleted.length > 0 && (
        <section className="flex flex-col gap-2.5 mt-2">
          <div className="flex items-center gap-1.5 px-1">
            <span className="material-symbols-outlined text-[18px] text-[#7a1521]">check_circle</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7a1521]">
              RECENTLY COMPLETED
            </h3>
          </div>

          {matchingCompleted.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-2xl p-3.5 shadow-sm border border-[#debfbf]/40 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h4 className="text-xs font-bold text-[#241919] truncate">{task.title}</h4>
                    <span className="text-[11px] text-[#574141] truncate">{task.subtitle}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                    {task.status}
                  </span>
                  <span className="text-[10px] text-[#8a7170] mt-0.5">{task.time}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Control Dispatch Contact Callout Banner */}
      <section className="w-full bg-[#fff0ef] rounded-2xl p-3.5 border border-[#ffe9e8] flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ffe9e8] flex items-center justify-center text-[#7a1521] shrink-0">
            <span className="material-symbols-outlined text-[20px]">support_agent</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#241919]">Facilities Dispatch Desk</span>
            <span className="text-[11px] text-[#574141]">+94 77 149 0016 • Central Office</span>
          </div>
        </div>
        <a
          href="tel:+94771490016"
          onClick={(e) => {
            e.preventDefault();
            initiateCall('Facilities Dispatch Desk (Central Office)');
          }}
          className="h-9 px-3.5 rounded-full bg-[#f3dedd] text-[#241919] text-xs font-bold flex items-center gap-1 hover:bg-[#7a1521] hover:text-white transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">call</span>
          <span>Call Desk</span>
        </a>
      </section>
    </div>
  );
};
