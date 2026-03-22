/**
 * ShortDivision — 短除法 SVG diagram
 * Dynamically renders the short division process for finding HCF and LCM.
 *
 * Example for 12 and 18:
 *   2 │ 12   18
 *     ├─────────
 *   3 │  6    9
 *     ├─────────
 *        2    3
 *
 * HCF = left column product, LCM = left × bottom
 */

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  scroll: '#f4e4bc',
  prime: '#2d6a2e',
  gold: '#b8860b',
};

type DivisionStep = {
  prime: number;
  quotientA: number;
  quotientB: number;
};

type Props = {
  a: number;
  b: number;
  steps: DivisionStep[];
  bottomA: number;
  bottomB: number;
  /** How many steps to reveal (for animation sync with tutorial steps) */
  revealSteps?: number;
  /** Whether to highlight the HCF result */
  showHCF?: boolean;
  /** Whether to highlight the LCM result */
  showLCM?: boolean;
};

export function ShortDivision({ a, b, steps, bottomA, bottomB, revealSteps, showHCF, showLCM }: Props) {
  const reveal = revealSteps ?? steps.length;
  const ROW_H = 44;
  const COL_W = 60;
  const LEFT_PAD = 50;
  const TOP_PAD = 20;
  const totalRows = Math.min(reveal, steps.length) + 1; // +1 for bottom row
  const labelLines = (showHCF ? 1 : 0) + (showLCM ? 1 : 0);
  const height = TOP_PAD + totalRows * ROW_H + 10 + labelLines * 22;
  const width = LEFT_PAD + COL_W * 2 + 40;

  const elements: JSX.Element[] = [];

  let prevA = a;
  let prevB = b;

  for (let i = 0; i < reveal && i < steps.length; i++) {
    const y = TOP_PAD + i * ROW_H;
    const step = steps[i];

    // Left column: prime number (in green circle)
    const cx = LEFT_PAD - 25;
    const cy = y + 14;
    elements.push(
      <circle key={`c${i}`} cx={cx} cy={cy} r={14} fill={showHCF ? COLORS.gold : COLORS.prime} stroke={COLORS.prime} strokeWidth={1.5} />,
      <text key={`p${i}`} x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#fff">{step.prime}</text>,
    );

    // Vertical line segment
    elements.push(
      <line key={`vl${i}`} x1={LEFT_PAD - 5} y1={y} x2={LEFT_PAD - 5} y2={y + ROW_H} stroke={COLORS.wood} strokeWidth={2} />,
    );

    // Numbers on this row
    elements.push(
      <text key={`a${i}`} x={LEFT_PAD + 15} y={y + 18} fontSize={16} fontWeight="bold" fill={COLORS.wood}>{prevA}</text>,
      <text key={`b${i}`} x={LEFT_PAD + COL_W + 15} y={y + 18} fontSize={16} fontWeight="bold" fill={COLORS.wood}>{prevB}</text>,
    );

    // Horizontal divider line
    elements.push(
      <line key={`hl${i}`} x1={LEFT_PAD - 5} y1={y + ROW_H - 8} x2={width - 10} y2={y + ROW_H - 8} stroke={COLORS.wood} strokeWidth={1.5} />,
    );

    prevA = step.quotientA;
    prevB = step.quotientB;
  }

  // Bottom row (remaining quotients)
  if (reveal > 0) {
    const y = TOP_PAD + Math.min(reveal, steps.length) * ROW_H;
    const isBottom = reveal >= steps.length;
    elements.push(
      <text key="ba" x={LEFT_PAD + 15} y={y + 18} fontSize={16} fontWeight="bold" fill={isBottom && showLCM ? COLORS.gold : COLORS.wood}>{prevA}</text>,
      <text key="bb" x={LEFT_PAD + COL_W + 15} y={y + 18} fontSize={16} fontWeight="bold" fill={isBottom && showLCM ? COLORS.gold : COLORS.wood}>{prevB}</text>,
    );
  }

  // Result labels — each on its own line below the diagram
  const labelStartY = TOP_PAD + totalRows * ROW_H + 8;

  if (showHCF && reveal >= steps.length) {
    const leftProduct = steps.map(s => s.prime).join(' × ');
    const hcf = steps.reduce((p, s) => p * s.prime, 1);
    elements.push(
      <text key="hcf" x={width / 2} y={labelStartY} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.gold}>
        HCF = {leftProduct} = {hcf}
      </text>,
    );
  }

  if (showLCM && reveal >= steps.length) {
    const allParts = [...steps.map(s => s.prime), prevA, prevB];
    const lcm = allParts.reduce((p, n) => p * n, 1);
    const lcmY = labelStartY + (showHCF ? 20 : 0);
    elements.push(
      <text key="lcm" x={width / 2} y={lcmY} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.red}>
        LCM = {allParts.join(' × ')} = {lcm}
      </text>,
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Short division">
      {elements}
    </svg>
  );
}
