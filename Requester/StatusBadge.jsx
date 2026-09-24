import React from 'react';

export default function StatusBadge({ status }) {
  const norm = (status || '').toLowerCase();

  if (norm.includes('pending')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef3c7] text-[#92400e] border border-[#fde68a]">
        Pending {norm.includes('review') ? 'Review' : ''}
      </span>
    );
  }

  if (norm.includes('in progress')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dbeafe] text-[#1e40af] border border-[#bfdbfe]">
        In Progress
      </span>
    );
  }

  if (norm.includes('completed')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#d1fae5] text-[#065f46] border border-[#a7f3d0]">
        Completed
      </span>
    );
  }

  if (norm.includes('scheduled')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ede9fe] text-[#5b21b6] border border-[#ddd6fe]">
        Scheduled
      </span>
    );
  }

  if (norm.includes('overdue')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#991b1b] border border-[#fecaca]">
        Overdue
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
      {status || 'Unknown'}
    </span>
  );
}
