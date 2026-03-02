import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Trash2, Edit3 } from 'lucide-react';
import { SOP } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';

interface SOPViewProps {
  sops: SOP[];
  onAddSOP: () => void;
  onDeleteSOP: (id: string) => void;
  onEditSOP?: (sop: SOP) => void;
}

export const SOPView = ({ sops, onAddSOP, onDeleteSOP, onEditSOP }: SOPViewProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">SOP Library</h2>
        <button onClick={onAddSOP} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={18} /> Add New SOP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sops.map((sop) => {
          const isExpanded = expandedId === sop.id;
          return (
            <div key={sop.id} className="glass-card p-5 hover:border-indigo-300 transition-colors group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                {onEditSOP && (
                  <button
                    onClick={() => onEditSOP(sop)}
                    className="text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    <Edit3 size={14} />
                  </button>
                )}
                <button
                  onClick={() => { if (confirm('Delete this SOP?')) onDeleteSOP(sop.id); }}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                  {sop.category}
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{sop.title}</h3>
              <div className={isExpanded ? '' : 'line-clamp-3'}>
                <MarkdownRenderer content={sop.content} className="text-sm text-slate-500 mt-1" />
              </div>
              <button
                onClick={() => setExpandedId(isExpanded ? null : sop.id)}
                className="mt-4 flex items-center gap-2 text-indigo-600 text-sm font-semibold hover:underline"
              >
                {isExpanded ? (
                  <>Collapse <ChevronDown size={14} /></>
                ) : (
                  <>Read Procedure <ChevronRight size={14} /></>
                )}
              </button>
            </div>
          );
        })}
      </div>
      {sops.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">No SOPs yet. Click "Add New SOP" to create one.</div>
      )}
    </div>
  );
};
