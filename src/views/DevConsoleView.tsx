import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, RefreshCw, Clock, Loader2, CheckCircle2, XCircle,
  ExternalLink, AlertTriangle, Terminal, Key,
} from 'lucide-react';
import { githubService, type WorkflowRun } from '../services/githubService';

type Provider = 'claude' | 'gemini';
type KeySlot = 'auto' | '1' | '2' | '3';

function StatusIcon({ run }: { run: WorkflowRun }) {
  if (run.status === 'queued' || run.status === 'waiting') {
    return <Clock size={18} className="text-slate-400" />;
  }
  if (run.status === 'in_progress') {
    return <Loader2 size={18} className="text-blue-500 animate-spin" />;
  }
  if (run.conclusion === 'success') {
    return <CheckCircle2 size={18} className="text-emerald-500" />;
  }
  if (run.conclusion === 'failure') {
    return <XCircle size={18} className="text-red-500" />;
  }
  return <Clock size={18} className="text-slate-300" />;
}

function statusLabel(run: WorkflowRun): { text: string; color: string } {
  if (run.status === 'queued' || run.status === 'waiting') {
    return { text: 'Queued', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' };
  }
  if (run.status === 'in_progress') {
    return { text: 'Running', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' };
  }
  if (run.conclusion === 'success') {
    return { text: 'Success', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' };
  }
  if (run.conclusion === 'failure') {
    return { text: 'Failed', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' };
  }
  if (run.conclusion === 'cancelled') {
    return { text: 'Cancelled', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' };
  }
  return { text: run.status, color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' };
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function duration(run: WorkflowRun): string | null {
  if (!run.run_started_at) return null;
  const start = new Date(run.run_started_at).getTime();
  const end = run.status === 'completed' ? new Date(run.updated_at).getTime() : Date.now();
  const secs = Math.floor((end - start) / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remSecs = secs % 60;
  return `${mins}m ${remSecs}s`;
}

export function DevConsoleView() {
  const configured = githubService.isConfigured();

  // --- Instruction form state ---
  const [instruction, setInstruction] = useState('');
  const [provider, setProvider] = useState<Provider>('claude');
  const [keySlot, setKeySlot] = useState<KeySlot>('auto');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --- Run history state ---
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loadingRuns, setLoadingRuns] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRuns = useCallback(async () => {
    try {
      const data = await githubService.listRuns();
      setRuns(data);
    } catch {
      // silently fail on polling
    }
  }, []);

  const refreshRuns = async () => {
    setLoadingRuns(true);
    await fetchRuns();
    setLoadingRuns(false);
  };

  // Initial load
  useEffect(() => {
    if (configured) refreshRuns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  // Auto-poll when active runs exist
  useEffect(() => {
    const hasActive = runs.some(r => r.status === 'queued' || r.status === 'in_progress' || r.status === 'waiting');
    if (hasActive && !pollingRef.current) {
      pollingRef.current = setInterval(fetchRuns, 5000);
    } else if (!hasActive && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [runs, fetchRuns]);

  const handleSubmit = async () => {
    if (!instruction.trim() || submitting) return;
    setSubmitting(true);
    setMessage(null);
    try {
      await githubService.triggerWorkflow(instruction.trim(), provider, keySlot);
      setMessage({ type: 'success', text: 'Workflow triggered! It may take a few seconds to appear below.' });
      setInstruction('');
      // Refresh after a short delay to pick up the new run
      setTimeout(fetchRuns, 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to trigger workflow' });
    } finally {
      setSubmitting(false);
    }
  };

  // --- Token not configured guard ---
  if (!configured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Terminal size={28} className="text-indigo-600" />
          <h2 className="text-2xl font-bold dark:text-white">Dev Console</h2>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertTriangle size={20} />
            <span className="font-semibold">GitHub Token Not Configured</span>
          </div>
          <p className="text-sm text-amber-600 dark:text-amber-400">
            To use the Dev Console, configure a GitHub Personal Access Token:
          </p>
          <ol className="text-sm text-slate-600 dark:text-slate-300 space-y-2 list-decimal list-inside">
            <li>Create a <strong>Fine-grained PAT</strong> on GitHub with <code>Actions (R/W)</code> and <code>Contents (R/W)</code> permissions for this repo</li>
            <li>Add <code>VITE_GITHUB_TOKEN=github_pat_...</code> to your <code>.env.local</code></li>
            <li>Add the same token as a GitHub Secret: <code>gh secret set VITE_GITHUB_TOKEN</code></li>
            <li>Also add <code>ANTHROPIC_API_KEY</code> as a GitHub Secret for Claude support</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Terminal size={28} className="text-indigo-600" />
        <h2 className="text-2xl font-bold dark:text-white">Dev Console</h2>
      </div>

      {/* Instruction Input */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Enter development instruction... e.g. Add a dark mode toggle to the sidebar"
          rows={4}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white placeholder:text-slate-400"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            {/* Provider selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Provider</span>
              {(['claude', 'gemini'] as Provider[]).map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    provider === p
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            {/* API Key Slot */}
            <div className="flex items-center gap-2">
              <Key size={14} className="text-slate-400 dark:text-slate-500" />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Key</span>
              {(['auto', '1', '2', '3'] as KeySlot[]).map(s => (
                <button
                  key={s}
                  onClick={() => setKeySlot(s)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    keySlot === s
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {s === 'auto' ? 'Auto' : `#${s}`}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!instruction.trim() || submitting}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Execute
          </button>
        </div>

        {/* Inline message */}
        {message && (
          <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {message.text}
          </p>
        )}
      </div>

      {/* Run History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg dark:text-white">Run History</h3>
          <button
            onClick={refreshRuns}
            disabled={loadingRuns}
            className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <RefreshCw size={14} className={loadingRuns ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {runs.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
            No workflow runs yet. Execute an instruction above to get started.
          </p>
        ) : (
          <div className="space-y-2">
            {runs.map(run => {
              const st = statusLabel(run);
              const dur = duration(run);
              return (
                <div
                  key={run.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                >
                  <div className="mt-0.5">
                    <StatusIcon run={run} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                      {run.display_title}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>
                        {st.text}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {relativeTime(run.created_at)}
                      </span>
                      {dur && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {dur}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
