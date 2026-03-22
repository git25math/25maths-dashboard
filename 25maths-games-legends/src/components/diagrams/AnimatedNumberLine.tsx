/**
 * AnimatedNumberLine — animated number line for integer addition/subtraction
 * Shows: start point → arrow movement → end point
 *
 * Usage:
 *   <AnimatedNumberLine start={5} end={2} movement={-3} step={tutorialStep} />
 */
import { motion } from 'motion/react';

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  green: '#2d6a2e',
  gold: '#b8860b',
  scroll: '#f4e4bc',
};

type Props = {
  /** Starting position on the number line */
  start: number;
  /** Ending position (result) */
  end: number;
  /** Movement amount (positive = right, negative = left) */
  movement: number;
  /** Tutorial step for progressive reveal: 0=line only, 1=start point, 2=arrow+end */
  step?: number;
  /** Inequality mode: show solution range instead of arrow */
  inequalityOp?: '<' | '>' | '≤' | '≥';
  /** Boundary value for inequality (e.g., x < 4 → boundary=4) */
  inequalityBoundary?: number;
};

export function AnimatedNumberLine({ start, end, movement, step = 999, inequalityOp, inequalityBoundary }: Props) {
  // Auto-calculate range to show all relevant points with padding
  const allPoints = [start, end, 0];
  const minVal = Math.min(...allPoints) - 2;
  const maxVal = Math.max(...allPoints) + 2;
  const range = maxVal - minVal;

  const WIDTH = 320;
  const HEIGHT = 100;
  const PAD = 30;
  const LINE_Y = 50;
  const ARROW_Y = 25;

  const toX = (val: number) => PAD + ((val - minVal) / range) * (WIDTH - 2 * PAD);

  // Tick marks — adaptive interval to avoid overcrowding
  const tickStep = range <= 12 ? 1 : range <= 30 ? 5 : 10;
  const ticks: JSX.Element[] = [];
  // Always include 0, start, and end as important reference ticks
  const importantVals = new Set<number>();
  importantVals.add(0);
  importantVals.add(start);
  importantVals.add(end);
  // Add regular interval ticks
  const firstTick = Math.ceil(minVal / tickStep) * tickStep;
  for (let v = firstTick; v <= Math.floor(maxVal); v += tickStep) {
    importantVals.add(v);
  }
  // Sort and render
  const tickVals = [...importantVals].filter(v => v >= minVal && v <= maxVal).sort((a, b) => a - b);
  for (const v of tickVals) {
    const x = toX(v);
    const isZero = v === 0;
    const isEndpoint = v === start || v === end;
    ticks.push(
      <line key={`t${v}`} x1={x} y1={LINE_Y - 5} x2={x} y2={LINE_Y + 5} stroke={isZero || isEndpoint ? COLORS.wood : '#a0937d'} strokeWidth={isZero ? 2 : 1} />,
      <text key={`l${v}`} x={x} y={LINE_Y + 18} textAnchor="middle" fontSize={isZero ? 11 : 9} fontWeight={isZero || isEndpoint ? 'bold' : 'normal'} fill={COLORS.wood}>{v}</text>,
    );
  }

  const startX = toX(start);
  const endX = toX(end);
  const arrowColor = movement > 0 ? COLORS.green : COLORS.red;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-xs mx-auto">
      {/* Number line */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
        <line x1={PAD} y1={LINE_Y} x2={WIDTH - PAD} y2={LINE_Y} stroke={COLORS.wood} strokeWidth={2} />
        {/* Arrow heads */}
        <polygon points={`${PAD - 5},${LINE_Y} ${PAD + 3},${LINE_Y - 4} ${PAD + 3},${LINE_Y + 4}`} fill={COLORS.wood} />
        <polygon points={`${WIDTH - PAD + 5},${LINE_Y} ${WIDTH - PAD - 3},${LINE_Y - 4} ${WIDTH - PAD - 3},${LINE_Y + 4}`} fill={COLORS.wood} />
        {ticks}
      </motion.g>

      {/* Start point */}
      {step >= 1 && (
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <circle cx={startX} cy={LINE_Y} r={7} fill={COLORS.gold} stroke={COLORS.wood} strokeWidth={1.5} />
          <text x={startX} y={LINE_Y - 14} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.gold}>{start}</text>
        </motion.g>
      )}

      {/* Movement arrow (normal addition/subtraction mode) */}
      {!inequalityOp && step >= 2 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          {/* Curved arrow path */}
          <motion.path
            d={`M ${startX} ${ARROW_Y} Q ${(startX + endX) / 2} ${ARROW_Y - 15} ${endX} ${ARROW_Y}`}
            fill="none"
            stroke={arrowColor}
            strokeWidth={2}
            strokeDasharray="4,3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />
          {/* Arrow head at end */}
          <motion.polygon
            points={movement > 0
              ? `${endX + 5},${ARROW_Y} ${endX - 3},${ARROW_Y - 4} ${endX - 3},${ARROW_Y + 4}`
              : `${endX - 5},${ARROW_Y} ${endX + 3},${ARROW_Y - 4} ${endX + 3},${ARROW_Y + 4}`
            }
            fill={arrowColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          />
          {/* Movement label */}
          <motion.text
            x={(startX + endX) / 2}
            y={ARROW_Y - 18}
            textAnchor="middle"
            fontSize={10}
            fontWeight="bold"
            fill={arrowColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {movement > 0 ? `+${movement}` : movement}
          </motion.text>

          {/* End point */}
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.8 }}>
            <circle cx={endX} cy={LINE_Y} r={7} fill={end >= 0 ? COLORS.green : COLORS.red} stroke={COLORS.wood} strokeWidth={1.5} />
            <text x={endX} y={LINE_Y + 30} textAnchor="middle" fontSize={12} fontWeight="bold" fill={end >= 0 ? COLORS.green : COLORS.red}>{end}</text>
          </motion.g>
        </motion.g>
      )}

      {/* Inequality mode: shaded solution region */}
      {inequalityOp && inequalityBoundary !== undefined && step >= 1 && (() => {
        const bx = toX(inequalityBoundary);
        const isLess = inequalityOp === '<' || inequalityOp === '≤';
        const isClosed = inequalityOp === '≤' || inequalityOp === '≥';
        const shadeLeft = isLess ? PAD : bx;
        const shadeRight = isLess ? bx : WIDTH - PAD;
        return (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
            {/* Shaded solution region */}
            {step >= 2 && (
              <motion.rect
                x={shadeLeft} y={LINE_Y - 12}
                width={shadeRight - shadeLeft} height={24}
                fill={COLORS.green} fillOpacity={0.15}
                rx={3}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ transformOrigin: isLess ? `${bx}px ${LINE_Y}px` : `${bx}px ${LINE_Y}px` }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
            )}
            {/* Boundary point: open circle (< >) or filled (≤ ≥) */}
            <motion.circle
              cx={bx} cy={LINE_Y} r={7}
              fill={isClosed ? COLORS.gold : 'white'}
              stroke={COLORS.gold} strokeWidth={2.5}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            />
            {/* Boundary label */}
            <text x={bx} y={LINE_Y - 14} textAnchor="middle" fontSize={13} fontWeight="bold" fill={COLORS.gold}>
              {inequalityBoundary}
            </text>
            {/* Arrow showing solution direction */}
            {step >= 2 && (
              <motion.text
                x={isLess ? shadeLeft + 15 : shadeRight - 15}
                y={LINE_Y + 30}
                textAnchor="middle"
                fontSize={11}
                fontWeight="bold"
                fill={COLORS.green}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                x {inequalityOp} {inequalityBoundary}
              </motion.text>
            )}
          </motion.g>
        );
      })()}
    </svg>
  );
}
