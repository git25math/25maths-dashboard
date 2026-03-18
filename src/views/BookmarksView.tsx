import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Bookmark as BookmarkIcon, Pin, PinOff, ExternalLink, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Bookmark } from '../types';
import { FilterChip } from '../components/FilterChip';

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  onAdd: () => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const BookmarksView = ({ bookmarks, onAdd, onEdit, onDelete, onTogglePin, onNavigate }: BookmarksViewProps) => {
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => {
    const cats = new Set(bookmarks.map(b => b.category).filter(Boolean) as string[]);
    return ['All', ...Array.from(cats).sort()];
  }, [bookmarks]);

  const filtered = useMemo(() => {
    if (categoryFilter === 'All') return bookmarks;
    return bookmarks.filter(b => b.category === categoryFilter);
  }, [bookmarks, categoryFilter]);

  const sorted = useMemo(() =>
    [...filtered].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [filtered]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BookmarkIcon size={24} className="text-indigo-600" /> Bookmarks
          </h2>
          <p className="text-sm text-slate-500 mt-1">{bookmarks.length} bookmarks total</p>
        </div>
        <button onClick={onAdd} className="btn-primary flex items-center gap-2 self-start">
          <Plus size={18} /> Add Bookmark
        </button>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <FilterChip key={cat} onClick={() => setCategoryFilter(cat)} active={categoryFilter === cat}>
              {cat}
            </FilterChip>
          ))}
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <BookmarkIcon size={48} className="mb-4 opacity-20" />
          <p className="text-lg font-medium">No bookmarks yet</p>
          <p className="text-sm">Add your favourite links and internal pages.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map(bm => (
            <div key={bm.id} className="group glass-card p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {bm.icon && <span className="text-lg flex-shrink-0">{bm.icon}</span>}
                  <h3 className="font-bold text-slate-900 truncate">{bm.title}</h3>
                </div>
                <button
                  onClick={() => onTogglePin(bm.id)}
                  className={cn(
                    "p-1 rounded-lg transition-colors flex-shrink-0",
                    bm.pinned ? "text-amber-500 hover:text-amber-600" : "text-slate-300 hover:text-slate-500"
                  )}
                  title={bm.pinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
                >
                  {bm.pinned ? <Pin size={14} /> : <PinOff size={14} />}
                </button>
              </div>

              {bm.type === 'external' && bm.url && (
                <p className="text-[10px] text-slate-400 mt-1 truncate">{bm.url}</p>
              )}
              {bm.type === 'internal' && bm.internal_tab && (
                <span className="text-[10px] font-bold text-indigo-500 mt-1">Internal: {bm.internal_tab}</span>
              )}

              {bm.category && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 self-start mt-2">
                  {bm.category}
                </span>
              )}

              <div className="flex items-center gap-2 mt-auto pt-4">
                <button
                  onClick={() => {
                    if (bm.type === 'external' && bm.url) {
                      window.open(bm.url, '_blank');
                    } else if (bm.type === 'internal' && bm.internal_tab) {
                      onNavigate(bm.internal_tab);
                    }
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  {bm.type === 'external' ? <><ExternalLink size={12} /> Open</> : <><ArrowRight size={12} /> Go</>}
                </button>
                <div className="flex-1" />
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onEdit(bm)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => onDelete(bm.id)}
                    className="flex items-center gap-1 text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
