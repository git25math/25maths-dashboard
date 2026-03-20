import { KahootItem } from '../types';

export interface KahootDeployOptions {
  use_ai_fill?: boolean;
  sync_website?: boolean;
  update_listing?: boolean;
  headless?: boolean;
  manual_fallback?: boolean;
  slow_mo?: number;
  website_root?: string;
}

export const DEFAULT_DEPLOY_OPTIONS: KahootDeployOptions = {
  use_ai_fill: true,
  sync_website: true,
  update_listing: true,
  headless: false,
  manual_fallback: true,
  slow_mo: 250,
};

export const DEPLOY_OPTIONS_KEY = 'kahoot-deploy-options';

export interface LocalAgentLogLine {
  at: string;
  stream: 'stdout' | 'stderr';
  message: string;
}

export interface LocalAgentJob {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  meta?: {
    item_id?: string;
    title?: string;
    dry_run?: boolean;
  };
  created_at: string;
  started_at?: string | null;
  finished_at?: string | null;
  logs: LocalAgentLogLine[];
  result?: Record<string, unknown> | null;
  error?: string | null;
  command?: string;
  pid?: number | null;
}

export interface LocalAgentFigureScanItem {
  paperKey: string;      // e.g. `2018March/Paper12`
  questionKey: string;   // e.g. `Q07`
  filename: string;
  width?: number;
  height?: number;
  size_bytes?: number;
  mtime_ms?: number;
}

export interface LocalAgentFigureScanResponse {
  ok: boolean;
  root: string;
  count: number;
  truncated?: boolean;
  items: LocalAgentFigureScanItem[];
}

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, '');

const DEFAULT_TIMEOUT = 30_000;

async function fetchWithTimeout(
  url: string,
  init?: RequestInit & { timeout?: number },
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchInit } = init || {};
  const controller = new AbortController();
  if (fetchInit.signal) {
    // Forward external abort to our controller
    fetchInit.signal.addEventListener('abort', () => controller.abort(fetchInit.signal!.reason));
  }
  const timer = setTimeout(() => controller.abort('Request timed out'), timeout);
  try {
    return await fetch(url, { ...fetchInit, signal: controller.signal });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeout}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const localAgentService = {
  getFileUrl(baseUrl: string, filePath: string, download = false): string {
    const url = new URL(`${normalizeBaseUrl(baseUrl)}/files`);
    url.searchParams.set('path', filePath);
    if (download) {
      url.searchParams.set('download', '1');
    }
    return url.toString();
  },

  async ping(baseUrl: string): Promise<{ ok: boolean; service: string; time: string; website_root?: string; figures_root?: string; write_enabled?: boolean }> {
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/health`, { timeout: 5_000 });
    return parseJson(response);
  },

  async scanFigures(baseUrl: string, payload: { root: string; limit?: number }): Promise<LocalAgentFigureScanResponse> {
    if (!payload.root) {
      throw new Error('scanFigures requires root');
    }
    const url = new URL(`${normalizeBaseUrl(baseUrl)}/figures/scan`);
    url.searchParams.set('root', payload.root);
    if (payload.limit) url.searchParams.set('limit', String(payload.limit));
    const response = await fetchWithTimeout(url.toString(), { timeout: 60_000 });
    return parseJson(response);
  },

  async trashFigure(baseUrl: string, payload: { path: string }): Promise<{ ok: boolean; from: string; to: string }> {
    if (!payload.path) {
      throw new Error('trashFigure requires path');
    }
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/figures/trash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 30_000,
    });
    return parseJson(response);
  },

  async startKahootUpload(baseUrl: string, item: KahootItem, dryRun = false, options?: KahootDeployOptions): Promise<LocalAgentJob> {
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/jobs/kahoot-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, dry_run: dryRun, options }),
    });
    return parseJson(response);
  },

  async startKahootArtifacts(baseUrl: string, item: KahootItem, options?: KahootDeployOptions): Promise<LocalAgentJob> {
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/jobs/kahoot-artifacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, options }),
    });
    return parseJson(response);
  },

  async startKahootSpreadsheet(baseUrl: string, item: KahootItem, options?: KahootDeployOptions): Promise<LocalAgentJob> {
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/jobs/kahoot-spreadsheet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, options }),
    });
    return parseJson(response);
  },

  async startPaperGenerate(baseUrl: string, payload: { id: string; texSource: string }): Promise<LocalAgentJob> {
    if (!payload.id || !payload.texSource) {
      throw new Error('Paper generate requires both id and texSource');
    }
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/jobs/paper-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  },

  async startCoverBatch(baseUrl: string, payload: { template: string; topics: string[]; params: Record<string, unknown> }): Promise<LocalAgentJob> {
    if (!payload.template || !payload.topics?.length || !payload.params) {
      throw new Error('Cover batch requires template, topics array, and params');
    }
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/jobs/cover-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  },

  async getJob(baseUrl: string, jobId: string): Promise<LocalAgentJob> {
    const response = await fetchWithTimeout(`${normalizeBaseUrl(baseUrl)}/jobs/${jobId}`);
    return parseJson(response);
  },
};
