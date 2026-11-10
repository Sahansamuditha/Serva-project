import React from 'react';

// Helper to generate a smooth cubic bezier SVG path from coordinate points
function getSplinePath(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

export default function SplineAreaChart({
  data = [],
  dataKey = 'value',
  labelKey = 'month',
  secondaryKey = null,
  height = 200,
  strokeColor = '#7a1521',
  fillGradientStart = 'rgba(122, 21, 33, 0.16)',
  fillGradientEnd = 'rgba(122, 21, 33, 0.01)',
  maxY = 80,
  yTicks = [0, 20, 40, 60, 80]
}) {
  const width = 500;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const points = data.map((d, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
    const val = d[dataKey] || 0;
    const y = paddingTop + chartHeight - (val / maxY) * chartHeight;
    return { x, y, val, label: d[labelKey] };
  });

  const linePath = getSplinePath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Optional secondary line
  let secondaryPoints = [];
  let secondaryLinePath = '';
  if (secondaryKey) {
    secondaryPoints = data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1 || 1)) * chartWidth;
      const val = d[secondaryKey] || 0;
      const y = paddingTop + chartHeight - (val / maxY) * chartHeight;
      return { x, y, val };
    });
    secondaryLinePath = getSplinePath(secondaryPoints);
  }

  const gradId = `spline-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fillGradientStart} />
            <stop offset="100%" stopColor={fillGradientEnd} />
          </linearGradient>
        </defs>

        {/* Y Axis Grid Lines & Labels */}
        {yTicks.map((tick) => {
          const y = paddingTop + chartHeight - (tick / maxY) * chartHeight;
          return (
            <g key={tick}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="#f1f5f9"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                fontSize="10"
                fill="#94a3b8"
                textAnchor="end"
                fontFamily="Inter"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Gradient Area Fill */}
        {areaPath && <path d={areaPath} fill={`url(#${gradId})`} />}

        {/* Secondary Spline Path */}
        {secondaryLinePath && (
          <path
            d={secondaryLinePath}
            fill="none"
            stroke="#991b1b"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        )}

        {/* Primary Spline Path */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Data Point Dots */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r="3.5"
            fill="#ffffff"
            stroke={strokeColor}
            strokeWidth="2"
          />
        ))}

        {secondaryPoints.map((p, idx) => (
          <circle
            key={`sec-${idx}`}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill="#ffffff"
            stroke="#991b1b"
            strokeWidth="1.5"
          />
        ))}

        {/* X Axis Labels */}
        {points.map((p, idx) => (
          <text
            key={idx}
            x={p.x}
            y={height - 8}
            fontSize="10"
            fill="#64748b"
            textAnchor="middle"
            fontFamily="Inter"
          >
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}
