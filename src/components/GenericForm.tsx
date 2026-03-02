import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface GenericFormProps {
  title: string;
  label: string;
  initialValue?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export const GenericForm = ({ title, label, initialValue = '', onSave, onCancel, placeholder }: GenericFormProps) => {
  const [content, setContent] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave(content);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-700/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6">
          <RichTextEditor 
            label={label}
            value={content}
            onChange={setContent}
            placeholder={placeholder}
          />
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
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
