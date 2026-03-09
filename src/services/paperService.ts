import type { PaperBoard, PaperData, PaperQuestion, SavedPaper } from '../views/papers/types';

const STORAGE_KEY = 'paper-gen-saved';
const CACHE: Record<string, PaperData> = {};

export const paperService = {
  async loadQuestions(board: PaperBoard): Promise<PaperData> {
    if (CACHE[board]) return CACHE[board];
    const base = import.meta.env.BASE_URL || '/';
    const file = board === 'cie' ? 'papers-cie.json' : 'papers-edx.json';
    const url = `${base}data/${file}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    let res: Response;
    try {
      res = await fetch(url, { signal: controller.signal });
    } catch (err) {
      throw new Error(
        err instanceof Error && err.name === 'AbortError'
          ? `Loading ${url} timed out. Check your network.`
          : `Network error loading ${url}.`,
      );
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) {
      throw new Error(
        res.status === 404
          ? `Question bank not found (${url}). Ensure public/data/ files are present.`
          : `Failed to load ${url}: HTTP ${res.status}`,
      );
    }
    const data: PaperData = await res.json();
    CACHE[board] = data;
    return data;
  },

  getSavedPapers(): SavedPaper[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (err) {
      console.warn('[paperService] Corrupted saved papers data, resetting:', err);
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
  },

  savePaper(paper: SavedPaper): void {
    const papers = this.getSavedPapers();
    const idx = papers.findIndex(p => p.id === paper.id);
    if (idx >= 0) {
      papers[idx] = paper;
    } else {
      papers.unshift(paper);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    } catch {
      throw new Error('Storage is full. Delete some saved papers to free up space.');
    }
  },

  deletePaper(id: string): void {
    const papers = this.getSavedPapers().filter(p => p.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
    } catch {
      // Deletion makes space, not throws — best-effort
    }
  },

  /** Extract unique chapters/sections from questions */
  extractSections(questions: PaperQuestion[]): { chapter: string; sections: string[] }[] {
    const map = new Map<string, Set<string>>();
    for (const q of questions) {
      if (!q.s) continue;
      const chapter = q.s.split('.')[0];
      if (!map.has(chapter)) map.set(chapter, new Set());
      map.get(chapter)!.add(q.s);
    }
    return Array.from(map.entries())
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([chapter, sections]) => ({
        chapter,
        sections: Array.from(sections).sort((a, b) => {
          const [ma, sa] = a.split('.').map(Number);
          const [mb, sb] = b.split('.').map(Number);
          return ma - mb || sa - sb;
        }),
      }));
  },

  /** Extract unique cmd values */
  extractCmds(questions: PaperQuestion[]): string[] {
    const cmds = new Set<string>();
    for (const q of questions) {
      if (q.cmd) cmds.add(q.cmd);
    }
    return Array.from(cmds).sort();
  },

  /** Extract year range */
  extractYears(questions: PaperQuestion[]): number[] {
    const years = new Set<number>();
    for (const q of questions) {
      if (q.year) years.add(q.year);
    }
    return Array.from(years).sort();
  },
};
