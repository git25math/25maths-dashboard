import { memo } from 'react';
import { CheckCircle2, Circle, Pencil, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Student } from '../../types';
import { MarkdownRenderer } from '../../components/RichTextEditor';

interface RequestsSidebarProps {
  student: Student;
  onAddRequest: (studentId: string) => void;
  onEditRequest?: (studentId: string, requestId: string, currentContent: string) => void;
  onDeleteRequest?: (studentId: string, requestId: string) => void;
  onToggleRequestStatus?: (studentId: string, requestId: string) => void;
  onUpdateRequestDate?: (studentId: string, requestId: string, field: 'date' | 'resolved_date', value: string) => void;
}

export const RequestsSidebar = memo(function RequestsSidebar({
  student,
  onAddRequest,
  onEditRequest,
  onDeleteRequest,
  onToggleRequestStatus,
  onUpdateRequestDate,
}: RequestsSidebarProps) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-bold text-lg">平时诉求 (Requests)</h3>
      <div className="space-y-3">
        {student.requests?.map(req => (
          <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 group">
            <MarkdownRenderer content={req.content} className="text-xs text-slate-700" />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <span>提出:</span>
                {onUpdateRequestDate ? (
                  <input
                    type="date"
                    value={req.date}
                    onChange={e => onUpdateRequestDate(student.id, req.id, 'date', e.target.value)}
                    className="text-[10px] text-slate-500 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-400 outline-none px-0.5 w-[95px]"
                  />
                ) : (
                  <span>{req.date}</span>
                )}
              </div>
              {req.status === 'resolved' && (
                <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                  <span>解决:</span>
                  {onUpdateRequestDate ? (
                    <input
                      type="date"
                      value={req.resolved_date || ''}
                      onChange={e => onUpdateRequestDate(student.id, req.id, 'resolved_date', e.target.value)}
                      className="text-[10px] text-emerald-500 bg-transparent border-b border-dashed border-emerald-300 focus:border-emerald-500 outline-none px-0.5 w-[95px]"
                    />
                  ) : (
                    <span>{req.resolved_date || '—'}</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {onToggleRequestStatus && (
                  <button
                    onClick={() => onToggleRequestStatus(student.id, req.id)}
                    className={cn(
                      "flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded transition-colors cursor-pointer",
                      req.status === 'resolved'
                        ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                        : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                    )}
                    title={req.status === 'pending' ? 'Mark as resolved' : 'Mark as pending'}
                  >
                    {req.status === 'resolved' ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                    {req.status}
                  </button>
                )}
                {!onToggleRequestStatus && (
                  <span className={cn(
                    "text-[10px] font-bold uppercase",
                    req.status === 'resolved' ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {req.status}
                  </span>
                )}
                {onEditRequest && (
                  <button
                    onClick={() => onEditRequest(student.id, req.id, req.content)}
                    className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Edit"
                  >
                    <Pencil size={12} />
                  </button>
                )}
                {onDeleteRequest && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this request?')) onDeleteRequest(student.id, req.id);
                    }}
                    className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {(!student.requests || student.requests.length === 0) && (
          <p className="text-sm text-slate-400 italic">No requests yet.</p>
        )}
        <button
          onClick={() => onAddRequest(student.id)}
          className="w-full btn-secondary text-xs py-2"
        >
          + New Request
        </button>
      </div>
    </div>
  );
});
