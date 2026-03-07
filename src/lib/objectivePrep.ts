import { LearningObjective, PrepResource, SubUnit, TeachingUnit, VocabularyItem } from '../types';
import { dedupePrepResources, isPrepResourceFilled } from './prepResourceCatalog';

function asTrimmedString(value: unknown) {
  if (typeof value === 'string') return value.trim();
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function buildLegacyLinkedResources(source: {
  worksheet_url?: string;
  online_practice_url?: string;
  kahoot_url?: string;
  homework_url?: string;
  vocab_practice_url?: string;
}): PrepResource[] {
  return dedupePrepResources([
    {
      title: 'Worksheet',
      url: source.worksheet_url || '',
      kind: 'worksheet',
      note: 'Use as the shared fluency or consolidation worksheet after teacher modelling.',
    },
    {
      title: 'Online Practice',
      url: source.online_practice_url || '',
      kind: 'practice',
      note: 'Use for paced independent practice once the worked example is secure.',
    },
    {
      title: 'Kahoot',
      url: source.kahoot_url || '',
      kind: 'kahoot',
      note: 'Use as a retrieval or hinge-check activity at the start or end of the lesson.',
    },
    {
      title: 'Homework',
      url: source.homework_url || '',
      kind: 'homework',
      note: 'Set as independent follow-up practice after the objective has been introduced.',
    },
    {
      title: 'Vocabulary Practice',
      url: source.vocab_practice_url || '',
      kind: 'vocab',
      note: 'Use to rehearse the bilingual vocabulary before or after the main explanation.',
    },
  ]);
}

function buildDerivedSubUnitResources(subUnit: SubUnit): PrepResource[] {
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

  return dedupePrepResources(noteResources);
}

export function getSharedPrepResources(subUnit: SubUnit): PrepResource[] {
  return dedupePrepResources([
    ...(subUnit.shared_resources || []).filter(isPrepResourceFilled),
    ...buildLegacyLinkedResources(subUnit),
    ...buildDerivedSubUnitResources(subUnit),
  ]);
}

export function getTeachingUnitResources(unit: TeachingUnit): PrepResource[] {
  return dedupePrepResources([
    ...(unit.shared_resources || []).filter(isPrepResourceFilled),
    ...buildLegacyLinkedResources(unit),
  ]);
}

export function getObjectiveVocabulary(objective: LearningObjective, subUnit: SubUnit): VocabularyItem[] {
  return (objective.core_vocabulary && objective.core_vocabulary.length > 0)
    ? objective.core_vocabulary
    : subUnit.vocabulary;
}

export function getObjectiveResources(objective: LearningObjective, subUnit: SubUnit): PrepResource[] {
  return (objective.prep_resources && objective.prep_resources.length > 0)
    ? dedupePrepResources(objective.prep_resources.filter(isPrepResourceFilled))
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
