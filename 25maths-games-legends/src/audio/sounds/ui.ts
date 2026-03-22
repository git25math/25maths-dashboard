// UI sound effects: card_pick, countdown_warn
import { playNoiseBurst, playTacticalPulse } from '../utils';

/** Card Pick — Tactical Select (Short digital beep/click) */
export const cardPick: SoundFn = (ctx, time, dest) => {
  playTacticalPulse(ctx, dest, time, 2400, 0.03, 0.08);
  playNoiseBurst(ctx, dest, time, 0.005, 5000, 'highpass', 0.04);
};


/** Countdown Warning — Tactical Urgency (Accelerating radar pulses)
 *  Returns a stop function. */
export function countdownWarn(
  ctx: AudioContext, dest: AudioNode,
  schedule: (t: number) => void,
): () => void {
  let active = true;
  let interval = 500;
  let pitch = 1200;
  let urgency = 0;

  function tick() {
    if (!active) return;
    const now = ctx.currentTime;
    
    // High-freq tactical blip
    playTacticalPulse(ctx, dest, now, pitch, 0.04, 0.06 + urgency * 0.04);
    
    // Subtle grit/distortion on pulse
    if (urgency > 0.5) {
      playNoiseBurst(ctx, dest, now, 0.015, 2000, 'bandpass', urgency * 0.05);
    }

    // Accelerate + escalate urgency
    interval = Math.max(80, interval * 0.9);
    pitch = Math.min(2200, pitch + 50);
    urgency = Math.min(1, urgency + 0.05);
    
    const timer = window.setTimeout(tick, interval);
    schedule(timer);
  }

  tick();
  return () => { active = false; };
}

