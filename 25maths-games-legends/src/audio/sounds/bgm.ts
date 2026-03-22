// BGM: Tactical Briefing (Map) and Operation Active (Battle)
// Style: Modern Tactical Cinematic (Delta Force inspired)
import { playNoiseBurst, playWarDrum, rand } from '../utils';

type ScheduleFn = (timer: number) => void;
type AddNodeFn = (node: AudioScheduledSourceNode) => void;

const LOOKAHEAD = 0.1;
const SCHEDULER_INTERVAL = 50;

/** Battle BGM — "Operation Active: Adaptive" (115 BPM)
 *  Adaptive layers + spatial widening + tactical intensity
 *  Layers unlock based on SoundEngine.getMusicIntensity() */
export function bgmBattle(
  ctx: AudioContext, musicDest: AudioNode, _sfxDest: AudioNode,
  schedule: ScheduleFn, addNode: AddNodeFn,
): void {
  const engine = (ctx as any)._engine; // Assuming engine is accessible or passed
  const BPM = 115;
  const beatSec = 60 / BPM;
  let nextBeatTime = ctx.currentTime + 0.05;
  let beat = 0;

  // D Minor / Phrygian
  const bassRoots = [73.42, 73.42, 77.78, 87.31];

  const masterLP = ctx.createBiquadFilter();
  masterLP.type = 'lowpass';
  masterLP.Q.value = 1.2;
  masterLP.connect(musicDest);

  function scheduleBeat(t: number) {
    const intensity = (window as any)._gl_musicIntensity || 0; // Fallback to window for simplicity in this bridge
    const bar = Math.floor(beat / 16);
    const beatInBar = beat % 16;
    const barInPhrase = bar % 4;

    // --- Dynamic Filter Opening ---
    masterLP.frequency.setValueAtTime(600 + intensity * 2400, t);

    // --- LAYER 1: Base Driving Pulse (Always Active) ---
    if (beat % 2 === 0) {
      const root = bassRoots[barInPhrase];
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(root, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.06 + intensity * 0.04, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + beatSec * 0.8);
      osc.connect(g).connect(masterLP);
      osc.start(t);
      osc.stop(t + beatSec);
      addNode(osc);
    }

    // --- LAYER 2: Tactical Percussion (Intensity > 0.4) ---
    if (intensity > 0.4 && [0, 3, 8, 11].includes(beatInBar)) {
      playWarDrum(ctx, masterLP, t, 0.1 * intensity, 0.3);
    }
    if (intensity > 0.6 && (beatInBar === 4 || beatInBar === 12)) {
      playNoiseBurst(ctx, masterLP, t, 0.04, 1200, 'bandpass', 0.03 * intensity);
    }

    // --- LAYER 3: Heroic Lead (Intensity > 0.7) ---
    if (intensity > 0.7 && beat % 4 === 0) {
      const leadFreq = bassRoots[barInPhrase] * 4; // 2 Octaves up
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.sin(t * 2) * 0.6, t); // Moving in space
      
      const osc = ctx.createOscillator();
      osc.type = 'triangle'; // Richer harmonics for lead
      osc.frequency.setValueAtTime(leadFreq, t);
      
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.02, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(g).connect(panner).connect(masterLP);
      osc.start(t);
      osc.stop(t + 0.41);
      addNode(osc);
    }

    // --- LAYER 4: High-Freq Shimmer (Adrenaline) ---
    if (intensity > 0.8 && beat % 16 === 8) {
      playNoiseBurst(ctx, masterLP, t, 0.2, 5000, 'highpass', 0.015);
    }

    beat++;
  }




  function scheduler() {
    while (nextBeatTime < ctx.currentTime + LOOKAHEAD) {
      scheduleBeat(nextBeatTime);
      nextBeatTime += beatSec / 2; // 8th note resolution
    }
    const timer = window.setTimeout(scheduler, SCHEDULER_INTERVAL);
    schedule(timer);
  }
  scheduler();
}

/** Map BGM — "Tactical Briefing" (Ambient Tension)
 *  Sub drones + rhythmic radar pulses + filtered pads */
export function bgmMap(
  ctx: AudioContext, musicDest: AudioNode, _sfxDest: AudioNode,
  schedule: ScheduleFn, addNode: AddNodeFn,
): void {
  let beat = 0;
  const pulseSec = 0.8;
  let nextPulseTime = ctx.currentTime + 0.05;

  function schedulePulse(t: number) {
    // --- Sub Drone (every 8 pulses) ---
    if (beat % 8 === 0) {
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(55, t); // A1
      
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.03, t + 1.0);
      g.gain.setValueAtTime(0.03, t + 5.0);
      g.gain.linearRampToValueAtTime(0, t + 6.4);

      drone.connect(g).connect(musicDest);
      drone.start(t);
      drone.stop(t + 6.5);
      addNode(drone);
    }

    // --- Radar Pulse (every 2 pulses) ---
    if (beat % 2 === 0) {
      playNoiseBurst(ctx, musicDest, t, 0.05, 2500, 'bandpass', 0.01);
    }

    // --- Filtered Saw Pad (D Minor / Phrygian context) ---
    if (beat % 16 === 0) {
      [146.83, 174.61, 220.0].forEach(freq => { // D3, F3, A3
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq + rand(-1, 1), t);
        
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(100, t);
        lp.frequency.linearRampToValueAtTime(400, t + 4.0);
        lp.frequency.linearRampToValueAtTime(100, t + 8.0);

        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.015, t + 2.0);
        g.gain.setValueAtTime(0.015, t + 10.0);
        g.gain.linearRampToValueAtTime(0, t + 12.8);

        osc.connect(lp).connect(g).connect(musicDest);
        osc.start(t);
        osc.stop(t + 13);
        addNode(osc);
      });
    }

    beat++;
  }

  function scheduler() {
    while (nextPulseTime < ctx.currentTime + LOOKAHEAD) {
      schedulePulse(nextPulseTime);
      nextPulseTime += pulseSec;
    }
    const timer = window.setTimeout(scheduler, SCHEDULER_INTERVAL);
    schedule(timer);
  }
  scheduler();
}

