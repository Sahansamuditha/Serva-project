import React, { useState } from 'react';
import { LaborerProfile } from '../types';
import { LanguageCode, getTranslation } from '../services/i18n';
import { playEmergencyChime } from '../services/soundEffects';
import { initiateCall } from '../services/callService';

interface ProfileScreenProps {
  profile: LaborerProfile;
  onUpdateProfile: (updated: Partial<LaborerProfile>) => void;
  onNavigateSubscreen: (subscreen: string) => void;
  onOpenAvatarPicker?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  onUpdateProfile,
  onNavigateSubscreen,
  onOpenAvatarPicker,
}) => {
  const [isOnDuty, setIsOnDuty] = useState(profile.isOnDuty);
  const [notifEnabled, setNotifEnabled] = useState(profile.pushNotificationsEnabled);
  const [ringtoneOverride, setRingtoneOverride] = useState(profile.emergencyRingtoneOverride ?? true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  const currentLanguage: LanguageCode = profile.language || 'en';
  const t = getTranslation(currentLanguage);

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
    const confirmed = window.confirm(
      t.endShiftConfirm
    );
    if (confirmed) {
      alert('Shift closed successfully. Logs synchronized. Have a safe journey home!');
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto">
      {/* Worker Identity Card */}
      <div className="relative overflow-hidden bg-white rounded-2xl p-4 shadow-sm border border-[#debfbf]/40">
        <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-[#7a1521]/5 pointer-events-none" />
        
        <div className="flex items-start gap-3.5 relative z-10">
          <div className="relative shrink-0 group">
            <div
              onClick={onOpenAvatarPicker}
              title="Click to change profile picture"
              className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm bg-[#f9e3e2] ring-2 ring-[#ffdad9] cursor-pointer hover:ring-[#7a1521] transition-all relative"
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="material-symbols-outlined text-white text-[16px]">photo_camera</span>
              </div>
            </div>
            {/* Status indicator dot */}
            <div className="absolute -bottom-1 -left-1 w-4 h-4 rounded-full bg-white flex items-center justify-center shadow-sm">
              <span className={`w-2.5 h-2.5 rounded-full ${isOnDuty ? 'bg-emerald-600' : 'bg-amber-500'}`} />
            </div>
            {/* Camera Edit Badge */}
            <button
              type="button"
              onClick={onOpenAvatarPicker}
              title="Change Photo"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#7a1521] text-white flex items-center justify-center shadow-sm ring-2 ring-white hover:bg-[#58000f] transition-all"
            >
              <span className="material-symbols-outlined text-[13px]">photo_camera</span>
            </button>
          </div>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h2 className="text-[18px] font-bold text-[#241919] truncate">{profile.name}</h2>
              <span className="material-symbols-outlined text-[18px] text-[#7a1521] fill-icon">
                verified
              </span>
            </div>
            <p className="text-xs font-bold text-[#7a1521] truncate">{profile.title}</p>
            <p className="text-[11px] text-[#574141] truncate mt-0.5">
              {profile.employeeId} • {profile.division}
            </p>
          </div>
        </div>

        {/* Institutional Affiliation Badge */}
        <div className="mt-3.5 pt-2.5 border-t border-[#ffe9e8] flex items-center gap-2 bg-[#fff0ef] rounded-xl px-3 py-1.5">
          <span className="material-symbols-outlined text-[16px] text-[#7a1521]">account_balance</span>
          <span className="text-[11px] text-[#7a1521] font-bold truncate">
            {profile.institution}
          </span>
        </div>

        {/* Skill Tags */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <span className="px-2.5 py-1 bg-[#fff0ef] text-[#7a1521] rounded-lg text-xs font-bold border border-[#ffe9e8]">
            {profile.workshopBase}
          </span>
          <span className="px-2.5 py-1 bg-[#fff0ef] text-[#574141] rounded-lg text-xs font-semibold border border-[#ffe9e8]">
            {profile.shift}
          </span>
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200">
            {profile.attendanceRate} Attendance
          </span>
        </div>

        {/* Duty Status Quick Toggle */}
        <div className="mt-3.5 pt-3 border-t border-[#ffe9e8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-bold text-[#241919]">
              {isOnDuty ? t.onDuty : t.offDuty}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleDuty}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              isOnDuty
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {isOnDuty ? 'Set Off Duty' : 'Set On Duty'}
          </button>
        </div>
      </div>

      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in duration-150">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Performance Benchmarks Card */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#debfbf]/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#241919] uppercase tracking-wider">
            Operational Benchmarks
          </span>
          <span className="text-[10px] font-bold text-[#7a1521] bg-[#ffdad9] px-2 py-0.5 rounded-full">
            ITUM Certified
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#fff0ef] rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#574141] font-semibold">Total Resolved</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[22px] font-bold text-[#7a1521] leading-none">
                {profile.totalJobs}
              </span>
              <span className="text-[11px] text-[#574141]">Tickets</span>
            </div>
          </div>

          <div className="bg-[#fff0ef] rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] text-[#574141] font-semibold">Client Rating</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-[22px] font-bold text-[#7a1521] leading-none">
                {profile.satisfactionRating}
              </span>
              <span className="text-[11px] text-amber-600 font-bold">★ / 5.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* App & Work Preferences Menu */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#574141] px-1">
          App & Work Preferences
        </span>
        
        <div className="bg-white rounded-xl shadow-sm border border-[#debfbf]/40 overflow-hidden flex flex-col divide-y divide-[#ffe9e8]">
          {/* 1. Officer Profile */}
          <button
            onClick={() => onNavigateSubscreen('edit_profile')}
            className="flex items-center justify-between p-3.5 hover:bg-[#fff0ef] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#fff0ef] flex items-center justify-center shrink-0 text-[#7a1521]">
                <span className="material-symbols-outlined text-[20px]">badge</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#241919] truncate">{t.profileTitle}</span>
                <span className="text-[11px] text-[#574141] truncate">{t.badgeCredentials}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#8a7170] text-[20px]">chevron_right</span>
          </button>

          {/* 2. Campus Zones & Language */}
          <button
            onClick={() => onNavigateSubscreen('region_settings')}
            className="flex items-center justify-between p-3.5 hover:bg-[#fff0ef] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#fff0ef] flex items-center justify-center shrink-0 text-[#7a1521]">
                <span className="material-symbols-outlined text-[20px]">pin_drop</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#241919] truncate">{t.campusZonesAndLang}</span>
                <span className="text-[11px] text-[#574141] truncate">
                  3 Zones • {currentLanguage === 'en' ? 'English' : currentLanguage === 'si' ? 'සිංහල' : 'தமிழ்'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-[#7a1521] bg-[#ffdad9] px-2 py-0.5 rounded-full uppercase">
                {currentLanguage}
              </span>
              <span className="material-symbols-outlined text-[#8a7170] text-[20px]">chevron_right</span>
            </div>
          </button>

          {/* 3. DISPLAY LANGUAGE QUICK SELECTOR */}
          <div className="p-3.5 flex flex-col gap-2 bg-[#fff0ef]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-[#fff0ef] flex items-center justify-center shrink-0 text-[#7a1521]">
                  <span className="material-symbols-outlined text-[20px]">translate</span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#241919]">{t.displayLanguage}</span>
                  <span className="text-[11px] text-[#574141]">Select language for interface</span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#7a1521] bg-[#ffdad9] px-2 py-0.5 rounded-full uppercase">
                {currentLanguage.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { code: 'en', label: 'English', sub: 'UK / LK' },
                { code: 'si', label: 'සිංහල', sub: 'Sinhala' },
                { code: 'ta', label: 'தமிழ்', sub: 'Tamil' },
              ].map((lang) => {
                const isActive = currentLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code as LanguageCode)}
                    className={`py-2 px-1 rounded-xl text-center border transition-all active:scale-95 ${
                      isActive
                        ? 'bg-[#7a1521] text-white border-[#7a1521] shadow-xs font-bold ring-2 ring-[#7a1521]/30'
                        : 'bg-white hover:bg-[#fff0ef] text-[#574141] border-[#debfbf]/60 font-medium'
                    }`}
                  >
                    <span className="block text-xs font-bold leading-tight">{lang.label}</span>
                    <span
                      className={`block text-[10px] mt-0.5 ${
                        isActive ? 'text-white/80' : 'text-[#8a7170]'
                      }`}
                    >
                      {lang.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Push Notification Toggle */}
          <div className="flex items-center justify-between p-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#fff0ef] flex items-center justify-center shrink-0 text-[#7a1521]">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#241919]">{t.pushNotifications}</span>
                <span className="text-[11px] text-[#574141]">{t.pushDesc}</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifEnabled}
              onClick={toggleNotif}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center ${
                notifEnabled ? 'bg-[#7a1521]' : 'bg-[#5c5f61]'
              }`}
            >
              <span
                className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                  notifEnabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* 5. EMERGENCY RINGTONE OVERRIDE BUTTON (Fixed & Interactive) */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-50/50">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  ringtoneOverride ? 'bg-[#ffdad9] text-[#7a1521]' : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {ringtoneOverride ? 'volume_up' : 'volume_off'}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#241919]">{t.emergencyRingtone}</span>
                  {ringtoneOverride && (
                    <button
                      type="button"
                      onClick={handleTestChime}
                      className="text-[10px] text-[#7a1521] hover:underline font-bold bg-[#fff0ef] px-1.5 py-0.2 rounded border border-[#ffe9e8]"
                      title="Test Tone Sound"
                    >
                      Test Tone
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-[#574141]">{t.emergencyDesc}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span
                className={`text-[11px] font-bold ${
                  ringtoneOverride ? 'text-[#7a1521]' : 'text-neutral-500'
                }`}
              >
                {ringtoneOverride ? t.statusEnabled : t.statusDisabled}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={ringtoneOverride}
                onClick={toggleRingtoneOverride}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors relative flex items-center active:scale-95 ${
                  ringtoneOverride ? 'bg-[#7a1521]' : 'bg-[#5c5f61]'
                }`}
                title="Toggle Emergency Ringtone Override"
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform ${
                    ringtoneOverride ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 6. System Sync Logs */}
          <button
            onClick={() => onNavigateSubscreen('system_logs')}
            className="flex items-center justify-between p-3.5 hover:bg-[#fff0ef] transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#fff0ef] flex items-center justify-center shrink-0 text-[#7a1521]">
                <span className="material-symbols-outlined text-[20px]">history</span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#241919] truncate">{t.systemLogs}</span>
                <span className="text-[11px] text-[#574141] truncate">{t.systemLogsDesc}</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-[#8a7170] text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Control Room Emergency Support */}
      <div className="bg-white rounded-xl shadow-sm border border-[#debfbf]/40 p-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[#ffdad9] text-[#ba1a1a] flex items-center justify-center shrink-0 font-bold">
            <span className="material-symbols-outlined text-[20px]">sos</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-[#241919] truncate">{t.hotlineTitle}</span>
            <span className="text-[11px] text-[#ba1a1a] font-semibold truncate">
              +94 77 149 0016 • 24/7 Dispatch Hotline
            </span>
          </div>
        </div>
        <a
          href="tel:+94771490016"
          onClick={(e) => {
            e.preventDefault();
            initiateCall('Facilities Control Room (24/7 Hotline)');
          }}
          className="w-9 h-9 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shadow-sm shrink-0 hover:bg-[#93000a] active:scale-95 transition-transform cursor-pointer"
          title="Direct Call Hotline (+94 77 149 0016)"
        >
          <span className="material-symbols-outlined text-[18px]">call</span>
        </a>
      </div>

      {/* End Shift Button */}
      <div className="pt-1 flex flex-col gap-2 text-center">
        <button
          type="button"
          onClick={handleEndShift}
          className="w-full h-12 rounded-xl bg-[#f9e3e2] text-[#ba1a1a] hover:bg-[#ffdad6] active:scale-[0.99] transition-all flex items-center justify-center gap-2 font-bold text-sm"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span>{t.endShift}</span>
        </button>

        <p className="text-[11px] text-[#574141] mt-1">
          Serva Technician App v2.4.1 • ITUM Central Maintenance
        </p>
      </div>
    </div>
  );
};
