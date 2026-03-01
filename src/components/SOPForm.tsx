import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SOP } from '../types';
import { RichTextEditor } from './RichTextEditor';

interface SOPFormProps {
  sop?: SOP | null;
  onSave: (data: { title: string; category: string; content: string }) => void;
  onCancel: () => void;
}

export const SOPForm = ({ sop, onSave, onCancel }: SOPFormProps) => {
  const [title, setTitle] = useState(sop?.title || '');
  const [category, setCategory] = useState(sop?.category || 'General');
  const [content, setContent] = useState(sop?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ title, category, content });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">{sop ? 'Edit SOP' : 'New SOP'}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Title</label>
            <input
              required
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="SOP title"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
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
            placeholder="1. First step... 2. Second step..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onCancel} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
              {sop ? 'Update SOP' : 'Save SOP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
