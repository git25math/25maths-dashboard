/**
 * CircleDiagram — 圆形图（半径、周长、面积标注）
 * 覆盖 KP: 5.3-01 (Circle circumference & area)
 * Y8 Unit 3: 营地篇 — 圆形瞭望塔/马厩围栏
 */

type Props = {
  radius: number;
  showArea?: boolean;
  showCircumference?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  blue: '#1a3a5c',
  gold: '#b8860b',
  areaFill: 'rgba(26,58,92,0.12)',
  circumStroke: '#8b0000',
};

export function CircleDiagram({ radius, showArea, showCircumference }: Props) {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 90; // visual radius (pixels)

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Circle diagram">
      {/* Area fill */}
      {showArea && (
        <circle cx={cx} cy={cy} r={r} fill={COLORS.areaFill} stroke="none" />
      )}

      {/* Circle outline */}
      <circle
        cx={cx} cy={cy} r={r}
        fill={showArea ? COLORS.areaFill : 'none'}
        stroke={showCircumference ? COLORS.circumStroke : COLORS.wood}
        strokeWidth={showCircumference ? 3 : 2}
        strokeDasharray={showCircumference ? '8,4' : 'none'}
      />

      {/* Centre dot */}
      <circle cx={cx} cy={cy} r={3} fill={COLORS.wood} />

      {/* Radius line */}
      <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={COLORS.gold} strokeWidth={2} />

      {/* Radius label */}
      <text
        x={cx + r / 2}
        y={cy - 8}
        textAnchor="middle"
        fontSize={14}
        fontWeight="bold"
        fill={COLORS.gold}
      >
        r = {radius}
      </text>

      {/* Area label (centre) */}
      {showArea && (
        <text
          x={cx}
          y={cy + r / 3}
          textAnchor="middle"
          fontSize={13}
          fontWeight="bold"
          fill={COLORS.blue}
        >
          A = πr²
        </text>
      )}

      {/* Circumference label (top) */}
      {showCircumference && (
        <text
          x={cx}
          y={cy - r - 10}
          textAnchor="middle"
          fontSize={13}
          fontWeight="bold"
          fill={COLORS.red}
        >
          C = 2πr
        </text>
      )}

      {/* Diameter line (faint) */}
      <line
        x1={cx - r} y1={cy} x2={cx + r} y2={cy}
        stroke={COLORS.wood}
        strokeWidth={1}
        strokeDasharray="4,4"
        opacity={0.4}
      />
    </svg>
  );
}
