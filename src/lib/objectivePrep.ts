import { LearningObjective, PrepResource, SubUnit, VocabularyItem } from '../types';

function hasPrepResourceContent(resource: PrepResource) {
  return !!(resource.title.trim() || resource.url.trim() || (resource.note || '').trim());
}

function asTrimmedString(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function getSharedPrepResources(subUnit: SubUnit): PrepResource[] {
  const linkedResources: PrepResource[] = [
    {
      title: 'Worksheet',
      url: subUnit.worksheet_url || '',
      kind: 'worksheet' as const,
      note: 'Use as the shared fluency or consolidation worksheet after teacher modelling.',
    },
    {
      title: 'Online Practice',
      url: subUnit.online_practice_url || '',
      kind: 'practice' as const,
      note: 'Use for paced independent practice once the worked example is secure.',
    },
    {
      title: 'Kahoot',
      url: subUnit.kahoot_url || '',
      kind: 'kahoot' as const,
      note: 'Use as a retrieval or hinge-check activity at the start or end of the lesson.',
    },
    {
      title: 'Homework',
      url: subUnit.homework_url || '',
      kind: 'homework' as const,
      note: 'Set as independent follow-up practice after the objective has been introduced.',
    },
    {
      title: 'Vocabulary Practice',
      url: subUnit.vocab_practice_url || '',
      kind: 'vocab' as const,
      note: 'Use to rehearse the bilingual vocabulary before or after the main explanation.',
    },
  ].filter(resource => resource.url.trim());

  const noteResources: PrepResource[] = [];
  const vocabularyTerms = (subUnit.vocabulary || [])
    .map(item => item.english.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (asTrimmedString(subUnit.classroom_exercises)) {
    noteResources.push({
      title: 'Guided Practice Bank',
      url: '',
      kind: 'other',
      note: 'Reuse the sub-unit classroom exercises as the shared guided-practice bank for this objective.',
    });
  }

  if (asTrimmedString(subUnit.homework_content) && !subUnit.homework_url?.trim()) {
    noteResources.push({
      title: 'Homework Follow-up',
      url: '',
      kind: 'homework',
      note: 'Use the existing sub-unit homework content for independent practice or next-lesson retrieval.',
    });
  }

  if (vocabularyTerms.length > 0 && !subUnit.vocab_practice_url?.trim()) {
    noteResources.push({
      title: 'Vocabulary Retrieval',
      url: '',
      kind: 'vocab',
      note: `Revisit ${vocabularyTerms.join(', ')} before direct instruction and again during plenary review.`,
    });
  }

  if (asTrimmedString(subUnit.ai_summary)) {
    noteResources.push({
      title: 'Teacher Explanation Notes',
      url: '',
      kind: 'other',
      note: 'Use the sub-unit AI summary as a concise explanation scaffold and misconception check.',
    });
  }

  return [...linkedResources, ...noteResources].filter(hasPrepResourceContent);
}

export function getObjectiveVocabulary(objective: LearningObjective, subUnit: SubUnit): VocabularyItem[] {
  return (objective.core_vocabulary && objective.core_vocabulary.length > 0)
    ? objective.core_vocabulary
    : subUnit.vocabulary;
}

export function getObjectiveResources(objective: LearningObjective, subUnit: SubUnit): PrepResource[] {
  return (objective.prep_resources && objective.prep_resources.length > 0)
    ? objective.prep_resources.filter(hasPrepResourceContent)
    : getSharedPrepResources(subUnit);
}

export function getObjectiveConcept(objective: LearningObjective, subUnit: SubUnit): string {
  return asTrimmedString(objective.concept_explanation) || asTrimmedString(subUnit.ai_summary) || '';
}

export function getObjectivePrepMetrics(objective: LearningObjective, subUnit: SubUnit) {
  const vocabulary = getObjectiveVocabulary(objective, subUnit);
  const resources = getObjectiveResources(objective, subUnit);
  const concept = getObjectiveConcept(objective, subUnit);
  const examples = objective.typical_examples || [];
  const hasSharedExercises = !!asTrimmedString(subUnit.classroom_exercises);
  const usesSharedVocabulary = (!objective.core_vocabulary || objective.core_vocabulary.length === 0) && vocabulary.length > 0;
  const usesSharedResources = (!objective.prep_resources || objective.prep_resources.length === 0) && resources.length > 0;
  const usesSharedConcept = !asTrimmedString(objective.concept_explanation) && !!asTrimmedString(subUnit.ai_summary);
  const examplesReady = examples.length > 0 || hasSharedExercises;
  const readySections =
    (vocabulary.length > 0 ? 1 : 0) +
    (concept ? 1 : 0) +
    (examplesReady ? 1 : 0) +
    (resources.length > 0 ? 1 : 0);

  return {
    vocabulary,
    resources,
    concept,
    examples,
    hasSharedExercises,
    usesSharedVocabulary,
    usesSharedResources,
    usesSharedConcept,
    examplesReady,
    readySections,
    totalSections: 4,
  };
}
