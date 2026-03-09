/**
 * Maps a question `src` field to the original exam paper PDF path on disk.
 *
 * CIE src format:  "0580/22/M/J/19 Q08"  → 2019MayJune/Paper22/OriginalFiles/0580_s19_qp_22.pdf
 * Edexcel src format: "4MA1/1H/June/25 Q08" → 2025June/Paper1H/4MA1-1H-2025June-QuestionPaper.pdf
 */

import type { PaperBoard } from '../types';

const CIE_PAST_PAPERS_ROOT = '/Users/zhuxingzhe/Project/ExamBoard/CIE/IGCSE_v2/PastPapers';
const EDX_PAST_PAPERS_ROOT = '/Users/zhuxingzhe/Project/ExamBoard/Edexcel/IGCSE_v2/PastPapers';

// CIE session codes in src → directory name + PDF session letter
const CIE_SESSION_MAP: Record<string, { dir: string; letter: string }> = {
  'M/J': { dir: 'MayJune', letter: 's' },
  'M':   { dir: 'March',   letter: 'm' },
  'F/M': { dir: 'March',   letter: 'm' },
  'O/N': { dir: 'OctNov',  letter: 'w' },
  'S':   { dir: 'Specimen', letter: 's' },
};

export interface ResolvedPdf {
  /** Absolute path to the PDF file on disk */
  pdfPath: string;
  /** Question number (e.g. "Q08") */
  question: string;
  /** Human-readable label for the paper */
  label: string;
}

/**
 * Parse a CIE src like "0580/22/M/J/19 Q08" and return the PDF path.
 */
function resolveCieSrc(src: string): ResolvedPdf | null {
  // Patterns:
  //   0580/22/M/J/19 Q08     (session has two parts: M/J)
  //   0580/12/M/25 Q01       (session has one part: M)
  //   0580/12/S/25 Q01       (specimen)
  const match = src.match(
    /^0580\/(\d{2})\/([A-Z])(?:\/([A-Z]))?\/?(\d{2})\s+(Q\d+)$/
  );
  if (!match) return null;

  const [, paper, s1, s2, yearShort, question] = match;
  const sessionKey = s2 ? `${s1}/${s2}` : s1;
  const mapping = CIE_SESSION_MAP[sessionKey];
  if (!mapping) return null;

  const year = Number(yearShort) >= 50 ? 1900 + Number(yearShort) : 2000 + Number(yearShort);
  const dirName = `${year}${mapping.dir}`;
  const paperDir = `Paper${paper}`;
  const pdfName = `0580_${mapping.letter}${yearShort}_qp_${paper}.pdf`;

  return {
    pdfPath: `${CIE_PAST_PAPERS_ROOT}/${dirName}/${paperDir}/OriginalFiles/${pdfName}`,
    question,
    label: `0580 Paper ${paper} ${mapping.dir} ${year}`,
  };
}

/**
 * Parse an Edexcel src like "4MA1/1H/June/25 Q08" and return the PDF path.
 */
function resolveEdxSrc(src: string): ResolvedPdf | null {
  const match = src.match(
    /^4MA1\/([12][FH])\/(\w+)\/(\d{2})\s+(Q\d+)$/
  );
  if (!match) return null;

  const [, paper, session, yearShort, question] = match;
  const year = Number(yearShort) >= 50 ? 1900 + Number(yearShort) : 2000 + Number(yearShort);

  // Session normalization: SP, Jan, June, Nov
  let dirSession = session;
  if (session === 'Jun') dirSession = 'June';

  const dirName = `${year}${dirSession}`;
  const paperDir = `Paper${paper}`;
  const pdfName = `4MA1-${paper}-${dirName}-QuestionPaper.pdf`;

  return {
    pdfPath: `${EDX_PAST_PAPERS_ROOT}/${dirName}/${paperDir}/${pdfName}`,
    question,
    label: `4MA1 Paper ${paper} ${dirSession} ${year}`,
  };
}

/**
 * Resolve a question src to its original exam paper PDF path.
 */
export function resolveQuestionPdf(src: string, board: PaperBoard): ResolvedPdf | null {
  return board === 'cie' ? resolveCieSrc(src) : resolveEdxSrc(src);
}

/**
 * Build a URL to fetch the PDF from the local agent server.
 * Only allows paths within known PastPapers roots to prevent path traversal.
 */
export function getOriginalPdfUrl(agentBaseUrl: string, pdfPath: string): string {
  if (!pdfPath.startsWith(CIE_PAST_PAPERS_ROOT) && !pdfPath.startsWith(EDX_PAST_PAPERS_ROOT)) {
    throw new Error('PDF path outside allowed PastPapers directories');
  }
  if (pdfPath.includes('..')) {
    throw new Error('Path traversal detected');
  }
  return `${agentBaseUrl}/files?path=${encodeURIComponent(pdfPath)}&download=0`;
}
