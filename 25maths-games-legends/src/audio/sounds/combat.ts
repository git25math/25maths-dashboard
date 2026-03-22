// Combat sound effects: hp_loss, hp_critical, victory, defeat
import type { SoundFn } from '../engine';
import { playNoiseBurst, playWarDrum, playTacticalPulse, jitter } from '../utils';

/** HP Loss — Damped Impact (Subtle feedback) */
export const hpLoss: SoundFn = (ctx, time, dest) => {
  // Very soft low-freq thump
  playWarDrum(ctx, dest, time, 0.06, 0.3);
};

/** HP Critical Loop — Heartbeat (Submerged and steady) */
export function hpCriticalLoop(
  ctx: AudioContext, dest: AudioNode,
  schedule: (t: number) => void, addNode: (n: AudioScheduledSourceNode) => void,
): () => void {
  let isRunning = true;
  const interval = 1.0; // Slow, calm heartbeat (60 BPM) to keep player steady
  let nextTime = ctx.currentTime;

  function tick() {
    if (!isRunning) return;
    
    // Submerged heartbeat (very quiet)
    playWarDrum(ctx, dest, nextTime, 0.04, 0.4);

    nextTime += interval;
    const timer = window.setTimeout(tick, interval * 1000);
    schedule(timer);
  }

  tick();
  return () => { isRunning = false; };
}

/** Victory — Data Uplink Success (Subtle professional chime) */
export const victory: SoundFn = (ctx, time, dest) => {
  // Minimalist professional chime (A Major context)
  [440, 880].forEach((freq, i) => {
    const t = time + i * 0.1;
    playTacticalPulse(ctx, dest, t, freq, 0.4, 0.08);
  });
  // Soft data finish texture
  playNoiseBurst(ctx, dest, time, 0.6, 1200, 'bandpass', 0.015);
};

/** Partial Credit — Data Incomplete (Stuttering soft pulse) */
export const partialCredit: SoundFn = (ctx, time, dest) => {
  [0, 0.1].forEach(delay => {
    playTacticalPulse(ctx, dest, time + delay, 660, 0.08, 0.04);
  });
};

/** Defeat — Link Severed (Gentle signal dissipation) */
export const defeat: SoundFn = (ctx, time, dest) => {
  // Low hum fading out
  playTacticalPulse(ctx, dest, time, 110, 1.2, 0.06);
  // Soft static "air" release
  playNoiseBurst(ctx, dest, time, 1.5, jitter(800, 100), 'lowpass', 0.02);
};


