import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Info,
  MapPin,
  Triangle,
  Calendar,
  User,
  Phone,
  Mail,
  History,
  ArrowLeft,
  X,
  Clock,
  CheckCircle2,
  Wrench,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  ArrowRight,
  Package,
  Briefcase,
  Building2,
  FileText
} from 'lucide-react';
import { fetchJobById, fetchJobs, fetchTeams, fetchLabourers, fetchSupervisors, assignRequest, rescheduleRequest } from '../api';
import { getZoneFromLocation } from '../../../utils/campusLocations';

export default function JobDetails({ jobId = 'JOB-3954', setCurrentPage }) {
  const [job, setJob] = useState(null);
  const [activeMediaModal, setActiveMediaModal] = useState(null);

  const nextDateInputRef = useRef(null);
  const reassignDateInputRef = useRef(null);
  const modalDateInputRef = useRef(null);

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

  // Scheduling & Re-assignment Form State (Matches Screenshot 2)
  const [equipmentMode, setEquipmentMode] = useState('available'); // 'available' | 'unavailable'
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [supervisorsList, setSupervisorsList] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [reassignDate, setReassignDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [reassignNotes, setReassignNotes] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);
  const [reassignSuccessMsg, setReassignSuccessMsg] = useState(null);
  const [isReschedulingMode, setIsReschedulingMode] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Rescheduling state for Unavailable mode
  const [delayReason, setDelayReason] = useState('Out of Stock - Awaiting PO');
  const [otherDelayReason, setOtherDelayReason] = useState('');
  const [nextDate, setNextDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [billNumber, setBillNumber] = useState('');
  const [officerNote, setOfficerNote] = useState('');

  useEffect(() => {
    loadJob();
    loadSupervisors();
  }, [jobId]);

  async function loadJob() {
    let data = null;
    if (jobId) {
      data = await fetchJobById(jobId);
    }
    if (!data) {
      const all = await fetchJobs();
      if (all && all.length > 0) {
        data = await fetchJobById(all[0].id);
      }
    }
    if (data) {
      setJob(data);
      if (data.due_date) {
        try {
          const dt = new Date(data.due_date).toISOString().split('T')[0];
          setReassignDate(dt);
        } catch (e) { }
      }
    }
  }

  async function loadSupervisors() {
    try {
      const data = await fetchSupervisors();
      const list = Array.isArray(data) ? data : [];
      setSupervisorsList(list);
      if (list.length > 0) {
        setSelectedSupervisor(prev => {
          if (prev && list.some(s => `${s.name} - ${s.trade || 'Supervisor'}` === prev)) return prev;
          const alt = list.find(s => !s.name.toLowerCase().includes(personnelName.toLowerCase()));
          const chosen = alt || list[0];
          return `${chosen.name} - ${chosen.trade || 'Supervisor'}`;
        });
      } else {
        setSelectedSupervisor('');
      }
    } catch (err) {
      console.warn('Could not load supervisors:', err);
      setSupervisorsList([]);
      setSelectedSupervisor('');
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmReassign = async (e) => {
    if (e) e.preventDefault();
    if (!selectedSupervisor) return;
    setIsReassigning(true);
    try {
      const targetId = job?.request_id || job?.id || jobId;
      await assignRequest(targetId, {
        technician: selectedSupervisor,
        completionDate: reassignDate,
        instructions: reassignNotes || 'Work order reassigned by Maintenance Officer.',
        priority: job?.priority || 'Medium'
      });
      setIsReassignModalOpen(false);
      setIsReschedulingMode(false);
      const cleanName = selectedSupervisor.split(' - ')[0].trim();
      setReassignSuccessMsg(`Work order successfully scheduled & assigned to supervisor ${cleanName}!`);
      setTimeout(() => setReassignSuccessMsg(null), 5000);
      await loadJob();
    } catch (err) {
      console.error('Re-assignment failed:', err);
      alert('Failed to re-assign work order. Please try again.');
    } finally {
      setIsReassigning(false);
    }
  };

  const handleReschedule = async (e) => {
    if (e) e.preventDefault();
    setIsReassigning(true);
    try {
      const targetId = job?.request_id || job?.id || jobId;
      const effectiveReason = delayReason === 'Others' && otherDelayReason.trim()
        ? otherDelayReason.trim()
        : (delayReason || 'Procurement delay');
      await rescheduleRequest(targetId, {
        reason: effectiveReason,
        nextDate: nextDate,
        billNumber: billNumber,
        notes: officerNote
      });
      setIsReschedulingMode(false);
      setReassignSuccessMsg(`Request rescheduled for ${nextDate} and moved to Requests tab under Scheduled.`);
      setTimeout(() => {
        setReassignSuccessMsg(null);
        if (setCurrentPage) setCurrentPage('requests');
      }, 1500);
    } catch (err) {
      console.error('Reschedule failed:', err);
      alert('Failed to reschedule work order. Please try again.');
    } finally {
      setIsReassigning(false);
    }
  };

  const imageList = (() => {
    let imgs = job?.images || job?.evidence || [];
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

  const personnelName = job?.assignedPersonnel?.name || (job?.lead_person ? job.lead_person.split(' - ')[0].trim() : 'Supervisor');
  const personnelRole = job?.assignedPersonnel?.role || (job?.lead_person?.includes(' - ') ? job.lead_person.split(' - ')[1].trim() : '') || job?.team_name || 'Supervisor';
  const personnelPhone = job?.assignedPersonnel?.phone || '+94 77 123 4567';
  const personnelEmail = job?.assignedPersonnel?.email || 'supervisor@itum.mrt.ac.lk';

  const isRejectedBySupervisor =
    job?.status === 'Rejected' ||
    job?.status === 'Cancelled' ||
    Boolean(job?.notes?.includes('[REJECTED]')) ||
    Boolean(job?.completionNotes?.includes('[REJECTED]'));

  const cleanRejectionReason = (job?.notes || job?.completionNotes || '')
    .replace(/^\[REJECTED\]:\s*/i, '')
    .trim();

  const hasSupervisor = Boolean(
    !isRejectedBySupervisor && (
      (job?.lead_person && job.lead_person !== 'Supervisor' && job.lead_person !== 'Unassigned' && job.lead_person.trim() !== '') ||
      (job?.assignedPersonnel?.name && job.assignedPersonnel.name !== 'Unassigned' && job.assignedPersonnel.name !== 'Supervisor' && job.assignedPersonnel.name.trim() !== '') ||
      (Number(job?.labourers_assigned || 0) > 0 && job?.status !== 'Scheduled')
    )
  );

  const targetScheduledDate = (() => {
    const raw = job?.due_date || job?.scheduled_date || (reassignDate ? reassignDate : null);
    if (!raw) return null;
    if (raw instanceof Date) return raw;
    if (typeof raw === 'string') {
      const clean = raw.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
        const d = new Date(`${clean}T23:59:59`);
        return isNaN(d.getTime()) ? new Date(clean) : d;
      }
      const d = new Date(clean);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  })();

  const countdown = (() => {
    if (!targetScheduledDate) return null;
    const target = new Date(targetScheduledDate).getTime();
    if (isNaN(target)) return null;

    const diff = target - now;
    const isOverdue = diff < 0;
    const absDiff = Math.abs(diff);

    const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((absDiff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((absDiff / (1000 * 60)) % 60);
    const seconds = Math.floor((absDiff / 1000) % 60);

    return { isOverdue, days, hours, minutes, seconds, diff };
  })();

  return (
    <div>
      {/* Success Feedback Notification */}
      {reassignSuccessMsg && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1.5px solid #a7f3d0',
          color: '#065f46',
          padding: '14px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13.5px',
          fontWeight: 600,
          boxShadow: '0 2px 6px rgba(5,150,105,0.1)'
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{reassignSuccessMsg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
              #{job?.id || 'JOB-3954'}
            </h1>
            {isRejectedBySupervisor ? (
              <span style={{
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 700,
                border: '1px solid #fca5a5',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <X size={13} /> Rejected by Supervisor
              </span>
            ) : (
              <span style={{
                backgroundColor: job?.status === 'Completed' ? '#ecfdf5' : '#eff6ff',
                color: job?.status === 'Completed' ? '#059669' : '#2563eb',
                padding: '4px 12px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: job?.status === 'Completed' ? '1px solid #a7f3d0' : '1px solid #bfdbfe'
              }}>
                {job?.status || 'In Progress'}
              </span>
            )}
            <span style={{
              backgroundColor: '#fff1f2',
              color: '#be123c',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: '1px solid #fecdd3',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              ▲ {job?.priority || 'Medium Priority'}
            </span>
          </div>
          <div style={{ fontSize: '15px', color: '#475569', marginTop: '4px', fontWeight: 500 }}>
            {job?.fullTitle || job?.title || 'Maintenance Work Order'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              if (supervisorsList.length > 0) {
                const alt = supervisorsList.find(s => !s.name.toLowerCase().includes(personnelName.toLowerCase()));
                if (alt) setSelectedSupervisor(alt.name);
              }
              setIsReassignModalOpen(true);
            }}
            style={{
              backgroundColor: '#7a1521',
              color: '#ffffff',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13.5px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(122,21,33,0.25)',
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw size={15} /> Re-assign to Another Supervisor
          </button>

          <button
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ padding: '9px 18px', gap: '8px', fontSize: '13.5px' }}
          >
            <Printer size={16} /> Print Work Order
          </button>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Job Details & Assigned Personnel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Job Details Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Info size={14} style={{ color: '#475569' }} />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                Job Details
              </h2>
            </div>

            {/* Meta Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px 24px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--color-border)'
            }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Target Completion Date
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13.5px', color: '#1e293b', fontWeight: 500 }}>
                  <Calendar size={16} style={{ color: '#7a1521' }} />
                  {job?.due_date ? new Date(job.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending Schedule'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Maintenance Category
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13.5px', color: '#1e293b', fontWeight: 500 }}>
                  <Wrench size={16} style={{ color: '#7a1521' }} />
                  {job?.category || 'General Maintenance'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Location & Department
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13.5px', color: '#7a1521', fontWeight: 500, flexWrap: 'wrap' }}>
                  <MapPin size={16} style={{ color: '#7a1521', flexShrink: 0 }} />
                  <span>{job?.location || 'Main Campus Complex'}</span>
                  {(() => {
                    const z = job?.zone || getZoneFromLocation(job?.location);
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
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Linked Request Ticket
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', fontSize: '13.5px', color: '#7a1521', fontWeight: 700 }}>
                  #{job?.request_id || job?.requestRef || 'REQ-8291'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Description & Diagnostic Narrative
              </div>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.6', margin: 0, backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                {job?.description || 'No detailed narrative recorded.'}
              </p>
            </div>

            {/* Attached Images */}
            <div style={{ paddingTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                Reported Evidence ({imageList.length})
              </div>
              {imageList.length > 0 ? (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {imageList.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveMediaModal(img)}
                      style={{
                        cursor: 'pointer',
                        width: '84px',
                        height: '84px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        position: 'relative'
                      }}
                      title="Click to view full image"
                    >
                      <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  border: '1px dashed #cbd5e1',
                  textAlign: 'center',
                  color: '#64748b',
                  fontSize: '12.5px'
                }}>
                  No image evidence attached.
                </div>
              )}
            </div>
          </div>

          {/* Assigned Personnel Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={16} style={{ color: '#7a1521' }} />
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                  Assigned Personnel
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (supervisorsList.length > 0) {
                    const alt = supervisorsList.find(s => !s.name.toLowerCase().includes(personnelName.toLowerCase()));
                    if (alt) setSelectedSupervisor(alt.name);
                  }
                  setIsReassignModalOpen(true);
                }}
                style={{
                  backgroundColor: '#fff0ef',
                  color: '#7a1521',
                  border: '1px solid #ffd0cc',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <RefreshCw size={12} /> Change Supervisor
              </button>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '14px 18px',
              borderRadius: '10px',
              border: isRejectedBySupervisor ? '1.5px solid #fecaca' : '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: isRejectedBySupervisor ? '#b91c1c' : '#7a1521',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '16px',
                  boxShadow: '0 2px 6px rgba(122, 21, 33, 0.2)'
                }}>
                  {personnelName.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>
                    {personnelName}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                    {personnelRole}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`tel:${personnelPhone}`}
                  title="Call Technician"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7a1521',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={15} />
                </a>
                <a
                  href={`mailto:${personnelEmail}`}
                  title="Email Technician"
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#7a1521',
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={15} />
                </a>
              </div>
            </div>

            {/* Completion Proof & Remarks (Shown underneath Assigned Personnel when completed or remarks entered) */}
            {(job?.proof_photo || job?.proofPhoto || job?.notes || job?.status === 'Completed' || isRejectedBySupervisor) && (
              <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#ffffff',
                borderRadius: '10px',
                border: isRejectedBySupervisor ? '1.5px solid #fecaca' : '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} style={{ color: isRejectedBySupervisor ? '#b91c1c' : job?.status === 'Completed' ? '#059669' : '#7a1521' }} />
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                      {isRejectedBySupervisor ? 'Technician Rejection Remarks & Diagnostic' : job?.status === 'Completed' ? 'Job Completion Report & Evidence' : 'Technician Work Remarks & Evidence'}
                    </span>
                  </div>
                  <span style={{
                    backgroundColor: isRejectedBySupervisor ? '#fee2e2' : job?.status === 'Completed' ? '#ecfdf5' : '#fff0ef',
                    color: isRejectedBySupervisor ? '#b91c1c' : job?.status === 'Completed' ? '#059669' : '#7a1521',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    border: isRejectedBySupervisor ? '1px solid #fca5a5' : job?.status === 'Completed' ? '1px solid #a7f3d0' : '1px solid #ffd0cc',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {isRejectedBySupervisor ? <X size={12} /> : <CheckCircle2 size={12} />}
                    {isRejectedBySupervisor ? 'Declined by Supervisor' : job?.status === 'Completed' ? 'Work Completed' : (job?.status || 'In Progress')}
                  </span>
                </div>

                {/* Technician Completion Description / Remarks */}
                <div>
                  <label style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px'
                  }}>
                    {isRejectedBySupervisor ? 'Supervisor Stated Rejection Reason' : 'Completion Remarks & Description'}
                  </label>
                  <div style={{
                    backgroundColor: isRejectedBySupervisor ? '#fff1f2' : '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: isRejectedBySupervisor ? '1px solid #fecdd3' : '1px solid #e2e8f0',
                    fontSize: '13px',
                    color: isRejectedBySupervisor ? '#9f1239' : '#1e293b',
                    lineHeight: '1.55',
                    whiteSpace: 'pre-wrap',
                    fontWeight: isRejectedBySupervisor ? 500 : 400
                  }}>
                    {job?.notes || job?.completionNotes || 'The assigned personnel has completed the work order.'}
                  </div>
                </div>

                {/* Completion Proof Image */}
                <div>
                  <label style={{
                    fontSize: '11.5px',
                    fontWeight: 600,
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.4px'
                  }}>
                    Completion Proof Image
                  </label>
                  {job?.proof_photo || job?.proofPhoto ? (
                    <div
                      onClick={() => setActiveMediaModal({ url: job.proof_photo || job.proofPhoto, name: 'Job Completion Evidence' })}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#0f172a',
                        maxHeight: '280px',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Click to view full image"
                    >
                      <img
                        src={job.proof_photo || job.proofPhoto}
                        alt="Job Completion Proof"
                        style={{
                          width: '100%',
                          maxHeight: '280px',
                          objectFit: 'contain',
                          borderRadius: '10px'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(0,0,0,0.75)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        🔍 View Full Photo
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      padding: '16px',
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px dashed #cbd5e1',
                      textAlign: 'center',
                      color: '#64748b',
                      fontSize: '12.5px'
                    }}>
                      No completion proof photo attached.
                    </div>
                  )}
                </div>

                {/* Re-assign Quick CTA Footer */}
                {isRejectedBySupervisor && (
                  <div style={{
                    marginTop: '8px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      This work order is awaiting re-assignment to an available supervisor.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (supervisorsList.length > 0) {
                          const alt = supervisorsList.find(s => !s.name.toLowerCase().includes(personnelName.toLowerCase()));
                          if (alt) setSelectedSupervisor(alt.name);
                        }
                        setIsReassignModalOpen(true);
                      }}
                      style={{
                        backgroundColor: '#7a1521',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 4px rgba(122,21,33,0.2)'
                      }}
                    >
                      <UserCheck size={14} /> Re-assign to Another Supervisor
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scheduling & Re-assignment (from Screenshot 2) + Action History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* If MO requests reschedule or supervisor rejected, render the exact Scheduling & Assignment component from Screenshot 2 */}
          {(isReschedulingMode || isRejectedBySupervisor) ? (
            <div>
              {/* Equipment Mode Tabs */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: '#fff0ef',
                padding: '4px',
                borderRadius: '10px',
                border: '1px solid #ffd0cc',
                marginBottom: '16px'
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

              {/* Out-of-stock warning banner if unavailable */}
              {equipmentMode === 'unavailable' && (
                <div style={{
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  marginBottom: '16px'
                }}>
                  <Package size={20} style={{ color: '#be123c', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#9f1239' }}>
                      Equipment Out of Stock - Needs Purchase/Delay
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#be123c', marginTop: '2px' }}>
                      Required components or specialized tools are currently unavailable in central stores.
                    </div>
                  </div>
                </div>
              )}

              {/* Form Container (Matches Screenshot 2) */}
              <div className="card" style={{ padding: '24px' }}>
                {equipmentMode === 'available' ? (
                  /* TAB 1: Scheduling & Assignment */
                  <form onSubmit={handleConfirmReassign}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: '#7a1521',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        1
                      </div>
                      <h2 style={{ fontSize: '17px', fontWeight: 600, color: '#1e293b' }}>
                        Scheduling & Assignment
                      </h2>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        ASSIGN TO SUPERVISOR
                      </label>
                      <select
                        className="form-select"
                        value={selectedSupervisor}
                        onChange={(e) => setSelectedSupervisor(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          color: '#1e293b',
                          backgroundColor: '#ffffff'
                        }}
                      >
                        {supervisorsList.length > 0 ? (
                          supervisorsList.map((sup, idx) => {
                            const supName = sup.name;
                            const val = `${supName} - ${sup.trade || 'Supervisor'}`;
                            const isCurrent = supName.toLowerCase().includes(personnelName.toLowerCase());
                            return (
                              <option key={sup.id || idx} value={val}>
                                {supName} — {sup.trade || 'Supervisor'} ({isCurrent ? 'Declined' : 'Available'})
                              </option>
                            );
                          })
                        ) : (
                          <option value="">No Registered Supervisors Available</option>
                        )}
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        ESTIMATED COMPLETION TIME
                      </label>
                      <div
                        className="custom-date-picker-wrap"
                        onClick={() => openDatePicker(reassignDateInputRef)}
                        style={{
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          width: '100%',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          ref={reassignDateInputRef}
                          type="date"
                          className="form-input"
                          value={reassignDate}
                          onChange={(e) => setReassignDate(e.target.value)}
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
                            openDatePicker(reassignDateInputRef);
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

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        SPECIAL INSTRUCTIONS FOR SUPERVISOR
                      </label>
                      <textarea
                        className="form-textarea"
                        rows="4"
                        placeholder="Add notes regarding lab access, safety protocols, or specific tools needed..."
                        value={reassignNotes}
                        onChange={(e) => setReassignNotes(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          color: '#1e293b',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {isReschedulingMode && (
                        <button
                          type="button"
                          onClick={() => setIsReschedulingMode(false)}
                          className="btn btn-secondary btn-lg"
                          style={{
                            padding: '12px 18px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isReassigning}
                        className="btn btn-primary btn-lg"
                        style={{
                          flex: 1,
                          backgroundColor: '#7a1521',
                          borderColor: '#7a1521',
                          color: '#ffffff',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: isReassigning ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 2px 6px rgba(122,21,33,0.25)'
                        }}
                      >
                        <span>{isReassigning ? 'Scheduling...' : (isReschedulingMode ? 'Update Schedule' : 'Assign Job to Supervisor')}</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
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

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        REASON FOR DELAY
                      </label>
                      <select
                        className="form-select"
                        value={delayReason}
                        onChange={(e) => setDelayReason(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          color: '#1e293b',
                          backgroundColor: '#ffffff'
                        }}
                      >
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

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        SET NEXT AVAILABLE DATE
                      </label>
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

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label className="form-label" style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        BILL NUMBER
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. BILL-99201"
                        value={billNumber}
                        onChange={(e) => setBillNumber(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          color: '#1e293b',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                      <label className="form-label" style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        display: 'block',
                        marginBottom: '6px'
                      }}>
                        MAINTENANCE OFFICER NOTES
                      </label>
                      <textarea
                        className="form-textarea"
                        rows="3"
                        placeholder="Additional context on procurement or dispatch plan..."
                        value={officerNote}
                        onChange={(e) => setOfficerNote(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          color: '#1e293b',
                          resize: 'vertical',
                          boxSizing: 'border-box',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      {isReschedulingMode && (
                        <button
                          type="button"
                          onClick={() => setIsReschedulingMode(false)}
                          className="btn btn-secondary btn-lg"
                          style={{
                            padding: '12px 18px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '14px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isReassigning}
                        className="btn btn-lg"
                        style={{
                          flex: 1,
                          backgroundColor: '#475569',
                          color: '#ffffff',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: isReassigning ? 'not-allowed' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          border: 'none'
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
          ) : hasSupervisor ? (
            /* ASSIGNED SUPERVISOR DETAILS CARD (NO COUNTDOWN TIMER) */
            <div className="card" style={{ padding: '24px', animation: 'fadeIn 0.25s ease' }}>
              {/* Card Header for Assigned Supervisor */}
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
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#fff0ef',
                    color: '#7a1521',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                      Assigned Supervisor Details
                    </h2>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                      Work order dispatched to field personnel
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
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0'
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.25)'
                  }} />
                  {job?.status || 'Assigned'}
                </span>
              </div>

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
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#7a1521',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '18px',
                    boxShadow: '0 3px 8px rgba(122, 21, 33, 0.25)'
                  }}>
                    {personnelName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                        {personnelName}
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
                        {personnelRole}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '12.5px', color: '#64748b' }}>
                      <a
                        href={`tel:${personnelPhone}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#475569', textDecoration: 'none' }}
                      >
                        <Phone size={13} style={{ color: '#7a1521' }} />
                        <span>{personnelPhone}</span>
                      </a>
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

              {/* Work Order Specs Grid */}
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
                    {job?.id || jobId}
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
                    {targetScheduledDate 
                      ? new Date(targetScheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : 'Not set'}
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
                    <span>Labourers Count</span>
                  </div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#1e293b', marginTop: '5px' }}>
                    {job?.labourers_assigned || 1} Labourer(s)
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
                    {job?.team_name || 'Works & Maintenance Division'}
                  </div>
                </div>
              </div>

              {/* Special Instructions Box if any */}
              {(job?.instructions || job?.notes) && (
                <div style={{
                  marginBottom: '20px',
                  padding: '14px 16px',
                  backgroundColor: '#fffbfa',
                  border: '1px solid #fed7d7',
                  borderRadius: '10px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 600, color: '#7a1521', marginBottom: '6px' }}>
                    <FileText size={14} />
                    <span>Instructions / Work Order Notes:</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                    {job?.instructions || job?.notes}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsReschedulingMode(true)}
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
                  <span>Change Supervisor / Schedule</span>
                </button>
              </div>
            </div>
          ) : (
            /* SCHEDULED EXECUTION PLAN & LIVE COUNTDOWN (ONLY WHEN NOT ASSIGNED) */
            <div className="card" style={{ padding: '24px', animation: 'fadeIn 0.25s ease' }}>
              {/* Header */}
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
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: '#fff0ef',
                    color: '#7a1521',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>
                      Scheduled Execution Plan
                    </h2>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                      Target completion & supervisor allocation
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
                  backgroundColor: countdown?.isOverdue ? '#fef2f2' : '#ecfdf5',
                  color: countdown?.isOverdue ? '#dc2626' : '#059669',
                  border: `1px solid ${countdown?.isOverdue ? '#fecaca' : '#a7f3d0'}`
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: countdown?.isOverdue ? '#dc2626' : '#10b981',
                    boxShadow: `0 0 0 2px ${countdown?.isOverdue ? 'rgba(220, 38, 38, 0.2)' : 'rgba(16, 185, 129, 0.25)'}`
                  }} />
                  {countdown?.isOverdue ? 'Schedule Overdue' : 'On Schedule'}
                </span>
              </div>

              {/* Scheduled Date Highlight Box */}
              <div style={{
                backgroundColor: '#fafaf9',
                border: '1px solid #e7e5e4',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '20px',
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
                    <span>
                      {targetScheduledDate 
                        ? new Date(targetScheduledDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
                        : 'Date Pending'}
                    </span>
                  </div>
                </div>

                {/* Reschedule Button */}
                <button
                  type="button"
                  onClick={() => setIsReschedulingMode(true)}
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
                padding: '18px 20px',
                marginBottom: '20px'
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
                    <div style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: countdown?.isOverdue ? '#991b1b' : '#14532d',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.1
                    }}>
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
                    <div style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: countdown?.isOverdue ? '#991b1b' : '#14532d',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.1
                    }}>
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
                    <div style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: countdown?.isOverdue ? '#991b1b' : '#14532d',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.1
                    }}>
                      {String(countdown?.minutes ?? 0).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginTop: '4px', textTransform: 'uppercase' }}>
                      Minutes
                    </div>
                  </div>

                  {/* Secs */}
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '10px 4px',
                    borderRadius: '8px',
                    border: `1px solid ${countdown?.isOverdue ? '#fed7d7' : '#dcfce7'}`,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      color: countdown?.isOverdue ? '#dc2626' : '#16a34a',
                      fontVariantNumeric: 'tabular-nums',
                      lineHeight: 1.1
                    }}>
                      {String(countdown?.seconds ?? 0).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', marginTop: '4px', textTransform: 'uppercase' }}>
                      Seconds
                    </div>
                  </div>
                </div>
              </div>

              {/* Scheduled Status Notice & Allocation Button */}
              <div style={{
                backgroundColor: '#faf5ff',
                border: '1px solid #e9d5ff',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#6b21a8', marginBottom: '4px' }}>
                  <Calendar size={15} style={{ color: '#7c3aed' }} />
                  <span>Scheduled - Personnel Allocation Pending</span>
                </div>
                <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                  This work order is scheduled for target date {targetScheduledDate ? new Date(targetScheduledDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Pending'}. Assign a supervisor when ready to execute.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsReschedulingMode(true)}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  gap: '8px',
                  padding: '11px',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  backgroundColor: '#7a1521',
                  borderColor: '#7a1521'
                }}
              >
                <UserCheck size={15} />
                <span>Assign Supervisor Now</span>
              </button>
            </div>
          )}

          {/* Action History Timeline */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <History size={16} style={{ color: '#7a1521' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                Action History
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '8px' }}>
              {/* Timeline Vertical Track */}
              <div style={{
                position: 'absolute',
                top: '12px',
                bottom: '12px',
                left: '14px',
                width: '2px',
                backgroundColor: '#e2e8f0',
                zIndex: 1
              }} />

              {/* Step 1: Work In Progress / Active / Rejected */}
              <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
                <div style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: isRejectedBySupervisor ? '#b91c1c' : job?.status === 'Completed' ? '#059669' : '#2563eb',
                  border: '2px solid #ffffff',
                  boxShadow: isRejectedBySupervisor ? '0 0 0 2px #b91c1c' : '0 0 0 2px #2563eb',
                  marginTop: '4px',
                  flexShrink: 0
                }} />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {isRejectedBySupervisor
                      ? 'Work Order Declined by Supervisor'
                      : job?.status === 'Completed'
                        ? 'Work Order Completed & Verified'
                        : 'Work Order In Progress'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    <Clock size={12} />
                    <span>Assigned to {personnelName}</span>
                  </div>
                  {job?.notes && (
                    <p style={{ fontSize: '12.5px', color: isRejectedBySupervisor ? '#b91c1c' : '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                      "{job.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Step 2: Scheduled */}
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
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                    Job Scheduled & Dispatched
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    <Calendar size={12} />
                    <span>Target Due: {job?.due_date ? new Date(job.due_date).toLocaleDateString() : 'Active'}</span>
                  </div>
                </div>
              </div>

              {/* Step 3: Request Created */}
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
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#475569' }}>
                    Request Received & Registered
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                    <Calendar size={12} />
                    <span>Reported by {job?.requester || 'Requester'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Re-assign Supervisor Modal */}
      {isReassignModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsReassignModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2), 0 10px 10px -5px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#fff0ef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7a1521'
                }}>
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                    Re-assign Work Order #{job?.id}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                    Select another supervisor to dispatch this maintenance work order.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReassignModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Previous Assignee Notice if rejected */}
            {isRejectedBySupervisor && (
              <div style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: '8px',
                padding: '10px 12px',
                fontSize: '12px',
                color: '#9f1239',
                marginBottom: '16px'
              }}>
                <strong>Previous Assignee:</strong> {personnelName} (Declined: "{cleanRejectionReason || 'Over capacity'}")
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleConfirmReassign} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Supervisor Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Select New Supervisor <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#1e293b',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    fontWeight: 500
                  }}
                >
                  <option value="" disabled>-- Choose Available Supervisor --</option>
                  {supervisorsList.map((sup, idx) => (
                    <option key={idx} value={sup.name}>
                      {sup.name} ({sup.trade} - {sup.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Due Date */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Target Due Date <span style={{ color: '#e11d48' }}>*</span>
                </label>
                <div
                  className="custom-date-picker-wrap"
                  onClick={() => openDatePicker(modalDateInputRef)}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    ref={modalDateInputRef}
                    type="date"
                    value={reassignDate}
                    onChange={(e) => setReassignDate(e.target.value)}
                    onClick={(e) => {
                      try { e.target.showPicker?.(); } catch (err) {}
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 40px 9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      color: '#1e293b',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      cursor: 'pointer'
                    }}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={(e) => {
                      e.stopPropagation();
                      openDatePicker(modalDateInputRef);
                    }}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'transparent',
                      border: 'none',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#64748b'
                    }}
                    title="Select Date"
                    aria-label="Select Date"
                  >
                    <Calendar size={17} style={{ color: '#475569' }} />
                  </button>
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Special Instructions / Reassignment Notes
                </label>
                <textarea
                  value={reassignNotes}
                  onChange={(e) => setReassignNotes(e.target.value)}
                  placeholder="Enter instructions for the new supervisor (e.g. Expedited priority, check main breakers)..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#1e293b',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  type="button"
                  onClick={() => setIsReassignModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReassigning || !selectedSupervisor}
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#7a1521',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: isReassigning ? 'not-allowed' : 'pointer',
                    opacity: isReassigning ? 0.7 : 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(122,21,33,0.25)'
                  }}
                >
                  <UserCheck size={16} />
                  <span>{isReassigning ? 'Re-assigning...' : 'Confirm Re-assignment'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    </div>
  );
}
