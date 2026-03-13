import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DevLogEntry, DevLogTag, DevLogStatus, DEV_LOG_TAGS, DEV_LOG_STATUSES, DevLogThread, CustomTemplate } from '../../types/chronicle';
import { ProjectMilestone } from '../../types/chronicle';
import { Task } from '../../types';
import { RichTextEditor } from '../RichTextEditor';

interface DevLogEditorProps {
  entry?: DevLogEntry | null;
  projectId: string;
  milestones: ProjectMilestone[];
  tasks: Task[];
  threads?: DevLogThread[];
  customTemplates?: CustomTemplate[];
  initialTemplate?: CustomTemplate | null;
  onSave: (data: Omit<DevLogEntry, 'id'>) => void;
  onCancel: () => void;
}

export function DevLogEditor({ entry, projectId, milestones, tasks, threads = [], customTemplates = [], initialTemplate, onSave, onCancel }: DevLogEditorProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || initialTemplate?.content || '');
  const [tags, setTags] = useState<DevLogTag[]>(entry?.tags || initialTemplate?.tags || ['thinking']);
  const [status, setStatus] = useState<DevLogStatus>(entry?.status || 'draft');
  const [milestoneId, setMilestoneId] = useState(entry?.milestone_id || '');
  const [taskId, setTaskId] = useState(entry?.task_id || '');
  const [threadId, setThreadId] = useState(entry?.thread_id || '');

  const toggleTag = (tag: DevLogTag) => {
    setTags(prev => {
      const next = prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag];
      // Auto-fill template when adding a tag to a new log with empty content
      if (!entry && !content.trim() && !prev.includes(tag)) {
        const tagCfg = DEV_LOG_TAGS.find(t => t.key === tag);
        if (tagCfg?.template) setContent(tagCfg.template);
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      project_id: projectId,
      milestone_id: milestoneId || undefined,
      task_id: taskId || undefined,
      thread_id: threadId || undefined,
      title: title.trim(),
      content,
      tags,
      status,
      created_at: entry?.created_at || new Date().toISOString(),
      updated_at: entry ? new Date().toISOString() : undefined,
    });
  };

  const projectMilestones = milestones.filter(m => m.project_id === projectId);
  const projectTasks = tasks.filter(t => t.project_id === projectId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-900">{entry ? 'Edit Dev Log' : 'New Dev Log'}</h3>
          <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What is this about?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {DEV_LOG_TAGS.map(({ key, label, color }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleTag(key)}
                    className={cn(
                      'text-xs font-bold px-3 py-1 rounded-full transition-all border',
                      tags.includes(key)
                        ? `${color} border-current`
                        : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Template picker (only for new entries) */}
          {!entry && customTemplates.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Apply Template</label>
              <div className="flex flex-wrap gap-2">
                {customTemplates.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => { setContent(tpl.content); setTags(tpl.tags); }}
                    className="text-xs text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-slate-200 transition-all"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status selector */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
            <div className="flex flex-wrap gap-2">
              {DEV_LOG_STATUSES.map(({ key, label, color }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStatus(key)}
                  className={cn(
                    'text-xs font-bold px-3 py-1 rounded-full transition-all border',
                    status === key
                      ? `${color} border-current`
                      : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Content</label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Record your thoughts, decisions, AI conversations..." editorHeightClass="min-h-[240px]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Link to Milestone</label>
              <select
                value={milestoneId}
                onChange={e => setMilestoneId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">None</option>
                {projectMilestones.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Link to Task</label>
              <select
                value={taskId}
                onChange={e => setTaskId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">None</option>
                {projectTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Thread selector */}
          {threads.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Thread</label>
              <select
                value={threadId}
                onChange={e => setThreadId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">No thread</option>
                {threads.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          )}
        </form>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary text-sm">Cancel</button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {entry ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}
