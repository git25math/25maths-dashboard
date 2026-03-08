// Cover Designer types

export type CoverTemplateType = 'kahoot' | 'worksheet' | 'exam' | 'vocab';

export interface CoverParams {
  primaryGradientStart: string;
  primaryGradientEnd: string;
  accentColor: string;
  textColor: string;
  titleEn: string;
  titleZh: string;
  subtitle: string;
  badgeText: string;
  showDecoCircles: boolean;
  showWavyShape: boolean;
  showMathFormula: boolean;
  mathFormula: string;
  boardBadge: string;
  trackBadge: string;
}

export interface CoverTemplate {
  type: CoverTemplateType;
  label: string;
  width: number;
  height: number;
  description: string;
  defaultParams: CoverParams;
}

export interface CoverDesign {
  id: string;
  templateType: CoverTemplateType;
  params: CoverParams;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PARAMS: CoverParams = {
  primaryGradientStart: '#E8D5B0',
  primaryGradientEnd: '#B8D4D0',
  accentColor: '#DFA95B',
  textColor: '#1A3A3A',
  titleEn: '25MATHS',
  titleZh: '',
  subtitle: 'Practice Paper',
  badgeText: 'IGCSE',
  showDecoCircles: true,
  showWavyShape: true,
  showMathFormula: true,
  mathFormula: 'x² + y² = r²',
  boardBadge: 'CIE 0580',
  trackBadge: 'Extended',
};

export const COVER_TEMPLATES: CoverTemplate[] = [
  {
    type: 'kahoot',
    label: 'Kahoot Cover',
    width: 1600,
    height: 900,
    description: '16:9 ratio for Kahoot quiz covers',
    defaultParams: {
      ...DEFAULT_PARAMS,
      primaryGradientStart: '#E8D5B0',
      primaryGradientEnd: '#B8D4D0',
      titleEn: 'KAHOOT QUIZ',
      subtitle: 'Algebra Foundations',
      badgeText: 'LIVE QUIZ',
    },
  },
  {
    type: 'worksheet',
    label: 'Worksheet Cover',
    width: 2320,
    height: 1520,
    description: 'Landscape cover for worksheets and TPT products',
    defaultParams: {
      ...DEFAULT_PARAMS,
      primaryGradientStart: '#D5E8D4',
      primaryGradientEnd: '#C4D8E8',
      titleEn: 'WORKSHEET',
      subtitle: 'Practice Problems',
      badgeText: 'RESOURCE',
    },
  },
  {
    type: 'exam',
    label: 'Exam Paper Cover',
    width: 595,
    height: 842,
    description: 'A4 portrait for exam papers',
    defaultParams: {
      ...DEFAULT_PARAMS,
      primaryGradientStart: '#F0F0F0',
      primaryGradientEnd: '#E0E8F0',
      accentColor: '#4A6FA5',
      titleEn: 'PRACTICE EXAM',
      subtitle: 'Mathematics',
      badgeText: 'MOCK',
    },
  },
  {
    type: 'vocab',
    label: 'Vocab Card Cover',
    width: 800,
    height: 600,
    description: '4:3 ratio for vocabulary flashcard covers',
    defaultParams: {
      ...DEFAULT_PARAMS,
      primaryGradientStart: '#F5E6D3',
      primaryGradientEnd: '#D3E6F5',
      titleEn: 'VOCAB CARDS',
      subtitle: 'Key Terms',
      badgeText: 'FLASHCARDS',
    },
  },
];
