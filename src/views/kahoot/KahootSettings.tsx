import { useCallback, useEffect, useState } from 'react';
import { RefreshCcw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DEFAULT_DEPLOY_OPTIONS, DEPLOY_OPTIONS_KEY, KahootDeployOptions, localAgentService } from '../../services/localAgentService';
const AGENT_URL_KEY = 'kahoot-agent-url';

type AgentStatus = 'idle' | 'checking' | 'online' | 'offline';

interface KahootSettingsProps {
  onOpenGuide: () => void;
}

export function KahootSettings({ onOpenGuide }: KahootSettingsProps) {
  const [agentUrl, setAgentUrl] = useState(() => localStorage.getItem(AGENT_URL_KEY) || 'http://127.0.0.1:4318');
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('idle');
  const [agentInfo, setAgentInfo] = useState('');
  const [options, setOptions] = useState<KahootDeployOptions>(() => {
    try {
      const raw = localStorage.getItem(DEPLOY_OPTIONS_KEY);
      return raw ? { ...DEFAULT_DEPLOY_OPTIONS, ...JSON.parse(raw) } : DEFAULT_DEPLOY_OPTIONS;
    } catch { return DEFAULT_DEPLOY_OPTIONS; }
  });

  useEffect(() => { localStorage.setItem(AGENT_URL_KEY, agentUrl); }, [agentUrl]);
  useEffect(() => { localStorage.setItem(DEPLOY_OPTIONS_KEY, JSON.stringify(options)); }, [options]);

  const checkAgent = useCallback(async () => {
    setAgentStatus('checking');
    try {
      const res = await localAgentService.ping(agentUrl);
      setAgentStatus('online');
      setAgentInfo(res.website_root ? `${res.service} - ${res.website_root}` : res.service);
    } catch {
      setAgentStatus('offline');
      setAgentInfo('Could not reach agent');
    }
  }, [agentUrl]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">Settings</h3>
        <p className="text-sm text-slate-500">Configure the local deploy agent and default options.</p>
      </div>

      {/* Agent */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Local Agent</p>

        <div className="flex items-end gap-3">
          <label className="flex-1 space-y-2">
            <span className="text-xs text-slate-400">Agent URL</span>
            <input
              value={agentUrl}
              onChange={e => setAgentUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <button type="button" onClick={checkAgent} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:border-slate-300 transition">
            <RefreshCcw size={14} /> Check
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className={cn(
            'w-2 h-2 rounded-full',
            agentStatus === 'online' ? 'bg-emerald-500' : agentStatus === 'offline' ? 'bg-rose-500' : agentStatus === 'checking' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300',
          )} />
          <span className="text-sm text-slate-500">{agentInfo || (agentStatus === 'idle' ? 'Not checked yet' : agentStatus === 'checking' ? 'Checking...' : '')}</span>
        </div>
      </section>

      {/* Deploy options */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Default Deploy Options</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ['use_ai_fill', 'AI-fill missing metadata'],
            ['sync_website', 'Sync website after upload'],
            ['update_listing', 'Update Listing.md'],
            ['headless', 'Run browser headless'],
            ['manual_fallback', 'Allow manual fallback'],
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
        <label className="flex items-center gap-3 text-sm text-slate-700">
          <span className="text-xs text-slate-400">Slow Mo</span>
          <select
            value={options.slow_mo ?? 250}
            onChange={e => setOptions(prev => ({ ...prev, slow_mo: Number(e.target.value) }))}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm outline-none"
          >
            {[0, 150, 250, 500, 1000].map(v => <option key={v} value={v}>{v}ms</option>)}
          </select>
        </label>
      </section>

      {/* Module Guide link */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900">Module Guide</p>
            <p className="text-xs text-slate-500 mt-1">Learn how this module works, file structure, and pipeline architecture.</p>
          </div>
          <button
            type="button"
            onClick={onOpenGuide}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 transition"
          >
            Open Guide
          </button>
        </div>
      </section>
    </div>
  );
}
