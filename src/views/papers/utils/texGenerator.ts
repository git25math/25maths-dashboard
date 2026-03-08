import type { PaperConfig, PaperQuestion, PaperBoard } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTierLabel(board: PaperBoard, tier: string): string {
  if (board === 'cie') return tier === 'core' ? 'Core' : 'Extended';
  return tier === 'foundation' ? 'Foundation' : 'Higher';
}

/** CIE uses CIE-0580-Master-Style; Edexcel IGCSE uses IGCSE-Master-Style */
function getStylePackage(board: PaperBoard): string {
  return board === 'cie' ? 'CIE-0580-Master-Style' : 'IGCSE-Master-Style';
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} minutes`;
  if (m === 0) return `${h} hour${h > 1 ? 's' : ''}`;
  return `${h} hour${h > 1 ? 's' : ''} ${m} minutes`;
}

/**
 * Normalise a parts entry regardless of CIE/Edexcel source format.
 *   CIE:     { label: "(a)", marks: 1 }
 *   Edexcel: { p: "a",       m: 1     }
 */
function normalisePart(part: { label: string; marks: number } | { p: string; m: number }): {
  label: string;
  marks: number;
} {
  if ('label' in part) return part;
  return { label: `(${part.p})`, marks: part.m };
}

// ─── Part-text splitter ───────────────────────────────────────────────────────

/**
 * Split question tex into per-part text segments.
 * CIE tex uses plain `(a)`, `(b)` markers; Edexcel uses `**(a)**`.
 * Returns an empty array when splitting fails (caller falls back to raw tex).
 */
function splitByParts(
  tex: string,
  rawParts: PaperQuestion['parts'],
  board: PaperBoard,
): string[] {
  const parts = rawParts.map(normalisePart);
  if (parts.length === 0) return [];

  // Build board-appropriate markers
  // CIE:     "(a)", "(b)" ...  Edexcel: "**(a)**", "**(b)**" ...
  const toMarker = (label: string) =>
    board === 'cie' ? label : `**${label}**`;

  const markers = parts.map(p => toMarker(p.label));

  // Find intro text (before first marker)
  const firstIdx = tex.indexOf(markers[0]);
  if (firstIdx < 0) return [];

  const intro = tex.slice(0, firstIdx).trim();
  const results: string[] = [];

  let remaining = tex.slice(firstIdx);

  for (let i = 0; i < markers.length; i++) {
    const cur = markers[i];
    const idx = remaining.indexOf(cur);
    if (idx < 0) return [];

    // Text starts after the current marker
    const afterMarker = remaining.slice(idx + cur.length);
    const nextMarker = i < markers.length - 1 ? markers[i + 1] : null;
    const end = nextMarker ? afterMarker.indexOf(nextMarker) : afterMarker.length;
    if (end < 0) return [];

    results.push(afterMarker.slice(0, end).trim());
    remaining = afterMarker.slice(end);
  }

  return [intro, ...results];
}

// ─── Minor tex cleanup ────────────────────────────────────────────────────────

function cleanTex(tex: string): string {
  return tex
    .replace(/\[Figure\]/g, '') // figure placeholder handled separately
    .replace(/\*\*\([a-z]+\)\*\*/g, '') // remove Edexcel **_(x)_** markers
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── CIE multi-part block generator ──────────────────────────────────────────

function cieMultiPartBlock(
  q: PaperQuestion,
  parts: { label: string; marks: number }[],
  partTexts: string[], // [intro, textA, textB, ...]
): string[] {
  const lines: string[] = [];
  const intro = partTexts[0] ? cleanTex(partTexts[0]) : '';

  lines.push(`\\begin{question}{${q.marks}}`);
  if (intro) lines.push(`  ${intro}`);

  if (q.hasFigure && !intro) lines.push(`  % [FIGURE PLACEHOLDER]`);

  lines.push(`  \\begin{subpartsaliged}`);
  for (let pi = 0; pi < parts.length; pi++) {
    const partText = cleanTex(partTexts[pi + 1] || '');
    lines.push(`    \\item ${partText}`);
    if (q.hasFigure && (partTexts[pi + 1] || '').includes('[Figure]')) {
      lines.push(`    % [FIGURE PLACEHOLDER]`);
    }
    lines.push(`    \\Marks{${parts[pi].marks}}`);
  }
  lines.push(`  \\end{subpartsaliged}`);
  lines.push(`\\end{question}`);

  return lines;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Generate a complete .tex file from config + selected questions.
 * Compatible with both CIE 0580 and Edexcel IGCSE question data formats.
 */
export function generatePaperTex(config: PaperConfig, questions: PaperQuestion[]): string {
  const tierLabel = getTierLabel(config.board, config.tier);
  const stylePackage = getStylePackage(config.board);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

  const lines: string[] = [
    `\\documentclass[11pt,a4paper]{article}`,
    `\\usepackage{${stylePackage}}`,
    ``,
    `\\renewcommand{\\PaperNumber}{${config.paperNumber}}`,
    `\\renewcommand{\\PaperTier}{${tierLabel}}`,
    `\\renewcommand{\\ExamSession}{${config.examSession.replace(/%/g, '\\%')}}`,
    `\\renewcommand{\\ExamYear}{${config.examYear}}`,
    `\\renewcommand{\\TimeAllowed}{${formatTime(config.timeMinutes)}}`,
    `\\renewcommand{\\TotalMarks}{${totalMarks}}`,
    ``,
    `\\begin{document}`,
    `\\MakeStandardCover`,
    ``,
  ];

  questions.forEach((q, i) => {
    const qNum = i + 1;
    lines.push(`% Q${qNum} [src: ${q.src}] [${q.marks} marks]`);

    if (q.parts.length === 0) {
      // ── Single-part question ──────────────────────────────────────────────
      lines.push(`\\begin{question}{${q.marks}}`);
      lines.push(`  ${cleanTex(q.tex)}`);
      if (q.hasFigure) lines.push(`  % [FIGURE PLACEHOLDER]`);
      lines.push(`  \\AnswerLine[][]`);
      lines.push(`  \\Marks{${q.marks}}`);
      lines.push(`\\end{question}`);
    } else {
      // ── Multi-part question ───────────────────────────────────────────────
      const parts = q.parts.map(normalisePart);
      const partTexts = splitByParts(q.tex, q.parts, config.board);

      if (partTexts.length === parts.length + 1) {
        // Successful split: [intro, textA, textB, ...]
        lines.push(...cieMultiPartBlock(q, parts, partTexts));
      } else {
        // Fallback: wrap raw tex, list parts with AnswerLine each
        lines.push(`\\begin{question}{${q.marks}}`);
        lines.push(`  ${cleanTex(q.tex)}`);
        if (q.hasFigure) lines.push(`  % [FIGURE PLACEHOLDER]`);
        lines.push(`  \\begin{subpartsaliged}`);
        for (const part of parts) {
          lines.push(`    \\item % ${part.label} (${part.marks} marks)`);
          lines.push(`    \\AnswerLine[][]`);
          lines.push(`    \\Marks{${part.marks}}`);
        }
        lines.push(`  \\end{subpartsaliged}`);
        lines.push(`\\end{question}`);
      }
    }

    lines.push(``);
  });

  lines.push(`\\examend`);
  lines.push(`\\end{document}`);

  return lines.join('\n');
}
