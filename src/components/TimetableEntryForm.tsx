import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Clock, BookOpen, CheckCircle2, Sparkles, FileText, Loader2, AlertTriangle, Copy, RotateCcw, Plus, ChevronDown } from 'lucide-react';
import { TimetableEntry, ClassProfile, TeachingUnit, LessonRecord, Student, HousePointAward, MeetingRecord, PrepStatus } from '../types';
import { cn } from '../lib/utils';
import { MarkdownRenderer, RichTextEditor } from './RichTextEditor';
import { HousePointAwardsEditor } from './HousePointAwardsEditor';
import { getISODay, format } from 'date-fns';
import { geminiService } from '../services/geminiService';
import { detectConflicts } from '../lib/timetableUtils';
import { getObjectiveConcept, getObjectivePrepMetrics, getObjectiveResources, getObjectiveVocabulary } from '../lib/objectivePrep';
import { sortTeachingUnits } from '../lib/teachingUnitOrder';

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

const PREP_STATUS_CONFIG: Record<PrepStatus, { label: string; color: string; next: PrepStatus }> = {
  not_prepared: { label: 'Not Prepared', color: 'bg-red-100 text-red-600 border-red-200', next: 'prepared' },
  prepared: { label: 'Prepared', color: 'bg-emerald-100 text-emerald-600 border-emerald-200', next: 'finished' },
  finished: { label: 'Finished', color: 'bg-blue-100 text-blue-600 border-blue-200', next: 'recorded' },
  recorded: { label: 'Recorded', color: 'bg-slate-100 text-slate-600 border-slate-200', next: 'not_prepared' },
};

function formatObjectiveForAI(lo: TeachingUnit['sub_units'][number]['learning_objectives'][number], unitSubUnit: TeachingUnit['sub_units'][number]) {
  const vocab = getObjectiveVocabulary(lo, unitSubUnit)
    .slice(0, 4)
    .map(v => `${v.english}${v.chinese ? `/${v.chinese}` : ''}`)
    .join(', ');
  const examples = (lo.typical_examples || []).slice(0, 1).map(ex => ex.question).join(' | ');
  const resources = getObjectiveResources(lo, unitSubUnit).length;
  const concept = getObjectiveConcept(lo, unitSubUnit);
  const fragments = [
    lo.objective,
    vocab ? `Vocab: ${vocab}` : '',
    concept ? `Concept: ${concept.slice(0, 120)}` : '',
    examples ? `Example: ${examples.slice(0, 120)}` : '',
    resources > 0 ? `Resources: ${resources}` : '',
  ].filter(Boolean);
  return fragments.join(' | ');
}

export const TimetableEntryForm = ({
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
}: TimetableEntryFormProps) => {
  const sortedTeachingUnits = useMemo(() => sortTeachingUnits(teachingUnits), [teachingUnits]);
  const [formData, setFormData] = useState<TimetableEntry>(entry);
  const [selectedClass, setSelectedClass] = useState<ClassProfile | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TeachingUnit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
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
          {/* Single-day override banner */}
          {isRecurringEntry && contextDate && !isOverrideMode && onCreateOverride && (
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <Copy size={16} className="text-amber-600" />
                <span className="text-sm text-amber-700">This is a recurring entry. Changes will affect all weeks.</span>
              </div>
              <button
                type="button"
                onClick={handleCreateOverride}
                className="px-4 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors flex items-center gap-1"
              >
                <Copy size={12} />
                Only modify {contextDate}
              </button>
            </div>
          )}

          {/* Override entry: show restore default button */}
          {isOverrideEntry && onDeleteOverride && (
            <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-2xl">
              <div className="flex items-center gap-2">
                <Copy size={16} className="text-amber-600" />
                <span className="text-sm text-amber-700">This is a single-day override for {formData.date}.</span>
              </div>
              <button
                type="button"
                onClick={handleDeleteOverride}
                className="px-4 py-1.5 bg-slate-600 text-white text-xs font-bold rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} />
                Restore Default
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Subject / Topic</label>
              <input
                type="text"
                value={formData.subject}
                onChange={e => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Topic</label>
              <input
                type="text"
                value={formData.topic || ''}
                onChange={e => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g. Quadratic Equations"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Linked Teaching Unit</label>
              <select
                value={formData.unit_id || ''}
                onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">No Unit Linked</option>
                {sortedTeachingUnits
                  .filter(u => !selectedClass || u.year_group === selectedClass.year_group)
                  .map(u => (
                    <option key={u.id} value={u.id}>{u.title} ({u.year_group})</option>
                  ))
                }
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={e => setFormData({ ...formData, room: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">End Time</label>
              <input
                type="time"
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            {!isOverrideMode && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Schedule Type</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, date: undefined })}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                      !formData.date
                        ? "bg-indigo-100 text-indigo-700 border-indigo-200"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Recurring Weekly
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, date: formData.date || format(new Date(), 'yyyy-MM-dd') })}
                    className={cn(
                      "flex-1 px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                      formData.date
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    Specific Date
                  </button>
                </div>
              </div>
            )}
            {formData.date && !isOverrideMode && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => {
                    const newDate = e.target.value;
                    const newDay = newDate ? getISODay(new Date(newDate + 'T12:00:00')) : formData.day;
                    setFormData({ ...formData, date: newDate, day: newDay });
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Preparation Status</label>
              <button
                type="button"
                onClick={() => {
                  const current: PrepStatus = formData.prep_status || (formData.is_prepared ? 'prepared' : 'not_prepared');
                  const next = PREP_STATUS_CONFIG[current].next;
                  setFormData({ ...formData, prep_status: next, is_prepared: next === 'prepared' || next === 'finished' || next === 'recorded' });
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border",
                  PREP_STATUS_CONFIG[formData.prep_status || (formData.is_prepared ? 'prepared' : 'not_prepared')].color
                )}
              >
                {(formData.prep_status === 'prepared' || formData.prep_status === 'finished' || formData.prep_status === 'recorded') ? <CheckCircle2 size={14} /> : <X size={14} />}
                {PREP_STATUS_CONFIG[formData.prep_status || (formData.is_prepared ? 'prepared' : 'not_prepared')].label}
              </button>
            </div>
          </div>

          {isMath && selectedClass && selectedUnit && (
            <div className="space-y-6 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
                <BookOpen size={16} />
                <span>Class Progress: {selectedClass.name}</span>
              </div>

              <div className="space-y-4">
                {(() => {
                  const allLOs = selectedUnit.sub_units.flatMap(su => su.learning_objectives);
                  const totalLOs = allLOs.length;
                  const completedLOs = allLOs.filter(lo => lo.status === 'completed').length;
                  const pct = totalLOs > 0 ? Math.round((completedLOs / totalLOs) * 100) : 0;
                  return (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-900">Current Unit: {selectedUnit.title}</h3>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">
                          {pct}% Complete ({completedLOs}/{totalLOs} LOs)
                        </span>
                      </div>
                      {/* SubUnit LO checklist */}
                      <div className="grid grid-cols-1 gap-2">
                        {selectedUnit.sub_units.map(su => {
                          const suTotal = su.learning_objectives.length;
                          const suCompleted = su.learning_objectives.filter(lo => lo.status === 'completed').length;
                          const suCoveredThisLesson = su.learning_objectives.filter(lo => coveredLOIds.has(lo.id)).length;
                          const isExpanded = expandedSubUnits.has(su.id);
                          return (
                            <div key={su.id} className="rounded-xl border bg-white border-indigo-200 overflow-hidden">
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={`lo-list-${su.id}`}
                                onClick={() => setExpandedSubUnits(prev => {
                                  const next = new Set(prev);
                                  next.has(su.id) ? next.delete(su.id) : next.add(su.id);
                                  return next;
                                })}
                                className="w-full flex items-center justify-between p-3 hover:bg-indigo-50/50 transition-colors"
                              >
                                <div className="text-left">
                                  <p className="text-sm font-bold text-slate-900">{su.title}</p>
                                  <p className="text-[10px] text-slate-500">
                                    {suCompleted}/{suTotal} completed
                                    {effectiveDate && <span className="text-indigo-500 ml-1">· {suCoveredThisLesson} covered this lesson</span>}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {suTotal > 0 && (
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-emerald-500 transition-all" style={{ width: `${Math.round((suCompleted / suTotal) * 100)}%` }} />
                                    </div>
                                  )}
                                  <ChevronDown size={14} className={cn("text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                                </div>
                              </button>
                              {isExpanded && su.learning_objectives.length > 0 && (
                                <div id={`lo-list-${su.id}`} className="px-3 pb-3 space-y-1 border-t border-indigo-100">
                                  {effectiveDate && (() => {
                                    const allChecked = su.learning_objectives.every(lo => coveredLOIds.has(lo.id));
                                    return (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCoveredLOIds(prev => {
                                            const next = new Set(prev);
                                            if (allChecked) {
                                              su.learning_objectives.forEach(lo => next.delete(lo.id));
                                            } else {
                                              su.learning_objectives.forEach(lo => next.add(lo.id));
                                            }
                                            return next;
                                          });
                                        }}
                                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 py-1 transition-colors"
                                      >
                                        {allChecked ? 'Clear all' : 'Select all'}
                                      </button>
                                    );
                                  })()}
                                  {su.learning_objectives.map(lo => {
                                    const isChecked = coveredLOIds.has(lo.id);
                                    const canInteract = !!effectiveDate;
                                    const prepMetrics = getObjectivePrepMetrics(lo, su);
                                    const prepVocabularyCount = prepMetrics.vocabulary.length;
                                    const prepExampleCount = prepMetrics.examples.length;
                                    const prepResourceCount = prepMetrics.resources.length;
                                    return (
                                      <label
                                        key={lo.id}
                                        className={cn(
                                          "flex items-start gap-2 p-2 rounded-lg text-xs transition-colors",
                                          canInteract ? "cursor-pointer hover:bg-indigo-50" : "cursor-default opacity-70",
                                          isChecked && "bg-indigo-50"
                                        )}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          disabled={!canInteract}
                                          onChange={() => {
                                            setCoveredLOIds(prev => {
                                              const next = new Set(prev);
                                              next.has(lo.id) ? next.delete(lo.id) : next.add(lo.id);
                                              return next;
                                            });
                                          }}
                                          className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div className="flex-1">
                                          <span className="text-slate-700">{lo.objective}</span>
                                          <div className="flex items-center gap-2 mt-0.5">
                                            <span className={cn(
                                              "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                              lo.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                              lo.status === 'in_progress' ? 'bg-amber-100 text-amber-600' :
                                              'bg-slate-100 text-slate-500'
                                            )}>
                                              {lo.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-[9px] text-slate-400">{lo.periods}p</span>
                                            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-50 text-amber-600">{prepVocabularyCount}v</span>
                                            <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-50 text-indigo-600">{prepExampleCount}e</span>
                                            <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-50 text-emerald-600">{prepResourceCount}r</span>
                                            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-500">{prepMetrics.readySections}/{prepMetrics.totalSections} prep</span>
                                            {(lo.covered_lesson_dates || []).map(d => (
                                              <span key={d} title={d} className="text-[9px] px-1 py-0.5 rounded bg-indigo-50 text-indigo-500">
                                                {d.slice(5)}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                        {selectedUnit.sub_units.length === 0 && (
                          <p className="text-xs text-slate-400 italic p-3">No sub-units defined yet.</p>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="pt-4 border-t border-indigo-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-700">AI Preparation Assistant</h4>
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={async () => {
                      setIsGenerating(true);
                      setAiError(null);
                      try {
                        const allLOs = selectedUnit.sub_units.flatMap(su => su.learning_objectives);
                        const plan = await geminiService.generateLessonPlan({
                          aiPromptTemplate: selectedUnit.ai_prompt_template || 'Generate a lesson plan for this topic.',
                          subject: formData.subject,
                          topic: formData.topic || 'the topic',
                          className: selectedClass?.name || formData.class_name,
                          yearGroup: selectedClass?.year_group || '',
                          unitTitle: selectedUnit.title,
                          unitObjectives: allLOs.map(lo => lo.objective),
                          prepMaterialTemplate: selectedUnit.prep_material_template,
                          unitTypicalExamples: selectedUnit.typical_examples,
                          subUnits: selectedUnit.sub_units.map(s => ({ title: s.title, objectives: s.learning_objectives.map(lo => formatObjectiveForAI(lo, s)) })),
                          completedObjectives: allLOs.filter(lo => lo.status === 'completed').map(lo => lo.objective),
                        });
                        setFormData(prev => ({
                          ...prev,
                          notes: (prev.notes || '') + '\n\n' + plan,
                        }));
                      } catch (err) {
                        setAiError(err instanceof Error ? err.message : 'Failed to generate plan');
                      } finally {
                        setIsGenerating(false);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1 text-xs font-bold",
                      isGenerating ? "text-slate-400 cursor-not-allowed" : "text-indigo-600 hover:underline"
                    )}
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {isGenerating ? 'Generating...' : 'Generate Plan'}
                  </button>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  {selectedUnit.ai_prompt_template ? (
                    <MarkdownRenderer content={selectedUnit.ai_prompt_template} className="text-xs text-slate-700" />
                  ) : (
                    <p className="text-xs text-slate-500 italic">No AI template defined for this unit.</p>
                  )}
                </div>
                {selectedUnit.prep_material_template && (
                  <div className="mt-3 p-4 rounded-2xl border border-amber-100 bg-amber-50/70">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-2">Prep Material Template</p>
                    <MarkdownRenderer content={selectedUnit.prep_material_template} className="text-xs text-slate-700" />
                  </div>
                )}
                {aiError && (
                  <p className="text-xs text-red-500 mt-2">{aiError}</p>
                )}
              </div>
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-amber-700">Schedule Conflict Detected</p>
                {conflicts.map((c, i) => (
                  <p key={i} className="text-xs text-amber-600">{c.message}</p>
                ))}
              </div>
            </div>
          )}

          <RichTextEditor
            label="Lesson Notes / Remarks"
            value={formData.notes || ''}
            onChange={val => setFormData({ ...formData, notes: val })}
            placeholder="Add any specific notes for this lesson..."
          />

          {/* Inline Meeting Panel */}
          {formData.type === 'meeting' && effectiveDate && (
            <div className="space-y-4 p-6 bg-purple-50/50 rounded-3xl border border-purple-100">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm uppercase tracking-widest">
                <Clock size={16} />
                <span>Meeting Record</span>
              </div>
              {(() => {
                const linked = formData.meeting_record_id
                  ? meetings.find(m => m.id === formData.meeting_record_id)
                  : null;
                if (linked) {
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                          linked.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-600"
                        )}>{linked.status}</span>
                        {linked.duration > 0 && <span className="text-slate-400 text-xs">{Math.floor(linked.duration / 60)}:{(linked.duration % 60).toString().padStart(2, '0')}</span>}
                      </div>
                      {linked.ai_summary && (
                        <p className="text-xs text-slate-600 line-clamp-2">{linked.ai_summary.summary}</p>
                      )}
                      <p className="text-[10px] text-purple-500 italic">Linked meeting record will appear in the Meetings module.</p>
                    </div>
                  );
                }
                return (
                  <p className="text-xs text-purple-500 italic">A meeting record will be auto-created when you save this entry.</p>
                );
              })()}
            </div>
          )}

          {/* Inline Lesson Record Panel */}
          {formData.type === 'lesson' && effectiveDate && (onUpdateLessonRecord || onAddLessonRecord) && (
            <div className="space-y-4 p-6 bg-teal-50/50 rounded-3xl border border-teal-100">
              <div className="flex items-center gap-2 text-teal-600 font-bold text-sm uppercase tracking-widest">
                <FileText size={16} />
                <span>Lesson Record</span>
                <span className="text-xs font-normal normal-case tracking-normal text-teal-500">
                  {effectiveDate} &middot; {formData.class_name}
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
                    onClick={handleSaveLessonRecord}
                    className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                  >
                    <Save size={12} />
                    Save Record
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateLessonRecord}
                  className="px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-1"
                >
                  <Plus size={12} />
                  Create Lesson Record
                </button>
              )}
            </div>
          )}
        </form>

        <div className="px-4 sm:px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          {formData.type === 'lesson' && (
            <div className="flex items-center gap-2 text-xs text-teal-600">
              <FileText size={14} />
              <span>Saving will auto-record to Lesson Records</span>
            </div>
          )}
          <div className={cn("flex gap-4", formData.type !== 'lesson' && "ml-auto")}>
            <button
              onClick={onCancel}
              className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Save size={20} />
              {isOverrideMode ? 'Save Override' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
