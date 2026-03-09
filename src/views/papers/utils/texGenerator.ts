import type { PaperConfig, PaperQuestion, PaperBoard } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTierLabel(board: PaperBoard, tier: string): string {
  if (board === 'cie') return tier === 'core' ? 'Core' : 'Extended';
  return tier === 'foundation' ? 'Foundation' : 'Higher';
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} minutes`;
  if (m === 0) return `${h} hour${h > 1 ? 's' : ''}`;
  return `${h} hour${h > 1 ? 's' : ''} ${m} minutes`;
}

// ─── Source string → PastPapers path mapping ────────────────────────────────

/**
 * CIE src format:  "0580/42/M/J/19 Q07"  → setexam{2019MayJune}{Paper42}  examquestion{Q07}
 * CIE src format:  "0580/12/M/25 Q03"    → setexam{2025March}{Paper12}    examquestion{Q03}
 * Edexcel format:  "4MA1/2H/SP/17 Q08"   → setexam{2017SP}{Paper2H}      examquestion{Q08}
 * Edexcel format:  "4MA1/1F/Jan/19 Q04"  → setexam{2019Jan}{Paper1F}     examquestion{Q04}
 */
export interface ExamRef {
  yearSession: string; // e.g. "2019MayJune", "2020June"
  paper: string;       // e.g. "Paper42", "Paper2H"
  question: string;    // e.g. "Q07"
}

const CIE_SESSION_MAP: Record<string, string> = {
  'M/J': 'MayJune',
  'O/N': 'OctNov',
  'M':   'March',
  'F/M': 'March',
  'S':   'Specimen',
};

const EDX_SESSION_MAP: Record<string, string> = {
  'SP':   'SP',
  'Jan':  'Jan',
  'Jun':  'June',
  'June': 'June',
  'Nov':  'Nov',
};

function parseCieSrc(src: string): ExamRef | null {
  // Two-letter session: "0580/42/M/J/19 Q07" → M/J
  // One-letter session: "0580/12/M/25 Q03"   → M
  // Also: "0580/12/F/M/25 Q03" → F/M
  const match2 = src.match(/^0580\/(\d+)\/([A-Z])\/([A-Z])\/(\d+)\s+(Q\d+)$/);
  const match1 = src.match(/^0580\/(\d+)\/([A-Z])\/(\d+)\s+(Q\d+)$/);

  if (match2) {
    const [, paperNum, s1, s2, yearShort, question] = match2;
    const sessionKey = `${s1}/${s2}`;
    const sessionName = CIE_SESSION_MAP[sessionKey];
    if (!sessionName) return null;
    const year = Number(yearShort) < 50 ? `20${yearShort}` : `19${yearShort}`;
    return { yearSession: `${year}${sessionName}`, paper: `Paper${paperNum}`, question };
  }

  if (match1) {
    const [, paperNum, s1, yearShort, question] = match1;
    const sessionName = CIE_SESSION_MAP[s1];
    if (!sessionName) return null;
    const year = Number(yearShort) < 50 ? `20${yearShort}` : `19${yearShort}`;
    return { yearSession: `${year}${sessionName}`, paper: `Paper${paperNum}`, question };
  }

  return null;
}

function parseEdxSrc(src: string): ExamRef | null {
  // "4MA1/2H/June/20 Q12" or "4MA1/1F/SP/17 Q08"
  const match = src.match(/^4MA1\/(\d[FH])\/([A-Za-z]+)\/(\d+)\s+(Q\d+)$/);
  if (!match) return null;

  const [, paperCode, session, yearShort, question] = match;
  const sessionName = EDX_SESSION_MAP[session];
  if (!sessionName) return null;

  const year = Number(yearShort) < 50 ? `20${yearShort}` : `19${yearShort}`;

  return {
    yearSession: `${year}${sessionName}`,
    paper: `Paper${paperCode}`,
    question,
  };
}

export function parseExamRef(src: string, board: PaperBoard): ExamRef | null {
  return board === 'cie' ? parseCieSrc(src) : parseEdxSrc(src);
}

/**
 * Format source string for display.
 * "0580/42/M/J/19 Q07" → "2019 May/June, Paper 42, Question 7"
 */
export function formatSource(src: string, board: PaperBoard): string {
  const ref = parseExamRef(src, board);
  if (!ref) return src;

  const paperNum = ref.paper.replace('Paper', '');
  const qNum = ref.question.replace('Q', '');
  const year = ref.yearSession.replace(/[A-Za-z]+$/, '');
  const session = ref.yearSession.slice(year.length);

  const sessionLabels: Record<string, string> = {
    'MayJune': 'May/June', 'OctNov': 'Oct/Nov', 'March': 'March', 'Specimen': 'Specimen',
    'SP': 'Specimen', 'Jan': 'January', 'June': 'June', 'Nov': 'November',
  };

  return `${year} ${sessionLabels[session] || session}, Paper ${paperNum}, Question ${Number(qNum)}`;
}

// ─── Main export ──────────────────────────────────────────────────────────────

// Generate a .tex file using \examquestion{} references to PastPapers.
// Produces a QPList-style file that references original question files
// via \setexam + \examquestion macros (PaperSettings-PathConfig.sty).
// Save locally and compile from within the CIE/Edexcel project tree.
export function generatePaperTex(config: PaperConfig, questions: PaperQuestion[]): string {
  const tierLabel = getTierLabel(config.board, config.tier);
  const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const boardLabel = config.board === 'cie'
    ? 'CIE IGCSE Mathematics (0580)'
    : 'IGCSE Mathematics (4MA1)';
  const rootCmd = config.board === 'cie' ? 'CIERoot' : 'IGCSERoot';

  // Parse all questions, separate parseable from unparseable
  interface GroupedQ {
    ref: ExamRef;
    q: PaperQuestion;
  }
  const grouped: GroupedQ[] = [];
  const unparsed: PaperQuestion[] = [];

  for (const q of questions) {
    const ref = parseExamRef(q.src, config.board);
    if (ref) {
      grouped.push({ ref, q });
    } else {
      unparsed.push(q);
    }
  }

  // Sort by difficulty (easy→hard), then group same-difficulty by exam
  // to minimize \setexam switches while preserving pedagogical order
  grouped.sort((a, b) => {
    const dDiff = (a.q.d || 1) - (b.q.d || 1);
    if (dDiff !== 0) return dDiff;
    const aKey = `${a.ref.yearSession}|${a.ref.paper}`;
    const bKey = `${b.ref.yearSession}|${b.ref.paper}`;
    return aKey.localeCompare(bKey);
  });

  const lines: string[] = [];

  // ── Compilation instructions ──
  const projectDir = config.board === 'cie'
    ? 'CIE/IGCSE_v2'
    : 'Edexcel/IGCSE_v2';
  const suggestedPath = config.board === 'cie'
    ? 'CIE/IGCSE_v2/TopicalQuestions/<Topic>/'
    : 'Edexcel/IGCSE_v2/TopicalQuestions/<PaperTier>/<Topic>/';
  const texinputs = config.board === 'cie'
    ? 'TEXINPUTS=".:/path/to/25Maths//:/path/to/NZH-MathPrep-Template//:"'
    : 'TEXINPUTS=".:/path/to/25Maths-4MA1//:/path/to/NZH-MathPrep-Template//:"';

  lines.push(`% =============================================================================`);
  lines.push(`% Generated by 25Maths Paper Generator — ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`%`);
  lines.push(`% COMPILATION INSTRUCTIONS:`);
  lines.push(`%   1. Place this file in: ${suggestedPath}`);
  lines.push(`%   2. Compile with XeLaTeX (two passes for page references):`);
  lines.push(`%      ${texinputs} xelatex -interaction=nonstopmode <filename>.tex`);
  lines.push(`%   3. Requires PastPapers directory with QuestionInfo.tex files`);
  if (unparsed.length > 0) {
    lines.push(`%`);
    lines.push(`%   WARNING: ${unparsed.length} question(s) could not be mapped to PastPapers.`);
    lines.push(`%   These are listed as MANUAL comments at the bottom.`);
  }
  lines.push(`% =============================================================================`);
  lines.push(``);

  // ── Preamble ──
  if (config.board === 'cie') {
    lines.push(`\\documentclass[11pt,a4paper]{article}`);
    lines.push(`\\usepackage{../../CommonAssets/PaperSettings/CIE-0580-Master-Style}`);
  } else {
    lines.push(`\\documentclass[12pt]{extarticle}`);
    lines.push(`\\usepackage[a4paper,top=2cm,bottom=2cm,left=2cm,right=2cm]{geometry}`);
    lines.push(`\\newcommand{\\IGCSERoot}{../../..}`);
    lines.push(`\\usepackage{PaperSettings/IGCSE-Master-Style}`);
  }

  lines.push(``);
  lines.push(`% =============================================================================`);
  lines.push(`\\begin{document}`);
  lines.push(``);

  // ── Cover page ──
  lines.push(`\\thispagestyle{empty}`);
  lines.push(`\\begin{center}`);
  lines.push(`\\vspace*{2cm}`);
  lines.push(`{\\Large\\textbf{${boardLabel}}}\\\\[0.5cm]`);
  lines.push(`{\\large ${tierLabel} -- Paper ${config.paperNumber}}\\\\[0.5cm]`);
  lines.push(`{\\Large\\textbf{${config.title.replace(/[&%$#_{}~^\\]/g, '\\$&')}}}\\\\[1cm]`);
  lines.push(`{\\normalsize Time Allowed: ${formatTime(config.timeMinutes)}}\\\\[0.3cm]`);
  lines.push(`{\\normalsize Total Marks: ${totalMarks} \\quad Questions: ${questions.length}}\\\\[1cm]`);
  lines.push(`{\\normalsize Generated by 25Maths Paper Generator}\\\\[0.3cm]`);
  lines.push(`{\\normalsize \\today}\\\\[2cm]`);
  lines.push(`\\end{center}`);
  lines.push(`\\newpage`);
  lines.push(``);

  // ── QPList body ──
  lines.push(`% =============================================================================`);
  lines.push(`% Question List`);
  lines.push(`% Total: ${questions.length} questions, ${totalMarks} marks`);
  lines.push(`% =============================================================================`);
  lines.push(``);
  lines.push(`\\settotalmarks{${totalMarks}}`);
  lines.push(`\\setcounter{qnum}{0}`);
  lines.push(``);

  // Emit \setexam + \examquestion blocks
  let currentExamKey = '';

  for (let i = 0; i < grouped.length; i++) {
    const { ref, q } = grouped[i];
    const examKey = `${ref.yearSession}|${ref.paper}`;
    const isLast = i === grouped.length - 1 && unparsed.length === 0;

    if (examKey !== currentExamKey) {
      lines.push(`% --- ${ref.yearSession} ${ref.paper} ---`);
      lines.push(`\\setexam{${ref.yearSession}}{${ref.paper}}`);
      currentExamKey = examKey;
    }

    const comment = `  % d${q.d}, ${q.marks}m, s:${q.s}`;
    if (isLast) {
      lines.push(`\\examlastquestion{${ref.question}}${comment}`);
    } else {
      lines.push(`\\examquestion{${ref.question}}${comment}`);
    }
  }

  // Handle questions that couldn't be parsed — emit inline LaTeX with their content
  if (unparsed.length > 0) {
    lines.push(``);
    lines.push(`% === Questions with unparseable source (inline LaTeX) ===`);
    for (const q of unparsed) {
      lines.push(`% Source: ${q.src} [${q.marks}m, d${q.d}, s:${q.s}]`);
      lines.push(`\\stepcounter{qnum}`);
      lines.push(`\\begin{question}`);
      // Emit the question tex content, stripping any surrounding \begin{question}
      const texBody = q.tex
        .replace(/\\begin\{question\*?\}/, '')
        .replace(/\\end\{question\*?\}/, '')
        .trim();
      lines.push(texBody || `% [Empty question body — fill manually from ${q.src}]`);
      lines.push(`\\Marks{${q.marks}}`);
      lines.push(`\\end{question}`);
      lines.push(``);
    }
  }

  lines.push(``);
  lines.push(`\\examend`);
  lines.push(``);
  lines.push(`\\end{document}`);

  return lines.join('\n');
}
