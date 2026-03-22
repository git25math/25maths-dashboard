// Skill sound effects: shield_on, shield_block, double_on, reveal
import type { SoundFn } from '../engine';
import { playNoiseBurst, rand } from '../utils';

/** Shield On — Tactical Energy Shield (Digital activation hum) */
export const shieldOn: SoundFn = (ctx, time, dest) => {
  // Rising pulse
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, time);
  osc.frequency.exponentialRampToValueAtTime(880, time + 0.3);
  
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.08, time + 0.05);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
  
  osc.connect(g).connect(dest);
  osc.start(time);
  osc.stop(time + 0.61);

  // High-freq shimmer
  playNoiseBurst(ctx, dest, time, 0.4, 3000, 'highpass', 0.02);
};

/** Shield Block — Mechanical Deflect (Metal-on-metal impact) */
export const shieldBlock: SoundFn = (ctx, time, dest) => {
  // Low-frequency body impact
  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.value = rand(180, 220);
  const bg = ctx.createGain();
  bg.gain.setValueAtTime(0.1, time);
  bg.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
  body.connect(bg).connect(dest);
  body.start(time);
  body.stop(time + 0.12);

  // High metallic ring
  [2500, 3200, 4100].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = ctx.createGain();
    const amp = 0.08 / (1 + i * 0.5);
    g.gain.setValueAtTime(amp, time);
    g.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(g).connect(dest);
    osc.start(time);
    osc.stop(time + 0.2);
  });

  playNoiseBurst(ctx, dest, time, 0.015, 5000, 'highpass', 0.1);
};

/** Double On — System Overclock (Cybernetic chirp) */
export const doubleOn: SoundFn = (ctx, time, dest) => {
  const t = time;
  [1200, 1500, 1800].forEach((freq, i) => {
    const st = t + i * 0.04;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, st);
    
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2000;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.04, st);
    g.gain.exponentialRampToValueAtTime(0.001, st + 0.08);
    
    osc.connect(lp).connect(g).connect(dest);
    osc.start(st);
    osc.stop(st + 0.1);
  });
};

/** Reveal — Tactical Scan (High-freq UI sweep) */
export const reveal: SoundFn = (ctx, time, dest) => {
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, time);
  osc.frequency.exponentialRampToValueAtTime(4000, time + 0.4);
  
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(0.05, time + 0.1);
  g.gain.exponentialRampToValueAtTime(0.001, time + 0.45);
  
  osc.connect(g).connect(dest);
  osc.start(time);
  osc.stop(time + 0.46);

  // Sweep noise
  playNoiseBurst(ctx, dest, time, 0.4, 2500, 'bandpass', 0.03);
};

