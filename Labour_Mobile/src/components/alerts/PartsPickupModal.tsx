import React, { useState } from 'react';
import { AlertNotice } from '../../types';
import { initiateCall } from '../../services/callService';

interface PartsPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertNotice | null;
  onAcknowledge: (id: string) => void;
}

export const PartsPickupModal: React.FC<PartsPickupModalProps> = ({
  isOpen,
  onClose,
  alert,
  onAcknowledge,
}) => {
  const [copiedToken, setCopiedToken] = useState(false);

  if (!isOpen || !alert) return null;

  const token = alert.pickupToken || '#PK-4091';

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleConfirmPickup = () => {
    onAcknowledge(alert.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md max-h-[90vh] bg-[#fcf8f8] rounded-3xl shadow-2xl border border-[#debfbf] flex flex-col overflow-hidden text-[#241919] animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-[#18181b] text-white p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">inventory_2</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Maintenance Store Gatepass
              </span>
              <h3 className="text-base font-bold leading-snug">{alert.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center gap-3 text-center">
          {/* Barcode / Token Visual */}
          <div className="w-full bg-white border-2 border-dashed border-[#debfbf] rounded-2xl p-4 flex flex-col items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#8a7170]">Authorized Pickup Voucher</span>
            <div className="text-2xl font-mono font-bold tracking-widest text-[#7a1521] bg-[#fff0ef] px-4 py-2 rounded-xl">
              {token}
            </div>
            {/* Synthetic Barcode Lines */}
            <div className="flex items-center gap-1 h-10 py-1">
              {[4, 2, 6, 2, 3, 5, 2, 4, 2, 6, 3, 2, 4, 5, 2, 3, 6, 2].map((w, i) => (
                <div key={i} className="h-full bg-[#241919]" style={{ width: `${w * 1.5}px` }} />
              ))}
            </div>
            <button
              type="button"
              onClick={handleCopyToken}
              className="text-xs text-[#7a1521] hover:underline font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              <span>{copiedToken ? 'Token Copied!' : 'Copy Pickup Code'}</span>
            </button>
          </div>

          <div className="w-full text-left bg-[#fff0ef] rounded-xl p-3 border border-[#ffe9e8] text-xs flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#241919]">Pickup Counter:</span>
              <span className="font-bold text-[#7a1521]">HazMat Bay 1 Store Desk</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#241919]">Reserved Items:</span>
              <span className="text-[#574141]">2x Filter Mesh (OEM-F40)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#241919]">Storekeeper:</span>
              <span className="text-[#574141]">Mr. Sunil Wijeratne</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-[#ffe9e8] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => initiateCall('HazMat Bay 1 Store Counter', '+94 77 149 0016', 'Parts Warehouse')}
            className="px-3 py-2 rounded-xl bg-[#fff0ef] text-[#7a1521] font-bold text-xs flex items-center gap-1.5 border border-[#debfbf]/50"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Call Store Desk</span>
          </button>
          <button
            type="button"
            onClick={handleConfirmPickup}
            className="px-4 py-2 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            <span>Confirm & Complete Pickup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
