import React, { memo, useState } from 'react';
import { BookOpen, Sparkles, Loader2, ChevronDown } from 'lucide-react';
import { ClassProfile, TeachingUnit, TimetableEntry } from '../../types';
import { cn } from '../../lib/utils';
import { MarkdownRenderer } from '../RichTextEditor';
import { geminiService } from '../../services/geminiService';
import { getObjectivePrepMetrics, getObjectiveVocabulary, getObjectiveConcept, getObjectiveResources } from '../../lib/objectivePrep';

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

interface ClassProgressPanelProps {
  selectedClass: ClassProfile;
  selectedUnit: TeachingUnit;
  formData: TimetableEntry;
  setFormData: React.Dispatch<React.SetStateAction<TimetableEntry>>;
  effectiveDate?: string;
  coveredLOIds: Set<string>;
  setCoveredLOIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  expandedSubUnits: Set<string>;
  setExpandedSubUnits: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const ClassProgressPanel = memo(function ClassProgressPanel({
  selectedClass,
  selectedUnit,
  formData,
  setFormData,
  effectiveDate,
  coveredLOIds,
  setCoveredLOIds,
  expandedSubUnits,
  setExpandedSubUnits,
}: ClassProgressPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const allLOs = selectedUnit.sub_units.flatMap(su => su.learning_objectives);
  const totalLOs = allLOs.length;
  const completedLOs = allLOs.filter(lo => lo.status === 'completed').length;
  const pct = totalLOs > 0 ? Math.round((completedLOs / totalLOs) * 100) : 0;

  const handleGeneratePlan = async () => {
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
  };

  return (
    <div className="space-y-6 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
      <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-widest">
        <BookOpen size={16} />
        <span>Class Progress: {selectedClass.name}</span>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Current Unit: {selectedUnit.title}</h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-1 rounded-lg">
            {pct}% Complete ({completedLOs}/{totalLOs} LOs)
          </span>
        </div>
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
      </div>

      <div className="pt-4 border-t border-indigo-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-700">AI Preparation Assistant</h4>
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGeneratePlan}
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
  );
});
