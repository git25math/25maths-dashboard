import React, { memo, useState, useEffect, useMemo } from 'react';
import { X, Clock } from 'lucide-react';
import { TimetableEntry, ClassProfile, TeachingUnit, LessonRecord, Student, HousePointAward, MeetingRecord } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { getISODay } from 'date-fns';
import { detectConflicts } from '../lib/timetableUtils';
import { sortTeachingUnits } from '../lib/teachingUnitOrder';
import {
  OverrideBanners,
  FormFieldsGrid,
  PrepStatusToggle,
  ClassProgressPanel,
  ConflictWarning,
  MeetingRecordPanel,
  LessonRecordPanel,
  FormFooter,
} from './timetable-form';

interface TimetableEntryFormProps {
  entry: TimetableEntry;
  classes: ClassProfile[];
  teachingUnits: TeachingUnit[];
  allEntries: TimetableEntry[];
  onSave: (entry: TimetableEntry) => void;
  onCancel: () => void;
  // onUpdateClassProgress removed — class progress is now tracked via SubUnit LOs
  contextDate?: string;
  onCreateOverride?: (entry: TimetableEntry) => void;
  onDeleteOverride?: (id: string) => void;
  lessonRecords?: LessonRecord[];
  onUpdateLessonRecord?: (id: string, updates: Partial<LessonRecord>) => void;
  onAddLessonRecord?: (data: Omit<LessonRecord, 'id'>) => void;
  students?: Student[];
  meetings?: MeetingRecord[];
  onSaveUnit?: (unit: TeachingUnit) => void;
}

export const TimetableEntryForm = memo(function TimetableEntryForm({
  entry,
  classes,
  teachingUnits,
  allEntries,
  onSave,
  onCancel,
  contextDate,
  onCreateOverride,
  onDeleteOverride,
  lessonRecords = [],
  onUpdateLessonRecord,
  onAddLessonRecord,
  students = [],
  meetings = [],
  onSaveUnit,
}: TimetableEntryFormProps) {
  const sortedTeachingUnits = useMemo(() => sortTeachingUnits(teachingUnits), [teachingUnits]);
  const [formData, setFormData] = useState<TimetableEntry>(entry);
  const [selectedClass, setSelectedClass] = useState<ClassProfile | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TeachingUnit | null>(null);
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  // Inline lesson record state
  const [lrForm, setLrForm] = useState<Partial<LessonRecord>>({});
  const [isCreatingLR, setIsCreatingLR] = useState(false);
  const [lrAwards, setLrAwards] = useState<HousePointAward[]>([]);

  // LO coverage tracking
  const [coveredLOIds, setCoveredLOIds] = useState<Set<string>>(new Set());
  const [expandedSubUnits, setExpandedSubUnits] = useState<Set<string>>(new Set());

  const conflicts = useMemo(
    () => detectConflicts(formData, allEntries),
    [formData.start_time, formData.end_time, formData.day, formData.date, allEntries]
  );

  // Find matching lesson record
  const effectiveDate = formData.date || contextDate;

  // Init LO coverage from unit data
  useEffect(() => {
    if (!selectedUnit || !effectiveDate) { setCoveredLOIds(new Set()); return; }
    const date = effectiveDate;
    const ids = new Set<string>();
    selectedUnit.sub_units.forEach(su => {
      su.learning_objectives.forEach(lo => {
        if (lo.covered_lesson_dates?.includes(date)) ids.add(lo.id);
      });
    });
    setCoveredLOIds(ids);
  }, [selectedUnit, effectiveDate]);

  const matchedLessonRecord = useMemo(() => {
    if (!effectiveDate || formData.type !== 'lesson') return null;
    // First try timetable_entry_id match
    const byEntryId = lessonRecords.find(r => r.timetable_entry_id === formData.id);
    if (byEntryId) return byEntryId;
    // Fallback: date + class_name match
    return lessonRecords.find(r => r.date === effectiveDate && r.class_name === formData.class_name) || null;
  }, [lessonRecords, formData.id, formData.type, formData.class_name, effectiveDate]);

  // Init lrForm when matchedLessonRecord changes
  useEffect(() => {
    if (matchedLessonRecord) {
      setLrForm({
        progress: matchedLessonRecord.progress,
        homework_assigned: matchedLessonRecord.homework_assigned,
        next_lesson_plan: matchedLessonRecord.next_lesson_plan,
      });
      setLrAwards(matchedLessonRecord.house_point_awards || []);
    }
  }, [matchedLessonRecord]);

  useEffect(() => {
    if (formData.class_id) {
      const cls = classes.find(c => c.id === formData.class_id);
      setSelectedClass(cls || null);

      if (!formData.unit_id && cls?.current_unit_id) {
        setFormData(prev => ({ ...prev, unit_id: cls.current_unit_id }));
      }
    }
  }, [formData.class_id, classes]);

  useEffect(() => {
    if (formData.unit_id) {
      const unit = teachingUnits.find(u => u.id === formData.unit_id);
      setSelectedUnit(unit || null);
    } else {
      setSelectedUnit(null);
    }
  }, [formData.unit_id, teachingUnits]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverrideMode && onCreateOverride) {
      onCreateOverride(formData);
    } else {
      onSave(formData);
    }
    // Save LO coverage changes
    if (onSaveUnit && selectedUnit && effectiveDate) {
      const date = effectiveDate;
      const updatedUnit = {
        ...selectedUnit,
        sub_units: selectedUnit.sub_units.map(su => ({
          ...su,
          learning_objectives: su.learning_objectives.map(lo => {
            const wasChecked = lo.covered_lesson_dates?.includes(date);
            const isChecked = coveredLOIds.has(lo.id);
            if (wasChecked === isChecked) return lo;
            const dates = [...(lo.covered_lesson_dates || [])];
            if (isChecked && !wasChecked) dates.push(date);
            if (!isChecked && wasChecked) dates.splice(dates.indexOf(date), 1);
            const uniqueDates = [...new Set(dates)].sort();
            return { ...lo, covered_lesson_dates: uniqueDates };
          }),
        })),
      };
      onSaveUnit(updatedUnit);
    }
  };

  const handleCreateOverride = () => {
    if (!contextDate) return;
    const newId = `tt-override-${Date.now()}`;
    const isoDay = getISODay(new Date(contextDate + 'T12:00:00'));
    setFormData(prev => ({
      ...prev,
      id: newId,
      date: contextDate,
      day: isoDay,
      recurring_id: entry.id,
    }));
    setIsOverrideMode(true);
  };

  const handleDeleteOverride = () => {
    if (onDeleteOverride && formData.recurring_id) {
      onDeleteOverride(formData.id);
    }
  };

  const handleSaveLessonRecord = () => {
    if (matchedLessonRecord && onUpdateLessonRecord) {
      onUpdateLessonRecord(matchedLessonRecord.id, { ...lrForm, house_point_awards: lrAwards });
    }
  };

  const handleCreateLessonRecord = () => {
    if (!onAddLessonRecord || !effectiveDate) return;
    onAddLessonRecord({
      date: effectiveDate,
      class_name: formData.class_name,
      topic: formData.topic || formData.subject || '',
      progress: '',
      homework_assigned: '',
      notes: formData.notes || '',
      next_lesson_plan: '',
      timetable_entry_id: formData.id,
      house_point_awards: lrAwards,
    });
    setIsCreatingLR(false);
  };

  // Students filtered by class for awards editor
  const classStudents = students.filter(s => s.class_name === formData.class_name);

  const isRecurringEntry = !entry.date && !entry.recurring_id;
  const isOverrideEntry = !!entry.recurring_id;
  const isMath = formData.subject.toLowerCase().includes('math');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Clock size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">Edit Schedule</h2>
                {(isOverrideEntry || isOverrideMode) && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    Override
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{formData.start_time} - {formData.end_time} • {formData.class_name}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1">
          <OverrideBanners
            isRecurringEntry={isRecurringEntry}
            isOverrideEntry={isOverrideEntry}
            isOverrideMode={isOverrideMode}
            contextDate={contextDate}
            formDate={formData.date}
            onCreateOverride={handleCreateOverride}
            onDeleteOverride={handleDeleteOverride}
            hasCreateOverrideHandler={!!onCreateOverride}
            hasDeleteOverrideHandler={!!onDeleteOverride}
          />

          <FormFieldsGrid
            formData={formData}
            setFormData={setFormData}
            selectedClass={selectedClass}
            sortedTeachingUnits={sortedTeachingUnits}
            isOverrideMode={isOverrideMode}
          />

          <PrepStatusToggle formData={formData} setFormData={setFormData} />

          {isMath && selectedClass && selectedUnit && (
            <ClassProgressPanel
              selectedClass={selectedClass}
              selectedUnit={selectedUnit}
              formData={formData}
              setFormData={setFormData}
              effectiveDate={effectiveDate}
              coveredLOIds={coveredLOIds}
              setCoveredLOIds={setCoveredLOIds}
              expandedSubUnits={expandedSubUnits}
              setExpandedSubUnits={setExpandedSubUnits}
            />
          )}

          <ConflictWarning conflicts={conflicts} />

          <RichTextEditor
            label="Lesson Notes / Remarks"
            value={formData.notes || ''}
            onChange={val => setFormData({ ...formData, notes: val })}
            placeholder="Add any specific notes for this lesson..."
          />

          {formData.type === 'meeting' && effectiveDate && (
            <MeetingRecordPanel
              meetingRecordId={formData.meeting_record_id}
              meetings={meetings}
            />
          )}

          {formData.type === 'lesson' && effectiveDate && (onUpdateLessonRecord || onAddLessonRecord) && (
            <LessonRecordPanel
              effectiveDate={effectiveDate}
              className={formData.class_name}
              matchedLessonRecord={matchedLessonRecord}
              lrForm={lrForm}
              setLrForm={setLrForm}
              lrAwards={lrAwards}
              setLrAwards={setLrAwards}
              classStudents={classStudents}
              onSaveLessonRecord={handleSaveLessonRecord}
              onCreateLessonRecord={handleCreateLessonRecord}
            />
          )}
        </form>

        <FormFooter
          isLesson={formData.type === 'lesson'}
          isOverrideMode={isOverrideMode}
          onCancel={onCancel}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
});
