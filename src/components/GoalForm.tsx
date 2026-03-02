import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Goal } from '../types';

interface GoalFormProps {
  goal?: Goal | null;
  onSave: (data: Omit<Goal, 'id'>) => void;
  onCancel: () => void;
}

const CATEGORIES: { value: Goal['category']; label: string; color: string }[] = [
  { value: 'dream', label: 'Dream', color: 'bg-purple-50 border-purple-200 text-purple-600' },
  { value: 'work', label: 'Work', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  { value: 'startup', label: 'Startup', color: 'bg-indigo-50 border-indigo-200 text-indigo-600' },
];

const STATUSES: { value: Goal['status']; label: string; color: string }[] = [
  { value: 'in-progress', label: 'In Progress', color: 'bg-amber-50 border-amber-200 text-amber-600' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-slate-50 border-slate-200 text-slate-600' },
];

export const GoalForm = ({ goal, onSave, onCancel }: GoalFormProps) => {
  const [title, setTitle] = useState(goal?.title || '');
  const [category, setCategory] = useState<Goal['category']>(goal?.category || 'work');
  const [status, setStatus] = useState<Goal['status']>(goal?.status || 'in-progress');
  const [progress, setProgress] = useState(goal?.progress ?? 0);
  const [deadline, setDeadline] = useState(goal?.deadline || '');
  const [imageUrl, setImageUrl] = useState(goal?.image_url || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title,
      category,
      status,
      progress,
      deadline: deadline || undefined,
      image_url: imageUrl || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">{goal ? 'Edit Goal' : 'New Goal'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Goal title"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      category === cat.value ? cat.color : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Status</label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStatus(s.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                      status === s.value ? s.color : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Progress — {progress}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={e => setProgress(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              {goal ? 'Update Goal' : 'Save Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
