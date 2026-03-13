import { useState, useMemo, useCallback } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2, ExternalLink, GitBranch } from 'lucide-react';
import { cn } from '../lib/utils';
import { Project, Task } from '../types';
import { ProjectMilestone, DevLogEntry, MilestoneReview, MilestoneStatus, DevLogTag, DEV_LOG_TAGS } from '../types/chronicle';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { MilestoneCard } from '../components/chronicle/MilestoneCard';
import { MilestoneReviewForm } from '../components/chronicle/MilestoneReviewForm';
import { DevLogEditor } from '../components/chronicle/DevLogEditor';
import { ChronicleQuickCapture } from '../components/chronicle/QuickCapture';
import { ActivityTimeline } from '../components/chronicle/ActivityTimeline';
import { formatDate } from '../lib/utils';

type TabId = 'overview' | 'milestones' | 'devlogs' | 'timeline';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'milestones', label: 'Milestones' },
  { id: 'devlogs', label: 'Dev Logs' },
  { id: 'timeline', label: 'Timeline' },
];

const STATUS_CONFIG: Record<Project['status'], { label: string; pillColor: string }> = {
  active: { label: 'Active', pillColor: 'bg-emerald-100 text-emerald-700' },
  paused: { label: 'Paused', pillColor: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Completed', pillColor: 'bg-slate-100 text-slate-600' },
};

interface ProjectDetailViewProps {
  project: Project;
  tasks: Task[];
  milestones: ProjectMilestone[];
  devlogs: DevLogEntry[];
  onBack: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onAddTaskForProject: (projectId: string) => void;
  // Milestone actions
  addMilestone: (data: Omit<ProjectMilestone, 'id'>) => Promise<ProjectMilestone>;
  updateMilestone: (id: string, updates: Partial<ProjectMilestone>) => void;
  deleteMilestone: (id: string) => void;
  cycleMilestoneStatus: (id: string) => Promise<MilestoneStatus | undefined>;
  saveMilestoneReview: (id: string, review: MilestoneReview) => void;
  reorderMilestones: (projectId: string, orderedIds: string[]) => void;
  // DevLog actions
  addDevLog: (data: Omit<DevLogEntry, 'id'>) => void;
  updateDevLog: (id: string, updates: Partial<DevLogEntry>) => void;
  deleteDevLog: (id: string) => void;
}

export function ProjectDetailView({
  project,
  tasks,
  milestones,
  devlogs,
  onBack,
  onEditProject,
  onDeleteProject,
  onUpdateProject,
  onAddTaskForProject,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  cycleMilestoneStatus,
  saveMilestoneReview,
  reorderMilestones,
  addDevLog,
  updateDevLog,
  deleteDevLog,
}: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [reviewingMilestone, setReviewingMilestone] = useState<ProjectMilestone | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingDevLog, setEditingDevLog] = useState<DevLogEntry | null>(null);
  const [showDevLogForm, setShowDevLogForm] = useState(false);
  const [tagFilter, setTagFilter] = useState<DevLogTag | 'all'>('all');

  // New milestone form state
  const [newMsTitle, setNewMsTitle] = useState('');
  const [newMsDesc, setNewMsDesc] = useState('');
  const [newMsDueDate, setNewMsDueDate] = useState('');

  const projectTasks = useMemo(() => tasks.filter(t => t.project_id === project.id), [tasks, project.id]);
  const projectMilestones = useMemo(() =>
    milestones.filter(m => m.project_id === project.id).sort((a, b) => a.order - b.order),
    [milestones, project.id]
  );
  const projectDevlogs = useMemo(() => {
    const filtered = devlogs.filter(d => d.project_id === project.id);
    if (tagFilter !== 'all') return filtered.filter(d => d.tags.includes(tagFilter));
    return filtered;
  }, [devlogs, project.id, tagFilter]);

  // Progress
  const doneTasks = projectTasks.filter(t => t.status === 'done').length;
  const totalTasks = projectTasks.length;
  const completedMs = projectMilestones.filter(m => m.status === 'completed').length;
  const totalMs = projectMilestones.length;
  const progress = totalMs > 0
    ? Math.round((completedMs / totalMs) * 100)
    : totalTasks > 0
      ? Math.round((doneTasks / totalTasks) * 100)
      : 0;

  const cfg = STATUS_CONFIG[project.status];

  const handleAddMilestone = async () => {
    if (!newMsTitle.trim()) return;
    await addMilestone({
      project_id: project.id,
      title: newMsTitle.trim(),
      description: newMsDesc.trim() || undefined,
      status: 'not_started',
      order: projectMilestones.length,
      due_date: newMsDueDate || undefined,
      created_at: new Date().toISOString(),
    });
    setNewMsTitle('');
    setNewMsDesc('');
    setNewMsDueDate('');
    setShowMilestoneForm(false);
  };

  const handleQuickCapture = useCallback((title: string, content: string) => {
    addDevLog({
      project_id: project.id,
      title,
      content,
      tags: ['thinking'],
      created_at: new Date().toISOString(),
    });
  }, [addDevLog, project.id]);

  const handleSaveDevLog = useCallback((data: Omit<DevLogEntry, 'id'>) => {
    if (editingDevLog) {
      updateDevLog(editingDevLog.id, data);
    } else {
      addDevLog(data);
    }
    setEditingDevLog(null);
    setShowDevLogForm(false);
  }, [addDevLog, updateDevLog, editingDevLog]);

  const handleMoveMs = (idx: number, dir: -1 | 1) => {
    const ids = projectMilestones.map(m => m.id);
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= ids.length) return;
    [ids[idx], ids[targetIdx]] = [ids[targetIdx], ids[idx]];
    reorderMilestones(project.id, ids);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={onBack} className="mt-1 text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <h2 className="text-2xl font-bold text-slate-900">{project.name}</h2>
            <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded', cfg.pillColor)}>{cfg.label}</span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
            {project.url && (
              <a href={project.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-500 hover:underline">
                <ExternalLink size={12} /> Website
              </a>
            )}
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-500 hover:underline">
                <GitBranch size={12} /> Repository
              </a>
            )}
          </div>
          {/* Progress bar */}
          <div className="mt-3 max-w-sm">
            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>{completedMs}/{totalMs} milestones · {doneTasks}/{totalTasks} tasks</span>
              <span>{progress}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onEditProject(project)} className="btn-secondary text-sm flex items-center gap-1">
            <Edit3 size={14} /> Edit
          </button>
          <button onClick={() => { if (confirm('Delete this project and all its data?')) { onDeleteProject(project.id); onBack(); } }} className="text-slate-300 hover:text-red-500 transition-colors p-2">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px',
              activeTab === tab.id
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            )}
          >
            {tab.label}
            {tab.id === 'devlogs' && projectDevlogs.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{devlogs.filter(d => d.project_id === project.id).length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {project.description && (
            <div className="glass-card p-6">
              <MarkdownRenderer content={project.description} className="markdown-content" />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Milestones', value: `${completedMs}/${totalMs}`, color: 'text-blue-600' },
              { label: 'Tasks', value: `${doneTasks}/${totalTasks}`, color: 'text-emerald-600' },
              { label: 'Dev Logs', value: String(devlogs.filter(d => d.project_id === project.id).length), color: 'text-violet-600' },
              { label: 'Progress', value: `${progress}%`, color: 'text-indigo-600' },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className="text-2xl font-bold tracking-tight" style={{ color: undefined }}><span className={stat.color}>{stat.value}</span></p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Quick Capture */}
          <ChronicleQuickCapture projectId={project.id} onCapture={handleQuickCapture} />

          {/* Recent logs */}
          {devlogs.filter(d => d.project_id === project.id).length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Recent Dev Logs</h3>
              <div className="space-y-2">
                {devlogs.filter(d => d.project_id === project.id).slice(0, 3).map(dl => (
                  <div key={dl.id} className="glass-card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('devlogs')}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{dl.title}</span>
                      {dl.tags.map(t => {
                        const tagCfg = DEV_LOG_TAGS.find(dt => dt.key === t);
                        return tagCfg ? (
                          <span key={t} className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', tagCfg.color)}>{tagCfg.label}</span>
                        ) : null;
                      })}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(dl.created_at)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Milestones ({totalMs})</h3>
            <button onClick={() => setShowMilestoneForm(!showMilestoneForm)} className="btn-primary text-sm flex items-center gap-1">
              <Plus size={14} /> New Milestone
            </button>
          </div>

          {showMilestoneForm && (
            <div className="glass-card p-4 space-y-3">
              <input
                type="text"
                value={newMsTitle}
                onChange={e => setNewMsTitle(e.target.value)}
                placeholder="Milestone title..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                autoFocus
              />
              <textarea
                value={newMsDesc}
                onChange={e => setNewMsDesc(e.target.value)}
                placeholder="Description (optional)..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                rows={2}
              />
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={newMsDueDate}
                  onChange={e => setNewMsDueDate(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm"
                />
                <div className="flex-1" />
                <button onClick={() => setShowMilestoneForm(false)} className="btn-secondary text-sm">Cancel</button>
                <button onClick={handleAddMilestone} disabled={!newMsTitle.trim()} className="btn-primary text-sm disabled:opacity-50">Create</button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {projectMilestones.map((ms, idx) => (
              <MilestoneCard
                key={ms.id}
                milestone={ms}
                tasks={projectTasks}
                devlogs={devlogs.filter(d => d.project_id === project.id)}
                onCycleStatus={cycleMilestoneStatus}
                onEdit={(m) => {
                  setEditingMilestone(m);
                  setNewMsTitle(m.title);
                  setNewMsDesc(m.description || '');
                  setNewMsDueDate(m.due_date || '');
                  setShowMilestoneForm(false);
                }}
                onDelete={deleteMilestone}
                onRequestReview={setReviewingMilestone}
                onMoveUp={idx > 0 ? () => handleMoveMs(idx, -1) : undefined}
                onMoveDown={idx < projectMilestones.length - 1 ? () => handleMoveMs(idx, 1) : undefined}
              />
            ))}
          </div>

          {projectMilestones.length === 0 && !showMilestoneForm && (
            <div className="glass-card p-12 text-center text-slate-400">
              No milestones yet. Break your project into phases.
            </div>
          )}

          {/* Inline edit for milestone */}
          {editingMilestone && (
            <div className="glass-card p-4 space-y-3 border-2 border-indigo-200">
              <p className="text-xs font-bold text-indigo-600">Editing: {editingMilestone.title}</p>
              <input
                type="text"
                value={newMsTitle}
                onChange={e => setNewMsTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <textarea
                value={newMsDesc}
                onChange={e => setNewMsDesc(e.target.value)}
                placeholder="Description..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                rows={2}
              />
              <div className="flex items-center gap-3">
                <input type="date" value={newMsDueDate} onChange={e => setNewMsDueDate(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 text-sm" />
                <div className="flex-1" />
                <button onClick={() => { setEditingMilestone(null); setNewMsTitle(''); setNewMsDesc(''); setNewMsDueDate(''); }} className="btn-secondary text-sm">Cancel</button>
                <button
                  onClick={() => {
                    updateMilestone(editingMilestone.id, {
                      title: newMsTitle.trim(),
                      description: newMsDesc.trim() || undefined,
                      due_date: newMsDueDate || undefined,
                    });
                    setEditingMilestone(null);
                    setNewMsTitle('');
                    setNewMsDesc('');
                    setNewMsDueDate('');
                  }}
                  disabled={!newMsTitle.trim()}
                  className="btn-primary text-sm disabled:opacity-50"
                >
                  Update
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'devlogs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Dev Logs</h3>
            <button onClick={() => { setEditingDevLog(null); setShowDevLogForm(true); }} className="btn-primary text-sm flex items-center gap-1">
              <Plus size={14} /> New Log
            </button>
          </div>

          {/* Tag filter */}
          <div className="flex flex-wrap gap-2">
            <FilterChip active={tagFilter === 'all'} onClick={() => setTagFilter('all')}>All</FilterChip>
            {DEV_LOG_TAGS.map(({ key, label }) => (
              <FilterChip key={key} active={tagFilter === key} onClick={() => setTagFilter(key)}>{label}</FilterChip>
            ))}
          </div>

          {/* Log entries */}
          <div className="space-y-3">
            {projectDevlogs.map(dl => {
              const linkedMs = milestones.find(m => m.id === dl.milestone_id);
              const linkedTask = tasks.find(t => t.id === dl.task_id);
              return (
                <div key={dl.id} className="glass-card p-5 group hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-slate-900">{dl.title}</h4>
                        {dl.tags.map(t => {
                          const tagCfg = DEV_LOG_TAGS.find(dt => dt.key === t);
                          return tagCfg ? (
                            <span key={t} className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', tagCfg.color)}>{tagCfg.label}</span>
                          ) : null;
                        })}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDate(dl.created_at)}
                        {linkedMs && <span className="ml-2">→ {linkedMs.title}</span>}
                        {linkedTask && <span className="ml-2">→ {linkedTask.title}</span>}
                      </p>
                      {dl.content && (
                        <div className="mt-3">
                          <MarkdownRenderer content={dl.content} className="text-sm text-slate-600 line-clamp-4" />
                        </div>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all ml-2 flex-shrink-0">
                      <button onClick={() => { setEditingDevLog(dl); setShowDevLogForm(true); }} className="text-slate-300 hover:text-indigo-500 transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => { if (confirm('Delete this log?')) deleteDevLog(dl.id); }} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {projectDevlogs.length === 0 && (
            <div className="glass-card p-12 text-center text-slate-400">
              {tagFilter === 'all' ? 'No dev logs yet. Start recording your thinking.' : 'No logs with this tag.'}
            </div>
          )}

          {/* Bottom quick capture */}
          <ChronicleQuickCapture projectId={project.id} onCapture={handleQuickCapture} />
        </div>
      )}

      {activeTab === 'timeline' && (
        <ActivityTimeline
          milestones={milestones}
          tasks={tasks}
          devlogs={devlogs}
          projectId={project.id}
        />
      )}

      {/* Modals */}
      {reviewingMilestone && (
        <MilestoneReviewForm
          milestone={reviewingMilestone}
          onSave={(review) => {
            saveMilestoneReview(reviewingMilestone.id, review);
            setReviewingMilestone(null);
          }}
          onCancel={() => setReviewingMilestone(null)}
        />
      )}

      {showDevLogForm && (
        <DevLogEditor
          entry={editingDevLog}
          projectId={project.id}
          milestones={milestones}
          tasks={tasks}
          onSave={handleSaveDevLog}
          onCancel={() => { setShowDevLogForm(false); setEditingDevLog(null); }}
        />
      )}
    </div>
  );
}
