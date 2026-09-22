import React from 'react';

export default function StatCard({ label, value, icon: Icon, color = 'blue' }) {
  const iconColorClass = `stat-icon-${color}`;

  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
      </div>
      {Icon && (
        <div className={`stat-icon-wrapper ${iconColorClass}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
