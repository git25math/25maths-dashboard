import React, { useState } from 'react';
import { X } from 'lucide-react';
import { StudentWeakness } from '../types';
import { RichTextEditor } from './RichTextEditor';

interface WeaknessFormProps {
  title: string;
  initialValue?: StudentWeakness;
  onSave: (weakness: StudentWeakness) => void;
  onCancel: () => void;
}

export const WeaknessForm = ({ title, initialValue, onSave, onCancel }: WeaknessFormProps) => {
  const [topic, setTopic] = useState(initialValue?.topic || '');
  const [level, setLevel] = useState<StudentWeakness['level']>(initialValue?.level || 'medium');
  const [notes, setNotes] = useState(initialValue?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSave({ topic: topic.trim(), level, notes });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Algebra, Trigonometry, Fractions..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Level</label>
            <div className="flex gap-3">
              {(['low', 'medium', 'high'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                    level === l
                      ? l === 'high' ? 'bg-red-50 border-red-300 text-red-600'
                        : l === 'medium' ? 'bg-amber-50 border-amber-300 text-amber-600'
                        : 'bg-blue-50 border-blue-300 text-blue-600'
                      : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {l.charAt(0).toUpperCase() + l.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <RichTextEditor
            label="Notes"
            value={notes}
            onChange={setNotes}
            placeholder="Describe the weakness details (supports Markdown and LaTeX)..."
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
