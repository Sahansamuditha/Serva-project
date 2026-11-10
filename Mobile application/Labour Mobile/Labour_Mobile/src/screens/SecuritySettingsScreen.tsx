import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  KeyRound,
  Laptop,
  RotateCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  X,
  Smartphone,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Globe,
  Trash2,
  Monitor,
  Mail,
  AlertCircle
} from 'lucide-react';

export interface SessionData {
  id: string;
  deviceName: string;
  browser: string;
  location: string;
  ip?: string;
  lastActive: string;
  isCurrent: boolean;
  deviceType: 'laptop' | 'mobile' | 'desktop';
}

export interface SecuritySettingsScreenProps {
  onBack?: () => void;
  onNavigateTab?: (tab: string) => void;
  onNavigateSubscreen?: (subscreen: string) => void;
}

export const SecuritySettingsScreen: React.FC<SecuritySettingsScreenProps> = ({
  onBack,
}) => {
  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Section 1 State: 2FA Toggle
  const [isTwoFactorActive, setIsTwoFactorActive] = useState<boolean>(true);

  // Section 2 State: Password Form Values & Independent Show/Hide States
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

  const [passwordErrors, setPasswordErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Forgot Password Confirmation Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ type: '' | 'success' | 'error'; message: string }>({
    type: '',
    message: ''
  });

  const handleOpenForgotModal = () => {
    try {
      const stored = localStorage.getItem('serva_mobile_user');
      const user = stored ? JSON.parse(stored) : null;
      setForgotEmail(user?.email || '');
    } catch (e) {
      setForgotEmail('');
    }
    setForgotStatus({ type: '', message: '' });
    setShowForgotModal(true);
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToSend = forgotEmail.trim().toLowerCase();
    if (!emailToSend) {
      setForgotStatus({
        type: 'error',
        message: 'Please enter your registered institutional email address.'
      });
      return;
    }

    setForgotLoading(true);
    setForgotStatus({ type: '', message: '' });

    try {
      let res: Response | null = null;
      let data: any = null;

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToSend })
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          res = response;
          data = await response.json();
        } else {
          throw new Error(`Non-JSON response (status ${response.status})`);
        }
      } catch (proxyErr) {
        console.warn('Relative /api/auth/forgot-password failed, trying direct backend...', proxyErr);
        const host = window.location.hostname || 'localhost';
        const directResponse = await fetch(`http://${host}:5000/api/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailToSend })
        });
        res = directResponse;
        data = await directResponse.json();
      }

      if (res && res.ok && data?.success) {
        setForgotStatus({
          type: 'success',
          message: data.message || `A password reset link has been dispatched to ${emailToSend}.`
        });
      } else {
        setForgotStatus({
          type: 'error',
          message: data?.message || 'Unable to process password reset request. Please check your email or contact support.'
        });
      }
    } catch (err: any) {
      console.error('Forgot password error:', err);
      setForgotStatus({
        type: 'error',
        message: 'Failed to connect to authentication server. Please check your network and try again.'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  // Password Strength Score (0 - 4)
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const newPasswordStrength = getPasswordStrength(newPassword);
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-600'];

  // Section 3 State: Active Sessions Mock Data
  const [sessions, setSessions] = useState<SessionData[]>([
    {
      id: 'session-1',
      deviceName: 'Apple MacBook Pro 16"',
      browser: 'Chrome 124 • Current Device',
      location: 'Colombo, Sri Lanka',
      ip: '192.248.64.12',
      lastActive: 'Active Now',
      isCurrent: true,
      deviceType: 'laptop',
    },
    {
      id: 'session-2',
      deviceName: 'Apple iPhone 14 Pro',
      browser: 'Mobile Safari',
      location: 'Homagama, Sri Lanka',
      lastActive: 'Last active 2h ago',
      isCurrent: false,
      deviceType: 'mobile',
    },
    {
      id: 'session-3',
      deviceName: 'Windows PC • ITUM Admin Lab',
      browser: 'Firefox 125',
      location: 'Diyagama Campus, Sri Lanka',
      lastActive: 'Yesterday',
      isCurrent: false,
      deviceType: 'desktop',
    },
  ]);

  // Handlers
  const handleToggle2FA = () => {
    const nextState = !isTwoFactorActive;
    setIsTwoFactorActive(nextState);
    showToast(
      nextState
        ? 'Two-Factor Authentication is now ENABLED.'
        : 'Two-Factor Authentication has been DISABLED.',
      nextState ? 'success' : 'warning'
    );
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { current?: string; new?: string; confirm?: string } = {};

    if (!currentPassword) {
      errors.current = 'Current password is required.';
    }

    if (!newPassword) {
      errors.new = 'New password is required.';
    } else if (newPassword.length < 8) {
      errors.new = 'New password must be at least 8 characters long.';
    } else if (newPassword === currentPassword) {
      errors.new = 'New password must be different from current password.';
    }

    if (!confirmPassword) {
      errors.confirm = 'Please confirm your new password.';
    } else if (confirmPassword !== newPassword) {
      errors.confirm = 'Passwords do not match.';
    }

    setPasswordErrors(errors);

    if (Object.keys(errors).length === 0) {
      setIsUpdatingPassword(true);
      (async () => {
        try {
          const storedUser = localStorage.getItem('serva_mobile_user');
          const parsedUser = storedUser ? JSON.parse(storedUser) : null;
          const res = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: parsedUser?.id,
              email: parsedUser?.email,
              currentPassword,
              newPassword
            })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
            showToast('Password updated successfully in database! Account secured.', 'success');
          } else {
            showToast(data.message || 'Failed to update password in database.', 'warning');
          }
        } catch (e: any) {
          showToast('Failed to update password: ' + (e?.message || ''), 'warning');
        } finally {
          setIsUpdatingPassword(false);
        }
      })();
    }
  };

  const handleRevokeSession = (sessionId: string) => {
    const targetSession = sessions.find((s) => s.id === sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    showToast(`Revoked session for ${targetSession?.deviceName || 'device'}.`, 'info');
  };

  const handleLogOutAll = () => {
    if (window.confirm('Are you sure you want to sign out of all other active devices?')) {
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      showToast('Signed out of all other devices successfully.', 'warning');
    }
  };

  return (
    <div className="space-y-4 pt-2 pb-24 max-w-md mx-auto text-[#0F172A] font-sans selection:bg-[#7a1521] selection:text-white animate-in fade-in duration-150">
      
      {/* Top Header Navigation with Back Button */}
      <div className="flex items-center justify-between bg-white rounded-2xl p-3 shadow-xs border border-[#E2E8F0]">
        <button
          type="button"
          onClick={onBack ? onBack : () => window.history.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#7a1521]/10 hover:bg-[#7a1521]/20 text-[#7a1521] text-xs font-bold transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-[#0F172A]">Security & Authentication</span>
          <span className="text-[10px] text-[#64748B]">Credentials & Active Sessions</span>
        </div>
      </div>

      {/* Toast Popup */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-11/12 bg-white rounded-2xl shadow-xl border border-slate-200 p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            {toastMessage.type === 'success' && (
              <CheckCircle2 className="w-5 h-5 text-[#047857] shrink-0" />
            )}
            {toastMessage.type === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            {toastMessage.type === 'info' && (
              <ShieldCheck className="w-5 h-5 text-[#7a1521] shrink-0" />
            )}
            <span className="text-xs font-medium text-[#1E293B]">
              {toastMessage.text}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* CARD 1: SECURITY & AUTHENTICATION */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7a1521]/10 text-[#7a1521] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-[#0F172A]">
                Security & Authentication
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                Manage credentials, two-factor authentication, and monitor active account sessions across institutional devices.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#d1fae5] text-[#047857] border border-[#a7f3d0]/50 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Shield Active
          </span>
        </div>

        {/* Two-Factor Authentication Toggle Row */}
        <div
          className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-all duration-200 ${
            isTwoFactorActive
              ? 'bg-[#7a1521]/[0.03] border-[#7a1521]/20 shadow-xs'
              : 'bg-[#F8FAFC] border-[#E2E8F0]'
          }`}
        >
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                isTwoFactorActive
                  ? 'bg-[#7a1521] text-white shadow-sm'
                  : 'bg-[#E2E8F0] text-[#64748B]'
              }`}
            >
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-[#1E293B]">
                  Two-Factor Authentication
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#047857] border border-[#a7f3d0]/50">
                  <CheckCircle2 className="w-3 h-3" />
                  Enabled
                </span>
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Require OTP code upon sign-in
              </p>
            </div>
          </div>

          {/* Interactive Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={isTwoFactorActive}
            onClick={handleToggle2FA}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#7a1521] focus:ring-offset-2 ${
              isTwoFactorActive ? 'bg-[#7a1521]' : 'bg-[#CBD5E1]'
            }`}
          >
            <span className="sr-only">Toggle Two-Factor Authentication</span>
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                isTwoFactorActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* CARD 2: CHANGE PASSWORD */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#7a1521]/10 text-[#7a1521] flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-[#0F172A]">
              Change Password
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Ensure your account is protected with a strong, distinct passphrase.
            </p>
          </div>
        </div>

        {/* Password Change Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4">
          
          {/* FIELD 1: CURRENT PASSWORD */}
          <div className="flex flex-col gap-1.5 w-full">
            <label
              htmlFor="current-password"
              className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#7a1521]" />
              CURRENT PASSWORD <span className="text-[#7a1521]">*</span>
            </label>
            <div className="relative flex items-center w-full">
              <input
                id="current-password"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password..."
                className={`w-full h-11 pl-3.5 pr-11 text-sm font-medium text-[#0F172A] bg-white border rounded-xl transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  passwordErrors.current
                    ? 'border-rose-500 ring-rose-100 focus:ring-rose-500/30'
                    : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#7a1521] focus:ring-[#7a1521]/20'
                }`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowCurrentPassword((prev) => !prev);
                }}
                className="absolute right-3 p-1 text-[#64748B] hover:text-[#7a1521] focus:outline-none transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
                title={showCurrentPassword ? "Hide password" : "Show password"}
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordErrors.current && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {passwordErrors.current}
              </p>
            )}
            {!passwordErrors.current && (
              <p className="text-[11px] text-[#64748B]">
                Enter your active institutional account password.
              </p>
            )}
            <div className="flex justify-end pt-0.5">
              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-xs font-bold text-[#7a1521] hover:underline cursor-pointer"
              >
                Forgot your current password?
              </button>
            </div>
          </div>

          {/* FIELD 2: NEW PASSWORD */}
          <div className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <label
                htmlFor="new-password"
                className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#7a1521]" />
                NEW PASSWORD <span className="text-[#7a1521]">*</span>
              </label>
              {newPassword.length > 0 && (
                <span className="text-[11px] font-semibold text-[#64748B]">
                  Strength: <span className={newPasswordStrength >= 3 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {strengthLabels[newPasswordStrength]}
                  </span>
                </span>
              )}
            </div>
            <div className="relative flex items-center w-full">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password..."
                className={`w-full h-11 pl-3.5 pr-11 text-sm font-medium text-[#0F172A] bg-white border rounded-xl transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  passwordErrors.new
                    ? 'border-rose-500 ring-rose-100 focus:ring-rose-500/30'
                    : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#7a1521] focus:ring-[#7a1521]/20'
                }`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowNewPassword((prev) => !prev);
                }}
                className="absolute right-3 p-1 text-[#64748B] hover:text-[#7a1521] focus:outline-none transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
                title={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {/* Strength Meter Bar */}
            {newPassword.length > 0 && (
              <div className="flex gap-1 h-1.5 w-full mt-0.5 rounded-full overflow-hidden bg-slate-100 p-0.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`flex-1 rounded-full transition-all duration-300 ${
                      step <= newPasswordStrength ? strengthColors[newPasswordStrength] : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            )}
            {passwordErrors.new && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {passwordErrors.new}
              </p>
            )}
            {!passwordErrors.new && (
              <p className="text-[11px] text-[#64748B]">
                Use at least 8 characters with numbers & symbols.
              </p>
            )}
          </div>

          {/* FIELD 3: CONFIRM NEW PASSWORD */}
          <div className="flex flex-col gap-1.5 w-full">
            <label
              htmlFor="confirm-password"
              className="text-xs font-bold text-[#475569] uppercase tracking-wider flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-[#7a1521]" />
              CONFIRM NEW PASSWORD <span className="text-[#7a1521]">*</span>
            </label>
            <div className="relative flex items-center w-full">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password..."
                className={`w-full h-11 pl-3.5 pr-11 text-sm font-medium text-[#0F172A] bg-white border rounded-xl transition-all duration-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                  passwordErrors.confirm
                    ? 'border-rose-500 ring-rose-100 focus:ring-rose-500/30'
                    : confirmPassword && confirmPassword === newPassword
                    ? 'border-emerald-500 ring-emerald-100 focus:ring-emerald-500/30'
                    : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#7a1521] focus:ring-[#7a1521]/20'
                }`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowConfirmPassword((prev) => !prev);
                }}
                className="absolute right-3 p-1 text-[#64748B] hover:text-[#7a1521] focus:outline-none transition-colors rounded-lg hover:bg-slate-100 cursor-pointer"
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {passwordErrors.confirm && (
              <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {passwordErrors.confirm}
              </p>
            )}
            {!passwordErrors.confirm && confirmPassword && confirmPassword === newPassword && (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Passwords match!
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full h-11 mt-2 bg-[#7a1521] hover:bg-[#58000f] active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
          >
            <RotateCw className={`w-4 h-4 ${isUpdatingPassword ? 'animate-spin' : ''}`} />
            {isUpdatingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
          </button>
        </form>
      </section>

      {/* CARD 3: ACTIVE SESSIONS & LOGIN ACTIVITY */}
      <section className="bg-white rounded-2xl border border-[#E2E8F0] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7a1521]/10 text-[#7a1521] flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-[#0F172A]">
                Active Sessions & Login Activity
              </h2>
              <p className="text-xs text-[#64748B]">
                Devices currently signed into your account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogOutAll}
            className="text-xs font-bold text-[#7a1521] hover:text-rose-700 hover:underline shrink-0"
          >
            Log out all
          </button>
        </div>

        {/* Dynamic Session List Items */}
        <div className="space-y-3">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-all duration-200 shadow-2xs"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    session.isCurrent
                      ? 'bg-[#7a1521]/10 text-[#7a1521] ring-1 ring-[#7a1521]/30'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {session.deviceType === 'laptop' ? (
                    <Laptop className="w-5 h-5" />
                  ) : session.deviceType === 'mobile' ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Monitor className="w-5 h-5" />
                  )}
                </div>

                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-[#0F172A] truncate">
                      {session.deviceName}
                    </h4>
                    {session.isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#047857] border border-[#a7f3d0]/60">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Active Now
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-[#64748B] flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-[#334155]">{session.browser}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {session.location}
                    </span>
                  </div>

                  {session.ip && (
                    <div className="text-[11px] text-[#94A3B8] font-mono flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3 text-slate-400" />
                      {session.ip}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                {session.isCurrent ? (
                  <span className="text-xs font-semibold text-[#7a1521] px-3 py-1.5 rounded-lg bg-[#7a1521]/5 border border-[#7a1521]/10">
                    Current Device
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(session.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action: Outlined red button */}
        <button
          type="button"
          onClick={handleLogOutAll}
          className="w-full h-11 mt-1 border-2 border-[#7a1521] text-[#7a1521] hover:bg-[#7a1521] hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          SIGN OUT OF ALL DEVICES
        </button>
      </section>

      {/* Forgot Password Confirmation Modal (Matching Web Portal) */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 pt-5 pb-3.5 bg-gradient-to-br from-slate-50 to-rose-50/50 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7a1521]/10 text-[#7a1521] border border-[#7a1521]/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#7a1521]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Reset Your Password</h3>
                  <p className="text-xs text-slate-500">Confirm institutional email address</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5">
              {forgotStatus.type === 'success' ? (
                <div className="text-center py-2">
                  <div className="w-13 h-13 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Reset Link Dispatched!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {forgotStatus.message}
                  </p>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 mb-5">
                    <p className="font-bold text-slate-800">What to do next:</p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#7a1521] text-white flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                      <span>Check your email inbox at <strong>{forgotEmail}</strong>.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#7a1521] text-white flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                      <span>Click the <strong>"Reset Password"</strong> link in the email.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#7a1521] text-white flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                      <span>Enter your new password to sign in.</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 px-4 bg-[#7a1521] hover:bg-[#58000f] text-white font-semibold rounded-xl text-xs transition shadow-sm cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendResetLink} className="space-y-3.5">
                  <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      Please confirm your registered email address below. A secure link will be sent to your inbox to change your password.
                    </span>
                  </div>

                  {forgotStatus.type === 'error' && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{forgotStatus.message}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registered Institutional Email <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. user@itum.mrt.ac.lk"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/15 rounded-xl text-xs font-medium text-slate-900 transition outline-none"
                        autoFocus
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Link will remain valid for 24 hours.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-4 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white rounded-xl text-xs font-semibold transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {forgotLoading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Sending Link...</span>
                        </>
                      ) : (
                        <span>Confirm & Send Link</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
