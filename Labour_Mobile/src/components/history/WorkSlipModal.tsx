import React, { useState } from 'react';
import { WorkSlip } from '../../types';
import { initiateCall } from '../../services/callService';

interface WorkSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  workSlip: WorkSlip | null;
}

export const WorkSlipModal: React.FC<WorkSlipModalProps> = ({
  isOpen,
  onClose,
  workSlip,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen || !workSlip) return null;

  const totalPartsCost = workSlip.partsUsed.reduce(
    (sum, part) => sum + part.costLkr * part.quantity,
    0
  );

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1200);
  };

  const handleCopyHash = () => {
    navigator.clipboard?.writeText(workSlip.digitalSignatureHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 w-full h-full bg-[#fcf8f8] flex flex-col overflow-hidden text-[#241919] animate-in slide-in-from-right duration-200 sm:max-w-md md:sm:max-w-lg sm:mx-auto sm:border sm:border-[#debfbf]/80 sm:shadow-2xl"
    >
      {/* Mobile Screen App Bar */}
      <header className="sticky top-0 z-20 bg-[#7a1521] text-white px-4 py-3 flex items-center justify-between shadow-md relative overflow-hidden shrink-0">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none blur-xl" />
        
        <div className="flex items-center gap-2.5 relative z-10 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all shrink-0"
            aria-label="Back to History"
            title="Back to History"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          
          <div className="min-w-0 flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                Work Slip
              </span>
              <span className="text-[10px] font-semibold text-[#ffdad6]">
                {workSlip.reqCode}
              </span>
            </div>
            <h1 className="text-sm font-bold text-white tracking-tight truncate mt-0.5">
              {workSlip.jobTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1.5 relative z-10 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all"
            title="Export / Download Work Slip"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white flex items-center justify-center transition-all"
            aria-label="Close Work Slip Screen"
            title="Close"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </header>

      {/* Database Live Verification Status Banner */}
      <div className="bg-[#fff0ef] border-b border-[#ffe9e8] px-4 py-2 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-semibold text-[#7a1521]">Verified Maintenance Ledger</span>
        </div>
        <span className="font-mono text-[10px] text-[#574141] font-semibold">
          {workSlip.dbRecordId}
        </span>
      </div>

      {/* Download Success Banner */}
      {downloadSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold animate-in fade-in slide-in-from-top-1 shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Official ISO 9001 Work Slip downloaded successfully!</span>
          </div>
          <button
            type="button"
            onClick={() => setDownloadSuccess(false)}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Screen Full Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 text-xs text-[#241919] no-scrollbar">
        {/* Certificate Identification Box */}
        <div className="bg-white rounded-2xl p-3.5 border border-[#debfbf]/60 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#8a7170] tracking-wider">
              Certificate No.
            </span>
            <span className="font-mono text-xs font-bold text-[#7a1521]">
              {workSlip.isoComplianceCert}
            </span>
          </div>
          <div className="flex items-center gap-1 bg-[#fff0ef] text-[#7a1521] px-2.5 py-1 rounded-xl font-bold text-[11px] border border-[#ffe9e8]">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>{workSlip.status}</span>
          </div>
        </div>

        {/* Work Order Primary Metadata Card */}
        <div className="bg-white rounded-2xl p-4 border border-[#debfbf]/60 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2 border-b border-[#ffe9e8] pb-2.5">
            <div>
              <span className="text-[10px] font-bold text-[#8a7170] uppercase tracking-wider">
                Maintenance Division
              </span>
              <p className="font-bold text-sm text-[#241919] mt-0.5">{workSlip.division}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#8a7170] uppercase tracking-wider">
                Priority
              </span>
              <p className="font-bold text-xs text-[#7a1521] mt-0.5">{workSlip.priority}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#fff0ef] rounded-xl p-2.5 border border-[#ffe9e8]">
              <span className="text-[10px] text-[#8a7170] font-semibold block">Date Executed</span>
              <span className="font-bold text-[#241919]">{workSlip.dateLabel}</span>
            </div>
            <div className="bg-[#fff0ef] rounded-xl p-2.5 border border-[#ffe9e8]">
              <span className="text-[10px] text-[#8a7170] font-semibold block">Time Spent</span>
              <span className="font-bold text-[#241919]">{workSlip.durationSpent}</span>
            </div>
          </div>

          {/* Location & Room */}
          <div className="bg-[#fff0ef] rounded-xl p-3 border border-[#ffe9e8] flex items-start gap-2">
            <span className="material-symbols-outlined text-[#7a1521] text-[18px] shrink-0 mt-0.5">
              location_on
            </span>
            <div className="flex-1 min-w-0">
              <span className="font-bold text-xs text-[#241919] block">{workSlip.location}</span>
              {workSlip.subLocation && (
                <span className="text-[11px] text-[#574141] block mt-0.5">
                  Sub-Location: {workSlip.subLocation}
                </span>
              )}
            </div>
          </div>

          {/* Requester Contact Box */}
          <div className="bg-white rounded-xl p-3 border border-[#debfbf]/50 shadow-2xs flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[#7a1521] font-bold text-[11px]">
              <span className="material-symbols-outlined text-[15px]">person</span>
              <span>Job Requester</span>
            </div>
            <p className="font-semibold text-xs text-[#241919] mt-0.5">{workSlip.requesterName}</p>
            <div className="flex items-center justify-between text-[11px] text-[#574141]">
              <span>{workSlip.requesterDept}</span>
              <a
                href="tel:+94771490016"
                onClick={(e) => {
                  e.preventDefault();
                  initiateCall(`Requester: ${workSlip.requesterName} (${workSlip.requesterDept})`, '+94 77 149 0016', workSlip.location);
                }}
                className="font-bold text-[#7a1521] hover:underline flex items-center gap-0.5 active:scale-95 transition-transform"
                title="Direct Call Requester (+94 77 149 0016)"
              >
                <span className="material-symbols-outlined text-[13px]">call</span>
                <span>{workSlip.requesterContact}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Technician In Charge Box */}
        <div className="bg-[#fff0ef] rounded-2xl p-3.5 border border-[#ffe9e8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              KP
            </div>
            <div>
              <span className="text-[10px] text-[#8a7170] uppercase font-bold block">
                Lead Technician
              </span>
              <span className="font-bold text-xs text-[#241919]">{workSlip.technicianName}</span>
              <span className="text-[10px] text-[#574141] block">
                ID: {workSlip.technicianEmpId}
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-white text-[#7a1521] text-[10px] font-bold border border-[#debfbf]/60 shadow-2xs">
            Assigned Bay 3
          </span>
        </div>

        {/* Work Description & Execution Summary */}
        <div className="bg-white rounded-2xl p-4 border border-[#debfbf]/60 shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-[#7a1521] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">build</span>
            <span>Summary of Work Performed</span>
          </span>
          <p className="text-xs text-[#574141] leading-relaxed bg-[#fff0ef] p-3 rounded-xl border border-[#ffe9e8]">
            {workSlip.summaryOfWork}
          </p>
          <div className="flex items-center justify-between text-[11px] text-[#8a7170] pt-1">
            <span>Started: <strong>{workSlip.timeStarted}</strong></span>
            <span>Completed: <strong>{workSlip.timeFinished}</strong></span>
          </div>
        </div>

        {/* Itemized Parts Used & Cost Schedule */}
        <div className="bg-white rounded-2xl p-4 border border-[#debfbf]/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#ffe9e8] pb-2">
            <span className="text-[11px] font-bold text-[#7a1521] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">inventory</span>
              <span>Replaced Parts & Consumables</span>
            </span>
            <span className="text-[10px] font-bold text-[#8a7170]">
              {workSlip.partsUsed.length} item(s)
            </span>
          </div>

          <div className="divide-y divide-[#ffe9e8]">
            {workSlip.partsUsed.map((part, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-xs text-[#241919] block truncate">
                    {part.name}
                  </span>
                  <span className="font-mono text-[10px] text-[#8a7170]">
                    P/N: {part.partNumber} • Qty: {part.quantity}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-xs text-[#241919] block">
                    LKR {(part.costLkr * part.quantity).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-[#8a7170]">
                    (@ LKR {part.costLkr.toLocaleString()})
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Parts Subtotal Banner */}
          <div className="bg-[#fff0ef] rounded-xl p-3 border border-[#ffe9e8] flex items-center justify-between mt-2">
            <span className="font-bold text-xs text-[#241919]">Total Replaced Parts Cost</span>
            <span className="font-bold text-sm text-[#7a1521]">
              LKR {totalPartsCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Digital Verification & ISO Sign-off Ledger */}
        <div className="bg-white rounded-2xl p-4 border border-[#debfbf]/60 shadow-xs space-y-3">
          <span className="text-[11px] font-bold text-[#7a1521] uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">draw</span>
            <span>Digital Sign-Off & Verification</span>
          </span>

          <div className="bg-[#fff0ef] rounded-xl p-3 border border-[#ffe9e8] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#241919]">
                {workSlip.verifierName}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[12px]">verified</span>
                <span>Verified</span>
              </span>
            </div>
            <span className="text-[11px] text-[#574141] block">{workSlip.verifierRole}</span>
          </div>

          {/* Cryptographic Hash */}
          <div className="bg-[#fff0ef]/60 rounded-xl p-2.5 border border-[#ffe9e8] flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#8a7170]">
                SHA-256 Audit Seal
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="text-[10px] text-[#7a1521] hover:underline font-bold flex items-center gap-0.5"
              >
                <span className="material-symbols-outlined text-[12px]">content_copy</span>
                <span>{copiedHash ? 'Hash Copied!' : 'Copy Hash'}</span>
              </button>
            </div>
            <span className="font-mono text-[9px] text-[#7a1521] break-all leading-tight">
              {workSlip.digitalSignatureHash}
            </span>
          </div>
        </div>
      </div>

      {/* Pinned Bottom Phone Action Bar */}
      <footer className="p-3 bg-white border-t border-[#ffe9e8] flex items-center justify-between gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] shrink-0">
        <a
          href="tel:+94771490016"
          onClick={(e) => {
            e.preventDefault();
            initiateCall('Facilities Control Room Hotline', '+94 77 149 0016', 'Central ITUM Maintenance');
          }}
          className="px-3.5 py-2.5 rounded-xl bg-[#fff0ef] hover:bg-[#ffe9e8] text-[#7a1521] font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 active:scale-95 border border-[#debfbf]/50"
          title="Call Hotline (+94 77 149 0016)"
        >
          <span className="material-symbols-outlined text-[16px]">call</span>
          <span>Hotline (+94 77 149 0016)</span>
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-4 py-2.5 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-60"
          >
            {isDownloading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download Slip</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2.5 rounded-xl border border-[#debfbf] text-[#574141] font-bold text-xs hover:bg-[#fff0ef] transition-colors active:scale-95"
          >
            Close
          </button>
        </div>
      </footer>
    </div>
  );
};
