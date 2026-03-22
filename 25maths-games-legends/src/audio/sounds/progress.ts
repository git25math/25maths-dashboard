// Progress sound effects: tier_up, tier_down, phase_advance, badge_unlock
import type { SoundFn } from '../engine';
import { playWarDrum, playNoiseBurst, createHornShaper } from '../utils';

/** Tier Up — Rank Up (Heroic synth stabs) */
export const tierUp: SoundFn = (ctx, time, dest) => {
  const shaper = createHornShaper(ctx);
  shaper.connect(dest);

  [440, 554.37, 659.25].forEach((freq, i) => { // A Major triad
    const t = time + i * 0.1;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1500;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    
    osc.connect(lp).connect(g).connect(shaper);
    osc.start(t);
    osc.stop(t + 0.31);
  });
};

/** Tier Down — Rank Lost (Descending dark tone) */
export const tierDown: SoundFn = (ctx, time, dest) => {
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(220, time);
  osc.frequency.exponentialRampToValueAtTime(110, time + 0.3);
  
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 600;

  const g = ctx.createGain();
  g.gain.setValueAtTime(0.1, time);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
  
  osc.connect(lp).connect(g).connect(dest);
  osc.start(time);
  osc.stop(time + 0.41);
};

/** Phase Advance — Objective Complete (Digital confirm sequence) */
export const phaseAdvance: SoundFn = (ctx, time, dest) => {
  [440, 880].forEach((freq, i) => {
    const t = time + i * 0.15;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + 0.11);
  });
  playWarDrum(ctx, dest, time + 0.15, 0.1, 0.3);
};

/** Badge Unlock — Award Received (Cybernetic shimmer + solid confirm) */
export const badgeUnlock: SoundFn = (ctx, time, dest) => {
  // Solid confirm base
  playWarDrum(ctx, dest, time, 0.15, 0.5);
  
  // Cybernetic shimmer
  for (let i = 0; i < 8; i++) {
    const t = time + i * 0.04;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000 + i * 400, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.02, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(g).connect(dest);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  // Bright noise shimmer
  playNoiseBurst(ctx, dest, time, 0.6, 4000, 'highpass', 0.03);
};

