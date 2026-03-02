import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkLog } from '../types';
import { RichTextEditor } from './RichTextEditor';

interface WorkLogFormProps {
  workLog?: WorkLog | null;
  onSave: (data: { content: string; category: WorkLog['category']; tags?: string[] }) => void;
  onCancel: () => void;
}

const CATEGORIES: { value: WorkLog['category']; label: string }[] = [
  { value: 'teaching', label: 'Teaching' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'admin', label: 'Admin' },
  { value: 'startup', label: 'Startup' },
  { value: 'other', label: 'Other' },
];

export const WorkLogForm = ({ workLog, onSave, onCancel }: WorkLogFormProps) => {
  const [content, setContent] = useState(workLog?.content || '');
  const [category, setCategory] = useState<WorkLog['category']>(workLog?.category || 'teaching');
  const [tagInput, setTagInput] = useState(workLog?.tags?.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const tags = tagInput.trim() ? tagInput.split(',').map(t => t.trim()).filter(Boolean) : undefined;
    onSave({ content, category, tags });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{workLog ? 'Edit Work Log' : 'New Work Log'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                    category === cat.value
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-slate-600"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <RichTextEditor
            label="Content"
            value={content}
            onChange={setContent}
            placeholder="What did you work on?"
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="e.g. Y10, Homework, Meeting"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              {workLog ? 'Update Log' : 'Save Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
