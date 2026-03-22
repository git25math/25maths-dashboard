// useAudio() hook — public API for the audio system
// Backward compatible: playBGM, stopBGM, playSuccess, playFail, playClick, muted, toggleMute
// New: playTap, playSubmit, playCorrect, playWrong, playHpLoss, playVictory, playDefeat,
//      playStreak, playStreakBreak, playShieldOn, playShieldBlock, playDoubleOn, playReveal,
//      playTierUp, playTierDown, playPhaseAdvance, playBadgeUnlock, playCardPick,
//      playBGMBattle, playBGMMap, startCountdownWarn, stopCountdownWarn, startHpCritical, stopHpCritical

import { useState, useRef, useEffect, useCallback } from 'react';
import SoundEngine from './engine';
import { tap, submit, correct, wrong } from './sounds/core';
import { hpLoss, hpCriticalLoop, victory, defeat, partialCredit } from './sounds/combat';
import { streak2, streak3, streak5, streakBreak } from './sounds/streak';
import { shieldOn, shieldBlock, doubleOn, reveal } from './sounds/skills';
import { tierUp, tierDown, phaseAdvance, badgeUnlock } from './sounds/progress';
import { cardPick, countdownWarn } from './sounds/ui';
import { bgmBattle, bgmMap } from './sounds/bgm';
import { battleEnter, battleExitWin, battleExitLose } from './sounds/transitions';

const LS_KEY = 'gl_muted';

export function useAudio() {
  const [muted, setMuted] = useState(() => localStorage.getItem(LS_KEY) === '1');
  const mutedRef = useRef(muted);
  const countdownStopRef = useRef<(() => void) | null>(null);
  const criticalStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const engine = SoundEngine.getInstance();

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      localStorage.setItem(LS_KEY, next ? '1' : '0');
      if (next) engine.setMuted(true);
      else engine.setMuted(false);
      return next;
    });
  }, []);

  // Stop BGM when muted
  useEffect(() => {
    if (muted) engine.stopBGM();
  }, [muted]);

  // Helper: skip if muted
  const guard = () => !mutedRef.current;

  // --- Core ---
  const playTap = useCallback(() => { if (guard()) engine.play(tap); }, []);
  const playSubmit = useCallback(() => { if (guard()) engine.play(submit); }, []);
  const playCorrect = useCallback(() => { if (guard()) engine.play(correct); }, []);
  const playWrong = useCallback(() => { if (guard()) engine.play(wrong); }, []);

  // --- Combat ---
  const playHpLoss = useCallback(() => { if (guard()) engine.play(hpLoss); }, []);
  const playPartialCredit = useCallback(() => { if (guard()) engine.play(partialCredit); }, []);
  const playVictory = useCallback(() => { if (guard()) engine.play(victory, 'sfx', true); }, []);
  const playDefeat = useCallback(() => { if (guard()) engine.play(defeat, 'sfx', true); }, []);

  const criticalTimersRef = useRef<number[]>([]);
  const criticalNodesRef = useRef<AudioScheduledSourceNode[]>([]);

  const startHpCritical = useCallback(() => {
    if (!guard()) return;
    stopHpCritical();
    const ctx = engine.getContext();
    const dest = engine.getDest('sfx');
    criticalTimersRef.current = [];
    criticalNodesRef.current = [];
    engine.setSuppression(true);
    criticalStopRef.current = hpCriticalLoop(ctx, dest,
      (t) => criticalTimersRef.current.push(t),
      (n) => criticalNodesRef.current.push(n),
    );
  }, []);

  const stopHpCritical = useCallback(() => {
    criticalStopRef.current?.();
    criticalStopRef.current = null;
    criticalTimersRef.current.forEach(t => clearTimeout(t));
    criticalTimersRef.current = [];
    criticalNodesRef.current.forEach(n => { try { n.stop(); } catch { /* already stopped */ } });
    criticalNodesRef.current = [];
    engine.setSuppression(false);
  }, []);

  // --- Streak ---
  const playStreak = useCallback((count: number) => {
    if (!guard()) return;
    
    // Drive music intensity based on streak (0 to 1)
    const intensity = Math.min(1, count / 8);
    engine.setMusicIntensity(intensity);
    (window as any)._gl_musicIntensity = intensity; // Bridge to BGM loop

    if (count >= 5) engine.play(streak5);
    else if (count >= 3) engine.play(streak3);
    else if (count >= 2) engine.play(streak2);
  }, []);

  const playStreakBreak = useCallback(() => { 
    if (guard()) {
      engine.play(streakBreak);
      engine.setMusicIntensity(0);
      (window as any)._gl_musicIntensity = 0;
    }
  }, []);

  // --- Skills ---
  const playShieldOn = useCallback(() => { if (guard()) engine.play(shieldOn); }, []);
  const playShieldBlock = useCallback(() => { if (guard()) engine.play(shieldBlock); }, []);
  const playDoubleOn = useCallback(() => { if (guard()) engine.play(doubleOn); }, []);
  const playReveal = useCallback(() => { if (guard()) engine.play(reveal); }, []);

  // --- Progress ---
  const playTierUp = useCallback(() => { if (guard()) engine.play(tierUp); }, []);
  const playTierDown = useCallback(() => { if (guard()) engine.play(tierDown); }, []);
  const playPhaseAdvance = useCallback(() => { if (guard()) engine.play(phaseAdvance); }, []);
  const playBadgeUnlock = useCallback(() => { if (guard()) engine.play(badgeUnlock, 'sfx', true); }, []);

  // --- UI ---
  const playCardPick = useCallback(() => { if (guard()) engine.play(cardPick); }, []);

  const startCountdownWarn = useCallback(() => {
    if (!guard()) return;
    stopCountdownWarn();
    const ctx = engine.getContext();
    const dest = engine.getDest('sfx');
    const timers: number[] = [];
    countdownStopRef.current = countdownWarn(ctx, dest, (t) => timers.push(t));
    // Store timer cleanup in stop function
    const origStop = countdownStopRef.current;
    countdownStopRef.current = () => {
      origStop();
      timers.forEach(t => clearTimeout(t));
    };
  }, []);

  const stopCountdownWarn = useCallback(() => {
    countdownStopRef.current?.();
    countdownStopRef.current = null;
  }, []);

  // --- Transitions ---
  const playBattleEnter = useCallback(() => { if (guard()) engine.play(battleEnter, 'sfx', true); }, []);
  const playBattleExitWin = useCallback(() => { if (guard()) engine.play(battleExitWin); }, []);
  const playBattleExitLose = useCallback(() => { if (guard()) engine.play(battleExitLose); }, []);

  // --- BGM ---
  const playBGMBattle = useCallback(() => {
    if (!guard()) return;
    engine.startBGM(bgmBattle);
  }, []);

  const playBGMMap = useCallback(() => {
    if (!guard()) return;
    engine.startBGM(bgmMap);
  }, []);

  const stopBGM = useCallback(() => {
    engine.stopBGM();
  }, []);

  // --- Backward compatibility aliases ---
  const playBGM = playBGMBattle;
  const playSuccess = playCorrect;
  const playFail = playWrong;
  const playClick = playTap;

  return {
    // Backward compatible
    playBGM, stopBGM, playSuccess, playFail, playClick,
    muted, toggleMute,

    // Core
    playTap, playSubmit, playCorrect, playWrong,

    // Combat
    playHpLoss, playVictory, playDefeat, playPartialCredit,
    startHpCritical, stopHpCritical,

    // Streak
    playStreak, playStreakBreak,

    // Skills
    playShieldOn, playShieldBlock, playDoubleOn, playReveal,

    // Progress
    playTierUp, playTierDown, playPhaseAdvance, playBadgeUnlock,

    // UI
    playCardPick,
    startCountdownWarn, stopCountdownWarn,

    // Transitions
    playBattleEnter, playBattleExitWin, playBattleExitLose,

    // BGM
    playBGMBattle, playBGMMap,
  };
}
