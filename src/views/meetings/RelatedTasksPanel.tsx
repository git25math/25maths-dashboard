import { memo } from 'react';
import { cn } from '../../lib/utils';
import { TASK_STATUS_COLORS } from '../../lib/statusColors';
import { Task } from '../../types';

interface RelatedTasksPanelProps {
  tasks: Task[];
  onCycleTaskStatus?: (id: string) => void;
}

export const RelatedTasksPanel = memo(function RelatedTasksPanel({ tasks, onCycleTaskStatus }: RelatedTasksPanelProps) {
  const completedCount = tasks.filter(t => t.status === 'done').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="glass-card p-6">
      <h3 className="font-bold text-slate-900 mb-3">Related Tasks</h3>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
        </div>
        <span className="text-xs font-bold text-slate-500 whitespace-nowrap">{completedCount}/{tasks.length} completed</span>
      </div>

      <div className="space-y-2">
        {tasks.map(task => {
          const isOverdue = task.due_date && task.status !== 'done' && new Date(task.due_date) < new Date();
          return (
            <div key={task.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <button
                onClick={() => onCycleTaskStatus?.(task.id)}
                className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 transition-colors", TASK_STATUS_COLORS[task.status])}
                title={`Click to cycle status (current: ${task.status})`}
              >
                {task.status}
              </button>

              <span className={cn("w-2 h-2 rounded-full shrink-0", task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-400')} />

              <span className={cn("text-sm flex-1 min-w-0 truncate", task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700')}>
                {task.title}
              </span>

              {task.assignee && (
                <span className="text-xs text-slate-400 shrink-0">{task.assignee}</span>
              )}

              {task.due_date && (
                <span className={cn("text-xs shrink-0", isOverdue ? 'text-red-500 font-bold' : 'text-slate-400')}>
                  {task.due_date}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
