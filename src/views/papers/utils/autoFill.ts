import type { PaperQuestion, PaperFocus, PaperBoard, PaperTier } from '../types';

interface AutoFillOptions {
  questions: PaperQuestion[];
  targetMarks: number;
  focus: PaperFocus;
  focusSections?: string[];
  maxPerSection?: number;
  board?: PaperBoard;
  tier?: PaperTier;
}

/** Check if a question belongs to the given tier based on its paper number. */
function matchesTier(q: PaperQuestion, board: PaperBoard, tier: PaperTier): boolean {
  // CIE: papers 1x/3x = Core, papers 2x/4x = Extended
  if (board === 'cie') {
    const m = q.src.match(/^0580\/(\d)/);
    if (!m) return true; // can't determine → include
    const firstDigit = Number(m[1]);
    if (tier === 'core') return firstDigit === 1 || firstDigit === 3;
    return firstDigit === 2 || firstDigit === 4; // extended
  }
  // Edexcel: papers xF = Foundation, xH = Higher
  if (board === 'edx') {
    const m = q.src.match(/^4MA1\/\d([FH])/);
    if (!m) return true;
    if (tier === 'foundation') return m[1] === 'F';
    return m[1] === 'H'; // higher
  }
  return true;
}

/**
 * Auto-fill algorithm ported from Keywords ppStartMockExam.
 * Groups questions by section, applies focus weighting, then round-robin selects.
 * Respects tier filtering and uses tight budget control (≤2m overshoot max).
 */
export function autoFillQuestions(opts: AutoFillOptions): PaperQuestion[] {
  const { questions, targetMarks, focus, focusSections = [], maxPerSection, board, tier } = opts;

  if (!questions.length || targetMarks <= 0) return [];

  // Filter by tier if specified
  const eligible = (board && tier)
    ? questions.filter(q => matchesTier(q, board, tier))
    : questions;

  // Group by section
  const secQs: Record<string, PaperQuestion[]> = {};
  for (const q of eligible) {
    if (!q.s || !q.marks) continue;
    if (!secQs[q.s]) secQs[q.s] = [];
    secQs[q.s].push(q);
  }

  const secIds = Object.keys(secQs);
  if (!secIds.length) return [];

  // Calculate section weights
  const weights: Record<string, number> = {};
  for (const sid of secIds) {
    if (focus === 'topic' && focusSections.length > 0) {
      weights[sid] = focusSections.includes(sid) ? 4 : 1;
    } else {
      weights[sid] = 1;
    }
  }

  const maxPer = maxPerSection ?? Math.max(3, Math.ceil(targetMarks / secIds.length));

  // Build weighted section pool, then deduplicate preserving order
  const secPool: string[] = [];
  for (const sid of secIds) {
    for (let j = 0; j < weights[sid]; j++) {
      secPool.push(sid);
    }
  }
  // Shuffle
  for (let i = secPool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [secPool[i], secPool[j]] = [secPool[j], secPool[i]];
  }

  const orderedSecs: string[] = [];
  const seen = new Set<string>();
  for (const s of secPool) {
    if (!seen.has(s)) {
      seen.add(s);
      orderedSecs.push(s);
    }
  }

  // Round-robin pick
  const selected: PaperQuestion[] = [];
  const selectedIds = new Set<string>();
  let totalMarksAccum = 0;
  const perSec: Record<string, number> = {};

  // Budget tolerance: allow up to 2 marks overshoot total
  const OVERSHOOT_TOLERANCE = 2;

  let round = 0;
  while (totalMarksAccum < targetMarks && round < 10) {
    let added = false;
    for (const sid of orderedSecs) {
      if (totalMarksAccum >= targetMarks) break;
      const rqs = secQs[sid];
      const picked = perSec[sid] || 0;
      if (picked >= maxPer || picked >= rqs.length) continue;

      // Find unpicked candidates
      const candidates = rqs.filter(q => !selectedIds.has(q.id));
      if (!candidates.length) continue;

      const remaining = targetMarks - totalMarksAccum;

      // 1) Strict fit: questions that fit within remaining budget
      const strict = candidates.filter(c => c.marks <= remaining);
      // 2) Slight overshoot: allow up to OVERSHOOT_TOLERANCE marks over target
      const loose = strict.length === 0
        ? candidates.filter(c => c.marks <= remaining + OVERSHOOT_TOLERANCE)
        : [];

      const pool = strict.length > 0 ? strict : loose;
      if (!pool.length) continue; // skip this section — no fit

      // Pick the one closest to remaining marks, with top-3 jitter for variety
      pool.sort((a, b) => Math.abs(remaining - a.marks) - Math.abs(remaining - b.marks));
      const topN = pool.slice(0, Math.min(3, pool.length));
      const pick = topN[Math.floor(Math.random() * topN.length)];

      selected.push(pick);
      selectedIds.add(pick.id);
      totalMarksAccum += pick.marks;
      perSec[sid] = picked + 1;
      added = true;
    }
    if (!added) break;
    round++;
  }

  // Sort by difficulty ascending (easy→hard like a real paper)
  selected.sort((a, b) => (a.d || 1) - (b.d || 1));

  return selected;
}
