import React from 'react';

export default function DonutChart({
  data = [
    { name: 'Pending', count: 14, percentage: 11, color: '#f59e0b' },
    { name: 'In Progress', count: 32, percentage: 25, color: '#3b82f6' },
    { name: 'Completed', count: 75, percentage: 59, color: '#10b981' },
    { name: 'Overdue', count: 7, percentage: 5, color: '#ef4444' }
  ],
  totalLabel = 'Total',
  size = 140,
  thickness = 18
}) {
  const total = data.reduce((acc, cur) => acc + cur.count, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* SVG Donut */}
      <div style={{ position: 'relative', width: size, height: size, margin: '8px 0' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, index) => {
            const percent = total > 0 ? (item.count / total) * 100 : 0;
            const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += percent;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={thickness}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>

        {/* Center Label */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', lineHeight: 1 }}>
            {total}
          </span>
          <span style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 16px',
          width: '100%',
          marginTop: '12px'
        }}
      >
        {data.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: item.color,
                flexShrink: 0
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '11px', fontWeight: '500', color: '#475569', lineHeight: 1.2 }}>
                {item.name}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                {item.count} ({item.percentage}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
