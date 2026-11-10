import React, { useState } from 'react';
import {
  KeyRound,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  LogOut,
  Check
} from 'lucide-react';

export interface FirstLoginPasswordModalProps {
  isOpen: boolean;
  user: {
    id?: number | string;
    email?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    role?: string;
    designation?: string;
    department?: string;
  } | null;
  devicePreset?: 'universal' | 'android' | 'ios';
  onSuccess: (updatedUser: any) => void;
  onSignOut: () => void;
}

export const FirstLoginPasswordModal: React.FC<FirstLoginPasswordModalProps> = ({
  isOpen,
  user,
  onSuccess,
  onSignOut,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState<any>(null);

  if (!isOpen) return null;

  const displayName = user?.firstName || user?.name || 'Supervisor';
  const roleName = user?.designation || user?.role || 'Supervisor';
  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;

  // Simple password strength calculation
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, text: 'Required', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, text: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, text: 'Good', color: 'bg-blue-500' };
    return { score: 4, text: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Please enter your new personal password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your confirmation.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        userId: user?.id,
        email: user?.email,
        newPassword: newPassword,
      };

      let res: Response | null = null;
      let data: any = null;

      // 1. Attempt via standard relative proxy route
      try {
        const response = await fetch('/api/auth/first-login-change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          res = response;
          data = await response.json();
        } else {
          throw new Error(`Non-JSON response (status ${response.status})`);
        }
      } catch (proxyErr) {
        console.warn('Relative change-password failed, trying direct backend...', proxyErr);
        const host = window.location.hostname || 'localhost';
        const directResponse = await fetch(`http://${host}:5000/api/auth/first-login-change-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        res = directResponse;
        data = await directResponse.json();
      }

      if (!res || !res.ok || !data?.success) {
        setError(data?.message || 'Failed to update password. Please try again.');
        setSubmitting(false);
        return;
      }

      const updated = data.user || {
        ...user,
        mustChangePassword: false,
        must_change_password: 0,
      };

      try {
        const existing = localStorage.getItem('serva_mobile_user');
        const parsed = existing ? JSON.parse(existing) : {};
        localStorage.setItem(
          'serva_mobile_user',
          JSON.stringify({ ...parsed, ...updated, mustChangePassword: false, must_change_password: 0 })
        );
      } catch (err) { }

      setUpdatedUserData(updated);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err?.message || 'Network error while updating password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    onSuccess(updatedUserData || { ...user, mustChangePassword: false });
  };

  return (
    <div className="w-full h-full min-h-full flex flex-col bg-[#58000f] text-[#1e293b] select-none overflow-y-auto no-scrollbar">
      {/* 1. Mobile Status Bar (09:41) */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-white select-none z-30 shrink-0">
        <span className="font-bold tracking-tight text-[13px]">09:41</span>
        <div className="flex items-center gap-1.5 text-white/90">
          <span className="material-symbols-outlined text-[15px]">wifi</span>
          <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-[18px]">battery_full</span>
        </div>
      </div>

      {!isSuccess ? (
        <>
          {/* 2. Top Maroon Hero Header */}
          <div className="relative px-6 pt-2 pb-10 bg-gradient-to-b from-[#58000f] via-[#7a1521] to-[#58000f] overflow-hidden shrink-0">
            {/* Subtle dot pattern texture */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
                backgroundSize: '14px 14px',
              }}
            />

            {/* Header Brand Line */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-black tracking-tight text-white leading-none">
                  Serva
                </span>
                <span className="bg-[#eab308] text-[#1e293b] text-[10px] font-black px-1.5 py-0.5 rounded font-mono tracking-wider leading-none shadow-xs">
                  ITUM
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white px-2 py-0.5 rounded-full border border-white/20">
                First Login Setup
              </span>
            </div>

            {/* Title & Personalized Greeting */}
            <div className="relative z-10 mt-3">
              <h1 className="text-[20px] font-black text-white tracking-tight leading-tight flex items-center gap-2">
                <span>Change Initial Password</span>
              </h1>
              <p className="text-white/80 text-xs font-semibold leading-tight mt-1 truncate">
                Welcome, <span className="text-[#eab308] font-bold">{displayName}</span> ({roleName})
              </p>
              <p className="text-white/60 text-[10.5px] mt-0.5">
                Institute of Technology, University of Moratuwa
              </p>
            </div>
          </div>

          {/* 3. Central Icon Badge overlapping boundary */}
          <div className="relative z-20 flex justify-center -mb-6">
            <div className="w-13 h-13 rounded-2xl bg-[#7a1521] p-1 shadow-xl border-2 border-white flex items-center justify-center text-[#eab308] ring-1 ring-black/5">
              <KeyRound className="w-6 h-6 stroke-[2.5]" />
            </div>
          </div>

          {/* 4. Main White Card Viewport */}
          <div className="relative z-10 flex-1 bg-white rounded-t-[32px] pt-8 pb-6 px-5 sm:px-6 shadow-2xl flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Mandatory Notice Banner */}
              <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-start gap-2 text-xs text-amber-950">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-snug text-[11px]">
                  <strong>Security Requirement:</strong> Please replace the default administrator password with your own private password to activate your account.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-semibold text-[11.5px]">{error}</span>
                </div>
              )}

              {/* New Password Input */}
              <div>
                <label className="block text-xs font-bold text-[#1e293b] mb-1">
                  New Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 focus-within:border-[#7a1521] focus-within:ring-2 focus-within:ring-[#7a1521]/15 transition-all">
                  <Lock className="w-4 h-4 text-[#94a3b8] mr-2 shrink-0" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    autoComplete="new-password"
                    className="w-full bg-transparent text-xs font-semibold text-[#1e293b] placeholder:text-[#94a3b8] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[#94a3b8] hover:text-[#1e293b] transition-colors p-0.5"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Live Strength Meter Bar */}
                {newPassword.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 h-full rounded-full transition-colors ${
                            step <= strength.score ? strength.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {strength.text}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm New Password Input */}
              <div>
                <label className="block text-xs font-bold text-[#1e293b] mb-1">
                  Confirm New Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative flex items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3 py-2.5 focus-within:border-[#7a1521] focus-within:ring-2 focus-within:ring-[#7a1521]/15 transition-all">
                  <Lock className="w-4 h-4 text-[#94a3b8] mr-2 shrink-0" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    className="w-full bg-transparent text-xs font-semibold text-[#1e293b] placeholder:text-[#94a3b8] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#94a3b8] hover:text-[#1e293b] transition-colors p-0.5"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="p-2.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-1 text-[11px]">
                <div
                  className={`flex items-center gap-1.5 font-medium ${
                    isMinLength ? 'text-emerald-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      isMinLength ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>At least 6 characters long</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 font-medium ${
                    isMatching ? 'text-emerald-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                      isMatching ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>Both passwords match</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={onSignOut}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  title="Sign out from session"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-500" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting || !isMinLength || !isMatching}
                  className="flex-1 py-3 px-4 bg-[#7a1521] hover:bg-[#58000f] active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#7a1521]/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Updating...' : 'Set Password & Proceed'}</span>
                  {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>

            {/* Bottom Copyright & Campus Branding */}
            <div className="mt-4 pt-2 text-center border-t border-[#f1f5f9]">
              <p className="text-[10px] text-[#94a3b8]">
                © 2026 ITUM Serva Maintenance Platform
              </p>
            </div>
          </div>
        </>
      ) : (
        /* Success Screen inside Phone Viewport */
        <div className="flex-1 bg-white rounded-t-[32px] p-6 text-center flex flex-col justify-between animate-in zoom-in-95 duration-200 mt-8">
          <div className="space-y-4 my-auto">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20 border-2 border-emerald-200">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                Password Changed!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Your supervisor account is now secured with your personal password.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs text-emerald-800 font-semibold text-left flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-snug text-[11px]">
                You will use this new password for all future logins to the Serva mobile portal.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full py-3.5 px-4 bg-[#7a1521] hover:bg-[#58000f] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#7a1521]/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Continue to Supervisor Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
