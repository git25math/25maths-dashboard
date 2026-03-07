import { KahootBoard, KahootCorrectOption, KahootItem, KahootQuestion, KahootTimeLimit, KahootTrack, KahootUploadStatus } from '../types';

const VALID_BOARDS: KahootBoard[] = ['cie0580', 'edexcel-4ma1'];
const VALID_TRACKS: KahootTrack[] = ['core', 'extended', 'foundation', 'higher'];
const VALID_STATUSES: KahootUploadStatus[] = ['ai_generated', 'human_review', 'excel_exported', 'kahoot_uploaded', 'web_verified', 'published'];
const VALID_OPTIONS: KahootCorrectOption[] = ['A', 'B', 'C', 'D'];
const VALID_TIME_LIMITS: KahootTimeLimit[] = [5, 10, 20, 30, 60, 90, 120];

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map(item => typeof item === 'string' ? item.trim() : '')
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[,\n|]/)
      .map(item => item.trim().replace(/^#/, ''))
      .filter(Boolean);
  }

  return [];
}

function normalizeBoard(value: unknown, id: string): KahootBoard {
  if (typeof value === 'string' && VALID_BOARDS.includes(value as KahootBoard)) {
    return value as KahootBoard;
  }

  return id.includes('edexcel') ? 'edexcel-4ma1' : 'cie0580';
}

function normalizeTrack(value: unknown): KahootTrack {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase().replace(/\s+/g, '_') : '';

  if (normalized === 'core') return 'core';
  if (normalized === 'extended') return 'extended';
  if (normalized === 'foundation') return 'foundation';
  if (normalized === 'higher') return 'higher';

  return 'core';
}

function normalizeStatus(value: unknown, challengeUrl?: string): KahootUploadStatus {
  const normalized = typeof value === 'string' ? value.trim().toLowerCase() : '';

  if (VALID_STATUSES.includes(normalized as KahootUploadStatus)) {
    return normalized as KahootUploadStatus;
  }

  return challengeUrl ? 'published' : 'human_review';
}

function normalizeCorrectOption(value: unknown): KahootCorrectOption {
  if (typeof value === 'string') {
    const upper = value.trim().toUpperCase();
    if (VALID_OPTIONS.includes(upper as KahootCorrectOption)) {
      return upper as KahootCorrectOption;
    }
  }

  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === 'string') {
      const upper = first.trim().toUpperCase();
      if (VALID_OPTIONS.includes(upper as KahootCorrectOption)) {
        return upper as KahootCorrectOption;
      }
    }
  }

  return 'A';
}

function normalizeTimeLimit(value: unknown): KahootTimeLimit {
  const numeric = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number(value)
      : NaN;

  if (VALID_TIME_LIMITS.includes(numeric as KahootTimeLimit)) {
    return numeric as KahootTimeLimit;
  }

  return 20;
}

function normalizeQuestion(value: unknown, index: number): KahootQuestion {
  const record = asRecord(value);

  return {
    id: asString(record.id, `question-import-${index + 1}`),
    prompt: asString(record.prompt || record.question, `Question ${index + 1}`),
    option_a: asString(record.option_a || record.optionA),
    option_b: asString(record.option_b || record.optionB),
    option_c: asString(record.option_c || record.optionC),
    option_d: asString(record.option_d || record.optionD),
    correct_option: normalizeCorrectOption(record.correct_option || record.correct_options),
    time_limit: normalizeTimeLimit(record.time_limit || record.timeLimit),
  };
}

export function normalizeImportedKahootItem(value: unknown, index: number): KahootItem {
  const record = asRecord(value);
  const now = new Date().toISOString();
  const challengeUrl = asString(record.challenge_url || record.kahoot_url || record.play_url);
  const id = asString(record.id, `kahoot-import-${Date.now()}-${index + 1}`);

  return {
    id,
    board: normalizeBoard(record.board, id),
    track: normalizeTrack(record.track || record.tier),
    topic_code: asString(record.topic_code || record.code, `ITEM-${index + 1}`),
    title: asString(record.title, `Imported Kahoot ${index + 1}`),
    description: asString(record.description),
    cover_url: asString(record.cover_url) || undefined,
    page_url: asString(record.page_url) || undefined,
    challenge_url: challengeUrl || undefined,
    creator_url: asString(record.creator_url) || undefined,
    website_link_id: asString(record.website_link_id || record.link_id) || undefined,
    listing_path: asString(record.listing_path) || undefined,
    tags: asStringArray(record.tags),
    upload_status: normalizeStatus(record.upload_status || record.status, challengeUrl),
    questions: Array.isArray(record.questions)
      ? record.questions.map((question, questionIndex) => normalizeQuestion(question, questionIndex))
      : [],
    review_notes: asString(record.review_notes || record.notes) || undefined,
    created_at: asString(record.created_at, now),
    updated_at: asString(record.updated_at, now),
    ai_generated_at: asString(record.ai_generated_at) || undefined,
    human_reviewed_at: asString(record.human_reviewed_at) || undefined,
    uploaded_at: asString(record.uploaded_at) || undefined,
  };
}

export function parseKahootImportPayload(text: string): KahootItem[] {
  const parsed = JSON.parse(text) as unknown;
  const record = asRecord(parsed);
  const rawItems = Array.isArray(parsed)
    ? parsed
    : Array.isArray(record.kahootItems)
      ? record.kahootItems
      : Array.isArray(record.items)
        ? record.items
        : null;

  if (!rawItems) {
    throw new Error('Unsupported Kahoot JSON format');
  }

  return rawItems.map((item, index) => normalizeImportedKahootItem(item, index));
}

export function buildKahootExportPayload(items: KahootItem[]) {
  return {
    exported_at: new Date().toISOString(),
    schema: '25maths.dashboard.kahoot.v1',
    kahootItems: items,
  };
}

function escapeCsvCell(value: unknown): string {
  const stringValue = typeof value === 'string' ? value : value == null ? '' : String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return `"${escaped}"`;
}

export function buildWebsiteSyncRows(items: KahootItem[]) {
  return items.map(item => ({
    id: item.id,
    board: item.board,
    track: item.track,
    topic_code: item.topic_code,
    title: item.title,
    upload_status: item.upload_status,
    kahoot_url: item.challenge_url || '',
    page_url: item.page_url || '',
    creator_url: item.creator_url || '',
    website_link_id: item.website_link_id || '',
    listing_path: item.listing_path || '',
    tags: item.tags.join('|'),
  }));
}

export function buildWebsiteSyncJson(items: KahootItem[]) {
  return {
    exported_at: new Date().toISOString(),
    schema: '25maths.website.kahoot-links.v1',
    links: buildWebsiteSyncRows(items),
  };
}

export function buildWebsiteSyncCsv(items: KahootItem[]): string {
  const rows = buildWebsiteSyncRows(items);
  const headers = ['id', 'board', 'track', 'topic_code', 'title', 'upload_status', 'kahoot_url', 'page_url', 'creator_url', 'website_link_id', 'listing_path', 'tags'];

  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCsvCell(row[header as keyof typeof row])).join(',')),
  ].join('\n');
}
