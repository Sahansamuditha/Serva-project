import React, { useEffect } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function AlertModal({
  isOpen,
  onClose,
  title = 'Notice',
  message = '',
  type = 'error', // 'error' | 'warning' | 'info' | 'success'
  actionText = 'OK'
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isError = type === 'error' || type === 'danger';
  const isWarning = type === 'warning';
  const isSuccess = type === 'success';

  return (
    <div
      className="modal-overlay !z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all duration-300 p-6 my-auto select-none border animate-in fade-in zoom-in-95 ${
          isError
            ? 'border-rose-200 ring-4 ring-rose-50/80'
            : isWarning
            ? 'border-amber-200 ring-4 ring-amber-50/80'
            : isSuccess
            ? 'border-emerald-200 ring-4 ring-emerald-50/80'
            : 'border-slate-200 ring-4 ring-slate-100'
        }`}
      >
        {/* Top Close Button */}
        <div className="flex justify-end -mt-1 -mr-1 mb-1">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-1">
          {/* Centered Icon Badge */}
          <div
            className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto mb-3.5 shadow-sm ${
              isError
                ? 'bg-rose-50/90 border-rose-200 text-rose-600 shadow-rose-200/50'
                : isWarning
                ? 'bg-amber-50/90 border-amber-200 text-amber-600 shadow-amber-200/50'
                : isSuccess
                ? 'bg-emerald-50/90 border-emerald-200 text-emerald-600 shadow-emerald-200/50'
                : 'bg-blue-50/90 border-blue-200 text-blue-600 shadow-blue-200/50'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-8 h-8 text-rose-600" />
            ) : isWarning ? (
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            ) : isSuccess ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            ) : (
              <Info className="w-8 h-8 text-blue-600" />
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-slate-900 mb-2 font-['Outfit']">
            {title}
          </h3>

          {/* Message Box in Center */}
          <div
            className={`p-3.5 rounded-xl border text-xs leading-relaxed font-semibold mb-5 text-center ${
              isError
                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                : isWarning
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : isSuccess
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            {message}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 px-4 font-bold text-xs rounded-xl transition shadow-md cursor-pointer ${
              isError
                ? 'bg-[#7a1521] hover:bg-[#58000f] text-white shadow-[#7a1521]/20'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20'
            }`}
          >
            {actionText}
          </button>
        </div>
      </div>
    </div>
  );
}
