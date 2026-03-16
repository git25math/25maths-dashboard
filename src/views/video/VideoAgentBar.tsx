/**
 * Agent connection status bar for VideoHub.
 */

import { RefreshCw, Wifi, WifiOff, Zap } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AgentStatus, AgentJob } from '../../services/mveAgentService';

interface VideoAgentBarProps {
  connected: boolean;
  status: AgentStatus | null;
  jobs: AgentJob[];
  syncing: boolean;
  onSync: () => void;
  onToggleJobs?: () => void;
}

export function VideoAgentBar({ connected, status, jobs, syncing, onSync, onToggleJobs }: VideoAgentBarProps) {
  const activeJobs = jobs.filter(j => j.status === 'running' || j.status === 'queued');

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors',
      connected
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        : 'bg-slate-50 text-slate-400 border border-slate-200',
    )}>
      {/* Connection indicator */}
      <div className="flex items-center gap-1.5">
        {connected ? <Wifi size={14} /> : <WifiOff size={14} />}
        <span>{connected ? 'Agent Connected' : 'Agent Offline'}</span>
      </div>

      {/* Status info */}
      {connected && status && (
        <>
          <span className="text-emerald-400">|</span>
          <span className="tabular-nums">{status.script_count} scripts</span>
          <span className="text-emerald-400">|</span>
          <span className="tabular-nums">{status.output_count} outputs</span>
        </>
      )}

      {/* Active jobs (clickable) */}
      {jobs.length > 0 && (
        <>
          <span className={connected ? 'text-emerald-400' : 'text-slate-300'}>|</span>
          <button
            type="button"
            onClick={onToggleJobs}
            className="flex items-center gap-1 hover:underline"
          >
            {activeJobs.length > 0 && <Zap size={12} className="animate-pulse" />}
            {activeJobs.length > 0
              ? `${activeJobs.length} active`
              : `${jobs.length} job${jobs.length !== 1 ? 's' : ''}`}
          </button>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Sync button */}
      {connected && (
        <button
          type="button"
          onClick={onSync}
          disabled={syncing}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition',
            syncing
              ? 'bg-emerald-100 text-emerald-400 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95',
          )}
        >
          <RefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
      )}
    </div>
  );
}
