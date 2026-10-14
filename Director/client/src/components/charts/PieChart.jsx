import React from 'react';

export default function PieChart({
  data = [
    { category: 'Electrical', count: 30, percentage: 23, color: '#f59e0b' },
    { category: 'Plumbing', count: 25, percentage: 20, color: '#3b82f6' },
    { category: 'HVAC', count: 22, percentage: 17, color: '#10b981' },
    { category: 'Civil', count: 18, percentage: 14, color: '#8b5cf6' },
    { category: 'Carpentry', count: 15, percentage: 12, color: '#f97316' },
    { category: 'Other', count: 18, percentage: 14, color: '#64748b' }
  ],
  size = 140
}) {
  const total = data.reduce((acc, cur) => acc + cur.count, 0);
  const radius = size / 2;

  let currentAngle = 0;

  const paths = data.map((item) => {
    const angle = (item.count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = radius + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
    const y1 = radius + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
    const x2 = radius + radius * Math.cos((Math.PI * (endAngle - 90)) / 180);
    const y2 = radius + radius * Math.sin((Math.PI * (endAngle - 90)) / 180);

    const largeArc = angle > 180 ? 1 : 0;
    const d = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return { d, color: item.color };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      {/* Pie Graphic */}
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p, idx) => (
          <path key={idx} d={p.d} fill={p.color} stroke="#ffffff" strokeWidth="1.5" />
        ))}
      </svg>

      {/* Side Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
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
            <span style={{ fontSize: '11px', color: '#475569', minWidth: '65px' }}>
              {item.category}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '500' }}>
              {item.count} ({item.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
