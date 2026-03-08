// Paper Generator types

export type PaperBoard = 'cie' | 'edx';
export type PaperTier = 'core' | 'extended' | 'foundation' | 'higher';
export type PaperFocus = 'balanced' | 'weak' | 'topic';

export interface PaperQuestion {
  id: string;
  paper: string;
  qnum: number;
  marks: number;
  topics?: string[];
  s: string;        // section e.g. "1.5"
  d: number;        // difficulty 1-3
  cat?: string;
  topic?: string;
  qtype?: string;
  g?: string;
  src: string;      // e.g. "0580/12/M/25 Q01"
  year: number;
  session: string;
  tex: string;
  /** CIE: { label: "(a)", marks: 1 } | Edexcel: { p: "a", m: 1 } */
  parts: Array<{ label: string; marks: number } | { p: string; m: number }>;
  hasFigure: boolean;
  cognitive?: string;
  cmd?: string;
  keywords?: string[];
}

export interface PaperMeta {
  year: number;
  session: string;
  paper: string;
  type: string;
  totalMarks: number;
  time: number;
  qcount: number;
}

export interface PaperData {
  v: string;
  paperMeta: Record<string, PaperMeta>;
  questions: PaperQuestion[];
}

export interface PaperConfig {
  id: string;
  title: string;
  board: PaperBoard;
  tier: PaperTier;
  targetMarks: number;
  timeMinutes: number;
  focus: PaperFocus;
  focusSections?: string[];
  paperNumber: string;
  examSession: string;
  examYear: string;
  questionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedPaper extends PaperConfig {
  texSource?: string;
  pdfPath?: string;
}

export const BOARD_OPTIONS: { value: PaperBoard; label: string }[] = [
  { value: 'cie', label: 'CIE 0580' },
  { value: 'edx', label: 'Edexcel 4MA1' },
];

export const TIER_OPTIONS: Record<PaperBoard, { value: PaperTier; label: string }[]> = {
  cie: [
    { value: 'core', label: 'Core' },
    { value: 'extended', label: 'Extended' },
  ],
  edx: [
    { value: 'foundation', label: 'Foundation' },
    { value: 'higher', label: 'Higher' },
  ],
};

export const DEFAULT_PAPER_CONFIG: Omit<PaperConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'Practice Paper',
  board: 'cie',
  tier: 'extended',
  targetMarks: 70,
  timeMinutes: 90,
  focus: 'balanced',
  paperNumber: '2',
  examSession: 'Practice',
  examYear: '2026',
  questionIds: [],
};
