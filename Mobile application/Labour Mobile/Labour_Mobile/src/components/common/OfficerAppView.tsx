import React, { useState } from 'react';

interface OfficerAppViewProps {
  onLogout: () => void;
  onSwitchRole: () => void;
}

export const OfficerAppView: React.FC<OfficerAppViewProps> = ({
  onLogout,
  onSwitchRole,
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [officerPort, setOfficerPort] = useState<number>(8081);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const host = typeof window !== 'undefined' ? (window.location.hostname || 'localhost') : 'localhost';

  React.useEffect(() => {
    // Prefer port 8081 (Docker container) if running, else port 8082 (Metro dev)
    fetch(`http://${host}:8081`, { method: 'HEAD', mode: 'no-cors' })
      .then(() => setOfficerPort(8081))
      .catch(() => {
        fetch(`http://${host}:8082`, { method: 'HEAD', mode: 'no-cors' })
          .then(() => setOfficerPort(8082))
          .catch(() => setOfficerPort(8081));
      });

    // Listen for logout events dispatched from embedded Maintenance Officer application
    const handleMessage = (event: MessageEvent) => {
      if (event.data && (event.data.type === 'SERVA_REQUEST_LOGOUT' || event.data.type === 'SERVA_LOGOUT')) {
        setShowLogoutModal(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [host]);

  const officerUrl = `http://${host}:${officerPort}?embedded=true`;

  return (
    <div className="w-full h-full flex flex-col bg-[#f8fafc] text-[#1e293b] overflow-hidden relative">
      {/* Main Officer Screen Iframe */}
      <div className="flex-1 w-full relative bg-white overflow-hidden">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f8fafc] z-10 gap-2">
            <div className="w-8 h-8 rounded-full border-3 border-[#7a1521] border-t-transparent animate-spin" />
            <span className="text-xs font-bold text-[#1e293b]">Loading Maintenance Officer App...</span>
            <span className="text-[11px] text-[#64748b]">Syncing live dashboard & work orders</span>
          </div>
        )}

        <iframe
          src={officerUrl}
          title="Maintenance Officer Mobile Application"
          onLoad={() => setIframeLoaded(true)}
          className="w-full h-full border-0"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Center Screen Modal Pop-up (Logout Confirmation) */}
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
              Log Out
            </h3>

            <p className="text-xs text-[#64748b] mt-1.5 mb-5 leading-relaxed">
              Are you sure you want to log out of ITUM Serva Maintenance System?
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
                  onLogout();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs shadow-md shadow-red-500/25 transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
