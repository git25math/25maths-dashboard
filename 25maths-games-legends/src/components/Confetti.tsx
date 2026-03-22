import { memo, useEffect, useMemo, useState } from "react";

const THEMES = {
  default: ["#FFD700", "#8b0000", "#2d6a2e", "#b8860b", "#4f46e5", "#ef4444", "#f59e0b", "#fff"],
  goldWhite: ["#FFD700", "#FFF8DC", "#FFFFFF", "#DAA520", "#B8860B", "#F0E68C"],
};

const PARTICLE_COUNT = 60;
const DURATION_MS = 3000;

interface ConfettiProps {
  active?: boolean;
  trigger?: number;
  theme?: 'default' | 'goldWhite';
}

interface Particle {
  color: string;
  delay: number;
  width: number;
  height: number;
  rotation: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  id: number;
}

export const Confetti = memo(function Confetti({ active, trigger = 0, theme = 'default' }: ConfettiProps) {
  const [visible, setVisible] = useState(false);

  // Use both active and trigger to determine if it should fire
  const isTriggered = active || trigger > 0;
  
  // Regenerate random values each time active flips to true or trigger changes
  const particles = useMemo<Particle[]>(() => {
    if (!isTriggered) return [];
    
    const colors = THEMES[theme] || THEMES.default;
    
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * 280;
      const sx = (Math.random() - 0.5) * 60;
      const sy = (Math.random() - 0.5) * 60;
      return {
        id: i,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 500,
        width: Math.random() > 0.5 ? 10 : 7,
        height: Math.random() > 0.5 ? 10 : 14,
        rotation: Math.random() * 1080 - 540,
        startX: sx,
        startY: sy,
        endX: sx + Math.cos(angle) * distance,
        endY: sy + Math.sin(angle) * distance + 100, // gravity pull
      };
    });
  }, [active, trigger, theme]);

  useEffect(() => {
    if (!isTriggered) {
      setVisible(false);
      return;
    }
    
    // We need to briefly toggle visibility off then on to restart CSS animations
    setVisible(false);
    const frame = requestAnimationFrame(() => {
      setVisible(true);
    });
    
    const timer = setTimeout(() => setVisible(false), DURATION_MS);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [active, trigger]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <style>{`
        @keyframes confetti-burst {
          0% {
            transform: translate(var(--cb-sx), var(--cb-sy)) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(var(--cb-ex), var(--cb-ey)) rotate(var(--cb-r));
            opacity: 0;
          }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: p.width,
            height: p.height,
            backgroundColor: p.color,
            borderRadius: 1,
            opacity: 0,
            animation: `confetti-burst 1.5s ease-out ${p.delay}ms forwards`,
            ["--cb-sx" as string]: `${p.startX}px`,
            ["--cb-sy" as string]: `${p.startY}px`,
            ["--cb-ex" as string]: `${p.endX}px`,
            ["--cb-ey" as string]: `${p.endY}px`,
            ["--cb-r" as string]: `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
});
