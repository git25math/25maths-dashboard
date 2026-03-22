/**
 * CompassRose — 罗盘方位图
 * 覆盖 KP: 4.6-05 (bearings)
 */

type Props = {
  bearing?: number;    // degrees clockwise from North
  showNorth?: boolean;
  label?: string;      // e.g. "070°"
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  gold: '#b8860b',
  scroll: '#f4e4bc',
};

export function CompassRose({ bearing, showNorth = true, label }: Props) {
  const width = 240;
  const height = 240;
  const cx = width / 2;
  const cy = height / 2;
  const outerR = 95;
  const innerR = 70;
  const needleR = 80;

  const dirs = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];

  const bearingRad = bearing !== undefined ? (bearing * Math.PI) / 180 : undefined;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xs mx-auto" role="img" aria-label={bearing !== undefined ? `Compass bearing ${bearing} degrees` : 'Compass rose'}>
      {/* Outer circle */}
      <circle cx={cx} cy={cy} r={outerR} fill={COLORS.scroll} fillOpacity={0.3} stroke={COLORS.wood} strokeWidth={2} />

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR} fill="none" stroke={COLORS.wood} strokeWidth={0.5} strokeOpacity={0.3} />

      {/* Tick marks every 30° */}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i * 30 * Math.PI) / 180;
        const r1 = outerR - 8;
        const r2 = outerR;
        return (
          <line key={i} x1={cx + r1 * Math.sin(a)} y1={cy - r1 * Math.cos(a)} x2={cx + r2 * Math.sin(a)} y2={cy - r2 * Math.cos(a)} stroke={COLORS.wood} strokeWidth={1} />
        );
      })}

      {/* Cardinal directions */}
      {dirs.map((d) => {
        const a = (d.angle * Math.PI) / 180;
        const r = outerR + 14;
        return (
          <text
            key={d.label}
            x={cx + r * Math.sin(a)}
            y={cy - r * Math.cos(a) + 5}
            textAnchor="middle"
            fontSize={d.label === 'N' ? 16 : 13}
            fontWeight="bold"
            fill={d.label === 'N' ? COLORS.red : COLORS.wood}
          >
            {d.label}
          </text>
        );
      })}

      {/* North arrow */}
      {showNorth && (
        <polygon
          points={`${cx},${cy - needleR} ${cx - 6},${cy - needleR + 16} ${cx + 6},${cy - needleR + 16}`}
          fill={COLORS.red}
        />
      )}

      {/* Bearing line */}
      {bearingRad !== undefined && (
        <>
          <line
            x1={cx} y1={cy}
            x2={cx + needleR * Math.sin(bearingRad)}
            y2={cy - needleR * Math.cos(bearingRad)}
            stroke={COLORS.gold}
            strokeWidth={2.5}
            strokeLinecap="round"
          />

          {/* Bearing arc from North */}
          {bearing !== undefined && bearing > 0 && (
            <path
              d={`M${cx},${cy - 35} A35,35 0 ${bearing > 180 ? 1 : 0},1 ${cx + 35 * Math.sin(bearingRad)},${cy - 35 * Math.cos(bearingRad)}`}
              fill={COLORS.gold}
              fillOpacity={0.15}
              stroke={COLORS.gold}
              strokeWidth={1.5}
            />
          )}

          {/* Label */}
          {(label || bearing !== undefined) && (
            <text
              x={cx + 50 * Math.sin(bearingRad / 2)}
              y={cy - 50 * Math.cos(bearingRad / 2)}
              textAnchor="middle"
              fontSize={13}
              fontWeight="bold"
              fill={COLORS.gold}
            >
              {label || `${String(bearing).padStart(3, '0')}°`}
            </text>
          )}
        </>
      )}

      {/* Center dot */}
      <circle cx={cx} cy={cy} r={4} fill={COLORS.wood} />
    </svg>
  );
}
