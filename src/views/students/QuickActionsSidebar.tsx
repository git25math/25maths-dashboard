import { memo } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Student } from '../../types';
import { USER_CONFIG } from '../../shared/constants';

interface QuickActionsSidebarProps {
  student: Student;
  subjectReportLoading: boolean;
  parentNotesLoading: boolean;
  onGenerateSubjectReport: () => void;
  onGenerateParentNotes: () => void;
}

export const QuickActionsSidebar = memo(function QuickActionsSidebar({
  student,
  subjectReportLoading,
  parentNotesLoading,
  onGenerateSubjectReport,
  onGenerateParentNotes,
}: QuickActionsSidebarProps) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-bold text-lg">Quick Actions</h3>
      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() => window.location.href = `mailto:${USER_CONFIG.email}?subject=Missing ${student.name} from ${USER_CONFIG.room}`}
          className="w-full py-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
        >
          <AlertCircle size={16} /> Report Missing
        </button>
        <button
          onClick={onGenerateSubjectReport}
          disabled={subjectReportLoading}
          className="w-full py-3 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {subjectReportLoading ? <><Loader2 size={14} className="animate-spin" /> 生成中...</> : 'Generate Subject Report'}
        </button>
        <button
          onClick={onGenerateParentNotes}
          disabled={parentNotesLoading}
          className="w-full py-3 bg-slate-50 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {parentNotesLoading ? <><Loader2 size={14} className="animate-spin" /> 生成中...</> : 'Parent Meeting Notes'}
        </button>
      </div>
    </div>
  );
});
