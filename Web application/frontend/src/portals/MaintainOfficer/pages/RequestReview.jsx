import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Building2,
  MapPin,
  Phone,
  Calendar,
  AlertTriangle,
  Clock,
  Play,
  Package,
  ArrowRight,
  Send,
  Lock,
  UserCheck,
  CheckCircle2,
  Star,
  RefreshCw,
  Briefcase,
  FileText,
  User,
  ArrowLeft,
  Info,
  RotateCcw
} from 'lucide-react';
import { fetchRequestById, assignRequest, rescheduleRequest, actionRequest, fetchLabourers, fetchTeams, fetchSupervisors } from '../api';
import NotificationPopup from '../components/NotificationPopup';
import { getZoneFromLocation } from '../../../utils/campusLocations';
import { getAuthUser } from '../../../utils/auth';

export default function RequestReview({ requestId = 'REQ-8291', setCurrentPage, onBack, readOnly = false }) {
  const authUser = getAuthUser();
  const isDirector = readOnly || authUser?.role?.toLowerCase() === 'director';
  const defaultDateStr = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const completionDateInputRef = useRef(null);
  const nextDateInputRef = useRef(null);

  const openDatePicker = (inputRef) => {
    try {
      if (inputRef?.current && typeof inputRef.current.showPicker === 'function') {
        inputRef.current.showPicker();
      } else if (inputRef?.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      inputRef?.current?.focus?.();
    }
  };

  const [request, setRequest] = useState(null);
  const [equipmentMode, setEquipmentMode] = useState('available'); // 'available' | 'unavailable'
  const [labourersList, setLabourersList] = useState([]);
  const [teamsList, setTeamsList] = useState([]);
  const [isReassigning, setIsReassigning] = useState(false);

  // Acceptance state (locks scheduling until accepted)
  const [acceptedOverride, setAcceptedOverride] = useState(false);
  const [isRejectedState, setIsRejectedState] = useState(false);

  // Assignment Form State
  const [technician, setTechnician] = useState('');
  const [completionDate, setCompletionDate] = useState(defaultDateStr);
  const [instructions, setInstructions] = useState('');

  // Rescheduling Form State
  const [delayReason, setDelayReason] = useState('');
  const [otherDelayReason, setOtherDelayReason] = useState('');
  const [nextDate, setNextDate] = useState(defaultDateStr);
  const [billNumber, setBillNumber] = useState('');
  const [officerNote, setOfficerNote] = useState('');

  const [activeMediaModal, setActiveMediaModal] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const reqStatus = (request?.status || '').toLowerCase();
  const isJobRejectedByLabourer =
    request?.job?.status === 'Rejected' ||
    Boolean(request?.job?.notes?.includes('[REJECTED]'));

  const cleanRejectionReason = (request?.job?.notes || '')
    .replace(/^\[REJECTED\]:\s*/i, '')
    .trim();

  const isRejected = (isRejectedState || reqStatus === 'rejected' || reqStatus === 'cancelled') && !isJobRejectedByLabourer;
  const isAccepted = !isRejected && (
    acceptedOverride ||
    reqStatus === 'accepted' ||
    reqStatus === 'assigned' ||
    reqStatus === 'scheduled' ||
    reqStatus === 'in progress' ||
    reqStatus === 'completed' ||
    isJobRejectedByLabourer
  );

  // Assignment check:
  const isAssigned = !isRejected && !isJobRejectedByLabourer &&
    (reqStatus === 'assigned' || reqStatus === 'in progress' || reqStatus === 'completed') &&
    (Boolean(request?.job) || Boolean(request?.assignedLabourer) || Boolean(request?.assigned_team_name) || Boolean(request?.assigned_officer));

  const isScheduled = !isRejected && !isJobRejectedByLabourer &&
    (reqStatus === 'scheduled' || (Boolean(request?.scheduled_date) && reqStatus !== 'rejected'));

  const isAssignedOrScheduled = isAssigned || isScheduled;

  // Assigned supervisor details
  const assignedLabourerName =
    request?.assignedLabourer?.name ||
    request?.job?.lead_person?.split(' - ')[0] ||
    (request?.assigned_team_name ? request.assigned_team_name.replace(' Team', '') : 'Supervisor');

  const assignedLabourerTrade =
    request?.assignedLabourer?.trade ||
    request?.assignedLabourer?.category ||
    (request?.job?.lead_person?.includes(' - ') ? request.job.lead_person.split(' - ')[1] : '') ||
    'Supervisor';

  const assignedLabourerPhone =
    request?.assignedLabourer?.phone ||
    '+94 77 123 4567';

  const assignedLabourerRating =
    request?.assignedLabourer?.rating || 4.9;

  const assignedJobId =
    request?.job?.id ||
    `JOB-${request?.id ? request.id.replace(/\D/g, '') : '3954'}`;

  const assignedTargetDateRaw =
    request?.job?.due_date ||
    request?.scheduled_date ||
    '';

  const formattedTargetDate = (() => {
    if (!assignedTargetDateRaw) return 'Not set';
    try {
      const d = new Date(assignedTargetDateRaw);
      if (isNaN(d.getTime())) return assignedTargetDateRaw;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return assignedTargetDateRaw;
    }
  })();

  const countdown = (() => {
    const raw = assignedTargetDateRaw || completionDate;
    if (!raw) return null;
    let targetTime;
    if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) {
      targetTime = new Date(`${raw.trim()}T23:59:59`).getTime();
    } else {
      targetTime = new Date(raw).getTime();
    }
    if (isNaN(targetTime)) return null;

    const diff = targetTime - now;
    const isOverdue = diff < 0;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((absDiff / 1000) % 60);

    return { isOverdue, days, hours, minutes, seconds, diff };
  })();

  const assignedInstructions =
    request?.job?.notes ||
    'Standard maintenance protocols and tool safety checks apply.';

  const assignedOfficerName =
    request?.assigned_officer ||
    'Chaminda Bandara';

  const assignedTeamName =
    request?.assigned_team_name ||
    request?.job?.team_name ||
    `${assignedLabourerName} Team`;

  useEffect(() => {
    setAcceptedOverride(false);
    setIsRejectedState(false);
    loadRequest();
    async function loadPersonnel() {
      try {
        const [sups, tms] = await Promise.all([fetchSupervisors(), fetchTeams()]);
        const list = Array.isArray(sups) ? sups : [];
        setLabourersList(list);
        if (list.length > 0) {
          setTechnician(`${list[0].name} - ${list[0].trade || list[0].category || 'Supervisor'}`);
        } else {
          setTechnician('');
        }
        if (tms && Array.isArray(tms)) setTeamsList(tms);
      } catch (err) {
        console.warn('Could not load registered supervisors:', err);
        setLabourersList([]);
        setTechnician('');
      }
    }
    loadPersonnel();

    const interval = setInterval(loadRequest, 3000);
    const onFocus = () => loadRequest();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [requestId]);


  async function loadRequest() {
    const data = await fetchRequestById(requestId);
    if (data) {
      setRequest(data);
    }
  }

  const evidenceList = (() => {
    let imgs = request?.images || request?.evidence || [];
    if (typeof imgs === 'string') {
      try {
        imgs = JSON.parse(imgs);
      } catch (e) {
        imgs = imgs.trim() ? [imgs] : [];
      }
    }
    if (!Array.isArray(imgs)) imgs = imgs ? [imgs] : [];
    return imgs.filter(Boolean).map((img, idx) => {
      if (typeof img === 'string') {
        return { url: img, name: `Evidence_${idx + 1}.jpg` };
      }
      return { url: img.url || img.preview || '', name: img.name || `Evidence_${idx + 1}.jpg` };
    });
  })();

  const handleAssign = async (e) => {
    e.preventDefault();
    await assignRequest(requestId, {
      technician,
      completionDate,
      instructions
    });
    await loadRequest();
    setIsReassigning(false);
    setPopupData({
      type: 'success',
      title: 'Assign Success',
      message: `Job has been successfully assigned to ${technician}!`,
      details: {
        assignedTechnician: technician,
        targetCompletionDate: completionDate
      },
      confirmText: 'View in Jobs',
      onConfirm: () => setCurrentPage('jobs')
    });
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    const effectiveReason = delayReason === 'Others' && otherDelayReason.trim()
      ? otherDelayReason.trim()
      : (delayReason || 'Procurement delay');

    try {
      await rescheduleRequest(requestId, {
        reason: effectiveReason,
        nextDate,
        billNumber,
        notes: officerNote
      });
      setIsReassigning(false);
      setRequest(prev => (prev ? {
        ...prev,
        status: 'Scheduled',
        scheduled_date: nextDate,
        scheduled_reason: effectiveReason,
        job: null
      } : prev));
      setPopupData({
        type: 'warning',
        title: 'Request Rescheduled',
        message: `Request rescheduled for ${nextDate} due to procurement.`,
        details: {
          newScheduledDate: nextDate,
          reason: effectiveReason,
          referenceBill: billNumber || 'None specified'
        },
        confirmText: 'OK',
        onConfirm: () => {
          setIsReassigning(false);
          setPopupData(null);
          loadRequest();
        }
      });
      await loadRequest();
    } catch (err) {
      console.error('Error rescheduling request:', err);
    }
  };

  const handleUndoReject = async () => {
    try {
      setIsRejectedState(false);
      setAcceptedOverride(false);
      setRequest(prev => (prev ? { ...prev, status: 'Pending' } : { status: 'Pending' }));
      await actionRequest(requestId, { action: 'undo', status: 'Pending' });
      await loadRequest();
      setPopupData(null);
    } catch (err) {
      console.warn('Error undoing rejection:', err);
    }
  };

  const handleAction = async (action) => {
    if (action === 'accept') {
      setAcceptedOverride(true);
      setRequest(prev => (prev ? { ...prev, status: 'Accepted' } : { status: 'Accepted' }));
      await actionRequest(requestId, { action });
      setPopupData({
        type: 'success',
        title: 'Request Accepted',
        message: 'This maintenance request has been accepted. You can now schedule or dispatch personnel.'
      });
      loadRequest();
    } else if (action === 'reject') {
      setIsRejectedState(true);
      setRequest(prev => (prev ? { ...prev, status: 'Rejected' } : { status: 'Rejected' }));
      await actionRequest(requestId, { action: 'reject' });
      setPopupData({
        type: 'error',
        title: 'Request Rejected',
        message: 'This maintenance request has been rejected and closed.',
        cancelText: 'Cancel',
        confirmText: 'OK',
        onCancel: handleUndoReject
      });
      loadRequest();
    }
  };

  return (
    <div>
      {/* Back Button */}
      {(onBack || setCurrentPage) && (
        <div style={{ marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => {
              if (onBack) onBack();
              else if (setCurrentPage) setCurrentPage('requests');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '8px 16px',
              borderRadius: '8px',
              color: '#1e293b',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#7a1521';
              e.currentTarget.style.color = '#7a1521';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.color = '#1e293b';
            }}
          >
            <ArrowLeft size={16} color="#7a1521" />
            <span>Back to Requests</span>
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b' }}>
                {request?.title || 'Campus Maintenance Request'}
              </h1>
              <span style={{
                backgroundColor: '#ffe9e8',
                color: '#7a1521',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #ffdad9'
              }}>
                {request?.category || 'General Maintenance'}
              </span>
              <span style={{
                backgroundColor: '#fff1f2',
                color: '#be123c',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: 600,
                border: '1px solid #fecdd3',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertTriangle size={13} /> {request?.priority ? `${request.priority} Priority` : 'Medium Priority'}
              </span>
              {isAccepted && (
                <span style={{
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid #a7f3d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Check size={13} /> Accepted
                </span>
              )}
              {isRejected && (
                <span style={{
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 600,
                  border: '1px solid #fca5a5',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <X size={13} strokeWidth={2.5} /> Rejected
                </span>
              )}
            </div>
            {(request?.submittedDate || request?.created_at) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                <Clock size={14} />
                <span>Submitted: {request?.submittedDate || (request.created_at ? new Date(request.created_at).toLocaleString() : '')}</span>
              </div>
            )}
          </div>

          {/* Action Area / Status Badge */}
          {isDirector ? (
            <div style={{
              backgroundColor: isRejected ? '#fee2e2' : isAssigned ? '#ecfdf5' : isAccepted ? '#f0fdf4' : '#fff7ed',
              color: isRejected ? '#b91c1c' : isAssigned ? '#059669' : isAccepted ? '#15803d' : '#c2410c',
              border: `1px solid ${isRejected ? '#fca5a5' : isAssigned ? '#a7f3d0' : isAccepted ? '#bbf7d0' : '#fed7aa'}`,
              padding: '9px 18px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
            }}>
              {isRejected ? (
                <>
                  <X size={16} strokeWidth={2.5} /> Request Rejected
                </>
              ) : isAssigned ? (
                <>
                  <CheckCircle2 size={16} /> Assigned & In Progress
                </>
              ) : isAccepted ? (
                <>
                  <Check size={16} /> Accepted — Pending Dispatch
                </>
              ) : (
                <>
                  <Clock size={16} /> Pending Review
                </>
              )}
            </div>
          ) : isAssigned ? (
            <div style={{
              backgroundColor: '#ecfdf5',
              color: '#059669',
              border: '1px solid #a7f3d0',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} /> Job Assigned & In Progress
            </div>
          ) : isRejected ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                border: '1px solid #fca5a5',
                padding: '9px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                animation: 'fadeIn 0.2s ease',
                boxShadow: '0 1px 3px rgba(185, 28, 28, 0.1)'
              }}>
                <X size={16} strokeWidth={2.5} /> Rejected
              </div>
              <button
                type="button"
                onClick={handleUndoReject}
                className="btn btn-secondary"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  borderColor: '#cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
                title="Undo rejection and restore request to Pending"
              >
                <RotateCcw size={14} /> Undo Rejection
              </button>
            </div>
          ) : !isAccepted ? (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleAction('reject')}
                className="btn btn-secondary"
                style={{ color: '#7a1521', borderColor: '#7a1521', padding: '9px 18px' }}
              >
                <X size={16} /> Reject Request
              </button>
              <button
                onClick={() => handleAction('accept')}
                className="btn btn-primary"
                style={{
                  backgroundColor: '#7a1521',
                  borderColor: '#7a1521',
                  padding: '9px 18px',
                  gap: '8px',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <Check size={16} /> Accept Request
              </button>
            </div>
          ) : !isAssigned ? (
            <div style={{
              backgroundColor: '#ecfdf5',
              color: '#065f46',
              border: '1px solid #a7f3d0',
              padding: '9px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s ease'
            }}>
              <Check size={16} /> Request Accepted by Maintenance Officer
            </div>
          ) : null}
        </div>
      </div>

      {/* Rejection Notification Toast */}
      {isRejected && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          backgroundColor: '#dc2626',
          color: '#ffffff',
          padding: '14px 22px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 9999,
          fontSize: '14px',
          fontWeight: 600
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <X size={16} />
          </div>
          <span>Request Rejected — Erasing and redirecting...</span>
        </div>
      )}

      {/* Main Grid: Left Details vs Right Assignment/Procurement */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '24px', alignItems: 'start' }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Requester Details Card */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '18px' }}>Requester Details</h2>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: '#ffe4e6',
                color: '#be123c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '16px',
                flexShrink: 0
              }}>
                {(() => {
                  const rName = request?.requester?.name || request?.requester_name || '';
                  if (request?.requester?.initials) return request.requester.initials;
                  if (!rName) return 'REQ';
                  const parts = rName.trim().split(/\s+/);
                  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
                  return rName.slice(0, 2).toUpperCase();
                })()}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                  {request?.requester?.name || request?.requester_name || 'Requester'}
                </div>
                {(request?.requester?.department || request?.requester_dept) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                    <Building2 size={15} />
                    <span>{request?.requester?.department || request?.requester_dept}</span>
                  </div>
                )}
                {request?.location && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569', flexWrap: 'wrap' }}>
                    <MapPin size={15} style={{ color: '#7a1521', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>{request.location}</span>
                    {(() => {
                      const z = request.zone || getZoneFromLocation(request.location);
                      if (!z) return null;
                      const isA = z.includes('A');
                      const isB = z.includes('B');
                      return (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: isA ? '#fef3c7' : isB ? '#e0f2fe' : '#dcfce7',
                          color: isA ? '#92400e' : isB ? '#075985' : '#166534',
                          border: `1px solid ${isA ? '#fde68a' : isB ? '#bae6fd' : '#bbf7d0'}`
                        }}>
                          📍 {z}
                        </span>
                      );
                    })()}
                  </div>
                )}
                {(request?.requester?.phone || request?.requester_phone) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                    <Phone size={15} />
                    <a href={`tel:${request?.requester?.phone || request?.requester_phone}`} style={{ color: '#7a1521', fontWeight: 600, textDecoration: 'none' }}>
                      {request?.requester?.phone || request?.requester_phone} (Call)
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Incident Description & Evidence */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '14px' }}>Incident Description</h2>
            <div style={{
              backgroundColor: '#f8fafc',
              padding: '14px 16px',
              borderRadius: '8px',
              fontSize: '13.5px',
              color: '#334155',
              lineHeight: 1.6,
              marginBottom: '20px',
              border: '1px solid #f1f5f9'
            }}>
              {request?.description || 'No description provided.'}
            </div>

            {/* Attached Evidence */}
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b', marginBottom: '12px' }}>
                Attached Evidence ({evidenceList.length})
              </div>
              {evidenceList.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
                  {evidenceList.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveMediaModal(item)}
                      style={{
                        height: '90px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid var(--color-border)',
                        cursor: 'pointer',
                        backgroundColor: '#1e293b',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        color: '#ffffff',
                        fontSize: '10px',
                        padding: '2px 6px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '24px 16px',
                  backgroundColor: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  color: '#64748b',
                  fontWeight: 500
                }}>
                  No attached evidence for this request
                </div>
              )}
            </div>
          </div>

          {/* Activity History */}
          <div className="card">
            <h2 className="card-title" style={{ marginBottom: '18px' }}>Activity History</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '8px' }}>
              {/* Vertical timeline connector */}
              <div style={{
                position: 'absolute',
                top: '10px',
                bottom: '10px',
                left: '14px',
                width: '2px',
                backgroundColor: '#e2e8f0',
                zIndex: 1
              }} />

              {/* Node 0: If Assigned */}
              {isAssigned && (
                <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#059669',
                    border: '2px solid #ffffff',
                    boxShadow: '0 0 0 2px #059669',
                    marginTop: '4px',
                    flexShrink: 0
                  }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#065f46' }}>Job Assigned & In Progress</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{formattedTargetDate}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      Assigned to <strong>{assignedLabourerName}</strong> ({assignedLabourerTrade}). Work order is currently active.
                    </p>
                  </div>
                </div>
              )}

              {/* Node 1 */}
              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#7a1521',
                  border: '2px solid #ffffff',
                  boxShadow: '0 0 0 2px #7a1521',
                  marginTop: '4px',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Under Review</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{request?.submittedDate || (request?.created_at ? new Date(request.created_at).toLocaleString() : '')}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Maintenance supervisor is currently reviewing the request.
                  </p>
                </div>
              </div>

              {/* Node 2 */}
              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#cbd5e1',
                  border: '2px solid #ffffff',
                  marginTop: '4px',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>Request Submitted</span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>{request?.submittedDate || (request?.created_at ? new Date(request.created_at).toLocaleString() : '')}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Submitted by {request?.requester?.name || request?.requester_name || 'Requester'} via Staff Portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>        {/* RIGHT COLUMN: Assigned Labourer Card vs Scheduling & Assignment Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(isAssignedOrScheduled && !isReassigning) ? (
            /* ASSIGNED LABOURER OR SCHEDULED EXECUTION PLAN CARD */
            <div className="card" style={{ padding: '24px', animation: 'fadeIn 0.25s ease' }}>
              {/* Card Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '16px',
                borderBottom: '1px solid var(--color-border)',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: '#fff0ef',
                    color: '#7a1521',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isScheduled && !isAssigned ? <Calendar size={20} /> : <UserCheck size={20} />}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                      {isScheduled && !isAssigned ? 'Scheduled Execution Plan' : 'Assigned Supervisor Details'}
                    </h2>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                      {isScheduled && !isAssigned ? 'Target completion & scheduling plan' : 'Work order dispatched to field personnel'}
                    </div>
                  </div>
                </div>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: isScheduled && !isAssigned ? '#f5f3ff' : '#ecfdf5',
                  color: isScheduled && !isAssigned ? '#7c3aed' : '#059669',
                  border: `1px solid ${isScheduled && !isAssigned ? '#ddd6fe' : '#a7f3d0'}`
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: isScheduled && !isAssigned ? '#8b5cf6' : '#10b981',
                    boxShadow: `0 0 0 2px ${isScheduled && !isAssigned ? 'rgba(139, 92, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`
                  }} />
                  {isScheduled && !isAssigned ? 'Scheduled' : (request?.status === 'Assigned' ? 'Assigned' : (request?.status || 'In Progress'))}
                </span>
              </div>
              {/* Scheduled Date Highlight Box & Countdown Timer Display (ONLY WHEN NOT ASSIGNED) */}
              {(!isAssigned && isScheduled) && (
                <>
                  {/* Scheduled Date Highlight Box */}
                  <div style={{
                    backgroundColor: '#fafaf9',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Scheduled Target Date
                      </div>
                      <div style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={18} style={{ color: '#7a1521' }} />
                        <span>{formattedTargetDate}</span>
                      </div>
                    </div>

                    {/* Reschedule Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEquipmentMode('unavailable');
                        setIsReassigning(true);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: '#7a1521',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(122,21,33,0.2)',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <RefreshCw size={14} />
                      <span>Reschedule</span>
                    </button>
                  </div>

                  {/* Countdown Timer Display */}
                  <div style={{
                    backgroundColor: countdown?.isOverdue ? '#fff5f5' : '#f0fdf4',
                    border: `1px solid ${countdown?.isOverdue ? '#fed7d7' : '#bbf7d0'}`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginBottom: '18px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: countdown?.isOverdue ? '#c53030' : '#15803d',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em'
                      }}>
                        <Clock size={15} />
                        <span>{countdown?.isOverdue ? 'Time Elapsed Since Scheduled Date' : 'Countdown to Execution Date'}</span>
                      </div>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: countdown?.isOverdue ? '#e53e3e' : '#16a34a',
                        backgroundColor: '#ffffff',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        border: `1px solid ${countdown?.isOverdue ? '#feb2b2' : '#86efac'}`
                      }}>
                        {countdown?.isOverdue ? 'Overdue' : 'Live Counter'}
                      </span>
                    </div>

                    {/* 4 Countdown Tiles */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: '10px',
                      textAlign: 'center'
                    }}>
                      {/* Days */}
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: `1px solid ${countdown?.isOverdue ? '#fed7d7' : '#dcfce7'}`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: countdown?.isOverdue ? '#991b1b' : '#14532d', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                          {String(countdown?.days ?? 0).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginTop: '4px', textTransform: 'uppercase' }}>
                          Days
                        </div>
                      </div>

                      {/* Hours */}
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: `1px solid ${countdown?.isOverdue ? '#fed7d7' : '#dcfce7'}`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: countdown?.isOverdue ? '#991b1b' : '#14532d', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                          {String(countdown?.hours ?? 0).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginTop: '4px', textTransform: 'uppercase' }}>
                          Hours
                        </div>
                      </div>

                      {/* Minutes */}
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: `1px solid ${countdown?.isOverdue ? '#fed7d7' : '#dcfce7'}`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: countdown?.isOverdue ? '#991b1b' : '#14532d', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                          {String(countdown?.minutes ?? 0).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginTop: '4px', textTransform: 'uppercase' }}>
                          Minutes
                        </div>
                      </div>

                      {/* Seconds */}
                      <div style={{
                        backgroundColor: '#ffffff',
                        padding: '10px 4px',
                        borderRadius: '8px',
                        border: `1px solid ${countdown?.isOverdue ? '#fed7d7' : '#dcfce7'}`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                      }}>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: countdown?.isOverdue ? '#dc2626' : '#16a34a', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                          {String(countdown?.seconds ?? 0).padStart(2, '0')}
                        </div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginTop: '4px', textTransform: 'uppercase' }}>
                          Seconds
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {isAssigned ? (
                <>
                  {/* Technician Identity Card */}
                  <div style={{
                    backgroundColor: '#fafaf9',
                    border: '1px solid #e7e5e4',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: '#7a1521',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '20px',
                        boxShadow: '0 4px 10px rgba(122, 21, 33, 0.25)'
                      }}>
                        {assignedLabourerName.charAt(0)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                            {assignedLabourerName}
                          </span>
                          <span style={{
                            backgroundColor: '#fff0ef',
                            color: '#7a1521',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            border: '1px solid #ffdcdb'
                          }}>
                            {assignedLabourerTrade}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '12.5px', color: '#64748b' }}>
                          <a
                            href={`tel:${assignedLabourerPhone}`}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#475569', textDecoration: 'none' }}
                          >
                            <Phone size={13} style={{ color: '#7a1521' }} />
                            <span>{assignedLabourerPhone}</span>
                          </a>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#d97706', fontWeight: 600 }}>
                            <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                            <span>{assignedLabourerRating}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#059669',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <CheckCircle2 size={14} /> Assigned & Active
                    </div>
                  </div>

                  {/* Assignment Specs Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      padding: '12px 14px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                        <Briefcase size={13} style={{ color: '#7a1521' }} />
                        <span>Work Order ID</span>
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginTop: '5px' }}>
                        {assignedJobId}
                      </div>
                    </div>

                    <div style={{
                      padding: '12px 14px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                        <Calendar size={13} style={{ color: '#7a1521' }} />
                        <span>Target Due Date</span>
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginTop: '5px' }}>
                        {formattedTargetDate}
                      </div>
                    </div>

                    <div style={{
                      padding: '12px 14px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                        <User size={13} style={{ color: '#7a1521' }} />
                        <span>Assigned Officer</span>
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginTop: '5px' }}>
                        {assignedOfficerName}
                      </div>
                    </div>

                    <div style={{
                      padding: '12px 14px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                        <Building2 size={13} style={{ color: '#7a1521' }} />
                        <span>Assigned Unit</span>
                      </div>
                      <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginTop: '5px' }}>
                        {assignedTeamName}
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions Box */}
                  <div style={{
                    marginBottom: '22px',
                    padding: '14px 16px',
                    backgroundColor: '#fffbfa',
                    border: '1px solid #fed7d7',
                    borderRadius: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#7a1521', marginBottom: '6px' }}>
                      <FileText size={14} />
                      <span>Special Instructions for Supervisor:</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                      {assignedInstructions}
                    </div>
                  </div>

                  {/* Action Buttons for Assigned Job */}
                  {!isDirector && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setIsReassigning(true)}
                        className="btn btn-secondary"
                        style={{
                          flex: 1,
                          gap: '8px',
                          padding: '11px',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          borderColor: '#cbd5e1',
                          color: '#475569'
                        }}
                      >
                        <RefreshCw size={15} />
                        <span>Reassign Supervisor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentPage && setCurrentPage('jobs')}
                        className="btn btn-primary"
                        style={{
                          flex: 1,
                          gap: '8px',
                          padding: '11px',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          backgroundColor: '#7a1521',
                          borderColor: '#7a1521'
                        }}
                      >
                        <span>View in Jobs</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* SCHEDULED REQUEST (Held under Requests tab, not yet converted to job) */
                <>
                  <div style={{
                    backgroundColor: '#faf5ff',
                    border: '1px solid #e9d5ff',
                    borderRadius: '12px',
                    padding: '16px 18px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', fontWeight: 700, color: '#6b21a8', marginBottom: '8px' }}>
                      <Calendar size={17} style={{ color: '#7c3aed' }} />
                      <span>Scheduled Request Status</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                      This request has been scheduled by the Maintenance Officer for execution on <strong>{formattedTargetDate}</strong>.
                      It is held in the <strong>Requests</strong> tab under <em>Scheduled</em> until a supervisor and labourers are assigned.
                    </p>
                  </div>

                  {/* Action Buttons for Scheduled Request */}
                  {!isDirector && (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setEquipmentMode('unavailable');
                          setIsReassigning(true);
                        }}
                        className="btn btn-secondary"
                        style={{
                          flex: 1,
                          minWidth: '150px',
                          gap: '8px',
                          padding: '11px',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          borderColor: '#cbd5e1',
                          color: '#475569'
                        }}
                      >
                        <RefreshCw size={15} />
                        <span>Reschedule Date</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEquipmentMode('available');
                          setIsReassigning(true);
                        }}
                        className="btn btn-primary"
                        style={{
                          flex: 1,
                          minWidth: '170px',
                          gap: '8px',
                          padding: '11px',
                          fontSize: '13.5px',
                          fontWeight: 600,
                          backgroundColor: '#7a1521',
                          borderColor: '#7a1521'
                        }}
                      >
                        <UserCheck size={15} />
                        <span>Assign to Supervisor</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onBack) onBack();
                          else if (setCurrentPage) setCurrentPage('requests');
                        }}
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          gap: '8px',
                          padding: '10px',
                          fontSize: '13px',
                          fontWeight: 600,
                          borderColor: '#e2e8f0',
                          color: '#64748b'
                        }}
                      >
                        <ArrowLeft size={15} />
                        <span>Back to Requests</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : isDirector ? (
            /* EXECUTIVE READ-ONLY VIEW FOR DIRECTOR */
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#fff0ef',
                    color: '#7a1521',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      Operational Status & Workflow
                    </h3>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Executive Oversight & Department Progress
                    </p>
                  </div>
                </div>
                <span style={{
                  backgroundColor: isRejected ? '#fee2e2' : isAccepted ? '#f0fdf4' : '#fff7ed',
                  color: isRejected ? '#b91c1c' : isAccepted ? '#15803d' : '#c2410c',
                  border: `1px solid ${isRejected ? '#fca5a5' : isAccepted ? '#bbf7d0' : '#fed7aa'}`,
                  fontSize: '11.5px',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {isRejected ? 'Rejected' : isAccepted ? 'Accepted' : 'Pending Review'}
                </span>
              </div>

              {/* Status Metric Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Responsible Division
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                    Works & Maintenance Division
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Campus Location Zone
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                    {getZoneFromLocation(request?.location) || 'Central Campus'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Expected Resolution SLA
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                    {request?.priority?.toLowerCase() === 'high' ? '12 - 24 Hours' : request?.priority?.toLowerCase() === 'urgent' ? '2 - 6 Hours' : '24 - 48 Hours'}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Trade Category
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                    {request?.category || 'General Maintenance'}
                  </div>
                </div>
              </div>

              {/* Lifecycle Steps */}
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
                  Request Lifecycle Timeline
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                      ✓
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Request Logged by Requester</span>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                        {request?.submittedDate || (request?.created_at ? new Date(request.created_at).toLocaleString() : 'Logged')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isRejected ? '#ef4444' : isAccepted ? '#10b981' : '#f59e0b',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {isRejected ? '✕' : isAccepted ? '✓' : '•'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                        {isRejected ? 'Rejected by Maintenance Officer' : isAccepted ? 'Accepted by Maintenance Officer' : 'Maintenance Officer Review'}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                        {isRejected ? 'Declined' : isAccepted ? 'Under Technician Dispatch' : 'Awaiting officer sign-off & dispatch'}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: isAssigned ? '#10b981' : '#e2e8f0',
                      color: isAssigned ? '#ffffff' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 700
                    }}>
                      {isAssigned ? '✓' : '3'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: isAssigned ? '#0f172a' : '#94a3b8' }}>
                        Supervisor & Field Labour Dispatch
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>
                        {isAssigned ? `Dispatched to ${assignedLabourerName}` : 'Pending supervisor assignment'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informational Note for Director */}
              <div style={{
                backgroundColor: '#fffbfa',
                border: '1px solid #fed7d7',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '12.5px',
                color: '#7a1521'
              }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>
                  <strong>Executive View:</strong> Operational assignments, technician dispatch, and scheduling actions are conducted directly by the Maintenance Officer.
                </span>
              </div>
            </div>
          ) : (
            /* ASSIGNMENT / RESCHEDULING FORM */
            <>
              {/* If in Reassignment Mode, show banner with Cancel button (only on supervisor assignment tab) */}
              {isReassigning && equipmentMode !== 'unavailable' && (
                <div style={{
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: '10px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#92400e', fontWeight: 500 }}>
                    <AlertTriangle size={16} style={{ color: '#d97706', flexShrink: 0 }} />
                    <span>Currently assigned to <strong>{assignedLabourerName}</strong>. Selecting a new supervisor will update the work order.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsReassigning(false)}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d97706',
                      color: '#b45309',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Work Order Declined by Supervisor Banner */}
              {isJobRejectedByLabourer && (
                <div style={{
                  backgroundColor: '#fee2e2',
                  border: '1.5px solid #fca5a5',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  boxShadow: '0 2px 8px rgba(185, 28, 28, 0.08)'
                }}>
                  <AlertTriangle size={20} style={{ color: '#b91c1c', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b' }}>
                      Work Order Declined by Supervisor ({assignedLabourerName})
                    </div>
                    {cleanRejectionReason ? (
                      <div style={{ fontSize: '13px', color: '#7f1d1d', marginTop: '3px' }}>
                        Reason: <em>"{cleanRejectionReason}"</em>
                      </div>
                    ) : null}
                    <div style={{ fontSize: '12.5px', color: '#b91c1c', marginTop: '6px', fontWeight: 600 }}>
                      Please select another supervisor below to re-assign this maintenance task.
                    </div>
                  </div>
                </div>
              )}

              {/* Out-of-stock warning banner (visible if unavailable or alert exists) */}
              {equipmentMode === 'unavailable' && (
                <div style={{
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <Package size={20} style={{ color: '#be123c', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#9f1239' }}>
                      Equipment Out of Stock - Needs Purchase/Delay
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#be123c', marginTop: '2px' }}>
                      AC Capacitor (50uF) is currently unavailable in central stores.
                    </div>
                  </div>
                </div>
              )}

              {/* Scheduling & Assignment Block (Blurred until Request is Accepted) */}
              <div style={{ position: 'relative' }}>
                <div style={{
                  filter: isAccepted ? 'none' : 'blur(5px)',
                  pointerEvents: isAccepted ? 'auto' : 'none',
                  userSelect: isAccepted ? 'auto' : 'none',
                  opacity: isAccepted ? 1 : 0.45,
                  transition: 'filter 0.35s ease, opacity 0.35s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Equipment Mode Tabs */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    backgroundColor: '#fff0ef',
                    padding: '4px',
                    borderRadius: '10px',
                    border: '1px solid var(--color-border-maroon)'
                  }}>
                    <button
                      type="button"
                      onClick={() => setEquipmentMode('available')}
                      style={{
                        padding: '9px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: equipmentMode === 'available' ? '#7a1521' : 'transparent',
                        color: equipmentMode === 'available' ? '#ffffff' : '#7a1521',
                        fontWeight: 600,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Equipment Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setEquipmentMode('unavailable')}
                      style={{
                        padding: '9px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: equipmentMode === 'unavailable' ? '#7a1521' : 'transparent',
                        color: equipmentMode === 'unavailable' ? '#ffffff' : '#7a1521',
                        fontWeight: 600,
                        fontSize: '13.5px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Equipment Not Available
                    </button>
                  </div>

                  {/* Form Container */}
                  <div className="card" style={{ padding: '24px' }}>
                    {equipmentMode === 'available' ? (
                      /* TAB 1: Scheduling & Assignment */
                      <form onSubmit={handleAssign}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            backgroundColor: '#7a1521', color: '#ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700
                          }}>
                            1
                          </div>
                          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b' }}>
                            Scheduling & Assignment
                          </h2>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Assign to Supervisor</label>
                          <select
                            className="form-select"
                            value={technician}
                            onChange={(e) => setTechnician(e.target.value)}
                          >
                            {labourersList.length > 0 ? (
                              labourersList.map((lab) => (
                                <option key={lab.id} value={`${lab.name} - ${lab.trade || lab.category || 'Supervisor'}`}>
                                  {lab.name} — {lab.trade || lab.category || 'Supervisor'} ({lab.status || 'Available'})
                                </option>
                              ))
                            ) : (
                              <option value="">No Registered Supervisors Available</option>
                            )}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Estimated Completion Time</label>
                          <div
                            className="custom-date-picker-wrap"
                            onClick={() => openDatePicker(completionDateInputRef)}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              ref={completionDateInputRef}
                              type="date"
                              className="form-input"
                              value={completionDate}
                              onChange={(e) => setCompletionDate(e.target.value)}
                              onClick={(e) => {
                                try { e.target.showPicker?.(); } catch (err) {}
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 42px 10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13.5px',
                                color: '#1e293b',
                                boxSizing: 'border-box',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer'
                              }}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDatePicker(completionDateInputRef);
                              }}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                background: 'transparent',
                                border: 'none',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#64748b'
                              }}
                              title="Select Date"
                              aria-label="Select Date"
                            >
                              <Calendar size={18} style={{ color: '#475569' }} />
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Special Instructions for Supervisor</label>
                          <textarea
                            className="form-textarea"
                            rows="4"
                            placeholder="Add notes regarding lab access, safety protocols, or specific tools needed..."
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                          />
                        </div>

                        <button
                          type="submit"
                          className="btn btn-primary btn-lg"
                          style={{ width: '100%', marginTop: '12px', gap: '8px' }}
                        >
                          <span>{(isReassigning || isJobRejectedByLabourer) ? 'Re-assign Job to Supervisor' : 'Assign Job to Supervisor'}</span>
                          <ArrowRight size={16} />
                        </button>
                      </form>
                    ) : (
                      /* TAB 2: Rescheduling & Procurement */
                      <form onSubmit={handleReschedule}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                          <div style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            backgroundColor: '#ef4444', color: '#ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '12px', fontWeight: 700
                          }}>
                            !
                          </div>
                          <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b' }}>
                            Rescheduling & Procurement
                          </h2>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Reason for Delay</label>
                          <select
                            className="form-select"
                            value={delayReason}
                            onChange={(e) => setDelayReason(e.target.value)}
                          >
                            <option value="">Select Reason...</option>
                            <option value="Out of Stock - Awaiting PO">Out of Stock - Awaiting Purchase Order</option>
                            <option value="Import Component Delay">Import Component Delay</option>
                            <option value="Specialized Contractor Required">Specialized Contractor Required</option>
                            <option value="Exam / Lecture Session Clashes">Exam / Lecture Session Clashes</option>
                            <option value="Others">Others</option>
                          </select>
                          {delayReason === 'Others' && (
                            <div style={{ marginTop: '8px' }}>
                              <label className="form-label" style={{ fontSize: '11px', color: '#64748b' }}>Specify Reason</label>
                              <input
                                type="text"
                                className="form-input"
                                placeholder="Please specify reason for delay..."
                                value={otherDelayReason}
                                onChange={(e) => setOtherDelayReason(e.target.value)}
                                required
                              />
                            </div>
                          )}
                        </div>

                        <div className="form-group">
                          <label className="form-label">Set Next Available Date</label>
                          <div
                            className="custom-date-picker-wrap"
                            onClick={() => openDatePicker(nextDateInputRef)}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              cursor: 'pointer'
                            }}
                          >
                            <input
                              ref={nextDateInputRef}
                              type="date"
                              className="form-input"
                              value={nextDate}
                              onChange={(e) => setNextDate(e.target.value)}
                              onClick={(e) => {
                                try { e.target.showPicker?.(); } catch (err) {}
                              }}
                              style={{
                                width: '100%',
                                padding: '10px 42px 10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13.5px',
                                color: '#1e293b',
                                boxSizing: 'border-box',
                                backgroundColor: '#ffffff',
                                cursor: 'pointer'
                              }}
                            />
                            <button
                              type="button"
                              tabIndex={-1}
                              onClick={(e) => {
                                e.stopPropagation();
                                openDatePicker(nextDateInputRef);
                              }}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                background: 'transparent',
                                border: 'none',
                                padding: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#64748b'
                              }}
                              title="Select Date"
                              aria-label="Select Date"
                            >
                              <Calendar size={18} style={{ color: '#475569' }} />
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Bill Number</label>
                          <input
                            type="text"
                            className="form-input"
                            placeholder="e.g. BILL-99201"
                            value={billNumber}
                            onChange={(e) => setBillNumber(e.target.value)}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Maintenance Officer Notes</label>
                          <textarea
                            className="form-textarea"
                            rows="3"
                            placeholder="Additional context on procurement or dispatch plan..."
                            value={officerNote}
                            onChange={(e) => setOfficerNote(e.target.value)}
                          />
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                          {isReassigning && (
                            <button
                              type="button"
                              onClick={() => setIsReassigning(false)}
                              className="btn btn-secondary"
                              style={{
                                flex: 1,
                                padding: '12px',
                                fontWeight: 600,
                                borderColor: '#cbd5e1',
                                color: '#475569'
                              }}
                            >
                              Cancel
                            </button>
                          )}
                          <button
                            type="submit"
                            className="btn btn-lg"
                            style={{
                              flex: isReassigning ? 2 : 1,
                              width: isReassigning ? 'auto' : '100%',
                              backgroundColor: '#475569',
                              color: '#ffffff',
                              gap: '8px'
                            }}
                          >
                            <Calendar size={16} />
                            <span>Schedule for Later</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Lock / Prompt Overlay when rejected or not accepted */}
                {isRejected ? (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    padding: '20px'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.96)',
                      backdropFilter: 'blur(8px)',
                      padding: '28px 24px',
                      borderRadius: '16px',
                      border: '1px solid #fecdd3',
                      boxShadow: '0 10px 30px -5px rgba(220, 38, 38, 0.12), 0 4px 10px rgba(0, 0, 0, 0.05)',
                      textAlign: 'center',
                      maxWidth: '340px',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <X size={26} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>
                          Request Rejected
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', lineHeight: 1.45 }}>
                          This maintenance request has been rejected and closed. Technician assignment & scheduling are disabled.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleUndoReject}
                        className="btn btn-secondary"
                        style={{
                          backgroundColor: '#ffffff',
                          color: '#b91c1c',
                          borderColor: '#fca5a5',
                          fontSize: '13px',
                          fontWeight: 600,
                          padding: '8px 18px',
                          borderRadius: '8px',
                          marginTop: '4px',
                          cursor: 'pointer',
                          gap: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          boxShadow: '0 1px 3px rgba(185, 28, 28, 0.1)'
                        }}
                      >
                        <RotateCcw size={15} /> Undo Rejection
                      </button>
                    </div>
                  </div>
                ) : !isAccepted ? (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    padding: '20px'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.94)',
                      backdropFilter: 'blur(8px)',
                      padding: '28px 24px',
                      borderRadius: '16px',
                      border: '1px solid #ffdad9',
                      boxShadow: '0 10px 30px -5px rgba(122, 21, 33, 0.15), 0 4px 10px rgba(0, 0, 0, 0.05)',
                      textAlign: 'center',
                      maxWidth: '340px',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '52px',
                        height: '52px',
                        borderRadius: '50%',
                        backgroundColor: '#fff0ef',
                        color: '#7a1521',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Lock size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                          Assignment Locked
                        </h3>
                        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', lineHeight: 1.45 }}>
                          Please click <strong>Accept Request</strong> above to unlock technician assignment & scheduling.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAction('accept')}
                        className="btn btn-primary"
                        style={{
                          backgroundColor: '#7a1521',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 600,
                          padding: '9px 20px',
                          borderRadius: '8px',
                          marginTop: '4px',
                          cursor: 'pointer',
                          gap: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          boxShadow: '0 2px 6px rgba(122, 21, 33, 0.25)'
                        }}
                      >
                        <Check size={16} /> Accept Request
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Media Evidence Modal */}
      {activeMediaModal && (
        <div className="modal-overlay" onClick={() => setActiveMediaModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{activeMediaModal.name || 'Attached Evidence Preview'}</h3>
              <button onClick={() => setActiveMediaModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{
              minHeight: '260px',
              maxHeight: '450px',
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {activeMediaModal.url ? (
                <img
                  src={activeMediaModal.url}
                  alt={activeMediaModal.name || 'Evidence'}
                  style={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain' }}
                />
              ) : (
                <div style={{ color: '#94a3b8' }}>No image preview available</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic In-App Notification Popup Dialog */}
      <NotificationPopup
        isOpen={Boolean(popupData)}
        onClose={() => {
          setPopupData(null);
          setIsReassigning(false);
        }}
        type={popupData?.type}
        title={popupData?.title}
        message={popupData?.message}
        details={popupData?.details}
        cancelText={popupData?.cancelText || 'Close'}
        onCancel={popupData?.onCancel}
        confirmText={popupData?.confirmText || 'OK'}
        onConfirm={popupData?.onConfirm}
      />
    </div>
  );
}
