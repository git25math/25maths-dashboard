import React, { memo } from 'react';
import { MessageSquare } from 'lucide-react';
import { TeachingReflection } from '../../types';
import { RichTextEditor } from '../RichTextEditor';

interface TeachingReflectionSectionProps {
  reflection: TeachingReflection;
  onUpdate: (field: keyof TeachingReflection, value: string) => void;
}

function TeachingReflectionSectionInner({ reflection, onUpdate }: TeachingReflectionSectionProps) {
  return (
    <section className="space-y-4 border-t border-slate-100 pt-8">
      <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
        <MessageSquare size={16} className="text-rose-500" />
        教学总结及反思 Teaching Reflection
      </label>
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
        <div className="space-y-1">
          <label className="text-xs text-slate-500">上课时间 Lesson Date</label>
          <input
            type="date"
            value={reflection.lesson_date || ''}
            onChange={e => onUpdate('lesson_date', e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
          />
        </div>
        <RichTextEditor
          label="学生接受状态 Student Reception"
          value={reflection.student_reception || ''}
          onChange={val => onUpdate('student_reception', val)}
          placeholder="How well did students receive the content?"
          editorHeightClass="h-24"
          previewMinHeightClass="min-h-[6rem]"
        />
        <RichTextEditor
          label="计划讲解 Planned Content"
          value={reflection.planned_content || ''}
          onChange={val => onUpdate('planned_content', val)}
          placeholder="What was planned to be taught..."
        />
        <RichTextEditor
          label="实际讲解 Actual Content"
          value={reflection.actual_content || ''}
          onChange={val => onUpdate('actual_content', val)}
          placeholder="What was actually taught..."
        />
        <RichTextEditor
          label="下次改进方向 Improvements"
          value={reflection.improvements || ''}
          onChange={val => onUpdate('improvements', val)}
          placeholder="Areas for improvement next time..."
        />
      </div>
    </section>
  );
}

export const TeachingReflectionSection = memo(TeachingReflectionSectionInner);
