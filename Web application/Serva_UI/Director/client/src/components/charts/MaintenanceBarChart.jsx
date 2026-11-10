import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalItem = payload.find(p => p.dataKey === 'total');
    const compItem = payload.find(p => p.dataKey === 'completed');
    const totalVal = totalItem ? totalItem.value : 0;
    const compVal = compItem ? compItem.value : 0;
    const fullLabel = payload[0]?.payload?.fullLabel || label;
    const rate = totalVal > 0 ? Math.round((compVal / totalVal) * 100) : 0;

    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '10px 12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        fontSize: '12px',
        minWidth: '140px'
      }}>
        <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>{fullLabel}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '3px' }}>
          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#7a1521' }} />
            Total Requests:
          </span>
          <b style={{ color: '#1e293b' }}>{totalVal}</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981' }} />
            Completed:
          </span>
          <b style={{ color: '#10b981' }}>{compVal}</b>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '4px', marginTop: '4px', fontSize: '11px', color: '#64748b' }}>
          Completion Rate: <b style={{ color: '#7a1521' }}>{rate}%</b>
        </div>
      </div>
    );
  }
  return null;
};

export default function MaintenanceBarChart({
  data = [],
  height = 200,
  barSize = 14
}) {
  const maxVal = Math.max(
    ...data.map(d => Math.max(Number(d.total || 0), Number(d.completed || 0))),
    5
  );
  const domainMax = Math.ceil(maxVal * 1.25);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: '#e2e8f0' }}
            tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            domain={[0, domainMax]}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="total"
            name="Total Requests"
            fill="#7a1521"
            radius={[4, 4, 0, 0]}
            maxBarSize={barSize}
          />
          <Bar
            dataKey="completed"
            name="Completed"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
            maxBarSize={barSize}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Sleek Legend at bottom */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        marginTop: '-12px',
        fontSize: '12px',
        color: '#475569',
        fontWeight: 500
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: '#7a1521' }} />
          <span>Total Requests</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', backgroundColor: '#10b981' }} />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}
