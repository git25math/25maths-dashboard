import { isSupabaseConfigured, requireSupabase } from '../lib/supabase';

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

async function invoke<T = unknown>(body: Record<string, unknown>): Promise<T> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke('github-proxy', { body });
  if (error) throw new Error(error.message ?? 'Edge function error');
  return data as T;
}

export const githubService = {
  isConfigured(): boolean {
    return isSupabaseConfigured;
  },

  async triggerWorkflow(
    instruction: string,
    provider: 'claude' | 'gemini',
    apiKeySlot: 'auto' | '1' | '2' | '3' = 'auto',
  ): Promise<void> {
    await invoke({ action: 'triggerWorkflow', instruction, provider, apiKeySlot });
  },

  async listRuns(perPage = 15): Promise<WorkflowRun[]> {
    const data = await invoke<{ workflow_runs?: WorkflowRun[] }>({
      action: 'listRuns',
      perPage,
    });
    return data.workflow_runs ?? [];
  },

  async getRun(runId: number): Promise<WorkflowRun> {
    return invoke<WorkflowRun>({ action: 'getRun', runId });
  },
};
