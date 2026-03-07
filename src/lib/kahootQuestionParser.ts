import { KahootCorrectOption, KahootQuestion, KahootTimeLimit } from '../types';
import { randomAlphaId } from './id';

const VALID_OPTIONS: KahootCorrectOption[] = ['A', 'B', 'C', 'D'];
const VALID_TIME_LIMITS: KahootTimeLimit[] = [5, 10, 20, 30, 60, 90, 120];

function normalizeCorrectOption(value: unknown): KahootCorrectOption {
  const s = String(value ?? 'A').trim().toUpperCase();
  return VALID_OPTIONS.includes(s as KahootCorrectOption) ? (s as KahootCorrectOption) : 'A';
}

function normalizeTimeLimit(value: unknown): KahootTimeLimit {
  const n = Number(value);
  if (VALID_TIME_LIMITS.includes(n as KahootTimeLimit)) return n as KahootTimeLimit;
  return 20;
}

function stripCell(cell: string): string {
  return cell.replace(/^\s*\|?\s*/, '').replace(/\s*\|?\s*$/, '').trim();
}

/** Parse a Markdown table into KahootQuestion[]. Expects columns:
 *  # | Question | A | B | C | D | Correct | Type/Time */
export function parseMarkdownTable(text: string): KahootQuestion[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const dataLines = lines.filter(line => {
    if (/^\|?\s*[-:]+/.test(line)) return false; // separator
    if (/^\|?\s*#\s*\|/i.test(line)) return false; // header
    return line.includes('|');
  });

  return dataLines.map((line, idx) => {
    const cells = line.split('|').map(stripCell).filter(c => c !== '');
    // Expected: [#, question, A, B, C, D, correct, type/time]
    // or:       [question, A, B, C, D, correct, time]
    const offset = /^\d+$/.test(cells[0]) ? 1 : 0;

    return {
      id: `q-${randomAlphaId()}`,
      prompt: cells[offset] ?? `Question ${idx + 1}`,
      option_a: cells[offset + 1] ?? '',
      option_b: cells[offset + 2] ?? '',
      option_c: cells[offset + 3] ?? '',
      option_d: cells[offset + 4] ?? '',
      correct_option: normalizeCorrectOption(cells[offset + 5]),
      time_limit: normalizeTimeLimit(cells[offset + 6]?.replace(/[^\d]/g, '') || 20),
    };
  });
}

interface RawQuestionJson {
  prompt?: string;
  question?: string;
  option_a?: string;
  optionA?: string;
  option_b?: string;
  optionB?: string;
  option_c?: string;
  optionC?: string;
  option_d?: string;
  optionD?: string;
  correct_option?: string;
  correctOption?: string;
  answer?: string;
  time_limit?: number;
  timeLimit?: number;
}

export function parseJsonQuestions(text: string): KahootQuestion[] {
  const parsed = JSON.parse(text) as unknown;

  let items: RawQuestionJson[];
  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (parsed && typeof parsed === 'object' && 'questions' in parsed) {
    items = (parsed as { questions: RawQuestionJson[] }).questions;
  } else {
    return [];
  }

  return items.map((q, idx) => ({
    id: `q-${randomAlphaId()}`,
    prompt: String(q.prompt || q.question || `Question ${idx + 1}`),
    option_a: String(q.option_a || q.optionA || ''),
    option_b: String(q.option_b || q.optionB || ''),
    option_c: String(q.option_c || q.optionC || ''),
    option_d: String(q.option_d || q.optionD || ''),
    correct_option: normalizeCorrectOption(q.correct_option || q.correctOption || q.answer),
    time_limit: normalizeTimeLimit(q.time_limit || q.timeLimit || 20),
  }));
}

/** Auto-detect format and parse. Returns questions or throws. */
export function parseQuestions(text: string): KahootQuestion[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Try JSON first
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      return parseJsonQuestions(trimmed);
    } catch {
      // fall through to markdown
    }
  }

  // Try Markdown table
  if (trimmed.includes('|')) {
    const result = parseMarkdownTable(trimmed);
    if (result.length > 0) return result;
  }

  throw new Error('Could not parse questions. Paste a Markdown table or JSON array.');
}

export function questionHasIssues(q: KahootQuestion): boolean {
  return !q.prompt.trim() || ![q.option_a, q.option_b, q.option_c, q.option_d].every(o => o.trim());
}

export function countIssues(questions: KahootQuestion[]): number {
  return questions.filter(questionHasIssues).length;
}
