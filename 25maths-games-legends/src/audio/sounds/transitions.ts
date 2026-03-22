// Transition stingers: short musical bridges between game states
import type { SoundFn } from '../engine';
import { playNoiseBurst, playTacticalPulse } from '../utils';

/** Battle Enter — Environment Shift (Subtle air pressure change) */
export const battleEnter: SoundFn = (ctx, time, dest) => {
  // Gentle sub-bass swell (very low volume)
  playTacticalPulse(ctx, dest, time, 40, 0.8, 0.05);
  
  // Soft high-pass "air" sweep
  playNoiseBurst(ctx, dest, time, 0.6, 1500, 'highpass', 0.015);
};

/** Battle Exit Win — Uplink Finalized (Minimalist UI pulse) */
export const battleExitWin: SoundFn = (ctx, time, dest) => {
  [660, 880].forEach((freq, i) => {
    const t = time + i * 0.1;
    playTacticalPulse(ctx, dest, t, freq, 0.2, 0.04);
  });
};

/** Battle Exit Lose — Link Dropped (Soft dissipation) */
export const battleExitLose: SoundFn = (ctx, time, dest) => {
  // Very soft noise fade
  playNoiseBurst(ctx, dest, time, 0.8, 400, 'lowpass', 0.02);
};


