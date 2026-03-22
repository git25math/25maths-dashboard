// Audio utility functions: Tactical Synthesis, Noise, Percussion, Foley
// Style: Modern Tactical / Immersive Minimalist (Non-fatiguing)

export const rand = (min: number) => Math.random() * min;
export const jitter = (center: number, range: number) => center + (Math.random() - 0.5) * 2 * range;
export const randCents = (cents: number) => (Math.random() - 0.5) * 2 * cents;

// --- Noise Buffer Pool ---
const NOISE_POOL_SIZE = 3;
const noisePoolCache = new WeakMap<AudioContext, AudioBuffer[]>();

export function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  let pool = noisePoolCache.get(ctx);
  if (!pool) {
    pool = [];
    const sr = ctx.sampleRate;
    for (let p = 0; p < NOISE_POOL_SIZE; p++) {
      const buf = ctx.createBuffer(1, sr, sr);
      const data = buf.getChannelData(0);
      for (let i = 0; i < sr; i++) data[i] = Math.random() * 2 - 1;
      pool.push(buf);
    }
    noisePoolCache.set(ctx, pool);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

// --- Percussion: Warm Damped Burst (Non-piercing) ---
export function playNoiseBurst(
  ctx: AudioContext, dest: AudioNode, time: number,
  duration: number, filterFreq: number, filterType: BiquadFilterType = 'lowpass',
  gain = 0.1,
): void {
  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx);
  const offset = Math.random() * (ctx.sampleRate - duration * ctx.sampleRate) / ctx.sampleRate;
  
  const filter = ctx.createBiquadFilter();
  filter.type = filterType;
  // Cap high frequencies to prevent ear fatigue
  filter.frequency.value = Math.min(3500, jitter(filterFreq, filterFreq * 0.05));
  filter.Q.value = 0.5; // Smooth Q
  
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.005); // Smooth attack
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  src.connect(filter).connect(g).connect(dest);
  src.start(time, offset);
  src.stop(time + duration);
}

// --- Tactical Pulse (Warm UI/HUD) ---
export function playTacticalPulse(
  ctx: AudioContext, dest: AudioNode, time: number,
  freq: number, duration: number, gain: number,
): void {
  const osc = ctx.createOscillator();
  osc.type = 'sine'; // Use pure sine for no harsh harmonics
  osc.frequency.setValueAtTime(freq, time);
  
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.01); // 10ms soft attack
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  // Warm Low-pass filter to keep it "submerged"
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = freq * 1.5;

  osc.connect(lp).connect(g).connect(dest);
  osc.start(time);
  osc.stop(time + duration + 0.01);
}

// --- Heartbeat Drum (Atmospheric Kick) ---
export function playWarDrum(
  ctx: AudioContext, dest: AudioNode, time: number,
  gain: number, duration = 0.4,
): void {
  const pitchMult = 0.98 + Math.random() * 0.04;
  const g0 = gain * 0.8;

  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(60 * pitchMult, time);
  sub.frequency.exponentialRampToValueAtTime(40 * pitchMult, time + duration * 0.5);
  
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(g0, time + 0.02); // Thumpy but soft attack
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);
  
  sub.connect(g).connect(dest);
  sub.start(time);
  sub.stop(time + duration);
}

// --- Atmospheric Glitch (Subtle Texture) ---
export function playGlitch(
  ctx: AudioContext, dest: AudioNode, time: number,
  duration: number, gain: number,
): void {
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(jitter(800, 200), time);
  filter.Q.value = 5;

  const src = ctx.createBufferSource();
  src.buffer = createNoiseBuffer(ctx);
  
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, time);
  g.gain.linearRampToValueAtTime(gain, time + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, time + duration);

  src.connect(filter).connect(g).connect(dest);
  src.start(time);
  src.stop(time + duration);
}

// --- Saturation: Soft & Warm ---
let saturationCurve: Float32Array | null = null;
export function createHornShaper(ctx: AudioContext): WaveShaperNode {
  if (!saturationCurve) {
    saturationCurve = new Float32Array(257);
    for (let i = 0; i < 257; i++) {
      const x = (i - 128) / 128;
      // Soft sigmoid for warmth without harsh clipping
      saturationCurve[i] = (2 / (1 + Math.exp(-x * 2))) - 1;
    }
  }
  const shaper = ctx.createWaveShaper();
  shaper.curve = saturationCurve;
  return shaper;
}

export function createPan(ctx: AudioContext, pan: number): StereoPannerNode {
  const p = ctx.createStereoPanner();
  p.pan.value = Math.max(-1, Math.min(1, pan));
  return p;
}


