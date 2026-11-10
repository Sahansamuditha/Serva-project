import React, { useEffect } from 'react';
import { CheckCircle2, Check, X } from 'lucide-react';

export default function SuccessModal({
  isOpen,
  onClose,
  title = 'Successfully Completed!',
  message = '',
  subMessage = '',
  actionText = 'OK'
}) {
  // ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all duration-300 p-6 my-auto select-none border border-emerald-300 ring-4 ring-emerald-50/80 animate-in fade-in zoom-in-95">
        {/* Top Close Button */}
        <div className="flex justify-end -mt-1 -mr-1 mb-1">
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-center py-1">
          {/* Green Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100/90 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto mb-3.5 shadow-sm shadow-emerald-200/50">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>

          {/* Title */}
          <h3 className="text-xl font-black text-slate-900 mb-1.5 font-['Outfit']">
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 mb-4 px-2 leading-relaxed">
            {message}
          </p>

          {/* Green Notification Alert Box */}
          {subMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-800 font-semibold shadow-2xs mb-4">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{subMessage}</span>
            </div>
          )}

          {/* OK / Done Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{actionText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
