import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', onClick }) {
  const colorSchemes = {
    blue: {
      bg: '#2563eb',
      lightBg: '#eff6ff',
      textColor: '#1e40af'
    },
    amber: {
      bg: '#f59e0b',
      lightBg: '#fffbeb',
      textColor: '#b45309'
    },
    orange: {
      bg: '#ea580c',
      lightBg: '#fff7ed',
      textColor: '#c2410c'
    },
    green: {
      bg: '#10b981',
      lightBg: '#ecfdf5',
      textColor: '#047857'
    },
    red: {
      bg: '#ef4444',
      lightBg: '#fef2f2',
      textColor: '#b91c1c'
    },
    purple: {
      bg: '#8b5cf6',
      lightBg: '#f5f3ff',
      textColor: '#6d28d9'
    },
    teal: {
      bg: '#0d9488',
      lightBg: '#f0fdfa',
      textColor: '#0f766e'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div 
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        padding: '16px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-card)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        minWidth: 0,
        gap: '10px'
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-card)';
        }
      }}
    >
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 500, 
          color: '#64748b', 
          marginBottom: '5px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {title}
        </div>
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>
          {value}
        </div>
      </div>

      {Icon && (
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '10px',
          backgroundColor: scheme.bg,
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
