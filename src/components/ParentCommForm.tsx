import React, { useState } from 'react';
import { X, Phone, MessageCircle, Mail, Users, MoreHorizontal } from 'lucide-react';
import { ParentCommunication, ParentCommMethod } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '../lib/utils';

interface ParentCommFormProps {
  title: string;
  initialValue?: ParentCommunication;
  onSave: (data: { date: string; method: ParentCommMethod; content: string; needs_follow_up: boolean; follow_up_plan?: string }) => void;
  onCancel: () => void;
}

const METHOD_OPTIONS: { value: ParentCommMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'face-to-face', label: '面谈', icon: <Users size={14} /> },
  { value: 'phone', label: '电话', icon: <Phone size={14} /> },
  { value: 'wechat', label: '微信', icon: <MessageCircle size={14} /> },
  { value: 'email', label: '邮件', icon: <Mail size={14} /> },
  { value: 'other', label: '其他', icon: <MoreHorizontal size={14} /> },
];

export const ParentCommForm = ({ title, initialValue, onSave, onCancel }: ParentCommFormProps) => {
  const [date, setDate] = useState(initialValue?.date || new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<ParentCommMethod>(initialValue?.method || 'wechat');
  const [content, setContent] = useState(initialValue?.content || '');
  const [needsFollowUp, setNeedsFollowUp] = useState(initialValue?.needs_follow_up || false);
  const [followUpPlan, setFollowUpPlan] = useState(initialValue?.follow_up_plan || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSave({
        date,
        method,
        content: content.trim(),
        needs_follow_up: needsFollowUp,
        follow_up_plan: needsFollowUp ? followUpPlan.trim() || undefined : undefined,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-5 overflow-y-auto">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">沟通时间</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
            />
          </div>

          {/* Method */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">沟通方式</label>
            <div className="flex flex-wrap gap-2">
              {METHOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMethod(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                    method === opt.value
                      ? "bg-blue-50 border-blue-300 text-blue-600"
                      : "bg-white border-slate-200 text-slate-400 hover:border-slate-300"
                  )}
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <RichTextEditor
            label="沟通内容"
            value={content}
            onChange={setContent}
            placeholder="记录家长诉求和沟通详情 (supports Markdown and LaTeX)..."
          />

          {/* Follow-up toggle */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={needsFollowUp}
                onChange={e => setNeedsFollowUp(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-bold text-slate-700">需要后续跟进</span>
            </label>

            {needsFollowUp && (
              <div className="pl-7 space-y-2">
                <label className="text-sm font-bold text-slate-600">跟进计划</label>
                <textarea
                  value={followUpPlan}
                  onChange={e => setFollowUpPlan(e.target.value)}
                  placeholder="描述下一步跟进计划..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all text-sm"
                />
                <p className="text-[10px] text-slate-400">保存后将自动创建待办事项（标签: 家校沟通）</p>
              </div>
            )}
          </div>

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
              className="px-8 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
