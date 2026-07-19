/**
 * Tiny Web Audio keypress click — no audio assets, generated on the fly.
 * Lazily creates a single AudioContext on first use.
 */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as never as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

export function playClick(): void {
  const audio = getContext();
  if (!audio) return;
  if (audio.state === 'suspended') void audio.resume();

  const now = audio.currentTime;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = 'square';
  osc.frequency.setValueAtTime(620, now);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(now + 0.07);
}
