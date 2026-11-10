import React, { useState, useEffect } from 'react';
import { LaborerProfile } from '../types';
import { LanguageCode, getTranslation } from '../services/i18n';
import { playEmergencyChime } from '../services/soundEffects';

interface ProfileScreenProps {
  profile: LaborerProfile;
  onUpdateProfile: (updated: Partial<LaborerProfile>) => void;
  onNavigateSubscreen: (subscreen: string) => void;
  onOpenAvatarPicker?: () => void;
  onSignOut?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onNavigateSubscreen,
  onOpenAvatarPicker,
  onSignOut,
}) => {
  const [isOnDuty, setIsOnDuty] = useState(profile.isOnDuty);
  const [notifEnabled, setNotifEnabled] = useState(profile.pushNotificationsEnabled);
  const [ringtoneOverride, setRingtoneOverride] = useState(profile.emergencyRingtoneOverride ?? true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const [adminContact, setAdminContact] = useState({
    name: 'System Administrator',
    designation: 'ITUM System Administrator & Security Control',
    department: 'ITUM Central Administration',
    phone: '+94 11 265 0301',
    mobile: '+94 77 123 4567',
    extension: 'Ext: 402',
    email: 'admin@itum.mrt.ac.lk',
    location: 'Sector 1 - Admin Complex, ITUM, Diyagama',
    hours: '24/7 Operations & Emergency Dispatch Desk',
  });

  useEffect(() => {
    fetch('/api/users')
      .then((res) => res.json())
      .then((data) => {
        const users = data.users || data.data || (Array.isArray(data) ? data : []);
        const adminUser = users.find(
          (u: any) =>
            (u.role && u.role.toLowerCase() === 'admin') ||
            (u.username && u.username.toLowerCase() === 'admin')
        );
        if (adminUser) {
          const fullName =
            `${adminUser.first_name || ''} ${adminUser.last_name || ''}`.trim() ||
            adminUser.name ||
            'System Administrator';
          setAdminContact((prev) => ({
            ...prev,
            name: fullName,
            email: adminUser.email || prev.email,
            phone: adminUser.phone || prev.phone,
            department: adminUser.department || prev.department,
            designation: adminUser.designation || prev.designation,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyAdminContact = () => {
    const textToCopy = `ITUM Administrator Contact Details:\nName: ${adminContact.name}\nDepartment: ${adminContact.department}\nDesignation: ${adminContact.designation}\nHotline: ${adminContact.phone} (${adminContact.extension})\nMobile: ${adminContact.mobile}\nEmail: ${adminContact.email}\nLocation: ${adminContact.location}\nHours: ${adminContact.hours}`;
    navigator.clipboard?.writeText(textToCopy);
    setFeedbackToast('✓ Admin contact details copied to clipboard!');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const currentLanguage: LanguageCode = profile.language || 'en';
  const t = getTranslation(currentLanguage);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleDuty = () => {
    const nextDuty = !isOnDuty;
    setIsOnDuty(nextDuty);
    onUpdateProfile({ isOnDuty: nextDuty });
  };

  const toggleNotif = () => {
    const nextNotif = !notifEnabled;
    setNotifEnabled(nextNotif);
    onUpdateProfile({ pushNotificationsEnabled: nextNotif });
  };

  const toggleRingtoneOverride = () => {
    const next = !ringtoneOverride;
    setRingtoneOverride(next);
    onUpdateProfile({ emergencyRingtoneOverride: next });

    if (next) {
      playEmergencyChime();
      setFeedbackToast('🚨 Emergency Ringtone Override Enabled (Chime tested)');
    } else {
      setFeedbackToast('🔕 Emergency Ringtone Override Disabled');
    }
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleTestChime = (e: React.MouseEvent) => {
    e.stopPropagation();
    playEmergencyChime();
    setFeedbackToast('🔔 Playing Emergency Override Tone Test');
    setTimeout(() => setFeedbackToast(null), 2500);
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedbackToast('Please select a valid image file (PNG, JPG, WEBP).');
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFeedbackToast('Image size exceeds 5MB limit. Please choose a smaller file.');
      setTimeout(() => setFeedbackToast(null), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (dataUrl) {
        onUpdateProfile({ avatarUrl: dataUrl });
        setFeedbackToast('Profile picture updated successfully!');
        setTimeout(() => setFeedbackToast(null), 3000);
        try {
          const userStr = localStorage.getItem('serva_mobile_user');
          if (userStr) {
            const u = JSON.parse(userStr);
            u.avatarUrl = dataUrl;
            localStorage.setItem('serva_mobile_user', JSON.stringify(u));
          }
        } catch (err) {}
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSelectLanguage = (lang: LanguageCode) => {
    onUpdateProfile({ language: lang });
    const langNames: Record<LanguageCode, string> = {
      en: 'English (UK / LK)',
      si: 'සිංහල (Sinhala)',
      ta: 'தமிழ் (Tamil)',
    };
    setFeedbackToast(`🌐 Display language switched to ${langNames[lang]}`);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleEndShift = () => {
    setShowLogoutModal(true);
  };

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto relative">
      {/* Dynamic Feedback Toast Banner */}
      {feedbackToast && (
        <div className="sticky top-2 z-30 p-3 bg-emerald-700 text-white rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 border border-emerald-500">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{feedbackToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackToast(null)}
            className="text-white/80 hover:text-white text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Worker Identity Card (Designed to match Screenshot 2 aesthetic with Screenshot 1 details) */}
      <div className="relative overflow-hidden bg-[#6b0e1a] rounded-[22px] p-4 sm:p-5 shadow-xl shadow-black/20 border border-white/10">
        {/* Decorative Dot Grid Background Overlay (Matching Screenshot 2) */}
        <div className="absolute inset-0 pointer-events-none p-3.5 flex flex-col justify-between">
          {[...Array(6)].map((_, rowIndex) => (
            <div key={rowIndex} className="flex justify-around items-center">
              {[...Array(10)].map((_, colIndex) => (
                <span
                  key={colIndex}
                  className="w-[3px] h-[3px] rounded-full bg-white/[0.08]"
                />
              ))}
            </div>
          ))}
        </div>

        {/* Top Header Row: Duty Pill Badge & Duty Toggle */}
        <div className="flex items-center justify-between relative z-10 w-full mb-1">
          {/* Top Left: Duty Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.14] backdrop-blur-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isOnDuty ? 'bg-[#22c55e] animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-[10.5px] font-extrabold text-white tracking-[0.6px] uppercase">
              {isOnDuty ? 'DUTY: ACTIVE • CENTRAL UNIT' : 'DUTY: OFF DUTY • INACTIVE'}
            </span>
          </div>

          {/* Top Right: Duty Status Toggle Button */}
          <button
            type="button"
            onClick={toggleDuty}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all active:scale-95 shadow-xs border ${
              isOnDuty
                ? 'bg-white/15 hover:bg-white/25 text-white border-white/20'
                : 'bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border-emerald-400/40'
            }`}
          >
            {isOnDuty ? 'Set Off Duty' : 'Set On Duty'}
          </button>
        </div>

        {/* Center: Officer / Worker Avatar with White Ring & Verified Check Badge */}
        <div className="flex flex-col items-center justify-center mt-2 mb-2.5 relative z-10">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            aria-hidden="true"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-[94px] h-[94px] rounded-full border-[3.5px] border-white bg-[#f8fafc] relative shadow-lg shadow-black/25 cursor-pointer group"
            title="Click to change profile picture"
          >
            <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full bg-[#f1f5f9] flex items-center justify-center text-[#7a1521]">
                  <span className="material-symbols-outlined text-[54px] text-[#7a1521]">person</span>
                </div>
              )}
              {/* Camera overlay hover indicator */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-full flex items-center justify-center text-white transition-opacity">
                <span className="material-symbols-outlined text-[26px]">photo_camera</span>
              </div>
            </div>

            {/* Verified Check Badge (Bottom right of avatar ring) */}
            <div className="absolute -bottom-0.5 -right-0.5 w-[24px] h-[24px] rounded-full bg-[#059669] border-2 border-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-[13px] font-black leading-none">
                check
              </span>
            </div>
          </div>
        </div>

        {/* Officer / Worker Name, Role & Institution (Centered) */}
        <div className="flex flex-col items-center text-center relative z-10 px-2">
          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-[22px] font-extrabold text-white tracking-[-0.2px] leading-tight">
              {profile.name}
            </h2>
            <span className="material-symbols-outlined text-[19px] text-[#fca5a5] fill-icon">
              verified
            </span>
          </div>

          {/* Role / Designation (Salmon/Coral) */}
          <p className="text-[13.5px] font-semibold text-[#fca5a5] mt-1 leading-snug">
            {profile.title || 'Supervisor'}
          </p>


          {/* Institution Header */}
          <p className="text-[10.5px] font-bold text-white/75 tracking-[1.2px] uppercase mt-1.5">
            {profile.institution}
          </p>
        </div>

      </div>

      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in duration-150">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{feedbackToast}</span>
        </div>
      )}



      {/* 1. INSTITUTIONAL IDENTITY SECTION */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#475569] px-1">
          Institutional Identity
        </span>

        <button
          type="button"
          onClick={() => onNavigateSubscreen('settings_profile')}
          className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0]/60 p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#2563eb] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#1e293b] truncate">
                Officer Profile &amp; ID Card
              </span>
              <span className="text-[11px] text-[#64748b] mt-0.5 truncate">
                {profile.employeeId || 'ID Verified'} • {profile.division || 'Supervisor Division'}
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#94a3b8] text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* 2. SYSTEM & CONTROLS SECTION */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#475569]">
            System &amp; Controls
          </span>
          <span className="text-[11px] font-bold text-[#b91c1c]">
            4 Modules
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#e2e8f0]/60 overflow-hidden flex flex-col divide-y divide-[#f1f5f9]">
          {/* Notifications & Alerts */}
          <button
            type="button"
            onClick={() => onNavigateSubscreen('settings_notifications')}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#fffbeb] text-[#d97706] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1e293b] truncate">
                  Notifications &amp; Alerts
                </span>
                <span className="text-[11px] text-[#64748b] mt-0.5 truncate">
                  Push chime, Urgent SOS buzzer, SMS
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b]" />
              <span className="material-symbols-outlined text-[#94a3b8] text-[20px]">chevron_right</span>
            </div>
          </button>

          {/* Security & Passwords */}
          <button
            type="button"
            onClick={() => onNavigateSubscreen('settings_security')}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#f5f3ff] text-[#7c3aed] flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[20px]">sync</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1e293b] truncate">
                  Security &amp; Passwords
                </span>
                <span className="text-[11px] text-[#64748b] mt-0.5 truncate">
                  Password & authentication settings
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#94a3b8] text-[20px]">chevron_right</span>
          </button>


          {/* System Logs */}
          <button
            type="button"
            onClick={() => onNavigateSubscreen('settings_logs')}
            className="flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#f8fafc] text-[#475569] flex items-center justify-center shrink-0 shadow-xs border border-slate-100">
                <span className="material-symbols-outlined text-[20px]">description</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1e293b] truncate">
                  System Logs
                </span>
                <span className="text-[11px] text-[#64748b] mt-0.5 truncate">
                  Audit trail, error reports, session activity
                </span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#94a3b8] text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* 3. INSTITUTIONAL COMPLIANCE & SOS SECTION */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11.5px] font-bold uppercase tracking-wider text-[#475569] px-1">
          Institutional Compliance &amp; SOS
        </span>

        <button
          type="button"
          onClick={() => setShowAdminModal(true)}
          className="w-full text-left bg-white rounded-2xl shadow-sm border border-[#e2e8f0]/60 p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#fff0ef]/50 transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#fef2f2] text-[#dc2626] flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-[#1e293b] truncate">
                Emergency Dispatch Hotline
              </span>
              <span className="text-[11px] font-semibold text-[#b91c1c] mt-0.5 truncate">
                Direct line to Security &amp; Control (Ext: 402)
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-[#b91c1c] text-[22px] shrink-0">call</span>
        </button>
      </div>

      {/* 4. LOG OUT BUTTON (Matching Screenshot 1) */}
      <div className="pt-2 flex flex-col gap-2 text-center">
        <button
          type="button"
          onClick={handleEndShift}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#fff0ef] hover:bg-[#ffe4e6] active:scale-[0.99] text-[#dc2626] border border-[#fecdd3] transition-all flex items-center justify-center gap-2 font-bold text-sm shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>Log Out</span>
        </button>

        <p className="text-[11px] text-[#64748b] mt-1">
          Serva Technician App v2.4.1 • ITUM Central Maintenance
        </p>
      </div>

      {/* Center Screen Modal Pop-up (Shift End / Logout Confirmation) */}
      {showLogoutModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Red Alert Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#fee2e2] text-[#dc2626] flex items-center justify-center mb-3 shadow-inner">
              <span className="material-symbols-outlined text-[28px]">logout</span>
            </div>

            <h3 className="text-lg font-extrabold text-[#1e293b] tracking-tight">
              {t.endShift}
            </h3>

            <p className="text-xs text-[#64748b] mt-1.5 mb-5 leading-relaxed">
              {t.endShiftConfirm}
            </p>

            <div className="flex items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  if (onSignOut) {
                    onSignOut();
                  } else {
                    alert('Shift closed successfully. Logs synchronized. Have a safe journey home!');
                  }
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs shadow-md shadow-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Confirm</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Center Screen Modal Pop-up (Admin Contact Details) */}
      {showAdminModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowAdminModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Bar */}
            <div className="bg-gradient-to-r from-[#58000f] to-[#7a1521] text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white ring-1 ring-white/20">
                  <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                    ITUM Central Facilities
                  </span>
                  <h3 className="text-sm font-extrabold text-white tracking-tight">
                    Administrator Contact Details
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex flex-col gap-3 max-h-[75vh] overflow-y-auto no-scrollbar">
              {/* Admin Profile Highlight Card */}
              <div className="p-3.5 rounded-2xl bg-[#fff0ef] border border-[#ffdad9] flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#7a1521] text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[26px]">manage_accounts</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-extrabold text-[#1e293b] truncate">
                    {adminContact.name}
                  </span>
                  <span className="text-[11px] font-bold text-[#7a1521] truncate">
                    {adminContact.designation}
                  </span>
                  <span className="text-[10px] text-[#64748b] truncate mt-0.5">
                    {adminContact.department}
                  </span>
                </div>
              </div>

              {/* Contact Information List */}
              <div className="flex flex-col gap-2">
                {/* 1. Official Hotline & Extension */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">phone_in_talk</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase">Direct Line &amp; Hotline</span>
                      <span className="text-xs font-bold text-[#1e293b]">
                        {adminContact.phone} <span className="text-red-700 font-extrabold">({adminContact.extension})</span>
                      </span>
                    </div>
                  </div>
                  <a
                    href={`tel:${adminContact.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-2.5 py-1.5 rounded-lg bg-[#7a1521] hover:bg-[#58000f] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    <span>Call</span>
                  </a>
                </div>

                {/* 2. Emergency Mobile */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">smartphone</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase">Mobile Number</span>
                      <span className="text-xs font-bold text-[#1e293b]">{adminContact.mobile}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${adminContact.mobile.replace(/[^0-9+]/g, '')}`}
                    className="px-2.5 py-1.5 rounded-lg bg-[#7a1521] hover:bg-[#58000f] text-white text-[11px] font-bold flex items-center gap-1 shadow-xs transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    <span>Call</span>
                  </a>
                </div>

                {/* 3. Official Email */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">mail</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] font-bold text-[#64748b] uppercase">Admin Email</span>
                      <span className="text-xs font-bold text-[#1e293b] truncate">{adminContact.email}</span>
                    </div>
                  </div>
                  <a
                    href={`mailto:${adminContact.email}`}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span className="material-symbols-outlined text-[14px]">send</span>
                    <span>Email</span>
                  </a>
                </div>

                {/* 4. Office Location */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase">Office Location</span>
                    <span className="text-xs font-bold text-[#1e293b]">{adminContact.location}</span>
                  </div>
                </div>

                {/* 5. Support Hours */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-bold text-[#64748b] uppercase">Availability</span>
                    <span className="text-xs font-bold text-[#1e293b]">{adminContact.hours}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center">
              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
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
