/**
 * ParallelTransversal — 平行线与截线角度关系
 * 覆盖 KP: 4.6-04
 *
 * 已知角标数值（第一条线处），待求角标 "x"（第二条线处）。
 * highlight 控制角度对类型：corresponding(F) / alternate(Z) / cointerior(C)
 */

type AngleHighlight = 'corresponding' | 'alternate' | 'cointerior';

type Props = {
  angle?: number;          // the acute angle made by the transversal (default 60)
  highlight?: AngleHighlight;
  showLabels?: boolean;
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  blue: '#1a3a5c',
  green: '#2d6a2e',
  gold: '#b8860b',
};

const HIGHLIGHT_COLORS: Record<AngleHighlight, string> = {
  corresponding: COLORS.red,
  alternate: COLORS.blue,
  cointerior: COLORS.green,
};

export function ParallelTransversal({ angle = 60, highlight, showLabels = true }: Props) {
  const width = 300;
  const height = 260;
  const lineLen = 240;
  const lineStartX = 30;
  const line1Y = 80;
  const line2Y = 180;
  const rad = (angle * Math.PI) / 180;

  // Transversal crosses both parallel lines
  const midX = width / 2;
  const transLen = 140;
  const tx1 = midX - transLen * Math.cos(rad);
  const ty1 = line1Y + transLen * Math.sin(rad) - 40;
  const tx2 = midX + transLen * Math.cos(rad);
  const ty2 = line1Y - transLen * Math.sin(rad) + 200;

  const arcR = 25;
  const givenColor = highlight ? HIGHLIGHT_COLORS[highlight] : COLORS.red;
  const unknownColor = '#d4a017'; // golden for x (待求角)

  // Intersection points
  const ix1 = midX; // intersection with line 1
  const ix2 = midX; // intersection with line 2

  // Arc endpoints for the given angle (acute angle between transversal and horizontal, above line 1)
  const arc1EndX = ix1 + arcR * Math.cos(-rad);
  const arc1EndY = line1Y + arcR * Math.sin(-rad);

  // Arc endpoints for alternate (below line 2, opposite side)
  const arc2AltEndX = ix2 - arcR * Math.cos(-rad);
  const arc2AltEndY = line2Y - arcR * Math.sin(-rad);

  // Arc endpoints for corresponding (above line 2, same side as given)
  const arc2CorEndX = ix2 + arcR * Math.cos(-rad);
  const arc2CorEndY = line2Y + arcR * Math.sin(-rad);

  // Arc endpoints for cointerior — given angle (below line 1, same side)
  const arc1CoEndX = ix1 + arcR * Math.cos(rad);
  const arc1CoEndY = line1Y + arcR * Math.sin(rad);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm mx-auto" role="img" aria-label="Parallel lines with transversal">
      {/* Parallel lines */}
      <g>
        <line x1={lineStartX} y1={line1Y} x2={lineStartX + lineLen} y2={line1Y} stroke={COLORS.wood} strokeWidth={2} />
        <line x1={lineStartX} y1={line2Y} x2={lineStartX + lineLen} y2={line2Y} stroke={COLORS.wood} strokeWidth={2} />
        {/* Parallel arrows */}
        <text x={lineStartX + lineLen - 40} y={line1Y - 8} fontSize={10} fill={COLORS.wood}>▸▸</text>
        <text x={lineStartX + lineLen - 40} y={line2Y - 8} fontSize={10} fill={COLORS.wood}>▸▸</text>
      </g>

      {/* Transversal */}
      <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={COLORS.gold} strokeWidth={2} />

      {/* ── Corresponding (F-shape): same side, same position ── */}
      {highlight === 'corresponding' && (
        <>
          {/* Given angle arc at line 1 (above-right) */}
          <path d={`M${ix1 + arcR},${line1Y} A${arcR},${arcR} 0 0,0 ${arc1EndX},${arc1EndY}`}
            fill={givenColor} fillOpacity={0.2} stroke={givenColor} strokeWidth={2} />
          {/* Unknown angle arc at line 2 (above-right, same position) */}
          <path d={`M${ix2 + arcR},${line2Y} A${arcR},${arcR} 0 0,0 ${arc2CorEndX},${arc2CorEndY}`}
            fill={unknownColor} fillOpacity={0.25} stroke={unknownColor} strokeWidth={2.5} strokeDasharray="4,3" />
        </>
      )}

      {/* ── Alternate (Z-shape): opposite sides ── */}
      {highlight === 'alternate' && (
        <>
          {/* Given angle arc at line 1 (above-right) */}
          <path d={`M${ix1 + arcR},${line1Y} A${arcR},${arcR} 0 0,0 ${arc1EndX},${arc1EndY}`}
            fill={givenColor} fillOpacity={0.2} stroke={givenColor} strokeWidth={2} />
          {/* Unknown angle arc at line 2 (below-left, opposite side) */}
          <path d={`M${ix2 - arcR},${line2Y} A${arcR},${arcR} 0 0,1 ${arc2AltEndX},${arc2AltEndY}`}
            fill={unknownColor} fillOpacity={0.25} stroke={unknownColor} strokeWidth={2.5} strokeDasharray="4,3" />
        </>
      )}

      {/* ── Co-interior (C/U-shape): same side, between lines ── */}
      {highlight === 'cointerior' && (
        <>
          {/* Given angle arc at line 1 (below-right, between lines) */}
          <path d={`M${ix1 + arcR},${line1Y} A${arcR},${arcR} 0 0,1 ${arc1CoEndX},${arc1CoEndY}`}
            fill={givenColor} fillOpacity={0.2} stroke={givenColor} strokeWidth={2} />
          {/* Unknown angle arc at line 2 (above-right, between lines) */}
          <path d={`M${ix2 + arcR},${line2Y} A${arcR},${arcR} 0 0,0 ${arc2CorEndX},${arc2CorEndY}`}
            fill={unknownColor} fillOpacity={0.25} stroke={unknownColor} strokeWidth={2.5} strokeDasharray="4,3" />
        </>
      )}

      {/* ── Labels ── */}
      {showLabels && (
        <>
          {/* Given angle: always show numeric value at line 1 */}
          {highlight === 'corresponding' && (
            <>
              <text x={ix1 + arcR + 8} y={line1Y - 6} fontSize={13} fontWeight="bold" fill={givenColor}>{angle}°</text>
              <text x={ix2 + arcR + 8} y={line2Y - 6} fontSize={16} fontWeight="bold" fontStyle="italic" fill={unknownColor}>x</text>
            </>
          )}
          {highlight === 'alternate' && (
            <>
              <text x={ix1 + arcR + 8} y={line1Y - 6} fontSize={13} fontWeight="bold" fill={givenColor}>{angle}°</text>
              <text x={ix2 - arcR - 18} y={line2Y + 16} fontSize={16} fontWeight="bold" fontStyle="italic" fill={unknownColor}>x</text>
            </>
          )}
          {highlight === 'cointerior' && (
            <>
              <text x={ix1 + arcR + 8} y={line1Y + 18} fontSize={13} fontWeight="bold" fill={givenColor}>{angle}°</text>
              <text x={ix2 + arcR + 8} y={line2Y - 6} fontSize={16} fontWeight="bold" fontStyle="italic" fill={unknownColor}>x</text>
            </>
          )}

          {/* No highlight = show both as generic */}
          {!highlight && (
            <>
              <text x={ix1 + arcR + 8} y={line1Y - 6} fontSize={13} fontWeight="bold" fill={givenColor}>{angle}°</text>
            </>
          )}
        </>
      )}

      {/* Letter shape hint (F/Z/C) — small label in corner */}
      {highlight === 'corresponding' && <text x={8} y={20} fontSize={11} fill={givenColor} opacity={0.6}>F</text>}
      {highlight === 'alternate' && <text x={8} y={20} fontSize={11} fill={givenColor} opacity={0.6}>Z</text>}
      {highlight === 'cointerior' && <text x={8} y={20} fontSize={11} fill={givenColor} opacity={0.6}>C</text>}

      {/* Intersection dots */}
      <circle cx={ix1} cy={line1Y} r={3} fill={COLORS.wood} />
      <circle cx={ix2} cy={line2Y} r={3} fill={COLORS.wood} />
    </svg>
  );
}
