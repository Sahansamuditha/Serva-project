import React, { useState } from 'react';
import { Lock, Mail, CheckCircle2, AlertCircle, X } from 'lucide-react';

export type UserRole = 'officer' | 'labourer';

interface LoginScreenProps {
  onLogin: (role: UserRole, userEmail: string, userObj?: any) => void;
  devicePreset?: 'universal' | 'android' | 'ios';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  devicePreset = 'universal',
}) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Contact Administrator Modal State
  const [showContactModal, setShowContactModal] = useState(false);
  const [copiedContact, setCopiedContact] = useState(false);

  const handleCopyContact = () => {
    const text = 'ITUM Division Admin Contact:\nEmail: admin@itum.mrt.ac.lk\nTel: +94 11 265 0301\nOffice: Sector 1 - Admin Complex, ITUM, Diyagama';
    navigator.clipboard?.writeText(text);
    setCopiedContact(true);
    setTimeout(() => setCopiedContact(false), 2500);
  };

  // Forgot Password Confirmation Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<{ type: '' | 'success' | 'error'; message: string }>({
    type: '',
    message: ''
  });

  const handleOpenForgotModal = () => {
    const cleanId = identifier.trim();
    if (cleanId.includes('@')) {
      setForgotEmail(cleanId);
    } else {
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

      // Attempt 1: Standard relative endpoint (Nginx proxy)
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

  const usernameRef = React.useRef<HTMLInputElement | null>(null);
  const passwordRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    // Ensure inputs are strictly empty on mount
    setIdentifier('');
    setPassword('');
    if (usernameRef.current) usernameRef.current.value = '';
    if (passwordRef.current) passwordRef.current.value = '';

    try {
      localStorage.removeItem('serva_mobile_saved_id');
      localStorage.removeItem('serva_saved_user');
      localStorage.removeItem('saved_username');
    } catch (e) {}

    // Wipe out any delayed browser autofill (e.g. Chrome autofilling officer@itum.mrt.ac.lk / password123)
    const t1 = setTimeout(() => {
      if (usernameRef.current && (usernameRef.current.value === 'officer@itum.mrt.ac.lk' || !identifier)) {
        usernameRef.current.value = '';
        setIdentifier('');
      }
      if (passwordRef.current && (passwordRef.current.value === 'password123' || !password)) {
        passwordRef.current.value = '';
        setPassword('');
      }
    }, 100);

    const t2 = setTimeout(() => {
      if (usernameRef.current && usernameRef.current.value === 'officer@itum.mrt.ac.lk') {
        usernameRef.current.value = '';
        setIdentifier('');
      }
      if (passwordRef.current && passwordRef.current.value === 'password123') {
        passwordRef.current.value = '';
        setPassword('');
      }
    }, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanIdentifier = identifier.trim().toLowerCase();
    if (!cleanIdentifier || !password) {
      setErrorMessage('Please enter both username/email and password.');
      return;
    }

    setLoading(true);

    // 1. Authenticate with backend API using mobile client flag
    try {
      let res: Response | null = null;
      let data: any = null;

      const payload = {
        email: cleanIdentifier,
        username: cleanIdentifier,
        loginIdentifier: cleanIdentifier,
        password,
        client: 'mobile'
      };

      // Attempt 1: Standard relative endpoint (Nginx proxy / Vite dev proxy)
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          res = response;
          data = await response.json();
        } else {
          // Non-JSON response (e.g. 502/504 Bad Gateway from proxy)
          throw new Error(`Non-JSON response received from proxy (status ${response.status})`);
        }
      } catch (proxyError) {
        console.warn('Relative /api/auth/login failed, attempting direct backend connection...', proxyError);
        // Attempt 2: Direct backend URL via hostname:5000
        const host = window.location.hostname || 'localhost';
        const directUrl = `http://${host}:5000/api/auth/login`;
        const directResponse = await fetch(directUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const directContentType = directResponse.headers.get('content-type') || '';
        if (directContentType.includes('application/json')) {
          res = directResponse;
          data = await directResponse.json();
        } else {
          throw new Error(`Non-JSON response from direct backend (status ${directResponse.status})`);
        }
      }

      if (res && res.ok && data && data.success && data.user) {
        // Enforce role authorization: Only Maintenance Officers and Supervisors
        const roleLower = (data.user.role || '').toLowerCase();
        const desigLower = (data.user.designation || '').toLowerCase();
        const isOfficer = roleLower.includes('officer') || desigLower.includes('officer');
        const isSupervisor = roleLower.includes('supervisor') || desigLower.includes('supervisor') || roleLower.includes('labour') || roleLower.includes('tech');

        if (!isOfficer && !isSupervisor) {
          setErrorMessage('Access Denied: The Mobile Application is restricted to Maintenance Officers and Supervisors only. Requesters and Admins must log in via the Web Portal.');
          setLoading(false);
          return;
        }

        if (rememberMe) {
          try {
            localStorage.setItem('serva_mobile_saved_id', cleanIdentifier);
          } catch (e) {}
        } else {
          try {
            localStorage.removeItem('serva_mobile_saved_id');
          } catch (e) {}
        }

        try {
          localStorage.setItem('serva_mobile_user', JSON.stringify(data.user));
          if (data.token) {
            localStorage.setItem('serva_mobile_token', data.token);
          }
        } catch (e) {}

        const role: UserRole = isOfficer ? 'officer' : 'labourer';
        onLogin(role, data.user.email || cleanIdentifier, data.user);
        return;
      } else {
        // Access Denied / Invalid credentials from backend
        setErrorMessage(data?.message || 'Invalid username/email or password. Only registered Maintenance Officers and Supervisors can log in.');
        setLoading(false);
        return;
      }
    } catch (err: any) {
      console.error('Authentication request error:', err);
      setErrorMessage(
        err?.message && !err.message.includes('fetch')
          ? err.message
          : 'Unable to connect to authentication server. Please ensure backend is running.'
      );
      setLoading(false);
      return;
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#58000f] text-[#1e293b] select-none">
      {/* 1. Mobile Status Bar (09:41) */}
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-white select-none z-30">
        <span className="font-bold tracking-tight text-[13px]">09:41</span>
        <div className="flex items-center gap-1.5 text-white/90">
          <span className="material-symbols-outlined text-[15px]">wifi</span>
          <span className="material-symbols-outlined text-[16px]">signal_cellular_alt</span>
          <span className="material-symbols-outlined text-[18px]">battery_full</span>
        </div>
      </div>

      {/* 2. Top Maroon Hero Header matching log in page.png */}
      <div className="relative px-6 pt-3 pb-12 bg-gradient-to-b from-[#58000f] via-[#7a1521] to-[#58000f] overflow-hidden">
        {/* Subtle dot pattern texture matching mockup */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
          }}
        />

        {/* Serva Brand Logo and Subtitle */}
        <div className="relative z-10 flex items-start gap-3 mt-1">
          {/* Rounded Serva Logo Badge */}
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs flex items-center justify-center overflow-hidden shadow-inner shrink-0 p-1.5">
            <img
              src="/serva_logo.jpeg"
              alt="Serva Logo"
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/LOGO.jpeg';
              }}
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[24px] font-black tracking-tight text-white leading-none">
                Serva
              </span>
              <span className="bg-[#eab308] text-[#1e293b] text-[10px] font-black px-1.5 py-0.5 rounded font-mono tracking-wider leading-none shadow-xs">
                ITUM
              </span>
            </div>
            <span className="text-white/95 text-xs font-semibold leading-tight mt-1">
              Maintenance Monitoring System
            </span>
            <span className="text-white/75 text-[10.5px] font-medium leading-tight mt-0.5">
              Institute of Technology, Univ. of Moratuwa
            </span>
          </div>
        </div>

        {/* Headline: Better Maintenance. Stronger University. */}
        <div className="relative z-10 mt-6">
          <h1 className="text-[26px] font-black text-white tracking-tight leading-tight">
            Better Maintenance.
          </h1>
          <h2 className="text-[26px] font-black text-[#eab308] tracking-tight leading-tight mt-0.5">
            Stronger University.
          </h2>
          <div className="w-14 h-1.5 bg-[#eab308] rounded-full mt-2.5" />
        </div>
      </div>

      {/* 3. Floating Central Crest Badge overlapping boundary */}
      <div className="relative z-20 flex justify-center -mb-8">
        <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-2xl border border-white/90 flex items-center justify-center ring-1 ring-black/5">
          <img
            src="/LOGO.jpeg"
            alt="University of Moratuwa Logo"
            className="w-full h-full object-contain rounded-xl"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src =
                'https://lh3.googleusercontent.com/aida-public/AB6AXuCI26ofuOIGyk1MyB8jc4lPtQ59kNJ-LPlIbLnl-m523fFCZaN-q_bvpxXzVV8AWHIft6TDr4bfnAkf9eN7wL48kN4iqgmkXQap7gxpQw_EmlgzrZw_I8S43xlD-xhw4vuqFanls0BkHJEYaG2f7kA_pO0yA4Hcd1NrLZlyUi87HTaViT91UpyoQiTrNgPwuqynsgbLio80YtBm6H2sA51Cf74lqaS4wD4zTxWd3DPlJhJMeXHa-cEvnpiEJMIiMtJqB_s';
            }}
          />
        </div>
      </div>

      {/* 4. White Login Form Card */}
      <div className="relative z-10 flex-1 bg-white rounded-t-[32px] pt-10 pb-6 px-6 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Welcome Back & Subtitle */}
          <div className="text-center">
            <h2 className="text-[23px] font-black text-[#1e293b] tracking-tight">
              Welcome Back!
            </h2>
            <p className="text-xs text-[#64748b] mt-1">
              Sign in to continue to Serva portal
            </p>
          </div>

          {errorMessage && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#fee2e2] text-[#b91c1c] text-xs font-semibold flex items-center gap-1.5 border border-[#fca5a5]">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5" autoComplete="off">
            {/* Hidden dummy inputs to absorb aggressive Chrome/Edge autofill */}
            <input type="text" name="fake_user_absorber" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" style={{ display: 'none' }} />
            <input type="password" name="fake_pass_absorber" tabIndex={-1} autoComplete="new-password" className="sr-only" aria-hidden="true" style={{ display: 'none' }} />

            {/* Field: Username or University Email */}
            <div>
              <label className="block text-xs font-bold text-[#1e293b] mb-1">
                Username
              </label>
              <div className="relative flex items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 focus-within:border-[#7a1521] focus-within:ring-2 focus-within:ring-[#7a1521]/15 transition-all">
                <span className="material-symbols-outlined text-[20px] text-[#94a3b8] mr-2.5 shrink-0">
                  person
                </span>
                <input
                  ref={usernameRef}
                  type="text"
                  name="serva_login_username"
                  id="serva_login_username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full bg-transparent text-xs font-semibold text-[#1e293b] placeholder:text-[#94a3b8] outline-none"
                />
              </div>
            </div>

            {/* Field: Password */}
            <div>
              <label className="block text-xs font-bold text-[#1e293b] mb-1">
                Password
              </label>
              <div className="relative flex items-center bg-[#f8fafc] border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 focus-within:border-[#7a1521] focus-within:ring-2 focus-within:ring-[#7a1521]/15 transition-all">
                <span className="material-symbols-outlined text-[20px] text-[#94a3b8] mr-2.5 shrink-0">
                  lock
                </span>
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  name="serva_login_password"
                  id="serva_login_password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className="w-full bg-transparent text-xs font-semibold text-[#1e293b] placeholder:text-[#94a3b8] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#94a3b8] hover:text-[#1e293b] transition-colors p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-[#7a1521] focus:ring-[#7a1521] border-[#e2e8f0]"
                />
                <span className="text-xs font-semibold text-[#475569]">Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-xs font-bold text-[#7a1521] hover:underline cursor-pointer"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#7a1521] hover:bg-[#58000f] active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-[#7a1521]/20 flex items-center justify-center gap-2 transition-all cursor-pointer mt-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <span className="material-symbols-outlined text-[19px]">
                {loading ? 'sync' : 'login'}
              </span>
            </button>
          </form>
        </div>

        {/* 5. Footer & Contact Administrator */}
        <div className="mt-6 pt-3 text-center border-t border-[#f1f5f9]">
          <p className="text-xs text-[#64748b]">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="font-bold text-[#7a1521] hover:underline cursor-pointer"
            >
              Contact Administrator
            </button>
          </p>
          <p className="text-[10px] text-[#94a3b8] mt-1.5">
            © 2026 Institute of Technology, University of Moratuwa. All rights reserved. Serva Platform.
          </p>

          {/* Native Home Indicator Bar */}
          <div className="w-32 h-1 bg-[#1e293b]/20 rounded-full mx-auto mt-4" />
        </div>
      </div>

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
                    Back to Login
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

      {/* Contact Administrator Modal (Centered on screen) */}
      {showContactModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#58000f] to-[#7a1521] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white ring-1 ring-white/20">
                  <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                    ITUM User Accounts
                  </span>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    Contact Administrator
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4.5 flex flex-col gap-3 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Highlight Card */}
              <div className="p-3.5 rounded-2xl bg-[#fff0ef] border border-[#ffdad9] flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#7a1521] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-extrabold text-[#1e293b] truncate">
                    System Administrator
                  </span>
                  <span className="text-[11px] font-bold text-[#7a1521] truncate">
                    ITUM Division Admin
                  </span>
                  <span className="text-[10px] text-[#64748b] truncate mt-0.5">
                    ITUM Central Administration
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#475569] leading-relaxed px-0.5">
                To create a new supervisor account or request access to the Mobile Portal, please contact the division administrator:
              </p>

              {/* Contact Information List */}
              <div className="flex flex-col gap-2">
                {/* 1. Official Hotline */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase">Telephone Hotline</span>
                      <span className="text-xs font-bold text-[#1e293b]">+94 11 265 0301</span>
                    </div>
                  </div>
                  <a
                    href="tel:+94112650301"
                    className="px-2.5 py-1.5 rounded-lg bg-[#7a1521] hover:bg-[#58000f] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    <span>Call</span>
                  </a>
                </div>

                {/* 2. Official Email */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase">Admin Email</span>
                      <span className="text-xs font-bold text-[#1e293b] truncate">admin@itum.mrt.ac.lk</span>
                    </div>
                  </div>
                  <a
                    href="mailto:admin@itum.mrt.ac.lk"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">send</span>
                    <span>Email</span>
                  </a>
                </div>

                {/* 3. Office Location */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase">Office Location</span>
                    <span className="text-xs font-bold text-[#1e293b]">Sector 1 - Admin Complex, ITUM, Diyagama</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="w-full py-2.5 px-5 rounded-xl bg-[#7a1521] hover:bg-[#58000f] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
