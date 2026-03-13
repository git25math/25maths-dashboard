import { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Edit3, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProjectMilestone, MilestoneStatus, DevLogEntry, DEV_LOG_TAGS } from '../../types/chronicle';
import { Task } from '../../types';
import { formatDate } from '../../lib/utils';

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; icon: typeof Circle; color: string; pillColor: string }> = {
  not_started: { label: 'Not Started', icon: Circle, color: 'text-slate-400', pillColor: 'bg-slate-100 text-slate-600' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'text-blue-500', pillColor: 'bg-blue-100 text-blue-700' },
  completed: { label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500', pillColor: 'bg-emerald-100 text-emerald-700' },
};

interface MilestoneCardProps {
  milestone: ProjectMilestone;
  tasks: Task[];
  devlogs?: DevLogEntry[];
  onCycleStatus: (id: string) => Promise<MilestoneStatus | undefined>;
  onEdit: (ms: ProjectMilestone) => void;
  onDelete: (id: string) => void;
  onRequestReview: (ms: ProjectMilestone) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function MilestoneCard({ milestone, tasks, devlogs = [], onCycleStatus, onEdit, onDelete, onRequestReview, onMoveUp, onMoveDown }: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[milestone.status];
  const Icon = cfg.icon;

  const linkedTasks = tasks.filter(t => t.milestone_id === milestone.id);
  const linkedLogs = devlogs.filter(d => d.milestone_id === milestone.id);
  const doneTasks = linkedTasks.filter(t => t.status === 'done').length;
  const totalTasks = linkedTasks.length;
  const percent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleCycleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = await onCycleStatus(milestone.id);
    if (newStatus === 'completed' && !milestone.review) {
      onRequestReview(milestone);
    }
  };

  return (
    <div className="glass-card overflow-hidden group">
      <div
        className="p-4 cursor-pointer flex items-start gap-3"
        onClick={() => setExpanded(!expanded)}
      >
        <button onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }} className="mt-1 text-slate-400">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <button onClick={handleCycleStatus} className={cn('mt-0.5 transition-colors', cfg.color)} title="Click to cycle status">
          <Icon size={18} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-slate-900">{milestone.title}</h4>
            <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded', cfg.pillColor)}>
              {cfg.label}
            </span>
            {milestone.review && (
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-violet-100 text-violet-700">
                Reviewed
              </span>
            )}
          </div>

          {milestone.description && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{milestone.description}</p>
          )}

          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
            {totalTasks > 0 && (
              <span className="font-bold">{doneTasks}/{totalTasks} tasks done</span>
            )}
            {milestone.due_date && (
              <span className="flex items-center gap-1 font-bold">
                <Calendar size={10} /> {formatDate(milestone.due_date)}
              </span>
            )}
          </div>

          {totalTasks > 0 && (
            <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden max-w-xs">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
            </div>
          )}
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all flex-shrink-0">
          {onMoveUp && <button onClick={(e) => { e.stopPropagation(); onMoveUp(); }} className="text-slate-300 hover:text-slate-600 text-xs px-1">↑</button>}
          {onMoveDown && <button onClick={(e) => { e.stopPropagation(); onMoveDown(); }} className="text-slate-300 hover:text-slate-600 text-xs px-1">↓</button>}
          <button onClick={(e) => { e.stopPropagation(); onEdit(milestone); }} className="text-slate-300 hover:text-indigo-500 transition-colors">
            <Edit3 size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this milestone?')) onDelete(milestone.id); }} className="text-slate-300 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100 pt-3 space-y-3">
          {linkedTasks.length > 0 ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Linked Tasks</p>
              <div className="space-y-1">
                {linkedTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-2 text-sm">
                    <span className={cn('w-2 h-2 rounded-full', t.status === 'done' ? 'bg-emerald-500' : 'bg-slate-300')} />
                    <span className={cn(t.status === 'done' && 'line-through text-slate-400')}>{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No linked tasks yet.</p>
          )}

          {linkedLogs.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Linked Dev Logs</p>
              <div className="space-y-1">
                {linkedLogs.map(dl => (
                  <div key={dl.id} className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    <span className="text-slate-700">{dl.title}</span>
                    {dl.tags.slice(0, 2).map(t => {
                      const tagCfg = DEV_LOG_TAGS.find(dt => dt.key === t);
                      return tagCfg ? <span key={t} className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', tagCfg.color)}>{tagCfg.label}</span> : null;
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {milestone.review && (
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Milestone Review</p>
              <div className="space-y-1 text-sm">
                <p><span className="font-bold text-slate-700">Done:</span> <span className="text-slate-600">{milestone.review.what_done}</span></p>
                <p><span className="font-bold text-slate-700">Learned:</span> <span className="text-slate-600">{milestone.review.what_learned}</span></p>
                <p><span className="font-bold text-slate-700">Improve:</span> <span className="text-slate-600">{milestone.review.what_improve}</span></p>
                {milestone.review.time_spent && (
                  <p><span className="font-bold text-slate-700">Time:</span> <span className="text-slate-600">{milestone.review.time_spent}</span></p>
                )}
              </div>
            </div>
          )}

          {milestone.status === 'completed' && !milestone.review && (
            <button
              onClick={() => onRequestReview(milestone)}
              className="btn-secondary text-xs"
            >
              Write Review
            </button>
          )}
        </div>
      )}
    </div>
  );
}
