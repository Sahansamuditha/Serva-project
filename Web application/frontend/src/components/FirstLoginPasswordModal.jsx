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
import { triggerLogout, getAuthToken } from '../utils/auth';

export default function FirstLoginPasswordModal({ user, onSuccess }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [updatedUserData, setUpdatedUserData] = useState(null);

  const isMinLength = newPassword.length >= 6;
  const isMatching = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/auth/first-login-change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          userId: user?.id,
          newPassword: newPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to update password. Please try again.');
        setSubmitting(false);
        return;
      }

      setUpdatedUserData(data.user || { ...user, mustChangePassword: false });
      setIsSuccess(true);
    } catch (err) {
      console.error('Password change request failed:', err);
      setError(err.message || 'Network error while updating password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContinue = () => {
    if (onSuccess) {
      onSuccess(updatedUserData || { ...user, mustChangePassword: false });
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* State 1: Password Change Form */}
        {!isSuccess ? (
          <>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#58000f] to-[#7a1521] text-white px-6 py-5 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 p-2 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                <KeyRound className="w-5 h-5 text-amber-300" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Change Initial Password
                  </h3>
                  <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    First Login
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-1">
                  Welcome, <span className="font-semibold text-white">{user?.firstName || user?.name || 'User'}</span>! Please set your new personal password to activate your account.
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  For institutional security, initial passwords created by the administrator must be changed before accessing the Serva platform.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* New Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min. 6 characters)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 focus:outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-1 pt-1 text-[11px] text-slate-500">
                <div className={`flex items-center gap-1.5 ${isMinLength ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <Check className={`w-3.5 h-3.5 ${isMinLength ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Must be at least 6 characters long</span>
                </div>
                <div className={`flex items-center gap-1.5 ${isMatching ? 'text-emerald-700 font-medium' : 'text-slate-500'}`}>
                  <Check className={`w-3.5 h-3.5 ${isMatching ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Both passwords match</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={triggerLogout}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                  title="Sign out from this session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>

                <button
                  type="submit"
                  disabled={submitting || !isMinLength || !isMatching}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#58000f] hover:bg-[#7a1521] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Updating...' : 'Change Password & Proceed'}</span>
                  {!submitting && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
          </>
        ) : (
          /* State 2: Success Popup Window (Topup Message) */
          <div className="p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-md animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Password Changed Successfully!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                Your password has been successfully updated. Your account is now secured and ready to use.
              </p>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 font-medium">
              You will use this new password for all future logins to Serva.
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleContinue}
                className="w-full py-3 text-xs font-bold text-white bg-[#58000f] hover:bg-[#7a1521] rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Continue to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
