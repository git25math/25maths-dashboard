/**
 * VennDiagram — 集合韦恩图
 * 覆盖 KP: 1.1-01, 1.1-09
 */

type VennSet = { label: string; elements?: string[]; color?: string };

type Props = {
  sets: [VennSet, VennSet];
  intersection?: string[];
  universalLabel?: string;
  interactive?: boolean;
};

const COLORS = {
  wood: '#3d2b1f',
  scroll: '#f4e4bc',
  red: '#8b0000',
  blue: '#1a3a5c',
};

export function VennDiagram({ sets, intersection = [], universalLabel = 'ξ' }: Props) {
  const width = 360;
  const height = 240;
  const cx1 = 130, cx2 = 230, cy = 130, r = 80;

  const [setA, setB] = sets;
  const colorA = setA.color || COLORS.red;
  const colorB = setB.color || COLORS.blue;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm mx-auto" role="img" aria-label="Venn diagram">
      {/* Universal set rectangle */}
      <rect x={10} y={10} width={width - 20} height={height - 20} rx={8} fill="none" stroke={COLORS.wood} strokeWidth={1.5} />
      <text x={25} y={32} fontSize={14} fontWeight="bold" fill={COLORS.wood}>{universalLabel}</text>

      {/* Set A */}
      <circle cx={cx1} cy={cy} r={r} fill={colorA} fillOpacity={0.12} stroke={colorA} strokeWidth={2} />
      <text x={cx1 - 40} y={cy - r - 8} fontSize={13} fontWeight="bold" fill={colorA}>{setA.label}</text>

      {/* Set B */}
      <circle cx={cx2} cy={cy} r={r} fill={colorB} fillOpacity={0.12} stroke={colorB} strokeWidth={2} />
      <text x={cx2 + 10} y={cy - r - 8} fontSize={13} fontWeight="bold" fill={colorB}>{setB.label}</text>

      {/* Set A only elements */}
      {setA.elements && setA.elements.filter(e => !intersection.includes(e)).map((e, i) => (
        <text key={`a-${i}`} x={cx1 - 30} y={cy - 10 + i * 18} fontSize={12} fill={COLORS.wood}>{e}</text>
      ))}

      {/* Intersection elements */}
      {intersection.map((e, i) => (
        <text key={`i-${i}`} x={(cx1 + cx2) / 2} y={cy - 10 + i * 18} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.wood}>{e}</text>
      ))}

      {/* Set B only elements */}
      {setB.elements && setB.elements.filter(e => !intersection.includes(e)).map((e, i) => (
        <text key={`b-${i}`} x={cx2 + 15} y={cy - 10 + i * 18} fontSize={12} fill={COLORS.wood}>{e}</text>
      ))}
    </svg>
  );
}
