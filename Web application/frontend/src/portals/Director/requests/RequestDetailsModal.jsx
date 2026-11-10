import React, { useState } from 'react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';
import {
  MapPin,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  UserCheck
} from 'lucide-react';

export default function RequestDetailsModal({ isOpen, onClose, request }) {
  if (!request) return null;

  const [assignedLabourer] = useState(
    request.assignedTo || 'Team A (Electrical Specialization)'
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Maintenance Request Details - ${request.id}`} maxWidth="650px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Header Badges & Quick Info Banner */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Request ID
            </div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#7a1521', marginTop: '2px' }}>
              {request.id}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px', textAlign: 'right' }}>Priority</div>
              <StatusBadge status={request.priority} />
            </div>
            <div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '2px', textAlign: 'right' }}>Status</div>
              <StatusBadge status={request.status} />
            </div>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
            {request.title}
          </h2>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0, lineHeight: '1.4' }}>
            Submitted for maintenance inspection and resolution at the specified university location.
          </p>
        </div>

        {/* Details Key-Value Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '14px',
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '10px',
            padding: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <MapPin size={16} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Location</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{request.location}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <Tag size={16} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Category</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{request.category}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <User size={16} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Requester</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{request.requester}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              <Calendar size={16} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Submitted Date</div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{request.date}</div>
            </div>
          </div>
        </div>

        {/* Assigned Labourer / Team Info */}
        <div style={{ backgroundColor: '#fff0ef', border: '1px solid #f3dedd', borderRadius: '10px', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#7a1521', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={15} /> Assigned Maintenance Unit
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#58000f', fontWeight: '500', margin: 0 }}>
            {assignedLabourer}
          </p>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onClose}
            style={{ width: '100px', justifyContent: 'center' }}
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
