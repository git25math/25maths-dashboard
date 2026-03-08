import { memo } from 'react';
import { Plus, ChevronRight, ChevronDown, Lightbulb, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TeachingUnit, SubUnit } from '../../types';
import { MarkdownRenderer } from '../../components/RichTextEditor';
import { SubUnitForm } from '../../components/SubUnitForm';
import { getObjectivePrepMetrics, getSharedPrepResources, getTeachingUnitResources } from '../../lib/objectivePrep';
import {
  computeUnitLOStats,
  SegmentedProgressBar,
  LOStatusPills,
  ObjectivePrepSections,
  ResourceBankList,
} from './helpers';

interface UnitDetailViewProps {
  selectedUnit: TeachingUnit;
  selectedYear: string | null;
  onBack: () => void;
  onUpdateUnit: (id: string) => void;
  onDeleteUnit: (id: string) => void;
  onSaveUnit: (unit: TeachingUnit) => void;
  setSelectedUnit: (unit: TeachingUnit | null) => void;
  setSelectedSubUnit: (su: SubUnit) => void;
  isSubUnitFormOpen: boolean;
  editingSubUnit: SubUnit | null;
  setEditingSubUnit: (su: SubUnit | null) => void;
  setIsSubUnitFormOpen: (open: boolean) => void;
  onSaveSubUnit: (su: SubUnit) => void;
  onCancelSubUnitForm: () => void;
  isGeneratingUnitSummary: boolean;
  unitSummaryError: string | null;
  onGenerateUnitSummary: () => void;
  onCopyPrompt: (text: string) => void;
}

export const UnitDetailView = memo(function UnitDetailView({
  selectedUnit,
  selectedYear,
  onBack,
  onUpdateUnit,
  onDeleteUnit,
  onSaveUnit,
  setSelectedUnit,
  setSelectedSubUnit,
  isSubUnitFormOpen,
  editingSubUnit,
  setEditingSubUnit,
  setIsSubUnitFormOpen,
  onSaveSubUnit,
  onCancelSubUnitForm,
  isGeneratingUnitSummary,
  unitSummaryError,
  onGenerateUnitSummary,
  onCopyPrompt,
}: UnitDetailViewProps) {
  const subUnits = selectedUnit.sub_units;
  const loStats = computeUnitLOStats(selectedUnit);
  const unitResourceBank = getTeachingUnitResources(selectedUnit);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
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
              <h3 className="font-bold text-lg">教学目标进度 (Learning Objectives Progress)</h3>
              <LOStatusPills {...loStats} />
            </section>

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
              <div className="space-y-3">
                {subUnits.map(su => {
                  const suLOs = su.learning_objectives || [];
                  const suCompleted = suLOs.filter(lo => lo.status === 'completed').length;
                  const suInProgress = suLOs.filter(lo => lo.status === 'in_progress').length;
                  const suTotal = suLOs.length;
                  const sharedResources = getSharedPrepResources(su);
                  return (
                    <details
                      key={su.id}
                      className="group rounded-2xl border border-slate-200 bg-slate-50/80 open:bg-white open:border-indigo-200 transition-all"
                    >
                      <summary className="list-none cursor-pointer p-4 md:p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                Sub-Unit
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-slate-200 text-slate-600">
                                {su.periods} periods
                              </span>
                            </div>
                            <p className="font-bold text-slate-900 text-lg group-open:text-indigo-700 transition-colors">{su.title}</p>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span>{suCompleted}/{suTotal} LOs completed</span>
                              <span>{su.vocabulary.length} shared vocab</span>
                              <span>{sharedResources.length} shared resources</span>
                              <span>{su.classroom_exercises ? 'shared class notes ready' : 'no shared class notes'}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {suTotal > 0 && (
                              <div className="w-24">
                                <SegmentedProgressBar completed={suCompleted} inProgress={suInProgress} total={suTotal} className="h-1.5" />
                              </div>
                            )}
                            <ChevronDown size={18} className="text-slate-400 transition-transform group-open:rotate-180" />
                          </div>
                        </div>
                      </summary>

                      <div className="px-4 md:px-5 pb-5 space-y-4 border-t border-slate-200">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-4">
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Shared Vocabulary</p>
                            <p className="mt-1 text-lg font-bold text-amber-900">{su.vocabulary.length}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Shared Notes</p>
                            <p className="mt-1 text-sm font-bold text-blue-900">{su.classroom_exercises ? 'Available' : 'Missing'}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Shared Resources</p>
                            <p className="mt-1 text-lg font-bold text-emerald-900">{sharedResources.length}</p>
                          </div>
                          <div className="p-3 rounded-xl bg-violet-50 border border-violet-100">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Homework</p>
                            <p className="mt-1 text-sm font-bold text-violet-900">{su.homework_content || su.homework_url ? 'Available' : 'Missing'}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {suLOs.map((lo, objectiveIndex) => {
                            const prepMetrics = getObjectivePrepMetrics(lo, su);
                            const objectiveVocabularyCount = prepMetrics.vocabulary.length;
                            const objectiveExampleCount = prepMetrics.examples.length;
                            const objectiveResourceCount = prepMetrics.resources.length;
                            return (
                              <details key={lo.id} className="rounded-xl border border-slate-200 bg-white group/objective">
                                <summary className="list-none cursor-pointer px-4 py-3 flex justify-between items-start gap-4">
                                  <div className="space-y-2 flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                        Objective {objectiveIndex + 1}
                                      </span>
                                      <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full",
                                        lo.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                        lo.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                                        'bg-slate-100 text-slate-600'
                                      )}>
                                        {lo.status.replace('_', ' ')}
                                      </span>
                                    </div>
                                    <div className="text-sm text-slate-800">
                                      <MarkdownRenderer content={lo.objective} />
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                                      <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700">{objectiveVocabularyCount} vocab</span>
                                      <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-700">{objectiveExampleCount} examples</span>
                                      <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{objectiveResourceCount} resources</span>
                                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{prepMetrics.readySections}/{prepMetrics.totalSections} prep ready</span>
                                      <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-600">{lo.periods} periods</span>
                                    </div>
                                  </div>
                                  <ChevronDown size={16} className="text-slate-400 transition-transform group-open/objective:rotate-180 shrink-0 mt-1" />
                                </summary>
                                <div className="px-4 pb-4 border-t border-slate-100">
                                  <ObjectivePrepSections objective={lo} subUnit={su} />
                                </div>
                              </details>
                            );
                          })}
                          {suLOs.length === 0 && (
                            <p className="text-xs text-slate-400 italic p-4">No objectives defined inside this sub-unit yet.</p>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => setSelectedSubUnit(su)}
                            className="text-indigo-600 text-xs font-bold hover:underline"
                          >
                            Open Sub-Unit Workspace
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingSubUnit(su); setIsSubUnitFormOpen(true); }}
                            className="text-slate-500 text-xs font-bold hover:text-indigo-600 transition-colors"
                          >
                            Edit Sub-Unit
                          </button>
                        </div>
                      </div>
                    </details>
                  );
                })}
              </div>
              {subUnits.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
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
              <button
                onClick={() => void onGenerateUnitSummary()}
                disabled={isGeneratingUnitSummary}
                className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {isGeneratingUnitSummary ? <Loader2 size={16} className="animate-spin" /> : <Lightbulb size={16} />}
                {isGeneratingUnitSummary ? 'Generating...' : 'AI Summary'}
              </button>
            </div>
            {selectedUnit.teaching_summary ? (
              <MarkdownRenderer content={selectedUnit.teaching_summary} className="text-sm text-slate-700" />
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed italic">
                No summary recorded for this unit yet.
              </p>
            )}
            {unitSummaryError && (
              <p className="text-xs text-red-500">{unitSummaryError}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-lg">资料库 (Resources)</h3>
            <ResourceBankList resources={unitResourceBank} emptyLabel="No unit-level resources linked yet." />
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-lg">备课模板 (Prep Material)</h3>
            {selectedUnit.prep_material_template ? (
              <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-100">
                <MarkdownRenderer content={selectedUnit.prep_material_template} className="text-sm text-slate-700" />
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No prep material template defined for this unit yet.</p>
            )}
            <button
              onClick={() => onCopyPrompt(selectedUnit.prep_material_template || '')}
              disabled={!selectedUnit.prep_material_template}
              className="w-full btn-secondary text-xs py-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Copy Template
            </button>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-lg">备课提示 (AI Prompt)</h3>
            {selectedUnit.ai_prompt_template ? (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <MarkdownRenderer content={selectedUnit.ai_prompt_template} className="text-sm text-slate-700" />
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No AI prompt template defined for this unit yet.</p>
            )}
            <button
              onClick={() => onCopyPrompt(selectedUnit.ai_prompt_template)}
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
