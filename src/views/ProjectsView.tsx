import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, ExternalLink, GitBranch, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { Project, Task } from '../types';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';

type StatusFilter = 'all' | Project['status'];

const STATUS_CONFIG: Record<Project['status'], { label: string; pillColor: string }> = {
  active: { label: 'Active', pillColor: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', pillColor: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', pillColor: 'bg-slate-100 text-slate-600' },
};

interface ProjectsViewProps {
  projects: Project[];
  tasks: Task[];
  onAddProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
}

export const ProjectsView = ({ projects, tasks, onAddProject, onEditProject, onDeleteProject, onUpdateProject }: ProjectsViewProps) => {
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

  const taskCountByProject = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const t of tasks) {
      if (t.project_id) {
        counts[t.project_id] = (counts[t.project_id] || 0) + 1;
      }
    }
    return counts;
  }, [tasks]);

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
          const taskCount = taskCountByProject[project.id] || 0;

          return (
            <div
              key={project.id}
              className="glass-card overflow-hidden transition-shadow group relative hover:shadow-md flex"
            >
              {/* Color bar */}
              <div className="w-1 flex-shrink-0 rounded-l-2xl" style={{ backgroundColor: project.color }} />

              <div className="p-5 flex-1 min-w-0">
                {/* Hover actions */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                  <button
                    onClick={() => onEditProject(project)}
                    className="text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => { if (confirm('Delete this project?')) onDeleteProject(project.id); }}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Status badge */}
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => cycleStatus(project)}
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

                {/* Stats & links */}
                <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 font-bold">
                    <CheckSquare size={10} /> {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </span>
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-indigo-500 hover:underline">
                      <ExternalLink size={10} /> Site
                    </a>
                  )}
                  {project.repo_url && (
                    <a href={project.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-indigo-500 hover:underline">
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
