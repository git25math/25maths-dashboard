// Core sound effects: tap, submit, correct, wrong
import type { SoundFn } from '../engine';
import { playNoiseBurst, playTacticalPulse, jitter, rand } from '../utils';

/** Tap — Soft Physical Click (Damped mechanical feel) */
export const tap: SoundFn = (ctx, time, dest) => {
  const vol = rand(0.08) + 0.05;
  // Mid-range pulse (warm)
  playTacticalPulse(ctx, dest, time, 600, 0.04, vol);
  // Damped high-freq friction
  playNoiseBurst(ctx, dest, time, 0.006, 2000, 'bandpass', vol * 0.5);
};

/** Submit — Warm Confirm (Deep electronic pulse) */
export const submit: SoundFn = (ctx, time, dest) => {
  // Deep confirm base
  playTacticalPulse(ctx, dest, time, 220, 0.15, 0.12);
  // Harmonic subtle layer
  playTacticalPulse(ctx, dest, time, 440, 0.08, 0.04);
  // Soft mechanical click
  playNoiseBurst(ctx, dest, time, 0.01, 800, 'lowpass', 0.06);
};

/** Correct — Intel Sync (Warm rising chords) */
export const correct: SoundFn = (ctx, time, dest) => {
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
  notes.forEach((freq, i) => {
    const t = time + i * 0.06;
    playTacticalPulse(ctx, dest, t, freq, 0.3, 0.06);
  });
  // Soft atmospheric shimmer (lowered freq)
  playNoiseBurst(ctx, dest, time, 0.4, 1500, 'bandpass', 0.02);
};

/** Wrong — System Alert (Soft low-freq warning) */
export const wrong: SoundFn = (ctx, time, dest) => {
  const freq = 110; // A2
  // Low hum pulse
  playTacticalPulse(ctx, dest, time, freq, 0.4, 0.1);
  // Subtle resonance at minor 2nd
  playTacticalPulse(ctx, dest, time, freq * 1.06, 0.3, 0.04);
  // Muffled radio static
  playNoiseBurst(ctx, dest, time, 0.2, 400, 'lowpass', 0.03);
};


