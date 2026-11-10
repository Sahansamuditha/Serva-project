import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  Wrench,
  Loader2
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { setAuthSession } from '../utils/auth';

export default function SetupAccount({ token, onLoginSuccess }) {
  const [loading, setLoading] = useState(true);
  const [verifyingError, setVerifyingError] = useState('');
  const [userInfo, setUserInfo] = useState(null);

  // Form fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successComplete, setSuccessComplete] = useState(false);

  // Verify invitation token on mount
  useEffect(() => {
    if (!token) {
      setVerifyingError('No setup token provided. Please use the link sent to your institutional email.');
      setLoading(false);
      return;
    }

    fetch(`/api/auth/verify-invite?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setUserInfo(data.user);
          setFirstName(data.user.firstName || '');
          setLastName(data.user.lastName || '');

          // Generate suggested username if not already set
          if (data.user.username) {
            setUsername(data.user.username);
          } else {
            const suggested = `${(data.user.firstName || '').toLowerCase().replace(/[^a-z0-9]/g, '')}.${(data.user.lastName || '').toLowerCase().replace(/[^a-z0-9]/g, '')}`.replace(/^\.|\.$/, '');
            setUsername(suggested || (data.user.email || '').split('@')[0]);
          }
        } else {
          setVerifyingError(data.message || 'Invalid or expired invitation link. Please request a new setup link from your Administrator.');
        }
      })
      .catch((err) => {
        console.error('Failed to verify invite token:', err);
        setVerifyingError('Unable to connect to verification server. Please check your network and try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2 || score === 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const cleanUsername = username.trim().toLowerCase();
    if (!cleanUsername) {
      setFormError('Please enter an institutional username.');
      return;
    }
    if (cleanUsername.length < 3) {
      setFormError('Username must be at least 3 characters long.');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('Please provide your First Name and Last Name.');
      return;
    }
    if (!password) {
      setFormError('Please enter a secure password.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match. Please retype and verify.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/setup-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          username: cleanUsername,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          password
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessComplete(true);
        // Clear token from URL
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}

        // Store clean session
        setAuthSession(data.user, data.token);

        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(data.user, data.token);
          } else {
            window.location.reload();
          }
        }, 1200);
      } else {
        setFormError(data.message || 'Failed to complete credential setup. Please try again.');
      }
    } catch (err) {
      console.error('Setup submission failed:', err);
      setFormError('Network error connecting to setup service. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (f, l) => {
    const i1 = (f || '').trim()[0] || '';
    const i2 = (l || '').trim()[0] || '';
    return (i1 + i2).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#ffffff] font-sans antialiased text-[#241919] select-none">
      {/* Left Brand Panel */}
      <div className="lg:w-[45%] xl:w-[42%] relative overflow-hidden bg-gradient-to-br from-[#3b060d] via-[#58000f] to-[#7a1521] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between min-h-[420px] lg:min-h-screen">
        {/* Subtle Watermark Circles */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border border-white/5 pointer-events-none"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#931d2b]/20 blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner overflow-hidden p-1 shrink-0">
              <img
                src="/serva_logo.jpeg"
                alt="Serva Logo"
                className="w-full h-full object-contain rounded-lg"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-wider text-white font-['Outfit']">Serva</h2>
              <p className="text-xs text-rose-200/80 font-medium tracking-wide">ITUM Maintenance Platform</p>
            </div>
          </div>
        </div>

        {/* Mid Hero Section */}
        <div className="relative z-10 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-rose-200 border border-white/15 text-xs font-semibold backdrop-blur-md mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Institutional Account Activation</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight text-white font-['Outfit'] mb-4">
            Welcome to the Campus Maintenance Network
          </h1>
          <p className="text-sm text-rose-100/80 leading-relaxed max-w-md font-normal">
            Configure your institutional username and personal password to access your role-specific portal, dispatch work orders, or report campus facility issues.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 max-w-sm">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs font-bold text-white mb-0.5">Secure SSO Ready</div>
              <div className="text-[11px] text-rose-200/70">Encrypted institutional access</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <div className="text-xs font-bold text-white mb-0.5">Zero Configuration</div>
              <div className="text-[11px] text-rose-200/70">Assigned role & division ready</div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-rose-200/60 flex items-center justify-between">
          <span>&copy; 2026 ITUM. University of Moratuwa</span>
          <span className="font-semibold text-rose-100">Diyagama, Homagama</span>
        </div>
      </div>

      {/* Right Setup Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto bg-slate-50/50">
        <div className="w-full max-w-md mx-auto">
          {/* Circular University Crest */}
          <div className="flex justify-center mb-5">
            <div className="w-18 h-18 rounded-full bg-[#FFF0EF] border-2 border-[#F3DEDD] flex items-center justify-center p-2 shadow-xs">
              <img
                src={logoImg}
                alt="University of Moratuwa"
                className="w-full h-full object-contain filter drop-shadow-xs"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <Loader2 className="w-8 h-8 text-[#7a1521] animate-spin mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">Verifying Security Token...</h3>
              <p className="text-xs text-slate-500 mt-1">Connecting to ITUM Institutional Directory</p>
            </div>
          )}

          {/* Token Error State */}
          {!loading && verifyingError && (
            <div className="text-center py-8 bg-white rounded-2xl border border-rose-200 p-8 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-['Outfit'] mb-2">Invitation Setup Link Invalid</h3>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">
                {verifyingError}
              </p>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#7a1521] hover:bg-[#58000f] text-white rounded-xl text-xs font-bold transition shadow-sm"
              >
                Back to Login Page
              </a>
            </div>
          )}

          {/* Success Completion Modal/Banner */}
          {successComplete && (
            <div className="text-center py-8 bg-white rounded-2xl border border-emerald-200 p-8 shadow-lg animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 font-['Outfit'] mb-1">
                {userInfo?.username ? 'Password Successfully Reset!' : 'Account Successfully Configured!'}
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Credentials saved. Redirecting to your personal dashboard...
              </p>
              <div className="w-6 h-6 border-2 border-[#7a1521]/30 border-t-[#7a1521] rounded-full animate-spin mx-auto"></div>
            </div>
          )}

          {/* Setup Form */}
          {!loading && !verifyingError && !successComplete && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Profile Card Header */}
              <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-slate-50 to-rose-50/40 border-b border-slate-100">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-black text-slate-900 font-['Outfit']">
                    {userInfo?.username ? 'Reset Your Password' : 'Set Up Your Credentials'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {userInfo?.username 
                      ? 'Configure a new secure password to restore access to your account' 
                      : 'Choose your username and password to activate your account'}
                  </p>
                </div>

                {/* User Info Capsule */}
                {userInfo && (
                  <div className="p-3 bg-white rounded-xl border border-rose-100 shadow-2xs flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7a1521] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      {getInitials(userInfo.firstName, userInfo.lastName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {userInfo.firstName} {userInfo.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {userInfo.email}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-rose-50 text-[#7a1521] border border-rose-200/60 truncate">
                          {userInfo.role}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Username Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Institutional Username *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                      placeholder="e.g. kasun.perera"
                      className="w-full pl-10 pr-3.5 py-2 bg-slate-50/50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 rounded-lg text-xs font-semibold text-slate-900 transition outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    You can use this username or your institutional email to sign in.
                  </p>
                </div>

                {/* First & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 rounded-lg text-xs text-slate-800 transition outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50/50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-2 focus:ring-[#7a1521]/10 rounded-lg text-xs text-slate-800 transition outline-none"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50/50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 rounded-lg text-xs text-slate-800 transition outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span>Strength:</span>
                        <span className="font-semibold">{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`}></div>
                        <div className={`h-full flex-1 rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`}></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retype your password"
                      className="w-full pl-10 pr-10 py-2 bg-slate-50/50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 rounded-lg text-xs text-slate-800 transition outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Passwords match
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2 py-2.5 px-4 bg-[#58000f] hover:bg-[#7a1521] active:bg-[#43000b] text-white font-bold rounded-xl text-xs transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{userInfo?.username ? 'Resetting Password...' : 'Configuring Account...'}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{userInfo?.username ? 'Save New Password & Sign In' : 'Save Credentials & Sign In'}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
