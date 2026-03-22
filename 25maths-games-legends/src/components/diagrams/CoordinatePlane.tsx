/**
 * CoordinatePlane — 坐标平面
 * 覆盖 KP: 2.5-08, 2.5-13, 3.x 全部
 */
import type { ReactNode } from 'react';

type Point = { x: number; y: number; label?: string; color?: string };
type Line = { points: [Point, Point]; color?: string; dashed?: boolean };
type Curve = { fn: (x: number) => number; color?: string; label?: string };

type Props = {
  xRange: [number, number];
  yRange: [number, number];
  points?: Point[];
  lines?: Line[];
  curves?: Curve[];
  showGrid?: boolean;
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  grid: '#d4c5a9',
  red: '#8b0000',
  blue: '#1a3a5c',
  green: '#2d6a2e',
};

export function CoordinatePlane({
  xRange,
  yRange,
  points = [],
  lines = [],
  curves = [],
  showGrid = true,
}: Props) {
  const padding = 35;
  const width = 360;
  const height = 360;
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;

  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const toSvgX = (x: number) => padding + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => padding + ((yMax - y) / (yMax - yMin)) * plotH;

  // Grid lines
  const gridElements: ReactNode[] = [];
  if (showGrid) {
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      gridElements.push(<line key={`gx${x}`} x1={toSvgX(x)} y1={padding} x2={toSvgX(x)} y2={height - padding} stroke={COLORS.grid} strokeWidth={0.5} />);
    }
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      gridElements.push(<line key={`gy${y}`} x1={padding} y1={toSvgY(y)} x2={width - padding} y2={toSvgY(y)} stroke={COLORS.grid} strokeWidth={0.5} />);
    }
  }

  // Axis tick labels
  const axisLabels: ReactNode[] = [];
  for (let x = Math.ceil(xMin); x <= xMax; x++) {
    if (x === 0) continue;
    axisLabels.push(<text key={`lx${x}`} x={toSvgX(x)} y={toSvgY(0) + 14} textAnchor="middle" fontSize={9} fill={COLORS.wood}>{x}</text>);
  }
  for (let y = Math.ceil(yMin); y <= yMax; y++) {
    if (y === 0) continue;
    axisLabels.push(<text key={`ly${y}`} x={toSvgX(0) - 8} y={toSvgY(y) + 3} textAnchor="end" fontSize={9} fill={COLORS.wood}>{y}</text>);
  }

  // Curve paths
  const curvePaths = curves.map((c, i) => {
    const step = (xMax - xMin) / 200;
    let d = '';
    for (let x = xMin; x <= xMax; x += step) {
      const y = c.fn(x);
      if (y < yMin - 5 || y > yMax + 5) {
        d += ' ';
        continue;
      }
      const cmd = d.length === 0 || d.endsWith(' ') ? 'M' : 'L';
      d += `${cmd}${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)} `;
    }
    return <path key={`curve-${i}`} d={d} fill="none" stroke={c.color || COLORS.red} strokeWidth={2} />;
  });

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm mx-auto" role="img" aria-label="Coordinate plane">
      {gridElements}

      {/* X axis */}
      {yMin <= 0 && yMax >= 0 && (
        <>
          <line x1={padding} y1={toSvgY(0)} x2={width - padding} y2={toSvgY(0)} stroke={COLORS.wood} strokeWidth={1.5} />
          <text x={width - padding + 12} y={toSvgY(0) + 4} fontSize={12} fontWeight="bold" fill={COLORS.wood}>x</text>
        </>
      )}

      {/* Y axis */}
      {xMin <= 0 && xMax >= 0 && (
        <>
          <line x1={toSvgX(0)} y1={padding} x2={toSvgX(0)} y2={height - padding} stroke={COLORS.wood} strokeWidth={1.5} />
          <text x={toSvgX(0) - 4} y={padding - 8} fontSize={12} fontWeight="bold" fill={COLORS.wood}>y</text>
        </>
      )}

      {axisLabels}

      {/* Origin label */}
      {xMin <= 0 && xMax >= 0 && yMin <= 0 && yMax >= 0 && (
        <text x={toSvgX(0) - 10} y={toSvgY(0) + 14} fontSize={10} fill={COLORS.wood}>O</text>
      )}

      {/* Lines */}
      {lines.map((l, i) => (
        <line
          key={`line-${i}`}
          x1={toSvgX(l.points[0].x)} y1={toSvgY(l.points[0].y)}
          x2={toSvgX(l.points[1].x)} y2={toSvgY(l.points[1].y)}
          stroke={l.color || COLORS.blue}
          strokeWidth={2}
          strokeDasharray={l.dashed ? '6,4' : undefined}
        />
      ))}

      {/* Curves */}
      {curvePaths}

      {/* Points */}
      {points.map((p, i) => (
        <g key={`pt-${i}`}>
          <circle cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={4} fill={p.color || COLORS.red} />
          {p.label && (
            <text x={toSvgX(p.x) + 8} y={toSvgY(p.y) - 6} fontSize={11} fontWeight="bold" fill={p.color || COLORS.red}>{p.label}</text>
          )}
        </g>
      ))}
    </svg>
  );
}
