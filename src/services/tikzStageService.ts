/** Pipeline stage tracking for TikzVault questions, persisted in localStorage */

export type ContentTranscription = 'not_transcribed' | 'transcribed';
export type ContentProofreading = 'not_done' | 'done';
export type ImageStatus = 'placeholder' | 'screenshot';
export type ChartStatus = 'placeholder' | 'screenshot' | 'transcribed';
export type ImageAssetStatus = 'not_transcribed' | 'transcribed' | 'parameterized';

export interface TikzStages {
  content_transcription: ContentTranscription;
  content_proofreading: ContentProofreading;
  has_images: ImageStatus;
  has_charts: ChartStatus;
  image_assets: ImageAssetStatus;
}

export const STAGE_DEFAULTS: TikzStages = {
  content_transcription: 'not_transcribed',
  content_proofreading: 'not_done',
  has_images: 'placeholder',
  has_charts: 'placeholder',
  image_assets: 'not_transcribed',
};

export const STAGE_LABELS: Record<keyof TikzStages, string> = {
  content_transcription: '内容转录',
  content_proofreading: '内容校对',
  has_images: '图片',
  has_charts: '图表',
  image_assets: '图片资产',
};

export const STAGE_OPTIONS: Record<keyof TikzStages, { value: string; label: string; color: string }[]> = {
  content_transcription: [
    { value: 'not_transcribed', label: '未转录', color: 'bg-slate-200 text-slate-600' },
    { value: 'transcribed', label: '已转录', color: 'bg-green-100 text-green-700' },
  ],
  content_proofreading: [
    { value: 'not_done', label: '未完成', color: 'bg-slate-200 text-slate-600' },
    { value: 'done', label: '完成', color: 'bg-green-100 text-green-700' },
  ],
  has_images: [
    { value: 'placeholder', label: '占位符', color: 'bg-amber-100 text-amber-700' },
    { value: 'screenshot', label: '已截图', color: 'bg-green-100 text-green-700' },
  ],
  has_charts: [
    { value: 'placeholder', label: '占位符', color: 'bg-amber-100 text-amber-700' },
    { value: 'screenshot', label: '已截图', color: 'bg-blue-100 text-blue-700' },
    { value: 'transcribed', label: '已转录', color: 'bg-green-100 text-green-700' },
  ],
  image_assets: [
    { value: 'not_transcribed', label: '未转录', color: 'bg-slate-200 text-slate-600' },
    { value: 'transcribed', label: '已转录', color: 'bg-blue-100 text-blue-700' },
    { value: 'parameterized', label: '参数化', color: 'bg-green-100 text-green-700' },
  ],
};

const STORAGE_KEY = 'tikzvault-stages';

type StageMap = Record<string, Partial<TikzStages>>;

let cache: StageMap | null = null;

function load(): StageMap {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache!;
}

function save(data: StageMap) {
  cache = data;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage quota exceeded — prune oldest entries to make space
    const keys = Object.keys(data);
    if (keys.length > 50) {
      const keep = keys.slice(-50);
      const pruned: StageMap = {};
      for (const k of keep) pruned[k] = data[k];
      cache = pruned;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned)); } catch { /* give up */ }
    }
  }
}

export const tikzStageService = {
  /** Get stages for a question (merged with defaults) */
  get(questionId: string): TikzStages {
    const data = load();
    return { ...STAGE_DEFAULTS, ...data[questionId] };
  },

  /** Get all stored overrides */
  getAll(): StageMap {
    return load();
  },

  /** Update a single stage field for a question */
  set<K extends keyof TikzStages>(questionId: string, field: K, value: TikzStages[K]) {
    const data = load();
    const existing = data[questionId] || {};
    // Only store non-default values
    if (value === STAGE_DEFAULTS[field]) {
      delete existing[field];
    } else {
      existing[field] = value;
    }
    if (Object.keys(existing).length === 0) {
      delete data[questionId];
    } else {
      data[questionId] = existing;
    }
    save(data);
  },

  /** Cycle to the next option for a field */
  cycle<K extends keyof TikzStages>(questionId: string, field: K): TikzStages[K] {
    const options = STAGE_OPTIONS[field];
    const current = this.get(questionId)[field];
    const idx = options.findIndex(o => o.value === current);
    const next = options[(idx + 1) % options.length];
    this.set(questionId, field, next.value as TikzStages[K]);
    return next.value as TikzStages[K];
  },

  /** Get count of questions with any non-default stages */
  countTracked(): number {
    return Object.keys(load()).length;
  },
};
