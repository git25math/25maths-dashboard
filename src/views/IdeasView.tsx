import { useState } from 'react';
import { Plus, Trash2, Edit3, CheckCircle2, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Idea } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';

type StatusFilter = 'all' | 'pending' | 'processed';

interface IdeasViewProps {
  ideas: Idea[];
  onAddIdea: () => void;
  onDeleteIdea: (id: string) => void;
  onEditIdea?: (idea: Idea) => void;
  onToggleStatus?: (id: string) => void;
}

export const IdeasView = ({ ideas, onAddIdea, onDeleteIdea, onEditIdea, onToggleStatus }: IdeasViewProps) => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const filteredIdeas = statusFilter === 'all'
    ? ideas
    : ideas.filter(idea => idea.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Startup灵感池 (25maths)</h2>
        <button onClick={onAddIdea} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={18} /> New Idea
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'processed'] as const).map(filter => (
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
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIdeas.map((idea) => (
          <div key={idea.id} className="glass-card p-5 hover:shadow-md transition-shadow group relative">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
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
                    idea.status === 'processed'
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  )}
                >
                  {idea.status === 'processed' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                  {idea.status}
                </button>
              )}
            </div>
            <h3 className="font-bold text-lg text-slate-900">{idea.title}</h3>
            <MarkdownRenderer content={idea.content} className="text-sm text-slate-500 mt-1 line-clamp-3" />
          </div>
        ))}
      </div>
      {filteredIdeas.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">
          {statusFilter === 'all' ? 'No ideas yet. Click "New Idea" to capture one.' : `No ${statusFilter} ideas found.`}
        </div>
      )}
    </div>
  );
};
