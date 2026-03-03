const OWNER = 'git25math';
const REPO = '25maths-dashboard';
const WORKFLOW_FILE = 'self-evolve.yml';

export interface WorkflowRun {
  id: number;
  status: 'queued' | 'in_progress' | 'completed' | 'waiting';
  conclusion: 'success' | 'failure' | 'cancelled' | 'skipped' | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at: string | null;
  display_title: string;
}

function getToken(): string {
  const token = import.meta.env.VITE_GITHUB_TOKEN;
  if (!token) throw new Error('VITE_GITHUB_TOKEN is not configured');
  return token;
}

async function ghFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status}: ${body}`);
  }
  return res;
}

export const githubService = {
  isConfigured(): boolean {
    try {
      getToken();
      return true;
    } catch {
      return false;
    }
  },

  async triggerWorkflow(instruction: string, provider: 'claude' | 'gemini', apiKeySlot: 'auto' | '1' | '2' | '3' = 'auto'): Promise<void> {
    await ghFetch(`/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`, {
      method: 'POST',
      body: JSON.stringify({
        ref: 'main',
        inputs: { instruction, provider, api_key_slot: apiKeySlot },
      }),
    });
  },

  async listRuns(perPage = 15): Promise<WorkflowRun[]> {
    const res = await ghFetch(
      `/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=${perPage}`
    );
    const data = await res.json();
    return (data.workflow_runs ?? []) as WorkflowRun[];
  },

  async getRun(runId: number): Promise<WorkflowRun> {
    const res = await ghFetch(`/repos/${OWNER}/${REPO}/actions/runs/${runId}`);
    return (await res.json()) as WorkflowRun;
  },
};
