import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Clock, BookOpen, CheckCircle2, Sparkles, FileText, Loader2, AlertTriangle } from 'lucide-react';
import { TimetableEntry, ClassProfile, TeachingUnit, LessonPlanItem } from '../types';
import { cn } from '../lib/utils';
import { RichTextEditor } from './RichTextEditor';
import { getISODay, format } from 'date-fns';
import { geminiService } from '../services/geminiService';
import { detectConflicts } from '../lib/timetableUtils';

interface TimetableEntryFormProps {
  entry: TimetableEntry;
  classes: ClassProfile[];
  teachingUnits: TeachingUnit[];
  allEntries: TimetableEntry[];
  onSave: (entry: TimetableEntry) => void;
  onCancel: () => void;
  onUpdateClassProgress?: (classId: string, lessonId: string, completed: boolean) => void;
}

export const TimetableEntryForm = ({
  entry,
  classes,
  teachingUnits,
  allEntries,
  onSave,
  onCancel,
  onUpdateClassProgress
}: TimetableEntryFormProps) => {
  const [formData, setFormData] = useState<TimetableEntry>(entry);
  const [selectedClass, setSelectedClass] = useState<ClassProfile | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TeachingUnit | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const conflicts = useMemo(
    () => detectConflicts(formData, allEntries),
    [formData.start_time, formData.end_time, formData.day, formData.date, allEntries]
  );

  useEffect(() => {
    if (formData.class_id) {
      const cls = classes.find(c => c.id === formData.class_id);
      setSelectedClass(cls || null);
      
      // If no unit is explicitly set on the entry, use the class's current unit
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
    onSave(formData);
  };

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
              <h2 className="text-2xl font-bold text-slate-900">Edit Schedule</h2>
              <p className="text-sm text-slate-500">{formData.start_time} - {formData.end_time} • {formData.class_name}</p>
            </div>
          </div>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1">
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
                {teachingUnits
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
            {formData.date && (
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
                onClick={() => setFormData({ ...formData, is_prepared: !formData.is_prepared })}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2",
                  formData.is_prepared 
                    ? "bg-emerald-100 text-emerald-600 border border-emerald-200" 
                    : "bg-red-100 text-red-600 border border-red-200"
                )}
              >
                {formData.is_prepared ? <CheckCircle2 size={14} /> : <X size={14} />}
                {formData.is_prepared ? 'Prepared' : 'Not Prepared'}
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
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">Current Unit: {selectedUnit.title}</h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">
                    {Math.round(((selectedClass.completed_lesson_ids?.length || 0) / selectedUnit.lessons.length) * 100)}% Complete
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {selectedUnit.lessons.map((lesson, i) => {
                    const isCompleted = selectedClass.completed_lesson_ids?.includes(lesson.id);
                    return (
                      <div 
                        key={lesson.id}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all",
                          isCompleted ? "bg-white border-indigo-200" : "bg-slate-50 border-slate-200 opacity-70"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => onUpdateClassProgress?.(selectedClass.id, lesson.id, !isCompleted)}
                            className={cn(
                              "w-5 h-5 rounded border flex items-center justify-center transition-all",
                              isCompleted ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-slate-300"
                            )}
                          >
                            {isCompleted && <CheckCircle2 size={12} />}
                          </button>
                          <div>
                            <p className="text-sm font-bold text-slate-900">L{i+1}: {lesson.title}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                        const plan = await geminiService.generateLessonPlan({
                          aiPromptTemplate: selectedUnit.ai_prompt_template || 'Generate a lesson plan for this topic.',
                          subject: formData.subject,
                          topic: formData.topic || 'the topic',
                          className: selectedClass?.name || formData.class_name,
                          yearGroup: selectedClass?.year_group || '',
                          unitTitle: selectedUnit.title,
                          unitObjectives: selectedUnit.learning_objectives,
                          subUnits: selectedUnit.sub_units?.map(s => ({ title: s.title, objectives: s.objectives })),
                          completedLessons: selectedClass?.completed_lesson_ids
                            ? selectedUnit.lessons
                                .filter(l => selectedClass.completed_lesson_ids!.includes(l.id))
                                .map(l => l.title)
                            : [],
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
                <div className="p-4 bg-slate-900 rounded-2xl text-xs font-mono text-indigo-300 leading-relaxed">
                  {selectedUnit.ai_prompt_template || "No AI template defined for this unit."}
                </div>
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
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
