import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Plus, Edit3, Trash2, ExternalLink, GitBranch, ChevronDown, ChevronUp, Link2, Eye, FileDown, BookOpen, Filter, Search, Star, StarOff, ArrowUpDown, CheckSquare2, BarChart3, FileText, Bookmark, Columns2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Project, Task } from '../types';
import { ProjectMilestone, DevLogEntry, DevLogThread, MilestoneReview, MilestoneStatus, DevLogTag, DevLogStatus, DEV_LOG_TAGS, DEV_LOG_STATUSES, CustomTemplate } from '../types/chronicle';
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

const DEVLOG_STATUS_CYCLE: Record<DevLogStatus, DevLogStatus> = {
  draft: 'incubating',
  incubating: 'actionable',
  actionable: 'archived',
  archived: 'draft',
};

interface ProjectDetailViewProps {
  project: Project;
  allProjects: Project[];
  onSwitchProject: (id: string) => void;
  tasks: Task[];
  milestones: ProjectMilestone[];
  devlogs: DevLogEntry[];
  threads: DevLogThread[];
  onBack: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onAddTaskForProject: (projectId: string) => void;
  addTask: (data: Omit<Task, 'id' | 'created_at'>) => Promise<Task>;
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
  // Thread actions
  addThread: (data: Omit<DevLogThread, 'id'>) => Promise<DevLogThread>;
  updateThread: (id: string, updates: Partial<DevLogThread>) => void;
  deleteThread: (id: string) => void;
}

export function ProjectDetailView({
  project,
  allProjects,
  onSwitchProject,
  tasks,
  milestones,
  devlogs,
  threads,
  onBack,
  onEditProject,
  onDeleteProject,
  onUpdateProject,
  onAddTaskForProject,
  addTask,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  cycleMilestoneStatus,
  saveMilestoneReview,
  reorderMilestones,
  addDevLog,
  updateDevLog,
  deleteDevLog,
  addThread,
  deleteThread,
}: ProjectDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [reviewingMilestone, setReviewingMilestone] = useState<ProjectMilestone | null>(null);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [editingDevLog, setEditingDevLog] = useState<DevLogEntry | null>(null);
  const [showDevLogForm, setShowDevLogForm] = useState(false);
  const [tagFilter, setTagFilter] = useState<DevLogTag | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<DevLogStatus | 'all'>('all');
  const [threadFilter, setThreadFilter] = useState<string | 'all'>('all');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [readingLog, setReadingLog] = useState<DevLogEntry | null>(null);
  const [showThreadNarrative, setShowThreadNarrative] = useState(false);
  const [showProjectSwitcher, setShowProjectSwitcher] = useState(false);
  const [showNewThreadForm, setShowNewThreadForm] = useState(false);
  const [newThreadName, setNewThreadName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<'date' | 'status' | 'starred'>('date');
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [milestonesViewMode, setMilestonesViewMode] = useState<'list' | 'timeline'>('list');
  const [diffLogs, setDiffLogs] = useState<[DevLogEntry, DevLogEntry] | null>(null);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    try { return JSON.parse(localStorage.getItem('chronicle-custom-templates') || '[]'); } catch { return []; }
  });

  // New milestone form state
  const [newMsTitle, setNewMsTitle] = useState('');
  const [newMsDesc, setNewMsDesc] = useState('');
  const [newMsDueDate, setNewMsDueDate] = useState('');

  const projectTasks = useMemo(() => tasks.filter(t => t.project_id === project.id), [tasks, project.id]);
  const projectMilestones = useMemo(() =>
    milestones.filter(m => m.project_id === project.id).sort((a, b) => a.order - b.order),
    [milestones, project.id]
  );
  const projectThreads = useMemo(() =>
    threads.filter(t => t.project_id === project.id),
    [threads, project.id]
  );
  const allProjectDevlogs = useMemo(() => devlogs.filter(d => d.project_id === project.id), [devlogs, project.id]);
  const projectDevlogs = useMemo(() => {
    let filtered = allProjectDevlogs;
    if (tagFilter !== 'all') filtered = filtered.filter(d => d.tags.includes(tagFilter));
    if (statusFilter !== 'all') filtered = filtered.filter(d => (d.status || 'draft') === statusFilter);
    if (threadFilter !== 'all') filtered = filtered.filter(d => d.thread_id === threadFilter);
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
      );
    }
    // Sort
    const STATUS_ORDER: Record<string, number> = { draft: 0, incubating: 1, actionable: 2, archived: 3 };
    if (sortMode === 'starred') {
      filtered = [...filtered].sort((a, b) => {
        if (a.starred && !b.starred) return -1;
        if (!a.starred && b.starred) return 1;
        return b.created_at.localeCompare(a.created_at);
      });
    } else if (sortMode === 'status') {
      filtered = [...filtered].sort((a, b) => {
        const sa = STATUS_ORDER[a.status || 'draft'] ?? 0;
        const sb = STATUS_ORDER[b.status || 'draft'] ?? 0;
        return sa !== sb ? sa - sb : b.created_at.localeCompare(a.created_at);
      });
    }
    // default 'date' is already reverse chronological from allProjectDevlogs
    return filtered;
  }, [allProjectDevlogs, tagFilter, statusFilter, threadFilter, searchQuery, sortMode]);

  // Thinking velocity stats
  const thinkingStats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString();
    const thisWeekLogs = allProjectDevlogs.filter(d => d.created_at >= weekAgoStr);
    const totalWords = allProjectDevlogs.reduce((sum, d) => sum + (d.content ? d.content.split(/\s+/).length : 0), 0);
    // Most active tag
    const tagCounts: Record<string, number> = {};
    for (const d of allProjectDevlogs) {
      for (const t of d.tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    const topTagLabel = topTag ? DEV_LOG_TAGS.find(t => t.key === topTag[0])?.label || topTag[0] : '-';
    // Active days (unique dates)
    const activeDays = new Set(allProjectDevlogs.map(d => d.created_at.slice(0, 10))).size;
    return { thisWeek: thisWeekLogs.length, totalWords, topTagLabel, activeDays };
  }, [allProjectDevlogs]);

  // Tag heatmap: last 8 weeks distribution
  const tagHeatmap = useMemo(() => {
    const weeks: { label: string; counts: Record<string, number> }[] = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
      const weekLabel = `${(weekStart.getMonth() + 1)}/${weekStart.getDate()}`;
      const counts: Record<string, number> = {};
      for (const dl of allProjectDevlogs) {
        const d = new Date(dl.created_at);
        if (d >= weekStart && d < weekEnd) {
          for (const t of dl.tags) counts[t] = (counts[t] || 0) + 1;
        }
      }
      weeks.push({ label: weekLabel, counts });
    }
    return weeks;
  }, [allProjectDevlogs]);

  // Weekly report data
  const weeklyReport = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString();
    const newLogs = allProjectDevlogs.filter(d => d.created_at >= weekAgoStr);
    const completedTasks = projectTasks.filter(t => t.status === 'done' && t.completed_at && t.completed_at >= weekAgoStr);
    const msChanges = projectMilestones.filter(m => m.completed_at && m.completed_at >= weekAgoStr);
    const logsByTag: Record<string, string[]> = {};
    for (const dl of newLogs) {
      for (const t of dl.tags) {
        if (!logsByTag[t]) logsByTag[t] = [];
        logsByTag[t].push(dl.title);
      }
    }
    // Generate markdown
    const lines: string[] = [];
    lines.push(`# Weekly Report: ${project.name}`);
    lines.push(`*${formatDate(weekAgo.toISOString())} — ${formatDate(now.toISOString())}*\n`);
    lines.push(`## Summary`);
    lines.push(`- **${newLogs.length}** dev logs written`);
    lines.push(`- **${completedTasks.length}** tasks completed`);
    lines.push(`- **${msChanges.length}** milestones completed\n`);
    if (msChanges.length > 0) {
      lines.push(`## Milestones Completed`);
      for (const ms of msChanges) lines.push(`- ${ms.title}`);
      lines.push('');
    }
    if (completedTasks.length > 0) {
      lines.push(`## Tasks Completed`);
      for (const t of completedTasks) lines.push(`- ${t.title}`);
      lines.push('');
    }
    if (newLogs.length > 0) {
      lines.push(`## Dev Log Highlights`);
      for (const [tag, titles] of Object.entries(logsByTag)) {
        const tagLabel = DEV_LOG_TAGS.find(t => t.key === tag)?.label || tag;
        lines.push(`### ${tagLabel}`);
        for (const title of titles) lines.push(`- ${title}`);
      }
      lines.push('');
    }
    return lines.join('\n');
  }, [allProjectDevlogs, projectTasks, projectMilestones, project.name]);

  // Incubation pipeline counts
  const incubationCounts = useMemo(() => {
    const counts = { draft: 0, incubating: 0, actionable: 0, archived: 0 };
    for (const dl of allProjectDevlogs) {
      const s = dl.status || 'draft';
      if (s in counts) counts[s as keyof typeof counts]++;
    }
    return counts;
  }, [allProjectDevlogs]);

  // Thread narrative content (chronological order)
  const threadNarrativeLogs = useMemo(() => {
    if (threadFilter === 'all') return [];
    return allProjectDevlogs
      .filter(d => d.thread_id === threadFilter)
      .sort((a, b) => a.created_at.localeCompare(b.created_at));
  }, [allProjectDevlogs, threadFilter]);

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

  // Growth Timeline: completed milestones with reviews
  const completedMilestonesWithReviews = useMemo(() =>
    projectMilestones
      .filter(m => m.status === 'completed' && m.review)
      .sort((a, b) => (a.completed_at || '').localeCompare(b.completed_at || '')),
    [projectMilestones]
  );

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
      status: 'draft',
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

  const toggleLogExpand = (id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const cycleDevLogStatus = (dl: DevLogEntry) => {
    const nextStatus = DEVLOG_STATUS_CYCLE[dl.status || 'draft'];
    updateDevLog(dl.id, { status: nextStatus });
  };

  const handleCreateThread = async () => {
    if (!newThreadName.trim()) return;
    await addThread({
      project_id: project.id,
      name: newThreadName.trim(),
      created_at: new Date().toISOString(),
    });
    setNewThreadName('');
    setShowNewThreadForm(false);
  };

  const handleAddTaskForMilestone = useCallback((title: string, milestoneId: string) => {
    addTask({
      title,
      status: 'next',
      priority: 'medium',
      project_id: project.id,
      milestone_id: milestoneId,
    });
  }, [addTask, project.id]);

  // Save as custom template
  const saveAsTemplate = useCallback((dl: DevLogEntry) => {
    const name = prompt('Template name:', dl.title);
    if (!name) return;
    const tpl: CustomTemplate = {
      id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      content: dl.content,
      tags: dl.tags,
      created_at: new Date().toISOString(),
    };
    const next = [...customTemplates, tpl];
    setCustomTemplates(next);
    localStorage.setItem('chronicle-custom-templates', JSON.stringify(next));
  }, [customTemplates]);

  const deleteTemplate = useCallback((id: string) => {
    const next = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(next);
    localStorage.setItem('chronicle-custom-templates', JSON.stringify(next));
  }, [customTemplates]);

  const applyTemplate = useCallback((tpl: CustomTemplate) => {
    setEditingDevLog(null);
    setShowDevLogForm(true);
    // We'll pass template info via a ref trick — set a special state
    setTemplateToApply(tpl);
  }, []);

  const [templateToApply, setTemplateToApply] = useState<CustomTemplate | null>(null);

  // Transform [[log title]] references into markdown links for rendering
  const processLogRefs = useCallback((content: string): string => {
    return content.replace(/\[\[([^\]]+)\]\]/g, (match, title) => {
      const found = allProjectDevlogs.find(d => d.title.toLowerCase() === title.trim().toLowerCase());
      if (found) {
        return `**🔗 ${title}**`;
      }
      return `*⚠️ ${title} (not found)*`;
    });
  }, [allProjectDevlogs]);

  // Navigate to referenced log by expanding it
  const navigateToLog = useCallback((title: string) => {
    const found = allProjectDevlogs.find(d => d.title.toLowerCase() === title.trim().toLowerCase());
    if (found) {
      setActiveTab('devlogs');
      setTagFilter('all');
      setStatusFilter('all');
      setThreadFilter('all');
      setSearchQuery(found.title);
      setExpandedLogs(prev => new Set([...prev, found.id]));
    }
  }, [allProjectDevlogs]);

  const exportThreadAsMarkdown = useCallback(() => {
    if (threadFilter === 'all' || threadNarrativeLogs.length === 0) return;
    const thread = projectThreads.find(t => t.id === threadFilter);
    if (!thread) return;
    const lines: string[] = [`# ${thread.name}\n`];
    if (thread.description) lines.push(`${thread.description}\n`);
    lines.push(`---\n`);
    for (const dl of threadNarrativeLogs) {
      const tagLabels = dl.tags.map(t => DEV_LOG_TAGS.find(dt => dt.key === t)?.label || t).join(', ');
      lines.push(`## ${dl.title}`);
      lines.push(`*${formatDate(dl.created_at)}* · ${tagLabels}\n`);
      if (dl.content) lines.push(`${dl.content}\n`);
      lines.push(`---\n`);
    }
    const text = lines.join('\n');
    navigator.clipboard.writeText(text);
    // Visual feedback via a brief alert-like approach — just use clipboard
  }, [threadFilter, threadNarrativeLogs, projectThreads]);

  const toggleStarred = useCallback((dl: DevLogEntry) => {
    updateDevLog(dl.id, { starred: !dl.starred });
  }, [updateDevLog]);

  const toggleSelectLog = (id: string) => {
    setSelectedLogIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const batchChangeStatus = useCallback((newStatus: DevLogStatus) => {
    for (const id of selectedLogIds) {
      updateDevLog(id, { status: newStatus });
    }
    setSelectedLogIds(new Set());
    setBatchMode(false);
  }, [selectedLogIds, updateDevLog]);

  // Keyboard shortcuts for devlogs tab
  useEffect(() => {
    if (activeTab !== 'devlogs') return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setEditingDevLog(null);
        setShowDevLogForm(true);
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTab]);

  const otherProjects = allProjects.filter(p => p.id !== project.id);

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
            {/* Project quick switcher */}
            <div className="relative">
              <button
                onClick={() => setShowProjectSwitcher(!showProjectSwitcher)}
                className="flex items-center gap-1.5 text-2xl font-bold text-slate-900 hover:text-indigo-600 transition-colors"
              >
                {project.name}
                {otherProjects.length > 0 && <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {showProjectSwitcher && otherProjects.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 z-20 py-1 max-h-64 overflow-y-auto">
                  {otherProjects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { onSwitchProject(p.id); setShowProjectSwitcher(false); }}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-2 transition-colors"
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="text-sm font-medium text-slate-700 truncate">{p.name}</span>
                      <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ml-auto', STATUS_CONFIG[p.status].pillColor)}>
                        {STATUS_CONFIG[p.status].label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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
            {tab.id === 'devlogs' && allProjectDevlogs.length > 0 && (
              <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{allProjectDevlogs.length}</span>
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
              { label: 'Dev Logs', value: String(allProjectDevlogs.length), color: 'text-violet-600' },
              { label: 'Progress', value: `${progress}%`, color: 'text-indigo-600' },
            ].map(stat => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className="text-2xl font-bold tracking-tight"><span className={stat.color}>{stat.value}</span></p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Thinking Velocity */}
          {allProjectDevlogs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Thinking Velocity</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="glass-card p-3 text-center">
                  <p className="text-xl font-bold text-violet-600">{thinkingStats.thisWeek}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">This Week</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-xl font-bold text-slate-700">{thinkingStats.totalWords.toLocaleString()}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Words</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-xl font-bold text-indigo-600">{thinkingStats.topTagLabel}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Tag</p>
                </div>
                <div className="glass-card p-3 text-center">
                  <p className="text-xl font-bold text-emerald-600">{thinkingStats.activeDays}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Days</p>
                </div>
              </div>
            </div>
          )}

          {/* Tag Heatmap */}
          {allProjectDevlogs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <BarChart3 size={14} /> Tag Distribution (8 weeks)
              </h3>
              <div className="glass-card p-4 overflow-x-auto">
                <div className="flex gap-1 min-w-fit">
                  {tagHeatmap.map((week, wi) => {
                    const total = Object.values(week.counts).reduce((s, v) => s + v, 0);
                    return (
                      <div key={wi} className="flex flex-col items-center gap-1 min-w-[48px]">
                        {DEV_LOG_TAGS.map(tag => {
                          const count = week.counts[tag.key] || 0;
                          const opacity = count === 0 ? 0.05 : Math.min(0.2 + count * 0.2, 1);
                          return (
                            <div
                              key={tag.key}
                              className="w-8 h-4 rounded-sm"
                              style={{
                                backgroundColor: tag.color.includes('purple') ? '#a855f7' :
                                  tag.color.includes('blue') ? '#3b82f6' :
                                  tag.color.includes('cyan') ? '#06b6d4' :
                                  tag.color.includes('amber') ? '#f59e0b' :
                                  tag.color.includes('red') ? '#ef4444' :
                                  tag.color.includes('emerald') ? '#10b981' :
                                  tag.color.includes('indigo') ? '#6366f1' :
                                  '#f97316',
                                opacity,
                              }}
                              title={`${tag.label}: ${count} (${week.label})`}
                            />
                          );
                        })}
                        <span className="text-[9px] text-slate-400 mt-1">{week.label}</span>
                        <span className="text-[9px] font-bold text-slate-500">{total || ''}</span>
                      </div>
                    );
                  })}
                  <div className="flex flex-col gap-1 ml-2 min-w-[48px]">
                    {DEV_LOG_TAGS.map(tag => (
                      <div key={tag.key} className="h-4 flex items-center">
                        <span className="text-[8px] text-slate-400 whitespace-nowrap">{tag.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Incubation Pipeline */}
          {allProjectDevlogs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Idea Pipeline</h3>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'draft' as const, label: '草稿', color: 'border-slate-300', textColor: 'text-slate-600', bgColor: 'bg-slate-50' },
                  { key: 'incubating' as const, label: '孵化中', color: 'border-amber-300', textColor: 'text-amber-700', bgColor: 'bg-amber-50' },
                  { key: 'actionable' as const, label: '可执行', color: 'border-emerald-300', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50' },
                ]).map(col => (
                  <button
                    key={col.key}
                    onClick={() => { setActiveTab('devlogs'); setStatusFilter(col.key); }}
                    className={cn('glass-card p-4 text-center border-t-4 hover:shadow-md transition-shadow', col.color)}
                  >
                    <p className={cn('text-2xl font-bold', col.textColor)}>{incubationCounts[col.key]}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1">{col.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Capture + Weekly Report */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ChronicleQuickCapture projectId={project.id} onCapture={handleQuickCapture} />
            </div>
            <button
              onClick={() => setShowWeeklyReport(true)}
              className="btn-secondary text-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <FileText size={14} /> Weekly Report
            </button>
          </div>

          {/* Growth Timeline — Cross-milestone review panel */}
          {completedMilestonesWithReviews.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Growth Timeline</h3>
              <div className="space-y-3">
                {completedMilestonesWithReviews.map(ms => (
                  <div key={ms.id} className="glass-card p-5 border-l-4 border-emerald-500">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-sm text-slate-900">{ms.title}</span>
                      <span className="text-[10px] text-slate-400">{ms.completed_at ? formatDate(ms.completed_at) : ''}</span>
                      {ms.review?.time_spent && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{ms.review.time_spent}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-[10px] font-bold uppercase text-emerald-600 mb-1">What was done</p>
                        <p className="text-slate-600">{ms.review!.what_done}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-blue-600 mb-1">What was learned</p>
                        <p className="text-slate-600">{ms.review!.what_learned}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-amber-600 mb-1">What to improve</p>
                        <p className="text-slate-600">{ms.review!.what_improve}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent logs */}
          {allProjectDevlogs.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-3">Recent Dev Logs</h3>
              <div className="space-y-2">
                {allProjectDevlogs.slice(0, 3).map(dl => {
                  const statusCfg = DEV_LOG_STATUSES.find(s => s.key === (dl.status || 'draft'));
                  return (
                    <div key={dl.id} className="glass-card p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('devlogs')}>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{dl.title}</span>
                        {statusCfg && (
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', statusCfg.color)}>{statusCfg.label}</span>
                        )}
                        {dl.tags.map(t => {
                          const tagCfg = DEV_LOG_TAGS.find(dt => dt.key === t);
                          return tagCfg ? (
                            <span key={t} className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', tagCfg.color)}>{tagCfg.label}</span>
                          ) : null;
                        })}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(dl.created_at)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold text-slate-700">Milestones ({totalMs})</h3>
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                <button
                  onClick={() => setMilestonesViewMode('list')}
                  className={cn('text-[10px] font-bold px-2 py-1 rounded-md transition-all', milestonesViewMode === 'list' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400')}
                >
                  List
                </button>
                <button
                  onClick={() => setMilestonesViewMode('timeline')}
                  className={cn('text-[10px] font-bold px-2 py-1 rounded-md transition-all', milestonesViewMode === 'timeline' ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400')}
                >
                  Timeline
                </button>
              </div>
            </div>
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

          {milestonesViewMode === 'list' ? (
            <div className="space-y-3">
              {projectMilestones.map((ms, idx) => (
                <MilestoneCard
                  key={ms.id}
                  milestone={ms}
                  tasks={projectTasks}
                  devlogs={allProjectDevlogs}
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
                  onAddTask={handleAddTaskForMilestone}
                />
              ))}
            </div>
          ) : (
            /* Timeline view */
            <div className="glass-card p-6 overflow-x-auto">
              {projectMilestones.length > 0 ? (
                <div className="relative min-w-fit">
                  {/* Horizontal line */}
                  <div className="absolute top-6 left-0 right-0 h-0.5 bg-slate-200" />
                  <div className="flex gap-6">
                    {projectMilestones.map((ms) => {
                      const msTasksDone = projectTasks.filter(t => t.milestone_id === ms.id && t.status === 'done').length;
                      const msTasksTotal = projectTasks.filter(t => t.milestone_id === ms.id).length;
                      const statusColor = ms.status === 'completed' ? 'bg-emerald-500' : ms.status === 'in_progress' ? 'bg-blue-500' : 'bg-slate-300';
                      return (
                        <div key={ms.id} className="flex flex-col items-center min-w-[120px] max-w-[160px] relative">
                          {/* Node */}
                          <div className={cn('w-3 h-3 rounded-full border-2 border-white shadow-sm z-10', statusColor)} />
                          {/* Content */}
                          <div className="mt-3 text-center">
                            <p className="text-xs font-bold text-slate-900 line-clamp-2">{ms.title}</p>
                            {ms.due_date && (
                              <p className="text-[9px] text-slate-400 mt-1 flex items-center justify-center gap-0.5">
                                <Clock size={8} /> {formatDate(ms.due_date)}
                              </p>
                            )}
                            {msTasksTotal > 0 && (
                              <p className="text-[9px] text-slate-400">{msTasksDone}/{msTasksTotal} tasks</p>
                            )}
                            <span className={cn('text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mt-1 inline-block',
                              ms.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              ms.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-500'
                            )}>
                              {ms.status === 'completed' ? 'Done' : ms.status === 'in_progress' ? 'Active' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center">No milestones to display on timeline.</p>
              )}
            </div>
          )}

          {projectMilestones.length === 0 && !showMilestoneForm && milestonesViewMode === 'list' && (
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setBatchMode(!batchMode); setSelectedLogIds(new Set()); }}
                className={cn('text-xs flex items-center gap-1 transition-colors', batchMode ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600')}
              >
                <CheckSquare2 size={14} /> {batchMode ? 'Cancel' : 'Batch'}
              </button>
              <button onClick={() => { setEditingDevLog(null); setShowDevLogForm(true); }} className="btn-primary text-sm flex items-center gap-1">
                <Plus size={14} /> New Log <kbd className="hidden sm:inline ml-1 text-[9px] opacity-60">N</kbd>
              </button>
            </div>
          </div>

          {/* Search + Sort */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search logs... (press /)"
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ArrowUpDown size={12} className="text-slate-400" />
              {(['date', 'status', 'starred'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={cn(
                    'text-[10px] font-bold px-2 py-1 rounded-lg transition-all',
                    sortMode === mode ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  {mode === 'date' ? 'Date' : mode === 'status' ? 'Status' : 'Starred'}
                </button>
              ))}
            </div>
          </div>

          {/* Batch operation bar */}
          {batchMode && selectedLogIds.size > 0 && (
            <div className="glass-card p-3 flex items-center gap-3 border-2 border-indigo-200">
              <span className="text-xs font-bold text-indigo-600">{selectedLogIds.size} selected</span>
              <span className="text-xs text-slate-400">Move to:</span>
              {DEV_LOG_STATUSES.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => batchChangeStatus(key)}
                  className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full transition-all hover:opacity-80', color)}
                >
                  {label}
                </button>
              ))}
              <button onClick={() => setSelectedLogIds(new Set())} className="text-xs text-slate-400 ml-auto">Clear</button>
            </div>
          )}

          {/* Tag filter */}
          <div className="flex flex-wrap gap-2">
            <FilterChip active={tagFilter === 'all'} onClick={() => setTagFilter('all')}>All</FilterChip>
            {DEV_LOG_TAGS.map(({ key, label }) => (
              <FilterChip key={key} active={tagFilter === key} onClick={() => setTagFilter(key)}>{label}</FilterChip>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <Filter size={12} className="text-slate-400" />
            <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>All Status</FilterChip>
            {DEV_LOG_STATUSES.map(({ key, label }) => (
              <FilterChip key={key} active={statusFilter === key} onClick={() => setStatusFilter(key)}>
                {label} ({allProjectDevlogs.filter(d => (d.status || 'draft') === key).length})
              </FilterChip>
            ))}
          </div>

          {/* Thread filter */}
          {projectThreads.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <Link2 size={12} className="text-slate-400" />
              <FilterChip active={threadFilter === 'all'} onClick={() => setThreadFilter('all')}>All Threads</FilterChip>
              {projectThreads.map(thr => {
                const count = allProjectDevlogs.filter(d => d.thread_id === thr.id).length;
                return (
                  <FilterChip key={thr.id} active={threadFilter === thr.id} onClick={() => setThreadFilter(thr.id)}>
                    {thr.name} ({count})
                  </FilterChip>
                );
              })}
            </div>
          )}

          {/* Thread management */}
          <div className="flex items-center gap-2">
            {!showNewThreadForm ? (
              <button onClick={() => setShowNewThreadForm(true)} className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors">
                <Plus size={12} /> New Thread
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newThreadName}
                  onChange={e => setNewThreadName(e.target.value)}
                  placeholder="Thread name (e.g., FLM Architecture Evolution)"
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm w-72"
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') handleCreateThread(); if (e.key === 'Escape') setShowNewThreadForm(false); }}
                />
                <button onClick={handleCreateThread} disabled={!newThreadName.trim()} className="text-xs text-indigo-600 font-bold disabled:opacity-50">Create</button>
                <button onClick={() => { setShowNewThreadForm(false); setNewThreadName(''); }} className="text-xs text-slate-400">Cancel</button>
              </div>
            )}
            {projectThreads.length > 0 && threadFilter !== 'all' && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowThreadNarrative(true)}
                  className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors"
                  title="Read as narrative"
                >
                  <BookOpen size={12} /> Narrative
                </button>
                <button
                  onClick={exportThreadAsMarkdown}
                  className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors"
                  title="Copy as Markdown"
                >
                  <FileDown size={12} /> Export
                </button>
                {threadNarrativeLogs.length >= 2 && (
                  <button
                    onClick={() => {
                      const sorted = [...threadNarrativeLogs].sort((a, b) => a.created_at.localeCompare(b.created_at));
                      setDiffLogs([sorted[0], sorted[sorted.length - 1]]);
                    }}
                    className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors"
                    title="Compare first & last logs"
                  >
                    <Columns2 size={12} /> Diff
                  </button>
                )}
                <button
                  onClick={() => { if (confirm('Delete this thread? Logs will be unlinked.')) { deleteThread(threadFilter); setThreadFilter('all'); } }}
                  className="text-xs text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Custom Templates */}
          {customTemplates.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <Bookmark size={12} className="text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Templates:</span>
              {customTemplates.map(tpl => (
                <div key={tpl.id} className="flex items-center gap-1 group/tpl">
                  <button
                    onClick={() => applyTemplate(tpl)}
                    className="text-xs text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                  >
                    {tpl.name}
                  </button>
                  <button
                    onClick={() => deleteTemplate(tpl.id)}
                    className="text-slate-200 hover:text-red-400 opacity-0 group-hover/tpl:opacity-100 transition-all"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Log entries */}
          <div className="space-y-3">
            {projectDevlogs.map(dl => {
              const linkedMs = milestones.find(m => m.id === dl.milestone_id);
              const linkedTask = tasks.find(t => t.id === dl.task_id);
              const linkedThread = threads.find(t => t.id === dl.thread_id);
              const isExpanded = expandedLogs.has(dl.id);
              const statusCfg = DEV_LOG_STATUSES.find(s => s.key === (dl.status || 'draft'));
              const hasLongContent = dl.content && dl.content.length > 200;
              const isSelected = selectedLogIds.has(dl.id);
              return (
                <div key={dl.id} className={cn('glass-card p-5 group hover:shadow-md transition-shadow', isSelected && 'ring-2 ring-indigo-300')}>
                  <div className="flex items-start gap-2">
                    {/* Batch checkbox */}
                    {batchMode && (
                      <button onClick={() => toggleSelectLog(dl.id)} className="mt-1 flex-shrink-0">
                        <div className={cn('w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                          isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
                        )}>
                          {isSelected && <span className="text-white text-[8px] font-bold">✓</span>}
                        </div>
                      </button>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Star button */}
                        <button
                          onClick={() => toggleStarred(dl)}
                          className={cn('transition-colors flex-shrink-0', dl.starred ? 'text-amber-400' : 'text-slate-200 hover:text-amber-300')}
                        >
                          {dl.starred ? <Star size={14} /> : <StarOff size={14} />}
                        </button>
                        <h4 className="font-bold text-slate-900">{dl.title}</h4>
                        {/* Status pill (click to cycle) */}
                        {statusCfg && (
                          <button
                            onClick={() => cycleDevLogStatus(dl)}
                            className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full transition-all hover:opacity-80', statusCfg.color)}
                            title={`Click to cycle status (current: ${statusCfg.label})`}
                          >
                            {statusCfg.label}
                          </button>
                        )}
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
                        {linkedThread && <span className="ml-2 text-indigo-400">#{linkedThread.name}</span>}
                      </p>
                      {dl.content && (
                        <div className="mt-3">
                          <MarkdownRenderer
                            content={processLogRefs(dl.content)}
                            className={cn('text-sm text-slate-600', !isExpanded && hasLongContent && 'line-clamp-4')}
                          />
                          {hasLongContent && (
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => toggleLogExpand(dl.id)}
                                className="text-xs text-indigo-500 hover:text-indigo-700 font-bold flex items-center gap-1 transition-colors"
                              >
                                {isExpanded ? <><ChevronUp size={12} /> Collapse</> : <><ChevronDown size={12} /> Read more</>}
                              </button>
                              <button
                                onClick={() => setReadingLog(dl)}
                                className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors"
                              >
                                <Eye size={12} /> Reading mode
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all ml-2 flex-shrink-0">
                      <button onClick={() => saveAsTemplate(dl)} className="text-slate-300 hover:text-amber-500 transition-colors" title="Save as template">
                        <Bookmark size={14} />
                      </button>
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
              {tagFilter === 'all' && threadFilter === 'all' ? 'No dev logs yet. Start recording your thinking.' : 'No logs matching filters.'}
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
          threads={projectThreads}
          customTemplates={customTemplates}
          initialTemplate={templateToApply}
          onSave={(data) => { handleSaveDevLog(data); setTemplateToApply(null); }}
          onCancel={() => { setShowDevLogForm(false); setEditingDevLog(null); setTemplateToApply(null); }}
        />
      )}

      {/* Thread narrative modal */}
      {showThreadNarrative && threadFilter !== 'all' && threadNarrativeLogs.length > 0 && (() => {
        const thread = projectThreads.find(t => t.id === threadFilter);
        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowThreadNarrative(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{thread?.name || 'Thread'}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{threadNarrativeLogs.length} entries · Chronological order</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportThreadAsMarkdown}
                    className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors"
                  >
                    <FileDown size={12} /> Copy MD
                  </button>
                  <button onClick={() => setShowThreadNarrative(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
                    Close
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                {threadNarrativeLogs.map((dl, idx) => (
                  <div key={dl.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400">{idx + 1}.</span>
                      <h4 className="font-bold text-slate-900">{dl.title}</h4>
                      {dl.tags.map(t => {
                        const tagCfg = DEV_LOG_TAGS.find(dt => dt.key === t);
                        return tagCfg ? (
                          <span key={t} className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', tagCfg.color)}>{tagCfg.label}</span>
                        ) : null;
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 mb-3">{formatDate(dl.created_at)}</p>
                    {dl.content && <MarkdownRenderer content={dl.content} className="markdown-content text-slate-700" />}
                    {idx < threadNarrativeLogs.length - 1 && <hr className="mt-6 border-slate-100" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Weekly Report modal */}
      {showWeeklyReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowWeeklyReport(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Weekly Report</h3>
                <p className="text-xs text-slate-400 mt-0.5">Last 7 days summary</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { navigator.clipboard.writeText(weeklyReport); }}
                  className="text-xs text-slate-400 hover:text-indigo-500 flex items-center gap-1 transition-colors"
                >
                  <FileDown size={12} /> Copy MD
                </button>
                <button onClick={() => setShowWeeklyReport(false)} className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
                  Close
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <MarkdownRenderer content={weeklyReport} className="markdown-content text-slate-700" />
            </div>
          </div>
        </div>
      )}

      {/* Diff comparison modal */}
      {diffLogs && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDiffLogs(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Log Comparison</h3>
              <button onClick={() => setDiffLogs(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">Close</button>
            </div>
            <div className="flex-1 overflow-y-auto grid grid-cols-2 divide-x divide-slate-100">
              {diffLogs.map((dl, i) => (
                <div key={dl.id} className="p-6">
                  <div className="mb-4">
                    <h4 className="font-bold text-slate-900">{dl.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{formatDate(dl.created_at)}</span>
                      {dl.tags.map(t => {
                        const tagCfg = DEV_LOG_TAGS.find(dt => dt.key === t);
                        return tagCfg ? (
                          <span key={t} className={cn('text-[9px] font-bold px-1.5 py-0.5 rounded-full', tagCfg.color)}>{tagCfg.label}</span>
                        ) : null;
                      })}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{i === 0 ? 'Earlier' : 'Later'}</p>
                  </div>
                  <MarkdownRenderer content={dl.content} className="markdown-content text-sm text-slate-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reading mode modal */}
      {readingLog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setReadingLog(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{readingLog.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{formatDate(readingLog.created_at)}</span>
                  {readingLog.tags.map(t => {
                    const tagCfg = DEV_LOG_TAGS.find(dt => dt.key === t);
                    return tagCfg ? (
                      <span key={t} className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', tagCfg.color)}>{tagCfg.label}</span>
                    ) : null;
                  })}
                </div>
              </div>
              <button onClick={() => setReadingLog(null)} className="text-slate-400 hover:text-slate-600 transition-colors text-sm font-bold">
                Close
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <MarkdownRenderer content={readingLog.content} className="markdown-content text-slate-700" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
