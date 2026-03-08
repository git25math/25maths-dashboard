import type { PaperQuestion, PaperFocus } from '../types';

interface AutoFillOptions {
  questions: PaperQuestion[];
  targetMarks: number;
  focus: PaperFocus;
  focusSections?: string[];
  maxPerSection?: number;
}

/**
 * Auto-fill algorithm ported from Keywords ppStartMockExam.
 * Groups questions by section, applies focus weighting, then round-robin selects.
 */
export function autoFillQuestions(opts: AutoFillOptions): PaperQuestion[] {
  const { questions, targetMarks, focus, focusSections = [], maxPerSection } = opts;

  if (!questions.length || targetMarks <= 0) return [];

  // Group by section
  const secQs: Record<string, PaperQuestion[]> = {};
  for (const q of questions) {
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

      // Prefer candidates that fit within budget (±5); among those, pick
      // the one closest to the remaining marks so packing is tight.
      const remaining = targetMarks - totalMarksAccum;
      const fitting = candidates.filter(c => c.marks <= remaining + 5);
      let pick: PaperQuestion;
      if (fitting.length > 0) {
        // Closest to remaining, with a small random jitter for variety
        fitting.sort((a, b) => Math.abs(remaining - a.marks) - Math.abs(remaining - b.marks));
        // Pick among top-3 closest to add variety
        const topN = fitting.slice(0, Math.min(3, fitting.length));
        pick = topN[Math.floor(Math.random() * topN.length)];
      } else {
        // All overshoot — take the smallest available
        candidates.sort((a, b) => a.marks - b.marks);
        pick = candidates[0];
      }

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
