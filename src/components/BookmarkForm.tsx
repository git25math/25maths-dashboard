import React, { memo, useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Bookmark, BookmarkType } from '../types';
import { SIDEBAR_ITEMS } from '../shared/sidebarConfig';

interface BookmarkFormProps {
  bookmark?: Bookmark | null;
  existingCategories: string[];
  onSave: (data: Omit<Bookmark, 'id'>) => void;
  onCancel: () => void;
}

const TYPE_OPTIONS: { value: BookmarkType; label: string }[] = [
  { value: 'external', label: 'External URL' },
  { value: 'internal', label: 'Internal Page' },
];

export const BookmarkForm = memo(function BookmarkForm({ bookmark, existingCategories, onSave, onCancel }: BookmarkFormProps) {
  const [title, setTitle] = useState(bookmark?.title || '');
  const [type, setType] = useState<BookmarkType>(bookmark?.type || 'external');
  const [url, setUrl] = useState(bookmark?.url || '');
  const [internalTab, setInternalTab] = useState(bookmark?.internal_tab || '');
  const [category, setCategory] = useState(bookmark?.category || '');
  const [icon, setIcon] = useState(bookmark?.icon || '');
  const [pinned, setPinned] = useState(bookmark?.pinned ?? false);
  const [sortOrder, setSortOrder] = useState(bookmark?.sort_order ?? 0);

  const datalistId = useMemo(() => 'bm-cats-' + Date.now(), []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    if (type === 'external' && !url.trim()) return;
    if (type === 'internal' && !internalTab) return;
    onSave({
      title,
      type,
      url: type === 'external' ? url : '',
      internal_tab: type === 'internal' ? internalTab : undefined,
      category: category || undefined,
      icon: icon || undefined,
      pinned,
      sort_order: sortOrder,
      created_at: bookmark?.created_at || new Date().toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">{bookmark ? 'Edit Bookmark' : 'New Bookmark'}</h2>
          <button onClick={onCancel} aria-label="Close" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
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
              placeholder="Bookmark title"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Type</label>
            <div className="flex gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                    type === opt.value
                      ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                      : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {type === 'external' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">URL</label>
              <input
                required
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          )}

          {type === 'internal' && (
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Internal Page</label>
              <select
                required
                value={internalTab}
                onChange={e => setInternalTab(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Select a page...</option>
                {SIDEBAR_ITEMS.map(item => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="e.g. Teaching, Tools"
                list={datalistId}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
              <datalist id={datalistId}>
                {existingCategories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Icon (emoji)</label>
              <input
                type="text"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                placeholder="e.g. 📚"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={e => setSortOrder(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={e => setPinned(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <span className="text-sm font-bold text-slate-700">Pin to Dashboard</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              {bookmark ? 'Update Bookmark' : 'Save Bookmark'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
