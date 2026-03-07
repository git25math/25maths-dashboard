import { useState } from 'react';
import { X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { SmartTaskPreview, Task } from '../types';
import { RichTextEditor } from './RichTextEditor';

const SOURCE_COLORS: Record<SmartTaskPreview['source_section'], string> = {
  action_item: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  key_point: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  decision: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  summary: 'bg-amber-50 text-amber-600 border-amber-200',
};

const SOURCE_LABELS: Record<SmartTaskPreview['source_section'], string> = {
  action_item: 'Action Item',
  key_point: 'Key Point',
  decision: 'Decision',
  summary: 'Summary',
};

interface SmartExtractModalProps {
  tasks: SmartTaskPreview[];
  meetingId: string;
  onConfirm: (tasks: Omit<Task, 'id' | 'created_at'>[]) => void;
  onCancel: () => void;
}

export const SmartExtractModal = ({ tasks: initialTasks, meetingId, onConfirm, onCancel }: SmartExtractModalProps) => {
  const [tasks, setTasks] = useState<(SmartTaskPreview & { enabled: boolean })[]>(
    initialTasks.map(t => ({ ...t, enabled: true }))
  );
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const enabledCount = tasks.filter(t => t.enabled).length;

  const toggleEnabled = (idx: number) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, enabled: !t.enabled } : t));
  };

  const updateTask = (idx: number, updates: Partial<SmartTaskPreview>) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, ...updates } : t));
  };

  const handleConfirm = () => {
    const enabled = tasks.filter(t => t.enabled);
    const result: Omit<Task, 'id' | 'created_at'>[] = enabled.map(t => ({
      title: t.title,
      description: t.description,
      status: 'inbox' as const,
      priority: t.priority,
      source_type: 'meeting' as const,
      source_id: meetingId,
      assignee: t.assignee || undefined,
      due_date: t.due_date || undefined,
      tags: t.tags,
    }));
    onConfirm(result);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-8 py-6 border-b border-teal-100 flex justify-between items-center bg-teal-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-teal-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Smart Extract</h2>
              <p className="text-xs text-teal-500 font-medium">{tasks.length} tasks extracted from meeting</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-teal-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {tasks.map((task, idx) => (
            <div key={idx} className={cn("border rounded-2xl transition-all", task.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60")}>
              <div className="flex items-center gap-3 p-4">
                {/* Toggle */}
                <input
                  type="checkbox"
                  checked={task.enabled}
                  onChange={() => toggleEnabled(idx)}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 shrink-0"
                />

                {/* Title + source badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800 truncate">{task.title}</span>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", SOURCE_COLORS[task.source_section])}>
                      {SOURCE_LABELS[task.source_section]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                    <span className={cn("w-2 h-2 rounded-full", task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-blue-400')} />
                    <span>{task.priority}</span>
                    {task.assignee && <span>| {task.assignee}</span>}
                    {task.due_date && <span>| {task.due_date}</span>}
                  </div>
                </div>

                {/* Expand toggle */}
                <button onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)} className="p-1 text-slate-400 hover:text-teal-600 transition-colors shrink-0">
                  {expandedIdx === idx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Expanded edit */}
              {expandedIdx === idx && (
                <div className="px-4 pb-4 pt-0 space-y-3 border-t border-slate-100 mt-0 pt-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                    <input
                      value={task.title}
                      onChange={e => updateTask(idx, { title: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <RichTextEditor
                      label="Description"
                      value={task.description}
                      onChange={value => updateTask(idx, { description: value })}
                      placeholder="Task description... Supports Markdown and LaTeX..."
                      editorHeightClass="h-24"
                      previewMinHeightClass="min-h-[6rem]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</label>
                      <div className="flex gap-1 mt-1">
                        {(['high', 'medium', 'low'] as const).map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => updateTask(idx, { priority: p })}
                            className={cn(
                              "px-2 py-1 rounded-lg text-xs font-bold border transition-all flex-1",
                              task.priority === p
                                ? p === 'high' ? "bg-red-50 border-red-200 text-red-600"
                                  : p === 'medium' ? "bg-amber-50 border-amber-200 text-amber-600"
                                  : "bg-blue-50 border-blue-200 text-blue-600"
                                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                            )}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assignee</label>
                      <input
                        value={task.assignee || ''}
                        onChange={e => updateTask(idx, { assignee: e.target.value })}
                        placeholder="Name..."
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
                      <input
                        type="date"
                        value={task.due_date || ''}
                        onChange={e => updateTask(idx, { due_date: e.target.value })}
                        className="w-full mt-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tags (comma-separated)</label>
                    <input
                      value={task.tags.join(', ')}
                      onChange={e => updateTask(idx, { tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-8 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button onClick={onCancel} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={enabledCount === 0}
            className="px-8 py-2 bg-teal-600 text-white font-bold rounded-xl shadow-lg shadow-teal-200 hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            <Sparkles size={16} />
            Create {enabledCount} Task{enabledCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
