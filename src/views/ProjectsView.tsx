import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, ExternalLink, GitBranch, CheckSquare, Flag, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { Project, Task } from '../types';
import { ProjectMilestone, DevLogEntry } from '../types/chronicle';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { formatDate } from '../lib/utils';

type StatusFilter = 'all' | Project['status'];

const STATUS_CONFIG: Record<Project['status'], { label: string; pillColor: string }> = {
  active: { label: 'Active', pillColor: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', pillColor: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', pillColor: 'bg-slate-100 text-slate-600' },
};

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  milestones: ProjectMilestone[];
  devlogs: DevLogEntry[];
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onAddTaskForProject?: (projectId: string) => void;
  onEditTask?: (task: Task) => void;
  onNavigate?: (tab: string) => void;
  onOpenProject: (id: string) => void;
}

export const ProjectsView = ({
  projects,
  tasks,
  milestones,
  devlogs,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onUpdateProject,
  onAddTaskForProject,
  onEditTask,
  onNavigate,
  onOpenProject,
}: ProjectsViewProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const sorted = useMemo(() => {
    const filtered = statusFilter === 'all'
      ? projects
      : projects.filter(p => p.status === statusFilter);

    return [...filtered].sort((a, b) => {
      const order: Record<string, number> = { active: 0, paused: 1, completed: 2 };
      return (order[a.status] ?? 1) - (order[b.status] ?? 1);
    });
  }, [projects, statusFilter]);

  const tasksByProject = useMemo(() => {
    const groups: Record<string, Task[]> = {};
    for (const t of tasks) {
      if (t.project_id) {
        (groups[t.project_id] ||= []).push(t);
      }
    }
    return groups;
  }, [tasks]);

  const msByProject = useMemo(() => {
    const groups: Record<string, ProjectMilestone[]> = {};
    for (const m of milestones) (groups[m.project_id] ||= []).push(m);
    return groups;
  }, [milestones]);

  const logsByProject = useMemo(() => {
    const groups: Record<string, DevLogEntry[]> = {};
    for (const d of devlogs) (groups[d.project_id] ||= []).push(d);
    return groups;
  }, [devlogs]);

  const cycleStatus = (project: Project) => {
    const cycle: Record<string, Project['status']> = { active: 'paused', paused: 'completed', completed: 'active' };
    onUpdateProject(project.id, { status: cycle[project.status] || 'active' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
        <button onClick={onAddProject} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={18} /> New Project
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'active', 'paused', 'completed'] as const).map(filter => (
          <FilterChip
            key={filter}
            onClick={() => setStatusFilter(filter)}
            active={statusFilter === filter}
          >
            {filter === 'all' ? 'All' : STATUS_CONFIG[filter].label}
          </FilterChip>
        ))}
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map(project => {
          const cfg = STATUS_CONFIG[project.status];
          const projectTasks = tasksByProject[project.id] || [];
          const projectMs = msByProject[project.id] || [];
          const projectLogs = logsByProject[project.id] || [];
          const total = projectTasks.length;
          const done = projectTasks.filter(t => t.status === 'done').length;
          const active = total - done;
          const nextCount = projectTasks.filter(t => t.status === 'next').length;
          const completedMs = projectMs.filter(m => m.status === 'completed').length;
          const totalMs = projectMs.length;
          const percent = totalMs > 0
            ? Math.round((completedMs / totalMs) * 100)
            : total > 0 ? Math.round((done / total) * 100) : 0;
          const latestLogDate = projectLogs.length > 0 ? projectLogs.sort((a, b) => b.created_at.localeCompare(a.created_at))[0]?.created_at : null;
          const nextTasksPreview = projectTasks
            .filter(t => t.status === 'next')
            .sort((a, b) => {
              const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
              const pa = priorityOrder[a.priority] ?? 1;
              const pb = priorityOrder[b.priority] ?? 1;
              if (pa !== pb) return pa - pb;
              if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
              if (a.due_date) return -1;
              if (b.due_date) return 1;
              return (b.completed_at || b.created_at).localeCompare(a.completed_at || a.created_at);
            })
            .slice(0, 2);

          return (
            <div
              key={project.id}
              className="glass-card overflow-hidden transition-shadow group relative hover:shadow-md flex cursor-pointer"
              onClick={() => onOpenProject(project.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenProject(project.id); }}
            >
              {/* Color bar */}
              <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ backgroundColor: project.color }} />

              <div className="p-5 flex-1 min-w-0">
                {/* Hover actions */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                  {onAddTaskForProject && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onAddTaskForProject(project.id); }}
                      className="text-slate-300 hover:text-emerald-600 transition-colors"
                      title="New task"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditProject(project); }}
                    className="text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm('Delete this project?')) onDeleteProject(project.id); }}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); cycleStatus(project); }}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded transition-all hover:opacity-80",
                      cfg.pillColor
                    )}
                  >
                    {cfg.label}
                  </button>
                </div>

                {/* Title + Description */}
                <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
                {project.description && (
                  <MarkdownRenderer content={project.description} className="text-sm text-slate-500 mt-1 line-clamp-2 [&_p]:inline [&_p]:m-0" />
                )}

                {/* Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold">{active} active · {done}/{total} done</span>
                    <span className="font-bold">{total === 0 ? '0%' : `${percent}%`}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${total === 0 ? 0 : percent}%` }} />
                  </div>
                </div>

                {nextTasksPreview.length > 0 && (
                  <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Next ({nextCount})</p>
                    <div className="mt-1 space-y-1">
                      {nextTasksPreview.map(t => (
                        <p key={t.id} className="text-xs font-bold text-slate-700 truncate">{t.title}</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats & links */}
                <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400 flex-wrap">
                  {totalMs > 0 && (
                    <span className="flex items-center gap-1 font-bold">
                      <Flag size={10} /> {completedMs}/{totalMs} ms
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-bold">
                    <CheckSquare size={10} /> {done}/{total} tasks
                  </span>
                  {projectLogs.length > 0 && (
                    <span className="flex items-center gap-1 font-bold">
                      <FileText size={10} /> {projectLogs.length} logs
                    </span>
                  )}
                  {latestLogDate && (
                    <span className="font-bold text-slate-300">Last: {formatDate(latestLogDate)}</span>
                  )}
                  {project.url && (
                    <a onClick={(e) => e.stopPropagation()} href={project.url} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-indigo-500 hover:underline">
                      <ExternalLink size={10} /> Site
                    </a>
                  )}
                  {project.repo_url && (
                    <a onClick={(e) => e.stopPropagation()} href={project.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-indigo-500 hover:underline">
                      <GitBranch size={10} /> Repo
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          {statusFilter === 'all'
            ? 'No projects yet. Click "New Project" to create one.'
            : `No ${statusFilter} projects found.`}
        </div>
      )}

    </div>
  );
};
