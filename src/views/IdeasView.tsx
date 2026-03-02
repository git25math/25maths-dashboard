import { useState } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, Clock, FileText, Eye, EyeOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { Idea } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';

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
}

export const IdeasView = ({ ideas, onAddIdea, onDeleteIdea, onEditIdea, onToggleStatus, onToggleDashboard }: IdeasViewProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  const filteredIdeas = (statusFilter === 'all'
    ? ideas
    : ideas.filter(idea => idea.status === statusFilter)
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Startup灵感池 (25maths)</h2>
        <button onClick={onAddIdea} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={18} /> New Idea
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'note', 'pending', 'processed'] as const).map(filter => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
              statusFilter === filter
                ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
            )}
          >
            {FILTER_LABELS[filter]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => {
          const cfg = STATUS_CONFIG[idea.status];
          const StatusIcon = cfg.icon;
          return (
            <div key={idea.id} className="glass-card p-5 hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
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
                {onToggleStatus && (
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
    </div>
  );
};
