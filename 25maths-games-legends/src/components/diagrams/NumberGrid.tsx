/**
 * NumberGrid — 数字网格（百数表/筛选表）
 * 覆盖 KP: 1.1-02, 1.1-03
 */
import type { ReactNode } from 'react';

type HighlightType = 'prime' | 'square' | 'cube' | 'custom';

type HighlightConfig = {
  type: HighlightType;
  color?: string;
  values?: number[];  // for 'custom' type
};

type Props = {
  range: [number, number]; // e.g. [1, 100]
  highlights?: HighlightConfig[];
  columns?: number;
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  scroll: '#f4e4bc',
  prime: '#8b0000',
  square: '#1a3a5c',
  cube: '#2d6a2e',
  custom: '#b8860b',
};

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function isSquare(n: number): boolean {
  const s = Math.sqrt(n);
  return s === Math.floor(s);
}

function isCube(n: number): boolean {
  const c = Math.round(Math.cbrt(n));
  return c * c * c === n;
}

export function NumberGrid({ range, highlights = [], columns = 10 }: Props) {
  const [start, end] = range;
  const count = end - start + 1;
  const rows = Math.ceil(count / columns);
  const cellSize = 36;
  const width = columns * cellSize + 2;
  const height = rows * cellSize + 2;

  const getHighlight = (n: number): string | null => {
    for (const h of highlights) {
      const color = h.color || COLORS[h.type];
      if (h.type === 'prime' && isPrime(n)) return color;
      if (h.type === 'square' && isSquare(n)) return color;
      if (h.type === 'cube' && isCube(n)) return color;
      if (h.type === 'custom' && h.values?.includes(n)) return color;
    }
    return null;
  };

  const cells: ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const n = start + i;
    const col = i % columns;
    const row = Math.floor(i / columns);
    const x = col * cellSize + 1;
    const y = row * cellSize + 1;
    const bg = getHighlight(n);

    cells.push(
      <g key={n}>
        <rect x={x} y={y} width={cellSize} height={cellSize} fill={bg || 'transparent'} fillOpacity={bg ? 0.15 : 0} stroke={COLORS.wood} strokeWidth={0.5} strokeOpacity={0.3} />
        <text x={x + cellSize / 2} y={y + cellSize / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={bg ? 'bold' : 'normal'} fill={bg || COLORS.wood}>{n}</text>
      </g>
    );
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto" role="img" aria-label="Number grid">
      <rect x={0} y={0} width={width} height={height} rx={4} fill={COLORS.scroll} fillOpacity={0.3} />
      {cells}
    </svg>
  );
}
