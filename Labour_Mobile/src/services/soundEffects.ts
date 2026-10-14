// Audio Synthesizer for Call Actions & Ringtone

export const playEmergencyChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // First tone (880 Hz - High A)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.18);

    // Second tone (1318.51 Hz - High E)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.38);
  } catch (e) {
    console.warn('AudioContext error', e);
  }
};

// Play realistic phone dial tone / outgoing ringing cadence
export const playOutgoingRingAudio = (): (() => void) => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return () => {};

    const ctx = new AudioContextClass();
    let isStopped = false;

    const playRingCycle = () => {
      if (isStopped) return;
      
      const now = ctx.currentTime;
      // Dual tone (400Hz + 450Hz standard supervisory ringing)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(400, now);
      osc2.frequency.setValueAtTime(450, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.setValueAtTime(0.08, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);

      // Second burst (UK/Sri Lanka double ring: ring-ring ... pause)
      const now2 = now + 0.6;
      const osc3 = ctx.createOscillator();
      const osc4 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc3.frequency.setValueAtTime(400, now2);
      osc4.frequency.setValueAtTime(450, now2);
      gain2.gain.setValueAtTime(0.08, now2);
      gain2.gain.setValueAtTime(0.08, now2 + 0.4);
      gain2.gain.exponentialRampToValueAtTime(0.001, now2 + 0.45);

      osc3.connect(gain2);
      osc4.connect(gain2);
      gain2.connect(ctx.destination);

      osc3.start(now2);
      osc4.start(now2);
      osc3.stop(now2 + 0.45);
      osc4.stop(now2 + 0.45);
    };

    playRingCycle();
    const interval = setInterval(() => {
      if (!isStopped) playRingCycle();
    }, 2800);

    return () => {
      isStopped = true;
      clearInterval(interval);
      try {
        ctx.close();
      } catch (e) {}
    };
  } catch (e) {
    return () => {};
  }
};

// Play short call-end beep
export const playCallEndTone = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(480, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
};
