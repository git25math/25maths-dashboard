import React, { memo, useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Link as LinkIcon, Loader2, Sparkles } from 'lucide-react';
import { PrepResource, TeachingUnit } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { ResourceBankEditor } from './ResourceBankEditor';
import { TEACHING_YEAR_GROUPS } from '../shared/constants';
import { isPrepResourceFilled } from '../lib/prepResourceCatalog';
import { geminiService } from '../services/geminiService';

interface TeachingUnitFormProps {
  unit?: TeachingUnit | null;
  onSave: (unit: Omit<TeachingUnit, 'id'> | TeachingUnit) => void;
  onCancel: () => void;
  initialData?: { year_group: string; title: string } | null;
}

const createEmptyUnitFormData = (initialData?: { year_group: string; title: string } | null): Omit<TeachingUnit, 'id'> => ({
  year_group: initialData?.year_group || 'Year 7',
  title: initialData?.title || '',
  sub_units: [],
  typical_examples: [{ question: '', solution: '' }],
  worksheet_url: '',
  homework_url: '',
  online_practice_url: '',
  kahoot_url: '',
  vocab_practice_url: '',
  shared_resources: [],
  prep_material_template: '',
  ai_prompt_template: '',
  teaching_summary: '',
});

export const TeachingUnitForm = memo(function TeachingUnitForm({ unit, onSave, onCancel, initialData }: TeachingUnitFormProps) {
  const [formData, setFormData] = useState<Omit<TeachingUnit, 'id'>>(createEmptyUnitFormData(initialData));
  const [sharedResources, setSharedResources] = useState<PrepResource[]>([]);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingPrepTemplate, setIsGeneratingPrepTemplate] = useState(false);
  const [isGeneratingExamples, setIsGeneratingExamples] = useState(false);
  const [promptError, setPromptError] = useState<string | null>(null);
  const [prepTemplateError, setPrepTemplateError] = useState<string | null>(null);
  const [examplesError, setExamplesError] = useState<string | null>(null);

  useEffect(() => {
    if (unit) {
      const { id, ...rest } = unit;
      setFormData(rest);
      setSharedResources(unit.shared_resources || []);
    } else {
      setFormData(createEmptyUnitFormData(initialData));
      setSharedResources([]);
    }
    setPromptError(null);
    setPrepTemplateError(null);
    setExamplesError(null);
  }, [unit, initialData]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      shared_resources: sharedResources.filter(isPrepResourceFilled),
    };
    if (unit) {
      onSave({ ...payload, id: unit.id } as TeachingUnit);
    } else {
      onSave(payload);
    }
  };

  const addExample = () => setFormData({ ...formData, typical_examples: [...formData.typical_examples, { question: '', solution: '' }] });
  const updateExample = (index: number, field: 'question' | 'solution', value: string) => {
    const newExs = [...formData.typical_examples];
    newExs[index] = { ...newExs[index], [field]: value };
    setFormData({ ...formData, typical_examples: newExs });
  };
  const removeExample = (index: number) => setFormData({ ...formData, typical_examples: formData.typical_examples.filter((_, i) => i !== index) });

  const buildUnitContext = () => ({
    yearGroup: formData.year_group,
    unitTitle: formData.title.trim(),
    prepMaterialTemplate: formData.prep_material_template,
    aiPromptTemplate: formData.ai_prompt_template,
    teachingSummary: formData.teaching_summary,
    typicalExamples: formData.typical_examples.filter(example => example.question.trim() || example.solution.trim()),
    subUnits: formData.sub_units.map(subUnit => ({
      title: subUnit.title,
      objectives: subUnit.learning_objectives.map(objective => objective.objective).filter(Boolean),
      reflectionNotes: [
        subUnit.ai_summary,
        subUnit.reflection?.student_reception,
        subUnit.reflection?.planned_content,
        subUnit.reflection?.actual_content,
        subUnit.reflection?.improvements,
      ].filter((value): value is string => !!value?.trim()),
    })),
    resourceTitles: [
      formData.worksheet_url ? 'Worksheet' : '',
      formData.homework_url ? 'Homework' : '',
      formData.online_practice_url ? 'Online Practice' : '',
      formData.kahoot_url ? 'Kahoot' : '',
      formData.vocab_practice_url ? 'Vocabulary Practice' : '',
      ...sharedResources.map(resource => resource.title.trim()).filter(Boolean),
    ].filter(Boolean),
  });

  const handleGeneratePromptTemplate = async () => {
    if (!formData.title.trim()) {
      setPromptError('Add the unit title before generating the AI prompt template.');
      return;
    }

    setIsGeneratingPrompt(true);
    setPromptError(null);
    try {
      const generated = await geminiService.generateUnitPromptTemplate(buildUnitContext());
      setFormData(prev => ({ ...prev, ai_prompt_template: generated }));
    } catch (error) {
      setPromptError(error instanceof Error ? error.message : 'Failed to generate AI prompt template.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGeneratePrepTemplate = async () => {
    if (!formData.title.trim()) {
      setPrepTemplateError('Add the unit title before generating the prep material template.');
      return;
    }

    setIsGeneratingPrepTemplate(true);
    setPrepTemplateError(null);
    try {
      const generated = await geminiService.generatePrepMaterialTemplate(buildUnitContext());
      setFormData(prev => ({ ...prev, prep_material_template: generated }));
    } catch (error) {
      setPrepTemplateError(error instanceof Error ? error.message : 'Failed to generate prep material template.');
    } finally {
      setIsGeneratingPrepTemplate(false);
    }
  };

  const handleGenerateExamples = async () => {
    if (!formData.title.trim()) {
      setExamplesError('Add the unit title before generating unit examples.');
      return;
    }

    setIsGeneratingExamples(true);
    setExamplesError(null);
    try {
      const generated = await geminiService.generateUnitTypicalExamples(buildUnitContext());
      const usableExamples = generated
        .filter(example => example.question.trim() || example.solution.trim())
        .map(example => ({
          question: example.question.trim(),
          solution: example.solution.trim(),
        }));

      if (usableExamples.length === 0) {
        throw new Error('AI returned no usable examples.');
      }

      setFormData(prev => ({ ...prev, typical_examples: usableExamples }));
    } catch (error) {
      setExamplesError(error instanceof Error ? error.message : 'Failed to generate unit examples.');
    } finally {
      setIsGeneratingExamples(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">
            {unit ? 'Edit Teaching Unit' : 'Add New Teaching Unit'}
          </h2>
          <button onClick={onCancel} aria-label="Close" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Year Group</label>
              <select
                value={formData.year_group}
                onChange={e => setFormData({ ...formData, year_group: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              >
                {TEACHING_YEAR_GROUPS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Unit Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Quadratic Equations"
              />
            </div>
          </div>

          <section className="space-y-4">
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <LinkIcon size={16} className="text-emerald-500" />
                Unit Resource Hub
              </label>
              <p className="text-xs text-slate-500">
                Add unit-wide resource entry points here. These links and notes are shown on the unit detail page and can be reused across sub-units.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  value={formData.worksheet_url || ''}
                  onChange={e => setFormData({ ...formData, worksheet_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Worksheet URL"
                />
                <input
                  type="url"
                  value={formData.homework_url || ''}
                  onChange={e => setFormData({ ...formData, homework_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Homework URL"
                />
                <input
                  type="url"
                  value={formData.online_practice_url || ''}
                  onChange={e => setFormData({ ...formData, online_practice_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Online Practice URL"
                />
                <input
                  type="url"
                  value={formData.kahoot_url || ''}
                  onChange={e => setFormData({ ...formData, kahoot_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Kahoot / Quiz URL"
                />
                <input
                  type="url"
                  value={formData.vocab_practice_url || ''}
                  onChange={e => setFormData({ ...formData, vocab_practice_url: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="Vocabulary Practice URL"
                />
              </div>
              <ResourceBankEditor
                label="Shared Unit Resources"
                resources={sharedResources}
                onChange={setSharedResources}
                emptyText="No extra unit resources yet. Use the quick links above or add custom resource entries."
                description="Use this for slides, videos, textbooks, assessments, answer keys, past papers, simulations, and any other reusable unit-level materials."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Prep Material Template</label>
                <button
                  type="button"
                  onClick={() => void handleGeneratePrepTemplate()}
                  disabled={!formData.title.trim() || isGeneratingPrepTemplate}
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {isGeneratingPrepTemplate ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isGeneratingPrepTemplate ? 'Generating...' : 'AI Generate'}
                </button>
              </div>
              <RichTextEditor
                value={formData.prep_material_template}
                onChange={value => setFormData({ ...formData, prep_material_template: value })}
                placeholder="High-value teacher prep notes for this unit: key models, misconceptions, hinge checks, and resource priorities..."
                editorHeightClass="h-36"
                previewMinHeightClass="min-h-[9rem]"
              />
              <p className="text-xs text-slate-500">
                This template is fed into lesson-plan generation and should capture the strongest modelling moves, misconceptions, and resource priorities for the whole unit.
              </p>
              {prepTemplateError && <p className="text-xs text-red-500">{prepTemplateError}</p>}
            </div>

            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Typical Examples</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => void handleGenerateExamples()}
                  disabled={!formData.title.trim() || isGeneratingExamples}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {isGeneratingExamples ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isGeneratingExamples ? 'Generating...' : 'AI Generate'}
                </button>
                <button type="button" onClick={addExample} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                  <Plus size={14} /> Add Example
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {formData.typical_examples.map((ex, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Example {i + 1}</span>
                    <button type="button" onClick={() => removeExample(i)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <RichTextEditor
                    label="Question"
                    value={ex.question}
                    onChange={val => updateExample(i, 'question', val)}
                    placeholder="Question (supports LaTeX)..."
                  />
                  <RichTextEditor
                    label="Solution"
                    value={ex.solution}
                    onChange={val => updateExample(i, 'solution', val)}
                    placeholder="Solution (supports LaTeX)..."
                  />
                </div>
              ))}
            </div>
            {examplesError && <p className="text-xs text-red-500">{examplesError}</p>}
          </section>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">AI Prompt Template</label>
              <button
                type="button"
                onClick={() => void handleGeneratePromptTemplate()}
                disabled={!formData.title.trim() || isGeneratingPrompt}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  {isGeneratingPrompt ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isGeneratingPrompt ? 'Generating...' : 'AI Generate'}
                </button>
            </div>
            <RichTextEditor
              value={formData.ai_prompt_template}
              onChange={value => setFormData({ ...formData, ai_prompt_template: value })}
              placeholder="Prompt for AI generation..."
              editorHeightClass="h-32"
              previewMinHeightClass="min-h-[8rem]"
            />
            <p className="text-xs text-slate-500">
              Keep this focused on teaching style and output constraints. Topic, year group, objectives, examples, and prep notes are injected automatically.
            </p>
            {promptError && <p className="text-xs text-red-500">{promptError}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Teaching Summary</label>
            <RichTextEditor
              value={formData.teaching_summary || ''}
              onChange={value => setFormData({ ...formData, teaching_summary: value })}
              placeholder="Record what worked, what students struggled with, and what should change next time..."
              editorHeightClass="h-32"
              previewMinHeightClass="min-h-[8rem]"
            />
            <p className="text-xs text-slate-500">
              This is the end-of-unit retrospective. The unit detail page can also generate it from sub-unit progress and reflection notes.
            </p>
          </div>
        </form>

        <div className="px-4 sm:px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
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
            Save Unit
          </button>
        </div>
      </div>
    </div>
  );
});
