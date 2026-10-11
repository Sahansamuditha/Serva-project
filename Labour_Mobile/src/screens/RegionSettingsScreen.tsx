import React, { useState } from 'react';
import { CampusZone } from '../types';
import { LanguageCode, getTranslation } from '../services/i18n';

interface RegionSettingsScreenProps {
  campusZones: CampusZone[];
  currentLanguage?: LanguageCode;
  onUpdateLanguage?: (lang: LanguageCode) => void;
  onBack: () => void;
  onToggleZoneCache: (zoneId: string) => void;
}

export const RegionSettingsScreen: React.FC<RegionSettingsScreenProps> = ({
  campusZones,
  currentLanguage = 'en',
  onUpdateLanguage,
  onBack,
  onToggleZoneCache,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(currentLanguage);
  const [zones, setZones] = useState<CampusZone[]>(campusZones);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const t = getTranslation(selectedLanguage);

  const toggleOfflineCache = (id: string) => {
    setZones((prev) =>
      prev.map((z) => (z.id === id ? { ...z, isCachedOffline: !z.isCachedOffline } : z))
    );
    onToggleZoneCache(id);
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setSelectedLanguage(lang);
    if (onUpdateLanguage) {
      onUpdateLanguage(lang);
    }
  };

  const handleSave = () => {
    if (onUpdateLanguage) {
      onUpdateLanguage(selectedLanguage);
    }
    setSaveSuccess(true);
    setTimeout(() => {
      onBack();
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-4 pb-24 max-w-md mx-auto">
      {/* Navigation Subheader */}
      <div className="flex items-center gap-2.5 bg-white p-3 rounded-xl border border-[#debfbf]/40 shadow-sm">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#574141] hover:bg-[#fff0ef] transition-colors"
          title="Back to Profile"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back</span>
        </button>
        <div className="w-8 h-8 rounded-lg bg-[#7a1521] text-white flex items-center justify-center font-bold text-xs shrink-0">
          <span className="material-symbols-outlined text-[18px]">pin_drop</span>
        </div>
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#7a1521]">
            ITUM • SERVA
          </span>
          <h1 className="text-[17px] font-bold text-[#241919] truncate">
            {t.regionTitle}
          </h1>
        </div>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span>{t.savedSuccess}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="p-3.5 rounded-xl bg-[#fff0ef] border border-[#ffe9e8] flex items-start gap-2.5">
        <span className="material-symbols-outlined text-[#7a1521] text-[20px] shrink-0 mt-0.5">
          info
        </span>
        <p className="text-xs text-[#574141] leading-relaxed">
          {t.regionDesc}
        </p>
      </div>

      {/* Section 1: Assigned Campus Zones & Offline Sync */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#574141]">
            {t.assignedSectors}
          </span>
          <span className="text-[11px] font-bold text-[#7a1521] bg-[#ffdad9] px-2 py-0.5 rounded-full">
            {zones.filter((z) => z.isCachedOffline).length} Offline Cached
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#debfbf]/40 overflow-hidden divide-y divide-[#ffe9e8]">
          {zones.map((zone) => (
            <div key={zone.id} className="p-3.5 flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#241919] truncate">{zone.name}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      zone.status === 'Active Assignment'
                        ? 'bg-[#ffdad9] text-[#410009]'
                        : 'bg-[#e0e3e5] text-[#626567]'
                    }`}
                  >
                    {zone.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#574141] mt-0.5">
                  {zone.buildingsCount} Buildings • {zone.activeTickets} Active Work Orders
                </p>
              </div>

              {/* Cache Toggle */}
              <button
                type="button"
                onClick={() => toggleOfflineCache(zone.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all active:scale-95 ${
                  zone.isCachedOffline
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-[#fff0ef] text-[#574141] border border-[#debfbf]'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {zone.isCachedOffline ? 'cloud_done' : 'cloud_download'}
                </span>
                <span>{zone.isCachedOffline ? 'Cached' : 'Cache Offline'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Display Language Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#574141]">
            {t.displayLanguage}
          </span>
          <span className="text-[10px] font-bold text-[#7a1521] uppercase">
            Active: {selectedLanguage.toUpperCase()}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#debfbf]/40 overflow-hidden divide-y divide-[#ffe9e8]">
          {/* English Option */}
          <label
            onClick={() => handleLanguageChange('en')}
            className={`flex items-start justify-between p-3.5 cursor-pointer transition-colors ${
              selectedLanguage === 'en' ? 'bg-[#fff0ef]' : 'hover:bg-[#fff0ef]/50'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  selectedLanguage === 'en'
                    ? 'bg-[#7a1521] text-white shadow-xs'
                    : 'bg-[#ffdad9] text-[#7a1521]'
                }`}
              >
                EN
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#241919]">English (UK / LK)</span>
                <span className="text-[11px] text-[#574141]">
                  Official institutional documentation language
                </span>
              </div>
            </div>
            <input
              type="radio"
              name="lang"
              checked={selectedLanguage === 'en'}
              onChange={() => handleLanguageChange('en')}
              className="mt-1 accent-[#7a1521] w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Sinhala Option */}
          <label
            onClick={() => handleLanguageChange('si')}
            className={`flex items-start justify-between p-3.5 cursor-pointer transition-colors ${
              selectedLanguage === 'si' ? 'bg-[#fff0ef]' : 'hover:bg-[#fff0ef]/50'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  selectedLanguage === 'si'
                    ? 'bg-[#7a1521] text-white shadow-xs'
                    : 'bg-[#ffdad9] text-[#7a1521]'
                }`}
              >
                සිං
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#241919]">Sinhala (සිංහල)</span>
                <span className="text-[11px] text-[#574141]">
                  සම්පූර්ණ පරිවර්තනය සහ දේශීයකරණය
                </span>
              </div>
            </div>
            <input
              type="radio"
              name="lang"
              checked={selectedLanguage === 'si'}
              onChange={() => handleLanguageChange('si')}
              className="mt-1 accent-[#7a1521] w-4 h-4 cursor-pointer"
            />
          </label>

          {/* Tamil Option */}
          <label
            onClick={() => handleLanguageChange('ta')}
            className={`flex items-start justify-between p-3.5 cursor-pointer transition-colors ${
              selectedLanguage === 'ta' ? 'bg-[#fff0ef]' : 'hover:bg-[#fff0ef]/50'
            }`}
          >
            <div className="flex items-start gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                  selectedLanguage === 'ta'
                    ? 'bg-[#7a1521] text-white shadow-xs'
                    : 'bg-[#ffdad9] text-[#7a1521]'
                }`}
              >
                த
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#241919]">Tamil (தமிழ்)</span>
                <span className="text-[11px] text-[#574141]">
                  முழுமையான இடைமுக மொழிபெயர்ப்பு
                </span>
              </div>
            </div>
            <input
              type="radio"
              name="lang"
              checked={selectedLanguage === 'ta'}
              onChange={() => handleLanguageChange('ta')}
              className="mt-1 accent-[#7a1521] w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Save Action */}
      <button
        type="button"
        onClick={handleSave}
        className="w-full h-12 rounded-xl bg-[#7a1521] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#58000f] active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">save</span>
        <span>{t.savePreferences}</span>
      </button>
    </div>
  );
};
