import React from 'react';

export default function HorizontalBarChart({
  data = [
    { building: 'Computer Center', count: 28 },
    { building: 'Science Building', count: 24 },
    { building: 'Library', count: 18 },
    { building: 'Engineering Building', count: 16 },
    { building: 'Admin Building', count: 12 },
    { building: 'Academic Building', count: 10 },
    { building: 'Other', count: 20 }
  ],
  maxCount = 30
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {data.map((item, idx) => {
        const percent = Math.min(100, Math.round((item.count / maxCount) * 100));
        return (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '12px',
                color: '#334155',
                width: '130px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={item.building}
            >
              {item.building}
            </span>

            {/* Bar Track */}
            <div
              style={{
                flex: 1,
                height: '8px',
                backgroundColor: '#f1f5f9',
                borderRadius: '9999px',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${percent}%`,
                  backgroundColor: '#7a1521',
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>

            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e293b',
                width: '24px',
                textAlign: 'right'
              }}
            >
              {item.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}
