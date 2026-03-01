import { useState, useEffect } from 'react';
import { Plus, ChevronRight, CheckCircle2, Clock, BookOpen, ExternalLink, Lightbulb, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { TeachingUnit, ClassProfile, LessonPlanItem } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { YEAR_GROUPS } from '../shared/constants';

interface TeachingViewProps {
  teachingUnits: TeachingUnit[];
  onOpenSyllabus: () => void;
  initialUnitId: string | null;
  onClearInitialUnit: () => void;
  onAddUnit: () => void;
  onUpdateUnit: (id: string) => void;
  onDeleteUnit: (id: string) => void;
  classes: ClassProfile[];
  onUpdateClassProgress: (classId: string, lessonId: string, completed: boolean) => void;
  onUpdateClass: (id: string) => void;
  onToast?: (message: string) => void;
}

export const TeachingView = ({
  teachingUnits,
  onOpenSyllabus,
  initialUnitId,
  onClearInitialUnit,
  onAddUnit,
  onUpdateUnit,
  onDeleteUnit,
  classes,
  onUpdateClassProgress,
  onUpdateClass,
  onToast
}: TeachingViewProps) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TeachingUnit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlanItem | null>(null);

  useEffect(() => {
    if (initialUnitId) {
      const unit = teachingUnits.find(u => u.id === initialUnitId);
      if (unit) {
        setSelectedUnit(unit);
        setSelectedYear(unit.year_group);
      }
      onClearInitialUnit();
    }
  }, [initialUnitId, onClearInitialUnit, teachingUnits]);

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      onToast?.('Prompt copied to clipboard!');
    });
  };

  if (selectedLesson && selectedUnit) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to {selectedUnit.title}
        </button>

        <div className="glass-card p-8 space-y-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">{selectedLesson.title}</h2>
            <p className="text-slate-500">Lesson Plan & Resources</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-emerald-500" />
                  Lesson Objectives
                </h3>
                <ul className="space-y-2">
                  {selectedLesson.objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                      <MarkdownRenderer content={obj} />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Clock size={20} className="text-indigo-500" />
                  Activities
                </h3>
                <div className="space-y-3">
                  {selectedLesson.activities.map((act, i) => (
                    <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <MarkdownRenderer content={act} className="text-sm text-slate-700" />
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <BookOpen size={20} className="text-amber-500" />
                  Resources
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedLesson.resources?.map((res, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-sm">
                      <span className="text-slate-700">{res}</span>
                      <ExternalLink size={14} className="text-slate-400" />
                    </div>
                  ))}
                  {(!selectedLesson.resources || selectedLesson.resources.length === 0) && (
                    <p className="text-sm text-slate-400 italic">No specific resources listed for this lesson.</p>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedUnit) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedUnit(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to {selectedYear}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                    {selectedUnit.year_group}
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 mt-2">{selectedUnit.title}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onUpdateUnit(selectedUnit.id)}
                    className="btn-secondary text-xs"
                  >
                    Edit Unit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this unit?')) {
                        onDeleteUnit(selectedUnit.id);
                        setSelectedUnit(null);
                      }
                    }}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <section className="space-y-4">
                <h3 className="font-bold text-lg">教学目标 (Learning Objectives)</h3>
                <ul className="space-y-2">
                  {selectedUnit.learning_objectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                      <MarkdownRenderer content={obj} />
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg">课时拆分 (Lesson Breakdown)</h3>
                <div className="grid grid-cols-1 gap-3">
                  {selectedUnit.lessons.map((lesson, i) => {
                    const unitClasses = classes.filter(c => c.current_unit_id === selectedUnit.id);
                    return (
                      <div key={lesson.id} className="space-y-2">
                        <button
                          onClick={() => setSelectedLesson(lesson)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all text-left group"
                        >
                          <div>
                            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Lesson {i + 1}</p>
                            <p className="font-bold text-slate-900">{lesson.title}</p>
                          </div>
                          <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
                        </button>

                        {unitClasses.length > 0 && (
                          <div className="flex flex-wrap gap-2 px-2">
                            {unitClasses.map(cls => {
                              const isCompleted = cls.completed_lesson_ids?.includes(lesson.id);
                              return (
                                <button
                                  key={cls.id}
                                  onClick={() => onUpdateClassProgress(cls.id, lesson.id, !isCompleted)}
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all flex items-center gap-1",
                                    isCompleted
                                      ? "bg-indigo-600 border-indigo-600 text-white"
                                      : "bg-white border-slate-200 text-slate-400"
                                  )}
                                >
                                  {isCompleted && <CheckCircle2 size={8} />}
                                  {cls.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="font-bold text-lg">典型例题 (Typical Examples)</h3>
                <div className="space-y-4">
                  {selectedUnit.typical_examples.map((ex, i) => (
                    <div key={i} className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
                      <div className="font-bold text-indigo-900 text-sm flex gap-2">
                        <span className="shrink-0">Q:</span>
                        <MarkdownRenderer content={ex.question} />
                      </div>
                      <div className="text-sm text-slate-600 pl-4 border-l-2 border-indigo-200 flex gap-2">
                        <span className="shrink-0">A:</span>
                        <MarkdownRenderer content={ex.solution} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="glass-card p-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">教学总结 (Teaching Summary)</h3>
                <button disabled className="flex items-center gap-2 text-slate-400 text-sm font-bold cursor-not-allowed" title="Coming Soon">
                  <Lightbulb size={16} /> AI Summary
                </button>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                {selectedUnit.teaching_summary || "No summary recorded for this unit yet."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">资料库 (Resources)</h3>
              <div className="space-y-2">
                {[
                  { label: '练习单 (Worksheet)', url: selectedUnit.worksheet_url, icon: BookOpen },
                  { label: '作业单 (Homework)', url: selectedUnit.homework_url, icon: CheckCircle2 },
                  { label: '线上练习 (Online)', url: selectedUnit.online_practice_url, icon: ExternalLink },
                  { label: 'Kahoot链接', url: selectedUnit.kahoot_url, icon: Lightbulb },
                  { label: '词汇练习 (Vocab)', url: selectedUnit.vocab_practice_url, icon: Settings },
                ].map((res, i) => (
                  <a
                    key={i}
                    href={res.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      res.url
                        ? "bg-white border-slate-200 hover:border-indigo-400 hover:shadow-sm"
                        : "bg-slate-50 border-slate-100 opacity-50 cursor-not-allowed"
                    )}
                    onClick={res.url ? undefined : (e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-3">
                      <res.icon size={16} className={res.url ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-sm font-medium">{res.label}</span>
                    </div>
                    {res.url && <ExternalLink size={14} className="text-slate-400" />}
                  </a>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">备课提示 (AI Prompt)</h3>
              <div className="p-4 bg-slate-900 rounded-xl text-xs font-mono text-indigo-300 leading-relaxed">
                {selectedUnit.ai_prompt_template}
              </div>
              <button
                onClick={() => handleCopyPrompt(selectedUnit.ai_prompt_template)}
                className="w-full btn-primary text-xs py-3"
              >
                Copy Prompt
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedYear) {
    const yearUnits = teachingUnits.filter(u => u.year_group === selectedYear);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedYear(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <ChevronRight size={20} className="rotate-180" /> Back to Year Groups
          </button>
          <button
            onClick={onAddUnit}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <Plus size={18} /> New Unit
          </button>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900">{selectedYear} Units</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yearUnits.map(unit => (
            <div
              key={unit.id}
              onClick={() => setSelectedUnit(unit)}
              className="glass-card p-6 hover:border-indigo-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{unit.title}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{unit.learning_objectives[0]}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {unit.lessons.length} Lessons
                </span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
          {yearUnits.length === 0 && (
            <div className="col-span-full p-12 text-center glass-card border-dashed">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">No units added for {selectedYear} yet.</p>
              <button onClick={onAddUnit} className="mt-4 text-indigo-600 font-bold hover:underline">Add First Unit</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Teaching Management</h2>
        <div className="flex gap-2">
          <button onClick={onOpenSyllabus} className="btn-secondary text-sm">Curriculum Map</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {YEAR_GROUPS.map(year => (
          <div
            key={year}
            onClick={() => setSelectedYear(year)}
            className="glass-card p-8 hover:border-indigo-400 transition-all cursor-pointer group text-center space-y-4"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <BookOpen size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{year}</h3>
              <p className="text-sm text-slate-500 mt-1">
                {teachingUnits.filter(u => u.year_group === year).length} Units Available
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold text-lg mb-4">Class Progress Tracking</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(cls => {
            const currentUnit = teachingUnits.find(u => u.id === cls.current_unit_id);
            const progress = currentUnit ? Math.round(((cls.completed_lesson_ids?.length || 0) / currentUnit.lessons.length) * 100) : 0;
            return (
              <div key={cls.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-900">{cls.name}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      {cls.year_group}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Current: <span className="font-medium text-indigo-600">{currentUnit?.title || 'None'}</span>
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>PROGRESS</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex gap-3">
                    <button
                      onClick={() => onUpdateClass(cls.id)}
                      className="text-slate-400 font-bold text-[10px] uppercase tracking-wider hover:text-indigo-600 transition-colors"
                    >
                      Change Unit
                    </button>
                    <button
                      onClick={() => currentUnit && setSelectedUnit(currentUnit)}
                      className="text-indigo-600 font-bold text-[10px] uppercase tracking-wider hover:underline"
                    >
                      View Unit
                    </button>
                  </div>
                  <span className="text-xs text-slate-400">{cls.student_ids.length} Students</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
