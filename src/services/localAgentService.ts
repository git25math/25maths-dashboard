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

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, '');

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const localAgentService = {
  async ping(baseUrl: string): Promise<{ ok: boolean; service: string; time: string; website_root?: string }> {
    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/health`);
    return parseJson(response);
  },

  async startKahootUpload(baseUrl: string, item: KahootItem, dryRun = false, options?: KahootDeployOptions): Promise<LocalAgentJob> {
    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/jobs/kahoot-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, dry_run: dryRun, options }),
    });

    return parseJson(response);
  },

  async getJob(baseUrl: string, jobId: string): Promise<LocalAgentJob> {
    const response = await fetch(`${normalizeBaseUrl(baseUrl)}/jobs/${jobId}`);
    return parseJson(response);
  },
};
