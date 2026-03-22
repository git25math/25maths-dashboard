/**
 * AngleArc — 角度弧线标注
 * 覆盖 KP: 4.6-01 ~ 4.6-10
 */

type AngleType = 'acute' | 'right' | 'obtuse' | 'reflex' | 'straight';

type Props = {
  angle: number;        // degrees
  type?: AngleType;     // auto-detected if not provided
  label?: string;       // e.g. "x°" or "35°"
  color?: string;
  showProtractor?: boolean;
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  blue: '#1a3a5c',
  gold: '#b8860b',
};

export function AngleArc({ angle, label, color, showProtractor = false }: Props) {
  const c = color || COLORS.red;
  const width = 240;
  const height = 200;
  const cx = 60;
  const cy = 160;
  const armLen = 120;
  const arcR = 40;

  const rad = (angle * Math.PI) / 180;
  const endX = cx + armLen * Math.cos(-rad);
  const endY = cy + armLen * Math.sin(-rad);
  const arcEndX = cx + arcR * Math.cos(-rad);
  const arcEndY = cy + arcR * Math.sin(-rad);
  const largeArc = angle > 180 ? 1 : 0;

  // Right angle square
  const isRight = Math.abs(angle - 90) < 1;
  const sq = 15;

  // Label position
  const labelR = arcR + 16;
  const labelAngle = rad / 2;
  const labelX = cx + labelR * Math.cos(-labelAngle);
  const labelY = cy + labelR * Math.sin(-labelAngle);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xs mx-auto" role="img" aria-label={`Angle of ${angle} degrees`}>
      {/* Protractor background */}
      {showProtractor && (
        <g opacity={0.15}>
          <path d={`M${cx - 100},${cy} A100,100 0 0,1 ${cx + 100},${cy}`} fill="none" stroke={COLORS.wood} strokeWidth={1} />
          {[0, 30, 45, 60, 90, 120, 135, 150, 180].map((a) => {
            const ar = (a * Math.PI) / 180;
            return (
              <line key={a} x1={cx + 90 * Math.cos(-ar)} y1={cy + 90 * Math.sin(-ar)} x2={cx + 100 * Math.cos(-ar)} y2={cy + 100 * Math.sin(-ar)} stroke={COLORS.wood} strokeWidth={1} />
            );
          })}
        </g>
      )}

      {/* Base arm (horizontal) */}
      <line x1={cx} y1={cy} x2={cx + armLen} y2={cy} stroke={COLORS.wood} strokeWidth={2} />

      {/* Rotated arm */}
      <line x1={cx} y1={cy} x2={endX} y2={endY} stroke={COLORS.wood} strokeWidth={2} />

      {/* Angle arc or right angle square */}
      {isRight ? (
        <path d={`M${cx + sq},${cy} L${cx + sq},${cy - sq} L${cx},${cy - sq}`} fill="none" stroke={c} strokeWidth={2} />
      ) : (
        <path
          d={`M${cx + arcR},${cy} A${arcR},${arcR} 0 ${largeArc},0 ${arcEndX},${arcEndY}`}
          fill={c}
          fillOpacity={0.1}
          stroke={c}
          strokeWidth={2}
        />
      )}

      {/* Label */}
      <text x={labelX} y={labelY} textAnchor="middle" fontSize={14} fontWeight="bold" fill={c}>
        {label || `${angle}°`}
      </text>

      {/* Vertex dot */}
      <circle cx={cx} cy={cy} r={3} fill={COLORS.wood} />
    </svg>
  );
}
