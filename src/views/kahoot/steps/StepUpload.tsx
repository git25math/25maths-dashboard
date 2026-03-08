import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, LoaderCircle, RefreshCcw, Rocket, Terminal, XCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { DEFAULT_DEPLOY_OPTIONS, DEPLOY_OPTIONS_KEY, KahootDeployOptions, LocalAgentJob, localAgentService } from '../../../services/localAgentService';
import { KahootItem } from '../../../types';

function loadDeployOptions(): KahootDeployOptions {
  try {
    const raw = localStorage.getItem(DEPLOY_OPTIONS_KEY);
    return raw ? { ...DEFAULT_DEPLOY_OPTIONS, ...JSON.parse(raw) } : DEFAULT_DEPLOY_OPTIONS;
  } catch { return DEFAULT_DEPLOY_OPTIONS; }
}

type AgentStatus = 'idle' | 'checking' | 'online' | 'offline';

interface StepUploadProps {
  draft: KahootItem;
  onJobComplete: (job: LocalAgentJob) => void;
  onBack: () => void;
}

export function StepUpload({ draft, onJobComplete, onBack }: StepUploadProps) {
  const [agentUrl] = useState(() => localStorage.getItem('kahoot-agent-url') || 'http://127.0.0.1:4318');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [options, setOptions] = useState<KahootDeployOptions>(loadDeployOptions);
  const [job, setJob] = useState<LocalAgentJob | null>(null);
  const [starting, setStarting] = useState(false);

  // Persist options
  useEffect(() => {
    localStorage.setItem(DEPLOY_OPTIONS_KEY, JSON.stringify(options));
  }, [options]);

  // Auto-check agent on mount
  useEffect(() => { checkAgent(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAgent = useCallback(async () => {
    setAgentStatus('checking');
    try {
      await localAgentService.ping(agentUrl);
      setAgentStatus('online');
    } catch { setAgentStatus('offline'); }
  }, [agentUrl]);

  // Poll job status
  useEffect(() => {
    if (!job || !['queued', 'running'].includes(job.status)) return;
    const timer = window.setInterval(async () => {
      try {
        const next = await localAgentService.getJob(agentUrl, job.id);
        setJob(next);
        if (next.status === 'completed' || next.status === 'failed') {
          onJobComplete(next);
        }
      } catch { /* keep polling */ }
    }, 1500);
    return () => clearInterval(timer);
  }, [agentUrl, job, onJobComplete]);

  const handleDeploy = useCallback(async (dryRun: boolean) => {
    setStarting(true);
    try {
      const started = await localAgentService.startKahootUpload(agentUrl, draft, dryRun, options);
      setJob(started);
      setAgentStatus('online');
    } catch {
      setAgentStatus('offline');
    } finally {
      setStarting(false);
    }
  }, [agentUrl, draft, options]);

  const isRunning = job?.status === 'queued' || job?.status === 'running';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">Upload to Kahoot</h3>
        <p className="text-sm text-slate-500">
          The local agent will upload via Playwright automation.
          Make sure <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">npm run agent:local</code> is running.
        </p>
      </div>

      {/* Agent status */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-2.5 h-2.5 rounded-full',
            agentStatus === 'online' ? 'bg-emerald-500' : agentStatus === 'offline' ? 'bg-rose-500' : agentStatus === 'checking' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300',
          )} />
          <div>
            <p className="text-sm font-bold text-slate-900">Local Agent</p>
            <p className="text-xs text-slate-400">{agentUrl}</p>
          </div>
        </div>
        <button type="button" onClick={checkAgent} className="p-2 hover:bg-slate-100 rounded-lg transition">
          <RefreshCcw size={16} className="text-slate-400" />
        </button>
      </div>

      {/* Deploy options */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Options</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['use_ai_fill', 'AI-fill missing metadata'],
            ['sync_website', 'Sync website after upload'],
            ['update_listing', 'Update Listing.md'],
            ['manual_fallback', 'Allow manual browser fallback'],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(options[key as keyof KahootDeployOptions])}
                onChange={e => setOptions(prev => ({ ...prev, [key]: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Deploy buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleDeploy(true)}
          disabled={starting || isRunning || agentStatus !== 'online'}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Terminal size={15} /> Dry Run
        </button>
        <button
          type="button"
          onClick={() => handleDeploy(false)}
          disabled={starting || isRunning || agentStatus !== 'online'}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {starting ? <LoaderCircle size={15} className="animate-spin" /> : <Rocket size={15} />}
          Deploy
        </button>
      </div>

      {/* Job status + logs */}
      {job && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {job.status === 'completed' && <CheckCircle2 size={18} className="text-emerald-500" />}
            {job.status === 'failed' && <XCircle size={18} className="text-rose-500" />}
            {isRunning && <LoaderCircle size={18} className="text-indigo-500 animate-spin" />}
            <span className="text-sm font-bold text-slate-900 capitalize">{job.status}</span>
            {job.meta?.dry_run && <span className="text-xs text-slate-400">(dry run)</span>}
          </div>

          {job.error && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{job.error}</div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 max-h-72 overflow-y-auto">
            {(job.logs || []).map((line, i) => (
              <div key={`${line.at}-${i}`} className="font-mono text-xs leading-6 text-slate-200">
                <span className={line.stream === 'stderr' ? 'text-rose-300' : 'text-emerald-300'}>
                  [{line.stream}]
                </span>{' '}
                {line.message}
              </div>
            ))}
            {(!job.logs || job.logs.length === 0) && (
              <p className="font-mono text-xs text-slate-500">Waiting for output...</p>
            )}
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex justify-between pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isRunning}
          className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:border-slate-300 disabled:opacity-40"
        >
          Back
        </button>
      </div>
    </div>
  );
}
