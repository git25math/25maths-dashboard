import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Archive, Calendar, CheckCircle2, Clock, ExternalLink, GitBranch, Inbox, Pencil, Plus, X } from 'lucide-react';
import { FilterChip } from '../../components/FilterChip';
import { MarkdownRenderer } from '../../components/RichTextEditor';
import { useDetailSheetKeyboard } from '../../hooks/useDetailSheetKeyboard';
import { cn } from '../../lib/utils';
import { Project, Task, TaskStatus } from '../../types';

type StatusFilter = 'all' | TaskStatus;

const STATUS_ORDER: TaskStatus[] = ['next', 'inbox', 'waiting', 'someday', 'done'];

const STATUS_CONFIG: Record<TaskStatus, { label: string; pill: string; icon: typeof Inbox }> = {
  inbox: { label: 'Inbox', pill: 'bg-amber-100 text-amber-700', icon: Inbox },
  next: { label: 'Next', pill: 'bg-blue-100 text-blue-700', icon: ArrowRight },
  waiting: { label: 'Waiting', pill: 'bg-purple-100 text-purple-700', icon: Clock },
  someday: { label: 'Someday', pill: 'bg-slate-100 text-slate-600', icon: Archive },
  done: { label: 'Done', pill: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
};

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-400',
};

function sortTasksForProject(a: Task, b: Task): number {
  const sa = STATUS_ORDER.indexOf(a.status);
  const sb = STATUS_ORDER.indexOf(b.status);
  if (sa !== sb) return sa - sb;
  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  const pa = priorityOrder[a.priority] ?? 1;
  const pb = priorityOrder[b.priority] ?? 1;
  if (pa !== pb) return pa - pb;
  if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
  if (a.due_date) return -1;
  if (b.due_date) return 1;
  return (b.completed_at || b.created_at).localeCompare(a.completed_at || a.created_at);
}

export interface ProjectDetailSheetProps {
  project: Project | null;
  tasks: Task[];
  onClose: () => void;
  onEditProject?: (project: Project) => void;
  onAddTaskForProject?: (projectId: string) => void;
  onEditTask?: (task: Task) => void;
  onNavigate?: (tab: string) => void;
}

function ProjectDetailContent({
  project,
  tasks,
  onClose,
  onEditProject,
  onAddTaskForProject,
  onEditTask,
  onNavigate,
}: ProjectDetailSheetProps & { project: Project }) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  useEffect(() => {
    setStatusFilter('all');
  }, [project.id]);

  const projectTasks = useMemo(
    () => tasks.filter(t => t.project_id === project.id).sort(sortTasksForProject),
    [project.id, tasks],
  );

  const visibleTasks = useMemo(() => {
    if (statusFilter === 'all') return projectTasks;
    return projectTasks.filter(t => t.status === statusFilter);
  }, [projectTasks, statusFilter]);

  const stats = useMemo(() => {
    const out: Record<TaskStatus, number> = { inbox: 0, next: 0, waiting: 0, someday: 0, done: 0 };
    for (const t of projectTasks) out[t.status] = (out[t.status] || 0) + 1;
    const total = projectTasks.length;
    const done = out.done || 0;
    const active = total - done;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { counts: out, total, done, active, percent };
  }, [projectTasks]);

  const overdueCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return projectTasks.filter(t => t.status !== 'done' && t.due_date && t.due_date < today).length;
  }, [projectTasks]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: project.color }} />
            <h3 className="text-xl font-black text-slate-900 truncate">{project.name}</h3>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
              project.status === 'active' ? "bg-emerald-100 text-emerald-700" :
              project.status === 'paused' ? "bg-amber-100 text-amber-700" :
              "bg-slate-100 text-slate-600"
            )}>
              {project.status}
            </span>
          </div>
          {project.description && (
            <MarkdownRenderer content={project.description} className="text-sm text-slate-600 mt-2 [&_p]:m-0" />
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onEditProject && (
            <button
              onClick={() => onEditProject(project)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
              title="Edit project"
            >
              <Pencil size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active</p>
          <p className="text-lg font-black text-slate-900 mt-1">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Done</p>
          <p className="text-lg font-black text-slate-900 mt-1">{stats.done}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</p>
          <p className="text-lg font-black text-slate-900 mt-1">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overdue</p>
          <p className={cn("text-lg font-black mt-1", overdueCount > 0 ? "text-rose-600" : "text-slate-900")}>{overdueCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-slate-700">Progress</p>
          <p className="text-xs font-bold text-slate-500">{stats.total === 0 ? 'No tasks yet' : `${stats.done}/${stats.total} · ${stats.percent}%`}</p>
        </div>
        <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${stats.total === 0 ? 0 : stats.percent}%` }} />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
          >
            <ExternalLink size={14} /> Site
          </a>
        )}
        {project.repo_url && (
          <a
            href={project.repo_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline"
          >
            <GitBranch size={14} /> Repo
          </a>
        )}
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('tasks')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900"
          >
            <ArrowRight size={14} /> Open Tasks
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'next', 'inbox', 'waiting', 'someday', 'done'] as const).map(k => (
            <FilterChip key={k} active={statusFilter === k} onClick={() => setStatusFilter(k)}>
              {k === 'all' ? 'All' : STATUS_CONFIG[k].label}
              {k !== 'all' && stats.counts[k] > 0 && (
                <span className="ml-1 text-[10px] font-black opacity-70">{stats.counts[k]}</span>
              )}
            </FilterChip>
          ))}
        </div>

        {onAddTaskForProject && (
          <button
            type="button"
            onClick={() => onAddTaskForProject(project.id)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> New Task
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visibleTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-400">
            No tasks in this view
          </div>
        ) : (
          visibleTasks.map(t => {
            const cfg = STATUS_CONFIG[t.status];
            const Icon = cfg.icon;
            const isOverdue = t.due_date && t.status !== 'done' && t.due_date < new Date().toISOString().slice(0, 10);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onEditTask?.(t)}
                className="w-full text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded inline-flex items-center gap-1", cfg.pill)}>
                        <Icon size={10} /> {cfg.label}
                      </span>
                      <span className={cn("w-2 h-2 rounded-full", PRIORITY_DOT[t.priority] || 'bg-slate-300')} title={`priority: ${t.priority}`} />
                      {t.due_date && (
                        <span className={cn("text-xs font-bold inline-flex items-center gap-1", isOverdue ? "text-rose-600" : "text-slate-500")}>
                          <Calendar size={12} />
                          {t.due_date}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-black text-slate-900 mt-2 truncate">{t.title}</p>
                    {t.description && (
                      <MarkdownRenderer content={t.description} className="text-xs text-slate-600 mt-1 line-clamp-2" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-slate-300 shrink-0">{t.assignee ? `@${t.assignee}` : ''}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function ProjectDetailSheet(props: ProjectDetailSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useDetailSheetKeyboard({ isOpen: !!props.project, onClose: props.onClose });

  useEffect(() => {
    if (props.project && sheetRef.current) {
      sheetRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [props.project?.id]);

  return (
    <AnimatePresence initial={false}>
      {props.project ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={props.onClose}
          />
          <motion.div
            ref={sheetRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-full max-w-2xl overflow-y-auto bg-white shadow-2xl"
          >
            <ProjectDetailContent {...props} project={props.project} />
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}

