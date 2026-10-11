import React, { useState, useEffect, useRef } from 'react';
import { CallDetails } from '../../services/callService';
import { playOutgoingRingAudio, playCallEndTone } from '../../services/soundEffects';

interface CallDialogModalProps {
  isOpen: boolean;
  callDetails: CallDetails | null;
  onClose: () => void;
}

export const CallDialogModal: React.FC<CallDialogModalProps> = ({
  isOpen,
  callDetails,
  onClose,
}) => {
  const [callState, setCallState] = useState<'calling' | 'ringing' | 'connected' | 'ended'>('calling');
  const [seconds, setSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState(false);

  const stopRingRef = useRef<(() => void) | null>(null);

  const phoneNumber = callDetails?.phoneNumber || '+94 77 149 0016';
  const recipient = callDetails?.recipientTitle || 'Facilities Dispatch Desk';

  useEffect(() => {
    if (!isOpen) {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
      setCallState('calling');
      setSeconds(0);
      setIsMuted(false);
      setIsSpeaker(false);
      setIsKeypadOpen(false);
      return;
    }

    // Start outgoing ring sound
    stopRingRef.current = playOutgoingRingAudio();

    // Stage 1: Calling -> Ringing (after 1.2s)
    const t1 = setTimeout(() => {
      setCallState('ringing');
    }, 1200);

    // Stage 2: Ringing -> Connected (after 3.5s)
    const t2 = setTimeout(() => {
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
      setCallState('connected');
    }, 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      if (stopRingRef.current) {
        stopRingRef.current();
        stopRingRef.current = null;
      }
    };
  }, [isOpen]);

  // Connected call timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isOpen && callState === 'connected') {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, callState]);

  const handleEndCall = () => {
    if (stopRingRef.current) {
      stopRingRef.current();
      stopRingRef.current = null;
    }
    playCallEndTone();
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(phoneNumber);
    setCopiedNumber(true);
    setTimeout(() => setCopiedNumber(false), 2000);
  };

  const handleNativeDial = () => {
    window.location.href = `tel:${phoneNumber.replace(/\s+/g, '')}`;
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      <div className="w-full max-w-sm rounded-[32px] overflow-hidden bg-gradient-to-b from-[#1c1214] via-[#241317] to-[#12080a] text-white shadow-2xl border border-white/10 flex flex-col items-center p-6 text-center relative animate-in zoom-in-95 duration-200">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between w-full text-xs text-white/60 mb-6">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white/80">ITUM Secure Telephony</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="text-[11px] font-bold text-[#ffb3b2] hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full transition-colors"
            title="Copy Number"
          >
            <span className="material-symbols-outlined text-[13px]">
              {copiedNumber ? 'check' : 'content_copy'}
            </span>
            <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Pulsing Avatar Ripple */}
        <div className="relative mb-5 flex items-center justify-center">
          {callState !== 'ended' && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-[#ba1a1a]/20 animate-ping pointer-events-none" />
              <div className="absolute w-24 h-24 rounded-full bg-[#ba1a1a]/30 animate-pulse pointer-events-none" />
            </>
          )}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#7a1521] to-[#ba1a1a] flex items-center justify-center shadow-lg border-2 border-white/20 relative z-10">
            <span className="material-symbols-outlined text-[36px] text-white">
              {callState === 'connected' ? 'support_agent' : 'call'}
            </span>
          </div>
        </div>

        {/* Contact Name & Department */}
        <h2 className="text-lg font-bold text-white tracking-tight leading-snug px-2">
          {recipient}
        </h2>
        <p className="text-xs text-white/70 mt-0.5 font-medium">
          ITUM Central Maintenance Hotline
        </p>

        {/* Phone Number Display */}
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 shadow-inner">
          <span className="material-symbols-outlined text-[#ffb3b2] text-[15px]">call</span>
          <span className="font-mono text-sm font-bold tracking-wider text-white">
            {phoneNumber}
          </span>
        </div>

        {/* Dynamic Call State & Timer */}
        <div className="mt-4 mb-6">
          {callState === 'calling' ? (
            <span className="text-xs font-semibold text-white/80 animate-pulse flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
              <span>Connecting to dispatcher...</span>
            </span>
          ) : callState === 'ringing' ? (
            <span className="text-xs font-bold text-amber-300 animate-pulse flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">ring_volume</span>
              <span>Ringing {phoneNumber}...</span>
            </span>
          ) : callState === 'connected' ? (
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Call Connected</span>
              </span>
              <span className="font-mono text-xl font-bold tracking-widest text-white">
                {formatTimer(seconds)}
              </span>
            </div>
          ) : (
            <span className="text-xs font-bold text-rose-400">Call Ended</span>
          )}
        </div>

        {/* In-Call Actions (Mute, Keypad, Speaker) */}
        <div className="grid grid-cols-3 gap-3 w-full mb-6">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-white text-[#241919] border-white font-bold'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isMuted ? 'mic_off' : 'mic'}
            </span>
            <span className="text-[10px] font-semibold">{isMuted ? 'Muted' : 'Mute'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsKeypadOpen(!isKeypadOpen)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl border transition-all ${
              isKeypadOpen
                ? 'bg-white text-[#241919] border-white font-bold'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dialpad</span>
            <span className="text-[10px] font-semibold">Keypad</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-2xl border transition-all ${
              isSpeaker
                ? 'bg-white text-[#241919] border-white font-bold'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSpeaker ? 'volume_up' : 'volume_down'}
            </span>
            <span className="text-[10px] font-semibold">{isSpeaker ? 'Speaker On' : 'Speaker'}</span>
          </button>
        </div>

        {/* Interactive Keypad Drawer */}
        {isKeypadOpen && (
          <div className="w-full bg-black/40 rounded-2xl p-2.5 mb-4 grid grid-cols-3 gap-1.5 text-sm font-bold border border-white/10 animate-in fade-in duration-150">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  try {
                    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.frequency.setValueAtTime(697, ctx.currentTime);
                    gain.gain.setValueAtTime(0.1, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.1);
                  } catch (e) {}
                }}
                className="py-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all font-mono"
              >
                {k}
              </button>
            ))}
          </div>
        )}

        {/* Primary Call Action Buttons */}
        <div className="flex items-center justify-center gap-4 w-full">
          {/* Dial in Native Phone App Button */}
          <button
            type="button"
            onClick={handleNativeDial}
            className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-90 text-white flex items-center justify-center shadow-lg transition-transform"
            title="Open in System Phone Dialer (tel:)"
          >
            <span className="material-symbols-outlined text-[22px]">phone_forwarded</span>
          </button>

          {/* End Call Button */}
          <button
            type="button"
            onClick={handleEndCall}
            className="w-16 h-16 rounded-full bg-[#ba1a1a] hover:bg-[#93000a] active:scale-90 text-white flex items-center justify-center shadow-2xl transition-transform ring-4 ring-[#ba1a1a]/30"
            title="End Call"
          >
            <span className="material-symbols-outlined text-[32px]">call_end</span>
          </button>
        </div>

        <p className="text-[10px] text-white/50 mt-4">
          Tap red button to end call • Tap green button to launch phone app
        </p>
      </div>
    </div>
  );
};
