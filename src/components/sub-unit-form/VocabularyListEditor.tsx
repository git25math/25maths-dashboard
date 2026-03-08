import React, { memo } from 'react';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import { VocabularyItem } from '../../types';

interface VocabularyListEditorProps {
  vocabulary: VocabularyItem[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof VocabularyItem, value: string) => void;
  onRemove: (index: number) => void;
}

function VocabularyListEditorInner({ vocabulary, onAdd, onUpdate, onRemove }: VocabularyListEditorProps) {
  return (
    <section className="space-y-4 border-t border-slate-100 pt-8">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={16} className="text-amber-500" />
          双语核心词汇 Vocabulary
        </label>
        <button type="button" onClick={onAdd} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
          <Plus size={14} /> Add
        </button>
      </div>
      <div className="space-y-2">
        {vocabulary.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={v.english}
              onChange={e => onUpdate(i, 'english', e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="English"
            />
            <input
              type="text"
              value={v.chinese}
              onChange={e => onUpdate(i, 'chinese', e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
              placeholder="中文"
            />
            <button type="button" onClick={() => onRemove(i)} className="p-2 text-red-400 hover:text-red-600">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export const VocabularyListEditor = memo(VocabularyListEditorInner);
