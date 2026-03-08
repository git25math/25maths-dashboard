import React, { memo } from 'react';
import { Plus, Trash2, Loader2, Circle, Clock, CheckCircle2, Sparkles } from 'lucide-react';
import { LearningObjective, VocabularyItem, TypicalExample, PrepResource } from '../../types';
import { RichTextEditor } from '../RichTextEditor';
import { PREP_RESOURCE_KIND_OPTIONS } from '../../lib/prepResourceCatalog';

interface LearningObjectiveCardProps {
  lo: LearningObjective;
  index: number;
  generatingConcept: boolean;
  generatingExamples: boolean;
  conceptError?: string;
  exampleError?: string;
  sharedVocabCount: number;
  sharedPrepResourceCount: number;
  hasAiSummary: boolean;
  onUpdateField: (index: number, field: keyof LearningObjective, value: string | number) => void;
  onRemove: (index: number) => void;
  onAddVocabulary: (loIndex: number) => void;
  onUpdateVocabulary: (loIndex: number, vocabIndex: number, field: keyof VocabularyItem, value: string) => void;
  onRemoveVocabulary: (loIndex: number, vocabIndex: number) => void;
  onAddExample: (loIndex: number) => void;
  onUpdateExample: (loIndex: number, exampleIndex: number, field: keyof TypicalExample, value: string) => void;
  onRemoveExample: (loIndex: number, exampleIndex: number) => void;
  onAddResource: (loIndex: number) => void;
  onUpdateResource: (loIndex: number, resourceIndex: number, field: keyof PrepResource, value: string) => void;
  onRemoveResource: (loIndex: number, resourceIndex: number) => void;
  onSeedVocabulary: (loIndex: number) => void;
  onSeedConcept: (loIndex: number) => void;
  onSeedResources: (loIndex: number) => void;
  onGenerateConcept: (lo: LearningObjective) => void;
  onGenerateExamples: (lo: LearningObjective) => void;
}

const STATUS_BUTTONS = [
  { value: 'not_started' as const, Icon: Circle, color: 'text-slate-400', ring: 'ring-slate-300' },
  { value: 'in_progress' as const, Icon: Clock, color: 'text-amber-500', ring: 'ring-amber-300' },
  { value: 'completed' as const, Icon: CheckCircle2, color: 'text-emerald-500', ring: 'ring-emerald-300' },
] as const;

function LearningObjectiveCardInner({
  lo,
  index: i,
  generatingConcept,
  generatingExamples,
  conceptError,
  exampleError,
  sharedVocabCount,
  sharedPrepResourceCount,
  hasAiSummary,
  onUpdateField,
  onRemove,
  onAddVocabulary,
  onUpdateVocabulary,
  onRemoveVocabulary,
  onAddExample,
  onUpdateExample,
  onRemoveExample,
  onAddResource,
  onUpdateResource,
  onRemoveResource,
  onSeedVocabulary,
  onSeedConcept,
  onSeedResources,
  onGenerateConcept,
  onGenerateExamples,
}: LearningObjectiveCardProps) {
  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex gap-3 items-start">
        <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1">
          #{i + 1}
        </span>
        <div className="flex-1">
          <RichTextEditor
            value={lo.objective}
            onChange={value => onUpdateField(i, 'objective', value)}
            placeholder={`Learning Objective ${i + 1} (supports Markdown and LaTeX)...`}
            editorHeightClass="h-24"
            previewMinHeightClass="min-h-[6rem]"
            helperText=""
          />
        </div>
        <button type="button" onClick={() => onRemove(i)} className="p-2 text-red-400 hover:text-red-600 self-start">
          <Trash2 size={18} />
        </button>
      </div>
      <div className="flex gap-4 items-center pl-10">
        <div className="flex items-center gap-1">
          {STATUS_BUTTONS.map(({ value, Icon, color, ring }) => (
            <button
              key={value}
              type="button"
              onClick={() => onUpdateField(i, 'status', value)}
              className={`p-1.5 rounded-full transition-all ${color} ${lo.status === value ? `ring-2 ${ring} bg-white` : 'opacity-40 hover:opacity-70'}`}
              title={value.replace('_', ' ')}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Periods</label>
          <input
            type="number"
            min={1}
            value={lo.periods}
            onChange={e => onUpdateField(i, 'periods', parseInt(e.target.value) || 1)}
            className="w-16 px-2 py-1 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
          />
        </div>
      </div>
      <details className="pl-10 rounded-xl border border-indigo-100 bg-white/80">
        <summary className="cursor-pointer list-none px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Objective Prep Pack</span>
          </div>
          <span className="text-[10px] text-slate-400">
            {(lo.core_vocabulary || []).filter(v => v.english.trim() || v.chinese.trim()).length} vocab · {(lo.typical_examples || []).filter(ex => ex.question.trim() || ex.solution.trim()).length} examples · {(lo.prep_resources || []).filter(res => res.title.trim() || res.url.trim() || (res.note || '').trim()).length} resources
          </span>
        </summary>
        <div className="px-4 pb-4 space-y-6 border-t border-indigo-100">
          <div className="pt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSeedVocabulary(i)}
              disabled={sharedVocabCount === 0}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use Shared Vocab
            </button>
            <button
              type="button"
              onClick={() => onSeedConcept(i)}
              disabled={!hasAiSummary}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use AI Summary
            </button>
            <button
              type="button"
              onClick={() => onSeedResources(i)}
              disabled={sharedPrepResourceCount === 0}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Use Shared Resources
            </button>
          </div>

          <section className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Core Vocabulary</label>
              <button type="button" onClick={() => onAddVocabulary(i)} className="text-indigo-600 text-[11px] font-bold hover:underline flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {(lo.core_vocabulary || []).map((vocab, vocabIndex) => (
                <div key={`${lo.id}-vocab-${vocabIndex}`} className="flex gap-2">
                  <input
                    type="text"
                    value={vocab.english}
                    onChange={e => onUpdateVocabulary(i, vocabIndex, 'english', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="English term"
                  />
                  <input
                    type="text"
                    value={vocab.chinese}
                    onChange={e => onUpdateVocabulary(i, vocabIndex, 'chinese', e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    placeholder="中文术语"
                  />
                  <button type="button" onClick={() => onRemoveVocabulary(i, vocabIndex)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(lo.core_vocabulary || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">No objective-specific vocabulary yet. Shared sub-unit vocabulary will still be available.</p>
              )}
            </div>
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Concept Explanation</label>
              <button
                type="button"
                onClick={() => onGenerateConcept(lo)}
                disabled={!lo.objective.trim() || generatingConcept}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
              >
                {generatingConcept ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {generatingConcept ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
            <RichTextEditor
              value={lo.concept_explanation || ''}
              onChange={value => onUpdateField(i, 'concept_explanation', value)}
              placeholder="Explain the key concept, misconceptions, and the teaching sequence for this objective..."
              editorHeightClass="h-28"
              previewMinHeightClass="min-h-[7rem]"
              helperText=""
            />
            {conceptError && (
              <p className="text-xs text-red-500">{conceptError}</p>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Typical Examples</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onGenerateExamples(lo)}
                  disabled={!lo.objective.trim() || generatingExamples}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {generatingExamples ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  {generatingExamples ? 'Generating...' : 'AI Generate'}
                </button>
                <button type="button" onClick={() => onAddExample(i)} className="text-indigo-600 text-[11px] font-bold hover:underline flex items-center gap-1">
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {(lo.typical_examples || []).map((example, exampleIndex) => (
                <div key={`${lo.id}-example-${exampleIndex}`} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Example {exampleIndex + 1}</span>
                    <button type="button" onClick={() => onRemoveExample(i, exampleIndex)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <RichTextEditor
                    label="Question"
                    value={example.question}
                    onChange={value => onUpdateExample(i, exampleIndex, 'question', value)}
                    placeholder="Question / worked example prompt"
                    editorHeightClass="h-24"
                    previewMinHeightClass="min-h-[6rem]"
                  />
                  <RichTextEditor
                    label="Solution"
                    value={example.solution}
                    onChange={value => onUpdateExample(i, exampleIndex, 'solution', value)}
                    placeholder="Solution steps / board explanation"
                    editorHeightClass="h-28"
                    previewMinHeightClass="min-h-[7rem]"
                  />
                </div>
              ))}
              {(lo.typical_examples || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">No objective-specific examples yet.</p>
              )}
            </div>
            {exampleError && (
              <p className="text-xs text-red-500">{exampleError}</p>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Prep Resources</label>
              <button type="button" onClick={() => onAddResource(i)} className="text-indigo-600 text-[11px] font-bold hover:underline flex items-center gap-1">
                <Plus size={12} /> Add
              </button>
            </div>
            <div className="space-y-3">
              {(lo.prep_resources || []).map((resource, resourceIndex) => (
                <div key={`${lo.id}-resource-${resourceIndex}`} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resource {resourceIndex + 1}</span>
                    <button type="button" onClick={() => onRemoveResource(i, resourceIndex)} className="p-1 text-red-400 hover:text-red-600">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={resource.title}
                    onChange={e => onUpdateResource(i, resourceIndex, 'title', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                    placeholder="Resource title"
                  />
                  <input
                    type="url"
                    value={resource.url}
                    onChange={e => onUpdateResource(i, resourceIndex, 'url', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                    placeholder="https://..."
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <select
                      value={resource.kind || 'link'}
                      onChange={e => onUpdateResource(i, resourceIndex, 'kind', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                    >
                      {PREP_RESOURCE_KIND_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={resource.note || ''}
                      onChange={e => onUpdateResource(i, resourceIndex, 'note', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                      placeholder="How to use this resource"
                    />
                  </div>
                </div>
              ))}
              {(lo.prep_resources || []).length === 0 && (
                <p className="text-xs text-slate-400 italic">No objective-specific resources yet. The shared sub-unit resource bank can still be reused.</p>
              )}
            </div>
          </section>
        </div>
      </details>
    </div>
  );
}

export const LearningObjectiveCard = memo(LearningObjectiveCardInner);
