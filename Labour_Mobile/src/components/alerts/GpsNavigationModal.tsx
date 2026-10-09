import React, { useState } from 'react';
import { AlertNotice } from '../../types';
import { initiateCall } from '../../services/callService';

interface GpsNavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AlertNotice | null;
  onArrivedAtJob?: (reqNumber?: string) => void;
}

export const GpsNavigationModal: React.FC<GpsNavigationModalProps> = ({
  isOpen,
  onClose,
  alert,
  onArrivedAtJob,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen || !alert) return null;

  const targetLocation = alert.location || 'Chemical & Process Engineering Building • Floor 1';
  const associatedReq = alert.reqNumber || 'REQ-8279';

  const steps = [
    {
      title: 'Exit Maintenance Base Bay 3',
      instruction: 'Head North towards Central Campus Walkway through Gate B.',
      distance: '60m',
      icon: 'directions_walk',
    },
    {
      title: 'Cross Central Courtyard / Quad B',
      instruction: 'Pass behind Main Auditorium and turn Right towards Chemical Engineering Corridor.',
      distance: '140m',
      icon: 'turn_right',
    },
    {
      title: 'Enter Chemical Engineering Foyer',
      instruction: 'Enter via East Ground Entrance. Take Staircase B or Elevator to Level 1.',
      distance: '80m',
      icon: 'stairs',
    },
    {
      title: 'Arrive at Target Room (Room 102)',
      instruction: 'Proceed to Main Chemical Lab 102. Emergency Main Isolation Valve is located on the South Wall.',
      distance: '40m',
      icon: 'pin_drop',
    },
  ];

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleOpenJobTicket = () => {
    onClose();
    if (onArrivedAtJob) {
      onArrivedAtJob(associatedReq);
    }
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
        className="w-full max-w-md max-h-[92vh] bg-[#fcf8f8] rounded-3xl shadow-2xl border border-[#debfbf] flex flex-col overflow-hidden text-[#241919] animate-in zoom-in-95 duration-200"
      >
        {/* Navigation Top Header Bar */}
        <div className="bg-[#18181b] text-white p-4 relative overflow-hidden flex flex-col gap-2">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold tracking-wider text-emerald-400 uppercase">
                Active GPS Navigation
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm"
              title="Close Navigation"
            >
              ✕
            </button>
          </div>

          <div className="relative z-10 flex flex-col">
            <h2 className="text-base font-bold text-white leading-snug truncate">
              {alert.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 mt-0.5">
              <span className="material-symbols-outlined text-[15px] text-[#ffdad9]">near_me</span>
              <span className="truncate">{targetLocation}</span>
            </div>
          </div>

          {/* Quick Metrics Badge Strip */}
          <div className="grid grid-cols-3 gap-2 mt-1 relative z-10">
            <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">Est. Walk</span>
              <span className="text-sm font-bold text-white">3 mins</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">Distance</span>
              <span className="text-sm font-bold text-white">320 m</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 flex flex-col items-center">
              <span className="text-[10px] text-neutral-400 uppercase font-medium">Status</span>
              <span className="text-xs font-bold text-red-400">High Alert</span>
            </div>
          </div>
        </div>

        {/* Interactive Map Visualizer */}
        <div className="relative h-44 bg-[#0e1626] overflow-hidden border-b border-[#ffe9e8] flex items-center justify-center">
          {/* Simulated Campus Architectural Blueprint SVG */}
          <svg className="w-full h-full opacity-60" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Campus grid lines */}
            <pattern id="campus-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#253549" strokeWidth="0.5" />
            </pattern>
            <rect width="400" height="180" fill="url(#campus-grid)" />

            {/* Buildings Outlines */}
            <rect x="25" y="40" width="70" height="90" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <text x="60" y="85" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">BAY 3</text>
            <text x="60" y="96" fill="#64748b" fontSize="6" textAnchor="middle">Maintenance</text>

            <rect x="150" y="25" width="85" height="60" rx="6" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <text x="192" y="58" fill="#94a3b8" fontSize="8" fontWeight="bold" textAnchor="middle">MAIN AUDITORIUM</text>

            <rect x="290" y="45" width="85" height="95" rx="6" fill="#2d161d" stroke="#7a1521" strokeWidth="1.5" />
            <text x="332" y="88" fill="#ffdad9" fontSize="8" fontWeight="bold" textAnchor="middle">CHEM LAB 102</text>
            <text x="332" y="99" fill="#f87171" fontSize="6" textAnchor="middle">HAZARD SITE</text>

            {/* Pathway Route */}
            <path
              d="M 60 135 L 60 155 L 200 155 L 200 115 L 332 115 L 332 140"
              stroke="#ba1a1a"
              strokeWidth="4"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />
            {/* Animated Glowing Trail */}
            <path
              d="M 60 135 L 60 155 L 200 155 L 200 115 L 332 115 L 332 140"
              stroke="#fca5a5"
              strokeWidth="2"
              strokeLinecap="round"
              className="animate-pulse"
            />

            {/* Origin Pin */}
            <circle cx="60" cy="135" r="7" fill="#3b82f6" />
            <circle cx="60" cy="135" r="3" fill="#ffffff" />

            {/* Destination Hazard Beacon */}
            <circle cx="332" cy="140" r="10" fill="#ba1a1a" fillOpacity="0.4" className="animate-ping" />
            <circle cx="332" cy="140" r="7" fill="#dc2626" />
            <circle cx="332" cy="140" r="3" fill="#ffffff" />
          </svg>

          {/* Current Position Overlay Indicator */}
          <div className="absolute bottom-2 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white text-[10px] flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-blue-400">my_location</span>
            <span>Origin: Workshop Bay 3</span>
          </div>

          <div className="absolute top-2 right-3 bg-red-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-red-500/40 text-red-200 text-[10px] flex items-center gap-1.5 shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-red-400">fmd_bad</span>
            <span>Target: Chemical Lab 102</span>
          </div>
        </div>

        {/* Turn-by-Turn Instruction Slider */}
        <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8a7170] uppercase tracking-wider">
              Route Guidance Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div className="flex items-center gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-6 bg-[#7a1521]'
                      : idx < currentStepIndex
                      ? 'w-2.5 bg-emerald-500'
                      : 'w-2.5 bg-[#debfbf]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Active Step Highlight Card */}
          <div className="bg-white rounded-2xl p-3.5 border-2 border-[#7a1521]/20 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fff0ef] text-[#7a1521] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                {steps[currentStepIndex].icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#241919]">
                  {steps[currentStepIndex].title}
                </h4>
                <span className="text-[11px] font-bold text-[#7a1521] bg-[#ffdad9] px-2 py-0.5 rounded-md">
                  {steps[currentStepIndex].distance}
                </span>
              </div>
              <p className="text-xs text-[#574141] mt-1 leading-relaxed">
                {steps[currentStepIndex].instruction}
              </p>
            </div>
          </div>

          {/* Stepper Controls */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePreviousStep}
              disabled={currentStepIndex === 0}
              className="px-3 py-1.5 rounded-xl border border-[#debfbf] text-xs font-bold text-[#574141] disabled:opacity-40 hover:bg-[#fff0ef] transition-colors"
            >
              Previous Step
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              disabled={currentStepIndex === steps.length - 1}
              className="px-3 py-1.5 rounded-xl bg-[#7a1521] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#58000f] transition-colors"
            >
              Next Waypoint →
            </button>
          </div>

          {/* Safety Precaution Tip */}
          <div className="bg-[#fff0ef] rounded-xl p-2.5 border border-[#ffe9e8] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7a1521] text-[18px] shrink-0">
              security
            </span>
            <span className="text-[11px] text-[#574141] leading-tight">
              Standard protocol: Ensure rubber water boots are worn before entering Lab 102 floor basin.
            </span>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-3 bg-white border-t border-[#ffe9e8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* Direct Call On-Site Contact */}
          <button
            type="button"
            onClick={() => initiateCall(`Chemical Lab Tech: ${alert.title}`, '+94 77 149 0016', alert.location || 'Chemical Dept')}
            className="px-3 py-2 rounded-xl bg-[#fff0ef] hover:bg-[#ffe9e8] text-[#7a1521] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#debfbf]/50"
            title="Call Site Technician (+94 77 149 0016)"
          >
            <span className="material-symbols-outlined text-[16px]">call</span>
            <span>Call Lab Tech (+94 77 149 0016)</span>
          </button>

          {/* Arrived Action */}
          <button
            type="button"
            onClick={handleOpenJobTicket}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>Arrived • Open Work Order</span>
          </button>
        </div>
      </div>
    </div>
  );
};
