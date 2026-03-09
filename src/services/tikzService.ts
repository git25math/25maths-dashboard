/** TikzVault catalog service — loads split-by-year JSON from public/data/tikz/ */

export interface TikzFigure {
  name: string;
  tikz_file: string;
  png_file: string;
  tikz_status: string;
  standalone_file: string;
}

export interface TikzQuestion {
  id: string;
  path: string;
  source: {
    exam: string;
    year: number;
    session: string;
    paper: string;
    question: string;
  };
  total_marks: number;
  topics: string[];
  question_status: string;
  tikz_status: string;
  review_note: string;
  original_pdf_note: string;
  figures: TikzFigure[];
  has_question_pdf: boolean;
  has_original_pdf: boolean;
}

export interface TikzYearSummary {
  year: number;
  count: number;
  sessions: string[];
  papers: string[];
  topics: Record<string, number>;
  figures: number;
}

export interface TikzCatalogIndex {
  generated_at: string;
  summary: {
    total_questions: number;
    question_status: Record<string, number>;
    total_figures: number;
    tikz_status: Record<string, number>;
  };
  years: TikzYearSummary[];
}

const BASE = `${import.meta.env.BASE_URL || '/'}data/tikz`;

let indexCache: TikzCatalogIndex | null = null;
const yearCache: Record<number, TikzQuestion[]> = {};

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: HTTP ${res.status}`);
  return res.json();
}

export const tikzService = {
  /** Load the lightweight index (~3 KB) */
  async loadIndex(): Promise<TikzCatalogIndex> {
    if (indexCache) return indexCache;
    indexCache = await fetchJSON<TikzCatalogIndex>(`${BASE}/catalog-index.json`);
    return indexCache;
  },

  /** Load questions for a specific year (~200-380 KB each) */
  async loadYear(year: number): Promise<TikzQuestion[]> {
    if (yearCache[year]) return yearCache[year];
    const data = await fetchJSON<TikzQuestion[]>(`${BASE}/catalog-${year}.json`);
    yearCache[year] = data;
    return data;
  },

  /** Load multiple years at once */
  async loadYears(years: number[]): Promise<TikzQuestion[]> {
    const results = await Promise.all(years.map(y => this.loadYear(y)));
    return results.flat();
  },
};
