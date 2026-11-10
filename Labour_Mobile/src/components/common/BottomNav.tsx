import React from 'react';
import { LanguageCode, getTranslation } from '../../services/i18n';

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  unreadAlertsCount: number;
  language?: LanguageCode;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  unreadAlertsCount,
  language = 'en',
}) => {
  const t = getTranslation(language);
  const tabs = [
    { id: 'jobs', label: t.navJobs, icon: 'assignment' },
    { id: 'alerts', label: t.navAlerts, icon: 'warning', badge: unreadAlertsCount },
    { id: 'history', label: t.navHistory, icon: 'schedule' },
    { id: 'profile', label: t.navProfile, icon: 'person' },
  ];

  return (
    <nav className="absolute bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#ffe9e8] flex flex-col items-center shadow-[0_-4px_16px_rgba(122,21,33,0.06)]">
      <div className="flex justify-around items-center h-14 px-2 w-full">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[60px] h-12 transition-colors ${
                isActive ? 'text-[#7a1521] font-bold' : 'text-[#574141] hover:text-[#241919]'
              }`}
            >
              <div className="relative">
                <span
                  className={`material-symbols-outlined text-[24px] ${
                    isActive ? 'fill-icon' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                {Boolean(tab.badge && tab.badge > 0) && (
                  <span className="absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#ba1a1a] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium leading-tight">
                {tab.label}
              </span>
              {isActive && (
                <span className="w-5 h-0.5 bg-[#7a1521] rounded-full absolute bottom-0.5" />
              )}
            </button>
          );
        })}
      </div>

      {/* iOS Mobile Home Indicator */}
      <div className="w-full pb-1.5 pt-0.5 flex justify-center">
        <div className="w-32 h-1 bg-[#241919]/40 rounded-full" />
      </div>
    </nav>
  );
};

