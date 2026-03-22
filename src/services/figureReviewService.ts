/** Local review annotations for figure screenshot QA, persisted in localStorage */

export type FigureReviewStatus = 'ok' | 'issue' | 'reshoot';

export interface FigureReview {
  status: FigureReviewStatus;
  note?: string;
  updated_at: string;
}

type ReviewMap = Record<string, FigureReview>;

function nowIso() {
  return new Date().toISOString();
}

function createReviewService(storageKey: string) {
  let cache: ReviewMap | null = null;

  function load(): ReviewMap {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(storageKey);
      cache = raw ? JSON.parse(raw) : {};
    } catch {
      cache = {};
    }
    return cache!;
  }

  function save(next: ReviewMap) {
    cache = next;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      const keys = Object.keys(next);
      const keep = keys.slice(-500);
      const pruned: ReviewMap = {};
      for (const k of keep) pruned[k] = next[k];
      cache = pruned;
      try { localStorage.setItem(storageKey, JSON.stringify(pruned)); } catch { /* give up */ }
    }
  }

  return {
    getAll(): ReviewMap {
      return load();
    },

    get(id: string): FigureReview | null {
      const data = load();
      return data[id] || null;
    },

    setStatus(id: string, status: FigureReviewStatus) {
      const data = load();
      const prev = data[id];
      data[id] = { status, note: prev?.note, updated_at: nowIso() };
      save(data);
    },

    setNote(id: string, note: string) {
      const data = load();
      const trimmed = note.trim();
      const prev = data[id];
      if (!prev && !trimmed) return;
      if (!prev) {
        data[id] = { status: 'issue', note: trimmed || undefined, updated_at: nowIso() };
      } else {
        data[id] = { ...prev, note: trimmed || undefined, updated_at: nowIso() };
      }
      save(data);
    },

    clear(id: string) {
      const data = load();
      if (data[id]) {
        delete data[id];
        save(data);
      }
    },

    count(): number {
      return Object.keys(load()).length;
    },

    listByStatus(status: FigureReviewStatus): { id: string; review: FigureReview }[] {
      const data = load();
      return Object.entries(data)
        .filter(([, review]) => review.status === status)
        .map(([id, review]) => ({ id, review }));
    },
  };
}

export type FigureReviewServiceInstance = ReturnType<typeof createReviewService>;

export const figureReviewService = createReviewService('cie0580-figure-reviews');
export const figureReviewService4MA1 = createReviewService('edx4ma1-figure-reviews');

export { createReviewService };

