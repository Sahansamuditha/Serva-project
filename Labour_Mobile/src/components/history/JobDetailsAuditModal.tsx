import React from 'react';
import { JobDetailAudit } from '../../types';
import { initiateCall } from '../../services/callService';

interface JobDetailsAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditDetail: JobDetailAudit | null;
}

export const JobDetailsAuditModal: React.FC<JobDetailsAuditModalProps> = ({
  isOpen,
  onClose,
  auditDetail,
}) => {
  if (!isOpen || !auditDetail) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 w-full h-full bg-[#fcf8f8] flex flex-col overflow-hidden text-[#241919] animate-in slide-in-from-right duration-200 sm:max-w-md md:sm:max-w-lg sm:mx-auto sm:border sm:border-slate-300 sm:shadow-2xl"
    >
      {/* Mobile Screen App Bar */}
      <header className="sticky top-0 z-20 bg-[#1e293b] text-white px-4 py-3 flex items-center justify-between shadow-md relative overflow-hidden shrink-0">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-blue-500/10 pointer-events-none blur-xl" />
        
        <div className="flex items-center gap-2.5 relative z-10 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all shrink-0"
            aria-label="Back to History"
            title="Back to History"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full">
                Technical Diagnostics
              </span>
              <span className="text-[10px] font-semibold text-slate-300">
                {auditDetail.reqCode}
              </span>
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight truncate mt-0.5">
              {auditDetail.title}
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all shrink-0 relative z-10"
          aria-label="Close Diagnostics Details"
          title="Close"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </header>

      {/* Database Status Strip */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-sky-500" />
          <span className="font-semibold text-slate-700">Audit Ledger Record</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 font-semibold truncate max-w-[200px]">
          {auditDetail.dbAuditHash}
        </span>
      </div>

      {/* Mobile Screen Full Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 text-xs text-[#241919] no-scrollbar">
        {/* Issue Overview & Root Cause Analysis Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900 leading-snug">
              {auditDetail.title}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
              {auditDetail.severity}
            </span>
          </div>

          {/* Reported Symptom vs Root Cause */}
          <div className="grid grid-cols-1 gap-2 pt-1">
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">
                Reported Symptom / User Complaint
              </span>
              <p className="text-xs text-rose-950 mt-1 leading-relaxed font-medium">
                {auditDetail.reportedIssue}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                Engineering Root Cause Analysis
              </span>
              <p className="text-xs text-sky-950 mt-1 leading-relaxed font-medium">
                {auditDetail.rootCauseAnalysis}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-semibold block">Time Spent</span>
              <span className="font-bold text-slate-800 text-xs">{auditDetail.timeSpent}</span>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 font-semibold block">SLA Target</span>
              <span className="font-bold text-slate-800 text-xs">{auditDetail.slaTargetHours}</span>
            </div>
          </div>
        </div>

        {/* Live Technical Measurements & Diagnostics */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-[16px] text-sky-600">query_stats</span>
              <span>Telemetry Readings & Test Points</span>
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {auditDetail.measurements.length} Parameters Tested
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {auditDetail.measurements.map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-xs text-slate-800 block">{m.parameter}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Nominal: {m.nominalRange}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-xs text-slate-900 block">{m.reading}</span>
                  <span
                    className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      m.status === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical Execution Timeline */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-2">
            <span className="material-symbols-outlined text-[16px] text-sky-600">history_toggle_off</span>
            <span>Service Procedure Timeline</span>
          </span>

          <div className="space-y-3 pl-1">
            {auditDetail.timeline.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 relative">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                  <span className="material-symbols-outlined text-[12px]">check</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-bold text-xs text-slate-800">{item.step}</span>
                    <span className="font-mono text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Job Safety Protocol Checks */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-2">
            <span className="material-symbols-outlined text-[16px] text-emerald-600">health_and_safety</span>
            <span>Safety Inspection Verification</span>
          </span>

          <div className="space-y-2">
            {auditDetail.safetyChecklist.map((checkItem, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-700">{checkItem.check}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  <span>PASS</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Requester Feedback & Rating */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2">
          <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
            <span className="material-symbols-outlined text-[16px] text-amber-500">reviews</span>
            <span>Requester Sign-Off & Review</span>
          </span>

          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-100 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs italic text-slate-800">
                "{auditDetail.requesterFeedback.comment}"
              </p>
              <span className="text-[10px] text-slate-500 mt-1 block">
                — {auditDetail.requesterFeedback.submittedBy}
              </span>
            </div>

            <div className="flex items-center gap-0.5 text-amber-500 bg-white px-2 py-1 rounded-lg border border-amber-200 shadow-2xs shrink-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`material-symbols-outlined text-[14px] ${
                    i < auditDetail.requesterFeedback.rating ? 'text-amber-500' : 'text-slate-300'
                  }`}
                >
                  star
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned Bottom Phone Action Bar */}
      <footer className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] shrink-0">
        <a
          href="tel:+94771490016"
          onClick={(e) => {
            e.preventDefault();
            initiateCall('ITUM Operations Support Desk', '+94 77 149 0016', 'Field Operations');
          }}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 active:scale-95 border border-slate-300"
          title="Call Support (+94 77 149 0016)"
        >
          <span className="material-symbols-outlined text-[16px]">call</span>
          <span>Contact Desk (+94 77 149 0016)</span>
        </a>

        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-sm active:scale-95"
        >
          Close Diagnostics
        </button>
      </footer>
    </div>
  );
};
