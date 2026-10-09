import React from 'react';
import { AlertNotice } from '../../types';
import { initiateCall } from '../../services/callService';

interface SafetyAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertNotice | null;
  onAcknowledge: (id: string) => void;
}

export const SafetyAdvisoryModal: React.FC<SafetyAdvisoryModalProps> = ({
  isOpen,
  onClose,
  alert,
  onAcknowledge,
}) => {
  if (!isOpen || !alert) return null;

  const handleComply = () => {
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
        <div className="bg-[#7a1521] text-white p-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">electric_bolt</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-red-200 tracking-wider">
                Safety Protocol Directive
              </span>
              <h3 className="text-base font-bold leading-snug">{alert.title}</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900 text-xs">
            <span className="font-bold block mb-1">⚠️ High-Voltage Hazard (Substation B - Sector 4)</span>
            {alert.description}
          </div>

          <h4 className="text-xs font-bold text-[#241919] uppercase tracking-wide">
            Mandatory Personal Protective Equipment (PPE)
          </h4>
          <div className="space-y-2 text-xs">
            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#debfbf]/60 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-[#7a1521]" />
              <span>Class 2 Electrical Insulating Rubber Gloves (Tested 17,000V)</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#debfbf]/60 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-[#7a1521]" />
              <span>Full Face Arc-Flash Protection Shield (Cal/cm² rating 12+)</span>
            </label>
            <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-[#debfbf]/60 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded accent-[#7a1521]" />
              <span>Flame-Resistant (FR) Cotton Coveralls & Dielectric Work Boots</span>
            </label>
          </div>

          <div className="bg-[#fff0ef] rounded-xl p-3 border border-[#ffe9e8] text-xs text-[#574141]">
            <span className="font-bold text-[#7a1521] block">Safety Officer Clearance:</span>
            Substation access requires dual-technician buddy system verification with Campus Security Dispatch.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-[#ffe9e8] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => initiateCall('Substation B Safety Officer', '+94 77 149 0016', 'Electrical Security')}
            className="px-3 py-2 rounded-xl bg-[#fff0ef] text-[#7a1521] font-bold text-xs flex items-center gap-1.5 border border-[#debfbf]/50"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Call Safety Officer</span>
          </button>
          <button
            type="button"
            onClick={handleComply}
            className="px-4 py-2 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Acknowledge & Comply</span>
          </button>
        </div>
      </div>
    </div>
  );
};
