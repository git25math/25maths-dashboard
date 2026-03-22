// SoundEngine — AudioContext + reverb + EQ + limiter + crossfade + ducking

export type SoundFn = (ctx: AudioContext, time: number, dest: AudioNode) => void;
export type SoundCategory = 'sfx' | 'music';

// --- Centralized mix levels ---
const MIX = {
  master: 1.0,
  sfx: 0.7,
  music: 0.18,
  reverbSend: 0.18,
  crossfadeSec: 0.8,
  duckAmount: 0.25,
  duckAttack: 0.05,
  duckRelease: 0.6,
};

/** Procedural reverb IR: palace courtyard with frequency-dependent absorption */
function createReverbIR(ctx: AudioContext): AudioBuffer {
  const sr = ctx.sampleRate;
  const duration = 1.4;
  const preDelaySamples = Math.floor(sr * 0.012);
  const len = Math.floor(sr * duration) + preDelaySamples;
  const buf = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < preDelaySamples; i++) data[i] = 0;
    let lpState = 0;
    for (let i = preDelaySamples; i < len; i++) {
      const t = (i - preDelaySamples) / sr;
      const earlyDecay = Math.exp(-t * 8) * 0.55;
      const lateDecay = Math.exp(-t * 2.2) * 0.45;
      const envelope = earlyDecay + lateDecay;
      const noise = Math.random() * 2 - 1;
      const lpCoeff = 0.3 + 0.65 * Math.min(1, t / duration);
      lpState = lpState * lpCoeff + noise * (1 - lpCoeff);
      data[i] = lpState * envelope;
    }
  }
  return buf;
}

class SoundEngine {
  private static instance: SoundEngine | null = null;

  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private sfxGain!: GainNode;
  private musicGain!: GainNode;
  private compressor!: DynamicsCompressorNode;
  private limiter!: DynamicsCompressorNode;
  private convolver!: ConvolverNode;
  private reverbSend!: GainNode;
  private sfxEQ!: BiquadFilterNode;
  private musicEQ!: BiquadFilterNode;

  private _muted = false;
  private _resumed = false; // Track whether context has been successfully resumed

  // BGM lifecycle
  private bgmTimers: number[] = [];
  private bgmNodes: AudioScheduledSourceNode[] = [];
  private fadingOutNodes: AudioScheduledSourceNode[] = [];
  private fadingOutTimers: number[] = [];
  // Pending BGM to start after context resumes
  private pendingBGM: ((ctx: AudioContext, musicDest: AudioNode, sfxDest: AudioNode, schedule: (timer: number) => void, addNode: (n: AudioScheduledSourceNode) => void) => void) | null = null;

  private constructor() {}

  static getInstance(): SoundEngine {
    if (!SoundEngine.instance) SoundEngine.instance = new SoundEngine();
    return SoundEngine.instance;
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.buildGraph();
    }
    if (this.ctx.state === 'suspended') {
      // resume() returns Promise — handle it to detect when context is actually running
      this.ctx.resume().then(() => {
        if (!this._resumed) {
          this._resumed = true;
          this.onContextResumed();
        }
      });
    } else if (!this._resumed) {
      this._resumed = true;
    }
    return this.ctx;
  }

  /** Called once when AudioContext transitions from suspended → running */
  private onContextResumed(): void {
    // If BGM was requested while suspended, start it now cleanly
    if (this.pendingBGM) {
      const fn = this.pendingBGM;
      this.pendingBGM = null;
      // Clean slate: stop any nodes that were scheduled at time ~0
      this.stopBGM();
      this.startBGMInternal(fn, false);
    }
  }

  private buildGraph(): void {
    const ctx = this.ctx!;

    // Limiter → destination
    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -1;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.05;
    this.limiter.connect(ctx.destination);

    // Compressor → limiter
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -15;
    this.compressor.ratio.value = 3;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    this.compressor.connect(this.limiter);

    // Master gain → compressor
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = MIX.master;
    this.masterGain.connect(this.compressor);

    // Reverb
    this.convolver = ctx.createConvolver();
    this.convolver.buffer = createReverbIR(ctx);
    this.reverbSend = ctx.createGain();
    this.reverbSend.gain.value = MIX.reverbSend;
    this.reverbSend.connect(this.convolver);
    this.convolver.connect(this.masterGain);

    // --- Master Saturation Layer (The "Hardware" feel) ---
    const saturator = ctx.createWaveShaper();
    const curve = new Float32Array(257);
    for (let i = 0; i < 257; i++) {
      const x = (i - 128) / 128;
      curve[i] = Math.tanh(x * 1.5); // Soft saturation
    }
    saturator.curve = curve;

    // Master path: masterGain -> saturator -> compressor -> limiter
    this.masterGain.disconnect();
    this.masterGain.connect(saturator);
    saturator.connect(this.compressor);

    // Stereo early reflections
    [
      { ms: 11, gain: 0.05, pan: -0.4 },
      { ms: 23, gain: 0.04, pan: 0.1 },
      { ms: 37, gain: 0.03, pan: 0.35 },
    ].forEach(({ ms, gain: g, pan }) => {
      const d = ctx.createDelay(ms / 1000 + 0.001);
      d.delayTime.value = ms / 1000;
      const erGain = ctx.createGain();
      erGain.gain.value = g;
      const erPan = ctx.createStereoPanner();
      erPan.pan.value = pan;
      this.reverbSend.connect(d).connect(erGain).connect(erPan).connect(this.masterGain);
    });

    // SFX bus: HP 80Hz → master + reverb send
    this.sfxEQ = ctx.createBiquadFilter();
    this.sfxEQ.type = 'highpass';
    this.sfxEQ.frequency.value = 80;
    this.sfxEQ.Q.value = 0.7;
    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.value = MIX.sfx;
    this.sfxGain.connect(this.sfxEQ);
    this.sfxEQ.connect(this.masterGain);
    this.sfxEQ.connect(this.reverbSend);

    // Music bus: mid scoop → master
    this.musicEQ = ctx.createBiquadFilter();
    this.musicEQ.type = 'peaking';
    this.musicEQ.frequency.value = 800;
    this.musicEQ.gain.value = -2;
    this.musicEQ.Q.value = 1.0;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = MIX.music;
    this.musicGain.connect(this.musicEQ);
    this.musicEQ.connect(this.masterGain);

    // Create a very quiet procedural ambient air layer
    this.startAmbientAir(ctx);
  }

  private startAmbientAir(ctx: AudioContext): void {
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(1, sr * 2, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < sr * 2; i++) data[i] = Math.random() * 2 - 1;
    
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 400;

    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 100;

    const g = ctx.createGain();
    g.gain.value = 0.008; // Extremely quiet but present

    src.connect(lp).connect(hp).connect(g).connect(this.masterGain);
    src.start();
  }


  /** Tactical "Suppression/Concussion" effect: low-pass filter everything */
  setSuppression(active: boolean): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // SFX Suppression
    this.sfxEQ.cancelScheduledValues(now);
    if (active) {
      this.sfxEQ.type = 'lowpass';
      this.sfxEQ.frequency.exponentialRampToValueAtTime(400, now + 0.1);
    } else {
      this.sfxEQ.type = 'highpass';
      this.sfxEQ.frequency.exponentialRampToValueAtTime(80, now + 0.3);
    }

    // Music Suppression
    this.musicEQ.cancelScheduledValues(now);
    if (active) {
      this.musicEQ.type = 'lowpass';
      this.musicEQ.frequency.exponentialRampToValueAtTime(300, now + 0.1);
    } else {
      this.musicEQ.type = 'peaking';
      this.musicEQ.frequency.exponentialRampToValueAtTime(800, now + 0.3);
    }
  }

  private musicIntensity = 0;

  /** Set global music intensity (0 to 1). Drives LPF and layering. */
  setMusicIntensity(level: number): void {
    this.musicIntensity = Math.max(0, Math.min(1, level));
  }

  getMusicIntensity(): number {
    return this.musicIntensity;
  }

  getContext(): AudioContext {
    return this.ensureCtx();
  }

  getDest(category: SoundCategory = 'sfx'): AudioNode {
    this.ensureCtx();
    return category === 'music' ? this.musicGain : this.sfxGain;
  }

  play(soundFn: SoundFn, category: SoundCategory = 'sfx', priority = false): void {
    const ctx = this.ensureCtx();
    // Only play if context is actually running (not suspended)
    if (ctx.state === 'running') {
      const dest = this.getDest(category);
      soundFn(ctx, ctx.currentTime, dest);
      if (priority && !this._muted) {
        this.duckMusic();
      }
    }
  }

  private duckMusic(): void {
    const ctx = this.ctx!;
    const now = ctx.currentTime;
    const param = this.musicGain.gain;
    param.cancelScheduledValues(now);
    param.setValueAtTime(param.value, now);
    param.linearRampToValueAtTime(MIX.music * MIX.duckAmount, now + MIX.duckAttack);
    param.linearRampToValueAtTime(MIX.music, now + MIX.duckAttack + MIX.duckRelease);
  }

  setMasterVolume(v: number): void {
    if (this.masterGain) this.masterGain.gain.value = Math.max(0, Math.min(1, v));
  }

  setMuted(muted: boolean): void {
    this._muted = muted;
    if (this.masterGain) this.masterGain.gain.value = muted ? 0 : MIX.master;
    if (muted) this.stopBGM();
  }

  // --- BGM lifecycle ---

  startBGM(loopFn: (ctx: AudioContext, musicDest: AudioNode, sfxDest: AudioNode, schedule: (timer: number) => void, addNode: (n: AudioScheduledSourceNode) => void) => void): void {
    const ctx = this.ensureCtx();

    // If context is still suspended (no user gesture yet), defer BGM start
    if (ctx.state !== 'running') {
      this.pendingBGM = loopFn;
      return;
    }

    this.startBGMInternal(loopFn, true);
  }

  private startBGMInternal(
    loopFn: (ctx: AudioContext, musicDest: AudioNode, sfxDest: AudioNode, schedule: (timer: number) => void, addNode: (n: AudioScheduledSourceNode) => void) => void,
    crossfade: boolean,
  ): void {
    // Crossfade out old BGM if playing
    const hasOldBGM = this.bgmTimers.length > 0 || this.bgmNodes.length > 0;
    if (hasOldBGM) {
      this.crossfadeOutOldBGM();
    }

    const ctx = this.ctx!;
    loopFn(
      ctx, this.musicGain, this.sfxGain,
      (t) => this.bgmTimers.push(t),
      (n) => {
        this.bgmNodes.push(n);
        if (this.bgmNodes.length > 20) {
          this.bgmNodes = this.bgmNodes.slice(-8);
        }
      },
    );

    // Only crossfade-in if there was old BGM playing; otherwise start at full volume
    if (hasOldBGM && crossfade) {
      const now = ctx.currentTime;
      this.musicGain.gain.cancelScheduledValues(now);
      this.musicGain.gain.setValueAtTime(0, now);
      this.musicGain.gain.linearRampToValueAtTime(MIX.music, now + MIX.crossfadeSec);
    }
  }

  private crossfadeOutOldBGM(): void {
    const oldTimers = this.bgmTimers;
    const oldNodes = this.bgmNodes;
    this.bgmTimers = [];
    this.bgmNodes = [];

    oldTimers.forEach(t => clearTimeout(t));

    this.fadingOutTimers.forEach(t => clearTimeout(t));
    this.fadingOutNodes.forEach(n => { try { n.stop(); } catch { /* */ } });
    this.fadingOutNodes = oldNodes;
    this.fadingOutTimers = [];

    const cleanupTimer = window.setTimeout(() => {
      this.fadingOutNodes.forEach(n => { try { n.stop(); } catch { /* */ } });
      this.fadingOutNodes = [];
    }, MIX.crossfadeSec * 1000 + 200);
    this.fadingOutTimers.push(cleanupTimer);
  }

  stopBGM(): void {
    this.pendingBGM = null;
    this.bgmTimers.forEach(t => clearTimeout(t));
    this.bgmTimers = [];
    this.bgmNodes.forEach(n => { try { n.stop(); } catch { /* */ } });
    this.bgmNodes = [];
    this.fadingOutTimers.forEach(t => clearTimeout(t));
    this.fadingOutTimers = [];
    this.fadingOutNodes.forEach(n => { try { n.stop(); } catch { /* */ } });
    this.fadingOutNodes = [];
  }
}

export default SoundEngine;
