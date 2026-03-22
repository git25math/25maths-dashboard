/**
 * AnimatedCoordinatePlane — step-by-step animated coordinate visualization
 * Syncs with tutorial steps: each step reveals more elements (points, lines, labels)
 *
 * Usage in PracticeScreen Green phase:
 *   <AnimatedCoordinatePlane step={tutorialStep} points={...} m={2} c={-1} />
 *
 * Step 0: Show empty coordinate plane
 * Step 1: Plot point A with animation
 * Step 2: Plot point B + draw line through both
 * Step 3+: Show slope label + equation
 */
import { motion } from 'motion/react';

type Props = {
  /** Current tutorial step (0-based) */
  step: number;
  /** Two points to plot */
  points: [number, number][];
  /** Slope (shown at step 2+) */
  m?: number;
  /** Y-intercept (shown at step 2+) */
  c?: number;
  /** Equation type label */
  label?: string;
};

const PADDING = 35;
const SIZE = 320;
const PLOT = SIZE - PADDING * 2;

export function AnimatedCoordinatePlane({ step, points, m, c, label }: Props) {
  // Auto-calculate range from points
  const allX = points.map(p => p[0]);
  const allY = points.map(p => p[1]);
  const xMin = Math.min(-2, ...allX) - 1;
  const xMax = Math.max(2, ...allX) + 1;
  const yMin = Math.min(-2, ...allY) - 1;
  const yMax = Math.max(2, ...allY) + 1;

  const toX = (x: number) => PADDING + ((x - xMin) / (xMax - xMin)) * PLOT;
  const toY = (y: number) => PADDING + ((yMax - y) / (yMax - yMin)) * PLOT;

  // Grid
  const grid = [];
  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    grid.push(<line key={`gx${x}`} x1={toX(x)} y1={PADDING} x2={toX(x)} y2={SIZE - PADDING} stroke="#d4c5a9" strokeWidth={0.5} />);
  }
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    grid.push(<line key={`gy${y}`} x1={PADDING} y1={toY(y)} x2={SIZE - PADDING} y2={toY(y)} stroke="#d4c5a9" strokeWidth={0.5} />);
  }

  // Axis labels
  const labels = [];
  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    if (x === 0) continue;
    labels.push(<text key={`lx${x}`} x={toX(x)} y={toY(0) + 14} textAnchor="middle" fontSize={8} fill="#3d2b1f">{x}</text>);
  }
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    if (y === 0) continue;
    labels.push(<text key={`ly${y}`} x={toX(0) - 8} y={toY(y) + 3} textAnchor="end" fontSize={8} fill="#3d2b1f">{y}</text>);
  }

  // Extended line through both points (for step 2+)
  let lineX1 = xMin, lineX2 = xMax;
  let lineY1 = yMin, lineY2 = yMax;
  if (m !== undefined && c !== undefined && points.length >= 2) {
    lineY1 = m * lineX1 + c;
    lineY2 = m * lineX2 + c;
    // Clip to visible area
    if (lineY1 < yMin) { lineX1 = (yMin - c) / m; lineY1 = yMin; }
    if (lineY1 > yMax) { lineX1 = (yMax - c) / m; lineY1 = yMax; }
    if (lineY2 < yMin) { lineX2 = (yMin - c) / m; lineY2 = yMin; }
    if (lineY2 > yMax) { lineX2 = (yMax - c) / m; lineY2 = yMax; }
  }

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full max-w-xs mx-auto">
      {/* Step 0+: Grid + axes (always visible, fade in) */}
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        {grid}
        {/* X axis */}
        <line x1={PADDING} y1={toY(0)} x2={SIZE - PADDING} y2={toY(0)} stroke="#3d2b1f" strokeWidth={1.5} />
        <text x={SIZE - PADDING + 10} y={toY(0) + 4} fontSize={11} fontWeight="bold" fill="#3d2b1f">x</text>
        {/* Y axis */}
        <line x1={toX(0)} y1={PADDING} x2={toX(0)} y2={SIZE - PADDING} stroke="#3d2b1f" strokeWidth={1.5} />
        <text x={toX(0) - 4} y={PADDING - 6} fontSize={11} fontWeight="bold" fill="#3d2b1f">y</text>
        <text x={toX(0) - 10} y={toY(0) + 14} fontSize={9} fill="#3d2b1f">O</text>
        {labels}
      </motion.g>

      {/* Step 1+: Point A */}
      {step >= 1 && points[0] && (
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}>
          <circle cx={toX(points[0][0])} cy={toY(points[0][1])} r={6} fill="#8b0000" />
          <circle cx={toX(points[0][0])} cy={toY(points[0][1])} r={10} fill="none" stroke="#8b0000" strokeWidth={1} opacity={0.4} />
          <text x={toX(points[0][0]) + 12} y={toY(points[0][1]) - 8} fontSize={11} fontWeight="bold" fill="#8b0000">
            A({points[0][0]},{points[0][1]})
          </text>
        </motion.g>
      )}

      {/* Step 2+: Point B + Line */}
      {step >= 2 && points[1] && (
        <>
          <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}>
            <circle cx={toX(points[1][0])} cy={toY(points[1][1])} r={6} fill="#1a3a5c" />
            <circle cx={toX(points[1][0])} cy={toY(points[1][1])} r={10} fill="none" stroke="#1a3a5c" strokeWidth={1} opacity={0.4} />
            <text x={toX(points[1][0]) + 12} y={toY(points[1][1]) - 8} fontSize={11} fontWeight="bold" fill="#1a3a5c">
              B({points[1][0]},{points[1][1]})
            </text>
          </motion.g>

          {/* Animated line drawing */}
          {m !== undefined && c !== undefined && (
            <motion.line
              x1={toX(lineX1)} y1={toY(lineY1)}
              x2={toX(lineX2)} y2={toY(lineY2)}
              stroke="#b8860b"
              strokeWidth={2.5}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          )}

          {/* Equation label */}
          {m !== undefined && c !== undefined && (
            <motion.text
              x={SIZE - PADDING - 5}
              y={PADDING + 16}
              textAnchor="end"
              fontSize={12}
              fontWeight="bold"
              fill="#b8860b"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              y = {m}x {c >= 0 ? '+' : ''}{c}
            </motion.text>
          )}
        </>
      )}

      {/* Step 3+: Slope visualization — dashed lines showing rise/run */}
      {step >= 2 && points.length >= 2 && m !== undefined && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
          {/* Run (horizontal) */}
          <line
            x1={toX(points[0][0])} y1={toY(points[0][1])}
            x2={toX(points[1][0])} y2={toY(points[0][1])}
            stroke="#2d6a2e" strokeWidth={1.5} strokeDasharray="4,3"
          />
          <text
            x={(toX(points[0][0]) + toX(points[1][0])) / 2}
            y={toY(points[0][1]) + 14}
            textAnchor="middle" fontSize={9} fontWeight="bold" fill="#2d6a2e"
          >
            {points[1][0] - points[0][0]}
          </text>
          {/* Rise (vertical) */}
          <line
            x1={toX(points[1][0])} y1={toY(points[0][1])}
            x2={toX(points[1][0])} y2={toY(points[1][1])}
            stroke="#c41e3a" strokeWidth={1.5} strokeDasharray="4,3"
          />
          <text
            x={toX(points[1][0]) + 12}
            y={(toY(points[0][1]) + toY(points[1][1])) / 2 + 4}
            fontSize={9} fontWeight="bold" fill="#c41e3a"
          >
            {points[1][1] - points[0][1]}
          </text>
        </motion.g>
      )}
    </svg>
  );
}
