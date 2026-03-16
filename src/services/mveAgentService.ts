/**
 * MVE Agent HTTP client — connects to local mve agent server.
 */

import { VideoScript } from '../types/video';

const MVE_AGENT_URL_KEY = 'mve-agent-url';
const DEFAULT_URL = 'http://localhost:9700';
const PING_TIMEOUT = 3_000;
const DEFAULT_TIMEOUT = 30_000;

function getBaseUrl(): string {
  return (localStorage.getItem(MVE_AGENT_URL_KEY) || DEFAULT_URL).replace(/\/$/, '');
}

export function setAgentUrl(url: string): void {
  localStorage.setItem(MVE_AGENT_URL_KEY, url.replace(/\/$/, ''));
}

export function getAgentUrl(): string {
  return getBaseUrl();
}

async function fetchWithTimeout(
  url: string,
  init?: RequestInit & { timeout?: number },
): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchInit } = init || {};
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeout);
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

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ────────────────────────────────────────────────

export interface AgentStatus {
  version: string;
  project_root: string;
  boards: string[];
  script_count: number;
  output_count: number;
}

export interface AgentJob {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  params: Record<string, unknown>;
  progress: number;
  log_tail: string[];
  result: Record<string, unknown> | null;
  error: string | null;
  created_at: number;
  started_at: number | null;
  finished_at: number | null;
}

export interface OutputInfo {
  id: string;
  render_meta: Record<string, unknown> | null;
  bilibili_meta: Record<string, unknown> | null;
  files: { name: string; path: string; size: number }[];
  cover_path: string | null;
}

// ── Service ──────────────────────────────────────────────

export const mveAgent = {
  async ping(): Promise<boolean> {
    try {
      const res = await fetchWithTimeout(`${getBaseUrl()}/api/status`, { timeout: PING_TIMEOUT });
      return res.ok;
    } catch {
      return false;
    }
  },

  async getStatus(): Promise<AgentStatus> {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/status`);
    return json(res);
  },

  async getScripts(board = 'cie'): Promise<VideoScript[]> {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/scripts?board=${board}`);
    const data = await json<Record<string, unknown>[]>(res);
    // Add timestamps if missing (agent doesn't track these)
    const now = new Date().toISOString();
    return data.map(d => ({
      ...d,
      created_at: (d.created_at as string) || now,
      updated_at: (d.updated_at as string) || now,
    })) as VideoScript[];
  },

  async getScript(id: string, board = 'cie'): Promise<VideoScript & { script_yaml: string }> {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/scripts/${id}?board=${board}`);
    return json(res);
  },

  async getScriptYaml(id: string, board = 'cie'): Promise<string> {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/scripts/${id}/yaml?board=${board}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  },

  async getOutputInfo(id: string, board = 'cie'): Promise<OutputInfo> {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/outputs/${id}?board=${board}`);
    return json(res);
  },

  getCoverUrl(id: string, board = 'cie'): string {
    return `${getBaseUrl()}/api/outputs/${id}/cover?board=${board}`;
  },

  async submitJob(type: string, params: Record<string, unknown> = {}): Promise<{ job_id: string }> {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/jobs/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return json(res);
  },

  async getJobs(): Promise<AgentJob[]> {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/jobs`);
    return json(res);
  },

  async getJob(jobId: string): Promise<AgentJob> {
    const res = await fetchWithTimeout(`${getBaseUrl()}/api/jobs/${jobId}`);
    return json(res);
  },

  async cancelJob(jobId: string): Promise<void> {
    await fetchWithTimeout(`${getBaseUrl()}/api/jobs/${jobId}`, { method: 'DELETE' });
  },

  connectSSE(onEvent: (event: { type: string; [key: string]: unknown }) => void): EventSource {
    const es = new EventSource(`${getBaseUrl()}/api/events`);

    const handler = (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(data);
      } catch {
        // ignore parse errors
      }
    };

    // Listen for all known event types
    for (const t of ['job_created', 'job_started', 'job_completed', 'job_failed', 'job_cancelled', 'job_log']) {
      es.addEventListener(t, handler);
    }
    es.addEventListener('message', handler);

    return es;
  },
};
