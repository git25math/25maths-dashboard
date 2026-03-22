/**
 * NumberLine — 数轴组件
 * 覆盖 KP: 1.1-04, 1.1-06, 1.1-07
 */

type Mark = { value: number; label?: string; color?: string };
type Highlight = { from: number; to: number; color?: string };

type Props = {
  min: number;
  max: number;
  marks?: Mark[];
  highlights?: Highlight[];
  showArrows?: boolean;
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  scroll: '#f4e4bc',
  red: '#8b0000',
  ink: '#5c4033',
};

export function NumberLine({ min, max, marks = [], highlights = [], showArrows = true }: Props) {
  const padding = 40;
  const width = 400;
  const height = 80;
  const lineY = 50;
  const lineStart = padding;
  const lineEnd = width - padding;
  const range = max - min;

  const toX = (v: number) => lineStart + ((v - min) / range) * (lineEnd - lineStart);

  // Generate default tick marks if none provided
  const tickStep = range <= 10 ? 1 : range <= 50 ? 5 : 10;
  const ticks: number[] = [];
  for (let v = min; v <= max; v += tickStep) ticks.push(v);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto" role="img" aria-label="Number line">
      {/* Highlights */}
      {highlights.map((h, i) => (
        <rect key={i} x={toX(h.from)} y={lineY - 12} width={toX(h.to) - toX(h.from)} height={24} rx={4} fill={h.color || COLORS.red} opacity={0.15} />
      ))}

      {/* Main line */}
      <line x1={lineStart} y1={lineY} x2={lineEnd} y2={lineY} stroke={COLORS.wood} strokeWidth={2} />

      {/* Arrows */}
      {showArrows && (
        <>
          <polygon points={`${lineStart - 8},${lineY} ${lineStart},${lineY - 5} ${lineStart},${lineY + 5}`} fill={COLORS.wood} />
          <polygon points={`${lineEnd + 8},${lineY} ${lineEnd},${lineY - 5} ${lineEnd},${lineY + 5}`} fill={COLORS.wood} />
        </>
      )}

      {/* Tick marks */}
      {ticks.map((v) => (
        <g key={v}>
          <line x1={toX(v)} y1={lineY - 6} x2={toX(v)} y2={lineY + 6} stroke={COLORS.wood} strokeWidth={1.5} />
          <text x={toX(v)} y={lineY + 20} textAnchor="middle" fontSize={10} fill={COLORS.ink}>{v}</text>
        </g>
      ))}

      {/* Custom marks */}
      {marks.map((m, i) => (
        <g key={i}>
          <circle cx={toX(m.value)} cy={lineY} r={5} fill={m.color || COLORS.red} />
          {m.label && (
            <text x={toX(m.value)} y={lineY - 14} textAnchor="middle" fontSize={11} fontWeight="bold" fill={m.color || COLORS.red}>{m.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}
