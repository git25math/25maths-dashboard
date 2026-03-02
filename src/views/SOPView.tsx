import { useState } from 'react';
import { Plus, ChevronRight, ChevronDown, Trash2, Edit3, CheckSquare, Square, Sparkles, Loader2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { SOP } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { geminiService, ConsolidatedSOP } from '../services/geminiService';
import { ConsolidateSOPPreviewModal } from '../components/ConsolidateSOPPreviewModal';

interface SOPViewProps {
  sops: SOP[];
  onAddSOP: () => void;
  onDeleteSOP: (id: string) => void;
  onEditSOP?: (sop: SOP) => void;
  onConsolidate?: (selectedIds: string[], consolidated: { title: string; content: string; category: string }) => Promise<void>;
}

export const SOPView = ({ sops, onAddSOP, onDeleteSOP, onEditSOP, onConsolidate }: SOPViewProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isConsolidating, setIsConsolidating] = useState(false);
  const [consolidatePreview, setConsolidatePreview] = useState<ConsolidatedSOP | null>(null);

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
      const selected = sops.filter(s => selectedIds.has(s.id));
      const result = await geminiService.consolidateSOPs(selected);
      setConsolidatePreview(result);
    } catch {
      // silent
    } finally {
      setIsConsolidating(false);
    }
  };

  const handleConfirmConsolidate = async (data: { title: string; content: string; category: string }) => {
    if (!onConsolidate) return;
    await onConsolidate(Array.from(selectedIds), data);
    setConsolidatePreview(null);
    exitSelectMode();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">SOP Library</h2>
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
          <button onClick={onAddSOP} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={18} /> Add New SOP
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sops.map((sop) => {
          const isExpanded = expandedId === sop.id;
          const isSelected = selectedIds.has(sop.id);
          return (
            <div
              key={sop.id}
              onClick={isSelectMode ? () => toggleSelect(sop.id) : undefined}
              className={cn(
                "glass-card p-5 transition-colors group relative",
                isSelectMode ? "cursor-pointer" : "hover:border-indigo-300",
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
              )}
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                  {sop.category}
                </span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{sop.title}</h3>
              <div className={isExpanded ? '' : 'line-clamp-3'}>
                <MarkdownRenderer content={sop.content} className="text-sm text-slate-500 mt-1" />
              </div>
              {!isSelectMode && (
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
              )}
            </div>
          );
        })}
      </div>
      {sops.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-400">No SOPs yet. Click "Add New SOP" to create one.</div>
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
        <ConsolidateSOPPreviewModal
          result={consolidatePreview}
          selectedCount={selectedIds.size}
          onConfirm={handleConfirmConsolidate}
          onCancel={() => setConsolidatePreview(null)}
        />
      )}
    </div>
  );
};
