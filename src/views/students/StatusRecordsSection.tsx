import { memo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Student } from '../../types';
import { MarkdownRenderer } from '../../components/RichTextEditor';

interface StatusRecordsSectionProps {
  student: Student;
  onAddStatusRecord: (studentId: string) => void;
  onEditStatusRecord?: (studentId: string, recordId: string, currentContent: string) => void;
  onDeleteStatusRecord?: (studentId: string, recordId: string) => void;
}

export const StatusRecordsSection = memo(function StatusRecordsSection({
  student,
  onAddStatusRecord,
  onEditStatusRecord,
  onDeleteStatusRecord,
}: StatusRecordsSectionProps) {
  return (
    <section className="space-y-4">
      <h3 className="font-bold text-lg border-b border-slate-100 pb-2">学习状况记录 (Learning Status)</h3>
      <div className="space-y-4">
        {student.status_records?.map(record => (
          <div key={record.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 group">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{record.date}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-500">
                  {record.category}
                </span>
                {onEditStatusRecord && (
                  <button
                    onClick={() => onEditStatusRecord(student.id, record.id, record.content)}
                    className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </button>
                )}
                {onDeleteStatusRecord && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this status record?')) onDeleteStatusRecord(student.id, record.id);
                    }}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
            <MarkdownRenderer content={record.content} className="text-sm text-slate-700 leading-relaxed" />
          </div>
        ))}
        {(!student.status_records || student.status_records.length === 0) && (
          <p className="text-sm text-slate-400 italic">No status records found.</p>
        )}
        <button
          onClick={() => onAddStatusRecord(student.id)}
          className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all"
        >
          + Add Status Record
        </button>
      </div>
    </section>
  );
});
