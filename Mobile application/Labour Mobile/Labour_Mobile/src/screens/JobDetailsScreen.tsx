import React, { useState, useRef, useEffect } from 'react';
import { WorkOrder, WorkOrderStatus } from '../types';
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
  const isRejectedOrder = order.status === 'Rejected' || order.status === 'Cancelled' || Boolean(order.technicianRemarks?.includes('[REJECTED]'));
  const isPendingStart = !isRejectedOrder && (order.status === 'Pending Start' || order.status === 'Assigned' || order.status === 'Pending');
  const [isAccepted, setIsAccepted] = useState<boolean>(!isPendingStart && !isRejectedOrder);
  const [currentStatus, setCurrentStatus] = useState<WorkOrderStatus>(
    isRejectedOrder ? 'Rejected' : (isPendingStart ? 'In Progress' : order.status)
  );
  const [remarks, setRemarks] = useState(order.technicianRemarks || '');
  const [proofPhoto, setProofPhoto] = useState<string | undefined>(order.proofPhotoUrl);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSuccessNotification, setIsSuccessNotification] = useState(false);
  const [isAcceptSuccess, setIsAcceptSuccess] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [isConfirmRejectModalOpen, setIsConfirmRejectModalOpen] = useState(false);
  const [isRejectSuccess, setIsRejectSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const evidenceSectionRef = useRef<HTMLDivElement>(null);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);
  const [modalZoomScale, setModalZoomScale] = useState<number>(1);

  const openImagePreview = (url: string) => {
    setPreviewModalImage(url);
    setModalZoomScale(1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewModalImage) {
        setPreviewModalImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModalImage]);

  const normalizeUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (url.startsWith('/')) {
      return url;
    }
    return `/${url}`;
  };

  // Gather all available evidence photos from reportedPhotos or reportedPhotoUrl
  const allEvidencePhotos: Array<{ url: string; name?: string; size?: string }> = React.useMemo(() => {
    if (order.reportedPhotos && order.reportedPhotos.length > 0) {
      return order.reportedPhotos
        .filter((p) => Boolean(p.url))
        .map((p) => ({ ...p, url: normalizeUrl(p.url) }));
    }
    if (order.reportedPhotoUrl) {
      return [{ url: normalizeUrl(order.reportedPhotoUrl), name: 'Reported Evidence Photo' }];
    }
    return [];
  }, [order.reportedPhotos, order.reportedPhotoUrl]);

  const handleAcceptJob = () => {
    setIsAccepted(true);
    setCurrentStatus('In Progress');
    onUpdateStatus(order.id, 'In Progress', remarks, proofPhoto);
    setIsAcceptSuccess(true);
    setTimeout(() => setIsAcceptSuccess(false), 2200);
  };

  const quickRejectReasons = [
    'Missing required tools or parts',
    'Safety hazard observed on site',
    'Requires certified specialist',
    'Outside assigned working hours',
    'Over scheduling capacity for today',
  ];

  const handleProceedReject = () => {
    if (!rejectReason.trim()) {
      setRejectError('Please state a reason before rejecting the job.');
      return;
    }
    setRejectError(null);
    setIsRejectModalOpen(false);
    setIsConfirmRejectModalOpen(true);
  };

  const handleConfirmReject = () => {
    setIsConfirmRejectModalOpen(false);
    setIsRejectSuccess(true);
    onUpdateStatus(order.id, 'Rejected', `[REJECTED]: ${rejectReason.trim()}`, proofPhoto);
    setTimeout(() => {
      setIsRejectSuccess(false);
      onBack();
    }, 1600);
  };

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProofPhoto(reader.result);
          setValidationError(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStatusChange = (status: WorkOrderStatus) => {
    setCurrentStatus(status);
    setValidationError(null);
    if (status === 'Completed' && !proofPhoto) {
      setTimeout(() => {
        evidenceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 80);
    }
  };

  const handleSaveOrComplete = () => {
    // Strict Validation: Cannot complete job without evidence photo
    if (currentStatus === 'Completed' && !proofPhoto) {
      setValidationError('Please attach an evidence photo showing that the job is completed.');
      evidenceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fileInputRef.current?.click();
      return;
    }

    setValidationError(null);
    onUpdateStatus(order.id, currentStatus, remarks, proofPhoto);
    setIsSuccessNotification(true);
    setTimeout(() => {
      setIsSuccessNotification(false);
      onBack();
    }, 1400);
  };

  return (
    <div className="flex flex-col gap-4 pb-6 max-w-md mx-auto">
      {/* Header Navigation Bar for Job Details */}
      <div className="flex items-center justify-between bg-white rounded-xl p-3 border border-[#e2e8f0]/40 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back to work orders list"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-[#fff0ef] border border-[#e2e8f0]/50 text-[#7a1521] hover:bg-[#ffe9e8] transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>

        <div className="text-center leading-tight">
          <h1 className="text-base font-bold text-[#1e293b] tracking-tight">Job Details</h1>
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

      {/* Accept Success Notification Alert */}
      {isAcceptSuccess && (
        <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            <span>Job Accepted! Progress tracking and work remarks unlocked.</span>
          </div>
        </div>
      )}

      {/* Reject Success Notification Alert */}
      {isRejectSuccess && (
        <div className="p-3 bg-[#ba1a1a] text-white rounded-xl shadow-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="material-symbols-outlined text-[20px]">cancel</span>
            <span>Job #{order.id} Rejected. Dispatch desk has been notified.</span>
          </div>
        </div>
      )}

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
      <section className="bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]/40 relative overflow-hidden">
        {/* Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#fff0ef] text-[#7a1521] border border-[#ffe9e8] shrink-0">
            <span className="material-symbols-outlined text-sm">tag</span>
            {order.jobCode}
          </span>

          <span className="whitespace-nowrap inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/30 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
            {order.priority} PRIORITY
          </span>
        </div>

        {/* Problem Title */}
        <h2 className="text-lg font-bold text-[#1e293b] leading-snug">
          {order.title}
        </h2>

        {/* Requester Information */}
        <div className="mt-3 flex items-center gap-3 p-2.5 bg-[#fff0ef] rounded-xl border border-[#ffe9e8]">
          <div className="w-9 h-9 rounded-full bg-[#7a1521] flex items-center justify-center text-white font-bold text-xs tracking-wider shrink-0">
            {order.requesterName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#1e293b] truncate">{order.requesterName}</p>
            <p className="text-[11px] text-[#475569] truncate">
              {order.requesterDept} • <span className="font-semibold text-[#7a1521]">+94 77 149 0016</span>
            </p>
          </div>
          <a
            href="tel:+94771490016"
            onClick={(e) => {
              e.preventDefault();
              initiateCall(`Requester: ${order.requesterName}`, '+94 77 149 0016', order.requesterDept);
            }}
            className="text-xs font-bold text-[#7a1521] bg-white px-2.5 py-1 rounded-lg border border-[#e2e8f0] shadow-2xs shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[14px]">call</span>
            <span>+94 77 149 0016</span>
          </a>
        </div>

        {/* Location & Due Time Banner */}
        <div className="mt-3 bg-[#fff0ef] rounded-xl p-3 border border-[#ffe9e8] flex flex-col gap-1.5">
          <div className="flex items-start gap-2 text-[#1e293b]">
            <span className="material-symbols-outlined text-[#7a1521] text-lg shrink-0 mt-0.5">
              location_on
            </span>
            <div className="text-xs">
              <span className="font-bold">{order.location}</span>
              {order.subLocation && <p className="text-[11px] text-[#475569]">{order.subLocation}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#475569] pt-1.5 border-t border-[#ffe9e8]">
            <span className="material-symbols-outlined text-amber-600 text-base shrink-0">
              schedule
            </span>
            <span className="font-medium">
              Due Today by <strong className="text-[#1e293b]">{order.dueTime}</strong>
            </span>
          </div>
        </div>

        {/* Issue Description */}
        <div className="mt-3.5">
          <label className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider block mb-1">
            Issue Description & Diagnostic Narrative
          </label>
          <p className="text-xs text-[#475569] leading-relaxed bg-[#f8fafc] p-3 rounded-xl border border-[#ffe9e8]">
            {order.description}
          </p>
        </div>

        {/* Reported Evidence Section */}
        <div className="mt-3.5">
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#7a1521]">photo_library</span>
              <span className="text-[10px] font-bold text-[#64748b] uppercase tracking-wider">
                Reported Evidence {allEvidencePhotos.length > 0 ? `(${allEvidencePhotos.length})` : ''}
              </span>
            </div>
            {order.reportedPhotoTimestamp && (
              <span className="text-[10px] font-semibold text-[#64748b] bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                {order.reportedPhotoTimestamp}
              </span>
            )}
          </div>

          {allEvidencePhotos.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {allEvidencePhotos.map((photo, pIdx) => (
                <div
                  key={pIdx}
                  onClick={() => openImagePreview(photo.url)}
                  className="relative rounded-xl overflow-hidden border border-[#ffe9e8] shadow-xs bg-slate-900 h-28 sm:h-32 group cursor-pointer hover:border-rose-300 transition-colors w-full"
                >
                  <img
                    src={photo.url}
                    alt={photo.name || `Reported Evidence ${pIdx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2.5 flex items-center justify-between pointer-events-none">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1 drop-shadow-sm truncate">
                        <span className="material-symbols-outlined text-[13px] text-amber-300">verified</span>
                        {photo.name || 'Reported Fault Evidence'}
                      </span>
                      <span className="text-[9.5px] text-white/80 drop-shadow-xs truncate">
                        Uploaded by {order.requesterName}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openImagePreview(photo.url);
                      }}
                      className="pointer-events-auto inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30 shadow-xs active:scale-95 transition-all cursor-pointer shrink-0"
                    >
                      <span className="material-symbols-outlined text-[12px]">zoom_in</span>
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3.5 bg-[#f8fafc] border border-dashed border-[#e2e8f0] rounded-xl flex items-center gap-3 text-slate-500">
              <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                <span className="material-symbols-outlined text-[20px]">no_photography</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-700">No evidence photos attached</span>
                <span className="text-[10px] text-slate-400">The requester did not upload photos for this work order</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Rejected Order Notification Banner */}
      {isRejectedOrder && (
        <div className="bg-[#fee2e2] rounded-2xl p-4 border border-[#fca5a5] shadow-sm flex items-start gap-3 animate-in fade-in">
          <div className="w-10 h-10 rounded-full bg-[#fecaca] text-[#b91c1c] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[22px]">cancel</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-[#b91c1c]">Work Order Declined / Rejected</h3>
            <p className="text-[11px] text-[#7f1d1d] mt-0.5 leading-relaxed">
              {order.technicianRemarks || 'This work order was declined by technician and moved to history.'}
            </p>
          </div>
        </div>
      )}

      {/* Acceptance Action Card (Shown when job is not yet accepted) */}
      {!isAccepted && !isRejectedOrder && (
        <div className="bg-[#fff0ef] rounded-2xl p-4 border border-[#ffe9e8] shadow-sm flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ffdad9] text-[#7a1521] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[22px]">assignment</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-[#1e293b]">Job Awaiting Acceptance</h3>
              <p className="text-[11px] text-[#475569] mt-0.5 leading-relaxed">
                Please accept or reject this dispatch. Step-by-step progress tracking will unlock upon acceptance.
              </p>
            </div>
          </div>

          {/* TWO BUTTONS: Accept and Reject */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleAcceptJob}
              className="h-11 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>Accept</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRejectReason('');
                setRejectError(null);
                setIsRejectModalOpen(true);
              }}
              className="h-11 rounded-xl bg-[#ffdad6] hover:bg-[#ffcdd2] text-[#ba1a1a] text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border border-[#ba1a1a]/30 active:scale-98 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">cancel</span>
              <span>Reject</span>
            </button>
          </div>
        </div>
      )}

      {/* Section 2: Interactive Field Action & Progress Stepper (Blurred until Accepted) */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Blur Lock Overlay if job is not accepted yet and not rejected */}
        {!isAccepted && !isRejectedOrder && (
          <div className="absolute inset-0 z-20 backdrop-blur-[3px] bg-white/75 flex flex-col items-center justify-center p-6 text-center select-none rounded-2xl border border-[#ffe9e8] shadow-inner">
            <div className="w-12 h-12 rounded-full bg-[#fff0ef] text-[#7a1521] border border-[#ffe9e8] flex items-center justify-center mb-2 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">lock</span>
            </div>
            <h4 className="text-xs font-bold text-[#1e293b]">Progress Tracking & Remarks Locked</h4>
            <p className="text-[11px] text-[#64748b] max-w-xs mt-1 leading-relaxed">
              Job eka accept karata passe me tika open wei. Please accept or reject this job.
            </p>
            {/* TWO BUTTONS: Accept and Reject */}
            <div className="flex items-center gap-2.5 mt-3.5">
              <button
                type="button"
                onClick={handleAcceptJob}
                className="px-5 py-2.5 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Accept</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectReason('');
                  setRejectError(null);
                  setIsRejectModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#ffdad6] hover:bg-[#ffcdd2] text-[#ba1a1a] text-xs font-bold flex items-center gap-1.5 border border-[#ba1a1a]/30 active:scale-95 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">cancel</span>
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

        <section className={`bg-white rounded-2xl p-4 shadow-sm border border-[#e2e8f0]/40 space-y-4 transition-all duration-300 ${!isAccepted && !isRejectedOrder ? 'filter blur-[4px] opacity-40 pointer-events-none select-none' : ''}`}>
          <div>
            <label className="text-xs font-bold text-[#1e293b] block mb-2">
              Step-by-Step Progress Tracking
            </label>

            {/* Segmented Status Toggle Group */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#fff0ef] rounded-xl border border-[#ffe9e8] text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleStatusChange('In Progress')}
                className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-[11px] font-bold ${currentStatus === 'In Progress'
                  ? 'bg-[#7a1521] text-white shadow-sm ring-2 ring-[#7a1521]/30'
                  : 'text-[#475569] hover:bg-white/80'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">sync</span>
                <span>In Progress</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('On Hold')}
                className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-[11px] font-bold ${currentStatus === 'On Hold'
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                  : 'text-[#475569] hover:bg-white/80'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">pause_circle</span>
                <span>On Hold</span>
              </button>

              <button
                type="button"
                onClick={() => handleStatusChange('Completed')}
                className={`py-2 px-1.5 rounded-lg transition-all flex items-center justify-center gap-1 text-[11px] font-bold ${currentStatus === 'Completed' || currentStatus === 'Signed Off'
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                  : 'text-[#475569] hover:bg-white/80'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">check_circle</span>
                <span>Completed</span>
              </button>
            </div>
          </div>

          {/* Completion Evidence Photo Section (Mandatory when Completed) */}
          {currentStatus === 'Completed' && (
            <div
              ref={evidenceSectionRef}
              className={`p-3.5 rounded-xl border transition-all ${validationError
                ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-200'
                : proofPhoto
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-[#fff0ef]/60 border-[#ffe9e8]'
                }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#1e293b] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#7a1521] text-[18px]">
                    photo_camera
                  </span>
                  <span>Job Completion Evidence Photo</span>
                  <span className="text-[#ba1a1a] font-extrabold text-[11px] bg-[#ffdad6] px-1.5 py-0.2 rounded">
                    * Required
                  </span>
                </label>

                {proofPhoto && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                    <span className="material-symbols-outlined text-xs">verified</span>
                    Evidence Added
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#475569] mb-2.5">
                Please attach an evidence photo showing that the job is completed.
              </p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {proofPhoto ? (
                <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 shadow-sm aspect-video bg-black/5">
                  <img src={proofPhoto} alt="Completion Evidence" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-xs">
                    <span className="material-symbols-outlined text-xs">verified</span> Evidence Verified ✓
                  </div>
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-black/75 hover:bg-black text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">upload_file</span> Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setProofPhoto(undefined)}
                      className="bg-rose-600/90 hover:bg-rose-700 text-white px-2.5 py-1 rounded-lg text-xs font-semibold shadow flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">delete</span> Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer group ${validationError
                      ? 'border-rose-400 bg-white hover:border-rose-500'
                      : 'border-[#7a1521]/40 hover:border-[#7a1521] bg-white'
                      }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#ffdad9] text-[#7a1521] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-xl">add_a_photo</span>
                    </div>
                    <span className="text-xs font-bold text-[#7a1521]">
                      Tap to Upload / Capture Evidence Photo
                    </span>
                    <span className="text-[10px] text-[#64748b] mt-0.5">
                      Click to select from device gallery or camera
                    </span>
                  </button>

                </div>
              )}

              {validationError && (
                <div className="mt-2.5 p-2 bg-rose-100/90 border border-rose-300 rounded-lg text-rose-800 text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-rose-600 text-[16px] shrink-0">
                    error
                  </span>
                  <span>{validationError}</span>
                </div>
              )}
            </div>
          )}

          {/* Work Remarks & Notes */}
          <div>
            <label className="text-xs font-bold text-[#1e293b] block mb-1" htmlFor="technician-remarks">
              Technician Work Remarks
            </label>
            <textarea
              id="technician-remarks"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add work notes (e.g. Filter replaced, gas refilled, drain line flushed)..."
              className="w-full text-xs rounded-xl border-[#e2e8f0] focus:border-[#7a1521] focus:ring-1 focus:ring-[#7a1521] p-2.5 bg-[#f8fafc]"
            />

            {/* Quick Tag Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className="text-[11px] font-medium bg-[#fff0ef] text-[#475569] px-2.5 py-1 rounded-full hover:bg-[#7a1521] hover:text-white border border-[#e2e8f0] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Parts & Materials Used (if any) */}
            {order.partsUsed && order.partsUsed.length > 0 && (
              <div className="mt-3">
                <label className="text-xs font-bold text-[#1e293b] block mb-1.5 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#7a1521]">inventory_2</span>
                  <span>Parts & Materials Dispatched</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {order.partsUsed.map((part, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-semibold bg-[#fff0ef] text-[#7a1521] border border-[#ffe9e8] px-2.5 py-1 rounded-lg"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Verifier Badge (if completed and verified) */}
            {order.verifierName && (
              <div className="mt-3 bg-emerald-50/90 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-bold text-emerald-950 block truncate">
                    Verified & Signed Off by {order.verifierName}
                  </span>
                  <span className="text-[10px] text-emerald-700 block truncate">
                    {order.verifierRole || 'Digital Signature Authenticated'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action Button: Directly below Work Remarks (hidden if rejected) */}
          {!isRejectedOrder && (
            <div className="pt-2">
              {validationError && (
                <p className="text-[11px] font-bold text-rose-600 mb-1.5 text-center flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  <span>Please attach an evidence photo showing that the job is completed.</span>
                </p>
              )}
              <button
                type="button"
                onClick={handleSaveOrComplete}
                className={`w-full text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer ${currentStatus === 'Completed' && !proofPhoto
                  ? 'bg-amber-700 hover:bg-amber-800'
                  : 'bg-[#7a1521] hover:bg-[#931d2b] active:bg-[#58000f]'
                  }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {currentStatus === 'Completed' && !proofPhoto ? 'add_a_photo' : 'check_circle'}
                </span>
                <span>
                  {currentStatus === 'Completed'
                    ? (!proofPhoto ? 'Attach Evidence Photo to Complete' : 'Save & Mark Completed')
                    : 'Save Status & Update'}
                </span>
              </button>
            </div>
          )}
        </section>
      </div>


      {/* 1. Reject Reason Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 flex flex-col gap-3 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">cancel</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1e293b]">Reject Job #{order.id}</h3>
                  <p className="text-[11px] text-[#64748b]">Please state the reason for rejecting</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectError(null);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#64748b] hover:bg-slate-100 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <div>
              <label htmlFor="reject-reason" className="text-xs font-bold text-[#1e293b] block mb-1">
                Reason for Rejection <span className="text-[#ba1a1a]">*</span>
              </label>
              <textarea
                id="reject-reason"
                rows={3}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError(null);
                }}
                placeholder="Type why you cannot undertake this job (e.g. Missing required parts, requires electrician specialist, safety risk)..."
                className="w-full text-xs rounded-xl border-[#e2e8f0] focus:border-[#ba1a1a] focus:ring-1 focus:ring-[#ba1a1a] p-3 bg-[#f8fafc]"
              />

              {/* Quick Reason Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {quickRejectReasons.map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => {
                      setRejectReason(reason);
                      setRejectError(null);
                    }}
                    className="text-[10px] font-medium bg-[#fff0ef] hover:bg-[#ffdad6] text-[#7a1521] px-2 py-0.5 rounded-full border border-[#ffe9e8] transition-colors text-left"
                  >
                    + {reason}
                  </button>
                ))}
              </div>

              {rejectError && (
                <p className="text-[11px] font-bold text-[#ba1a1a] mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">error</span>
                  <span>{rejectError}</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setRejectError(null);
                }}
                className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedReject}
                className="h-10 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold shadow transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Are you sure you want to reject? Confirmation Modal */}
      {isConfirmRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-slate-200 flex flex-col items-center text-center gap-3 relative animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[32px]">warning</span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-[#1e293b]">
                Are you sure you want to reject this job?
              </h3>
              <p className="text-[11px] text-[#64748b] mt-1 leading-relaxed">
                Job <strong className="text-[#1e293b]">#{order.id}</strong> will be returned to facilities dispatch with your stated reason:
              </p>
            </div>

            <div className="w-full p-3 bg-[#fff0ef] rounded-xl border border-[#ffe9e8] text-left">
              <span className="text-[10px] font-bold text-[#7a1521] uppercase tracking-wide block mb-0.5">
                Stated Reason:
              </span>
              <p className="text-xs text-[#1e293b] font-medium italic">
                "{rejectReason}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmRejectModalOpen(false);
                  setIsRejectModalOpen(true);
                }}
                className="h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#475569] text-xs font-bold transition-colors cursor-pointer"
              >
                No, Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="h-10 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold shadow transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
                <span>Yes, Reject Job</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Evidence Image Full View Inside Phone Screen */}
      {previewModalImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between text-white select-none overflow-hidden animate-in fade-in duration-150"
        >
          {/* Top Bar with Title and Quick Controls */}
          <div className="w-full bg-slate-900/95 text-white px-3.5 py-3 pt-3 flex items-center justify-between border-b border-white/10 shrink-0 z-20 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Go Back"
              >
                <span className="material-symbols-outlined text-[19px]">arrow_back</span>
              </button>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white truncate">Reported Evidence</span>
                <span className="text-[10px] text-slate-400 truncate">
                  {modalZoomScale > 1 ? `${Math.round(modalZoomScale * 100)}% Zoomed` : 'Fit Screen'}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {modalZoomScale !== 1 && (
                <button
                  type="button"
                  onClick={() => setModalZoomScale(1)}
                  title="Reset to Phone Display Size"
                  className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[10px] font-semibold flex items-center gap-1 transition-all border border-white/20 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">fit_screen</span>
                  <span>Fit</span>
                </button>
              )}

              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setModalZoomScale((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))))}
                disabled={modalZoomScale <= 1}
                title="Zoom Out"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all border border-white/15 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>

              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setModalZoomScale((prev) => Math.min(3, Number((prev + 0.5).toFixed(1))))}
                disabled={modalZoomScale >= 3}
                title="Zoom In"
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all border border-white/15 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                title="Close"
                className="w-7 h-7 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 hover:text-white flex items-center justify-center transition-all border border-rose-500/30 cursor-pointer ml-1"
              >
                <span className="material-symbols-outlined text-[17px]">close</span>
              </button>
            </div>
          </div>

          {/* Center Viewport */}
          <div
            className="flex-1 w-full min-h-0 flex items-center justify-center overflow-auto p-3 touch-pan-x touch-pan-y bg-slate-950"
          >
            <div
              onClick={() => {
                setModalZoomScale((prev) => (prev === 1 ? 2 : 1));
              }}
              className="relative flex items-center justify-center max-w-full max-h-full transition-transform duration-200 cursor-zoom-in"
              style={
                modalZoomScale !== 1
                  ? { transform: `scale(${modalZoomScale})`, transformOrigin: 'center center' }
                  : undefined
              }
            >
              <img
                src={previewModalImage}
                alt="Reported evidence phone display view"
                className="max-h-[580px] sm:max-h-[620px] max-w-full w-auto object-contain rounded-xl shadow-xl border border-white/10"
              />
            </div>
          </div>

          {/* Bottom Bar with Actions */}
          <div className="w-full bg-slate-900/95 px-3.5 py-2.5 flex items-center justify-between border-t border-white/10 shrink-0 z-20">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-amber-400">touch_app</span>
              Tap image to toggle 2x zoom
            </span>

            <a
              href={previewModalImage}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-white text-[11px] font-bold flex items-center gap-1 border border-white/20 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
              <span>Original File</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
