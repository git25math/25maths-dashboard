/**
 * SymmetryPlane — coordinate plane showing point reflection/rotation
 * Covers: SYMMETRY type (Y8 Unit 6)
 * Modes: reflect_x (over x-axis), reflect_y (over y-axis), rotate_180 (about origin)
 */
import { motion } from 'motion/react';

type Props = {
  px: number;
  py: number;
  ansX: number;
  ansY: number;
  mode: 'reflect_x' | 'reflect_y' | 'rotate_180';
  step?: number;
};

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  blue: '#1a3a5c',
  gold: '#b8860b',
  mirror: '#6366f1',
  grid: '#d4c5a9',
};

export function SymmetryPlane({ px, py, ansX, ansY, mode, step = 999 }: Props) {
  const SIZE = 280;
  const PAD = 35;
  const PLOT = SIZE - PAD * 2;

  const allVals = [px, py, ansX, ansY, 0];
  const lo = Math.min(...allVals) - 2;
  const hi = Math.max(...allVals) + 2;

  const toX = (x: number) => PAD + ((x - lo) / (hi - lo)) * PLOT;
  const toY = (y: number) => PAD + ((hi - y) / (hi - lo)) * PLOT;

  // Grid lines
  const grid: JSX.Element[] = [];
  for (let v = Math.ceil(lo); v <= hi; v++) {
    grid.push(
      <line key={`gx${v}`} x1={toX(v)} y1={PAD} x2={toX(v)} y2={SIZE - PAD} stroke={COLORS.grid} strokeWidth={0.5} />,
      <line key={`gy${v}`} x1={PAD} y1={toY(v)} x2={SIZE - PAD} y2={toY(v)} stroke={COLORS.grid} strokeWidth={0.5} />,
    );
    if (v !== 0) {
      grid.push(
        <text key={`lx${v}`} x={toX(v)} y={toY(0) + 13} textAnchor="middle" fontSize={8} fill={COLORS.wood}>{v}</text>,
        <text key={`ly${v}`} x={toX(0) - 7} y={toY(v) + 3} textAnchor="end" fontSize={8} fill={COLORS.wood}>{v}</text>,
      );
    }
  }

  const mirrorIsVertical = mode === 'reflect_y';
  const mirrorIsHorizontal = mode === 'reflect_x';

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Symmetry diagram">
      {/* Grid + axes */}
      <g>
        {grid}
        <line x1={PAD} y1={toY(0)} x2={SIZE - PAD} y2={toY(0)} stroke={COLORS.wood} strokeWidth={1.5} />
        <line x1={toX(0)} y1={PAD} x2={toX(0)} y2={SIZE - PAD} stroke={COLORS.wood} strokeWidth={1.5} />
        <text x={SIZE - PAD + 8} y={toY(0) + 4} fontSize={10} fontWeight="bold" fill={COLORS.wood}>x</text>
        <text x={toX(0) - 4} y={PAD - 5} fontSize={10} fontWeight="bold" fill={COLORS.wood}>y</text>
        <text x={toX(0) - 8} y={toY(0) + 13} fontSize={8} fill={COLORS.wood}>O</text>
      </g>

      {/* Mirror line / rotation centre */}
      {step >= 1 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {mirrorIsVertical && (
            <>
              <line x1={toX(0)} y1={PAD} x2={toX(0)} y2={SIZE - PAD} stroke={COLORS.mirror} strokeWidth={2.5} strokeDasharray="6,4" opacity={0.6} />
              <text x={toX(0) + 8} y={PAD + 12} fontSize={9} fill={COLORS.mirror} fontWeight="bold">y-axis mirror</text>
            </>
          )}
          {mirrorIsHorizontal && (
            <>
              <line x1={PAD} y1={toY(0)} x2={SIZE - PAD} y2={toY(0)} stroke={COLORS.mirror} strokeWidth={2.5} strokeDasharray="6,4" opacity={0.6} />
              <text x={SIZE - PAD - 5} y={toY(0) - 8} textAnchor="end" fontSize={9} fill={COLORS.mirror} fontWeight="bold">x-axis mirror</text>
            </>
          )}
          {mode === 'rotate_180' && (
            <>
              <circle cx={toX(0)} cy={toY(0)} r={5} fill={COLORS.mirror} opacity={0.7} />
              <text x={toX(0) + 10} y={toY(0) - 10} fontSize={9} fill={COLORS.mirror} fontWeight="bold">180°</text>
            </>
          )}
        </motion.g>
      )}

      {/* Original point P */}
      {step >= 1 && (
        <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <circle cx={toX(px)} cy={toY(py)} r={7} fill={COLORS.red} />
          <text x={toX(px) + 10} y={toY(py) - 10} fontSize={11} fontWeight="bold" fill={COLORS.red}>
            P({px},{py})
          </text>
        </motion.g>
      )}

      {/* Reflected/rotated point P' */}
      {step >= 2 && (
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.4 }}>
          {/* Dashed connection line */}
          <motion.line
            x1={toX(px)} y1={toY(py)}
            x2={toX(ansX)} y2={toY(ansY)}
            stroke={COLORS.gold} strokeWidth={1.5} strokeDasharray="4,3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6 }}
          />
          <circle cx={toX(ansX)} cy={toY(ansY)} r={7} fill={COLORS.blue} />
          <text x={toX(ansX) + 10} y={toY(ansY) + 16} fontSize={11} fontWeight="bold" fill={COLORS.blue}>
            P'({ansX},{ansY})
          </text>
        </motion.g>
      )}
    </svg>
  );
}
