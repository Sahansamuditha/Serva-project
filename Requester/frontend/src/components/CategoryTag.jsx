import React from 'react';

export default function CategoryTag({ category }) {
  const norm = (category || '').toLowerCase();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  if (norm.includes('hvac')) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (norm.includes('plumb')) {
    bg = 'bg-sky-50 text-sky-700 border-sky-200';
  } else if (norm.includes('elect')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (norm.includes('av') || norm.includes('equip')) {
    bg = 'bg-violet-50 text-violet-700 border-violet-200';
  }

  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold border ${bg}`}>
      {category}
    </span>
  );
}
