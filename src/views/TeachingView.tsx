import { useState, useEffect } from 'react';
import { Plus, ChevronRight, CheckCircle2, Clock, BookOpen, ExternalLink, Lightbulb, Settings, Trash2, Edit3, Calendar, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils';
import { TeachingUnit, ClassProfile, SubUnit } from '../types';
import { MarkdownRenderer } from '../components/RichTextEditor';
import { SubUnitForm } from '../components/SubUnitForm';
import { YEAR_GROUPS } from '../shared/constants';

interface TeachingViewProps {
  teachingUnits: TeachingUnit[];
  onOpenSyllabus: () => void;
  initialUnitId: string | null;
  onClearInitialUnit: () => void;
  onAddUnit: () => void;
  onUpdateUnit: (id: string) => void;
  onDeleteUnit: (id: string) => void;
  onSaveUnit: (unit: TeachingUnit) => void;
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
  onSaveUnit,
  classes,
  onUpdateClassProgress,
  onUpdateClass,
  onToast
}: TeachingViewProps) => {
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<TeachingUnit | null>(null);
  const [selectedSubUnit, setSelectedSubUnit] = useState<SubUnit | null>(null);
  const [isSubUnitFormOpen, setIsSubUnitFormOpen] = useState(false);
  const [editingSubUnit, setEditingSubUnit] = useState<SubUnit | null>(null);

  // Keep selectedUnit in sync with teachingUnits changes
  useEffect(() => {
    if (selectedUnit) {
      const updated = teachingUnits.find(u => u.id === selectedUnit.id);
      if (updated) setSelectedUnit(updated);
    }
  }, [teachingUnits]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // --- Sub-Unit CRUD ---
  const handleSaveSubUnit = (subUnit: SubUnit) => {
    if (!selectedUnit) return;
    const existing = selectedUnit.sub_units || [];
    const idx = existing.findIndex(s => s.id === subUnit.id);
    const newSubUnits = idx >= 0
      ? existing.map(s => s.id === subUnit.id ? subUnit : s)
      : [...existing, subUnit];
    onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
    setIsSubUnitFormOpen(false);
    setEditingSubUnit(null);
  };

  const handleDeleteSubUnit = (subUnitId: string) => {
    if (!selectedUnit) return;
    if (!confirm('Delete this sub-unit?')) return;
    const newSubUnits = (selectedUnit.sub_units || []).filter(s => s.id !== subUnitId);
    onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
    setSelectedSubUnit(null);
  };

  // ===== Sub-Unit Detail View =====
  if (selectedSubUnit && selectedUnit) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedSubUnit(null)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors font-medium"
        >
          <ChevronRight size={20} className="rotate-180" /> Back to {selectedUnit.title}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-8 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                    小单元
                  </span>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{selectedSubUnit.title}</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingSubUnit(selectedSubUnit); setIsSubUnitFormOpen(true); }}
                    className="btn-secondary text-xs flex items-center gap-1"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubUnit(selectedSubUnit.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Objectives */}
              {selectedSubUnit.objectives.length > 0 && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    教学目标 Objectives
                  </h3>
                  <ul className="space-y-2">
                    {selectedSubUnit.objectives.map((obj, i) => (
                      <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400 text-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <MarkdownRenderer content={obj} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Periods */}
              <section className="flex items-center gap-3">
                <Clock size={18} className="text-indigo-500" />
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300">课时安排</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
                  {selectedSubUnit.periods} 课时
                </span>
              </section>

              {/* Vocabulary */}
              {selectedSubUnit.vocabulary.length > 0 && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <BookOpen size={20} className="text-amber-500" />
                    双语核心词汇 Vocabulary
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800">
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">English</th>
                          <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">中文</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSubUnit.vocabulary.map((v, i) => (
                          <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">{v.english}</td>
                            <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">{v.chinese}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {/* Classroom Exercises */}
              {selectedSubUnit.classroom_exercises && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Edit3 size={20} className="text-indigo-500" />
                    课堂讲练 Classroom Exercises
                  </h3>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <MarkdownRenderer content={selectedSubUnit.classroom_exercises} className="text-sm text-slate-700 dark:text-slate-300" />
                  </div>
                </section>
              )}

              {/* Homework */}
              {(selectedSubUnit.homework_content || selectedSubUnit.homework_url) && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-violet-500" />
                    课后作业 Homework
                  </h3>
                  {selectedSubUnit.homework_content && (
                    <div className="p-4 bg-violet-50/50 rounded-xl border border-violet-100">
                      <MarkdownRenderer content={selectedSubUnit.homework_content} className="text-sm text-slate-700" />
                    </div>
                  )}
                  {selectedSubUnit.homework_url && (
                    <a
                      href={selectedSubUnit.homework_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-indigo-600 font-medium hover:underline"
                    >
                      <ExternalLink size={14} /> Open Homework Link
                    </a>
                  )}
                </section>
              )}

              {/* Teaching Reflection */}
              {selectedSubUnit.reflection && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <MessageSquare size={20} className="text-rose-500" />
                    教学总结及反思 Teaching Reflection
                  </h3>
                  <div className="p-6 bg-rose-50/50 rounded-xl border border-rose-100 space-y-4">
                    {selectedSubUnit.reflection.lesson_date && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-rose-400" />
                        <span className="font-bold text-slate-600">上课时间:</span>
                        <span className="text-slate-700">{selectedSubUnit.reflection.lesson_date}</span>
                      </div>
                    )}
                    {selectedSubUnit.reflection.student_reception && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">学生接受状态</p>
                        <p className="text-sm text-slate-700">{selectedSubUnit.reflection.student_reception}</p>
                      </div>
                    )}
                    {selectedSubUnit.reflection.planned_content && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">计划讲解</p>
                        <MarkdownRenderer content={selectedSubUnit.reflection.planned_content} className="text-sm text-slate-700" />
                      </div>
                    )}
                    {selectedSubUnit.reflection.actual_content && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">实际讲解</p>
                        <MarkdownRenderer content={selectedSubUnit.reflection.actual_content} className="text-sm text-slate-700" />
                      </div>
                    )}
                    {selectedSubUnit.reflection.improvements && (
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">下次改进方向</p>
                        <MarkdownRenderer content={selectedSubUnit.reflection.improvements} className="text-sm text-slate-700" />
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* AI Summary */}
              {selectedSubUnit.ai_summary && (
                <section className="space-y-4">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <Lightbulb size={20} className="text-amber-500" />
                    AI总结 AI Summary
                  </h3>
                  <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                    <MarkdownRenderer content={selectedSubUnit.ai_summary} className="text-sm text-slate-700" />
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-4">
              <h3 className="font-bold text-lg">资源链接 Resources</h3>
              <div className="space-y-2">
                {[
                  { label: '练习单 Worksheet', url: selectedSubUnit.worksheet_url, icon: BookOpen },
                  { label: '线上练习 Online Practice', url: selectedSubUnit.online_practice_url, icon: ExternalLink },
                  { label: 'Kahoot 练习', url: selectedSubUnit.kahoot_url, icon: Lightbulb },
                  { label: '课后作业 Homework', url: selectedSubUnit.homework_url, icon: CheckCircle2 },
                ].map((res, i) => (
                  <a
                    key={i}
                    href={res.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      res.url
                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-50 cursor-not-allowed"
                    )}
                    onClick={res.url ? undefined : (e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-3">
                      <res.icon size={16} className={res.url ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-sm font-medium dark:text-slate-300">{res.label}</span>
                    </div>
                    {res.url && <ExternalLink size={14} className="text-slate-400" />}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isSubUnitFormOpen && (
          <SubUnitForm
            subUnit={editingSubUnit}
            onSave={handleSaveSubUnit}
            onCancel={() => { setIsSubUnitFormOpen(false); setEditingSubUnit(null); }}
          />
        )}
      </div>
    );
  }

  // ===== Unit Detail View =====
  if (selectedUnit) {
    const subUnits = selectedUnit.sub_units || [];
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedUnit(null)}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors font-medium"
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
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{selectedUnit.title}</h2>
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
                    <li key={i} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                      <MarkdownRenderer content={obj} />
                    </li>
                  ))}
                </ul>
              </section>

              {/* Sub-Units Section */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg">小单元模块 (Sub-Units)</h3>
                  <button
                    onClick={() => { setEditingSubUnit(null); setIsSubUnitFormOpen(true); }}
                    className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline"
                  >
                    <Plus size={14} /> Add Sub-Unit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {subUnits.map(su => (
                    <div
                      key={su.id}
                      onClick={() => setSelectedSubUnit(su)}
                      className="p-4 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-200 rounded-xl transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 flex-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{su.title}</p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {su.periods} 课时
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 size={12} /> {su.objectives.length} objectives
                            </span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {su.worksheet_url && <span className="w-2 h-2 rounded-full bg-blue-400" title="Worksheet" />}
                            {su.online_practice_url && <span className="w-2 h-2 rounded-full bg-green-400" title="Online Practice" />}
                            {su.kahoot_url && <span className="w-2 h-2 rounded-full bg-purple-400" title="Kahoot" />}
                            {su.homework_url && <span className="w-2 h-2 rounded-full bg-amber-400" title="Homework" />}
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1 shrink-0 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
                {subUnits.length === 0 && (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-400">No sub-units yet.</p>
                    <button
                      onClick={() => { setEditingSubUnit(null); setIsSubUnitFormOpen(true); }}
                      className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
                    >
                      Add First Sub-Unit
                    </button>
                  </div>
                )}
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
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed italic">
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
                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 opacity-50 cursor-not-allowed"
                    )}
                    onClick={res.url ? undefined : (e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-3">
                      <res.icon size={16} className={res.url ? "text-indigo-600" : "text-slate-400"} />
                      <span className="text-sm font-medium dark:text-slate-300">{res.label}</span>
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

        {isSubUnitFormOpen && (
          <SubUnitForm
            subUnit={editingSubUnit}
            onSave={handleSaveSubUnit}
            onCancel={() => { setIsSubUnitFormOpen(false); setEditingSubUnit(null); }}
          />
        )}
      </div>
    );
  }

  // ===== Year Group Units List =====
  if (selectedYear) {
    const yearUnits = teachingUnits.filter(u => u.year_group === selectedYear);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => setSelectedYear(null)}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors font-medium"
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{selectedYear} Units</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yearUnits.map(unit => (
            <div
              key={unit.id}
              onClick={() => setSelectedUnit(unit)}
              className="glass-card p-6 hover:border-indigo-400 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="space-y-2">
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 transition-colors">{unit.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{unit.learning_objectives[0]}</p>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {(unit.sub_units || []).length} Sub-Units
                </span>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
          {yearUnits.length === 0 && (
            <div className="col-span-full p-12 text-center glass-card border-dashed">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 dark:text-slate-400">No units added for {selectedYear} yet.</p>
              <button onClick={onAddUnit} className="mt-4 text-indigo-600 font-bold hover:underline">Add First Unit</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== Year Groups Overview =====
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Teaching Management</h2>
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
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{year}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
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
            const totalSubUnits = currentUnit?.sub_units?.length || currentUnit?.lessons.length || 1;
            const progress = currentUnit ? Math.round(((cls.completed_lesson_ids?.length || 0) / totalSubUnits) * 100) : 0;
            return (
              <div key={cls.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{cls.name}</p>
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-200 text-slate-600 rounded">
                      {cls.year_group}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Current: <span className="font-medium text-indigo-600">{currentUnit?.title || 'None'}</span>
                  </p>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>PROGRESS</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
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
