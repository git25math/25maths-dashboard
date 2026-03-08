import type { CoverParams, CoverTemplate } from './types';

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface CoverSvgRendererProps {
  template: CoverTemplate;
  params: CoverParams;
  svgRef?: React.RefObject<SVGSVGElement | null>;
}

export function CoverSvgRenderer({ template, params, svgRef }: CoverSvgRendererProps) {
  const { width, height } = template;
  const p = params;

  // Compute derived positions
  const cx = width / 2;
  const titleY = height * 0.38;
  const subtitleY = titleY + height * 0.08;
  const badgeY = height * 0.15;
  const brandY = height * 0.22;
  const formulaY = height * 0.75;
  const boardBadgeY = height * 0.88;

  // Circle sizes relative to canvas
  const circleR = Math.min(width, height) * 0.12;

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      style={{ maxWidth: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.primaryGradientStart} />
          <stop offset="100%" stopColor={p.primaryGradientEnd} />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="url(#bg-grad)" rx={20} />

      {/* Border */}
      <rect
        x={12} y={12} width={width - 24} height={height - 24}
        fill="none" stroke={p.accentColor} strokeWidth={2} rx={14} opacity={0.4}
      />

      {/* Decorative circles */}
      {p.showDecoCircles && (
        <>
          <circle
            cx={width * 0.82} cy={height * 0.18}
            r={circleR} fill={p.accentColor} opacity={0.25}
          />
          <circle
            cx={width * 0.15} cy={height * 0.78}
            r={circleR * 0.8} fill={p.textColor} opacity={0.1}
          />
        </>
      )}

      {/* Wavy shape */}
      {p.showWavyShape && (
        <path
          d={`M0,${height * 0.6} C${width * 0.3},${height * 0.55} ${width * 0.7},${height * 0.65} ${width},${height * 0.6} L${width},${height} L0,${height} Z`}
          fill={p.textColor}
          opacity={0.04}
        />
      )}

      {/* Brand text */}
      <text
        x={cx} y={brandY}
        textAnchor="middle"
        fill={p.accentColor}
        fontSize={Math.max(14, width * 0.012)}
        fontFamily="Avenir Next, system-ui, sans-serif"
        fontWeight="700"
        letterSpacing="6"
      >
        {xmlEscape(p.titleEn)}
      </text>

      {/* Badge */}
      {p.badgeText && (
        <g>
          <rect
            x={cx - 60} y={badgeY - 14}
            width={120} height={28}
            rx={14} fill={p.accentColor} opacity={0.9}
          />
          <text
            x={cx} y={badgeY + 3}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            fontFamily="Avenir Next, system-ui, sans-serif"
            fontWeight="700"
            letterSpacing="2"
          >
            {xmlEscape(p.badgeText)}
          </text>
        </g>
      )}

      {/* Main title */}
      <text
        x={cx} y={titleY}
        textAnchor="middle"
        fill={p.textColor}
        fontSize={Math.max(28, width * 0.035)}
        fontFamily="Georgia, serif"
        fontWeight="700"
      >
        {xmlEscape(p.subtitle)}
      </text>

      {/* Chinese subtitle */}
      {p.titleZh && (
        <text
          x={cx} y={subtitleY}
          textAnchor="middle"
          fill={p.textColor}
          fontSize={Math.max(18, width * 0.022)}
          fontFamily="PingFang SC, sans-serif"
          opacity={0.7}
        >
          {xmlEscape(p.titleZh)}
        </text>
      )}

      {/* Math formula decoration */}
      {p.showMathFormula && p.mathFormula && (
        <text
          x={cx} y={formulaY}
          textAnchor="middle"
          fill={p.textColor}
          fontSize={Math.max(16, width * 0.018)}
          fontFamily="Georgia, serif"
          fontStyle="italic"
          opacity={0.2}
        >
          {xmlEscape(p.mathFormula)}
        </text>
      )}

      {/* Board badge */}
      {p.boardBadge && (
        <g>
          <rect
            x={width * 0.05} y={boardBadgeY - 10}
            width={100} height={22}
            rx={4} fill={p.textColor} opacity={0.15}
          />
          <text
            x={width * 0.05 + 50} y={boardBadgeY + 4}
            textAnchor="middle"
            fill={p.textColor}
            fontSize={10}
            fontFamily="Avenir Next, system-ui, sans-serif"
            fontWeight="600"
          >
            {xmlEscape(p.boardBadge)}
          </text>
        </g>
      )}

      {/* Track badge */}
      {p.trackBadge && (
        <g>
          <rect
            x={width * 0.05 + 108} y={boardBadgeY - 10}
            width={80} height={22}
            rx={4} fill={p.accentColor} opacity={0.2}
          />
          <text
            x={width * 0.05 + 148} y={boardBadgeY + 4}
            textAnchor="middle"
            fill={p.textColor}
            fontSize={10}
            fontFamily="Avenir Next, system-ui, sans-serif"
            fontWeight="600"
          >
            {xmlEscape(p.trackBadge)}
          </text>
        </g>
      )}

      {/* 25MATHS brand watermark */}
      <text
        x={width - 30} y={height - 20}
        textAnchor="end"
        fill={p.textColor}
        fontSize={10}
        fontFamily="Avenir Next, system-ui, sans-serif"
        fontWeight="600"
        opacity={0.3}
      >
        25MATHS
      </text>
    </svg>
  );
}
