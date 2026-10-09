import React, { useState, useEffect } from 'react';
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
  ArrowLeft 
} from 'lucide-react';
import { fetchJobById } from '../api';

export default function JobDetails({ jobId = 'JOB-1024', setCurrentPage }) {
  const [job, setJob] = useState(null);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  async function loadJob() {
    const data = await fetchJobById(jobId);
    if (data) setJob(data);
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
              #{job?.id || 'JOB-1024'}
            </h1>
            <span style={{
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              padding: '4px 12px',
              borderRadius: '9999px',
              fontSize: '12.5px',
              fontWeight: 600,
              border: '1px solid #bfdbfe'
            }}>
              {job?.status || 'In Progress'}
            </span>
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
              ▲ {job?.priority || 'Critical'}
            </span>
          </div>
          <div style={{ fontSize: '15px', color: '#475569', marginTop: '4px', fontWeight: 500 }}>
            {job?.title || 'AC Unit Compressor Replacement'}
          </div>
        </div>

        <button 
          onClick={handlePrint}
          className="btn btn-secondary" 
          style={{ padding: '9px 18px', gap: '8px', fontSize: '13.5px' }}
        >
          <Printer size={16} /> Print Work Order
        </button>
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
                  REQUEST ID
                </div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b', marginTop: '4px' }}>
                  # #{job?.requestRef || 'REQ-8291'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  LOCATION
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginTop: '4px' }}>
                  <MapPin size={14} style={{ color: '#64748b' }} />
                  <span>{job?.location || 'Science Bldg U2017'}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  CATEGORY
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginTop: '4px' }}>
                  <Triangle size={13} style={{ color: '#64748b' }} />
                  <span>{job?.category || 'HVAC'}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  REPORTED DATE
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginTop: '4px' }}>
                  <Calendar size={14} style={{ color: '#64748b' }} />
                  <span>{job?.reportedDate || 'Oct 24, 2023'}</span>
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  REQUESTER
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, color: '#1e293b', marginTop: '4px' }}>
                  <User size={14} style={{ color: '#64748b' }} />
                  <span>{job?.requester || 'Dr. Sarah Jenkins'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                DESCRIPTION
              </div>
              <div style={{
                backgroundColor: '#f8fafc',
                padding: '14px 16px',
                borderRadius: '8px',
                fontSize: '13.5px',
                color: '#334155',
                lineHeight: 1.6,
                border: '1px solid #f1f5f9'
              }}>
                {job?.description || 'The main compressor unit has failed. Requires full replacement and system testing. Unit is currently leaking coolant and making abnormal grinding noises when powered on. Immediate attention required to prevent further damage to the central air system in the Science wing.'}
              </div>
            </div>

            {/* Reference Images */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                REFERENCE IMAGES
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{
                  height: '140px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  background: 'linear-gradient(135deg, #334155, #0f172a)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 500,
                  textAlign: 'center',
                  padding: '10px'
                }}>
                  Circuit Board Diagnostics
                </div>
                <div style={{
                  height: '140px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid var(--color-border)',
                  background: 'linear-gradient(135deg, #64748b, #1e293b)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: 500,
                  textAlign: 'center',
                  padding: '10px'
                }}>
                  Compressor Unit Physical Inspection
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Personnel Card */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <User size={16} style={{ color: '#7a1521' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                Assigned Personnel
              </h2>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              padding: '14px 18px',
              borderRadius: '10px',
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: '#7a1521',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '15px'
                }}>
                  DC
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b' }}>
                    {job?.assignedPersonnel?.name || 'David Chen'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                    {job?.assignedPersonnel?.role || 'Lead Technician / Supervisor'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <a 
                  href={`tel:${job?.assignedPersonnel?.phone || '+94779876543'}`}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  <Phone size={16} />
                </a>
                <a 
                  href={`mailto:${job?.assignedPersonnel?.email || 'david.chen@itum.mrt.ac.lk'}`}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    border: '1px solid var(--color-border)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#475569',
                    cursor: 'pointer'
                  }}
                >
                  <Mail size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Action History Timeline */}
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

            {/* Timeline Steps matching Image 9.png */}
            <div style={{ display: 'flex', gap: '16px', position: 'relative', zIndex: 2 }}>
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                border: '2px solid #ffffff',
                boxShadow: '0 0 0 2px #2563eb',
                marginTop: '4px',
                flexShrink: 0
              }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                  Diagnosis Complete - Parts ordered
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  <Calendar size={12} />
                  <span>Today, 09:45 AM</span>
                </div>
              </div>
            </div>

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
                  Job Scheduled
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  <Calendar size={12} />
                  <span>Oct 24, 14:30 PM</span>
                </div>
              </div>
            </div>

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
                  Request Approved
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  <Calendar size={12} />
                  <span>Oct 24, 10:15 AM</span>
                </div>
              </div>
            </div>

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
                  Request Created
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  <Calendar size={12} />
                  <span>Oct 24, 08:00 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
