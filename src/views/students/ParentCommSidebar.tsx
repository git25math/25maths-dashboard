import { memo } from 'react';
import { CheckCircle2, Circle, Mail, MessageCircle, MessageSquare, MoreHorizontal, Pencil, Phone, Trash2, Users } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Student, ParentCommunication } from '../../types';
import { MarkdownRenderer } from '../../components/RichTextEditor';

interface ParentCommSidebarProps {
  student: Student;
  onAddParentComm: (studentId: string) => void;
  onEditParentComm?: (studentId: string, comm: ParentCommunication) => void;
  onAddParentCommFollowUp?: (studentId: string, commId: string) => void;
  onDeleteParentComm?: (studentId: string, commId: string) => void;
  onToggleParentCommStatus?: (studentId: string, commId: string) => void;
  onUpdateParentCommDate?: (studentId: string, commId: string, field: 'date' | 'resolved_date', value: string) => void;
}

export const ParentCommSidebar = memo(function ParentCommSidebar({
  student,
  onAddParentComm,
  onEditParentComm,
  onAddParentCommFollowUp,
  onDeleteParentComm,
  onToggleParentCommStatus,
  onUpdateParentCommDate,
}: ParentCommSidebarProps) {
  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <MessageSquare size={18} className="text-blue-500" /> 家校沟通 (Parent Comm.)
      </h3>
      <div className="space-y-3">
        {student.parent_communications?.map(comm => {
          const methodIcon = comm.method === 'phone' ? <Phone size={10} />
            : comm.method === 'wechat' ? <MessageCircle size={10} />
            : comm.method === 'email' ? <Mail size={10} />
            : comm.method === 'face-to-face' ? <Users size={10} />
            : <MoreHorizontal size={10} />;
          const methodLabel = comm.method === 'face-to-face' ? '面谈'
            : comm.method === 'phone' ? '电话'
            : comm.method === 'wechat' ? '微信'
            : comm.method === 'email' ? '邮件'
            : '其他';
          return (
            <div key={comm.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 group">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  {onUpdateParentCommDate ? (
                    <input
                      type="date"
                      value={comm.date}
                      onChange={e => onUpdateParentCommDate(student.id, comm.id, 'date', e.target.value)}
                      className="text-[10px] text-slate-500 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-400 outline-none px-0.5 w-[95px]"
                    />
                  ) : (
                    <span>{comm.date}</span>
                  )}
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  {methodIcon} {methodLabel}
                </span>
                {comm.status === 'resolved' && comm.resolved_date && (
                  <div className="flex items-center gap-1 text-[10px] text-emerald-500">
                    <span>解决:</span>
                    {onUpdateParentCommDate ? (
                      <input
                        type="date"
                        value={comm.resolved_date}
                        onChange={e => onUpdateParentCommDate(student.id, comm.id, 'resolved_date', e.target.value)}
                        className="text-[10px] text-emerald-500 bg-transparent border-b border-dashed border-emerald-300 focus:border-emerald-500 outline-none px-0.5 w-[95px]"
                      />
                    ) : (
                      <span>{comm.resolved_date}</span>
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  {onToggleParentCommStatus && (
                    <button
                      onClick={() => onToggleParentCommStatus(student.id, comm.id)}
                      className={cn(
                        "flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded transition-colors cursor-pointer",
                        comm.status === 'resolved'
                          ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          : "text-amber-600 bg-amber-50 hover:bg-amber-100"
                      )}
                      title={comm.status === 'pending' ? 'Mark as resolved' : 'Mark as pending'}
                    >
                      {comm.status === 'resolved' ? <CheckCircle2 size={10} /> : <Circle size={10} />}
                      {comm.status}
                    </button>
                  )}
                  {onEditParentComm && (
                    <button
                      onClick={() => onEditParentComm(student.id, comm)}
                      className="p-1 text-slate-300 hover:text-indigo-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                  {onDeleteParentComm && (
                    <button
                      onClick={() => {
                        if (confirm('Delete this communication record?')) onDeleteParentComm(student.id, comm.id);
                      }}
                      className="p-1 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              <MarkdownRenderer content={comm.content} className="text-xs text-slate-700" />
              {comm.needs_follow_up && comm.follow_up_plan && (
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-1">跟进计划</p>
                  <MarkdownRenderer content={comm.follow_up_plan} className="text-xs text-amber-700 [&_p]:m-0" />
                </div>
              )}
              {comm.follow_ups && comm.follow_ups.length > 0 && (
                <div className="space-y-1.5 pl-3 border-l-2 border-blue-200">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">跟进记录</p>
                  {comm.follow_ups.map((fu, idx) => (
                    <div key={idx} className="text-xs text-slate-600">
                      <span className="text-[10px] text-slate-400 font-mono mr-2">{fu.date}</span>
                      <MarkdownRenderer content={fu.content} className="inline-block text-xs text-slate-600 [&_p]:inline [&_p]:m-0" />
                    </div>
                  ))}
                </div>
              )}
              {comm.needs_follow_up && onAddParentCommFollowUp && (
                <button
                  onClick={() => onAddParentCommFollowUp(student.id, comm.id)}
                  className="text-[10px] font-bold text-blue-500 hover:underline"
                >
                  + 追加跟进记录
                </button>
              )}
            </div>
          );
        })}
        {(!student.parent_communications || student.parent_communications.length === 0) && (
          <p className="text-sm text-slate-400 italic">No communication records yet.</p>
        )}
        <button
          onClick={() => onAddParentComm(student.id)}
          className="w-full btn-secondary text-xs py-2"
        >
          + 新增沟通记录
        </button>
      </div>
    </div>
  );
});
