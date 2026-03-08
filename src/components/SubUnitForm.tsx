import React, { useState, useEffect } from 'react';
import { randomAlphaId } from '../lib/id';
import { X, Save, Plus, Target } from 'lucide-react';
import { SubUnit, VocabularyItem, TeachingReflection, LearningObjective, PrepResource, TypicalExample } from '../types';
import { RichTextEditor } from './RichTextEditor';
import { geminiService } from '../services/geminiService';
import { dedupePrepResources, emptyPrepResource, isPrepResourceFilled } from '../lib/prepResourceCatalog';
import { LearningObjectiveCard } from './sub-unit-form/LearningObjectiveCard';
import { VocabularyListEditor } from './sub-unit-form/VocabularyListEditor';
import { ResourceLinksSection } from './sub-unit-form/ResourceLinksSection';
import { TeachingReflectionSection } from './sub-unit-form/TeachingReflectionSection';

interface SubUnitFormProps {
  subUnit?: SubUnit | null;
  unitTitle?: string;
  yearGroup?: string;
  aiPromptTemplate?: string;
  onSave: (subUnit: SubUnit) => void;
  onCancel: () => void;
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

export const SubUnitForm = ({ subUnit, unitTitle, yearGroup, aiPromptTemplate, onSave, onCancel }: SubUnitFormProps) => {
  const emptyLO = (): LearningObjective => ({
    id: randomAlphaId(),
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
  const [generatingConceptIds, setGeneratingConceptIds] = useState<Record<string, boolean>>({});
  const [generatingExampleIds, setGeneratingExampleIds] = useState<Record<string, boolean>>({});
  const [conceptErrors, setConceptErrors] = useState<Record<string, string>>({});
  const [exampleErrors, setExampleErrors] = useState<Record<string, string>>({});

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
    setGeneratingConceptIds({});
    setGeneratingExampleIds({});
    setConceptErrors({});
    setExampleErrors({});
  }, [subUnit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: subUnit?.id || randomAlphaId(),
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

  const updateLOById = (loId: string, updater: (current: LearningObjective) => LearningObjective) => {
    setLearningObjectives(prev => prev.map(lo => (lo.id === loId ? updater(lo) : lo)));
  };

  const setConceptGenerating = (loId: string, isGenerating: boolean) => {
    setGeneratingConceptIds(prev => {
      const next = { ...prev };
      if (isGenerating) next[loId] = true;
      else delete next[loId];
      return next;
    });
  };

  const setExampleGenerating = (loId: string, isGenerating: boolean) => {
    setGeneratingExampleIds(prev => {
      const next = { ...prev };
      if (isGenerating) next[loId] = true;
      else delete next[loId];
      return next;
    });
  };

  const setConceptError = (loId: string, message?: string) => {
    setConceptErrors(prev => {
      const next = { ...prev };
      if (message) next[loId] = message;
      else delete next[loId];
      return next;
    });
  };

  const setExampleError = (loId: string, message?: string) => {
    setExampleErrors(prev => {
      const next = { ...prev };
      if (message) next[loId] = message;
      else delete next[loId];
      return next;
    });
  };

  const buildObjectiveContext = (lo: LearningObjective) => ({
    unitTitle,
    yearGroup,
    aiPromptTemplate,
    subUnitTitle: title.trim() || subUnit?.title || 'Untitled Sub-Unit',
    objective: lo.objective.trim(),
    sharedVocabulary: vocabulary.filter(v => v.english.trim() || v.chinese.trim()),
    objectiveVocabulary: (lo.core_vocabulary || []).filter(v => v.english.trim() || v.chinese.trim()),
    classroomExercises: classroomExercises.trim(),
    homeworkContent: homeworkContent.trim(),
    aiSummary: aiSummary.trim(),
    conceptExplanation: lo.concept_explanation || '',
  });

  const handleGenerateConcept = async (lo: LearningObjective) => {
    if (!lo.objective.trim()) {
      setConceptError(lo.id, 'Add the learning objective before generating the explanation.');
      return;
    }

    setConceptGenerating(lo.id, true);
    setConceptError(lo.id);

    try {
      const generated = await geminiService.generateObjectiveConceptExplanation(buildObjectiveContext(lo));
      updateLOById(lo.id, current => ({ ...current, concept_explanation: generated }));
    } catch (err) {
      setConceptError(lo.id, err instanceof Error ? err.message : 'Failed to generate concept explanation.');
    } finally {
      setConceptGenerating(lo.id, false);
    }
  };

  const handleGenerateExamples = async (lo: LearningObjective) => {
    if (!lo.objective.trim()) {
      setExampleError(lo.id, 'Add the learning objective before generating examples.');
      return;
    }

    setExampleGenerating(lo.id, true);
    setExampleError(lo.id);

    try {
      const generated = await geminiService.generateObjectiveTypicalExamples(buildObjectiveContext(lo));
      const usableExamples = generated
        .filter(example => ((example?.question || '').trim() || (example?.solution || '').trim()))
        .map(example => ({
          question: (example.question || '').trim(),
          solution: (example.solution || '').trim(),
        }));

      if (usableExamples.length === 0) {
        throw new Error('AI returned no usable examples.');
      }

      updateLOById(lo.id, current => ({ ...current, typical_examples: usableExamples }));
    } catch (err) {
      setExampleError(lo.id, err instanceof Error ? err.message : 'Failed to generate typical examples.');
    } finally {
      setExampleGenerating(lo.id, false);
    }
  };

  const sharedVocabCount = vocabulary.filter(v => v.english.trim() || v.chinese.trim()).length;
  const sharedPrepResourceCount = buildSharedPrepResourcesDraft().length;

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
                <LearningObjectiveCard
                  key={lo.id}
                  lo={lo}
                  index={i}
                  generatingConcept={!!generatingConceptIds[lo.id]}
                  generatingExamples={!!generatingExampleIds[lo.id]}
                  conceptError={conceptErrors[lo.id]}
                  exampleError={exampleErrors[lo.id]}
                  sharedVocabCount={sharedVocabCount}
                  sharedPrepResourceCount={sharedPrepResourceCount}
                  hasAiSummary={!!aiSummary.trim()}
                  onUpdateField={updateLO}
                  onRemove={removeLO}
                  onAddVocabulary={addLOVocabulary}
                  onUpdateVocabulary={updateLOVocabulary}
                  onRemoveVocabulary={removeLOVocabulary}
                  onAddExample={addLOExample}
                  onUpdateExample={updateLOExample}
                  onRemoveExample={removeLOExample}
                  onAddResource={addLOResource}
                  onUpdateResource={updateLOResource}
                  onRemoveResource={removeLOResource}
                  onSeedVocabulary={seedLOVocabulary}
                  onSeedConcept={seedLOConcept}
                  onSeedResources={seedLOResources}
                  onGenerateConcept={handleGenerateConcept}
                  onGenerateExamples={handleGenerateExamples}
                />
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

          <VocabularyListEditor
            vocabulary={vocabulary}
            onAdd={addVocab}
            onUpdate={updateVocab}
            onRemove={removeVocab}
          />

          {/* Classroom Exercises */}
          <div className="border-t border-slate-100 pt-8">
            <RichTextEditor
              label="课堂讲练 Classroom Exercises"
              value={classroomExercises}
              onChange={setClassroomExercises}
              placeholder="Enter classroom exercises and worked examples..."
            />
          </div>

          <ResourceLinksSection
            worksheetUrl={worksheetUrl}
            onlinePracticeUrl={onlinePracticeUrl}
            kahootUrl={kahootUrl}
            homeworkUrl={homeworkUrl}
            vocabPracticeUrl={vocabPracticeUrl}
            sharedResources={sharedResources}
            onWorksheetUrlChange={setWorksheetUrl}
            onOnlinePracticeUrlChange={setOnlinePracticeUrl}
            onKahootUrlChange={setKahootUrl}
            onHomeworkUrlChange={setHomeworkUrl}
            onVocabPracticeUrlChange={setVocabPracticeUrl}
            onSharedResourcesChange={setSharedResources}
          />

          {/* Homework Content */}
          <div className="border-t border-slate-100 pt-8">
            <RichTextEditor
              label="课后作业说明 Homework Content"
              value={homeworkContent}
              onChange={setHomeworkContent}
              placeholder="Describe homework assignments..."
            />
          </div>

          <TeachingReflectionSection
            reflection={reflection}
            onUpdate={updateReflection}
          />

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
