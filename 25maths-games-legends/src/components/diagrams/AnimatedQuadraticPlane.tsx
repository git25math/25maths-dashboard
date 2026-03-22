/**
 * AnimatedQuadraticPlane — step-by-step animated parabola visualization
 * Syncs with tutorial steps: each step reveals more elements (points, curve, labels)
 *
 * Usage in PracticeScreen Green phase:
 *   <AnimatedQuadraticPlane step={tutorialStep} points={...} a={2} c={3} />
 *
 * Supports two modes:
 *   - Functions: y = ax² + c  (b=0, vertex at x=0)
 *   - Calculus:  f(x) = ax² + bx  (c=0, vertex at x = -b/(2a))
 *
 * Step 0: Show empty coordinate plane (grid + axes fade in)
 * Step 1: Plot the vertex/y-intercept point with spring animation
 * Step 2: Draw the parabola curve + equation label
 * Step 3: Plot second point + dashed guide lines + axis of symmetry
 */
import { motion } from 'motion/react';

type Props = {
  /** Current tutorial step (0-based) */
  step: number;
  /** Key points: [vertex/y-intercept, second point] */
  points: [number, number][];
  /** Leading coefficient */
  a: number;
  /** Linear coefficient (for f(x)=ax²+bx mode, default 0) */
  b?: number;
  /** Constant term (for y=ax²+c mode, default 0) */
  c: number;
  /** Equation label like "y = 2x² + 3" */
  label?: string;
};

const PADDING = 35;
const SIZE = 320;
const PLOT = SIZE - PADDING * 2;

export function AnimatedQuadraticPlane({ step, points, a, b = 0, c, label }: Props) {
  // Determine mode: Calculus if b !== 0 (f(x) = ax² + bx), Functions if c provided (y = ax² + c)
  const isCalcMode = b !== 0;

  // Axis of symmetry: x = -b/(2a)
  const axisOfSymmetry = -b / (2 * a);

  // Compute parabola function
  const parabola = (x: number) => a * x * x + b * x + c;

  // Auto-calculate range from points and curve extent
  const allX = points.map(p => p[0]);
  const allY = points.map(p => p[1]);

  // Include axis of symmetry and a few surrounding points in range calculation
  const sampleXs = [-3, -2, -1, 0, 1, 2, 3, axisOfSymmetry];
  for (const sx of sampleXs) {
    const sy = parabola(sx);
    if (Math.abs(sy) < 50) {
      allX.push(sx);
      allY.push(sy);
    }
  }

  const xMin = Math.min(-2, ...allX) - 1;
  const xMax = Math.max(2, ...allX) + 1;
  const rawYMin = Math.min(-2, ...allY) - 1;
  const rawYMax = Math.max(2, ...allY) + 1;
  // Clamp y range to avoid extreme stretching
  const yMin = Math.max(rawYMin, -15);
  const yMax = Math.min(rawYMax, 15);

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

  // Build parabola SVG path — sample ~40 points across visible x range
  const curvePoints: string[] = [];
  const numSamples = 40;
  const dx = (xMax - xMin) / numSamples;
  for (let i = 0; i <= numSamples; i++) {
    const x = xMin + i * dx;
    const y = parabola(x);
    // Clip to visible y range with a small margin
    if (y < yMin - 2 || y > yMax + 2) continue;
    const svgX = toX(x).toFixed(1);
    const svgY = toY(y).toFixed(1);
    if (curvePoints.length === 0) {
      curvePoints.push(`M${svgX},${svgY}`);
    } else {
      curvePoints.push(`L${svgX},${svgY}`);
    }
  }
  const curvePath = curvePoints.join(' ');

  // Build equation label
  const eqLabel = label || (isCalcMode
    ? `f(x) = ${a === 1 ? '' : a === -1 ? '-' : a}x² ${b >= 0 ? '+' : ''}${b === 1 ? '' : b === -1 ? '-' : b}x`
    : `y = ${a === 1 ? '' : a === -1 ? '-' : a}x² ${c >= 0 ? '+ ' + c : '- ' + Math.abs(c)}`);

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

      {/* Step 1+: Plot vertex / y-intercept point */}
      {step >= 1 && points[0] && (
        <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}>
          <circle cx={toX(points[0][0])} cy={toY(points[0][1])} r={6} fill="#dc2626" />
          <circle cx={toX(points[0][0])} cy={toY(points[0][1])} r={10} fill="none" stroke="#dc2626" strokeWidth={1} opacity={0.4} />
          <text x={toX(points[0][0]) + 12} y={toY(points[0][1]) - 8} fontSize={11} fontWeight="bold" fill="#dc2626">
            ({points[0][0]},{points[0][1]})
          </text>
        </motion.g>
      )}

      {/* Step 2+: Parabola curve + equation label */}
      {step >= 2 && (
        <>
          <motion.path
            d={curvePath}
            fill="none"
            stroke="#c74440"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          {/* Equation label */}
          <motion.text
            x={SIZE - PADDING - 5}
            y={PADDING + 16}
            textAnchor="end"
            fontSize={11}
            fontWeight="bold"
            fill="#c74440"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {eqLabel}
          </motion.text>
        </>
      )}

      {/* Step 3+: Second point + dashed guide lines + axis of symmetry */}
      {step >= 2 && points[1] && (
        <>
          {/* Second point */}
          <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5, duration: 0.6, delay: 0.3 }}>
            <circle cx={toX(points[1][0])} cy={toY(points[1][1])} r={6} fill="#2563eb" />
            <circle cx={toX(points[1][0])} cy={toY(points[1][1])} r={10} fill="none" stroke="#2563eb" strokeWidth={1} opacity={0.4} />
            <text x={toX(points[1][0]) + 12} y={toY(points[1][1]) - 8} fontSize={11} fontWeight="bold" fill="#2563eb">
              ({points[1][0]},{points[1][1]})
            </text>
          </motion.g>

          {/* Dashed lines from second point to axes */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            {/* Horizontal dashed line to y-axis */}
            <line
              x1={toX(points[1][0])} y1={toY(points[1][1])}
              x2={toX(0)} y2={toY(points[1][1])}
              stroke="#2d6a2e" strokeWidth={1.5} strokeDasharray="4,3"
            />
            {/* Vertical dashed line to x-axis */}
            <line
              x1={toX(points[1][0])} y1={toY(points[1][1])}
              x2={toX(points[1][0])} y2={toY(0)}
              stroke="#2d6a2e" strokeWidth={1.5} strokeDasharray="4,3"
            />
          </motion.g>

          {/* Axis of symmetry — dashed vertical line */}
          <motion.line
            x1={toX(axisOfSymmetry)} y1={PADDING}
            x2={toX(axisOfSymmetry)} y2={SIZE - PADDING}
            stroke="#8b6914"
            strokeWidth={1.5}
            strokeDasharray="6,4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
          />
          <motion.text
            x={toX(axisOfSymmetry) + 4}
            y={PADDING + 28}
            fontSize={9}
            fill="#8b6914"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
          >
            x={axisOfSymmetry}
          </motion.text>
        </>
      )}
    </svg>
  );
}
