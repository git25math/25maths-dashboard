/**
 * FactorTree — 因数树
 * 覆盖 KP: 1.1-08, 1.1-09
 */
import type { ReactNode } from 'react';

type TreeNode = {
  value: number;
  isPrime?: boolean;
  children?: [TreeNode, TreeNode];
};

type Props = {
  root: TreeNode;
  interactive?: boolean;
  revealDepth?: number;  // how many levels to show (undefined = all)
};

const COLORS = {
  wood: '#3d2b1f',
  red: '#8b0000',
  scroll: '#f4e4bc',
  prime: '#2d6a2e',
};

function getDepth(node: TreeNode): number {
  if (!node.children) return 0;
  return 1 + Math.max(getDepth(node.children[0]), getDepth(node.children[1]));
}

function renderNode(node: TreeNode, x: number, y: number, spread: number, depth: number, maxReveal: number): ReactNode[] {
  if (depth > maxReveal) return []; // Don't render beyond reveal depth
  const elements: ReactNode[] = [];
  const isPrime = node.isPrime || !node.children;
  const r = 18;
  const key = `${x}-${y}-${node.value}`;

  if (node.children) {
    const [left, right] = node.children;
    const nextY = y + 60;
    const lx = x - spread;
    const rx = x + spread;

    // Lines to children
    elements.push(
      <line key={`${key}-ll`} x1={x} y1={y + r} x2={lx} y2={nextY - r} stroke={COLORS.wood} strokeWidth={1.5} />,
      <line key={`${key}-lr`} x1={x} y1={y + r} x2={rx} y2={nextY - r} stroke={COLORS.wood} strokeWidth={1.5} />,
    );

    elements.push(...renderNode(left, lx, nextY, spread / 2, depth + 1, maxReveal));
    elements.push(...renderNode(right, rx, nextY, spread / 2, depth + 1, maxReveal));
  }

  // Node circle
  elements.push(
    <circle key={`${key}-c`} cx={x} cy={y} r={r} fill={isPrime ? COLORS.prime : COLORS.scroll} stroke={isPrime ? COLORS.prime : COLORS.wood} strokeWidth={2} />,
    <text key={`${key}-t`} x={x} y={y + 5} textAnchor="middle" fontSize={13} fontWeight="bold" fill={isPrime ? '#fff' : COLORS.wood}>{node.value}</text>,
  );

  return elements;
}

export function FactorTree({ root, revealDepth }: Props) {
  const depth = getDepth(root);
  const maxReveal = revealDepth ?? depth;
  const height = 60 + depth * 60 + 40;
  const width = Math.max(300, Math.pow(2, depth) * 50);
  const spread = width / 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md mx-auto" role="img" aria-label="Factor tree">
      {renderNode(root, width / 2, 35, spread, 0, maxReveal)}
    </svg>
  );
}
