import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { FileText, Trash2, Copy, Calendar, Hash } from 'lucide-react';
import type { SavedPaper, PaperBoard } from './types';

interface PaperLibraryProps {
  papers: SavedPaper[];
  onSelect: (paper: SavedPaper) => void;
  onDelete: (id: string) => void;
  onDuplicate: (paper: SavedPaper) => void;
}

export function PaperLibrary({ papers, onSelect, onDelete, onDuplicate }: PaperLibraryProps) {
  const [filterBoard, setFilterBoard] = useState<PaperBoard | ''>('');
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear pending auto-dismiss timer on unmount
  useEffect(() => () => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
  }, []);

  const filtered = useMemo(() => {
    return papers.filter(p => {
      if (filterBoard && p.board !== filterBoard) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [papers, filterBoard, search]);

  const handleDelete = useCallback((id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
    } else {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);
      setConfirmDeleteId(id);
      deleteTimerRef.current = setTimeout(
        () => setConfirmDeleteId(prev => (prev === id ? null : prev)),
        3000,
      );
    }
  }, [confirmDeleteId, onDelete]);

  if (papers.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <FileText size={48} className="mx-auto mb-4 opacity-30" />
        <p className="text-lg font-medium">No papers yet</p>
        <p className="text-sm">Create your first practice paper to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search papers..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          aria-label="Search saved papers"
        />
        <select
          value={filterBoard}
          onChange={e => setFilterBoard(e.target.value as PaperBoard | '')}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          aria-label="Filter by exam board"
        >
          <option value="">All Boards</option>
          <option value="cie">CIE 0580</option>
          <option value="edx">Edexcel 4MA1</option>
        </select>
      </div>

      {filtered.length === 0 && papers.length > 0 && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-sm">No papers match your filters.</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(p => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            className="w-full text-left rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 truncate">{p.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Hash size={12} /> {p.board === 'cie' ? 'CIE 0580' : 'Edexcel 4MA1'}
                  </span>
                  <span>{p.tier}</span>
                  <span>{p.targetMarks} marks</span>
                  <span>{p.timeMinutes} min</span>
                  <span>{p.questionIds.length} questions</span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar size={12} /> {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onDuplicate(p); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
                  title="Duplicate"
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                  className={`p-1.5 rounded-lg transition ${
                    confirmDeleteId === p.id
                      ? 'bg-red-100 text-red-600'
                      : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                  }`}
                  title={confirmDeleteId === p.id ? 'Click again to confirm delete' : 'Delete'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
