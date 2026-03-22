/**
 * BalanceScale — 天平/等式可视化
 * 覆盖 KP: 2.5-01 ~ 2.5-05
 */

type Props = {
  left: string;   // e.g. "3x"
  right: string;  // e.g. "15"
  operation?: string; // e.g. "÷3" — shows what operation balances the scale
  balanced?: boolean;
  interactive?: boolean;
  step?: number;  // 0=show equation, 1=show operation hint, 2=show result
  resultLeft?: string;  // e.g. "x" after operation
  resultRight?: string; // e.g. "5" after operation
};

const COLORS = {
  wood: '#3d2b1f',
  scroll: '#f4e4bc',
  red: '#8b0000',
  gold: '#b8860b',
};

export function BalanceScale({ left, right, operation, balanced = true, step, resultLeft, resultRight }: Props) {
  const width = 360;
  const height = 200;
  const centerX = width / 2;
  const beamY = balanced ? 80 : 80;
  const tilt = balanced ? 0 : 5;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-sm mx-auto" role="img" aria-label="Balance scale equation">
      {/* Base */}
      <polygon points={`${centerX - 30},${height - 20} ${centerX + 30},${height - 20} ${centerX},${height - 50}`} fill={COLORS.wood} />

      {/* Post */}
      <line x1={centerX} y1={height - 50} x2={centerX} y2={beamY} stroke={COLORS.wood} strokeWidth={4} />

      {/* Fulcrum triangle */}
      <polygon points={`${centerX - 10},${beamY} ${centerX + 10},${beamY} ${centerX},${beamY - 10}`} fill={COLORS.gold} />

      {/* Beam */}
      <line x1={60} y1={beamY + tilt} x2={width - 60} y2={beamY - tilt} stroke={COLORS.wood} strokeWidth={3} strokeLinecap="round" />

      {/* Left pan */}
      <g transform={`translate(90, ${beamY + tilt + 5})`}>
        <line x1={-30} y1={0} x2={30} y2={0} stroke={COLORS.wood} strokeWidth={1} />
        <line x1={-30} y1={0} x2={-30} y2={30} stroke={COLORS.wood} strokeWidth={1} />
        <line x1={30} y1={0} x2={30} y2={30} stroke={COLORS.wood} strokeWidth={1} />
        <path d="M-30,30 Q0,45 30,30" fill={COLORS.scroll} stroke={COLORS.wood} strokeWidth={1.5} />
        <text x={0} y={25} textAnchor="middle" fontSize={16} fontWeight="bold" fill={COLORS.red}>{left}</text>
      </g>

      {/* Right pan */}
      <g transform={`translate(${width - 90}, ${beamY - tilt + 5})`}>
        <line x1={-30} y1={0} x2={30} y2={0} stroke={COLORS.wood} strokeWidth={1} />
        <line x1={-30} y1={0} x2={-30} y2={30} stroke={COLORS.wood} strokeWidth={1} />
        <line x1={30} y1={0} x2={30} y2={30} stroke={COLORS.wood} strokeWidth={1} />
        <path d="M-30,30 Q0,45 30,30" fill={COLORS.scroll} stroke={COLORS.wood} strokeWidth={1.5} />
        <text x={0} y={25} textAnchor="middle" fontSize={16} fontWeight="bold" fill={COLORS.red}>{right}</text>
      </g>

      {/* Equals sign */}
      <text x={centerX} y={beamY + 55} textAnchor="middle" fontSize={20} fontWeight="bold" fill={COLORS.wood}>=</text>

      {/* Result state after operation */}
      {step !== undefined && step >= 2 && resultLeft && resultRight && (
        <g opacity={0.6}>
          <text x={90} y={beamY + 65} textAnchor="middle" fontSize={11} fill={COLORS.gold}>↓</text>
          <text x={90} y={beamY + 80} textAnchor="middle" fontSize={14} fontWeight="bold" fill={COLORS.gold}>{resultLeft}</text>
          <text x={width - 90} y={beamY + 65} textAnchor="middle" fontSize={11} fill={COLORS.gold}>↓</text>
          <text x={width - 90} y={beamY + 80} textAnchor="middle" fontSize={14} fontWeight="bold" fill={COLORS.gold}>{resultRight}</text>
        </g>
      )}

      {/* Operation hint */}
      {operation && (step === undefined || step >= 1) && (
        <g>
          <rect x={centerX - 25} y={height - 30} width={50} height={22} rx={4} fill={COLORS.gold} fillOpacity={0.2} stroke={COLORS.gold} strokeWidth={1} />
          <text x={centerX} y={height - 14} textAnchor="middle" fontSize={12} fontWeight="bold" fill={COLORS.gold}>{operation}</text>
        </g>
      )}
    </svg>
  );
}
