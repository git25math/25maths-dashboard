import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, Inbox, ArrowRight, Clock, Archive, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task, TaskStatus, Project } from '../types';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';

type StatusFilter = 'all' | TaskStatus;

const STATUS_CONFIG: Record<TaskStatus, { label: string; zhLabel: string; color: string; pillColor: string; icon: typeof Inbox }> = {
  inbox: { label: 'Inbox', zhLabel: '收集箱', color: 'bg-amber-50 border-amber-100', pillColor: 'bg-amber-100 text-amber-700', icon: Inbox },
  next: { label: 'Next', zhLabel: '下一步', color: 'bg-blue-50 border-blue-100', pillColor: 'bg-blue-100 text-blue-700', icon: ArrowRight },
  waiting: { label: 'Waiting', zhLabel: '等待中', color: 'bg-purple-50 border-purple-100', pillColor: 'bg-purple-100 text-purple-700', icon: Clock },
  someday: { label: 'Someday', zhLabel: '以后再说', color: 'bg-slate-50 border-slate-200', pillColor: 'bg-slate-100 text-slate-600', icon: Archive },
  done: { label: 'Done', zhLabel: '已完成', color: 'bg-emerald-50 border-emerald-100', pillColor: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

interface TasksViewProps {
  tasks: Task[];
  projects?: Project[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
  onCycleStatus: (id: string) => void;
  onNavigate?: (tab: string) => void;
}

export const TasksView = ({ tasks, projects, onAddTask, onEditTask, onDeleteTask, onCycleStatus, onNavigate }: TasksViewProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('inbox');

  const sortedTasks = useMemo(() => {
    const filteredTasks = statusFilter === 'all'
      ? tasks
      : tasks.filter(t => t.status === statusFilter);

    // Sort: inbox/next by priority → created_at; done by completed_at desc
    return [...filteredTasks].sort((a, b) => {
      if (a.status === 'done' && b.status === 'done') {
        return (b.completed_at || b.created_at).localeCompare(a.completed_at || a.created_at);
      }
      const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      const pa = priorityOrder[a.priority] ?? 1;
      const pb = priorityOrder[b.priority] ?? 1;
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [tasks, statusFilter]);

  const inboxCount = useMemo(() => tasks.filter(t => t.status === 'inbox').length, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">GTD Tasks 任务管理</h2>
        <button onClick={onAddTask} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'inbox', 'next', 'waiting', 'someday', 'done'] as const).map(filter => {
          const isInbox = filter === 'inbox';
          return (
            <FilterChip
              key={filter}
              onClick={() => setStatusFilter(filter)}
              active={statusFilter === filter}
              className="flex items-center gap-1"
            >
              {filter === 'all' ? 'All' : STATUS_CONFIG[filter].label}
              {isInbox && inboxCount > 0 && (
                <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {inboxCount}
                </span>
              )}
            </FilterChip>
          );
        })}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTasks.map(task => {
          const cfg = STATUS_CONFIG[task.status];
          const StatusIcon = cfg.icon;
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';
          const project = task.project_id ? projects?.find(p => p.id === task.project_id) : undefined;

          return (
            <div
              key={task.id}
              className={cn(
                "glass-card p-5 transition-shadow group relative hover:shadow-md",
                cfg.color
              )}
            >
              {/* Hover actions */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                <button
                  onClick={() => onEditTask(task)}
                  className="text-slate-300 hover:text-indigo-500 transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => { if (confirm('Delete this task?')) onDeleteTask(task.id); }}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Status + Priority pills */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={() => onCycleStatus(task.id)}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 transition-all hover:opacity-80",
                    cfg.pillColor
                  )}
                >
                  <StatusIcon size={10} />
                  {cfg.zhLabel}
                </button>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                  PRIORITY_COLORS[task.priority]
                )}>
                  {task.priority}
                </span>
                {task.source_type && (
                  <button
                    onClick={() => {
                      if (onNavigate) {
                        const sourceTab: Record<string, string> = { meeting: 'meetings', calendar: 'timetable', idea: 'ideas', 'parent-comm': 'students', 'student-request': 'students', 'school-event': 'school-events', 'email-digest': 'email-digest' };
                        onNavigate(sourceTab[task.source_type!] || 'tasks');
                      }
                    }}
                    className="text-[10px] font-medium text-indigo-500 hover:underline"
                  >
                    {task.source_type}
                  </button>
                )}
                {project && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                    style={{ backgroundColor: project.color + '20', color: project.color }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: project.color }} />
                    {project.name}
                  </span>
                )}
              </div>

              {/* Title + Description */}
              <h3 className="font-bold text-lg text-slate-900">{task.title}</h3>
              {task.description && (
                <MarkdownRenderer content={task.description} className="text-sm text-slate-500 mt-1 line-clamp-2" />
              )}

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400 flex-wrap">
                {task.due_date && (
                  <span className={cn("font-bold", isOverdue ? "text-red-500" : "")}>
                    Due: {task.due_date}
                  </span>
                )}
                {task.assignee && <span>@ {task.assignee}</span>}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex gap-1">
                    {task.tags.map(tag => (
                      <span key={tag} className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px]">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {sortedTasks.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          {statusFilter === 'all'
            ? 'No tasks yet. Click "New Task" to create one.'
            : `No ${statusFilter} tasks found.`}
        </div>
      )}
    </div>
  );
};
