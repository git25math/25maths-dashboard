import { useState } from 'react';
import { Plus, Trash2, Edit3, CheckSquare, Square, Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkLog } from '../types';
import { geminiService, ConsolidatedWorkLog } from '../services/geminiService';
import { ConsolidateWorkLogPreviewModal } from '../components/ConsolidateWorkLogPreviewModal';

const CATEGORY_FILTERS = ['All', 'tutor', 'teaching', 'admin', 'startup', 'other'] as const;
type CategoryFilter = typeof CATEGORY_FILTERS[number];

interface WorkLogViewProps {
  workLogs: WorkLog[];
  onAddLog: () => void;
  onDeleteLog: (id: string) => void;
  onEditLog?: (log: WorkLog) => void;
  onConsolidate?: (selectedIds: string[], consolidated: { content: string; category: WorkLog['category']; tags?: string[] }) => Promise<void>;
}

export const WorkLogView = ({ workLogs, onAddLog, onDeleteLog, onEditLog, onConsolidate }: WorkLogViewProps) => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('All');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [consolidatePreview, setConsolidatePreview] = useState<ConsolidatedWorkLog | null>(null);

  const filteredLogs = [...(activeFilter === 'All'
    ? workLogs
    : workLogs.filter(log => log.category === activeFilter)
  )].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleConsolidate = async () => {
    if (selectedIds.size < 2) return;
    setIsConsolidating(true);
    try {
      const selected = workLogs.filter(l => selectedIds.has(l.id));
      const result = await geminiService.consolidateWorkLogs(selected);
      setConsolidatePreview(result);
    } catch {
      // silent
    } finally {
      setIsConsolidating(false);
    }
  };

  const handleConfirmConsolidate = async (data: { content: string; category: WorkLog['category']; tags?: string[] }) => {
    if (!onConsolidate) return;
    await onConsolidate(Array.from(selectedIds), data);
    setConsolidatePreview(null);
    exitSelectMode();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Work Logs (工作日志)</h2>
        <div className="flex items-center gap-2">
          {onConsolidate && (
            <button
              onClick={() => isSelectMode ? exitSelectMode() : setIsSelectMode(true)}
              className={cn(
                "text-sm flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all",
                isSelectMode
                  ? "bg-purple-50 text-purple-600 border border-purple-200"
                  : "bg-white text-slate-500 border border-slate-200 hover:text-purple-600 hover:border-purple-200"
              )}
            >
              {isSelectMode ? <><X size={16} /> Exit Select</> : <><CheckSquare size={16} /> Select</>}
            </button>
          )}
          <button onClick={onAddLog} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={18} /> New Log Entry
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
              activeFilter === filter
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
            )}
          >
            {filter === 'All' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-bottom border-slate-100">
              {isSelectMode && <th className="p-4 w-10"></th>}
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Timestamp</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Content</th>
              <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Tags</th>
              {!isSelectMode && <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 w-16"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.map(log => {
              const isSelected = selectedIds.has(log.id);
              return (
                <tr
                  key={log.id}
                  onClick={isSelectMode ? () => toggleSelect(log.id) : undefined}
                  className={cn(
                    "transition-colors group",
                    isSelectMode ? "cursor-pointer" : "hover:bg-slate-50/50",
                    isSelected && "bg-purple-50/50"
                  )}
                >
                  {isSelectMode && (
                    <td className="p-4">
                      {isSelected
                        ? <CheckSquare size={18} className="text-purple-600" />
                        : <Square size={18} className="text-slate-300" />
                      }
                    </td>
                  )}
                  <td className="p-4 text-xs font-mono text-slate-500">{log.timestamp}</td>
                  <td className="p-4">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                      log.category === 'tutor' ? "bg-indigo-50 text-indigo-600" :
                      log.category === 'teaching' ? "bg-emerald-50 text-emerald-600" :
                      log.category === 'admin' ? "bg-blue-50 text-blue-600" :
                      log.category === 'startup' ? "bg-purple-50 text-purple-600" :
                      "bg-slate-100 text-slate-500"
                    )}>
                      {log.category}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">{log.content}</td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {log.tags?.map(tag => (
                        <span key={tag} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full border border-slate-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  {!isSelectMode && (
                    <td className="p-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {onEditLog && (
                          <button
                            onClick={() => onEditLog(log)}
                            className="text-slate-300 hover:text-indigo-500 transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}
                        <button
                          onClick={() => { if (confirm('Delete this log entry?')) onDeleteLog(log.id); }}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {filteredLogs.length === 0 && (
          <div className="p-12 text-center text-slate-400">
            {activeFilter === 'All' ? 'No work logs yet. Click "New Log Entry" to add one.' : `No ${activeFilter} logs found.`}
          </div>
        )}
      </div>

      {/* Floating bottom bar in select mode */}
      {isSelectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-2xl border border-purple-200 px-6 py-3 flex items-center gap-4">
          <span className="text-sm font-bold text-slate-700">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleConsolidate}
            disabled={selectedIds.size < 2 || isConsolidating}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all",
              selectedIds.size >= 2 && !isConsolidating
                ? "bg-purple-600 text-white shadow-lg shadow-purple-200 hover:bg-purple-700"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {isConsolidating
              ? <><Loader2 size={16} className="animate-spin" /> Consolidating...</>
              : <><Sparkles size={16} /> AI Consolidate</>
            }
          </button>
          <button onClick={exitSelectMode} className="text-sm text-slate-400 hover:text-slate-600 font-bold transition-colors">
            Cancel
          </button>
        </div>
      )}

      {/* Consolidate preview modal */}
      {consolidatePreview && (
        <ConsolidateWorkLogPreviewModal
          result={consolidatePreview}
          selectedCount={selectedIds.size}
          onConfirm={handleConfirmConsolidate}
          onCancel={() => setConsolidatePreview(null)}
        />
      )}
    </div>
  );
};
