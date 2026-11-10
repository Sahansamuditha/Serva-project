import React, { useState } from 'react';
import {
  ClipboardList,
  Settings as WrenchIcon,
  Bell,
  FileSpreadsheet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  HelpCircle,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building2,
  Wrench,
  X,
  Phone,
  PhoneCall,
  Clock,
  MapPin
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import { setAuthSession } from '../utils/auth';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forgot Password Confirmation Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState({ type: '', message: '', previewUrl: '' });

  // Help & Support Modal State
  const [showHelpModal, setShowHelpModal] = useState(false);



  const handleOpenForgotModal = (e) => {
    e.preventDefault();
    setForgotEmail(email.trim());
    setForgotStatus({ type: '', message: '', previewUrl: '' });
    setShowForgotModal(true);
  };

  const handleSendResetLink = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail || !forgotEmail.trim()) {
      setForgotStatus({ type: 'error', message: 'Please enter your registered institutional email address.' });
      return;
    }

    setForgotLoading(true);
    setForgotStatus({ type: '', message: '', previewUrl: '' });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setForgotStatus({
          type: 'success',
          message: data.message || `A password reset link has been dispatched to ${forgotEmail.trim()}.`,
          previewUrl: data.previewUrl || ''
        });
      } else {
        setForgotStatus({
          type: 'error',
          message: data.message || 'Unable to process password reset for this email.'
        });
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setForgotStatus({
        type: 'error',
        message: 'Network error connecting to password reset service. Please try again.'
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), loginIdentifier: email.trim(), username: email.trim(), password, client: 'web' })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAuthSession(data.user, data.token);
        if (onLoginSuccess) {
          onLoginSuccess(data.user, data.token);
        }
      } else {
        setErrorMessage(data.message || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      console.error('Login request failed', err);
      setErrorMessage('Unable to connect to backend server. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#ffffff] font-sans antialiased text-[#241919] select-none">

      {/* Left Brand Panel */}
      <div className="lg:w-[48%] xl:w-[45%] relative overflow-hidden bg-gradient-to-br from-[#3b060d] via-[#58000f] to-[#7a1521] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between min-h-[500px] lg:min-h-screen">

        {/* Subtle Watermark Circles in Background */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full border border-white/5 pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 rounded-full border border-white/10 pointer-events-none"></div>
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#931d2b]/20 blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner overflow-hidden p-1 shrink-0">
              <img
                src="/serva_logo.jpeg"
                alt="Serva Logo"
                className="w-full h-full object-contain rounded-md"
                onError={(e) => { e.target.src = '/logo.png'; }}
              />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-wider text-white font-['Outfit']">Serva</h2>
              <p className="text-xs text-rose-200/80 font-medium tracking-wide">Maintenance Monitoring & Management Platform</p>
            </div>
          </div>
        </div>

        {/* Hero Pitch Text */}
        <div className="my-auto py-10 relative z-10 max-w-lg">
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] font-black leading-[1.15] text-white font-['Outfit'] tracking-tight">
            Better Maintenance. <br />
            <span className="text-[#FBBF24]">Stronger University.</span>
          </h1>

          <div className="w-14 h-1.5 bg-[#FBBF24] rounded-full my-5 shadow-sm"></div>

          <p className="text-rose-100/90 text-sm sm:text-base leading-relaxed mb-8">
            A centralized platform to log, track, assign and manage maintenance requests across the Institute of Technology, University of Moratuwa.
          </p>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/20 hover:bg-black/30 backdrop-blur-md p-3.5 rounded-xl border border-white/10 transition duration-200 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                <ClipboardList className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <span className="text-xs font-semibold text-white/95 leading-tight">Request Maintenance</span>
            </div>

            <div className="bg-black/20 hover:bg-black/30 backdrop-blur-md p-3.5 rounded-xl border border-white/10 transition duration-200 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                <WrenchIcon className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <span className="text-xs font-semibold text-white/95 leading-tight">Track Progress</span>
            </div>

            <div className="bg-black/20 hover:bg-black/30 backdrop-blur-md p-3.5 rounded-xl border border-white/10 transition duration-200 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                <Bell className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <span className="text-xs font-semibold text-white/95 leading-tight">Get Real-time Notifications</span>
            </div>

            <div className="bg-black/20 hover:bg-black/30 backdrop-blur-md p-3.5 rounded-xl border border-white/10 transition duration-200 flex flex-col items-center text-center">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center mb-2">
                <FileSpreadsheet className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <span className="text-xs font-semibold text-white/95 leading-tight">Generate Reports</span>
            </div>
          </div>
        </div>

        {/* Left Footer Branding */}
        <div className="relative z-10 flex items-center gap-3 text-rose-200/80 pt-4 border-t border-white/10">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-amber-300">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white tracking-wide">Institute of Technology</div>
            <div className="text-[11px] text-rose-200/70">University of Moratuwa</div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="lg:w-[52%] xl:w-[55%] flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative bg-white overflow-y-auto">

        {/* Top Links */}
        <div className="flex justify-end items-center mb-8">
          <a
            href="#help"
            onClick={(e) => { e.preventDefault(); setShowHelpModal(true); }}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#7a1521] transition font-medium cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Help & Support</span>
          </a>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-md mx-auto my-auto py-4">

          {/* Circular University Crest */}
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-[#FFF0EF] border-2 border-[#F3DEDD] flex items-center justify-center p-2 shadow-sm">
              <img
                src={logoImg}
                alt="University of Moratuwa"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-['Outfit']">
              Welcome Back!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
              Sign in to continue to Serva
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <input type="text" name="fake_web_user" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" style={{ display: 'none' }} />
            <input type="password" name="fake_web_pass" tabIndex={-1} autoComplete="new-password" className="sr-only" aria-hidden="true" style={{ display: 'none' }} />

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="serva_web_user_login"
                  id="serva_web_user_login"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter username"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 rounded-lg text-sm transition outline-none text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="serva_web_user_pass"
                  id="serva_web_user_pass"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 rounded-lg text-sm transition outline-none text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#7a1521] focus:ring-[#7a1521]/20 accent-[#7a1521]"
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={handleOpenForgotModal}
                className="text-slate-600 hover:text-[#7a1521] font-medium transition cursor-pointer"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-[#7a1521] hover:bg-[#58000f] active:bg-[#43000b] text-white font-semibold rounded-lg text-sm transition-all duration-150 shadow-md shadow-[#7a1521]/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>



          {/* Bottom Administrator Note */}
          <div className="text-center mt-6 text-xs text-slate-500">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="text-[#7a1521] font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0 inline font-inherit"
            >
              Contact Administrator
            </button>
          </div>

        </div>

        {/* Empty bottom spacer for balance */}
        <div className="text-center text-[11px] text-slate-400 py-2">
          &copy; {new Date().getFullYear()} Serva Platform - Institute of Technology, University of Moratuwa
        </div>

      </div>

      {/* Forgot Password Confirmation Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 bg-gradient-to-br from-slate-50 to-rose-50/50 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7a1521]/10 text-[#7a1521] border border-[#7a1521]/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-[#7a1521]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-['Outfit']">Reset Your Password</h3>
                  <p className="text-xs text-slate-500">Confirm institutional email address</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {forgotStatus.type === 'success' ? (
                <div className="text-center py-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1 font-['Outfit']">Reset Link Dispatched!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {forgotStatus.message}
                  </p>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1.5 mb-5">
                    <p className="font-bold text-slate-800">What to do next:</p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#7a1521] text-white flex items-center justify-center text-[10px] font-bold">1</span>
                      Check your email inbox at <strong>{forgotEmail}</strong>.
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#7a1521] text-white flex items-center justify-center text-[10px] font-bold">2</span>
                      Click the <strong>"Reset Password"</strong> link in the email.
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#7a1521] text-white flex items-center justify-center text-[10px] font-bold">3</span>
                      Enter your new password to sign in.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 px-4 bg-[#7a1521] hover:bg-[#58000f] text-white font-semibold rounded-lg text-xs transition shadow-sm cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendResetLink} className="space-y-4">
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
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. user@itum.mrt.ac.lk"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-white border border-slate-200 focus:border-[#7a1521] focus:ring-4 focus:ring-[#7a1521]/10 rounded-lg text-xs font-medium text-slate-900 transition outline-none"
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
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="px-5 py-2 bg-[#7a1521] hover:bg-[#58000f] text-white rounded-lg text-xs font-semibold transition shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
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

      {/* Help & Support Contact Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 pt-5 pb-4 bg-gradient-to-br from-slate-50 to-rose-50/50 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#7a1521]/10 text-[#7a1521] border border-[#7a1521]/20 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-5 h-5 text-[#7a1521]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">Help & Support</h3>
                  <p className="text-xs text-slate-500">ITUM Works & Maintenance Division</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                For login assistance, account access, or immediate campus facility maintenance inquiries, please contact the Works Division:
              </p>

              {/* Contact Cards */}
              <div className="space-y-2.5">
                {/* General Contact Number */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#7a1521]/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">General Contact Number</div>
                      <a href="tel:+94112124000" className="text-sm font-bold text-slate-900 hover:text-[#7a1521] transition">
                        +94 11 212 4000 <span className="text-xs font-medium text-slate-500">(Ext: 4022)</span>
                      </a>
                    </div>
                  </div>
                  <a
                    href="tel:+94112124000"
                    className="px-2.5 py-1 text-xs font-semibold text-[#7a1521] bg-rose-50 hover:bg-rose-100 rounded-md transition"
                  >
                    Call
                  </a>
                </div>


                {/* Operator Landline */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#7a1521]/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">Campus General Operator</div>
                      <a href="tel:+94112650301" className="text-sm font-bold text-slate-900 hover:text-[#7a1521] transition">
                        +94 11 265 0301
                      </a>
                    </div>
                  </div>
                  <a
                    href="tel:+94112650301"
                    className="px-2.5 py-1 text-xs font-semibold text-[#7a1521] bg-rose-50 hover:bg-rose-100 rounded-md transition"
                  >
                    Call
                  </a>
                </div>

                {/* Email Support */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#7a1521]/30 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-slate-500">Official Support Email</div>
                      <a href="mailto:admin@itum.mrt.ac.lk" className="text-sm font-bold text-slate-900 hover:text-[#7a1521] transition">
                        admin@itum.mrt.ac.lk
                      </a>
                    </div>
                  </div>
                  <a
                    href="mailto:admin@itum.mrt.ac.lk"
                    className="px-2.5 py-1 text-xs font-semibold text-[#7a1521] bg-rose-50 hover:bg-rose-100 rounded-md transition"
                  >
                    Email
                  </a>
                </div>
              </div>

              {/* Office Details */}
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#7a1521]" />
                  <span>Working Hours: Mon – Fri | 8:00 AM – 4:30 PM</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Division of Works & Maintenance, ITUM Campus, Diyagama, Homagama</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 px-4 bg-[#7a1521] hover:bg-[#58000f] text-white font-semibold rounded-lg text-xs transition shadow-sm cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
