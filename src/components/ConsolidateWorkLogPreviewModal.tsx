import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkLog } from '../types';
import { RichTextEditor } from './RichTextEditor';

const CATEGORIES: { value: WorkLog['category']; label: string }[] = [
  { value: 'teaching', label: 'Teaching' },
  { value: 'tutor', label: 'Tutor' },
  { value: 'admin', label: 'Admin' },
  { value: 'startup', label: 'Startup' },
  { value: 'other', label: 'Other' },
];

interface ConsolidateWorkLogPreviewModalProps {
  result: { content: string; category: WorkLog['category']; tags: string[] };
  selectedCount: number;
  onConfirm: (data: { content: string; category: WorkLog['category']; tags?: string[] }) => void;
  onCancel: () => void;
}

export const ConsolidateWorkLogPreviewModal = ({ result, selectedCount, onConfirm, onCancel }: ConsolidateWorkLogPreviewModalProps) => {
  const [content, setContent] = useState(result.content);
  const [category, setCategory] = useState<WorkLog['category']>(result.category);
  const [tagInput, setTagInput] = useState(result.tags.join(', '));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    const tags = tagInput.trim() ? tagInput.split(',').map(t => t.trim()).filter(Boolean) : undefined;
    onConfirm({ content, category, tags });
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
              <h2 className="text-xl font-bold text-slate-900">AI Consolidated Work Log</h2>
              <p className="text-xs text-purple-500 font-medium">{selectedCount} logs merged into 1</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-purple-100 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                    category === cat.value
                      ? "bg-purple-50 border-purple-200 text-purple-600"
                      : "bg-white border-slate-200 text-slate-400 hover:text-slate-600"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <RichTextEditor
            label="Content"
            value={content}
            onChange={setContent}
            placeholder="Consolidated work log content..."
          />

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tags (comma-separated)</label>
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              placeholder="e.g. Y10, Homework, Meeting"
              className="w-full px-4 py-3 rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>

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
};
