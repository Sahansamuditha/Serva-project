import React from 'react';
import { Smartphone, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface ToggleRowProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  badgeText?: string;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
  badgeText,
}) => {
  return (
    <div
      className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${
        checked
          ? 'bg-[#7a1521]/[0.03] border-[#7a1521]/20 shadow-xs'
          : 'bg-[#F8FAFC] border-[#E2E8F0]'
      } ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#7a1521]/40'}`}
    >
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            checked
              ? 'bg-[#7a1521] text-white shadow-sm'
              : 'bg-[#E2E8F0] text-[#64748B]'
          }`}
        >
          {icon || <Smartphone className="w-5 h-5" />}
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-[#1E293B]">
              {title}
            </span>
            {badgeText && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#047857] border border-[#a7f3d0]/50">
                <CheckCircle2 className="w-3 h-3" />
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-[#64748B] leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {/* Interactive Toggle Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7a1521] focus:ring-offset-2 ${
          checked ? 'bg-[#7a1521]' : 'bg-[#CBD5E1]'
        }`}
      >
        <span className="sr-only">Toggle {title}</span>
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
