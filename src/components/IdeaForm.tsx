import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { Idea } from '../types';
import { RichTextEditor } from './RichTextEditor';

interface IdeaFormProps {
  idea?: Idea | null;
  onSave: (data: { title: string; content: string; category: Idea['category']; priority: Idea['priority']; show_on_dashboard?: boolean }) => void;
  onCancel: () => void;
}

export const IdeaForm = ({ idea, onSave, onCancel }: IdeaFormProps) => {
  const [title, setTitle] = useState(idea?.title || '');
  const [content, setContent] = useState(idea?.content || '');
  const [category, setCategory] = useState<Idea['category']>(idea?.category || 'startup');
  const [priority, setPriority] = useState<Idea['priority']>(idea?.priority || 'medium');
  const [showOnDashboard, setShowOnDashboard] = useState(idea?.show_on_dashboard ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title, content, category, priority, show_on_dashboard: showOnDashboard });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{idea ? 'Edit Idea' : 'New Idea'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Idea title"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:bg-slate-700 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Category</label>
              <div className="flex flex-wrap gap-2">
                {(['startup', 'work', 'student'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      category === cat
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                        : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Priority</label>
              <div className="flex flex-wrap gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      priority === p
                        ? p === 'high' ? "bg-red-50 border-red-200 text-red-600"
                          : p === 'medium' ? "bg-amber-50 border-amber-200 text-amber-600"
                          : "bg-blue-50 border-blue-200 text-blue-600"
                        : "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              {showOnDashboard ? <Eye size={16} className="text-indigo-500" /> : <EyeOff size={16} className="text-slate-400" />}
              Show on Dashboard
            </div>
            <button
              type="button"
              onClick={() => setShowOnDashboard(!showOnDashboard)}
              className={cn(
                "relative w-10 h-6 rounded-full transition-colors",
                showOnDashboard ? "bg-indigo-600" : "bg-slate-300"
              )}
            >
              <span className={cn(
                "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
                showOnDashboard ? "translate-x-[18px]" : "translate-x-0.5"
              )} />
            </button>
          </div>

          <RichTextEditor
            label="Description"
            value={content}
            onChange={setContent}
            placeholder="Describe your idea..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              {idea ? 'Update Idea' : 'Save Idea'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
