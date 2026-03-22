/**
 * IntersectingLines — 交叉线与对顶角
 * 覆盖 KP: 4.6-03
 */

type Props = {
  angle: number;             // acute angle at intersection
  showVerticallyOpposite?: boolean;
  labels?: [string, string]; // labels for the two angles
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  blue: '#1a3a5c',
};

export function IntersectingLines({ angle, showVerticallyOpposite = true, labels }: Props) {
  const width = 260;
  const height = 220;
  const cx = width / 2;
  const cy = height / 2;
  const armLen = 90;
  const arcR = 30;
  const rad = (angle * Math.PI) / 180;
  const halfRad = rad / 2;

  // Line 1: horizontal
  // Line 2: at `angle` degrees from horizontal
  const ends = {
    l1a: { x: cx - armLen, y: cy },
    l1b: { x: cx + armLen, y: cy },
    l2a: { x: cx - armLen * Math.cos(rad), y: cy + armLen * Math.sin(rad) },
    l2b: { x: cx + armLen * Math.cos(rad), y: cy - armLen * Math.sin(rad) },
  };

  const label1 = labels?.[0] || `${angle}°`;
  const label2 = labels?.[1] || `${180 - angle}°`;

  // Arc path helper
  const arcPath = (startAngle: number, endAngle: number) => {
    const sr = (startAngle * Math.PI) / 180;
    const er = (endAngle * Math.PI) / 180;
    const sx = cx + arcR * Math.cos(-sr);
    const sy = cy + arcR * Math.sin(-sr);
    const ex = cx + arcR * Math.cos(-er);
    const ey = cy + arcR * Math.sin(-er);
    const sweep = endAngle - startAngle > 180 ? 1 : 0;
    return `M${sx},${sy} A${arcR},${arcR} 0 ${sweep},0 ${ex},${ey}`;
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xs mx-auto" role="img" aria-label={`Intersecting lines at ${angle} degrees`}>
      {/* Line 1 */}
      <line x1={ends.l1a.x} y1={ends.l1a.y} x2={ends.l1b.x} y2={ends.l1b.y} stroke={COLORS.wood} strokeWidth={2} />

      {/* Line 2 */}
      <line x1={ends.l2a.x} y1={ends.l2a.y} x2={ends.l2b.x} y2={ends.l2b.y} stroke={COLORS.wood} strokeWidth={2} />

      {/* Angle arc: between line1 (0°) and line2 (angle°) — top-right */}
      <path d={arcPath(0, angle)} fill={COLORS.red} fillOpacity={0.15} stroke={COLORS.red} strokeWidth={2} />

      {/* Vertically opposite angle — bottom-left */}
      {showVerticallyOpposite && (
        <path d={arcPath(180, 180 + angle)} fill={COLORS.red} fillOpacity={0.15} stroke={COLORS.red} strokeWidth={2} />
      )}

      {/* Supplementary angles */}
      <path d={arcPath(angle, 180)} fill={COLORS.blue} fillOpacity={0.08} stroke={COLORS.blue} strokeWidth={1.5} strokeDasharray="4,3" />

      {/* Labels */}
      <text x={cx + (arcR + 14) * Math.cos(-halfRad)} y={cy + (arcR + 14) * Math.sin(-halfRad)} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.red}>{label1}</text>

      <text x={cx + (arcR + 18) * Math.cos(-(angle + (180 - angle) / 2) * Math.PI / 180)} y={cy + (arcR + 18) * Math.sin(-(angle + (180 - angle) / 2) * Math.PI / 180)} textAnchor="middle" fontSize={11} fill={COLORS.blue}>{label2}</text>

      {showVerticallyOpposite && (
        <text x={cx - (arcR + 14) * Math.cos(-halfRad)} y={cy - (arcR + 14) * Math.sin(-halfRad)} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.red}>{label1}</text>
      )}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={3} fill={COLORS.wood} />
    </svg>
  );
}
