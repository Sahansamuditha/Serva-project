import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Lock } from 'lucide-react';

export interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string | null;
  success?: string | null;
  helperText?: string;
  showStrengthMeter?: boolean;
  required?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder = 'Enter password...',
  error,
  success,
  helperText,
  showStrengthMeter = false,
  required = true,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  // Toggle password visibility handler with event cancellation to prevent blur / submit
  const toggleVisibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPassword((prev) => !prev);
  };

  // Calculate password strength score (0 to 4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strengthScore = showStrengthMeter ? getPasswordStrength(value) : 0;
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-600'];

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5 text-[#7a1521]" />
          {label}
          {required && <span className="text-[#7a1521]">*</span>}
        </label>
        {showStrengthMeter && value.length > 0 && (
          <span className="text-[11px] font-semibold text-[#64748B]">
            Strength: <span className={strengthScore >= 3 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
              {strengthLabels[strengthScore]}
            </span>
          </span>
        )}
      </div>

      <div className="relative flex items-center w-full">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={id.includes('current') ? 'current-password' : 'new-password'}
          className={`w-full h-11 pl-3.5 pr-20 text-sm font-medium text-[#0F172A] bg-white border rounded-xl transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
            error
              ? 'border-rose-500 ring-rose-100 focus:ring-rose-500/30'
              : success
              ? 'border-emerald-500 ring-emerald-100 focus:ring-emerald-500/30'
              : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#7a1521] focus:ring-[#7a1521]/20'
          }`}
        />

        {/* Interactive Hide / Unhide Toggle Button */}
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={toggleVisibility}
          className={`absolute right-2 px-2 py-1 flex items-center gap-1 text-xs font-semibold rounded-lg transition-all z-10 cursor-pointer ${
            showPassword
              ? 'bg-[#7a1521]/10 text-[#7a1521] border border-[#7a1521]/30 shadow-2xs'
              : 'text-[#64748B] hover:text-[#7a1521] hover:bg-slate-100'
          }`}
          title={showPassword ? 'Hide password characters' : 'Show password characters'}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-tight">Hide</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[10px] uppercase font-bold tracking-tight">Show</span>
            </>
          )}
        </button>
      </div>

      {/* Strength Bar */}
      {showStrengthMeter && value.length > 0 && (
        <div className="flex gap-1 h-1.5 w-full mt-0.5 rounded-full overflow-hidden bg-slate-100 p-0.5">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex-1 rounded-full transition-all duration-300 ${
                step <= strengthScore ? strengthColors[strengthScore] : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      )}

      {/* Validation / Helper Messages */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-0.5 animate-in fade-in duration-150">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!error && success && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium mt-0.5 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {!error && !success && helperText && (
        <p className="text-[11px] text-[#64748B] mt-0.5">{helperText}</p>
      )}
    </div>
  );
};
