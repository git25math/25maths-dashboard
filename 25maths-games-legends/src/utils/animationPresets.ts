import type { MotionProps } from "motion/react";

export const tapScale: MotionProps = {
  whileTap: { scale: 0.95 },
};

export const hoverGlow: MotionProps = {
  whileHover: { 
    scale: 1.05, 
    boxShadow: "0 0 15px rgba(234,179,8,0.3)" 
  },
};

export const springIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: "spring", stiffness: 300, damping: 20 },
};

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: "easeOut" } // this will be used for item entrance if not overridden
};

export const buttonBase: MotionProps = {
  whileTap: { scale: 0.95 },
  whileHover: { scale: 1.03 },
  transition: { type: "spring", stiffness: 400, damping: 25 },
};

export const INPUT_FOCUS_CLASS = "focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400 focus:outline-none";

export const DURATION = {
  quick: 0.15,
  normal: 0.3,
  slow: 0.5,
  entrance: 0.8,
} as const;

export const VICTORY_TIMING = {
  dimScreen: 300,
  shockwave: 600,
  badgeDrop: 1400,
  statsReveal: 2200,
  skillBadge: 3000,
  returnButton: 4000,
} as const;

export const BATTLE_TIMING = {
  /** Delay before advancing to next question after correct answer */
  advance: 600,
  /** Delay before victory after shield absorb / survive last question */
  shieldVictory: 300,
  /** Delay before defeat sound plays (after hpLoss fades) */
  defeatSound: 400,
  /** Shake animation duration */
  shake: 500,
} as const;

