import { memo } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, Circle, Clock, BookOpen, ExternalLink, Lightbulb, Edit3, Calendar, MessageSquare, Filter, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { TeachingUnit, SubUnit, LearningObjective } from '../../types';
import { MarkdownRenderer } from '../../components/RichTextEditor';
import { SubUnitForm } from '../../components/SubUnitForm';
import { getObjectivePrepMetrics, getSharedPrepResources } from '../../lib/objectivePrep';
import {
  LOFilterStatus,
  SegmentedProgressBar,
  ObjectivePrepSections,
  ResourceBankList,
} from './helpers';

interface SubUnitDetailViewProps {
  selectedUnit: TeachingUnit;
  selectedSubUnit: SubUnit;
  loFilter: LOFilterStatus;
  setLoFilter: (filter: LOFilterStatus) => void;
  onBack: () => void;
  onEditSubUnit: () => void;
  onDeleteSubUnit: (id: string) => void;
  onSaveUnit: (unit: TeachingUnit) => void;
  onToast?: (message: string) => void;
  setSelectedSubUnit: (su: SubUnit) => void;
  isSubUnitFormOpen: boolean;
  editingSubUnit: SubUnit | null;
  onSaveSubUnit: (su: SubUnit) => void;
  onCancelSubUnitForm: () => void;
  dragOverIndex: number | null;
  onLODragStart: (index: number) => void;
  onLODragOver: (e: React.DragEvent, index: number) => void;
  onLODrop: (index: number) => void;
  onLODragEnd: () => void;
  dragIndexRef: React.MutableRefObject<number | null>;
}

export const SubUnitDetailView = memo(function SubUnitDetailView({
  selectedUnit,
  selectedSubUnit,
  loFilter,
  setLoFilter,
  onBack,
  onEditSubUnit,
  onDeleteSubUnit,
  onSaveUnit,
  onToast,
  setSelectedSubUnit,
  isSubUnitFormOpen,
  editingSubUnit,
  onSaveSubUnit,
  onCancelSubUnitForm,
  dragOverIndex,
  onLODragStart,
  onLODragOver,
  onLODrop,
  onLODragEnd,
  dragIndexRef,
}: SubUnitDetailViewProps) {
  const los = selectedSubUnit.learning_objectives || [];
  const subUnitResourceBank = getSharedPrepResources(selectedSubUnit);
  const completedCount = los.filter(lo => lo.status === 'completed').length;
  const inProgressCount = los.filter(lo => lo.status === 'in_progress').length;
  const notStartedCount = los.filter(lo => lo.status === 'not_started').length;
  const totalCount = los.length;

  const filteredLOs = loFilter === 'all' ? los : los.filter(lo => lo.status === loFilter);

  const filterCounts: Record<LOFilterStatus, number> = {
    all: totalCount,
    not_started: notStartedCount,
    in_progress: inProgressCount,
    completed: completedCount,
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium"
      >
        <ChevronRight size={20} className="rotate-180" /> Back to {selectedUnit.title}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-8 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded">
                  小单元
                </span>
                <h2 className="text-3xl font-bold text-slate-900 mt-2">{selectedSubUnit.title}</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onEditSubUnit}
                  className="btn-secondary text-xs flex items-center gap-1"
                >
                  <Edit3 size={14} /> Edit
                </button>
                <button
                  onClick={() => onDeleteSubUnit(selectedSubUnit.id)}
                  className="px-3 py-2 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors border border-red-100"
                >
                  Delete
                </button>
              </div>
            </div>

            {totalCount > 0 && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    教学目标 Learning Objectives
                  </h3>
                  <button
                    onClick={() => {
                      const newLOs = selectedSubUnit.learning_objectives.map(lo => {
                        const coveredCount = lo.covered_lesson_dates?.length || 0;
                        let status: LearningObjective['status'];
                        if (coveredCount === 0) status = 'not_started';
                        else if (coveredCount >= lo.periods) status = 'completed';
                        else status = 'in_progress';
                        return { ...lo, status };
                      });
                      const newSubUnit = { ...selectedSubUnit, learning_objectives: newLOs };
                      const newSubUnits = selectedUnit.sub_units.map(s =>
                        s.id === selectedSubUnit.id ? newSubUnit : s
                      );
                      onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
                      setSelectedSubUnit(newSubUnit);
                      onToast?.('LO statuses updated from coverage');
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    title="Infer LO status from covered lesson count"
                  >
                    <Zap size={12} />
                    Auto-status
                  </button>
                </div>

                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 size={14} /> {completedCount} completed
                  </span>
                  <span className="flex items-center gap-1 text-amber-600">
                    <Clock size={14} /> {inProgressCount} in progress
                  </span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <Circle size={14} /> {notStartedCount} not started
                  </span>
                </div>

                <SegmentedProgressBar completed={completedCount} inProgress={inProgressCount} total={totalCount} />

                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-slate-400" />
                  {(['all', 'not_started', 'in_progress', 'completed'] as LOFilterStatus[]).map(status => {
                    const labels: Record<LOFilterStatus, string> = {
                      all: 'All',
                      not_started: 'Not Started',
                      in_progress: 'In Progress',
                      completed: 'Completed',
                    };
                    const colors: Record<LOFilterStatus, string> = {
                      all: loFilter === status ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      not_started: loFilter === status ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      in_progress: loFilter === status ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100',
                      completed: loFilter === status ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                    };
                    return (
                      <button
                        key={status}
                        onClick={() => setLoFilter(status)}
                        className={cn("px-3 py-1.5 rounded-full text-[11px] font-bold transition-all", colors[status])}
                      >
                        {labels[status]} ({filterCounts[status]})
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {filteredLOs.map((lo) => {
                    const realIndex = los.indexOf(lo);
                    const statusColors = {
                      not_started: 'bg-slate-100 text-slate-600 border-slate-200',
                      in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
                      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    };
                    const StatusIcon = lo.status === 'completed' ? CheckCircle2 : lo.status === 'in_progress' ? Clock : Circle;
                    const iconColor = lo.status === 'completed' ? 'text-emerald-500' : lo.status === 'in_progress' ? 'text-amber-500' : 'text-slate-400';
                    const cycleStatus = (current: LearningObjective['status']): LearningObjective['status'] => {
                      const cycle: Record<string, LearningObjective['status']> = { not_started: 'in_progress', in_progress: 'completed', completed: 'not_started' };
                      return cycle[current];
                    };
                    const prepMetrics = getObjectivePrepMetrics(lo, selectedSubUnit);
                    const objectiveVocabularyCount = prepMetrics.vocabulary.length;
                    const objectiveExampleCount = prepMetrics.examples.length;
                    const objectiveResourceCount = prepMetrics.resources.length;
                    const hasConceptExplanation = !!prepMetrics.concept;
                    const isDragging = dragIndexRef.current === realIndex;
                    const isDragOver = dragOverIndex === realIndex;
                    return (
                      <div
                        key={lo.id}
                        draggable={loFilter === 'all'}
                        onDragStart={() => onLODragStart(realIndex)}
                        onDragOver={(e) => onLODragOver(e, realIndex)}
                        onDrop={() => onLODrop(realIndex)}
                        onDragEnd={onLODragEnd}
                        className={cn(
                          "p-3 rounded-xl border transition-all",
                          statusColors[lo.status],
                          isDragging && "opacity-50",
                          isDragOver && "ring-2 ring-indigo-400",
                          loFilter === 'all' && "cursor-grab active:cursor-grabbing"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            title="Click to change status"
                            onClick={() => {
                              const newLOs = (selectedSubUnit.learning_objectives || []).map(l =>
                                l.id === lo.id ? { ...l, status: cycleStatus(l.status) } : l
                              );
                              const newSubUnit = { ...selectedSubUnit, learning_objectives: newLOs };
                              const newSubUnits = selectedUnit.sub_units.map(s =>
                                s.id === selectedSubUnit.id ? newSubUnit : s
                              );
                              onSaveUnit({ ...selectedUnit, sub_units: newSubUnits });
                              setSelectedSubUnit(newSubUnit);
                            }}
                            className={cn("mt-0.5 shrink-0 transition-all hover:scale-110", iconColor)}
                          >
                            <StatusIcon size={20} />
                          </button>
                          <div className="flex-1 space-y-1">
                            <MarkdownRenderer content={lo.objective} className="text-sm" />
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-slate-400">
                                {lo.periods} periods · {lo.covered_lesson_dates?.length || 0} covered
                              </span>
                              {lo.notes && <p className="text-xs text-slate-500 italic">{lo.notes}</p>}
                            </div>
                            {lo.covered_lesson_dates && lo.covered_lesson_dates.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {lo.covered_lesson_dates.map(d => (
                                  <span key={d} className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md font-mono">
                                    {format(new Date(d + 'T00:00:00'), 'dd MMM')}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                                {objectiveVocabularyCount} vocab
                              </span>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                {objectiveExampleCount} examples
                              </span>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                                {objectiveResourceCount} resources
                              </span>
                              <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                {prepMetrics.readySections}/{prepMetrics.totalSections} prep ready
                              </span>
                              {hasConceptExplanation && (
                                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                  concept ready
                                </span>
                              )}
                            </div>
                            <details className="mt-3 rounded-xl border border-white/70 bg-white/60">
                              <summary className="list-none cursor-pointer px-3 py-2 flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Objective Prep Pack</span>
                                <ChevronDown size={14} className="text-slate-400" />
                              </summary>
                              <div className="px-3 pb-3 border-t border-white/70">
                                <ObjectivePrepSections objective={lo} subUnit={selectedSubUnit} />
                              </div>
                            </details>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="flex items-center gap-3">
              <Clock size={18} className="text-indigo-500" />
              <span className="font-bold text-sm text-slate-700">课时安排</span>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-bold rounded-full">
                {selectedSubUnit.periods} 课时
              </span>
            </section>

            {selectedSubUnit.vocabulary.length > 0 && (
              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <BookOpen size={20} className="text-amber-500" />
                  双语核心词汇 Vocabulary
                </h3>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">English</th>
                        <th className="text-left px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">中文</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSubUnit.vocabulary.map((v, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-4 py-2 text-sm text-slate-700">{v.english}</td>
                          <td className="px-4 py-2 text-sm text-slate-700">{v.chinese}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {selectedSubUnit.classroom_exercises && (
              <section className="space-y-4">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Edit3 size={20} className="text-indigo-500" />
                  课堂讲练 Classroom Exercises
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <MarkdownRenderer content={selectedSubUnit.classroom_exercises} className="text-sm text-slate-700" />
                </div>
              </section>
            )}

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
                      <MarkdownRenderer content={selectedSubUnit.reflection.student_reception} className="text-sm text-slate-700" />
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

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-lg">资源链接 Resources</h3>
            <ResourceBankList resources={subUnitResourceBank} emptyLabel="No sub-unit resources linked yet." />
          </div>
        </div>
      </div>

      {isSubUnitFormOpen && (
        <SubUnitForm
          subUnit={editingSubUnit}
          unitTitle={selectedUnit.title}
          yearGroup={selectedUnit.year_group}
          aiPromptTemplate={selectedUnit.ai_prompt_template}
          onSave={onSaveSubUnit}
          onCancel={onCancelSubUnitForm}
        />
      )}
    </div>
  );
});
