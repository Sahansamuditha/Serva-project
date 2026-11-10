import React, { useEffect } from 'react';
import { CheckCircle2, Calendar, Clock, AlertCircle, X, Check, ArrowRight } from 'lucide-react';

export default function NotificationPopup({ 
  isOpen, 
  onClose, 
  type = 'success', // 'success' | 'warning' | 'info' | 'error'
  title = 'Notification',
  message = '',
  details = null,
  cancelText = 'Close',
  onCancel = null,
  confirmText = 'OK',
  onConfirm = null
}) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, onClose]);

  if (!isOpen) return null;

  const handleAction = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  const getTheme = () => {
    switch (type) {
      case 'warning':
        return {
          iconBg: '#fef3c7',
          iconColor: '#d97706',
          Icon: Calendar,
          accentGradient: 'linear-gradient(90deg, #d97706, #f59e0b)',
          badgeBg: '#fffbeb',
          badgeText: '#b45309',
          badgeLabel: 'ATTENTION',
          btnBg: '#7a1521'
        };
      case 'error':
        return {
          iconBg: '#fee2e2',
          iconColor: '#dc2626',
          Icon: AlertCircle,
          accentGradient: 'linear-gradient(90deg, #dc2626, #ef4444)',
          badgeBg: '#fef2f2',
          badgeText: '#991b1b',
          badgeLabel: 'ERROR',
          btnBg: '#dc2626'
        };
      case 'info':
        return {
          iconBg: '#dbeafe',
          iconColor: '#2563eb',
          Icon: Clock,
          accentGradient: 'linear-gradient(90deg, #2563eb, #3b82f6)',
          badgeBg: '#eff6ff',
          badgeText: '#1d4ed8',
          badgeLabel: 'INFORMATION',
          btnBg: '#2563eb'
        };
      case 'success':
      default:
        return {
          iconBg: '#dcfce7',
          iconColor: '#16a34a',
          Icon: CheckCircle2,
          accentGradient: 'linear-gradient(90deg, #10b981, #059669)',
          badgeBg: '#f0fdf4',
          badgeText: '#15803d',
          badgeLabel: 'SUCCESS',
          btnBg: '#7a1521'
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.Icon;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '20px',
        animation: 'popupOverlayFade 0.22s ease-out'
      }}
      onClick={handleCancel}
    >
      <style>{`
        @keyframes popupOverlayFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes popupCardPop {
          0% { opacity: 0; transform: scale(0.88) translateY(14px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes popupIconGlow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
      
      <div 
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
          animation: 'popupCardPop 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gradient Decorative Strip */}
        <div style={{
          height: '6px',
          background: theme.accentGradient,
          width: '100%'
        }} />

        {/* Close Button */}
        <button
          onClick={handleCancel}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '7px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.15s, color 0.15s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f1f5f9';
            e.currentTarget.style.color = '#334155';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#94a3b8';
          }}
          title="Close dialog"
        >
          <X size={18} />
        </button>

        <div style={{ padding: '32px 28px 28px', textAlign: 'center' }}>
          {/* Centered Glowing Icon */}
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: theme.iconBg,
            color: theme.iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: `0 0 0 8px ${theme.iconBg}60, 0 8px 20px -4px ${theme.iconColor}30`,
            animation: 'popupIconGlow 2.5s ease-in-out infinite'
          }}>
            <IconComponent size={34} strokeWidth={2.4} />
          </div>

          {/* Type Badge Chip */}
          <div style={{
            display: 'inline-block',
            backgroundColor: theme.badgeBg,
            color: theme.badgeText,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.6px',
            padding: '3px 10px',
            borderRadius: '12px',
            marginBottom: '10px',
            border: `1px solid ${theme.iconColor}25`
          }}>
            {theme.badgeLabel}
          </div>

          {/* Title */}
          <h2 style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 8px',
            letterSpacing: '-0.3px'
          }}>
            {title}
          </h2>

          {/* Message */}
          <p style={{
            fontSize: '14.5px',
            color: '#475569',
            lineHeight: 1.55,
            margin: '0 0 20px',
            wordBreak: 'break-word'
          }}>
            {message}
          </p>

          {/* Optional Details Key-Value Card */}
          {details && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {Object.entries(details).map(([key, val]) => (
                val ? (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', textTransform: 'capitalize', fontWeight: 500 }}>
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                    </span>
                    <strong style={{ color: '#0f172a', fontWeight: 600 }}>{String(val)}</strong>
                  </div>
                ) : null
              ))}
            </div>
          )}

          {/* Dual Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleCancel}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                padding: '11px 20px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
                e.currentTarget.style.color = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#475569';
              }}
            >
              {cancelText || 'Close'}
            </button>

            <button
              onClick={handleAction}
              style={{
                backgroundColor: theme.btnBg,
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '11px 28px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: '140px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s',
                boxShadow: '0 4px 14px rgba(122, 21, 33, 0.28)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.92';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            >
              <span>{confirmText}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
