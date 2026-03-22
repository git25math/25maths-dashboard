/**
 * Triangle — 三角形（含直角标记、边长/角度标注）
 * 覆盖 KP: 4.6-05~06, 6.x
 */

type Side = { length?: number | string; label?: string };
type AngleLabel = { value?: number | string; label?: string };

type Props = {
  sides?: [Side, Side, Side];           // [bottom, right, hypotenuse/left]
  angles?: [AngleLabel, AngleLabel, AngleLabel]; // [bottom-left, bottom-right, top]
  rightAngle?: 0 | 1 | 2;              // which vertex has the right angle
  labels?: [string, string, string];     // vertex labels, e.g. ['A','B','C']
  color?: string;
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  blue: '#1a3a5c',
};

export function Triangle({ sides, angles, rightAngle, labels, color }: Props) {
  const c = color || COLORS.wood;
  const width = 280;
  const height = 240;

  // Default triangle vertices: bottom-left, bottom-right, top
  const verts: [number, number][] = [
    [50, 200],   // A: bottom-left
    [240, 200],  // B: bottom-right
    [140, 40],   // C: top
  ];

  const mid = (i: number, j: number): [number, number] => [
    (verts[i][0] + verts[j][0]) / 2,
    (verts[i][1] + verts[j][1]) / 2,
  ];

  const sq = 12;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-xs mx-auto" role="img" aria-label="Triangle">
      {/* Triangle fill */}
      <polygon
        points={verts.map(v => v.join(',')).join(' ')}
        fill={c}
        fillOpacity={0.05}
        stroke={c}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Right angle marker */}
      {rightAngle !== undefined && (
        (() => {
          const vi = verts[rightAngle];
          const prev = verts[(rightAngle + 2) % 3];
          const next = verts[(rightAngle + 1) % 3];
          // Direction vectors
          const dx1 = (prev[0] - vi[0]);
          const dy1 = (prev[1] - vi[1]);
          const dx2 = (next[0] - vi[0]);
          const dy2 = (next[1] - vi[1]);
          const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
          const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          const ux1 = dx1 / len1 * sq;
          const uy1 = dy1 / len1 * sq;
          const ux2 = dx2 / len2 * sq;
          const uy2 = dy2 / len2 * sq;

          return (
            <path
              d={`M${vi[0] + ux1},${vi[1] + uy1} L${vi[0] + ux1 + ux2},${vi[1] + uy1 + uy2} L${vi[0] + ux2},${vi[1] + uy2}`}
              fill="none"
              stroke={COLORS.red}
              strokeWidth={1.5}
            />
          );
        })()
      )}

      {/* Vertex labels */}
      {labels && labels.map((l, i) => {
        const offset = i === 0 ? [-12, 14] : i === 1 ? [10, 14] : [0, -10];
        return (
          <text key={i} x={verts[i][0] + offset[0]} y={verts[i][1] + offset[1]} fontSize={14} fontWeight="bold" fill={c}>{l}</text>
        );
      })}

      {/* Side labels */}
      {sides && (
        <>
          {/* Bottom side (A→B) */}
          {sides[0].label && (
            <text x={mid(0, 1)[0]} y={mid(0, 1)[1] + 18} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.red}>{sides[0].label}</text>
          )}
          {/* Right side (B→C) */}
          {sides[1].label && (
            <text x={mid(1, 2)[0] + 12} y={mid(1, 2)[1]} textAnchor="start" fontSize={12} fontWeight="bold" fill={COLORS.red}>{sides[1].label}</text>
          )}
          {/* Left side (C→A) */}
          {sides[2].label && (
            <text x={mid(2, 0)[0] - 12} y={mid(2, 0)[1]} textAnchor="end" fontSize={12} fontWeight="bold" fill={COLORS.red}>{sides[2].label}</text>
          )}
        </>
      )}

      {/* Angle labels */}
      {angles && angles.map((a, i) => {
        if (!a.label && !a.value) return null;
        const vi = verts[i];
        const offset = i === 0 ? [18, -8] : i === 1 ? [-18, -8] : [0, 22];
        return (
          <text key={`a${i}`} x={vi[0] + offset[0]} y={vi[1] + offset[1]} textAnchor="middle" fontSize={11} fill={COLORS.blue}>{a.label || `${a.value}°`}</text>
        );
      })}
    </svg>
  );
}
