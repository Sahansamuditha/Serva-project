import React, { useState } from 'react';
import { WorkOrder, WorkOrderStatus } from '../types';
import { PhotoUploaderModal } from '../components/common/PhotoUploaderModal';
import { initiateCall } from '../services/callService';

interface JobDetailsScreenProps {
  order: WorkOrder;
  onBack: () => void;
  onUpdateStatus: (id: string, newStatus: WorkOrderStatus, remarks?: string, proofPhotoUrl?: string) => void;
}

export const JobDetailsScreen: React.FC<JobDetailsScreenProps> = ({
  order,
  onBack,
  onUpdateStatus,
}) => {
  const [currentStatus, setCurrentStatus] = useState<WorkOrderStatus>(order.status);
  const [remarks, setRemarks] = useState(order.technicianRemarks || '');
  const [proofPhoto, setProofPhoto] = useState<string | undefined>(order.proofPhotoUrl);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isSuccessNotification, setIsSuccessNotification] = useState(false);

  const quickTags = [
    '+ Flushed drain line',
    '+ Refilled R410A',
    '+ Cleaned coils',
    '+ Replaced faceplate',
    '+ Checked wiring',
  ];

  const handleTagClick = (tag: string) => {
    if (!remarks.includes(tag)) {
      setRemarks(remarks ? `${remarks} ${tag}` : tag);
    }
  };

  const handleStatusChange = (status: WorkOrderStatus) => {
    setCurrentStatus(status);
    if (status === 'Completed') {
      setIsPhotoModalOpen(true);
    }
  };

  const handlePhotoUploadSuccess = (photoUrl: string, uploadedNotes: string) => {
    setProofPhoto(photoUrl);
    if (uploadedNotes) {
      setRemarks((prev) => (prev ? `${prev} • ${uploadedNotes}` : uploadedNotes));
    }
  };

  const handleSaveOrComplete = () => {
    onUpdateStatus(order.id, currentStatus, remarks, proofPhoto);
    setIsSuccessNotification(true);
    setTimeout(() => {
      setIsSuccessNotification(false);
      onBack();
    }, 1400);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 max-w-md mx-auto">
      {/* Header Navigation Bar for Job Details */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-[#debfbf]/40 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back to work orders list"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#fff0ef] border border-[#debfbf]/50 text-[#7a1521] hover:bg-[#ffe9e8] transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>

        <div className="text-center leading-tight">
          <h1 className="text-base font-bold text-[#241919] tracking-tight">Job Details</h1>
          <p className="text-[10px] font-bold text-[#7a1521] uppercase tracking-wide">
            #{order.id} • {order.category}
          </p>
        </div>

        <a
          href="tel:+94771490016"
          onClick={(e) => {
            e.preventDefault();
            initiateCall(`Requester: ${order.requesterName} (${order.requesterDept})`, '+94 77 149 0016', order.location);
          }}
          aria-label="Call Requester (+94 77 149 0016)"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#fff0ef] border border-[#ffe9e8] text-[#7a1521] shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
        </a>
      </div>

      {/* Success Notification Alert */}
      {isSuccessNotification && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Job status updated to "{currentStatus}" successfully!</span>
          </div>
        </div>
      )}

      {/* Section 1: Job Overview */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#debfbf]/40 relative overflow-hidden">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fff0ef] text-[#7a1521] border border-[#ffe9e8]">
            <span className="material-symbols-outlined text-sm">tag</span>
            {order.jobCode}
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/30">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
            {order.priority} PRIORITY
          </span>
        </div>

        {/* Problem Title */}
        <h2 className="text-lg font-bold text-[#241919] leading-snug">
          {order.title}
        </h2>

        {/* Requester Information */}
        <div className="mt-3 flex items-center gap-3 p-2.5 bg-[#fff0ef] rounded-xl border border-[#ffe9e8]">
          <div className="w-9 h-9 rounded-full bg-[#7a1521] flex items-center justify-center text-white font-bold text-xs tracking-wider shrink-0">
            {order.requesterName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#241919] truncate">{order.requesterName}</p>
            <p className="text-[11px] text-[#574141] truncate">
              {order.requesterDept} • <span className="font-semibold text-[#7a1521]">+94 77 149 0016</span>
            </p>
          </div>
          <a
            href="tel:+94771490016"
            onClick={(e) => {
              e.preventDefault();
              initiateCall(`Requester: ${order.requesterName}`, '+94 77 149 0016', order.requesterDept);
            }}
            className="text-xs font-bold text-[#7a1521] bg-white px-2.5 py-1 rounded-lg border border-[#debfbf] shadow-2xs shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[14px]">call</span>
            <span>+94 77 149 0016</span>
          </a>
        </div>

        {/* Location & Due Time Banner */}
        <div className="mt-3 bg-[#fff0ef] rounded-xl p-3 border border-[#ffe9e8] flex flex-col gap-1.5">
          <div className="flex items-start gap-2 text-[#241919]">
            <span className="material-symbols-outlined text-[#7a1521] text-lg shrink-0 mt-0.5">
              location_on
            </span>
            <div className="text-xs">
              <span className="font-bold">{order.location}</span>
              {order.subLocation && <p className="text-[11px] text-[#574141]">{order.subLocation}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#574141] pt-1.5 border-t border-[#ffe9e8]">
            <span className="material-symbols-outlined text-amber-600 text-base shrink-0">
              schedule
            </span>
            <span className="font-medium">
              Due Today by <strong className="text-[#241919]">{order.dueTime}</strong>
            </span>
          </div>
        </div>

        {/* Issue Description */}
        <div className="mt-3.5">
          <label className="text-[10px] font-bold text-[#8a7170] uppercase tracking-wider block mb-1">
            Issue Description & Diagnostic Narrative
          </label>
          <p className="text-xs text-[#574141] leading-relaxed bg-[#fff8f7] p-3 rounded-xl border border-[#ffe9e8]">
            {order.description}
          </p>
        </div>

        {/* Reported Photo Attachment */}
        {order.reportedPhotoUrl && (
          <div className="mt-3.5">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[10px] font-bold text-[#8a7170] uppercase tracking-wider">
                Reported Equipment Photo
              </span>
              <span className="text-[11px] font-medium text-[#8a7170]">{order.reportedPhotoTimestamp}</span>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-[#debfbf] shadow-sm bg-slate-100 aspect-video">
              <img
                src={order.reportedPhotoUrl}
                alt="Equipment issue"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-2.5">
                <span className="text-[11px] font-semibold text-white flex items-center gap-1 drop-shadow-sm">
                  <span className="material-symbols-outlined text-sm">ac_unit</span> Heavy Frost & Leak Detected
                </span>
                <button
                  type="button"
                  onClick={() => window.open(order.reportedPhotoUrl, '_blank')}
                  className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/20"
                >
                  <span className="material-symbols-outlined text-xs">zoom_in</span> Tap to expand
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Section 2: Interactive Field Action & Progress Stepper */}
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#debfbf]/40 space-y-4">
        <div>
          <label className="text-xs font-bold text-[#241919] block mb-2">
            Step-by-Step Progress Tracking
          </label>

          {/* Segmented Status Toggle Group */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#fff0ef] rounded-xl border border-[#ffe9e8] text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleStatusChange('In Progress')}
              className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-[11px] font-bold ${
                currentStatus === 'In Progress'
                  ? 'bg-[#7a1521] text-white shadow-sm ring-2 ring-[#7a1521]/30'
                  : 'text-[#574141] hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-sm">sync</span>
              <span>In Progress</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('On Hold')}
              className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-[11px] font-bold ${
                currentStatus === 'On Hold'
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                  : 'text-[#574141] hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-sm">pause_circle</span>
              <span>On Hold</span>
            </button>

            <button
              type="button"
              onClick={() => handleStatusChange('Completed')}
              className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-[11px] font-bold ${
                currentStatus === 'Completed' || currentStatus === 'Signed Off'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                  : 'text-[#574141] hover:bg-white/80'
              }`}
            >
              <span className="material-symbols-outlined text-sm">check_circle</span>
              <span>Completed</span>
            </button>
          </div>
        </div>

        {/* Proof of Work Photo Section */}
        <div>
          <label className="text-xs font-bold text-[#241919] block mb-1">
            Proof of Completed Work Evidence
          </label>
          <p className="text-[11px] text-[#574141] mb-2">
            Attach photo of rectified equipment, clean coils, or replacement seal.
          </p>

          {proofPhoto ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm aspect-video">
              <img src={proofPhoto} alt="Proof" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">verified</span> Uploaded & GPS Stamped
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute bottom-2 right-2 bg-black/70 text-white px-2.5 py-1 rounded-lg text-xs font-semibold hover:bg-black"
              >
                Change Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsPhotoModalOpen(true)}
              className="w-full border-2 border-dashed border-[#7a1521]/40 hover:border-[#7a1521] bg-[#fff0ef]/60 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#ffdad9] text-[#7a1521] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-xl">photo_camera</span>
              </div>
              <span className="text-xs font-bold text-[#7a1521]">Capture Proof Photo</span>
              <span className="text-[10px] text-[#8a7170] mt-0.5">
                JPEG, PNG up to 15MB • GPS Stamped
              </span>
            </button>
          )}
        </div>

        {/* Work Remarks & Notes */}
        <div>
          <label className="text-xs font-bold text-[#241919] block mb-1" htmlFor="technician-remarks">
            Technician Work Remarks
          </label>
          <textarea
            id="technician-remarks"
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Add work notes (e.g. Filter replaced, gas refilled, drain line flushed)..."
            className="w-full text-xs rounded-xl border-[#debfbf] focus:border-[#7a1521] focus:ring-1 focus:ring-[#7a1521] p-2.5 bg-[#fff8f7]"
          />

          {/* Quick Tag Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="text-[11px] font-medium bg-[#fff0ef] text-[#574141] px-2.5 py-1 rounded-full hover:bg-[#7a1521] hover:text-white border border-[#debfbf] transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Fixed Bottom Actions Section strictly inside mobile container */}
      <aside className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#ffe9e8] p-3 shadow-[0_-4px_16px_rgba(122,21,33,0.08)] z-40 flex flex-col gap-2 rounded-b-[40px] sm:rounded-b-[44px] pb-6">
        <button
          type="button"
          onClick={handleSaveOrComplete}
          className="w-full bg-[#7a1521] hover:bg-[#58000f] active:bg-[#480a11] text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>
            {currentStatus === 'Completed' ? 'Save & Mark Completed' : 'Save Status & Update'}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleSaveOrComplete}
            className="w-full bg-[#fff0ef] hover:bg-[#ffe9e8] text-[#574141] font-semibold text-xs py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-[#debfbf]/40"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            <span>Save Draft</span>
          </button>
          <a
            href="tel:+94771490016"
            onClick={(e) => {
              e.preventDefault();
              initiateCall('Facilities Control Room Support Desk', '+94 77 149 0016', 'Central ITUM Maintenance Helpdesk');
            }}
            className="w-full bg-[#ffdad9] hover:bg-[#ffb3b2] text-[#410009] font-semibold text-xs py-2 rounded-xl border border-[#7a1521]/20 transition-colors flex items-center justify-center gap-1.5"
            title="Call Support (+94 77 149 0016)"
          >
            <span className="material-symbols-outlined text-sm">support_agent</span>
            <span>Need Help</span>
          </a>
        </div>
      </aside>

      {/* Photo Uploader Modal */}
      <PhotoUploaderModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onUploadSuccess={handlePhotoUploadSuccess}
        ticketId={`#${order.id}`}
      />
    </div>
  );
};
