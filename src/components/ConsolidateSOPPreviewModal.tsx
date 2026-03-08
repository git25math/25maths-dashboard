import React, { useState, useEffect, memo } from 'react';
import { X, Sparkles } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface ConsolidateSOPPreviewModalProps {
  result: { title: string; content: string; category: string };
  selectedCount: number;
  onConfirm: (data: { title: string; content: string; category: string }) => void;
  onCancel: () => void;
}

export const ConsolidateSOPPreviewModal = memo(function ConsolidateSOPPreviewModal({ result, selectedCount, onConfirm, onCancel }: ConsolidateSOPPreviewModalProps) {
  const [title, setTitle] = useState(result.title);
  const [content, setContent] = useState(result.content);
  const [category, setCategory] = useState(result.category);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onConfirm({ title, content, category });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-4 sm:px-8 py-6 border-b border-purple-100 flex justify-between items-center bg-purple-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles size={16} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Consolidated SOP</h2>
              <p className="text-xs text-purple-500 font-medium">{selectedCount} SOPs merged into 1</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-purple-100 rounded-full transition-colors">
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
              placeholder="Consolidated SOP title"
              className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            >
              {['General', 'Communication', 'Teaching', 'Tutor', 'Emergency', 'Admin'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <RichTextEditor
            label="Procedure Steps"
            value={content}
            onChange={setContent}
            placeholder="Consolidated procedure steps..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2 bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center gap-2">
              <Sparkles size={16} />
              Confirm & Replace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});
