// Streak sound effects: streak_2, streak_3, streak_5, streak_break
import type { SoundFn } from '../engine';
import { playNoiseBurst, playTacticalPulse } from '../utils';

/** Streak 2 — Sync Level 1 (Subtle dual pulse) */
export const streak2: SoundFn = (ctx, time, dest) => {
  [440, 440].forEach((freq, i) => {
    playTacticalPulse(ctx, dest, time + i * 0.1, freq, 0.2, 0.05);
  });
};

/** Streak 3 — Sync Level 2 (Steady triple pulse) */
export const streak3: SoundFn = (ctx, time, dest) => {
  [440, 440, 440].forEach((freq, i) => {
    playTacticalPulse(ctx, dest, time + i * 0.08, freq, 0.2, 0.04);
  });
};

/** Streak 5 — Maximum Sync (Atmospheric layer lock) */
export const streak5: SoundFn = (ctx, time, dest) => {
  // Constant low-freq pulse + very soft high-freq sparkle
  playTacticalPulse(ctx, dest, time, 440, 0.6, 0.06);
  playTacticalPulse(ctx, dest, time + 0.1, 880, 0.3, 0.03);
  // Quiet data-stream texture
  playNoiseBurst(ctx, dest, time, 0.5, 1200, 'bandpass', 0.015);
};

/** Streak Break — Signal Dropped (Gentle frequency tilt) */
export const streakBreak: SoundFn = (ctx, time, dest) => {
  // Soft signal fade-out
  playTacticalPulse(ctx, dest, time, 220, 0.4, 0.06);
  // Quiet "air" dissipation
  playNoiseBurst(ctx, dest, time, 0.3, 400, 'lowpass', 0.03);
};


