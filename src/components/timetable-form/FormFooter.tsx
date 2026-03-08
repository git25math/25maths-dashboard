import React, { memo } from 'react';
import { Save, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';

interface FormFooterProps {
  isLesson: boolean;
  isOverrideMode: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const FormFooter = memo(function FormFooter({
  isLesson,
  isOverrideMode,
  onCancel,
  onSubmit,
}: FormFooterProps) {
  return (
    <div className="px-4 sm:px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
      {isLesson && (
        <div className="flex items-center gap-2 text-xs text-teal-600">
          <FileText size={14} />
          <span>Saving will auto-record to Lesson Records</span>
        </div>
      )}
      <div className={cn("flex gap-4", !isLesson && "ml-auto")}>
        <button
          onClick={onCancel}
          className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onSubmit}
          className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Save size={20} />
          {isOverrideMode ? 'Save Override' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
});
