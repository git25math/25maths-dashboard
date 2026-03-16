/**
 * Render job panel — shows active/recent jobs with progress and log tail.
 */

import { X, Loader2, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AgentJob } from '../../services/mveAgentService';

interface VideoRenderPanelProps {
  jobs: AgentJob[];
  onCancel: (jobId: string) => void;
  onClose: () => void;
}

const STATUS_ICON = {
  queued: <Loader2 size={14} className="text-slate-400" />,
  running: <Loader2 size={14} className="text-indigo-500 animate-spin" />,
  completed: <CheckCircle2 size={14} className="text-emerald-500" />,
  failed: <XCircle size={14} className="text-rose-500" />,
  cancelled: <Ban size={14} className="text-slate-400" />,
} as const;

const STATUS_COLOR = {
  queued: 'text-slate-500',
  running: 'text-indigo-600',
  completed: 'text-emerald-600',
  failed: 'text-rose-600',
  cancelled: 'text-slate-400',
} as const;

export function VideoRenderPanel({ jobs, onCancel, onClose }: VideoRenderPanelProps) {
  if (jobs.length === 0) return null;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Jobs ({jobs.length})
        </p>
        <button type="button" onClick={onClose} className="rounded-full p-1 hover:bg-slate-100 transition">
          <X size={14} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {jobs.map(job => (
          <div key={job.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
            {/* Job header */}
            <div className="flex items-center gap-2">
              {STATUS_ICON[job.status]}
              <span className={cn('text-xs font-bold', STATUS_COLOR[job.status])}>
                {job.type}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{job.id}</span>
              <div className="flex-1" />
              {(job.status === 'queued' || job.status === 'running') && (
                <button
                  type="button"
                  onClick={() => onCancel(job.id)}
                  className="text-[10px] font-bold text-rose-500 hover:text-rose-600 transition"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Progress bar */}
            {job.status === 'running' && (
              <div className="h-1 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.round(job.progress * 100)}%` }}
                />
              </div>
            )}

            {/* Error */}
            {job.error && (
              <p className="text-[10px] text-rose-500 font-mono truncate">{job.error}</p>
            )}

            {/* Log tail */}
            {job.log_tail.length > 0 && (
              <pre className="text-[10px] text-slate-400 font-mono bg-slate-50 rounded-lg p-2 max-h-24 overflow-y-auto whitespace-pre-wrap">
                {job.log_tail.slice(-10).join('\n')}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
