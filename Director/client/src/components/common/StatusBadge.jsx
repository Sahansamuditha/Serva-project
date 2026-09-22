import React from 'react';

export default function StatusBadge({ status, type = 'status' }) {
  if (!status) return null;

  const normalized = status.toLowerCase().replace(/[\s-_]/g, '');

  let badgeClass = 'badge-idle';
  let hasDot = false;
  let dotColor = '#64748b';

  switch (normalized) {
    case 'critical':
    case 'error':
      badgeClass = 'badge-critical';
      break;
    case 'high':
    case 'warning':
      badgeClass = 'badge-high';
      break;
    case 'medium':
      badgeClass = 'badge-medium';
      break;
    case 'low':
      badgeClass = 'badge-low';
      break;
    case 'inprogress':
      badgeClass = 'badge-in-progress';
      break;
    case 'scheduled':
      badgeClass = 'badge-scheduled';
      break;
    case 'completed':
    case 'verified':
      badgeClass = 'badge-completed';
      break;
    case 'pending':
      badgeClass = 'badge-pending';
      break;
    case 'active':
      badgeClass = 'badge-active';
      hasDot = true;
      dotColor = '#10b981';
      break;
    case 'idle':
      badgeClass = 'badge-idle';
      hasDot = true;
      dotColor = '#94a3b8';
      break;
    case 'info':
      badgeClass = 'badge-in-progress';
      break;
    default:
      badgeClass = 'badge-idle';
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {hasDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: dotColor,
            display: 'inline-block',
            marginRight: '4px'
          }}
        />
      )}
      {status}
    </span>
  );
}
