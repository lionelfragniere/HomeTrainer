// Simple audio generator using Web Audio API to avoid external assets
let audioCtx = null;

const getAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playBeep = (freq = 440, duration = 200, vol = 0.5) => {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(vol, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration / 1000);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration / 1000);
  } catch (e) {
    console.error('Audio playback failed', e);
  }
};

export const playCountdownBeep = () => playBeep(880, 150);
export const playStartBeep = () => playBeep(1760, 400);
export const playPauseBeep = () => playBeep(330, 300);
