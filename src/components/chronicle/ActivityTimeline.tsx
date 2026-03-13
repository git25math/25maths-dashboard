import { useMemo } from 'react';
import { Flag, FileText, CheckSquare, CheckCircle2, PenLine } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ProjectMilestone, DevLogEntry, DEV_LOG_TAGS } from '../../types/chronicle';
import { Task } from '../../types';
import { formatDate } from '../../lib/utils';

interface TimelineEvent {
  id: string;
  type: 'milestone_created' | 'milestone_completed' | 'task_created' | 'task_done' | 'devlog';
  title: string;
  subtitle?: string;
  timestamp: string;
  color: string;
  icon: typeof Flag;
}

interface ActivityTimelineProps {
  milestones: ProjectMilestone[];
  tasks: Task[];
  devlogs: DevLogEntry[];
  projectId: string;
}

export function ActivityTimeline({ milestones, tasks, devlogs, projectId }: ActivityTimelineProps) {
  const events = useMemo(() => {
    const items: TimelineEvent[] = [];

    for (const ms of milestones.filter(m => m.project_id === projectId)) {
      items.push({
        id: `ms-c-${ms.id}`,
        type: 'milestone_created',
        title: `Milestone created: ${ms.title}`,
        timestamp: ms.created_at,
        color: 'text-blue-500',
        icon: Flag,
      });
      if (ms.completed_at) {
        items.push({
          id: `ms-d-${ms.id}`,
          type: 'milestone_completed',
          title: `Milestone completed: ${ms.title}`,
          subtitle: ms.review ? 'Review written' : undefined,
          timestamp: ms.completed_at,
          color: 'text-emerald-500',
          icon: CheckCircle2,
        });
      }
    }

    for (const t of tasks.filter(t => t.project_id === projectId)) {
      items.push({
        id: `t-c-${t.id}`,
        type: 'task_created',
        title: `Task added: ${t.title}`,
        timestamp: t.created_at,
        color: 'text-slate-400',
        icon: CheckSquare,
      });
      if (t.completed_at) {
        items.push({
          id: `t-d-${t.id}`,
          type: 'task_done',
          title: `Task completed: ${t.title}`,
          timestamp: t.completed_at,
          color: 'text-emerald-500',
          icon: CheckSquare,
        });
      }
    }

    for (const dl of devlogs.filter(d => d.project_id === projectId)) {
      const tagLabels = dl.tags.map(t => DEV_LOG_TAGS.find(dt => dt.key === t)?.label || t).join(', ');
      items.push({
        id: `dl-${dl.id}`,
        type: 'devlog',
        title: dl.title,
        subtitle: tagLabels,
        timestamp: dl.created_at,
        color: 'text-violet-500',
        icon: dl.tags.includes('thinking') || dl.tags.includes('reflection') ? PenLine : FileText,
      });
    }

    return items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [milestones, tasks, devlogs, projectId]);

  if (events.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-slate-400">
        No activity yet. Create milestones, tasks, or dev logs to see the timeline.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
      <div className="space-y-0">
        {events.map(event => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="relative flex items-start gap-4 py-3 pl-2">
              <div className={cn('relative z-10 w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center flex-shrink-0', event.color)}>
                <Icon size={12} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-sm font-medium text-slate-700">{event.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-bold">{formatDate(event.timestamp)}</span>
                  {event.subtitle && (
                    <span className="text-[10px] text-slate-400">{event.subtitle}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
