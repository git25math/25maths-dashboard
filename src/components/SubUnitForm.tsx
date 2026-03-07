import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Plus, Trash2, Paperclip, Loader2, Circle, Clock, CheckCircle2, Target, BookOpen, Link, FileText, MessageSquare, Sparkles } from 'lucide-react';
import { SubUnit, VocabularyItem, TeachingReflection, LearningObjective, PrepResource, TypicalExample } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { uploadFile } from '../services/storageService';
import { ResourceBankEditor } from './ResourceBankEditor';
import { PREP_RESOURCE_KIND_OPTIONS, dedupePrepResources, emptyPrepResource, isPrepResourceFilled } from '../lib/prepResourceCatalog';

interface SubUnitFormProps {
  subUnit?: SubUnit | null;
  onSave: (subUnit: SubUnit) => void;
  onCancel: () => void;
}

const genId = () => Math.random().toString(36).substr(2, 9);

function UrlWithUpload({ label, value, onChange, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setUploadError('Upload failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1">
      <label className="text-xs text-slate-500">{label}</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={value}
          onChange={e => { onChange(e.target.value); setUploadError(null); }}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
          placeholder={placeholder || 'https://...'}
        />
        <label className={`flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 cursor-pointer transition-colors ${uploading ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
          {uploading ? (
            <Loader2 size={18} className="text-indigo-500 animate-spin" />
          ) : (
            <Paperclip size={18} className="text-slate-400" />
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </label>
      </div>
      {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
    </div>
  );
}

const emptyReflection: TeachingReflection = {
  lesson_date: '',
  student_reception: '',
  planned_content: '',
  actual_content: '',
  improvements: '',
};

const emptyVocabularyItem = (): VocabularyItem => ({ english: '', chinese: '' });
const emptyTypicalExample = (): TypicalExample => ({ question: '', solution: '' });

export const SubUnitForm = ({ subUnit, onSave, onCancel }: SubUnitFormProps) => {
  const emptyLO = (): LearningObjective => ({
    id: genId(),
    objective: '',
    status: 'not_started',
    periods: 1,
    covered_lesson_dates: [],
    core_vocabulary: [],
    concept_explanation: '',
    typical_examples: [],
    prep_resources: [],
  });
  const [title, setTitle] = useState('');
  const [learningObjectives, setLearningObjectives] = useState<LearningObjective[]>([emptyLO()]);
  const [periods, setPeriods] = useState(1);
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([emptyVocabularyItem()]);
  const [classroomExercises, setClassroomExercises] = useState('');
  const [worksheetUrl, setWorksheetUrl] = useState('');
  const [onlinePracticeUrl, setOnlinePracticeUrl] = useState('');
  const [kahootUrl, setKahootUrl] = useState('');
  const [homeworkUrl, setHomeworkUrl] = useState('');
  const [vocabPracticeUrl, setVocabPracticeUrl] = useState('');
  const [sharedResources, setSharedResources] = useState<PrepResource[]>([]);
  const [homeworkContent, setHomeworkContent] = useState('');
  const [reflection, setReflection] = useState<TeachingReflection>(emptyReflection);
  const [aiSummary, setAiSummary] = useState('');

  useEffect(() => {
    if (subUnit) {
      setTitle(subUnit.title);
      setLearningObjectives((subUnit.learning_objectives || []).length > 0
        ? subUnit.learning_objectives.map(lo => ({
          ...lo,
          covered_lesson_dates: lo.covered_lesson_dates || [],
          core_vocabulary: lo.core_vocabulary || [],
          concept_explanation: lo.concept_explanation || '',
          typical_examples: lo.typical_examples || [],
          prep_resources: lo.prep_resources || [],
        }))
        : [emptyLO()]);
      setPeriods(subUnit.periods);
      setVocabulary(subUnit.vocabulary.length > 0 ? subUnit.vocabulary : [emptyVocabularyItem()]);
      setClassroomExercises(subUnit.classroom_exercises);
      setWorksheetUrl(subUnit.worksheet_url || '');
      setOnlinePracticeUrl(subUnit.online_practice_url || '');
      setKahootUrl(subUnit.kahoot_url || '');
      setHomeworkUrl(subUnit.homework_url || '');
      setVocabPracticeUrl(subUnit.vocab_practice_url || '');
      setSharedResources(subUnit.shared_resources || []);
      setHomeworkContent(subUnit.homework_content || '');
      setReflection(subUnit.reflection || emptyReflection);
      setAiSummary(subUnit.ai_summary || '');
    } else {
      setTitle('');
      setLearningObjectives([emptyLO()]);
      setPeriods(1);
      setVocabulary([emptyVocabularyItem()]);
      setClassroomExercises('');
      setWorksheetUrl('');
      setOnlinePracticeUrl('');
      setKahootUrl('');
      setHomeworkUrl('');
      setVocabPracticeUrl('');
      setSharedResources([]);
      setHomeworkContent('');
      setReflection(emptyReflection);
      setAiSummary('');
    }
  }, [subUnit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: subUnit?.id || genId(),
      title,
      learning_objectives: learningObjectives
        .filter(lo => lo.objective.trim())
        .map(lo => ({
          ...lo,
          covered_lesson_dates: lo.covered_lesson_dates || [],
          core_vocabulary: (lo.core_vocabulary || []).filter(v => v.english.trim() || v.chinese.trim()),
          concept_explanation: lo.concept_explanation || '',
          typical_examples: (lo.typical_examples || []).filter(ex => ex.question.trim() || ex.solution.trim()),
          prep_resources: (lo.prep_resources || []).filter(isPrepResourceFilled),
        })),
      periods,
      vocabulary: vocabulary.filter(v => v.english.trim() || v.chinese.trim()),
      classroom_exercises: classroomExercises,
      worksheet_url: worksheetUrl || undefined,
      online_practice_url: onlinePracticeUrl || undefined,
      kahoot_url: kahootUrl || undefined,
      homework_url: homeworkUrl || undefined,
      vocab_practice_url: vocabPracticeUrl || undefined,
      shared_resources: sharedResources.filter(isPrepResourceFilled),
      homework_content: homeworkContent || undefined,
      reflection: reflection,
      ai_summary: aiSummary || undefined,
    });
  };

  const addLO = () => setLearningObjectives([...learningObjectives, emptyLO()]);
  const updateLO = (i: number, field: keyof LearningObjective, val: string | number) => {
    const arr = [...learningObjectives];
    arr[i] = { ...arr[i], [field]: val };
    setLearningObjectives(arr);
  };
  const removeLO = (i: number) => setLearningObjectives(learningObjectives.filter((_, idx) => idx !== i));

  const updateLOVocabulary = (loIndex: number, vocabIndex: number, field: keyof VocabularyItem, value: string) => {
    const arr = [...learningObjectives];
    const current = [...(arr[loIndex].core_vocabulary || [])];
    current[vocabIndex] = { ...(current[vocabIndex] || emptyVocabularyItem()), [field]: value };
    arr[loIndex] = { ...arr[loIndex], core_vocabulary: current };
    setLearningObjectives(arr);
  };
  const addLOVocabulary = (loIndex: number) => {
    const arr = [...learningObjectives];
    arr[loIndex] = { ...arr[loIndex], core_vocabulary: [...(arr[loIndex].core_vocabulary || []), emptyVocabularyItem()] };
    setLearningObjectives(arr);
  };
  const removeLOVocabulary = (loIndex: number, vocabIndex: number) => {
    const arr = [...learningObjectives];
    arr[loIndex] = {
      ...arr[loIndex],
      core_vocabulary: (arr[loIndex].core_vocabulary || []).filter((_, idx) => idx !== vocabIndex),
    };
    setLearningObjectives(arr);
  };

  const updateLOExample = (loIndex: number, exampleIndex: number, field: keyof TypicalExample, value: string) => {
    const arr = [...learningObjectives];
    const current = [...(arr[loIndex].typical_examples || [])];
    current[exampleIndex] = { ...(current[exampleIndex] || emptyTypicalExample()), [field]: value };
    arr[loIndex] = { ...arr[loIndex], typical_examples: current };
    setLearningObjectives(arr);
  };
  const addLOExample = (loIndex: number) => {
    const arr = [...learningObjectives];
    arr[loIndex] = { ...arr[loIndex], typical_examples: [...(arr[loIndex].typical_examples || []), emptyTypicalExample()] };
    setLearningObjectives(arr);
  };
  const removeLOExample = (loIndex: number, exampleIndex: number) => {
    const arr = [...learningObjectives];
    arr[loIndex] = {
      ...arr[loIndex],
      typical_examples: (arr[loIndex].typical_examples || []).filter((_, idx) => idx !== exampleIndex),
    };
    setLearningObjectives(arr);
  };

  const updateLOResource = (loIndex: number, resourceIndex: number, field: keyof PrepResource, value: string) => {
    const arr = [...learningObjectives];
    const current = [...(arr[loIndex].prep_resources || [])];
    current[resourceIndex] = { ...(current[resourceIndex] || emptyPrepResource()), [field]: value };
    arr[loIndex] = { ...arr[loIndex], prep_resources: current };
    setLearningObjectives(arr);
  };
  const addLOResource = (loIndex: number) => {
    const arr = [...learningObjectives];
    arr[loIndex] = { ...arr[loIndex], prep_resources: [...(arr[loIndex].prep_resources || []), emptyPrepResource()] };
    setLearningObjectives(arr);
  };
  const removeLOResource = (loIndex: number, resourceIndex: number) => {
    const arr = [...learningObjectives];
    arr[loIndex] = {
      ...arr[loIndex],
      prep_resources: (arr[loIndex].prep_resources || []).filter((_, idx) => idx !== resourceIndex),
    };
    setLearningObjectives(arr);
  };

  const buildSharedPrepResourcesDraft = (): PrepResource[] => dedupePrepResources([
    {
      title: 'Worksheet',
      url: worksheetUrl.trim(),
      kind: 'worksheet' as const,
      note: 'Use as the shared fluency or consolidation worksheet after teacher modelling.',
    },
    {
      title: 'Online Practice',
      url: onlinePracticeUrl.trim(),
      kind: 'practice' as const,
      note: 'Use for paced independent practice once the worked example is secure.',
    },
    {
      title: 'Kahoot',
      url: kahootUrl.trim(),
      kind: 'kahoot' as const,
      note: 'Use as a retrieval or hinge-check activity at the start or end of the lesson.',
    },
    {
      title: 'Homework',
      url: homeworkUrl.trim(),
      kind: 'homework' as const,
      note: 'Set as independent follow-up practice after the objective has been introduced.',
    },
    {
      title: 'Vocabulary Practice',
      url: vocabPracticeUrl.trim(),
      kind: 'vocab' as const,
      note: 'Use to rehearse the bilingual vocabulary before or after the main explanation.',
    },
    classroomExercises.trim()
      ? {
          title: 'Guided Practice Bank',
          url: '',
          kind: 'other' as const,
          note: 'Reuse the sub-unit classroom exercises as the shared guided-practice bank for this objective.',
        }
      : null,
    homeworkContent.trim() && !homeworkUrl.trim()
      ? {
          title: 'Homework Follow-up',
          url: '',
          kind: 'homework' as const,
          note: 'Use the existing sub-unit homework content for independent practice or next-lesson retrieval.',
        }
      : null,
    vocabulary.filter(v => v.english.trim() || v.chinese.trim()).length > 0 && !vocabPracticeUrl.trim()
      ? {
          title: 'Vocabulary Retrieval',
          url: '',
          kind: 'vocab' as const,
          note: `Revisit ${vocabulary.filter(v => v.english.trim()).map(v => v.english.trim()).slice(0, 4).join(', ')} before direct instruction and again during plenary review.`,
        }
      : null,
    aiSummary.trim()
      ? {
          title: 'Teacher Explanation Notes',
          url: '',
          kind: 'other' as const,
          note: 'Use the sub-unit AI summary as a concise explanation scaffold and misconception check.',
        }
      : null,
    ...sharedResources,
  ].filter((resource): resource is PrepResource =>
    !!resource && isPrepResourceFilled(resource)
  ));

  const seedLOVocabulary = (loIndex: number) => {
    const sharedVocabulary = vocabulary.filter(v => v.english.trim() || v.chinese.trim());
    const arr = [...learningObjectives];
    arr[loIndex] = {
      ...arr[loIndex],
      core_vocabulary: sharedVocabulary.map(v => ({ ...v })),
    };
    setLearningObjectives(arr);
  };

  const seedLOResources = (loIndex: number) => {
    const sharedResources = buildSharedPrepResourcesDraft();
    const arr = [...learningObjectives];
    arr[loIndex] = {
      ...arr[loIndex],
      prep_resources: sharedResources.map(resource => ({ ...resource })),
    };
    setLearningObjectives(arr);
  };

  const seedLOConcept = (loIndex: number) => {
    const arr = [...learningObjectives];
    arr[loIndex] = {
      ...arr[loIndex],
      concept_explanation: aiSummary.trim(),
    };
    setLearningObjectives(arr);
  };

  const addVocab = () => setVocabulary([...vocabulary, emptyVocabularyItem()]);
  const updateVocab = (i: number, field: keyof VocabularyItem, val: string) => {
    const arr = [...vocabulary];
    arr[i] = { ...arr[i], [field]: val };
    setVocabulary(arr);
  };
  const removeVocab = (i: number) => setVocabulary(vocabulary.filter((_, idx) => idx !== i));

  const updateReflection = (field: keyof TeachingReflection, val: string) => {
    setReflection({ ...reflection, [field]: val });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-4 sm:px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-900">
            {subUnit ? '编辑小单元 Edit Sub-Unit' : '添加小单元 Add Sub-Unit'}
          </h2>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8 overflow-y-auto flex-1">
          {/* Title & Periods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">小单元名称 Title</label>
              <input
                required
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="e.g. Linear Equations Introduction"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">课时安排 Periods</label>
              <input
                type="number"
                min={1}
                value={periods}
                onChange={e => setPeriods(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Learning Objectives */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Target size={16} className="text-indigo-500" />
                教学目标 Learning Objectives
              </label>
              <button type="button" onClick={addLO} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-4">
              {learningObjectives.map((lo, i) => (
                <div key={lo.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-sm space-y-3">
                  <div className="flex gap-3">
                    <span className="w-7 h-7 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                      #{i + 1}
                    </span>
                    <textarea
                      value={lo.objective}
                      onChange={e => updateLO(i, 'objective', e.target.value)}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm resize-none h-16"
                      placeholder={`Learning Objective ${i + 1}`}
                    />
                    <button type="button" onClick={() => removeLO(i)} className="p-2 text-red-400 hover:text-red-600 self-start">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="flex gap-4 items-center pl-10">
                    <div className="flex items-center gap-1">
                      {([
                        { value: 'not_started' as const, Icon: Circle, color: 'text-slate-400', ring: 'ring-slate-300' },
                        { value: 'in_progress' as const, Icon: Clock, color: 'text-amber-500', ring: 'ring-amber-300' },
                        { value: 'completed' as const, Icon: CheckCircle2, color: 'text-emerald-500', ring: 'ring-emerald-300' },
                      ]).map(({ value, Icon, color, ring }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateLO(i, 'status', value)}
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
                        onChange={e => updateLO(i, 'periods', parseInt(e.target.value) || 1)}
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
                          onClick={() => seedLOVocabulary(i)}
                          disabled={vocabulary.filter(v => v.english.trim() || v.chinese.trim()).length === 0}
                          className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Use Shared Vocab
                        </button>
                        <button
                          type="button"
                          onClick={() => seedLOConcept(i)}
                          disabled={!aiSummary.trim()}
                          className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Use AI Summary
                        </button>
                        <button
                          type="button"
                          onClick={() => seedLOResources(i)}
                          disabled={buildSharedPrepResourcesDraft().length === 0}
                          className="px-3 py-1.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Use Shared Resources
                        </button>
                      </div>

                      <section className="space-y-3 pt-4">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Core Vocabulary</label>
                          <button type="button" onClick={() => addLOVocabulary(i)} className="text-indigo-600 text-[11px] font-bold hover:underline flex items-center gap-1">
                            <Plus size={12} /> Add
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(lo.core_vocabulary || []).map((vocab, vocabIndex) => (
                            <div key={`${lo.id}-vocab-${vocabIndex}`} className="flex gap-2">
                              <input
                                type="text"
                                value={vocab.english}
                                onChange={e => updateLOVocabulary(i, vocabIndex, 'english', e.target.value)}
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="English term"
                              />
                              <input
                                type="text"
                                value={vocab.chinese}
                                onChange={e => updateLOVocabulary(i, vocabIndex, 'chinese', e.target.value)}
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                placeholder="中文术语"
                              />
                              <button type="button" onClick={() => removeLOVocabulary(i, vocabIndex)} className="p-2 text-red-400 hover:text-red-600">
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
                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Concept Explanation</label>
                        <textarea
                          value={lo.concept_explanation || ''}
                          onChange={e => updateLO(i, 'concept_explanation', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm resize-none h-24"
                          placeholder="Explain the key concept, misconceptions, and the teaching sequence for this objective..."
                        />
                      </section>

                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Typical Examples</label>
                          <button type="button" onClick={() => addLOExample(i)} className="text-indigo-600 text-[11px] font-bold hover:underline flex items-center gap-1">
                            <Plus size={12} /> Add
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(lo.typical_examples || []).map((example, exampleIndex) => (
                            <div key={`${lo.id}-example-${exampleIndex}`} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Example {exampleIndex + 1}</span>
                                <button type="button" onClick={() => removeLOExample(i, exampleIndex)} className="p-1 text-red-400 hover:text-red-600">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                              <textarea
                                value={example.question}
                                onChange={e => updateLOExample(i, exampleIndex, 'question', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-20 bg-white"
                                placeholder="Question / worked example prompt"
                              />
                              <textarea
                                value={example.solution}
                                onChange={e => updateLOExample(i, exampleIndex, 'solution', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none h-24 bg-white"
                                placeholder="Solution steps / board explanation"
                              />
                            </div>
                          ))}
                          {(lo.typical_examples || []).length === 0 && (
                            <p className="text-xs text-slate-400 italic">No objective-specific examples yet.</p>
                          )}
                        </div>
                      </section>

                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Prep Resources</label>
                          <button type="button" onClick={() => addLOResource(i)} className="text-indigo-600 text-[11px] font-bold hover:underline flex items-center gap-1">
                            <Plus size={12} /> Add
                          </button>
                        </div>
                        <div className="space-y-3">
                          {(lo.prep_resources || []).map((resource, resourceIndex) => (
                            <div key={`${lo.id}-resource-${resourceIndex}`} className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resource {resourceIndex + 1}</span>
                                <button type="button" onClick={() => removeLOResource(i, resourceIndex)} className="p-1 text-red-400 hover:text-red-600">
                                  <Trash2 size={15} />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={resource.title}
                                onChange={e => updateLOResource(i, resourceIndex, 'title', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                placeholder="Resource title"
                              />
                              <input
                                type="url"
                                value={resource.url}
                                onChange={e => updateLOResource(i, resourceIndex, 'url', e.target.value)}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                placeholder="https://..."
                              />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <select
                                  value={resource.kind || 'link'}
                                  onChange={e => updateLOResource(i, resourceIndex, 'kind', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                >
                                  {PREP_RESOURCE_KIND_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={resource.note || ''}
                                  onChange={e => updateLOResource(i, resourceIndex, 'note', e.target.value)}
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
              ))}
              {learningObjectives.length === 0 && (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Target size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm text-slate-400">No learning objectives yet.</p>
                  <button type="button" onClick={addLO} className="mt-2 text-indigo-600 text-sm font-bold hover:underline">
                    Add First Objective
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Vocabulary */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-amber-500" />
                双语核心词汇 Vocabulary
              </label>
              <button type="button" onClick={addVocab} className="text-indigo-600 text-xs font-bold flex items-center gap-1 hover:underline">
                <Plus size={14} /> Add
              </button>
            </div>
            <div className="space-y-2">
              {vocabulary.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    value={v.english}
                    onChange={e => updateVocab(i, 'english', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="English"
                  />
                  <input
                    type="text"
                    value={v.chinese}
                    onChange={e => updateVocab(i, 'chinese', e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                    placeholder="中文"
                  />
                  <button type="button" onClick={() => removeVocab(i)} className="p-2 text-red-400 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Classroom Exercises */}
          <div className="border-t border-slate-100 pt-8">
            <RichTextEditor
              label="课堂讲练 Classroom Exercises"
              value={classroomExercises}
              onChange={setClassroomExercises}
              placeholder="Enter classroom exercises and worked examples..."
            />
          </div>

          {/* Resource Links */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Link size={16} className="text-blue-500" />
              快速资源入口 Quick Links
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UrlWithUpload label="练习单 Worksheet URL" value={worksheetUrl} onChange={setWorksheetUrl} />
              <UrlWithUpload label="线上练习 Online Practice URL" value={onlinePracticeUrl} onChange={setOnlinePracticeUrl} />
              <UrlWithUpload label="Kahoot URL" value={kahootUrl} onChange={setKahootUrl} />
              <UrlWithUpload label="课后作业 Homework URL" value={homeworkUrl} onChange={setHomeworkUrl} />
              <UrlWithUpload label="核心词汇练习 Vocab Practice URL" value={vocabPracticeUrl} onChange={setVocabPracticeUrl} />
            </div>
            <ResourceBankEditor
              label="共享资料库 Shared Resource Bank"
              resources={sharedResources}
              onChange={setSharedResources}
              emptyText="No extra shared resources yet. Use this area for slides, videos, textbook pages, assessments, answer keys, simulations, past papers, and printable materials."
              description="These entries are reused by objective prep packs and displayed in the sub-unit resource sidebar."
            />
          </section>

          {/* Homework Content */}
          <div className="border-t border-slate-100 pt-8">
            <RichTextEditor
              label="课后作业说明 Homework Content"
              value={homeworkContent}
              onChange={setHomeworkContent}
              placeholder="Describe homework assignments..."
            />
          </div>

          {/* Teaching Reflection */}
          <section className="space-y-4 border-t border-slate-100 pt-8">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={16} className="text-rose-500" />
              教学总结及反思 Teaching Reflection
            </label>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">上课时间 Lesson Date</label>
                <input
                  type="date"
                  value={reflection.lesson_date || ''}
                  onChange={e => updateReflection('lesson_date', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">学生接受状态 Student Reception</label>
                <textarea
                  value={reflection.student_reception || ''}
                  onChange={e => updateReflection('student_reception', e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm h-20 resize-none"
                  placeholder="How well did students receive the content?"
                />
              </div>
              <RichTextEditor
                label="计划讲解 Planned Content"
                value={reflection.planned_content || ''}
                onChange={val => updateReflection('planned_content', val)}
                placeholder="What was planned to be taught..."
              />
              <RichTextEditor
                label="实际讲解 Actual Content"
                value={reflection.actual_content || ''}
                onChange={val => updateReflection('actual_content', val)}
                placeholder="What was actually taught..."
              />
              <RichTextEditor
                label="下次改进方向 Improvements"
                value={reflection.improvements || ''}
                onChange={val => updateReflection('improvements', val)}
                placeholder="Areas for improvement next time..."
              />
            </div>
          </section>

          {/* AI Summary */}
          <div className="border-t border-slate-100 pt-8">
            <RichTextEditor
              label="AI总结 AI Summary"
              value={aiSummary}
              onChange={setAiSummary}
              placeholder="AI-generated summary or notes..."
            />
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
            Save Sub-Unit
          </button>
        </div>
      </div>
    </div>
  );
};
