/**
 * FractionPie — animated fraction visualization that follows tutorial steps
 *
 * 5 visual stages:
 * Step 0: nothing
 * Step 1: first pie (original denominator, e.g., 2/3)
 * Step 2: both pies side by side with operator (e.g., 2/3 + 2/6)
 * Step 3: converted pies with LCD (e.g., 4/6 + 2/6) — "通分" animation
 * Step 4: result pie (single pie showing combined result, e.g., 6/6)
 */
import { motion, AnimatePresence } from 'motion/react';

const COLORS = {
  wood: '#3d2b1f',
  fill1: '#8b0000',    // red for first fraction
  fill2: '#1a3a5c',    // blue for second fraction
  result: '#2d6a2e',   // green for result
  empty: '#f4e4bc',    // scroll color for empty slices
  stroke: '#3d2b1f',
  gold: '#b8860b',
};

type Props = {
  numerator1: number;
  denominator1: number;
  numerator2?: number;
  denominator2?: number;
  /** '+' or '-', defaults to '+' */
  op?: string;
  /** 0=nothing, 1=first pie, 2=both pies, 3=converted LCD, 4=result pie */
  step?: number;
};

function drawPie(
  cx: number, cy: number, r: number,
  numerator: number, denominator: number,
  fillColor: string, delay: number,
  keyPrefix: string,
): JSX.Element[] {
  const elements: JSX.Element[] = [];

  for (let i = 0; i < denominator; i++) {
    const startAngle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
    const endAngle = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = (1 / denominator) > 0.5 ? 1 : 0;

    const isFilled = i < numerator;
    elements.push(
      <motion.path
        key={`${keyPrefix}-slice-${i}`}
        d={`M ${cx},${cy} L ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
        fill={isFilled ? fillColor : COLORS.empty}
        stroke={COLORS.stroke}
        strokeWidth={1}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: delay + i * 0.04, duration: 0.25 }}
      />
    );
  }

  // Slice lines
  for (let i = 0; i < denominator; i++) {
    const angle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
    const lx = cx + r * Math.cos(angle);
    const ly = cy + r * Math.sin(angle);
    elements.push(
      <line key={`${keyPrefix}-line-${i}`} x1={cx} y1={cy} x2={lx} y2={ly} stroke={COLORS.stroke} strokeWidth={0.8} />
    );
  }

  // Outer ring
  elements.push(
    <circle key={`${keyPrefix}-ring`} cx={cx} cy={cy} r={r} fill="none" stroke={COLORS.stroke} strokeWidth={2} />
  );

  return elements;
}

function gcdLocal(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

export function FractionPie({ numerator1, denominator1, numerator2, denominator2, op = '+', step = 999 }: Props) {
  const hasTwoPies = numerator2 !== undefined && denominator2 !== undefined;
  const d2 = denominator2 ?? 1;
  const n2 = numerator2 ?? 0;

  // Compute LCD
  const lcd = hasTwoPies ? (denominator1 * d2) / gcdLocal(denominator1, d2) : denominator1;
  const convN1 = numerator1 * (lcd / denominator1);
  const convN2 = hasTwoPies ? n2 * (lcd / d2) : 0;
  const resultN = op === '-' ? convN1 - convN2 : convN1 + convN2;
  const needsConversion = hasTwoPies && (denominator1 !== lcd || d2 !== lcd);

  // Layout: 3 rows max (original → converted → result)
  // step mapping: 0=first pie, 1=both pies, 2+=converted, 3+=result
  const showRow1 = step >= 0;
  const showSecondPie = step >= 1;
  const showRow2 = step >= 2 && needsConversion;
  const showRow3 = step >= 3 && hasTwoPies;
  const rowCount = showRow3 ? 3 : showRow2 ? 2 : 1;

  const WIDTH = hasTwoPies ? 300 : 160;
  const ROW_H = 95;
  const ARROW_H = 22;
  const HEIGHT = rowCount * ROW_H + (showRow2 ? ARROW_H : 0) + (showRow3 ? ARROW_H : 0);
  const R = 32;

  const cx1 = hasTwoPies ? 80 : WIDTH / 2;
  const cx2 = 220;
  const cxCenter = WIDTH / 2;

  const operatorSymbol = op === '-' ? '−' : '+';

  // Y positions for each row
  const row1CY = R + 8;
  const arrowY1 = ROW_H + 4;
  const row2CY = ROW_H + ARROW_H + R + 8;
  const arrowY2 = (showRow2 ? 2 : 1) * ROW_H + (showRow2 ? ARROW_H : 0) + 4;
  const row3CY = HEIGHT - R - 18;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full max-w-sm mx-auto">
      <AnimatePresence>
        {/* ─── Row 1: Original fractions ─── */}
        {showRow1 && (
          <motion.g key="row1" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {drawPie(cx1, row1CY, R, numerator1, denominator1, COLORS.fill1, 0, 'orig1')}
            <text x={cx1} y={row1CY + R + 14} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.fill1}>
              {numerator1}/{denominator1}
            </text>

            {showSecondPie && hasTwoPies && (
              <>
                <motion.text x={cxCenter} y={row1CY + 4} textAnchor="middle" fontSize={18} fontWeight="bold" fill={COLORS.gold}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                  {operatorSymbol}
                </motion.text>
                <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.3 }}>
                  {drawPie(cx2, row1CY, R, n2, d2, COLORS.fill2, 0.3, 'orig2')}
                  <text x={cx2} y={row1CY + R + 14} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.fill2}>
                    {n2}/{d2}
                  </text>
                </motion.g>
              </>
            )}
          </motion.g>
        )}

        {/* ─── Arrow: 通分 ─── */}
        {showRow2 && (
          <motion.g key="arrow1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <text x={cxCenter} y={arrowY1} textAnchor="middle" fontSize={11} fontWeight="bold" fill={COLORS.gold}>
              ↓ 通分 (LCD = {lcd}) ↓
            </text>
          </motion.g>
        )}

        {/* ─── Row 2: Converted fractions (same LCD) ─── */}
        {showRow2 && (
          <motion.g key="row2" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {drawPie(cx1, row2CY, R, convN1, lcd, COLORS.fill1, 0.4, 'conv1')}
            <text x={cx1} y={row2CY + R + 14} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.fill1}>
              {convN1}/{lcd}
            </text>
            <motion.text x={cxCenter} y={row2CY + 4} textAnchor="middle" fontSize={18} fontWeight="bold" fill={COLORS.gold}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              {operatorSymbol}
            </motion.text>
            <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.5 }}>
              {drawPie(cx2, row2CY, R, convN2, lcd, COLORS.fill2, 0.5, 'conv2')}
              <text x={cx2} y={row2CY + R + 14} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.fill2}>
                {convN2}/{lcd}
              </text>
            </motion.g>
          </motion.g>
        )}

        {/* ─── Arrow: 合并/相减 ─── */}
        {showRow3 && (
          <motion.g key="arrow2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <text x={cxCenter} y={arrowY2} textAnchor="middle" fontSize={11} fontWeight="bold" fill={COLORS.result}>
              ↓ {op === '-' ? '相减' : '合并'} ↓
            </text>
          </motion.g>
        )}

        {/* ─── Row 3: Result pie(s) — handles improper fractions ─── */}
        {showRow3 && resultN >= 0 && (() => {
          const wholeCount = Math.floor(resultN / lcd);
          const remainder = resultN % lcd;
          const pieCount = wholeCount + (remainder > 0 ? 1 : 0);
          const rr = pieCount > 2 ? R - 8 : pieCount > 1 ? R - 4 : R + 2;
          const totalPieWidth = pieCount * (rr * 2 + 8);
          const startX = cxCenter - totalPieWidth / 2 + rr + 4;

          const g = gcdLocal(Math.abs(resultN), lcd);
          const simpN = resultN / g;
          const simpD = lcd / g;
          const simpRemN = remainder > 0 ? remainder / g : 0;
          const simpRemD = lcd / g;

          // SVG label position
          const labelY = HEIGHT - 4;

          return (
            <motion.g key="row3" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.4, delay: 0.7 }}>
              {Array.from({ length: pieCount }, (_, idx) => {
                const isFull = idx < wholeCount;
                const fillN = isFull ? lcd : remainder;
                const px = startX + idx * (rr * 2 + 8);
                return (
                  <g key={`res-${idx}`}>
                    {drawPie(px, row3CY, rr, fillN, lcd, COLORS.result, 0.7 + idx * 0.1, `result-${idx}`)}
                    {isFull && (
                      <text x={px} y={row3CY} textAnchor="middle" dominantBaseline="central"
                        fontSize={10} fontWeight="bold" fill="white" opacity={0.8}>满</text>
                    )}
                  </g>
                );
              })}
              {/* Label: mixed number using SVG text layout */}
              {simpD === 1 ? (
                <text x={cxCenter} y={labelY} textAnchor="middle" fontSize={13} fontWeight="bold" fill={COLORS.result}>
                  = {simpN}
                </text>
              ) : wholeCount > 0 && remainder > 0 ? (
                /* Mixed number: whole + fraction drawn with SVG */
                <g>
                  <text x={cxCenter - 24} y={labelY} textAnchor="middle" fontSize={13} fontWeight="bold" fill={COLORS.result}>
                    = {wholeCount}
                  </text>
                  {/* Fraction: numerator over denominator with line */}
                  <text x={cxCenter + 4} y={labelY - 8} textAnchor="middle" fontSize={10} fontWeight="bold" fill={COLORS.result}>
                    {simpRemN}
                  </text>
                  <line x1={cxCenter - 6} y1={labelY - 5} x2={cxCenter + 14} y2={labelY - 5} stroke={COLORS.result} strokeWidth={1.5} />
                  <text x={cxCenter + 4} y={labelY + 4} textAnchor="middle" fontSize={10} fontWeight="bold" fill={COLORS.result}>
                    {simpRemD}
                  </text>
                </g>
              ) : (
                /* Proper fraction: numerator/denominator */
                <g>
                  <text x={cxCenter - 10} y={labelY} textAnchor="middle" fontSize={13} fontWeight="bold" fill={COLORS.result}>
                    =
                  </text>
                  <text x={cxCenter + 8} y={labelY - 8} textAnchor="middle" fontSize={11} fontWeight="bold" fill={COLORS.result}>
                    {simpN}
                  </text>
                  <line x1={cxCenter - 2} y1={labelY - 5} x2={cxCenter + 18} y2={labelY - 5} stroke={COLORS.result} strokeWidth={1.5} />
                  <text x={cxCenter + 8} y={labelY + 4} textAnchor="middle" fontSize={11} fontWeight="bold" fill={COLORS.result}>
                    {simpD}
                  </text>
                </g>
              )}
            </motion.g>
          );
        })()}
      </AnimatePresence>
    </svg>
  );
}
