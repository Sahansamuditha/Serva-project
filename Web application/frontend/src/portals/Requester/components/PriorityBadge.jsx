import React from 'react';

export default function PriorityBadge({ priority }) {
  const norm = (priority || '').toLowerCase();

  if (norm.includes('critical')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffdad6] text-[#93000a] border border-[#ffb3b2]">
        Critical
      </span>
    );
  }

  if (norm.includes('high')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fed7aa] text-[#9a3412] border border-[#fdba74]">
        High
      </span>
    );
  }

  if (norm.includes('medium')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fef08a] text-[#854d0e] border border-[#fde047]">
        Medium
      </span>
    );
  }

  if (norm.includes('low')) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ccfbf1] text-[#115e59] border border-[#99f6e4]">
        Low
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]">
      {priority}
    </span>
  );
}
