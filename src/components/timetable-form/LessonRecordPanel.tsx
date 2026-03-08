import React, { memo } from 'react';
import { FileText, Save, Plus } from 'lucide-react';
import { LessonRecord, Student, HousePointAward } from '../../types';
import { RichTextEditor } from '../RichTextEditor';
import { HousePointAwardsEditor } from '../HousePointAwardsEditor';

interface LessonRecordPanelProps {
  effectiveDate: string;
  className: string;
  matchedLessonRecord: LessonRecord | null;
  lrForm: Partial<LessonRecord>;
  setLrForm: React.Dispatch<React.SetStateAction<Partial<LessonRecord>>>;
  lrAwards: HousePointAward[];
  setLrAwards: React.Dispatch<React.SetStateAction<HousePointAward[]>>;
  classStudents: Student[];
  onSaveLessonRecord: () => void;
  onCreateLessonRecord: () => void;
}

export const LessonRecordPanel = memo(function LessonRecordPanel({
  effectiveDate,
  className,
  matchedLessonRecord,
  lrForm,
  setLrForm,
  lrAwards,
  setLrAwards,
  classStudents,
  onSaveLessonRecord,
  onCreateLessonRecord,
}: LessonRecordPanelProps) {
  return (
    <div className="space-y-4 p-6 bg-teal-50/50 rounded-3xl border border-teal-100">
      <div className="flex items-center gap-2 text-teal-600 font-bold text-sm uppercase tracking-widest">
        <FileText size={16} />
        <span>Lesson Record</span>
        <span className="text-xs font-normal normal-case tracking-normal text-teal-500">
          {effectiveDate} &middot; {className}
        </span>
      </div>

      {matchedLessonRecord ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <RichTextEditor
                label="Progress"
                value={lrForm.progress || ''}
                onChange={val => setLrForm(prev => ({ ...prev, progress: val }))}
                placeholder="What was covered... Supports Markdown and LaTeX..."
                editorHeightClass="h-24"
                previewMinHeightClass="min-h-[6rem]"
              />
            </div>
            <div className="space-y-1">
              <RichTextEditor
                label="Homework Assigned"
                value={lrForm.homework_assigned || ''}
                onChange={val => setLrForm(prev => ({ ...prev, homework_assigned: val }))}
                placeholder="Homework details... Supports Markdown and LaTeX..."
                editorHeightClass="h-24"
                previewMinHeightClass="min-h-[6rem]"
              />
            </div>
            <div className="md:col-span-2">
              <RichTextEditor
                label="Next Lesson Plan"
                value={lrForm.next_lesson_plan || ''}
                onChange={val => setLrForm(prev => ({ ...prev, next_lesson_plan: val }))}
                placeholder="Plan for next lesson (supports Markdown and LaTeX)..."
              />
            </div>
            {classStudents.length > 0 && (
              <div className="md:col-span-2 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                <HousePointAwardsEditor
                  awards={lrAwards}
                  onChange={setLrAwards}
                  students={classStudents}
                />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onSaveLessonRecord}
            className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
          >
            <Save size={12} />
            Save Record
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onCreateLessonRecord}
          className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
        >
          <Plus size={12} />
          Create Lesson Record
        </button>
      )}
    </div>
  );
});
