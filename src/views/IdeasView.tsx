import { useState } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, Clock, FileText, Eye, EyeOff, Sparkles, CheckSquare, Square, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Idea, Task } from '../types';
import { FilterChip } from '../components/FilterChip';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { geminiService, ConsolidatedIdea } from '../services/geminiService';
import { ConsolidatePreviewModal } from '../components/ConsolidatePreviewModal';

type StatusFilter = 'all' | 'note' | 'pending' | 'processed';

const STATUS_CONFIG: Record<Idea['status'], { label: string; color: string; icon: typeof Clock }> = {
  note: { label: '只是记录', color: 'bg-slate-100 text-slate-600', icon: FileText },
  pending: { label: '待处理', color: 'bg-amber-50 text-amber-600', icon: Clock },
  processed: { label: '已处理', color: 'bg-emerald-50 text-emerald-600', icon: CheckCircle2 },
};

const FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All',
  note: 'Note',
  pending: 'Pending',
  processed: 'Processed',
};

interface IdeasViewProps {
  ideas: Idea[];
  onAddIdea: () => void;
  onDeleteIdea: (id: string) => void;
  onEditIdea?: (idea: Idea) => void;
  onToggleStatus?: (id: string) => void;
  onToggleDashboard?: (id: string) => void;
  onConsolidate?: (selectedIds: string[], consolidated: { title: string; content: string; category: Idea['category']; priority: Idea['priority'] }) => Promise<void>;
  onConvertToTask?: (idea: Idea) => void;
}

export const IdeasView = ({ ideas, onAddIdea, onDeleteIdea, onEditIdea, onToggleStatus, onToggleDashboard, onConsolidate, onConvertToTask }: IdeasViewProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [consolidatePreview, setConsolidatePreview] = useState<ConsolidatedIdea | null>(null);

  const filteredIdeas = (statusFilter === 'all'
    ? ideas
    : ideas.filter(idea => idea.status === statusFilter)
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
      const selected = ideas.filter(i => selectedIds.has(i.id));
      const result = await geminiService.consolidateIdeas(selected);
      setConsolidatePreview(result);
    } catch {
      // If AI fails, silently stop loading
    } finally {
      setIsConsolidating(false);
    }
  };

  const handleConfirmConsolidate = async (data: { title: string; content: string; category: Idea['category']; priority: Idea['priority'] }) => {
    if (!onConsolidate) return;
    await onConsolidate(Array.from(selectedIds), data);
    setConsolidatePreview(null);
    exitSelectMode();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Startup灵感池 (25maths)</h2>
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
          <button onClick={onAddIdea} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={18} /> New Idea
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'note', 'pending', 'processed'] as const).map(filter => (
          <FilterChip
            key={filter}
            onClick={() => setStatusFilter(filter)}
            active={statusFilter === filter}
          >
            {FILTER_LABELS[filter]}
          </FilterChip>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => {
          const cfg = STATUS_CONFIG[idea.status];
          const StatusIcon = cfg.icon;
          const isSelected = selectedIds.has(idea.id);
          return (
            <div
              key={idea.id}
              onClick={isSelectMode ? () => toggleSelect(idea.id) : undefined}
              className={cn(
                "glass-card p-5 transition-shadow group relative",
                isSelectMode ? "cursor-pointer" : "hover:shadow-md",
                isSelected && "ring-2 ring-purple-400 bg-purple-50/30"
              )}
            >
              {isSelectMode && (
                <div className="absolute top-4 right-4">
                  {isSelected
                    ? <CheckSquare size={20} className="text-purple-600" />
                    : <Square size={20} className="text-slate-300" />
                  }
                </div>
              )}
              {!isSelectMode && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                  {onConvertToTask && (
                    <button
                      onClick={() => onConvertToTask(idea)}
                      title="Convert to Task"
                      className="text-slate-300 hover:text-cyan-500 transition-colors"
                    >
                      <CheckSquare size={14} />
                    </button>
                  )}
                  {onToggleDashboard && (
                    <button
                      onClick={() => onToggleDashboard(idea.id)}
                      title={idea.show_on_dashboard ? 'Hide from Dashboard' : 'Show on Dashboard'}
                      className={cn(
                        "transition-colors",
                        idea.show_on_dashboard
                          ? "text-indigo-500 hover:text-indigo-700"
                          : "text-slate-300 hover:text-slate-500"
                      )}
                    >
                      {idea.show_on_dashboard ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                  )}
                  {onEditIdea && (
                    <button
                      onClick={() => onEditIdea(idea)}
                      className="text-slate-300 hover:text-indigo-500 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm('Delete this idea?')) onDeleteIdea(idea.id); }}
                    className="text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                  idea.category === 'startup' ? "bg-indigo-50 text-indigo-600" :
                  idea.category === 'work' ? "bg-emerald-50 text-emerald-600" :
                  "bg-slate-100 text-slate-500"
                )}>
                  {idea.category}
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                  idea.priority === 'high' ? "bg-red-50 text-red-600" :
                  idea.priority === 'medium' ? "bg-amber-50 text-amber-600" :
                  "bg-blue-50 text-blue-600"
                )}>
                  {idea.priority}
                </span>
                {onToggleStatus && !isSelectMode && (
                  <button
                    onClick={() => onToggleStatus(idea.id)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 transition-all hover:opacity-80",
                      cfg.color
                    )}
                  >
                    <StatusIcon size={10} />
                    {cfg.label}
                  </button>
                )}
                {idea.show_on_dashboard && (
                  <Eye size={12} className="text-indigo-400" />
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900">{idea.title}</h3>
              <MarkdownRenderer content={idea.content} className="text-sm text-slate-500 mt-1 line-clamp-3" />
            </div>
          );
        })}
      </div>
      {filteredIdeas.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          {statusFilter === 'all' ? 'No ideas yet. Click "New Idea" to capture one.' : `No ${statusFilter} ideas found.`}
        </div>
      )}

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
        <ConsolidatePreviewModal
          result={consolidatePreview}
          selectedCount={selectedIds.size}
          onConfirm={handleConfirmConsolidate}
          onCancel={() => setConsolidatePreview(null)}
        />
      )}
    </div>
  );
};
