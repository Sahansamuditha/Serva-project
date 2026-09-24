import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import { fetchRequestById, assignRequest, rescheduleRequest, actionRequest } from '../api';

export default function RequestReview({ requestId = 'REQ-8291', setCurrentPage }) {
  const [request, setRequest] = useState(null);
  const [equipmentMode, setEquipmentMode] = useState('available'); // 'available' | 'unavailable'

  // Acceptance state (locks scheduling until accepted)
  const [acceptedOverride, setAcceptedOverride] = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const isAccepted = acceptedOverride || 
    request?.status?.toLowerCase() === 'accepted' || 
    request?.status?.toLowerCase() === 'scheduled' || 
    request?.status?.toLowerCase() === 'in progress';

  // Assignment Form State
  const [technician, setTechnician] = useState('Kasun Perera - Electrician');
  const [completionDate, setCompletionDate] = useState('2026-05-02');
  const [instructions, setInstructions] = useState('');

  // Rescheduling Form State
  const [delayReason, setDelayReason] = useState('');
  const [nextDate, setNextDate] = useState('2026-05-02');
  const [billNumber, setBillNumber] = useState('');
  const [officerNote, setOfficerNote] = useState('');

  const [activeMediaModal, setActiveMediaModal] = useState(null);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  async function loadRequest() {
    const data = await fetchRequestById(requestId);
    if (data) {
      setRequest(data);
    }
  }

  const handleAssign = async (e) => {
    e.preventDefault();
    await assignRequest(requestId, {
      technician,
      completionDate,
      instructions
    });
    alert(`Job assigned to ${technician} successfully!`);
    setCurrentPage('jobs');
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    await rescheduleRequest(requestId, {
      reason: delayReason,
      nextDate,
      billNumber,
      notes: officerNote
    });
    alert(`Request rescheduled for ${nextDate} due to procurement.`);
    loadRequest();
  };

  const handleAction = async (action) => {
    if (action === 'accept') {
      setAcceptedOverride(true);
      await actionRequest(requestId, { action });
      loadRequest();
    } else if (action === 'reject') {
      setIsRejected(true);
      await actionRequest(requestId, { action: 'reject' });
      setTimeout(() => {
        setCurrentPage('requests');
      }, 1200);
    }
  };

  return (
    <div>
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
                {request?.title || 'AC Failure & Overheating'}
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
                {request?.category || 'HVAC'}
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
                <AlertTriangle size={13} /> {request?.priority || 'High Priority'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
              <Clock size={14} />
              <span>Submitted: {request?.submittedDate || 'May 02, 2026 - 10:25 AM'}</span>
            </div>
          </div>

          {isRejected ? (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fca5a5',
              padding: '9px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s ease'
            }}>
              <X size={16} /> Request Rejected
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
                {request?.requester?.initials || 'OH'}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                  {request?.requester?.name || 'Mrs. Oshini Hewage'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                  <Building2 size={15} />
                  <span>{request?.requester?.department || 'Civil Engineering Dept'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                  <MapPin size={15} />
                  <span>{request?.location || 'Science Bldg U2017'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
                  <Phone size={15} />
                  <span>{request?.requester?.phone || '+94 11 234 5678'}</span>
                </div>
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
              {request?.description || 'The AC unit is making a loud grinding noise and has stopped cooling. It is overheating rapidly. Urgent repair needed for sensitive equipment in the lab.'}
            </div>

            {/* Attached Evidence */}
            <div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748b', marginBottom: '12px' }}>
                Attached Evidence (3)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {/* Photo 1 */}
                <div 
                  onClick={() => setActiveMediaModal('ac')}
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
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #475569, #1e293b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', textAlign: 'center', padding: '4px'
                  }}>
                    <span>AC Vent Exterior</span>
                  </div>
                </div>

                {/* Photo 2 */}
                <div 
                  onClick={() => setActiveMediaModal('thermal')}
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
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'radial-gradient(circle, #ef4444, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '11px', fontWeight: 600
                  }}>
                    <span>Thermal Scan</span>
                  </div>
                </div>

                {/* Video 3 */}
                <div 
                  onClick={() => setActiveMediaModal('video')}
                  style={{
                    height: '90px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #fecdd3',
                    cursor: 'pointer',
                    backgroundColor: '#fff1f2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#be123c'
                  }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid #fecdd3'
                  }}>
                    <Play size={16} style={{ marginLeft: '2px' }} />
                  </div>
                </div>
              </div>
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
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>May 02, 10:45 AM</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Maintenance supervisor is currently reviewing the request and checking stock availability.
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
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>May 02, 10:25 AM</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                    Submitted by Mrs. Oshini Hewage via Staff Portal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Equipment Available vs Not Available */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  /* TAB 1: Scheduling & Assignment (Image 15.png) */
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
                      <label className="form-label">Assign to Technician</label>
                      <select 
                        className="form-select"
                        value={technician}
                        onChange={(e) => setTechnician(e.target.value)}
                      >
                        <option value="Kasun Perera - Electrician">Kasun Perera - Electrician</option>
                        <option value="David Chen - Lead Technician">David Chen - Lead Technician</option>
                        <option value="Tharindu Silva - HVAC Tech">Tharindu Silva - HVAC Tech</option>
                        <option value="Nimal Fernando - Plumber">Nimal Fernando - Plumber</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Estimated Completion Time</label>
                      <input 
                        type="date"
                        className="form-input"
                        value={completionDate}
                        onChange={(e) => setCompletionDate(e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Special Instructions for Technician</label>
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
                      <span>Assign Job to Labourer</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  /* TAB 2: Rescheduling & Procurement (Image 16.png) */
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
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Set Next Available Date</label>
                      <input 
                        type="date"
                        className="form-input"
                        value={nextDate}
                        onChange={(e) => setNextDate(e.target.value)}
                      />
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

                    <button 
                      type="submit" 
                      className="btn btn-lg" 
                      style={{
                        width: '100%',
                        marginTop: '12px',
                        backgroundColor: '#475569',
                        color: '#ffffff',
                        gap: '8px'
                      }}
                    >
                      <Calendar size={16} />
                      <span>Schedule for Later</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Lock / Prompt Overlay when not accepted */}
            {!isAccepted && (
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
            )}
          </div>
        </div>
      </div>

      {/* Media Evidence Modal */}
      {activeMediaModal && (
        <div className="modal-overlay" onClick={() => setActiveMediaModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '20px', maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Attached Evidence Preview</h3>
              <button onClick={() => setActiveMediaModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{
              height: '300px',
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              {activeMediaModal === 'video' ? (
                <div style={{ textAlign: 'center' }}>
                  <Play size={48} style={{ color: '#ef4444', marginBottom: '8px' }} />
                  <div>Playing Lab Noise Audio / Video Stream...</div>
                </div>
              ) : activeMediaModal === 'thermal' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#f87171' }}>FLIR Thermal Scan Data</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>Core Temperature: 94.2°C (Warning Threshold Exceeded)</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600 }}>Compressor Visual Inspection</div>
                  <div style={{ fontSize: '13px', color: '#94a3b8' }}>Model: Daikin Industrial VRV 5.0HP</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
