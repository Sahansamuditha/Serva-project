import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, CheckCircle2, AlertCircle, Check } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete User Confirmation',
  itemName = '',
  message = '',
  confirmText = 'Delete User',
  cancelText = 'Cancel',
}) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && status !== 'loading') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, status]);

  const handleClose = () => {
    if (status === 'loading') return;
    onClose();
  };

  const handleAction = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await onConfirm();
      if (res && res.success === false) {
        setStatus('error');
        setErrorMessage(res.message || 'Failed to remove user account.');
      } else {
        setStatus('success');
      }
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred during deletion.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && status !== 'loading') handleClose();
      }}
    >
      <div
        className={`bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all duration-300 p-6 my-auto select-none border ${
          status === 'success'
            ? 'border-emerald-300 ring-4 ring-emerald-50/80 animate-in fade-in zoom-in-95'
            : status === 'error'
            ? 'border-rose-300 ring-4 ring-rose-50/80 animate-in fade-in zoom-in-95'
            : 'border-slate-200 animate-in fade-in zoom-in-95'
        }`}
      >
        {/* ============================================================
            1. SUCCESS STATE (Turned Green with Notification)
        ============================================================ */}
        {status === 'success' ? (
          <div className="text-center py-2 animate-in fade-in zoom-in-95 duration-200">
            {/* Green Icon */}
            <div className="w-16 h-16 rounded-full bg-emerald-100/90 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-emerald-200/50">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            </div>

            {/* Success Title */}
            <h3 className="text-xl font-black text-slate-900 mb-1.5 font-['Outfit']">
              Successfully Removed!
            </h3>

            {/* Success Description */}
            <p className="text-xs text-slate-600 mb-4 px-2 leading-relaxed">
              <strong className="text-slate-900 font-bold">{itemName || 'User'}</strong> has been successfully deleted and removed from the system.
            </p>

            {/* Green Notification Alert Box */}
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-800 font-semibold shadow-2xs mb-5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>User record permanently erased and system updated.</span>
            </div>

            {/* Done Action Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : status === 'error' ? (
          /* ============================================================
             2. ERROR STATE (Inside Modal instead of browser alert)
          ============================================================ */
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                <AlertCircle className="w-6 h-6 text-rose-600" />
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
              Action Prevented
            </h3>

            {/* Error Callout */}
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 font-semibold mb-4">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage || "Cannot delete this user."}</span>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* ============================================================
             3. CONFIRMATION PROMPT (Red Alert)
          ============================================================ */
          <div>
            {/* Top Icon & Close */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-600 shrink-0 shadow-xs">
                <Trash2 className="w-6 h-6 text-rose-600" />
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={status === 'loading'}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Header */}
            <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
              {title}
            </h3>

            {/* Message */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {message ? (
                message
              ) : (
                <>
                  Are you sure you want to permanently DELETE and REMOVE{' '}
                  <strong className="text-slate-900 font-bold">{itemName}</strong> from the system?
                </>
              )}
            </p>

            {/* Warning Callout */}
            <div className="mt-3 p-3 bg-rose-50/90 border border-rose-200/80 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>This action cannot be undone.</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={status === 'loading'}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition disabled:opacity-50 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleAction}
                disabled={status === 'loading'}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs transition shadow-sm shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {status === 'loading' ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
