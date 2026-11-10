import React from 'react';
import { Laptop, Smartphone, Monitor, MapPin, Globe, Shield, CheckCircle2, Trash2 } from 'lucide-react';

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

export interface SessionItemProps {
  session: SessionData;
  onRevoke: (id: string) => void;
}

export const SessionItem: React.FC<SessionItemProps> = ({ session, onRevoke }) => {
  const getDeviceIcon = () => {
    switch (session.deviceType) {
      case 'laptop':
        return <Laptop className="w-5 h-5" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'desktop':
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#E2E8F0] bg-white hover:border-[#CBD5E1] transition-all duration-200 shadow-2xs">
      <div className="flex items-start gap-3.5 flex-1 min-w-0">
        {/* Device Icon Avatar */}
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            session.isCurrent
              ? 'bg-[#7a1521]/10 text-[#7a1521] ring-1 ring-[#7a1521]/30'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {getDeviceIcon()}
        </div>

        {/* Details Column */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-[#0F172A] truncate">
              {session.deviceName}
            </h4>
            {session.isCurrent && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#047857] border border-[#a7f3d0]/60">
                <CheckCircle2 className="w-3 h-3" />
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

      {/* Action Area */}
      <div className="flex items-center justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {session.isCurrent ? (
          <span className="text-xs font-semibold text-[#7a1521] px-3 py-1.5 rounded-lg bg-[#7a1521]/5 border border-[#7a1521]/10">
            Current Device
          </span>
        ) : (
          <button
            type="button"
            onClick={() => onRevoke(session.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Revoke
          </button>
        )}
      </div>
    </div>
  );
};
